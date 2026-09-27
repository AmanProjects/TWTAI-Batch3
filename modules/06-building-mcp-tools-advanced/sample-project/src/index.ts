import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as fs from "fs";
import * as path from "path";

const server = new McpServer({
  name: "doc-quality-checker",
  version: "1.0.0",
});

// ── Tool 1: Check completeness ────────────────────────────────────────────────

server.tool(
  "check_doc_completeness",
  "Check if a documentation file has all required sections",
  {
    filePath: {
      type: "string",
      description: "Path to the documentation file to check",
    },
  },
  async ({ filePath }) => {
    const content = fs.readFileSync(filePath, "utf-8");
    const requiredSections = [
      "Description", "Authentication", "Parameters",
      "Response", "Errors", "Example"
    ];
    const missing = requiredSections.filter(
      section => !content.toLowerCase().includes(section.toLowerCase())
    );
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          file: filePath,
          missing_sections: missing,
          score: `${requiredSections.length - missing.length}/${requiredSections.length}`,
          status: missing.length === 0 ? "COMPLETE" : "INCOMPLETE"
        }, null, 2)
      }]
    };
  }
);

// ── Tool 2: Grade readability ─────────────────────────────────────────────────
// TODO (Module 6, Step 3): Copy the grade_readability tool here from the lesson.

// ── Tool 3: Extract API endpoints ────────────────────────────────────────────
// TODO (Homework): Add extract_api_endpoints following the same pattern.

// ── Resource: Style guide ─────────────────────────────────────────────────────
// TODO (Module 7): Expose your style-guide.md as a resource.

// ── Start the server ─────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
