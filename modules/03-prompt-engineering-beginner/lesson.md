# Module 3: Prompt Engineering for Documentation Professionals
## 🔵 Beginner Level

**Duration:** 2 hours | **Prerequisite:** Modules 1–2 | **Tech Writer's Tribe**

**Slides:** [`slides/module-03-prompt-engineering.html`](../../slides/module-03-prompt-engineering.html) (18 slides — share with audience)

**Companion doc:** [WORKSHOP.md](./WORKSHOP.md) — extended hands-on exercises for VS Code, Cursor, and Claude Code

---

## Slide Map

| Slide | Title | Time |
|-------|-------|------|
| 1 | Title | 2 min |
| 2 | Quick Recap: Module 2 | 10 min |
| 3 | The Prompt → Skill → Agent Spectrum | 5 min |
| 4 | The RTCCO Framework | 15 min |
| 5 | Prompt Quality Comparison | 10 min |
| 6 | What Are Agent Skills? | 5 min |
| 7 | Where Skills Live | 5 min |
| 8 | Format A vs Format B | 5 min |
| 9 | Skill Anatomy (RTCCO in Practice) | 5 min |
| 10 | The $ARGUMENTS Variable | 3 min |
| 11 | Workshop: Build Your First Skill | 25 min |
| 12 | Common First-Round Fixes | 10 min |
| 13 | Using Skills in VS Code & Cursor | 5 min |
| 14 | Tips: Do & Don't | 5 min |
| 15 | Level Up: `skill-creator` | 20 min |
| 16 | Discussion | 10 min |
| 17 | Before Module 4 (Homework) | 5 min |
| 18 | Beginner Checkpoint | 5 min |

**Learning objectives** (say on Slide 1, not on screen):

By the end of Module 3, participants will be able to:
- Name the five elements of an effective prompt and apply each one
- Explain where skills live and how scope (project, personal, global) affects sharing
- Create a working skill from scratch using the RTCCO framework
- Test and iterate on a skill until it produces consistent, useful output
- Use `skill-creator` to scaffold or refine a skill

---

## Slide 1 — Title (2 min)

**Audience sees:** Prompt Engineering · Module 3 of 8 · 🔵 Beginner · Skills Workshop

**Facilitator notes:**

**Beginner** means participants understand AI and MCP conceptually and are now ready to *build*. This module is where they write their first Agent Skill. They should leave with a working, reusable tool they can use on Monday morning.

Open the slide deck. Confirm everyone can run Claude Code or Cursor with access to this repo.

---

## Slide 2 — Quick Recap: Module 2 (10 min)

**Audience sees:** MCP recap bullets + homework prompt

**Facilitator notes:**

> "Show us the documentation task you picked. What does 'done well' look like for that task?"

3–4 participants share. As they describe their tasks, identify which RTCCO elements are already present. (Most writers naturally include Role and Task. Few include Constraints or Output Format — yet.)

Bridge to today: that paragraph they wrote is the seed of the skill they'll build in Slide 11.

---

## Slide 3 — The Prompt → Skill → Agent Spectrum (5 min)

**Audience sees:** Simple → Complex spectrum diagram

**Facilitator notes:**

Emphasize: **Your goal today is to move one concrete task from "one-off prompt" to a reusable skill.**

They are not building agents or MCP servers today — that's Modules 6–7. Skills are the sweet spot: low barrier, high reuse, leverages their documentation expertise.

---

## Slide 4 — The RTCCO Framework (15 min)

**Audience sees:** Five-element table (Role, Task, Context, Constraints, Output format)

**Facilitator notes:**

Walk through each element with documentation examples:

| Element | What It Does | Weak Example | Strong Example |
|---------|-------------|--------------|---------------|
| **R**ole | Sets the AI's perspective and expertise | *(missing)* | "You are a senior technical editor specializing in API documentation" |
| **T**ask | What the AI should do | "Review this" | "Review this API endpoint doc for completeness and style" |
| **C**ontext | Background the AI needs | *(missing)* | "Our audience is junior developers. We follow the Google Developer Style Guide." |
| **C**onstraints | Boundaries and rules | *(missing)* | "Do NOT modify code samples. Flag issues in prose only." |
| **O**utput format | How the result should look | *(missing)* | "Output a markdown table: Issue \| Location \| Severity \| Fix" |

> **🔵 Beginner Tip:** Most beginners skip Context and Output Format. Those two elements are what make the difference between "interesting AI response" and "consistently useful AI output."

---

## Slide 5 — Prompt Quality Comparison (10 min)

**Audience sees:** Weak → Partial → Strong prompt examples

**Facilitator notes:**

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

Ask: "Which version would you trust on a real doc review?"

---

## Slide 6 — What Are Agent Skills? (5 min)

**Audience sees:** Definition + 3-step how-it-works + skills vs MCP tools

**Facilitator notes:**

An **Agent Skill** (also called a custom slash command in Claude Code) is a reusable prompt template stored as a markdown file. When you run `/skill-name`, the skill's content is injected into the conversation as instructions — giving the AI a specialized persona and checklist for that task.

