# Module 6: Building MCP Tools — Extending a Real Server
## 🟠 Advanced Level

**Duration:** 2 hours | **Prerequisite:** Modules 1–5

---

## What This Level Means

**Advanced** means you've mastered skills and are ready to cross into the builder's side. You'll read and modify real TypeScript code — not write it from scratch. Think of this as editing a template document: you don't design the architecture, you fill in the parts that are specific to your needs.

By the end of this module, you are no longer just a user of AI tools. You are a co-architect.

### Advanced Learning Objectives

By the end of Module 6, you will be able to:
- Read and explain TypeScript MCP server code in plain language
- Add a new tool to an existing MCP server
- Expose a resource (e.g., your style guide) through an MCP server
- Connect your MCP server to Claude Code and verify it works

---

## What We're Building (10 min)

A working MCP server called **doc-quality-checker** with three tools, one resource, and a skill that synthesizes all results.

```
+------------------------------------------+
|         doc-quality-checker              |
|                                          |
|  Tools (deterministic):                  |
|    check_doc_completeness  → structured  |
|    extract_api_endpoints   → structured  |
|    grade_readability       → score       |
|                                          |
|  Resources (readable data):              |
|    style-guide → your team's rules       |
|                                          |
|  Skill (AI-powered synthesis):           |
|    /doc-review → compiled report         |
+------------------------------------------+
```

### Why Do This?

You don't need to become a developer. But understanding MCP servers means you can:
- **Propose tools** with precision: "We need a tool that reads OpenAPI specs and returns undocumented endpoints"
- **Read and review** what a tool does before trusting it in your workflow
- **Collaborate effectively** with engineers who build tools for your team
- **Own** your documentation tooling instead of waiting for IT

---

## Step 1: Explore the Starter Project (15 min)

Open `sample-project/`. Let's understand the structure:

```
sample-project/
  package.json          ← Dependencies and npm scripts
  tsconfig.json         ← TypeScript configuration
  src/
    index.ts            ← The MCP server (starter code)
  test-docs/
    good-api-doc.md     ← A well-written example
    bad-api-doc.md      ← A doc with deliberate issues
    style-guide.md      ← The style guide resource
```

### Reading `package.json` Like a Technical Writer

```json
{
  "name": "doc-quality-checker",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.12.1"
  }
}
```

In plain language:
- `build` → Compiles TypeScript (`.ts`) into JavaScript (`.js`)
- `start` → Runs the compiled server
- `@modelcontextprotocol/sdk` → The official MCP library — it handles the protocol for us

### Don't Panic About TypeScript

You won't write TypeScript from scratch. You will:
1. **Read** code with explanations
2. **Copy** new code from this lesson
3. **Understand** what each part does
4. **Modify** small parts to customize

It's exactly like editing a template document. You change the content, not the layout.

---

## Step 2: Read the Starter Code (25 min)

Open `src/index.ts`. Here is a guided walkthrough of each section:

