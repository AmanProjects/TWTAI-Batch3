# `docs-lsp` — a language server for a documentation set

A dependency-free Language Server in ~450 lines of Node that treats a Markdown
docs repo the way a compiler treats source code.

**The premise:** in code, a function is a *definition* and every call site is a
*reference*. In a docs set, a **heading is a definition** and every **link is a
reference**. That's a real symbol graph — so every classic LSP capability has a
meaningful answer.

This is the worked example for **Module 7 → Code Intelligence: LSP Servers**.

---

## What it implements

| LSP request | What it does here |
|---|---|
| `textDocument/definition` | Cursor on `[text](./api.md#authentication)` → jump to that heading, in that file, at that line |
| `textDocument/references` | Cursor on a heading → every link across the docs set that points at it (**backlinks**) |
| `textDocument/documentSymbol` | The heading outline of one file, nested by level |
| `workspace/symbol` | Search every heading in the entire docs set by name |
| `textDocument/completion` | After `](` completes file paths; after `#` completes that file's anchors |
| `textDocument/hover` | On a link: the target heading plus a two-line preview. On a heading: its anchor slug and backlink count |
| `textDocument/publishDiagnostics` | Broken links, dead anchors (with a "did you mean?"), and duplicate headings whose anchor got silently renumbered |

Every one of those is derived from the same index. Build the graph once, and the
capabilities are just different queries against it. **That is the actual lesson
of LSP.**

---

## Try it in 3 minutes

A fixture docs set lives in `fixture/` with deliberate defects: a dead anchor, a
link to a missing file, a duplicate heading, and a fake link inside a fenced
code block that the server must *not* flag.

`probe.js` is the client half — it launches the server, sends a scripted
conversation, and prints what comes back. No editor required:

```bash
cd modules/07-capstone/docs-lsp
node probe.js
```

Expected output:

```
  diagnostics for guide.md (3)
    line 4  [warning] Dead anchor — no heading "#error-kodes" in api.md.
    line 4  [error]   Broken link — no such file: missing.md
    line 18 [error]   Broken link — no such file: still-missing.md

  reply #2: {"uri":".../api.md","range":{"start":{"line":4,...}}}   ← definition
  reply #3: [{"uri":".../api.md",...}]                              ← 1 backlink
  reply #4: [ Authentication, Authentication ]                      ← workspace symbols
  reply #5: "**api.md** · line 5 ### Authentication ..."            ← hover preview
```

**Exactly three** diagnostics is the passing condition. The fixture contains
three decoys that must *not* be reported:

| Decoy | Where | Guards against |
|---|---|---|
| A link inside a fenced code block | `guide.md` line 7 | not tracking ``` fences |
| A link inside a single-backtick span | `guide.md` line 16 | not masking inline code spans |
| A single-backtick span nested in a double-backtick span | `guide.md` line 17 | masking with a naive regex instead of matching backtick **run length** |

Any extra diagnostic means one of those three guards is broken. Open
`fixture/guide.md` to see the raw syntax — it's deliberately not reproduced
here, because quoting nested backticks inside a table cell is exactly the kind
of malformed markdown this server exists to catch.

---

## Batch mode: the same server as a CI check

A language server is usually driven by an editor, but nothing requires that.
`scan.js` opens every Markdown file in a workspace, collects the diagnostics,
and exits non-zero if any are errors:

```bash
node scan.js                    # scans the repo root
node scan.js ../../../docs      # or any folder you point it at
```

```
Scanning 44 markdown files under /Users/you/TWTAI

SETUP_GUIDE.md
  SETUP_GUIDE.md:83  [info]  Duplicate heading — its anchor is "#macos-1", not "#macos".

────────────────────────────────────────────────────────────
0 error(s)  ·  0 warning(s)  ·  2 info
```

This is worth internalizing: **the index doesn't care who's asking.** The same
graph that answers go-to-definition in your editor answers "is this docs set
internally consistent?" in a pre-commit hook. One implementation, two surfaces.

---

## Wire it into Claude Code

`.lsp.json` is the plugin config:

```json
{
  "docs": {
    "command": "node",
    "args": ["${CLAUDE_PLUGIN_ROOT}/server.js"],
    "extensionToLanguage": { ".md": "markdown" }
  }
}
```

To load it, this folder needs to be a plugin (a `plugin.json` beside the
`.lsp.json`), installed from a marketplace or via `--plugin-dir`. Then
`/reload-plugins` and check for `1 plugin LSP server`.

Now, when Claude edits a doc and breaks a cross-reference, **the broken link
lands in Claude's context automatically** — no lint step, no CI round-trip. And
when you ask "where is the retry policy documented?", Claude can hit
`workspace/symbol` instead of grepping the tree.

> ⚠️ **`.md` is a heavily contested extension.** If another enabled server also
> claims `.md`, the first registered wins and this one never starts. `/plugin`
> shows a warning naming the active one. If that bites you, either disable the
> other server or narrow this one to a custom extension.

---

## How it works

Three phases, and they're the shape of nearly every language server:

**1. Index.** On `initialize`, walk the workspace root for `.md` files and parse
each into `{ headings[], links[] }`. Headings get a GitHub-style anchor slug;
links get resolved to an absolute path plus an optional anchor.

**2. Maintain.** On `didOpen`/`didChange`, re-parse just that file and republish
its diagnostics. `textDocumentSync: 1` means full-document sync — the client
resends the whole file on every keystroke, which is dramatically simpler than
incremental sync and fine at documentation scale.

**3. Query.** Every capability is a lookup against the index. `definition` finds
the link under the cursor and returns its target's line. `references` scans all
links for ones pointing at the heading under the cursor. Same data, seven views.

### Details that actually matter

- **Fenced code blocks are skipped.** A docs repo is full of code samples
  containing fake links and `#` characters. Not tracking ``` fences is the
  difference between a useful server and one that cries wolf constantly.