Skills do **not** run code themselves. They guide the AI's behavior. The power comes from combining clear natural-language instructions with the AI's built-in tools (file read, search, etc.).

Reinforce the rule on screen: **Use skills for AI judgment. Use MCP tools for deterministic logic.**

---

## Slide 7 — Where Skills Live (5 min)

**Audience sees:** Scope table (Project, Agent Skill, Personal, Global) with Claude Code + Cursor paths

**Facilitator notes:**

| Scope | Claude Code path | Cursor path | Commit to Git? |
|-------|-----------------|-------------|---------------|
| **Project** (team-shared) | `.claude/commands/<name>.md` | `.cursor/skills/<name>/SKILL.md` | ✅ Yes |
| **Agent Skill** (project) | `.claude/skills/<name>/SKILL.md` | — | ✅ Yes |
| **Personal** (you only, one project) | `.claude/commands/user/<name>.md` | — | ❌ No |
| **Global** (all projects) | `~/.claude/skills/<name>/SKILL.md` | `~/.cursor/skills/<name>/SKILL.md` | N/A |

> **🔵 Beginner Tip:** Start with a **project skill** so the team can use it. Add `.claude/commands/user/` to `.gitignore` if using personal project skills in Claude Code.

When skill names conflict in Claude Code, **project skills win** over global skills.

Ask: "For the skill you're building today — project, personal, or global?"

---

## Slide 8 — Format A vs Format B (5 min)

**Audience sees:** Comparison table + "Start with Format A today"

**Facilitator notes:**

**Format A — Quick project command** (fastest to write; great for first skill):

```
your-project/
└── .claude/
    └── commands/
        └── check-api-doc.md    ← filename becomes the /command name
```

No frontmatter required. The filename is the command.

**Format B — Agent Skill folder** (recommended for sharing or auto-discovery):

```
your-project/
└── .claude/
    └── skills/
        └── check-api-doc/
            └── SKILL.md        ← name + description in frontmatter
```

Format B is the successor to Format A. Anthropic's `skill-creator` (Slide 15) produces Format B. Format A still works and is fine for quick one-file prompts.

Global skills (Format B in `~/.claude/skills/` or `~/.cursor/skills/`) **require** `name` and `description` frontmatter.

---

## Slide 9 — Skill Anatomy (RTCCO in Practice) (5 min)

**Audience sees:** Annotated RTCCO skeleton + pointers to templates and examples

**Facilitator notes:**

**Format A example** — `.claude/commands/check-api-doc.md`:

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

**Format B example** — `.claude/skills/check-api-doc/SKILL.md`:

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

Point participants to [`resources/skill-templates.md`](../../resources/skill-templates.md) (six copy-paste templates) and `sample-project/.claude/commands/` (working examples).

---

## Slide 10 — The $ARGUMENTS Variable (3 min)

**Audience sees:** `$ARGUMENTS` example + `/check-api-doc path/to/my-api.md`

**Facilitator notes:**

`$ARGUMENTS` is the placeholder for whatever the user types after the command. When you run `/check-api-doc sample-project/test-docs/bad-api-doc.md`, the path becomes `$ARGUMENTS`. This makes the skill work on any file, every time.

Without `$ARGUMENTS`, the skill is a one-trick pony. With it, the skill is reusable infrastructure.

---

## Slide 11 — Workshop: Build Your First Skill (25 min)

**Audience sees:** Four-step workshop (mkdir → create → test → iterate)

**Facilitator notes:**

Follow [WORKSHOP.md](./WORKSHOP.md) for extended exercises. Run these steps live:

**Step 1: Create the Skills Folder (5 min)**

```bash
mkdir -p .claude/commands
```

Cursor users: `mkdir -p .cursor/skills/check-api-doc` and create `SKILL.md` inside.

**Step 2: Create Your Skill File (15 min)**

Create `.claude/commands/check-api-doc.md` using RTCCO. Or copy **Template 1** from [`resources/skill-templates.md`](../../resources/skill-templates.md):

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

Circulate. Help participants adapt the template to the task they shared on Slide 2.

**Step 3: Test Your Skill (5 min)**

```
/check-api-doc sample-project/test-docs/bad-api-doc.md
```

Evaluate together:
- Did it catch the issues you expected?
- Did it generate false positives?
- Is the output format usable?

**Step 4:** Tell them iteration continues on Slide 12.

---

## Slide 12 — Common First-Round Fixes (10 min)

**Audience sees:** Problem → Fix table

**Facilitator notes:**

Pick one thing that didn't work in Step 3 and fix it live. Common first-round fixes:

| Problem | Fix |
|---------|-----|
| Role was too vague | Make it specific: "senior technical editor specializing in REST API documentation" |
| Output was unstructured | Add an explicit table or list format |
| AI added too much commentary | Add: "Output ONLY the table. No preamble." |
| Criteria were ambiguous | Describe what PASS looks like, not just the criterion name |
| False positives | Narrow the scope in Constraints |

Give participants 5–7 minutes to apply one fix, then quick share: "What did you change and what improved?"

---

## Slide 13 — Using Skills in VS Code & Cursor (5 min)

**Audience sees:** IDE invocation steps + auto-detection bullets

