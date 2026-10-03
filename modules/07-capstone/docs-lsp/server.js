#!/usr/bin/env node
/**
 * docs-lsp — a Language Server for a Markdown documentation set.
 *
 * Treats a docs repo the way a compiler treats source code: headings are
 * DEFINITIONS, links are REFERENCES, and the two form a symbol graph. Every
 * capability below falls out of that graph.
 *
 *   textDocument/definition      jump from a link to the heading it points at
 *   textDocument/references      backlinks: everything that links to a heading
 *   textDocument/documentSymbol  the heading outline of one file
 *   workspace/symbol             search every heading in the docs set
 *   textDocument/completion      complete link targets and #anchors
 *   textDocument/hover           preview the target of a link
 *   textDocument/publishDiagnostics   broken links, dead anchors, ambiguous slugs
 *
 * Zero dependencies. LSP over stdio is JSON-RPC 2.0 framed with Content-Length
 * headers, so the entire protocol fits in this file.
 */

const fs = require("fs");
const path = require("path");

const MARKDOWN_EXTENSIONS = new Set([".md", ".markdown"]);
const IGNORED_DIRECTORIES = new Set([
  "node_modules", ".git", "dist", "build", ".next", "vendor", "__pycache__",
]);

// ---------------------------------------------------------------------------
// URI <-> filesystem path
// ---------------------------------------------------------------------------

