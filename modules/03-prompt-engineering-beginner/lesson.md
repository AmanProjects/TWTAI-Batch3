# Module 3: Prompt Engineering for Documentation Professionals
## 🔵 Beginner Level

**Duration:** 2 hours | **Prerequisite:** Modules 1–2 | **Tech Writer's Tribe**

---

## What This Level Means

**Beginner** means you understand AI and MCP conceptually and are now ready to *build*. This module is where you write your first Claude Skill. You'll leave with a working, reusable tool you can use on Monday morning.

### Beginner Learning Objectives

By the end of Module 3, you will be able to:
- Name the five elements of an effective prompt and apply each one
- Explain the anatomy of a Claude Skill file
- Create a working skill from scratch using the RTCCO framework
- Test and iterate on a skill until it produces consistent, useful output

---

## Recap and Homework Share (10 min)

> "Show us the documentation task you picked. What does 'done well' look like for that task?"

3–4 participants share. The class identifies which elements of the RTCCO framework are already present in their descriptions. (Most writers naturally include Role and Task. Few include Constraints or Output Format — yet.)

---

## The Prompt-to-Skill-to-Agent Spectrum (10 min)

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

---

## Prompt Engineering Fundamentals (30 min)

### The RTCCO Framework

Every effective prompt for documentation work contains five elements:

| Element | What It Does | Weak Example | Strong Example |
|---------|-------------|--------------|---------------|
| **R**ole | Sets the AI's perspective and expertise | *(missing)* | "You are a senior technical editor specializing in API documentation" |
| **T**ask | What the AI should do | "Review this" | "Review this API endpoint doc for completeness and style" |
| **C**ontext | Background the AI needs | *(missing)* | "Our audience is junior developers. We follow the Google Developer Style Guide." |
| **C**onstraints | Boundaries and rules | *(missing)* | "Do NOT modify code samples. Flag issues in prose only." |
| **O**utput format | How the result should look | *(missing)* | "Output a markdown table: Issue \| Location \| Severity \| Fix" |

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

> **🔵 Beginner Tip:** Most beginners skip Context and Output Format. Those two elements are what make the difference between "interesting AI response" and "consistently useful AI output."

---

## Anatomy of a Claude Skill File (15 min)

A Claude Skill is a `.md` file stored in `.claude/commands/`. Here's the anatomy:

```
.claude/
  commands/
    check-api-doc.md    ← This is your skill
```

### Skill File Structure

```markdown
# check-api-doc.md

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

### The `$ARGUMENTS` Variable

`$ARGUMENTS` is the magic placeholder. When you run `/check-api-doc path/to/my-api.md`, the filename becomes `$ARGUMENTS`. This makes your skill work on any file, every time.

---

## Build Your First Skill: Live Workshop (40 min)

### Step 1: Create the Skills Folder (5 min)

In your project directory (or any folder):

```bash
mkdir -p .claude/commands
```

### Step 2: Create Your Skill File (15 min)

Create `.claude/commands/check-api-doc.md` using the RTCCO framework.

Start with this template and fill in your details:

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

### Step 3: Test Your Skill (15 min)

In Claude Code, run:

```
/check-api-doc sample-project/test-docs/bad-api-doc.md
```

Evaluate the output:
- Did it catch the issues you expected?
- Did it generate false positives?
- Is the output format usable?

### Step 4: Iterate (5 min)

Pick one thing that didn't work and fix it. Common first-round fixes:
- Role was too vague → Make it more specific
- Output was unstructured → Add an explicit output format
- AI added too much commentary → Add "Output ONLY the table. No preamble."

---

## Level Up: The `skill-creator` Tool (20 min)

You just built a skill by hand — that's the foundation, and you should always understand what's happening underneath. Now meet the tool that automates the busywork: **`skill-creator`**, an official Claude skill from Anthropic.

`skill-creator` is a skill that helps you *create other skills*. It interviews you about the task, scaffolds a well-structured skill file for you, and can also improve or test an existing skill (it even runs evals to measure how reliably your skill triggers and performs).

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

`skill-creator` writes an **Agent Skill** — a folder with a `SKILL.md` file inside:

```
.claude/
  skills/
    check-api-doc/
      SKILL.md        ← name + description frontmatter, then instructions
```

This is slightly different from the single `.claude/commands/check-api-doc.md` file you wrote earlier:

| | Slash-command skill | Agent Skill (`skill-creator` output) |
|--|--------------------|--------------------------------------|
| **Location** | `.claude/commands/<name>.md` | `.claude/skills/<name>/SKILL.md` |
| **Frontmatter** | Optional | `name` + `description` (so Claude knows when it applies) |
| **How it runs** | You type `/<name>` | You type `/<name>` **or** Claude auto-invokes it when relevant |
| **Extra files** | Single file | Can bundle helper files in the skill folder |

Both create a `/<name>` command. `.claude/commands/` is the legacy format and still works, but Agent Skills (`.claude/skills/<name>/SKILL.md`) are the recommended successor — Anthropic is steering new work there. Use whichever fits: hand-write a quick `.claude/commands/*.md` for simple prompts; reach for `skill-creator` when you want structure, a description that auto-triggers, or built-in testing.

### Step 4: Refine with it

You can point `skill-creator` at a skill you already built and ask it to tighten the description, add constraints, or run an eval. This is the fastest way to fix the "Common First-Round Fixes" problems above.

---

## Discussion and Wrap-Up (10 min)

### Reflection Questions

1. What was the hardest element of the RTCCO framework to write? (Usually: Constraints)
2. What surprised you about the AI's interpretation of your prompt?
3. How is writing a skill different from writing a procedure for a human reader?

---

## Homework (Before Module 4)

1. **Refine** your `/check-api-doc` skill until it consistently produces output you'd use at work
2. **Build one more skill** from scratch — pick any task:
   - `/style-check` — check a doc against your style guide rules
   - `/release-notes` — generate release notes from a changelog or git log
   - `/glossary-check` — flag terms that should be in a glossary
3. **Install `skill-creator`** (`/plugin install skill-creator@claude-plugins-official`) and use it to build or refine one skill. Compare its output to the one you hand-wrote.
4. Come to Module 4 with at least one skill ready — you'll bundle it into a plugin and publish it for the team to install

---

## 🔵 Beginner Checklist

Before moving to Module 4, confirm you can:

- [ ] Name the five RTCCO elements from memory
- [ ] Explain why `$ARGUMENTS` makes a skill reusable
- [ ] Build a skill file from a blank markdown file
- [ ] Test a skill and iterate based on output quality
- [ ] Identify which RTCCO element is weakest in a given prompt
- [ ] Install `skill-creator` and use it to scaffold a skill
- [ ] Explain the difference between a `.claude/commands/*.md` skill and a `.claude/skills/<name>/SKILL.md` Agent Skill
