# Module 5: Advanced Skills and Team Workflows
## 🟡 Intermediate Level (Upper)

**Duration:** 2 hours | **Prerequisite:** Modules 1–4

---

## What This Level Means

You can build working skills and share them with your team through a marketplace. Now you're pushing into **upper-intermediate**: composing skills into multi-step workflows, collaborating with your team using skills, and calibrating quality through peer review. These are the capabilities that separate practitioners from casual users.

### Intermediate (Upper) Learning Objectives

By the end of Module 5, you will be able to:
- Compose multiple skills into a coordinated multi-step workflow
- Explain what MCP servers are and why they matter for documentation automation
- Configure standard MCP servers (Git, Atlassian, Microsoft Learn) in Claude Code
- Conduct a structured peer review of another writer's skill
- Design a team skill library that multiple people can use and maintain
- Identify the boundary between what skills can do and what requires an MCP tool

---

## Introduction to MCP Servers (20 min)

### What Is an MCP Server?

**MCP (Model Context Protocol)** is an open standard that connects AI assistants to your data and tools. Think of it as a universal adapter — instead of custom code for every integration, MCP gives multiple AI models (Claude, ChatGPT, Copilot) one standard way to talk to any tool (Jira, Confluence, Git, and more).

For technical writers, MCP solves the **M×N integration problem**: rather than building separate connections between every AI tool and every data source, MCP creates one protocol that works across all of them.

### Why MCP Servers Matter for Documentation Teams

| Without MCP | With MCP |
|------------|---------|
| Copy-paste doc content into prompts manually | Claude reads docs directly from your repo |
| Manual GitHub lookups for what changed | Claude queries Git history automatically |
| Copy Jira ticket details into every prompt | Claude queries Jira and extracts context |
| Look up style guide rules manually | Claude references your style guide resource |
| 2 hours to write release notes | 2 minutes with automated generation |

### Where to Find MCP Servers

Community registries list hundreds of pre-built servers:
- **modelcontextprotocol.io** — Official registry and reference servers
- **mcp.so**, **Smithery.ai**, **Glama.ai**, **PulseMCP** — Community registries
- **Anthropic Directory** (claude.ai/directory) — Anthropic's reviewed connector listing; count changes constantly, so check the live directory rather than citing a fixed number

### The Three Types You'll Use in This Program

1. **Standard Servers** — Pre-built by Anthropic/community (Git, Atlassian). Configure today.
2. **Custom Servers** — You build these in Module 6 using the TypeScript SDK.
3. **Integrated Servers** — Multiple servers working together in production (Module 7).

---

## Hands-On: Configuring Standard MCP Servers (40 min)

> **Important:** Claude Code is a CLI tool. MCP servers are configured using the `claude mcp` command in your terminal — there is no GUI settings panel. All configuration is done via command line or by editing `.mcp.json`.

### Core Commands

```bash
claude mcp add <name> -- <command> [args]         # Add a server (stdio transport)
claude mcp add <name> --transport http --url <url>  # Add a remote server (HTTP transport — recommended for remote/cloud servers)
claude mcp list                                   # List all configured servers
claude mcp get <name>                             # Show details for one server
claude mcp remove <name>                          # Remove a server
```

> **Note:** SSE (Server-Sent Events) transport is now deprecated in favor of HTTP. Use `--transport http` for any remote server that supports it; only fall back to `--transport sse` if a server hasn't migrated yet.

### Exercise 1: Configure Git MCP Server

**Goal:** Let Claude read your Git repositories directly.

**Step 1:** Install the server package

```bash
npm install -g @modelcontextprotocol/server-git
```

**Step 2:** Register it with Claude Code

```bash
claude mcp add git -- npx -y @modelcontextprotocol/server-git /path/to/your/repo
```

**Step 3:** Verify it's registered

```bash
claude mcp list
```

**Step 4:** Test it — in Claude Code, ask:

```
Use the git MCP server to list all files changed in the last 7 days.
```

**Expected output:** Claude lists files with their modification dates and commit messages.

**Why this matters:** Claude can now read your repository directly — no copy-pasting files into prompts.

---

### Exercise 2: Configure Atlassian MCP Server

**Goal:** Let Claude access Jira and Confluence via the official Atlassian remote MCP server.

**Step 1:** Register the Atlassian remote server using HTTP transport (the recommended transport — SSE is deprecated)

```bash
claude mcp add atlassian \
  --transport http \
  --url https://mcp.atlassian.com/v1/mcp
```

