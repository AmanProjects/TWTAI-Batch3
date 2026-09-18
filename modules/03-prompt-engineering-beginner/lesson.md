# Module 3: Prompt Engineering for Documentation Professionals
## 🔵 Beginner Level

**Duration:** 2 hours | **Prerequisite:** Modules 1–2 | **Tech Writer's Tribe**

**Companion doc:** [WORKSHOP.md](./WORKSHOP.md) — extended hands-on exercises for VS Code, Cursor, and Claude Code

---

## What This Level Means

**Beginner** means you understand AI and MCP conceptually and are now ready to *build*. This module is where you write your first Agent Skill. You'll leave with a working, reusable tool you can use on Monday morning.

### Beginner Learning Objectives

By the end of Module 3, you will be able to:
- Name the five elements of an effective prompt and apply each one
- Explain where skills live and how scope (project, personal, global) affects sharing
- Create a working skill from scratch using the RTCCO framework
- Test and iterate on a skill until it produces consistent, useful output
- Use `skill-creator` to scaffold or refine a skill

---

## Recap and Homework Share (10 min)

> "Show us the documentation task you picked. What does 'done well' look like for that task?"

3–4 participants share. The class identifies which elements of the RTCCO framework are already present in their descriptions. (Most writers naturally include Role and Task. Few include Constraints or Output Format — yet.)

That paragraph you wrote for homework is the seed of the skill you'll build later in this module.

---

## The Prompt-to-Skill-to-Agent Spectrum (5 min)

```
Simple ──────────────────────────────────────────────── Complex

One-off Prompt           Skill (Reusable)           Agent (Autonomous)

"Fix this typo"          /check-api-doc             Full automation
                         (your checklist,           (discovers + validates
                          every time)                + fixes + publishes)

Low effort               Medium effort              High capability
Zero reuse               High reuse                 Needs oversight
Inconsistent             Consistent                 Most powerful
```

**Your goal this module:** Move one concrete task from "one-off prompt" to a reusable skill.

You are not building agents or MCP servers yet — that's Modules 6–7. Skills are the sweet spot right now: low barrier, high reuse, and they leverage the documentation expertise you already have.

---

## Prompt Engineering Fundamentals (25 min)

### The RTCCO Framework

Every effective prompt for documentation work contains five elements:

| Element | What It Does | Weak Example | Strong Example |
|---------|-------------|--------------|---------------|
| **R**ole | Sets the AI's perspective and expertise | *(missing)* | "You are a senior technical editor specializing in API documentation" |
| **T**ask | What the AI should do | "Review this" | "Review this API endpoint doc for completeness and style" |
| **C**ontext | Background the AI needs | *(missing)* | "Our audience is junior developers. We follow the Google Developer Style Guide." |
| **C**onstraints | Boundaries and rules | *(missing)* | "Do NOT modify code samples. Flag issues in prose only." |
| **O**utput format | How the result should look | *(missing)* | "Output a markdown table: Issue \| Location \| Severity \| Fix" |

> **🔵 Beginner Tip:** Most beginners skip Context and Output Format. Those two elements are what make the difference between "interesting AI response" and "consistently useful AI output."

### Prompt Quality Comparison

**Weak prompt (no RTCCO):**
```
Review this file.
```

**Better prompt (partial RTCCO — Role + Task):**
```
You are a technical editor.
Review this API documentation for completeness.
```

**Strong prompt (full RTCCO):**
```
You are a senior technical editor with 10 years of experience writing API 
documentation for developer audiences.

Review this API endpoint documentation for completeness.

Context: Our readers are primarily junior developers. We follow the Google 
Developer Style Guide. Code samples are written by engineers and should not 
be modified.

Check for these required sections:
1. Endpoint description (what it does, when to use it)
2. Authentication requirements
3. Request parameters (name, type, required/optional, description)
4. Response format (fields, types, descriptions)
5. Error codes (code, meaning, resolution)
6. A working example (request + response)

Constraints:
- Do NOT modify code samples
- Do NOT add sections — only report on what is present or missing

Output format:
| Section | Status | Finding | Recommended Fix |
|---------|--------|---------|----------------|
```

