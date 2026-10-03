#!/usr/bin/env node
/**
 * probe.js — drive docs-lsp by hand, without an editor.
 *
 * A language server is just a process on the other end of a pipe. This is the
 * client half: it launches the server, sends a scripted conversation, and
 * prints everything that comes back. Run it to see the protocol.
 *
 *   node probe.js
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "fixture");
const server = spawn("node", [path.join(__dirname, "server.js")]);

function send(message) {
  const body = JSON.stringify({ jsonrpc: "2.0", ...message });
  server.stdin.write(`Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`);
}

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
    print(JSON.parse(buffer.subarray(start, start + length).toString("utf8")));
    buffer = buffer.subarray(start + length);
  }
});
server.stderr.on("data", (data) => process.stderr.write(data));

function print(message) {
  if (message.method === "textDocument/publishDiagnostics") {
    const { uri, diagnostics } = message.params;
    console.log(`\n  diagnostics for ${path.basename(uri)} (${diagnostics.length})`);
    const severities = { 1: "error", 2: "warning", 3: "info", 4: "hint" };
    for (const d of diagnostics) {
      console.log(`    line ${d.range.start.line + 1} [${severities[d.severity]}] ${d.message}`);
    }
    return;
  }
  if (message.id !== undefined) {
    console.log(`\n  reply #${message.id}: ${JSON.stringify(message.result)}`);
  }
}

const uri = (file) => "file://" + path.join(root, file);
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

console.log("→ initialize + didOpen guide.md");
send({ id: 1, method: "initialize", params: { workspaceFolders: [{ uri: "file://" + root }] } });
send({
  method: "textDocument/didOpen",
  params: { textDocument: { uri: uri("guide.md"), text: read("guide.md") } },
});

setTimeout(() => {
  console.log("\n→ definition: cursor on ./api.md#authentication");
  send({
    id: 2,
    method: "textDocument/definition",
    params: { textDocument: { uri: uri("guide.md") }, position: { line: 2, character: 35 } },
  });

  console.log("→ references: backlinks to '## Install'");
  send({
    id: 3,
    method: "textDocument/references",
    params: { textDocument: { uri: uri("guide.md") }, position: { line: 9, character: 4 } },
  });

  console.log("→ workspace/symbol: search all headings for 'auth'");
  send({ id: 4, method: "workspace/symbol", params: { query: "auth" } });

  console.log("→ hover: preview the link target");
  send({
    id: 5,
    method: "textDocument/hover",
    params: { textDocument: { uri: uri("guide.md") }, position: { line: 2, character: 35 } },
  });

  setTimeout(() => {
    send({ id: 6, method: "shutdown", params: {} });
    send({ method: "exit" });
  }, 300);
}, 300);