> Check the [Anthropic Directory](https://claude.ai/directory) or Atlassian's own docs for the current URL before class — remote MCP endpoints occasionally move.

**Step 2:** Authenticate — Claude Code will prompt you to open a browser URL to authorize access to your Atlassian instance.

**Step 3:** Verify it's registered

```bash
claude mcp list
```

**Step 4:** Test it — in Claude Code, ask:

```
Use the Atlassian MCP server to find all open issues in the DOCS project 
labelled "api-docs" and summarize their status.
```

**Expected output:** Claude lists issues with status, assignee, and description pulled directly from Jira.

**Why this matters:** Your skills can now query what needs to be documented without anyone manually copy-pasting Jira tickets.

---

### Exercise 3: Configure Microsoft Learn MCP Server

**Goal:** Give Claude direct access to Microsoft's official documentation — concepts, tutorials, API references, and code samples.

> **What this is:** The **Microsoft Learn MCP Server** (`microsoftdocs/mcp`) is an official Microsoft plugin. It exposes three tools Claude can call:
> - `microsoft_docs_search` — search Microsoft Learn documentation
> - `microsoft_docs_fetch` — fetch a specific Microsoft Learn page
> - `microsoft_code_sample_search` — find official code samples
>
> **What this is NOT:** This is not the Microsoft Manual of Style (MSTP). MSTP is a style reference document — it has no MCP server. The correct approach for MSTP is to save it as a local resource file, which you'll learn in Module 6.

**Step 1:** Add the Microsoft Docs marketplace

```bash
/plugin marketplace add microsoftdocs/mcp
```

**Step 2:** Install the plugin

```bash
/plugin install microsoft-docs@microsoft-docs-marketplace
```

**Step 3:** Restart Claude Code, then test it:

```
Use the Microsoft Learn MCP server to find the official guidance 
on writing API reference documentation.
```

**Expected output:** Claude returns content from official Microsoft Learn docs, citing the source.

**Step 4:** Try a documentation-relevant query:

```
Use microsoft_docs_search to find Microsoft's style guidance 
on using active voice and second person in technical content.
```

**Why this matters:** When writing or reviewing documentation that references Microsoft technologies, Azure services, or .NET APIs, your skills can fetch the latest official guidance rather than relying on Claude's training data — which may be outdated.

### Using Microsoft Learn MCP in a Skill

Once installed, call its tools directly from a skill:

```markdown
# .claude/commands/ms-doc-review.md

You are a technical editor reviewing Microsoft technology documentation.

Review the document at: $ARGUMENTS

Use the microsoft_docs_search and microsoft_docs_fetch tools to:
1. Verify any Microsoft technology claims against official documentation
2. Check that API usage matches current official examples
3. Confirm terminology matches Microsoft's current naming conventions

Output a table: Claim | Official Guidance | Match? | Source URL
```

---

### Verification Checklist

After completing all three exercises, you should be able to:

- [ ] Run `claude mcp list` and see the Git server registered
- [ ] Run `claude mcp list` and see the Atlassian server registered
- [ ] Claude can query your Git repository without copy-pasting file contents
- [ ] Claude can query Jira issues and Confluence pages
- [ ] Microsoft Learn plugin installed; Claude can search official Microsoft docs
- [ ] Your `/ms-doc-review` skill calls `microsoft_docs_search` and returns results with source URLs
- [ ] You understand the difference between a **tool** (Git, Atlassian, Microsoft Learn) and a **resource** (a local file like MSTP)

---

## Peer Review Session (45 min)

This is the most important exercise in the program. Reviewing each other's skills teaches you what makes a skill effective — faster than any lecture can.

### How Peer Review Works

1. **Form groups of 3**
2. Each person shares their two homework skills (`/doc-coverage` + custom skill)
3. For each skill, the reviewer:
   - Reads the skill file (not the output — the *skill itself*)
   - Runs the skill on a test file
   - Fills out the **Peer Review Rubric** (see `resources/peer-review-rubric.md`)
4. Discuss findings as a group
5. Each person revises one skill based on the most impactful piece of feedback

### Peer Review Rubric (Summary)

| Criterion | What to Look For |
|-----------|-----------------|
| **Clarity** | Can you understand what the skill does by reading the first 2 lines? |
| **Role** | Is the AI's role and expertise specified? |
| **Checklist / Rules** | Are the criteria explicit, complete, and unambiguous? |
| **Output Format** | Is the expected output clearly and specifically described? |
| **Boundaries** | Does the skill define what NOT to do? |
| **$ARGUMENTS** | Does the skill work on any relevant input (not just one hardcoded file)? |
| **Testability** | Can you run it right now and get consistently useful output? |

**Scoring:** Rate each criterion 1–3.
- **3** = Strong — clear, complete, no confusion
- **2** = Adequate — works but could be sharpened
- **1** = Needs work — unclear, incomplete, or missing

Total: /21. Write specific feedback for any criterion scored 1 or 2.

---

## Skill Composition: Multi-Step Workflows (25 min)

### The Limitation of Single Skills

A single skill does one thing well. But real documentation quality audits involve multiple steps:

1. Check doc coverage (are all functions documented?)
2. Check completeness (are required sections present?)
3. Check style compliance
4. Check readability score
5. Compile and prioritize findings
6. Produce an actionable report

A multi-step skill orchestrates all of these:

```markdown
# .claude/commands/full-doc-review.md

You are a documentation quality lead conducting a complete audit.

Perform a full documentation review for: $ARGUMENTS

## Step 1: Coverage Check
Identify all source files with exported functions or APIs.
Cross-reference against documentation files.
List all undocumented items as CRITICAL gaps.

## Step 2: Completeness Audit
For each documentation file, verify it includes:
- Description (what the feature/endpoint does)
- Prerequisites or authentication requirements
- Parameters or inputs (name, type, required/optional)
- Response or output format
- Error conditions
- At least one working example

## Step 3: Style Review
Check each documentation file for:
- Active voice, present tense, second person ("you")
- Sentences under 25 words
- Code elements in backticks
- Headings in sentence case (not Title Case)

## Step 4: Readability
For each file, note whether the prose is appropriate for a developer audience
(intermediate technical level, not expert jargon, not beginner-friendly padding).

## Step 5: Synthesis
Produce a consolidated report:

### Documentation Audit Report
**Scope:** [files reviewed]
**Date:** [today]

#### Critical Issues (fix before publication)
[List — ordered by severity]

#### Recommended Improvements (fix this sprint)
[List]

#### Minor Polish (next available slot)
[List]

#### Documentation Health Score: X/10
[Brief rationale]
```

### When Multi-Step Outperforms Single Skills

| Use Case | Single Skill | Multi-Step Skill |
|----------|-------------|-----------------|
| Quick style check on one file | ✅ Better | Overkill |
| Full pre-release doc audit | Too limited | ✅ Better |
| Daily PR review | ✅ Better | Overkill |
| Quarterly doc health report | Too limited | ✅ Better |

---

## Team Skill Libraries (20 min)

Skills are only as valuable as the team that uses them. Here's how to build a shared skill library that actually gets used.

### Structure for a Team Skills Repo

```
docs-tools/
  .claude/
    commands/
      check-api-doc.md        ← API endpoint completeness
      style-check.md          ← style guide compliance
      release-notes.md        ← changelog entries
      scaffold-api-doc.md     ← API doc template
      simplify.md             ← beginner-friendly rewrite
      doc-coverage.md         ← undocumented code
      full-doc-review.md      ← multi-step complete audit
  README.md                   ← How to use this skill library
  CONTRIBUTING.md             ← How to add / improve skills
  CHANGELOG.md                ← Version history of skills
```

### Skill Maintenance Rules

1. **Every skill must include a comment header:**
```markdown
<!--
Skill: check-api-doc
Purpose: Review an API endpoint doc for completeness
Author: [your name]
Last updated: [date]
Tested against: [current model name + date, e.g. "Claude Sonnet 5, July 2026"]
-->
```

2. **Version your skills.** Skills degrade as models update. Record which model version produced good results — don't hardcode a specific model name into the skill's instructions itself, since the header is where that version info belongs and it needs to stay current.

3. **Document breaking changes.** If you change the output format, update any downstream processes that depend on it.

4. **Review skills quarterly.** A skill that worked 6 months ago may now be outdated.

---

## Discussion and Wrap-Up (10 min)

### Reflection Questions

1. What's one skill from today's peer review that you want to copy for your own workflow?
2. Where does the multi-step pattern break down? (Hint: when context gets too long)
3. What team processes would you need to change to adopt a shared skill library?

---

## Homework (Before Module 6)

1. **Finalize** your `/doc-review` multi-step skill — this is a required portfolio item
2. **Set up** the sample project: `cd sample-project && npm install && npm run build`
3. **Read** Module 6 — you will read real TypeScript code next session (you CAN do this)

---

## 🟡 Intermediate Checklist

Before moving to Module 6, confirm you can:

- [ ] Conduct a structured peer review using the rubric
- [ ] Give specific, actionable feedback on another writer's skill
- [ ] Build a multi-step skill that orchestrates 3+ review dimensions
- [ ] Explain when to use a multi-step skill vs. multiple individual skills
- [ ] Design a team skill library structure
- [ ] Define 3 maintenance practices for a shared skill library