Ask yourself: which version would you trust on a real doc review?

---

## What Agent Skills Are (5 min)

An **Agent Skill** (also called a custom slash command in Claude Code) is a reusable prompt template stored as a markdown file. When you run `/skill-name`, the skill's content is injected into the conversation as instructions — giving the AI a specialized persona and checklist for that task.

Skills do **not** run code themselves. They guide the AI's behavior. The power comes from combining clear natural-language instructions with the AI's built-in tools (file read, search, and so on).

The rule to remember: **use skills for AI judgment, use MCP tools for deterministic logic.**

---

## Where Skills Live (5 min)

| Scope | Claude Code path | Cursor path | Commit to Git? |
|-------|-----------------|-------------|---------------|
| **Project** (team-shared) | `.claude/commands/<name>.md` | `.cursor/skills/<name>/SKILL.md` | ✅ Yes |
| **Agent Skill** (project) | `.claude/skills/<name>/SKILL.md` | — | ✅ Yes |
| **Personal** (you only, one project) | `.claude/commands/user/<name>.md` | — | ❌ No |
| **Global** (all projects) | `~/.claude/skills/<name>/SKILL.md` | `~/.cursor/skills/<name>/SKILL.md` | N/A |

> **🔵 Beginner Tip:** Start with a **project skill** so your team can use it. If you use personal project skills in Claude Code, add `.claude/commands/user/` to `.gitignore`.

When skill names conflict in Claude Code, **project skills win** over global skills.

Decide now, for the skill you're about to build: project, personal, or global?

---

## Two Skill Formats (5 min)

**Format A — Quick project command.** Fastest to write, and a good choice for your first skill:

```
your-project/
└── .claude/
    └── commands/
        └── check-api-doc.md    ← filename becomes the /command name
```

No frontmatter required. The filename is the command.

**Format B — Agent Skill folder.** Recommended when you want to share the skill or have the AI auto-discover it:

```
your-project/
└── .claude/
    └── skills/
        └── check-api-doc/
            └── SKILL.md        ← name + description in frontmatter
```

Format B is the successor to Format A. Anthropic's `skill-creator` produces Format B. Format A still works and is fine for quick one-file prompts.

Global skills (Format B in `~/.claude/skills/` or `~/.cursor/skills/`) **require** `name` and `description` frontmatter.

---

## Anatomy of a Skill File (10 min)

RTCCO is what goes *inside* the file. Here is the same skill written both ways.

**Format A** — `.claude/commands/check-api-doc.md`:

```markdown
You are a senior technical editor specializing in API documentation.        ← ROLE

Review the API documentation file at: $ARGUMENTS                           ← TASK + INPUT

Context:
- Our audience is junior to mid-level developers
- We follow the Google Developer Style Guide
- This documentation is part of a developer portal                          ← CONTEXT

Check for these required sections:
1. Endpoint description
2. Authentication
3. Request parameters (name, type, required/optional, description)
4. Response format
5. Error codes
6. A working code example

Constraints:
- Do NOT suggest changes to code samples
- Report on presence/absence, not on accuracy
- Do not add a preamble or commentary                                       ← CONSTRAINTS

Output format:
| Section | Status | Finding | Fix |
|---------|--------|---------|-----|

After the table, provide a one-sentence summary: "This document is [ready/needs minor work/needs major revision] because..."
```

**Format B** — `.claude/skills/check-api-doc/SKILL.md`:

```markdown
---
name: check-api-doc
description: Review API endpoint documentation for required sections and report gaps in a markdown table. Use when checking API doc completeness.
---

You are a senior technical editor specializing in API documentation.

Review the API documentation file at: $ARGUMENTS

Context:
- Our audience is junior to mid-level developers
- We follow the Google Developer Style Guide

[... same checklist, constraints, and output format as above ...]
```

