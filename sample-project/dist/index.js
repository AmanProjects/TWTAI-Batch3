/**
 * doc-quality-checker — MCP Server for Documentation Quality
 *
 * Training project: teaches technical communicators how MCP tools work
 * alongside Claude Skills to create AI-powered documentation workflows.
 *
 * Tools:
 *   - check_doc_completeness: Verify required sections are present
 *   - extract_api_endpoints:  Find API endpoints mentioned in docs
 *   - grade_readability:      Calculate Flesch-Kincaid readability score
 *
 * Resources:
 *   - style-guide: Team documentation style guide
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ─── Server Setup ────────────────────────────────────────────────────────────
const server = new McpServer({
    name: "doc-quality-checker",
    version: "1.0.0",
});
// ─── Required Sections Configuration ─────────────────────────────────────────
// These are the sections we expect in a well-documented API reference.
// Modify this list to match your team's documentation standards.
const REQUIRED_SECTIONS = [
    { name: "Title/Heading", pattern: /^#\s+.+/m },
    { name: "Description", pattern: /^(?:#{1,3}\s+)?(?:description|overview|about|introduction)/im },
    { name: "Authentication", pattern: /^(?:#{1,3}\s+)?(?:auth|authentication|authorization)/im },
    { name: "Parameters", pattern: /^(?:#{1,3}\s+)?(?:parameters?|arguments?|inputs?|request\s+(?:body|params))/im },
    { name: "Response", pattern: /^(?:#{1,3}\s+)?(?:response|returns?|output)/im },
    { name: "Error Codes", pattern: /^(?:#{1,3}\s+)?(?:errors?|error\s+codes?|status\s+codes?|error\s+handling)/im },
    { name: "Examples", pattern: /^(?:#{1,3}\s+)?(?:examples?|usage|sample|code\s+examples?)/im },
    { name: "Rate Limits", pattern: /^(?:#{1,3}\s+)?(?:rate\s+limit|throttl|quota)/im },
];
// ─── Tool 1: check_doc_completeness ──────────────────────────────────────────
server.tool("check_doc_completeness", "Check if a documentation file contains all required sections for a complete API reference. " +
    "Checks for: title, description, authentication, parameters, response, error codes, " +
    "examples, and rate limits. Returns a per-section pass/fail report with line numbers.", {
    filePath: z.string().describe("Path to the documentation file to check"),
}, async ({ filePath }) => {
    // Resolve relative paths against the project root
    const resolvedPath = path.isAbsolute(filePath)
        ? filePath
        : path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ error: `File not found: ${filePath}` }, null, 2),
                },
            ],
        };
    }
    const content = fs.readFileSync(resolvedPath, "utf-8");
    const lines = content.split("\n");
    const results = REQUIRED_SECTIONS.map((section) => {
        // Find the first line that matches
        let foundLine = null;
        for (let i = 0; i < lines.length; i++) {
            if (section.pattern.test(lines[i])) {
                foundLine = i + 1; // 1-indexed
                break;
            }
        }
        return {
            section: section.name,
            present: foundLine !== null,
            line: foundLine,
        };
    });
    const present = results.filter((r) => r.present).length;
    const total = results.length;
    const report = {
        file: filePath,
        score: `${present}/${total}`,
        percentage: Math.round((present / total) * 100),
        sections: results,
        summary: present === total
            ? "All required sections are present."
            : `Missing ${total - present} section(s): ${results
                .filter((r) => !r.present)
                .map((r) => r.section)
                .join(", ")}`,
    };
    return {
        content: [{ type: "text", text: JSON.stringify(report, null, 2) }],
    };
});
// ─── Tool 2: extract_api_endpoints ───────────────────────────────────────────
server.tool("extract_api_endpoints", "Extract API endpoints mentioned in a documentation file. Scans for HTTP method + path " +
    "patterns like 'GET /users' or 'POST /api/v1/orders'. Returns a structured list of " +
    "endpoints with their methods, paths, and the line numbers where they appear.", {
    filePath: z.string().describe("Path to the documentation file to scan"),
}, async ({ filePath }) => {
    const resolvedPath = path.isAbsolute(filePath)
        ? filePath
        : path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ error: `File not found: ${filePath}` }, null, 2),
                },
            ],
        };
    }
    const content = fs.readFileSync(resolvedPath, "utf-8");
    const lines = content.split("\n");
    const endpoints = [];
    const methodPattern = /\b(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(\/\S+)/g;
    lines.forEach((line, index) => {
        let match;
        // Reset lastIndex for each line since we reuse the regex
        methodPattern.lastIndex = 0;
        while ((match = methodPattern.exec(line)) !== null) {
            endpoints.push({
                method: match[1].toUpperCase(),
                path: match[2].replace(/[`'")\]}>.,;:]+$/, ""), // strip trailing punctuation
                line: index + 1,
            });
        }
    });
    const result = {
        file: filePath,
        endpointsFound: endpoints.length,
        endpoints,
        summary: endpoints.length === 0
            ? "No API endpoints found in this file."
            : `Found ${endpoints.length} endpoint(s): ${[...new Set(endpoints.map((e) => `${e.method} ${e.path}`))].join(", ")}`,
    };
    return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
});
// ─── Tool 3: grade_readability ───────────────────────────────────────────────
server.tool("grade_readability", "Calculate the readability score of a documentation file using the Flesch-Kincaid formula. " +
    "Returns a grade level (e.g., 'Grade 8'), a readability category " +
    "(Easy/Moderate/Difficult/Very Difficult), word and sentence counts, and specific " +
    "recommendations for improving readability.", {
    filePath: z.string().describe("Path to the documentation file to analyze"),
}, async ({ filePath }) => {
    const resolvedPath = path.isAbsolute(filePath)
        ? filePath
        : path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ error: `File not found: ${filePath}` }, null, 2),
                },
            ],
        };
    }
    const content = fs.readFileSync(resolvedPath, "utf-8");
    // Strip markdown syntax for analysis
    const plainText = content
        .replace(/^#{1,6}\s+/gm, "") // headings
        .replace(/[*_`~\[\]()]/g, "") // formatting
        .replace(/```[\s\S]*?```/g, "") // code blocks
        .replace(/`[^`]*`/g, "") // inline code
        .replace(/\|[^\n]*\|/g, "") // tables
        .replace(/^\s*[-*+]\s+/gm, "") // list markers
        .replace(/^\s*\d+\.\s+/gm, "") // numbered lists
        .replace(/!?\[.*?\]\(.*?\)/g, "") // links/images
        .replace(/^\s*>/gm, "") // blockquotes
        .trim();
    // Count sentences (split on . ! ?)
    const sentences = plainText
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 3);
    const sentenceCount = Math.max(sentences.length, 1);
    // Count words
    const words = plainText.split(/\s+/).filter((w) => w.length > 0);
    const wordCount = words.length;
    if (wordCount === 0) {
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        file: filePath,
                        error: "No readable text content found in the file.",
                    }, null, 2),
                },
            ],
        };
    }
    // Estimate syllables (simple English heuristic)
    function countSyllables(word) {
        word = word.toLowerCase().replace(/[^a-z]/g, "");
        if (word.length <= 2)
            return 1;
        word = word.replace(/e$/, "");
        const matches = word.match(/[aeiouy]+/g);
        return matches ? Math.max(matches.length, 1) : 1;
    }
    const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
    // Flesch-Kincaid Grade Level
    const gradeLevel = 0.39 * (wordCount / sentenceCount) +
        11.8 * (totalSyllables / wordCount) -
        15.59;
    const roundedGrade = Math.round(gradeLevel * 10) / 10;
    let category;
    if (roundedGrade <= 6)
        category = "Easy — suitable for general audience";
    else if (roundedGrade <= 10)
        category = "Moderate — suitable for technical audience";
    else if (roundedGrade <= 14)
        category = "Difficult — may need simplification";
    else
        category = "Very difficult — strongly recommend simplification";
    const avgWordsPerSentence = Math.round((wordCount / sentenceCount) * 10) / 10;
    const avgSyllablesPerWord = Math.round((totalSyllables / wordCount) * 10) / 10;
    const recommendations = [];
    if (avgWordsPerSentence > 25) {
        recommendations.push(`Average sentence length is ${avgWordsPerSentence} words — well above the recommended 20. Break long sentences into shorter ones.`);
    }
    else if (avgWordsPerSentence > 20) {
        recommendations.push(`Average sentence length is ${avgWordsPerSentence} words. Consider keeping most sentences under 20 words.`);
    }
    if (avgSyllablesPerWord > 1.8) {
        recommendations.push(`Average word complexity is high (${avgSyllablesPerWord} syllables/word). Use simpler vocabulary where possible.`);
    }
    else if (avgSyllablesPerWord > 1.5) {
        recommendations.push(`Word complexity is moderate (${avgSyllablesPerWord} syllables/word). Look for opportunities to simplify technical jargon.`);
    }
    if (roundedGrade > 14) {
        recommendations.push("Grade level exceeds 14 — this is graduate-level difficulty. Strongly consider rewriting complex sections.");
    }
    else if (roundedGrade > 12) {
        recommendations.push("Grade level exceeds 12. Consider breaking complex sentences and using plainer language for broader accessibility.");
    }
    if (sentences.some((s) => s.split(/\s+/).length > 40)) {
        recommendations.push("Some sentences exceed 40 words. These should be split for clarity.");
    }
    if (recommendations.length === 0) {
        recommendations.push("Readability is good! The document is well-suited for a technical audience.");
    }
    const result = {
        file: filePath,
        gradeLevel: roundedGrade,
        category,
        stats: {
            words: wordCount,
            sentences: sentenceCount,
            avgWordsPerSentence,
            avgSyllablesPerWord,
        },
        recommendations,
    };
    return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
});
// ─── Resource: Style Guide ───────────────────────────────────────────────────
server.resource("style-guide", "style-guide://team", async (uri) => {
    const stylePath = path.join(__dirname, "..", "test-docs", "style-guide.md");
    if (!fs.existsSync(stylePath)) {
        return {
            contents: [
                {
                    uri: uri.href,
                    text: "Style guide not found. Create test-docs/style-guide.md to configure.",
                    mimeType: "text/markdown",
                },
            ],
        };
    }
    const content = fs.readFileSync(stylePath, "utf-8");
    return {
        contents: [{ uri: uri.href, text: content, mimeType: "text/markdown" }],
    };
});
// ─── Start the Server ────────────────────────────────────────────────────────
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("doc-quality-checker MCP server running on stdio");
}
main().catch(console.error);