- **Inline code spans are skipped too.** This one bit me: documentation quotes
  link syntax as an example constantly, and a link inside single backticks is
  *prose about a link*, not a link. `maskInlineCode()` blanks those spans with
  spaces of equal length, so character offsets stay valid and reported ranges
  still line up with the real file. I only found this by running `scan.js`
  against a real repo — the fixture never caught it.
- **Duplicate headings are a real bug.** Two `## Authentication` sections mean
  the second one's anchor is silently `#authentication-1`. Every link written to
  `#authentication` lands on the first. That's an Information diagnostic here.
- **A request must always get a reply.** Even when a handler throws. The
  dispatcher catches and returns a JSON-RPC error, because an unanswered request
  hangs the client forever. Notifications must *not* be answered.
- **Slugification is approximate.** `slugify()` mirrors GitHub's rules well
  enough for ASCII headings, but emoji and leading punctuation differ. If your
  docs are published somewhere with different anchor rules, that function is the
  one place to change.

---

## Exercises

Ordered by value, not difficulty.

1. **Orphan detection.** Add a `workspace/executeCommand` or a startup
   diagnostic listing every document with zero inbound links. In a large docs
   set, orphans are pages nobody can reach by navigation.
2. **Glossary terms as symbols.** Treat a `glossary.md` definition list as
   definitions, and every occurrence of a term elsewhere as a reference. Now
   go-to-definition works on domain vocabulary — the single highest-value
   feature for a docs set with a house terminology.
3. **A rename code action.** Implement `textDocument/rename` on a heading:
   change the heading text *and* rewrite every inbound link's anchor in one
   `WorkspaceEdit`. This is the capability that makes an LSP feel like magic,
   and it's only possible because you already have the reference graph.
4. **Style-guide diagnostics.** Flag passive voice, banned terms, or headings
   that don't match your capitalization rule. Compare your result against
   [Vale](https://vale.sh/) — then consider just using Vale's real language
   server, `vale-ls`.
5. **Frontmatter validation.** Parse YAML frontmatter and validate required
   fields (`title`, `owner`, `last_reviewed`) against a schema. Diagnose a
   `last_reviewed` older than 12 months.
6. **Incremental sync.** Switch `textDocumentSync` to `2` and apply ranged
   edits instead of reparsing the file. Only worth it above ~10k-line documents,
   but it's the exercise that teaches you what the sync modes are for.

---

## Prior art — this is a real category

Don't take my word that documentation LSPs are legitimate. These are production
servers doing exactly this:

| Server | What it does |
|---|---|
| [`marksman`](https://github.com/artempyanykh/marksman) | Markdown LSP — link completion, go-to-definition, backlinks, diagnostics, rename |
| [`markdown-oxide`](https://oxide.md/) | PKM-oriented Markdown LSP with wikilink and daily-note support |
| [`vale-ls`](https://vale.sh/docs/integrations/guide/) | Vale prose linter exposed over LSP |
| [`ltex-ls`](https://valentjn.github.io/ltex/) | LanguageTool grammar checking over LSP for Markdown, LaTeX, AsciiDoc |
| [`harper-ls`](https://writewithharper.com/) | Fast offline grammar checker as a language server |
| [`yaml-language-server`](https://github.com/redhat-developer/yaml-language-server) | Schema-driven YAML validation — this is what gives you OpenAPI autocomplete |

If your docs pipeline already runs Vale, `vale-ls` gives Claude Code your style
guide as live diagnostics with no code from you at all.

---

## Files

| File | Purpose |
|---|---|
| `server.js` | The whole server — transport, index, and all seven capabilities |
| `probe.js` | A minimal LSP *client* — drives the server so you can see the protocol |
| `scan.js` | Batch mode — lints a whole workspace, exits 1 on errors, CI-ready |
| `.lsp.json` | Plugin config telling Claude Code how to launch it |
| `fixture/` | A tiny docs set with deliberate defects, for testing |
| `README.md` | This file |