function uriToPath(uri) {
  return decodeURIComponent(uri.replace(/^file:\/\//, ""));
}

/**
 * A path to show a human, relative to the workspace when that makes sense.
 *
 * `path.relative()` alone is wrong for files outside the workspace root: it
 * happily produces things like `../../../../../tmp/notes/api.md`, which is
 * accurate and useless. When the target escapes the workspace, show the
 * absolute path instead.
 */
function displayPath(absolutePath) {
  const relative = path.relative(workspaceRoot, absolutePath);
  if (relative === "") return path.basename(absolutePath);
  return relative.startsWith("..") || path.isAbsolute(relative)
    ? absolutePath
    : relative;
}

function pathToUri(filePath) {
  return "file://" + filePath.split("/").map(encodeURIComponent).join("/");
}

// ---------------------------------------------------------------------------
// Parsing: headings are definitions, links are references
// ---------------------------------------------------------------------------

/**
 * GitHub-style anchor slug. Approximates GitHub's algorithm: strip inline
 * markdown, drop punctuation, lowercase, spaces to hyphens.
 */
function slugify(headingText) {
  return headingText
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // [text](url) -> text
    .replace(/[`*~]/g, "") // strip emphasis and code marks
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // drop punctuation and emoji
    .trim()
    .replace(/\s+/g, "-");
}

const HEADING_RE = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const LINK_RE = /(!?)\[([^\]]*)\]\(\s*([^)\s]+?)(?:\s+"[^"]*")?\s*\)/g;
const EXTERNAL_RE = /^[a-z][a-z0-9+.-]*:/i;

/**
 * Blank out inline code spans before scanning a line for links.
 *
 * Documentation quotes link syntax as an example all the time — a link inside
 * backticks is prose *about* a link, not a link. Replacing the span with spaces
 * of equal length keeps every character offset valid, so the ranges we report
 * still line up with the real file.
 *
 * This is a scanner rather than a regex because CommonMark closes a code span
 * with a backtick run of *exactly* the opening length. That's what lets a
 * double-backtick span quote a single-backtick one:
 *
 *     `` `[text](./api.md)` ``
 *
 * A naive /`+[^`]*`+/ masks the delimiters and leaves the link exposed in the
 * middle — which is precisely how this server once reported a false positive
 * against its own README.
 */
function maskInlineCode(line) {
  let output = "";
  let index = 0;

  while (index < line.length) {
    if (line[index] !== "`") {
      output += line[index++];
      continue;
    }

    const openStart = index;
    while (index < line.length && line[index] === "`") index++;
    const runLength = index - openStart;

    // Look for a closing run of exactly the same length.
    let closeStart = -1;
    let cursor = index;
    while (cursor < line.length) {
      if (line[cursor] !== "`") {
        cursor++;
        continue;
      }
      let runEnd = cursor;
      while (runEnd < line.length && line[runEnd] === "`") runEnd++;
      if (runEnd - cursor === runLength) {
        closeStart = cursor;
        break;
      }
      cursor = runEnd;
    }

    if (closeStart === -1) {
      output += line.slice(openStart, index); // unmatched run — leave it alone
    } else {
      const spanEnd = closeStart + runLength;
      output += " ".repeat(spanEnd - openStart);
      index = spanEnd;
    }
  }

  return output;
}

function parseDocument(text, absolutePath) {
  const lines = text.split(/\r?\n/);
  const headings = [];
  const links = [];
  const slugCounts = new Map();

  let insideFence = false;

  lines.forEach((line, lineNumber) => {
    // A fenced code block can contain anything that looks like a link or a
    // heading. Skipping fences is the difference between a useful server and
    // one that cries wolf on every code sample.
    if (/^\s*(```|~~~)/.test(line)) {
      insideFence = !insideFence;
      return;
    }
    if (insideFence) return;

    const headingMatch = HEADING_RE.exec(line);
    if (headingMatch) {
      const rawText = headingMatch[2];
      const baseSlug = slugify(rawText);
      const seen = slugCounts.get(baseSlug) || 0;
      slugCounts.set(baseSlug, seen + 1);

      headings.push({
        text: rawText,
        level: headingMatch[1].length,
        slug: seen === 0 ? baseSlug : `${baseSlug}-${seen}`,
        duplicate: seen > 0,
        line: lineNumber,
        character: line.indexOf(rawText),
      });
      return;
    }

    const scannable = maskInlineCode(line);
    LINK_RE.lastIndex = 0;
    let linkMatch;
    while ((linkMatch = LINK_RE.exec(scannable)) !== null) {
      const isImage = linkMatch[1] === "!";
      const target = linkMatch[3];
      const startCharacter = linkMatch.index + linkMatch[0].indexOf(target);

      links.push({
        isImage,
        target,
        line: lineNumber,
        startCharacter,
        endCharacter: startCharacter + target.length,
        ...resolveTarget(target, absolutePath),
      });
    }
  });

  return { lines, headings, links };
}

/** Split a link target into the file it points at and the anchor within it. */
function resolveTarget(target, fromPath) {
  if (EXTERNAL_RE.test(target)) {
    return { external: true, filePath: null, anchor: null };
  }

  const hashIndex = target.indexOf("#");
  const filePart = hashIndex === -1 ? target : target.slice(0, hashIndex);
  const anchor = hashIndex === -1 ? null : target.slice(hashIndex + 1);

  const filePath = filePart === ""
    ? fromPath // "#anchor" alone means this same file
    : path.resolve(path.dirname(fromPath), decodeURIComponent(filePart));

  return { external: false, filePath, anchor: anchor || null };
}

// ---------------------------------------------------------------------------
// Workspace index — the symbol graph
// ---------------------------------------------------------------------------

const index = new Map(); // absolutePath -> parsed document
let workspaceRoot = process.cwd();

function collectMarkdownFiles(directory, found = []) {
  let entries;
  try {
    entries = fs.readdirSync(directory, { withFileTypes: true });
  } catch {
    return found;
  }

  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".") continue;
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORED_DIRECTORIES.has(entry.name)) collectMarkdownFiles(fullPath, found);
    } else if (MARKDOWN_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      found.push(fullPath);
    }
  }
  return found;
}

function indexWorkspace() {
  index.clear();
  for (const filePath of collectMarkdownFiles(workspaceRoot)) {
    try {
      index.set(filePath, parseDocument(fs.readFileSync(filePath, "utf8"), filePath));
    } catch {
      /* unreadable file — skip it rather than crash the server */
    }
  }
  log(`indexed ${index.size} markdown files under ${workspaceRoot}`);
}

/** Read a document from the index, falling back to disk for unopened files. */
function getDocument(absolutePath) {
  if (index.has(absolutePath)) return index.get(absolutePath);
  try {
    const parsed = parseDocument(fs.readFileSync(absolutePath, "utf8"), absolutePath);
    index.set(absolutePath, parsed);
    return parsed;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// JSON-RPC transport
// ---------------------------------------------------------------------------

function send(message) {
  const body = JSON.stringify({ jsonrpc: "2.0", ...message });
  process.stdout.write(`Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`);
}

function log(message) {
  process.stderr.write(`docs-lsp: ${message}\n`);
}

let buffer = Buffer.alloc(0);

process.stdin.on("data", (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);

  while (true) {
    const headerEnd = buffer.indexOf("\r\n\r\n");
    if (headerEnd === -1) return;

    const contentLengthMatch = /Content-Length: (\d+)/i.exec(
      buffer.subarray(0, headerEnd).toString("ascii"),
    );
    if (!contentLengthMatch) return;

    const contentLength = Number(contentLengthMatch[1]);
    const bodyStart = headerEnd + 4;
    if (buffer.length < bodyStart + contentLength) return;

    const body = buffer.subarray(bodyStart, bodyStart + contentLength).toString("utf8");
    buffer = buffer.subarray(bodyStart + contentLength);

    let message;
    try {
      message = JSON.parse(body);
    } catch (error) {
      log(`malformed message: ${error.message}`);
      continue;
    }

    try {
      handle(message);
    } catch (error) {
      log(error.stack);
      // A request must always get a reply, even when the handler throws —
      // otherwise the client waits forever.
      if (message.id !== undefined) {
        send({ id: message.id, error: { code: -32603, message: error.message } });
      }
    }
  }
});

// ---------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------

function handle(message) {
  switch (message.method) {
    case "initialize":
      return onInitialize(message);
    case "initialized":
      return;

    case "textDocument/didOpen": {
      const { uri, text } = message.params.textDocument;
      updateDocument(uri, text);
      return;
    }
    case "textDocument/didChange": {
      const { uri } = message.params.textDocument;
      updateDocument(uri, message.params.contentChanges[0].text);
      return;
    }
    case "textDocument/didSave":
      // A save can fix links in *other* files, so revalidate everything.
      return revalidateOpenDocuments();
    case "textDocument/didClose":
      return;

    case "textDocument/definition":
      return send({ id: message.id, result: onDefinition(message.params) });
    case "textDocument/references":
      return send({ id: message.id, result: onReferences(message.params) });
    case "textDocument/documentSymbol":
      return send({ id: message.id, result: onDocumentSymbol(message.params) });
    case "workspace/symbol":
      return send({ id: message.id, result: onWorkspaceSymbol(message.params) });
    case "textDocument/completion":
      return send({ id: message.id, result: onCompletion(message.params) });
    case "textDocument/hover":
      return send({ id: message.id, result: onHover(message.params) });

    case "shutdown":
      return send({ id: message.id, result: null });
    case "exit":
      return process.exit(0);

    default:
      // Requests carry an id and must be answered. Notifications must not be.
      if (message.id !== undefined) {
        send({ id: message.id, error: { code: -32601, message: "Method not found" } });
      }
  }
}

function onInitialize(message) {
  const params = message.params || {};
  if (params.workspaceFolders && params.workspaceFolders.length > 0) {
    workspaceRoot = uriToPath(params.workspaceFolders[0].uri);
  } else if (params.rootUri) {
    workspaceRoot = uriToPath(params.rootUri);
  }

  indexWorkspace();

  send({
    id: message.id,
    result: {
      capabilities: {
        textDocumentSync: 1, // full document sync on every change
        definitionProvider: true,
        referencesProvider: true,
        documentSymbolProvider: true,
        workspaceSymbolProvider: true,
        hoverProvider: true,
        completionProvider: { triggerCharacters: ["(", "/", "#"] },
      },
      serverInfo: { name: "docs-lsp", version: "1.0.1" },
    },
  });
}

function updateDocument(uri, text) {
  const absolutePath = uriToPath(uri);
  index.set(absolutePath, parseDocument(text, absolutePath));
  publishDiagnostics(absolutePath);
}

function revalidateOpenDocuments() {
  for (const absolutePath of index.keys()) publishDiagnostics(absolutePath);
}

// ---------------------------------------------------------------------------
// Diagnostics — what the graph proves is broken
// ---------------------------------------------------------------------------

function publishDiagnostics(absolutePath) {
  const document = index.get(absolutePath);
  if (!document) return;

  const diagnostics = [];

  for (const heading of document.headings) {
    if (!heading.duplicate) continue;
    diagnostics.push({
      range: lineRange(heading.line, heading.character, heading.text.length),
      severity: 3, // Information
      source: "docs-lsp",
      message: `Duplicate heading — its anchor is "#${heading.slug}", not "#${slugify(heading.text)}".`,
    });
  }

  for (const link of document.links) {
    if (link.external) continue;

    const range = lineRange(link.line, link.startCharacter, link.target.length);

    if (!fs.existsSync(link.filePath)) {
      diagnostics.push({
        range,
        severity: 1, // Error
        source: "docs-lsp",
        message: `Broken link — no such file: ${displayPath(link.filePath)}`,
      });
      continue;
    }

    if (!link.anchor) continue;
    if (!MARKDOWN_EXTENSIONS.has(path.extname(link.filePath).toLowerCase())) continue;

    const target = getDocument(link.filePath);
    if (!target) continue;

    if (!target.headings.some((heading) => heading.slug === link.anchor)) {
      const suggestion = closestSlug(link.anchor, target.headings);
      diagnostics.push({
        range,
        severity: 2, // Warning
        source: "docs-lsp",
        message: `Dead anchor — no heading "#${link.anchor}" in ${path.basename(link.filePath)}.`
          + (suggestion ? ` Did you mean "#${suggestion}"?` : ""),
      });
    }
  }

  send({
    method: "textDocument/publishDiagnostics",
    params: { uri: pathToUri(absolutePath), diagnostics },
  });
}

/** Cheap nearest-match: the slug sharing the longest prefix with the target. */
function closestSlug(anchor, headings) {
  let best = null;
  let bestScore = 0;
  for (const heading of headings) {
    let score = 0;
    while (score < anchor.length && score < heading.slug.length
      && anchor[score] === heading.slug[score]) score++;
    if (score > bestScore) {
      bestScore = score;
      best = heading.slug;
    }
  }
  return bestScore >= 3 ? best : null;
}

function lineRange(line, character, length) {
  return {
    start: { line, character },
    end: { line, character: character + length },
  };
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

function linkAt(document, position) {
  return document.links.find(
    (link) => link.line === position.line
      && position.character >= link.startCharacter
      && position.character <= link.endCharacter,
  );
}

function headingAt(document, position) {
  return document.headings.find((heading) => heading.line === position.line);
}

/** Go to definition: a link resolves to the heading (or file) it names. */
function onDefinition({ textDocument, position }) {
  const document = index.get(uriToPath(textDocument.uri));
  if (!document) return null;

  const link = linkAt(document, position);
  if (!link || link.external || !fs.existsSync(link.filePath)) return null;

  let line = 0;
  if (link.anchor) {
    const target = getDocument(link.filePath);
    const heading = target && target.headings.find((h) => h.slug === link.anchor);
    if (heading) line = heading.line;
  }

  return {
    uri: pathToUri(link.filePath),
    range: { start: { line, character: 0 }, end: { line, character: 0 } },
  };
}

/** Find references: every link in the docs set pointing at this heading. */
function onReferences({ textDocument, position }) {
  const absolutePath = uriToPath(textDocument.uri);
  const document = index.get(absolutePath);
  if (!document) return [];

  const heading = headingAt(document, position);
  if (!heading) return [];

  const isFirstHeading = document.headings[0] === heading;
  const locations = [];

  for (const [sourcePath, sourceDocument] of index) {
    for (const link of sourceDocument.links) {
      if (link.external || link.filePath !== absolutePath) continue;

      // A bare file link implicitly points at the document's first heading.
      const matches = link.anchor
        ? link.anchor === heading.slug
        : isFirstHeading;
      if (!matches) continue;

      locations.push({
        uri: pathToUri(sourcePath),
        range: lineRange(link.line, link.startCharacter, link.target.length),
      });
    }
  }

  return locations;
}

/** Document symbols: the heading outline, nested by level. */
function onDocumentSymbol({ textDocument }) {
  const document = index.get(uriToPath(textDocument.uri));
  if (!document) return [];

  const roots = [];
  const stack = [];

  for (const heading of document.headings) {
    const symbol = {
      name: heading.text,
      detail: `#${heading.slug}`,
      kind: 15, // SymbolKind.String — LSP has no Heading kind
      range: lineRange(heading.line, 0, heading.text.length + heading.level + 1),
      selectionRange: lineRange(heading.line, heading.character, heading.text.length),
      children: [],
    };

    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) stack.pop();

    if (stack.length === 0) roots.push(symbol);
    else stack[stack.length - 1].symbol.children.push(symbol);

    stack.push({ level: heading.level, symbol });
  }

  return roots;
}

/** Workspace symbols: search every heading in the docs set by name. */
function onWorkspaceSymbol({ query }) {
  const needle = (query || "").toLowerCase();
  const results = [];

  for (const [absolutePath, document] of index) {
    for (const heading of document.headings) {
      if (needle && !heading.text.toLowerCase().includes(needle)) continue;
      results.push({
        name: heading.text,
        kind: 15,
        containerName: displayPath(absolutePath),
        location: {
          uri: pathToUri(absolutePath),
          range: lineRange(heading.line, heading.character, heading.text.length),
        },
      });
      if (results.length >= 200) return results;
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Completion — link targets and anchors
// ---------------------------------------------------------------------------

function onCompletion({ textDocument, position }) {
  const absolutePath = uriToPath(textDocument.uri);
  const document = index.get(absolutePath);
  if (!document) return [];

  const linePrefix = (document.lines[position.line] || "").slice(0, position.character);
  const openLink = /\]\(([^)]*)$/.exec(linePrefix);
  if (!openLink) return [];

  const partial = openLink[1];
  const hashIndex = partial.indexOf("#");

  // After a '#', complete the anchors of the file being linked to.
  if (hashIndex !== -1) {
    const filePart = partial.slice(0, hashIndex);
    const targetPath = filePart === ""
      ? absolutePath
      : path.resolve(path.dirname(absolutePath), filePart);

    const target = getDocument(targetPath);
    if (!target) return [];

    return target.headings.map((heading) => ({
      label: heading.slug,
      kind: 15, // CompletionItemKind.Snippet-ish; String reads fine in most clients
      detail: `${"#".repeat(heading.level)} ${heading.text}`,
      documentation: `Heading in ${path.basename(targetPath)}`,
    }));
  }

  // Otherwise complete file paths, relative to the current document.
  const fromDirectory = path.dirname(absolutePath);
  return [...index.keys()]
    .filter((candidate) => candidate !== absolutePath)
    .map((candidate) => {
      let relative = path.relative(fromDirectory, candidate);
      if (!relative.startsWith(".")) relative = "./" + relative;
      return {
        label: relative,
        kind: 17, // CompletionItemKind.File
        detail: index.get(candidate).headings[0]?.text || "",
      };
    });
}

// ---------------------------------------------------------------------------
// Hover — preview whatever the cursor is on
// ---------------------------------------------------------------------------

function onHover({ textDocument, position }) {
  const absolutePath = uriToPath(textDocument.uri);
  const document = index.get(absolutePath);
  if (!document) return null;

  const link = linkAt(document, position);
  if (link) return hoverForLink(link);

  const heading = headingAt(document, position);
  if (heading) return hoverForHeading(absolutePath, document, heading);

  return null;
}

function hoverForLink(link) {
  if (link.external) return markdown(`External link → ${link.target}`);
  if (!fs.existsSync(link.filePath)) return markdown(`⚠️ **Broken link** — file not found.`);

  const target = getDocument(link.filePath);
  const relative = displayPath(link.filePath);

  if (!link.anchor) {
    return markdown([
      `**${relative}**`,
      target?.headings[0] ? `\n${"#".repeat(target.headings[0].level)} ${target.headings[0].text}` : "",
    ].join("\n"));
  }

  const heading = target?.headings.find((h) => h.slug === link.anchor);
  if (!heading) return markdown(`⚠️ **Dead anchor** — no \`#${link.anchor}\` in ${relative}.`);

  const preview = [];
  for (const line of target.lines.slice(heading.line + 1, heading.line + 8)) {
    if (HEADING_RE.test(line)) break; // stop at the next heading
    if (line.trim() === "") continue;
    preview.push(line);
    if (preview.length === 2) break;
  }

  return markdown(
    `**${relative}** · line ${heading.line + 1}\n\n### ${heading.text}\n\n${preview.join("\n")}`,
  );
}

function hoverForHeading(absolutePath, document, heading) {
  const backlinks = onReferences({
    textDocument: { uri: pathToUri(absolutePath) },
    position: { line: heading.line, character: heading.character },
  });

  return markdown([
    `**Anchor:** \`#${heading.slug}\``,
    `**Backlinks:** ${backlinks.length}`,
    heading.duplicate ? `\n⚠️ Duplicate heading text — the anchor was disambiguated.` : "",
  ].join("\n"));
}

function markdown(value) {
  return { contents: { kind: "markdown", value } };
}
