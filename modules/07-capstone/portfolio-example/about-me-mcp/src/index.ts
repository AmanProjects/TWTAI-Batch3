#!/usr/bin/env node
// about-me MCP server
// Serves a person's background (from a JSON Resume file) as MCP tools, a resource,
// and a prompt — so anyone using Claude can ask about them.
//
// Data source (in priority order):
//   1. RESUME_PATH environment variable, if set
//   2. the bundled data/resume.json shipped with this package

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadResume(): any {
  const bundled = path.join(__dirname, "..", "data", "resume.json");
  const resumePath = process.env.RESUME_PATH || bundled;
  return JSON.parse(fs.readFileSync(resumePath, "utf-8"));
}

const resume = loadResume();
const basics = resume.basics || {};
const owner = basics.name || "this person";

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

const server = new McpServer({
  name: "about-me",
  version: "1.0.0",
});

// --- Tools ---------------------------------------------------------------

server.tool(
  "get_summary",
  `Get ${owner}'s professional summary, title, and location.`,
  async () =>
    json({
      name: basics.name,
      label: basics.label,
      location: basics.location,
      summary: basics.summary,
    })
);

server.tool(
  "get_experience",
  `Get ${owner}'s work experience. Optionally filter by a keyword (e.g. "API", "leadership").`,
  { keyword: z.string().optional().describe("Case-insensitive filter across role, company, and highlights") },
  async ({ keyword }) => {
    let work = resume.work || [];
    if (keyword) {
      const k = keyword.toLowerCase();
      work = work.filter((w: any) =>
        JSON.stringify(w).toLowerCase().includes(k)
      );
    }
    return json({ count: work.length, keyword: keyword || null, work });
  }
);

server.tool(
  "get_skills",
  `Get ${owner}'s skills and areas of expertise.`,
  async () => json(resume.skills || [])
);

server.tool(
  "get_education",
  `Get ${owner}'s education and certifications.`,
  async () =>
    json({
      education: resume.education || [],
      certificates: resume.certificates || [],
    })
);

server.tool(
  "get_contact",
  `Get ${owner}'s contact details and links.`,
  async () =>
    json({
      email: basics.email,
      phone: basics.phone,
      portfolio: basics.url,
      profiles: basics.profiles || [],
    })
);

// --- Resource ------------------------------------------------------------

server.resource(
  "resume",
  "about-me://resume",
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify(resume, null, 2),
      },
    ],
  })
);

// --- Prompt --------------------------------------------------------------

server.prompt(
  "introduce_me",
  `Draft a short introduction of ${owner} for a given audience.`,
  { audience: z.string().optional().describe('e.g. "a hiring manager", "a conference host"') },
  ({ audience }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text:
            `Using the get_summary and get_experience tools, write a 3-sentence ` +
            `introduction of ${owner} for ${audience || "a general professional audience"}. ` +
            `Be specific and factual — do not invent anything.`,
        },
      },
    ],
  })
);

// --- Start ---------------------------------------------------------------

const transport = new StdioServerTransport();
await server.connect(transport);
