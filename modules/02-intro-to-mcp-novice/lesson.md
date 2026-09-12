# Module 2: Introduction to MCP — The Universal Adapter for AI
## 🟢 Novice Level

**Duration:** 2 hours | **Prerequisite:** Module 1 | **Tech Writer's Tribe**

---

## What This Level Means

You're still in **Novice** territory — building conceptual foundations before touching any code or building any tools. By the end of this module, you will understand what MCP is, why it exists, and where Claude Skills fit into the picture.

### Novice Learning Objectives

By the end of Module 2, you will be able to:
- Explain MCP in plain language using the USB analogy
- Distinguish between tools, resources, and prompts in MCP
- Explain what a Claude Skill is and why technical writers are natural skill creators
- Identify three tasks in your own workflow that could become skills or tools

---

## Recap and Homework Share (15 min)

> "Who used Claude for a real documentation task this week? What happened?"

Quick round of sharing. Celebrate wins. Discuss surprises. Address concerns.

---

## The Problem We're Solving (10 min)

Imagine you're responsible for documenting 30 microservices. Each has its own API, its own repo, its own naming conventions. Every sprint you must:

- Verify every endpoint is documented
- Check parameter descriptions are accurate
- Confirm error codes are listed
- Validate examples actually work
- Keep everything consistent with the style guide

This is the **documentation scaling problem**. Human review doesn't scale. Copy-paste checklists get stale. Institutional knowledge walks out the door when someone changes teams.

AI can help — but only if it can access your tools, files, and systems. That's what MCP is for.

---

## What Is MCP? (20 min)

**MCP (Model Context Protocol)** is an open standard that defines how AI models communicate with external tools and data sources.

### The USB Analogy (Novice Version)

Before USB, every device had a different proprietary connector — printers, cameras, keyboards all used different plugs. USB standardized everything: one protocol, any device.

**MCP does the same thing for AI tools:**

| Before MCP | After MCP |
|-----------|-----------|
| Every AI integration is custom code | One protocol for all tools |
| Tools only work with one AI model | Any MCP server works with any MCP client |
| Integrations break when models update | Protocol is stable and versioned |
| Each team builds from scratch | Community shares MCP servers |

### The Three Parts of MCP

```
+------------------+      MCP Protocol     +------------------+
|   MCP Client     | <-------------------> |   MCP Server     |
|                  |                       |                  |
|  Claude Desktop  |                       |  Your tool       |
|  Cursor          |                       |                  |
|  VS Code         |                       |  ● Tools         |
|                  |                       |  ● Resources     |
|                  |                       |  ● Prompts       |
+------------------+                       +------------------+
```

1. **MCP Client** — The AI application (Claude Desktop, Claude Code, Cursor, VS Code)
2. **MCP Server** — A program you run locally that exposes capabilities to the AI
3. **MCP Protocol** — The standard that defines how they talk to each other

### What an MCP Server Provides

| Capability | What It Is | Documentation Example |
|-----------|-----------|----------------------|
| **Tools** | Functions the AI can call | `check_completeness(file)` returns a list of missing sections |
| **Resources** | Data the AI can read | Your style guide, your glossary |
| **Prompts** | Reusable instruction templates | "Review this doc for our standard completeness checklist" |

> **🟢 Novice Tip:** You don't need to build an MCP server yet. In Modules 1–3, you're the *user* of AI tools. In Modules 6–7, you become the *builder*.

---

## Claude Skills: The Docs Professional's Superpower (20 min)

A **Claude Skill** (also called an Agent Command) is a markdown file that contains a reusable prompt.

Store it in `.claude/commands/` and you can run it with `/skill-name` any time, on any file.

### The Spectrum: Prompt → Skill → Agent

```
Simple ─────────────────────────────────────────────── Complex

One-off Prompt          Skill (Reusable)           Full Agent

"Fix this typo"         /check-api-doc             MCP Automation
                        (your checklist,           (discovers + validates
                         every time)                + fixes + publishes)

Low effort              Medium effort              High capability
Zero reuse              High reuse                 Needs oversight
Inconsistent            Consistent                 Most powerful
```

### Why Skills Are Your Sweet Spot Right Now

| Benefit | Why It Matters |
|---------|---------------|
| **Low barrier** | It's just a markdown file — no code |
| **High reuse** | Write once, run forever |
| **Consistent** | Same checklist applied the same way every time |
| **Shareable** | Commit to Git; your whole team benefits |
| **Leverages your expertise** | You know what good documentation looks like |

### Technical Writers Are Natural Skill Creators

> "A skill is a well-structured instruction set — and writing clear instructions is literally your job."

You already:
- Write procedures that other people follow
- Structure information for clarity
- Anticipate what the reader needs
- Define what "done" looks like

A skill is exactly those things — but the reader is an AI.

---

## Skills vs. Tools: When to Use Which (15 min)

This is a critical distinction that will guide every decision you make in this program.

| | **Skills** | **Tools** |
|--|-----------|----------|
| **What they are** | Prompt templates | Code functions |
| **Who builds them** | Technical writers | Developers (with your guidance) |
| **What they do** | Give the AI instructions | Give the AI data and capabilities |
| **Example** | "Check this doc for completeness" | `read_file("api-reference.md")` |
| **Result type** | AI-generated insights | Deterministic, structured output |
| **Best for** | Review, generation, analysis | Data access, computation, integration |

### The Hybrid Approach

The most powerful setup combines both:

```
Your Skill:     "Perform a full documentation audit on $ARGUMENTS"
                 ↓
MCP Tool:        read_file() → returns raw content
                 ↓
Your Skill:     [analyzes content using your checklist]
                 ↓
MCP Tool:        grade_readability() → returns score
                 ↓
Your Skill:     [compiles findings into a structured report]
```

---

## Activity: Skill Candidate Identification (20 min)

### Instructions

Open the **Skill/Tool Identifier Worksheet** (below). For each item, decide: Is it a Skill, a Tool, both, or neither?

| Documentation Task | Skill? | Tool? | Both? | Notes |
|-------------------|--------|-------|-------|-------|
| Check if all API endpoints are documented | | | | |
| Generate a changelog from git history | | | | |
| Ensure headings use sentence case | | | | |
| Validate that code examples compile | | | | |
| Translate a doc into plain language | | | | |
| Count words in a document | | | | |
| Identify jargon a new user wouldn't understand | | | | |
| Compare two versions of a doc for regressions | | | | |

Discuss your answers as a group.

> **Answers:** Tasks involving AI judgment (1, 2, 3, 5, 7, 8) → Skills. Tasks with deterministic computation (4, 6) → Tools. Many tasks benefit from both.

---

## Discussion and Wrap-Up (10 min)

### Reflection Questions

1. What in your current workflow could become a Claude Skill?
2. What would need a real tool (i.e., code access to your files or systems)?
3. What would be your *first* skill if you built one this weekend?

---

## Homework (Before Module 3)

1. **Read** Module 3 lesson (Prompt Engineering)
2. **Pick one repetitive documentation task** and write a paragraph describing:
   - What the task is
   - What "done well" looks like
   - What criteria you use to judge quality
3. Come ready — that paragraph is the seed of your first skill

---

## 🟢 Novice Checklist

Before moving to Module 3, confirm you can:

- [ ] Explain MCP using the USB analogy in your own words
- [ ] Distinguish between a Tool, a Resource, and a Prompt in MCP
- [ ] Explain what a Claude Skill is without using jargon
- [ ] Name two tasks in your workflow that could become skills
- [ ] Explain the difference between a skill and a tool (deterministic vs. AI-generated)