### Section 1: Imports and Setup

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as fs from "fs";
import * as path from "path";
```

**In plain language:** We're loading the MCP library (so we don't have to write the protocol ourselves) and Node.js built-ins for reading files and working with file paths.

### Section 2: Creating the Server

```typescript
const server = new McpServer({
  name: "doc-quality-checker",
  version: "1.0.0",
});
```

**In plain language:** Create an MCP server with a name and version. This is what Claude will see when it connects.

### Section 3: Registering a Tool

```typescript
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
```

**In plain language:** Register a tool called `check_doc_completeness`. It takes a file path, reads the file, checks for required sections, and returns a structured result.

> **🟠 Advanced Insight:** The tool is *deterministic* — it always produces the same output for the same input. This is fundamentally different from a skill, which is AI-generated and can vary.

---

## Step 3: Add a New Tool — Live Exercise (30 min)

### Your Task

Add a `grade_readability` tool that:
1. Reads a documentation file
2. Counts average sentence length
3. Returns a readability score and grade (Easy / Moderate / Complex)

### The Code to Add

Copy this block into `src/index.ts` after the existing `check_doc_completeness` tool:

```typescript
server.tool(
  "grade_readability",
  "Grade the readability of a documentation file based on sentence length",
  {
    filePath: {
      type: "string",
      description: "Path to the documentation file to grade",
    },
  },
  async ({ filePath }) => {
    const content = fs.readFileSync(filePath, "utf-8");
    
    // Remove markdown syntax for cleaner sentence analysis
    const plainText = content
      .replace(/```[\s\S]*?```/g, "")  // remove code blocks
      .replace(/`[^`]+`/g, "code")     // replace inline code
      .replace(/#+\s/g, "")            // remove heading markers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"); // simplify links
    
    const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const words = plainText.split(/\s+/).filter(w => w.length > 0);
    const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;
    
    let grade: string;
    let recommendation: string;
    if (avgSentenceLength < 15) {
      grade = "Easy";
      recommendation = "Good readability for developer audiences.";
    } else if (avgSentenceLength < 25) {
      grade = "Moderate";
      recommendation = "Acceptable. Consider shortening the longest sentences.";
    } else {
      grade = "Complex";
      recommendation = "Too complex. Target sentences under 25 words for developer docs.";
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          file: filePath,
          avg_sentence_length: Math.round(avgSentenceLength),
          grade,
          recommendation,
          sentence_count: sentences.length,
          word_count: words.length
        }, null, 2)
      }]
    };
  }
);
```

### Build and Test

```bash
cd sample-project
npm run build
```

If it compiles without errors, you're ready to connect it to Claude.

---

## Step 4: Connect to Claude Code (15 min)

Add the server to Claude Code's configuration:

```bash
# In Claude Code, run:
claude mcp add doc-quality-checker -- node /absolute/path/to/sample-project/dist/index.js
```

Verify it's working:
```
/mcp
```

You should see `doc-quality-checker` listed. Now test your new tool:
```
Use check_doc_completeness on sample-project/test-docs/bad-api-doc.md
```

---

## Shortcut: Scaffold with Claude's Built-in MCP Builder (Optional, 10 min)

Instead of writing code from scratch, Claude Code includes a scaffolding plugin that generates a working MCP server from a plain-language description of your tools.

### Install the Plugin

In a Claude Code session, run:

```
/plugin install mcp-server-dev@claude-plugins-official
```

If you see a marketplace error, first register the official plugin source:

```
/plugin marketplace add anthropics/claude-plugins-official
```

Then reload plugins for the current session:

```
/reload-plugins
```

### Generate Your Server

```
/mcp-server-dev:build-mcp-server
```

Claude will ask what your server should do. Describe your tools in plain language — for example, "a tool that reads a Markdown file and flags passive voice" — and it will scaffold a complete working server. You choose between:
- **Local stdio server** — runs as a process on your machine, connected via `claude mcp add`
- **Remote HTTP server** — hosted in the cloud, accessible from any client

### When to Use MCPBuilder vs. Writing Code

| Use MCPBuilder | Write code manually |
|---|---|
| Prototyping a new idea quickly | When you need precise logic |
| You're unfamiliar with TypeScript | When adapting an existing server |
| You want to see the pattern first | When a code review is required |

MCPBuilder gives you a working skeleton. You still need to understand the code to customize or maintain it — which is exactly what this module teaches.

---

## Going Further: A Better MCP for General Technical Writers

The `doc-quality-checker` server built in this module is useful, but its `check_doc_completeness` tool is wired to API documentation sections (Authentication, Parameters, Response). Most technical writing work — how-to guides, concept articles, tutorials, release notes — has nothing to do with APIs.

### Recommended Alternative: `style-guide-enforcer`

A **Style Guide & Terminology Enforcer** MCP serves every kind of technical writer, regardless of domain.

```
+------------------------------------------+
|         style-guide-enforcer             |
|                                          |
|  Tools:                                  |
|    check_terminology  → flag banned      |
|                          words and       |
|                          suggest approved|
|                          alternatives    |
|    detect_passive_voice → sentences to  |
|                           revise        |
|    validate_doc_structure → check        |
|                             required     |
|                             sections     |
|                             by doc type  |
|                                          |
|  Resources:                              |
|    glossary → approved term list         |
|    structure-rules → section rules       |
|                       per doc type       |
+------------------------------------------+
```

**Why this is better for your portfolio:**

- Every technical writing team has a style guide — this is immediately relatable to any hiring manager
- The glossary is a plain JSON or CSV file you maintain, no coding required
- It works on any doc type: how-to, tutorial, reference, release note
- Demonstrates that you understand *documentation governance*, not just formatting

**What the `check_terminology` tool would look like:**

```typescript
server.tool(
  "check_terminology",
  "Flag banned terms and suggest approved alternatives from the team glossary",
  {
    filePath: { type: "string", description: "Path to the doc file to check" },
    glossaryPath: { type: "string", description: "Path to approved-terms JSON file" }
  },
  async ({ filePath, glossaryPath }) => {
    const content = fs.readFileSync(filePath, "utf-8");
    const glossary = JSON.parse(fs.readFileSync(glossaryPath, "utf-8"));
    // glossary format: [{ banned: "whitelist", approved: "allowlist" }, ...]
    const violations = glossary.filter(({ banned }: { banned: string }) =>
      new RegExp(`\\b${banned}\\b`, "gi").test(content)
    ).map(({ banned, approved }: { banned: string; approved: string }) => ({
      found: banned,
      use_instead: approved
    }));
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          file: filePath,
          violations_found: violations.length,
          violations,
          status: violations.length === 0 ? "PASS" : "NEEDS_REVISION"
        }, null, 2)
      }]
    };
  }
);
```

> **Try it:** After finishing this module, fork the `sample-project/` and rebuild it as `style-guide-enforcer`. Replace the API-specific sections with your own team's glossary and doc structure rules.

---

## Step 5: Publish Your MCP Server to the Official Registry

Once your server works locally, you can publish it so anyone can discover and install it — a strong portfolio item that shows you can ship, not just build.

**Official registry:** https://registry.modelcontextprotocol.io

### Prerequisites

Before submitting, your project needs:

- [ ] A public GitHub repository
- [ ] `package.json` with `name`, `description`, `version`, and a `bin` entry pointing to your compiled server
- [ ] A `README.md` that documents what the server does, how to install it, and what each tool does
- [ ] A working `npm run build` that compiles without errors

### Step 1: Prepare `package.json`

Your `package.json` needs a `bin` field so the registry knows how to run your server:

```json
{
  "name": "style-guide-enforcer",
  "version": "1.0.0",
  "description": "MCP server that checks docs against a custom style guide and terminology glossary",
  "bin": {
    "style-guide-enforcer": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.12.1"
  }
}
```

Also ensure your compiled `dist/index.js` starts with a shebang:

```typescript
#!/usr/bin/env node
```

Add this as the first line inside `src/index.ts` before the imports.

### Step 2: Publish to npm

The MCP registry discovers servers through npm:

```bash
npm login
npm publish --access public
```

Your package will be live at `https://www.npmjs.com/package/style-guide-enforcer`.

### Step 3: Submit to the Registry

The registry uses a namespace format: `io.github.YOUR_USERNAME/server-name`.

Install the registry CLI and authenticate:

```bash
# From the registry repo: https://github.com/modelcontextprotocol/registry
make publisher
./bin/mcp-publisher --help
```

Authenticate with your GitHub account (OAuth), then submit:

```bash
./bin/mcp-publisher publish io.github.YOUR_USERNAME/style-guide-enforcer
```

The registry validates your `package.json`, entry points, and README before listing.

### Alternative Registries (Easier to Start)

If the official CLI feels complex, these directories accept submissions via a web form and are widely used by the community:

| Registry | URL | Best for |
|---|---|---|
| **Smithery** | smithery.ai | AI-specific discovery |
| **PulseMCP** | pulsemcp.io | Community browsing |
| **Glama** | glama.ai | Discovery and reviews |
| **MCP.so** | mcp.so | Simple directory listing |

> **Portfolio tip:** Publishing to even one registry gives you a real URL you can link to in your portfolio or resume. The entry in your `README.md` is itself a documentation artifact — write it as you would any product doc.

> **Shortcut:** In Claude Code, run `/mcp-submit-mcp-registry` to auto-generate a registry submission form pre-filled from your server's manifest and README.

---

## Discussion and Wrap-Up (10 min)

### Reflection Questions

1. What is the key difference between the *tool* checking completeness and a *skill* checking completeness?
2. What tools would be most valuable for your team's documentation workflow?
3. What would you need to ask an engineer to build for you — and how would you describe it?

---

## Homework (Before Module 7)

1. **Add** the `extract_api_endpoints` tool to your MCP server (follow the same pattern)
2. **Add** your style guide as a Resource (see Module 7 for the pattern)
3. **Verify** all three tools work from Claude Code

---

## 🟠 Advanced Checklist

Before moving to Module 7, confirm you can:

- [ ] Read a TypeScript MCP server file and explain each section in plain language
- [ ] Add a new tool to an existing MCP server by copying and adapting existing code
- [ ] Build and compile an MCP server without errors
- [ ] Connect an MCP server to Claude Code and verify the connection
- [ ] Run a tool from Claude Code and interpret the output
- [ ] Explain the difference between deterministic tool output and AI skill output
- [ ] Use the MCPBuilder plugin (`/mcp-server-dev:build-mcp-server`) to scaffold a new server
- [ ] Describe at least one MCP server idea that would help your own team's documentation workflow
- [ ] Prepare a project for registry submission: `package.json` with `bin`, a shebang in `index.ts`, and a complete `README.md`