For more starting points, see [`resources/skill-templates.md`](../../resources/skill-templates.md) (six copy-paste templates) and the working examples in `sample-project/.claude/commands/`.

### The `$ARGUMENTS` Variable

`$ARGUMENTS` is the placeholder for whatever you type after the command. When you run `/check-api-doc sample-project/test-docs/bad-api-doc.md`, that path becomes `$ARGUMENTS`. This is what makes the skill work on any file, every time.

Without `$ARGUMENTS`, a skill is a one-trick pony. With it, the skill is reusable infrastructure.

---

## Build Your First Skill: Workshop (25 min)

Extended exercises live in [WORKSHOP.md](./WORKSHOP.md). The short version:

### Step 1: Create the Skills Folder (5 min)

```bash
mkdir -p .claude/commands
```

Cursor users: run `mkdir -p .cursor/skills/check-api-doc` and create `SKILL.md` inside it.

### Step 2: Create Your Skill File (15 min)

Create `.claude/commands/check-api-doc.md` using RTCCO. Start from this template — or copy **Template 1** from [`resources/skill-templates.md`](../../resources/skill-templates.md):

```markdown
You are a [ROLE — be specific about expertise and domain].

Review the documentation at: $ARGUMENTS

Context:
- [WHO reads this documentation]
- [WHAT style guide we follow]
- [ANY other context the AI needs to do this well]

Checklist:
1. [Criterion 1] — [what PASS looks like]
2. [Criterion 2] — [what PASS looks like]
3. [Criterion 3] — [what PASS looks like]
4. [Add as many as your task requires]

Constraints:
- [What the AI must NOT do]
- [Any scope limitations]

Output:
[Describe exactly what the output should look like — table, list, report, etc.]
```

Adapt it to the task you described in your homework.

### Step 3: Test Your Skill (5 min)

```
/check-api-doc sample-project/test-docs/bad-api-doc.md
```

Evaluate the output:
- Did it catch the issues you expected?
- Did it generate false positives?
- Is the output format usable?

---

## Iterate: Common First-Round Fixes (10 min)

Pick one thing that didn't work in your test and fix it. These are the usual suspects:

| Problem | Fix |
|---------|-----|
| Role was too vague | Make it specific: "senior technical editor specializing in REST API documentation" |
| Output was unstructured | Add an explicit table or list format |
| AI added too much commentary | Add: "Output ONLY the table. No preamble." |
| Criteria were ambiguous | Describe what PASS looks like, not just the criterion name |
| False positives | Narrow the scope in Constraints |

Apply one fix, rerun the skill, and note what improved.

---

## Using Skills in VS Code and Cursor (5 min)

| Environment | How to invoke |
|-------------|--------------|
| **Claude Code** (terminal or VS Code extension) | Type `/` to list skills, then `/check-api-doc path/to/file.md` |
| **VS Code** | Open the Claude Code panel (Cmd+Shift+P → "Claude Code: Open"), then type `/` in chat |
| **Cursor** | Skills in `.cursor/skills/` are available to the agent; with Claude Code in the integrated terminal, use `/` as above |

Skills are picked up automatically when you add or remove files — no restart needed. Run `/` once to confirm your new skill appears in the list.

---

## Tips: Do and Don't (5 min)

| ✅ Do | ❌ Don't |
|-------|---------|
| Be specific with Role | Write code inside skills — use MCP tools |
| Set output format explicitly | Exceed ~500 words — split into multiple skills |
| Use `$ARGUMENTS` for file input | Duplicate deterministic tool logic |
| One skill = one task | Leave constraints open-ended |

If a skill is getting long, that's a signal to break it into composable skills (for example, `/check-api-doc` plus `/style-check` chained in a workflow — Module 5 territory).

---

## Level Up: The `skill-creator` Tool (20 min — optional if time is short)

