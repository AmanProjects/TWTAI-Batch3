#!/usr/bin/env node
/**
 * scan.js — batch mode for docs-lsp.
 *
 * Same server, same index, no editor: opens every Markdown file in a workspace
 * and prints the diagnostics. This is what makes a language server CI-able —
 * the graph doesn't care whether a human or a build step is asking.
 *
 *   node scan.js [workspace-root]      # defaults to the repo root
 *
 * Exits 1 if any error-severity diagnostic is found, so it can gate a build.
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(process.argv[2] || path.join(__dirname, "..", "..", ".."));
const IGNORED = new Set(["node_modules", ".git", "dist", "build", ".next", "vendor"]);
const SEVERITY = { 1: "error", 2: "warning", 3: "info", 4: "hint" };

function collect(directory, found = []) {
  let entries;
  try {
    entries = fs.readdirSync(directory, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORED.has(entry.name)) collect(full, found);
    } else if (/\.(md|markdown)$/i.test(entry.name)) {
      found.push(full);
    }
  }
  return found;
}

const files = collect(root);
console.log(`Scanning ${files.length} markdown files under ${root}\n`);

const server = spawn("node", [path.join(__dirname, "server.js")]);
server.stderr.on("data", () => {}); // suppress the index log

function send(message) {
  const body = JSON.stringify({ jsonrpc: "2.0", ...message });
  server.stdin.write(`Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`);
}

const counts = { error: 0, warning: 0, info: 0, hint: 0 };
let pending = files.length;
let buffer = Buffer.alloc(0);

server.stdout.on("data", (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  for (;;) {
    const headerEnd = buffer.indexOf("\r\n\r\n");
    if (headerEnd === -1) return;
    const match = /Content-Length: (\d+)/i.exec(buffer.subarray(0, headerEnd).toString());
    if (!match) return;
    const start = headerEnd + 4;
    const length = Number(match[1]);
    if (buffer.length < start + length) return;
    onMessage(JSON.parse(buffer.subarray(start, start + length).toString("utf8")));
    buffer = buffer.subarray(start + length);
  }
});

function onMessage(message) {
  if (message.method !== "textDocument/publishDiagnostics") return;

  const { uri, diagnostics } = message.params;
  const relative = path.relative(root, decodeURIComponent(uri.replace(/^file:\/\//, "")));

  if (diagnostics.length > 0) {
    console.log(relative);
    for (const d of diagnostics) {
      const severity = SEVERITY[d.severity];
      counts[severity]++;
      console.log(`  ${relative}:${d.range.start.line + 1}  [${severity}]  ${d.message}`);
    }
    console.log("");
  }

  if (--pending === 0) finish();
}

function finish() {
  console.log("─".repeat(60));
  console.log(
    `${counts.error} error(s)  ·  ${counts.warning} warning(s)  ·  ${counts.info} info`,
  );
  send({ method: "exit" });
  process.exit(counts.error > 0 ? 1 : 0);
}

send({ id: 1, method: "initialize", params: { workspaceFolders: [{ uri: "file://" + root }] } });

for (const file of files) {
  send({
    method: "textDocument/didOpen",
    params: {
      textDocument: {
        uri: "file://" + file.split("/").map(encodeURIComponent).join("/"),
        text: fs.readFileSync(file, "utf8"),
      },
    },
  });
}