**Facilitator notes:**

| Environment | How to invoke |
|-------------|--------------|
| **Claude Code** (terminal or VS Code extension) | Type `/` to list skills, then `/check-api-doc path/to/file.md` |
| **VS Code** | Open Claude Code panel (Cmd+Shift+P → "Claude Code: Open") → type `/` in chat |
| **Cursor** | Skills in `.cursor/skills/` are available to the agent; with Claude Code in the integrated terminal, use `/` as above |

Skills are picked up automatically when you add or remove files — no restart needed.

Have everyone run `/` once to confirm their new skill appears in the list.

---

## Slide 14 — Tips: Do & Don't (5 min)

**Audience sees:** Do / Don't table

**Facilitator notes:**

Reinforce before they leave the workshop portion:

| ✅ Do | ❌ Don't |
|-------|---------|
| Be specific with Role | Write code inside skills — use MCP tools |
| Set output format explicitly | Exceed ~500 words — split into multiple skills |
| Use `$ARGUMENTS` for file input | Duplicate deterministic tool logic |
| One skill = one task | Leave constraints open-ended |

If a skill is getting long, that's a signal to break it into composable skills (e.g., `/check-api-doc` + `/style-check` chained in a workflow — Module 5 territory).

---

## Slide 15 — Level Up: `skill-creator` (20 min)

**Audience sees:** Install command + `/skill-creator` + sous-chef quote

**Facilitator notes:**

You just built a skill by hand — that's the foundation. Now meet the tool that automates the busywork: **`skill-creator`**, an official Claude skill from Anthropic.

`skill-creator` interviews you about the task, scaffolds a well-structured skill file, and can improve or test an existing skill (it even runs evals to measure how reliably your skill triggers and performs).

> **🔵 Beginner Tip:** Think of RTCCO as learning to cook, and `skill-creator` as a sous-chef. You still decide the recipe — the tool handles the prep work and plating.

**Install (one time):**

```
/plugin install skill-creator@claude-plugins-official
```

Or interactively: `/plugin` → Discover → search "skill-creator" → User or Project scope.

> If `/plugin` is missing, update Claude Code to the latest version.

**Use it:**

```
/skill-creator
```

Example prompt: *"I want a skill that reviews an API endpoint doc for the six required sections and reports what's missing in a markdown table."*

**What it produces** (Format B):

```
.claude/
  skills/
    check-api-doc/
      SKILL.md        ← name + description frontmatter, then instructions
```

| | Format A | Format B |
|--|----------|----------|
| **Location** | `.claude/commands/<name>.md` | `.claude/skills/<name>/SKILL.md` |
| **Frontmatter** | Optional | `name` + `description` |
| **How it runs** | You type `/<name>` | `/<name>` or auto-invoked |
| **Extra files** | Single file | Can bundle helpers |

**Refine with it:** Point `skill-creator` at a skill already built and ask it to tighten the description, add constraints, or run an eval.

Optional live demo if time allows.

---

## Slide 16 — Discussion (10 min)

**Audience sees:** Four reflection questions

**Facilitator notes:**

1. What was the hardest element of the RTCCO framework to write? (Usually: Constraints)
2. What surprised you about the AI's interpretation of your prompt?
3. How is writing a skill different from writing a procedure for a human reader?
4. Would you commit your skill to Git for the team, or keep it personal? Why?

Leave 2–3 minutes for open Q&A.

---

## Slide 17 — Before Module 4 / Homework (5 min)

**Audience sees:** Five homework items

**Facilitator notes:**

1. **Refine** your `/check-api-doc` skill until it consistently produces output you'd use at work
2. **Build one more skill** from scratch — pick any task (templates in [`resources/skill-templates.md`](../../resources/skill-templates.md)):
   - `/style-check` — check a doc against your style guide rules
   - `/release-notes` — generate release notes from a changelog or git log
   - `/glossary-check` — flag terms that should be in a glossary
3. **Install `skill-creator`** and use it to build or refine one skill. Compare its output to the one you hand-wrote.
4. **Browse** the example skills in `sample-project/.claude/commands/` — run `/style-check` on `bad-api-doc.md` and compare output to your own skill
5. Come to Module 4 with at least one skill ready — you'll bundle it into a plugin and publish it for the team to install

---

## Slide 18 — Beginner Checkpoint (5 min)

**Audience sees:** Checklist + "Next: Module 4 — Sharing Your Skills"

**Facilitator notes:**

Before moving to Module 4, confirm participants can:

- [ ] Name the five RTCCO elements from memory
- [ ] Explain why `$ARGUMENTS` makes a skill reusable
- [ ] Choose the right skill scope (project, personal, or global) for a given use case
- [ ] Build a skill file from a blank markdown file
- [ ] Test a skill and iterate based on output quality
- [ ] Identify which RTCCO element is weakest in a given prompt
- [ ] Install `skill-creator` and use it to scaffold a skill
- [ ] Explain the difference between Format A (`.claude/commands/*.md`) and Format B (`.claude/skills/<name>/SKILL.md`)

Quick thumbs-up/thumbs-down on each item. Note any gaps for follow-up in Module 4 opening.