You just built a skill by hand — that's the foundation, and you should always understand what's happening underneath. Now meet the tool that automates the busywork: **`skill-creator`**, an official Claude skill from Anthropic.

`skill-creator` interviews you about the task, scaffolds a well-structured skill file, and can improve or test an existing skill (it even runs evals to measure how reliably your skill triggers and performs).

> **🔵 Beginner Tip:** Think of RTCCO as learning to cook, and `skill-creator` as a sous-chef. You still decide the recipe — the tool handles the prep work and plating.

### Step 1: Install it (one time)

`skill-creator` ships in Anthropic's official plugin marketplace (`claude-plugins-official`), which Claude Code registers automatically. Install it in one command:

```
/plugin install skill-creator@claude-plugins-official
```

Or install it interactively:

```
/plugin
→ open the Discover tab
→ search for "skill-creator"
→ select it and press Enter
→ choose User scope (available in all your projects) or Project scope (this repo only)
```

> If you don't see the `/plugin` command, update Claude Code to the latest version.

### Step 2: Use it

Run the skill and describe the documentation task you want to automate:

```
/skill-creator
```

Then answer its questions in plain language, for example:

> "I want a skill that reviews an API endpoint doc for the six required sections and reports what's missing in a markdown table."

`skill-creator` scaffolds the new skill for you, applying the same RTCCO structure you learned by hand.

### Step 3: Know what it produces

`skill-creator` writes a Format B Agent Skill — a folder with a `SKILL.md` file inside:

```
.claude/
  skills/
    check-api-doc/
      SKILL.md        ← name + description frontmatter, then instructions
```

| | Format A | Format B |
|--|----------|----------|
| **Location** | `.claude/commands/<name>.md` | `.claude/skills/<name>/SKILL.md` |
| **Frontmatter** | Optional | `name` + `description` (so Claude knows when it applies) |
| **How it runs** | You type `/<name>` | `/<name>` **or** auto-invoked when relevant |
| **Extra files** | Single file | Can bundle helper files in the skill folder |

### Step 4: Refine with it

Point `skill-creator` at a skill you already built and ask it to tighten the description, add constraints, or run an eval. This is the fastest way to fix the first-round problems listed above.

---

## Discussion and Wrap-Up (10 min)

### Reflection Questions

1. What was the hardest element of the RTCCO framework to write? (Usually: Constraints)
2. What surprised you about the AI's interpretation of your prompt?
3. How is writing a skill different from writing a procedure for a human reader?
4. Would you commit your skill to Git for the team, or keep it personal? Why?

---

## Homework (Before Module 4)

1. **Refine** your `/check-api-doc` skill until it consistently produces output you'd use at work
2. **Build one more skill** from scratch — pick any task (templates in [`resources/skill-templates.md`](../../resources/skill-templates.md)):
   - `/style-check` — check a doc against your style guide rules
   - `/release-notes` — generate release notes from a changelog or git log
   - `/glossary-check` — flag terms that should be in a glossary
3. **Install `skill-creator`** (`/plugin install skill-creator@claude-plugins-official`) and use it to build or refine one skill. Compare its output to the one you hand-wrote.
4. **Browse** the example skills in `sample-project/.claude/commands/` — run `/style-check` on `bad-api-doc.md` and compare the output to your own skill
5. Come to Module 4 with at least one skill ready — you'll bundle it into a plugin and publish it for the team to install

---

## 🔵 Beginner Checklist

Before moving to Module 4, confirm you can:

- [ ] Name the five RTCCO elements from memory
- [ ] Explain why `$ARGUMENTS` makes a skill reusable
- [ ] Choose the right skill scope (project, personal, or global) for a given use case
- [ ] Build a skill file from a blank markdown file
- [ ] Test a skill and iterate based on output quality
- [ ] Identify which RTCCO element is weakest in a given prompt
- [ ] Install `skill-creator` and use it to scaffold a skill
- [ ] Explain the difference between Format A (`.claude/commands/*.md`) and Format B (`.claude/skills/<name>/SKILL.md`)
