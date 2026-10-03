#!/usr/bin/env node
/**
 * A minimal Markdown language server: publishes one diagnostic per sentence
 * longer than 25 words, so Claude sees style problems the instant it saves.
 *
 * LSP framing is Content-Length headers, not newline-delimited JSON — that is
 * the one structural difference from the MCP server next door.
 *
 * The full version of this idea is modules/07-capstone/docs-lsp/.
 */

const MAX_WORDS = 25;
const docs = new Map();

function send(msg) {
  const body = JSON.stringify(msg);
  process.stdout.write(`Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`);
}

function diagnose(uri, text) {
  const diagnostics = [];
  const lines = text.split('\n');

  // Sentences wrap across lines, so walk paragraphs, not lines, and report the
  // diagnostic on the paragraph's first line.
  let start = 0;
  let buf = [];

  const flush = (end) => {
    if (!buf.length) return;
    const paragraph = buf.join(' ');
    if (!/^\s{0,3}(#{1,6}\s|```)/.test(paragraph)) {
      for (const sentence of paragraph.split(/(?<=[.!?])\s+/)) {
        const n = sentence.split(/\s+/).filter(Boolean).length;
        if (n > MAX_WORDS) {
          diagnostics.push({
            range: {
              start: { line: start, character: 0 },
              end: { line: end, character: lines[end] ? lines[end].length : 0 },
            },
            severity: 2, // warning
            source: 'doc-toolkit',
            message: `Sentence is ${n} words (limit ${MAX_WORDS}). Split it.`,
          });
        }
      }
    }
    buf = [];
  };

  lines.forEach((line, i) => {
    if (line.trim() === '') {
      flush(i > 0 ? i - 1 : 0);
    } else {
      if (!buf.length) start = i;
      buf.push(line.trim());
    }
  });
  flush(lines.length - 1);

  send({ jsonrpc: '2.0', method: 'textDocument/publishDiagnostics', params: { uri, diagnostics } });
}

function handle(msg) {
  const { id, method, params } = msg;

  if (method === 'initialize') {
    return send({
      jsonrpc: '2.0',
      id,
      result: { capabilities: { textDocumentSync: 1 }, serverInfo: { name: 'markdown-docs' } },
    });
  }
  if (method === 'shutdown') return send({ jsonrpc: '2.0', id, result: null });
  if (method === 'exit') process.exit(0);

  if (method === 'textDocument/didOpen') {
    const { uri, text } = params.textDocument;
    docs.set(uri, text);
    return diagnose(uri, text);
  }
  if (method === 'textDocument/didChange') {
    const uri = params.textDocument.uri;
    const text = params.contentChanges[params.contentChanges.length - 1].text;
    docs.set(uri, text);
    return diagnose(uri, text);
  }
}

let buffer = Buffer.alloc(0);
process.stdin.on('data', (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  for (;;) {
    const headerEnd = buffer.indexOf('\r\n\r\n');
    if (headerEnd === -1) return;
    const header = buffer.slice(0, headerEnd).toString();
    const match = /Content-Length: (\d+)/i.exec(header);
    if (!match) return;
    const length = Number(match[1]);
    const start = headerEnd + 4;
    if (buffer.length < start + length) return;
    const body = buffer.slice(start, start + length).toString();
    buffer = buffer.slice(start + length);
    try {
      handle(JSON.parse(body));
    } catch {
      /* ignore */
    }
  }
});
