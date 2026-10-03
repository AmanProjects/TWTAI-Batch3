#!/usr/bin/env node
/**
 * docstats — a dependency-free stdio MCP server bundled inside a plugin.
 *
 * Module 6 built an MCP server with the official SDK. This one speaks raw
 * JSON-RPC over stdin/stdout so the plugin installs with zero `npm install`.
 * That matters for a plugin: whatever you bundle has to run on someone else's
 * machine the moment they enable it.
 *
 * Exposed to Claude as: mcp__plugin_doc-toolkit_docstats__word_stats
 */

const fs = require('fs');

const TOOLS = [
  {
    name: 'word_stats',
    description:
      'Measure a Markdown file: word count, sentence count, longest sentence, heading count. Use before claiming a doc is too long or too dense.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Absolute or relative path to a .md file' },
      },
      required: ['path'],
    },
  },
];

function wordStats(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const prose = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^\s{0,3}#{1,6}\s.*$/gm, ' ');

  const words = prose.split(/\s+/).filter(Boolean);
  const sentences = prose
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);

  let longest = 0;
  let longestText = '';
  for (const s of sentences) {
    const n = s.split(/\s+/).filter(Boolean).length;
    if (n > longest) {
      longest = n;
      longestText = s;
    }
  }

  const headings = (text.match(/^\s{0,3}#{1,6}\s/gm) || []).length;

  return {
    path: filePath,
    words: words.length,
    sentences: sentences.length,
    headings,
    longestSentenceWords: longest,
    longestSentence: longestText.slice(0, 200),
  };
}

function send(msg) {
  process.stdout.write(JSON.stringify(msg) + '\n');
}

function handle(req) {
  const { id, method, params } = req;

  if (method === 'initialize') {
    return send({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'docstats', version: '1.0.0' },
      },
    });
  }

  if (method === 'tools/list') {
    return send({ jsonrpc: '2.0', id, result: { tools: TOOLS } });
  }

  if (method === 'tools/call') {
    try {
      const stats = wordStats(params.arguments.path);
      return send({
        jsonrpc: '2.0',
        id,
        result: { content: [{ type: 'text', text: JSON.stringify(stats, null, 2) }] },
      });
    } catch (err) {
      return send({
        jsonrpc: '2.0',
        id,
        result: { isError: true, content: [{ type: 'text', text: `word_stats failed: ${err.message}` }] },
      });
    }
  }

  // Notifications (no id) need no reply.
  if (id === undefined) return;

  send({ jsonrpc: '2.0', id, error: { code: -32601, message: `Unknown method: ${method}` } });
}

let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  let nl;
  while ((nl = buffer.indexOf('\n')) !== -1) {
    const line = buffer.slice(0, nl).trim();
    buffer = buffer.slice(nl + 1);
    if (!line) continue;
    try {
      handle(JSON.parse(line));
    } catch {
      /* ignore malformed frames */
    }
  }
});
