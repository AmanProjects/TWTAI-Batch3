# Module 4: Sharing Your Skills — Marketplaces & Plugins
## 🟡 Intermediate Level

**Duration:** 2 hours | **Prerequisite:** Modules 1–3 | **Tech Writer's Tribe**

---

## What This Level Means

**Intermediate** means you've built skills and they work — on *your* machine. This module is about the moment a skill stops being a personal trick and becomes a team capability. You'll learn Claude Code's plugin system: how to **install** other people's skills and how to **publish** your own so the whole team runs the same checklist the same way.

### Intermediate Learning Objectives

By the end of Module 4, you will be able to:
- Explain the **marketplace → plugin → component** hierarchy in plain language
- Tell the difference between a command, a skill, an agent, a hook, and an MCP server inside a plugin
- Install a marketplace and a plugin as an individual
- Bundle your own skills into a plugin and publish a marketplace on GitHub
- Help a teammate add your marketplace and run your skills

---

## Recap and Homework Share (15 min)

> "Show us the skill you built! Now — how would someone *else* run it?"

3–4 volunteers demo a skill. Then the key question for today:

- Right now your skill lives in *your* `.claude/` folder. If a teammate wanted it, what would you do — email them the file? Paste it in Slack?
- What breaks when five people each keep their own copy?

That problem — **distribution and consistency** — is what this module solves.

---

## Why Sharing Matters (10 min)

A skill on one laptop helps one person. The same skill, shared, helps the whole team — and everyone applies the *same* standard the same way.

| Without sharing | With sharing |
|-----------------|--------------|
| Each writer keeps a private copy | One source of truth, installed by everyone |
| Copies drift out of sync | Update once; everyone gets it |
| "Which version is current?" | Versioned in Git |
| Onboarding = "here's a zip of my prompts" | Onboarding = two commands |

This is the **documentation scaling problem** from Module 2, solved for skills: institutional knowledge stops walking out the door because it's encoded, shared, and versioned.

---

## The Hierarchy (20 min)

Claude Code packages and distributes skills through a clear, three-level hierarchy. Learn these nouns and everything else follows.

```
Marketplace            ← a catalog (one GitHub repo) that lists plugins
  └── Plugin           ← a shareable bundle someone installs
        ├── Commands   ← slash-command skills you invoke (/check-style)
        ├── Skills     ← SKILL.md skills Claude can auto-invoke
        ├── Agents     ← subagents with their own prompt, tools & model
        ├── Hooks      ← event handlers (run on save, on commit, etc.)
        └── MCP servers ← real tools/data (local or a remote URL)
```

Read it top-down: **a marketplace contains plugins; a plugin bundles commands, skills, agents, and more.**

### The Four Nouns

| Term | What it is | Analogy |
|------|-----------|---------|
| **Marketplace** | A catalog file (`.claude-plugin/marketplace.json`) in a Git repo that lists one or more plugins | An app store |
| **Plugin** | A self-contained, installable bundle with a `.claude-plugin/plugin.json` manifest | An app |
| **Command** | A slash-command skill (a `.md` file in `commands/`) you invoke as `/name` | A button in the app |
| **Agent** | A subagent (a `.md` file in `agents/`) with its own prompt, tools, and model — spawned for a focused job | A specialist the app can call |

> **🟡 Key distinction:** A **marketplace ≠ a plugin.** The marketplace is the *catalog*; the plugin is the *thing you install*. One marketplace can list many plugins.

### What a plugin can bundle

A plugin is not limited to commands. At the plugin's root, Claude Code auto-discovers:

| Folder / file | What it adds |
|---------------|--------------|
| `commands/*.md` | Slash-command skills |
| `skills/<name>/SKILL.md` | Skills with a `description`, so Claude can auto-invoke them |
| `agents/*.md` | Subagents |
| `hooks/hooks.json` | Event handlers |
| `.mcp.json` | MCP servers (local programs or remote URLs) |

You decide how much to include — a plugin can be just one command, or all of the above.

---

## Command vs. Skill vs. Agent vs. Hook (20 min)

These four are easy to confuse because they're all "instructions Claude follows" — but each one differs in **who triggers it** and **how much isolation it gets**. We'll build one small example of each, using the same documentation task (style checking), so you can see them side by side. These are the *exact same four files* you'll find bundled into a real plugin later in this module (see "Anatomy of a Marketplace Repo" below) — so what you learn here is the plugin you'll be reading in twenty minutes.

### Command — you trigger it, it runs once

A **command** is a reusable instruction you run on demand by typing `/name`. It never runs unless you ask.

```markdown
# commands/check-style.md

You are a technical editor. Review the documentation file at: $ARGUMENTS

Check for:
- Active voice, second person ("you")
- Sentences under 25 words
- Headings in sentence case (not Title Case)

Output a table: Line | Issue | Fix
```

Usage: `/check-style docs/orders-api.md` — this is everything you built in Module 3.

### Skill — Claude can trigger it too

A **skill** (`SKILL.md`) is structurally almost the same file, but its YAML frontmatter adds a `description`. That description is what lets **Claude auto-invoke it** when your request matches, without you typing `/`.

```markdown
# skills/doc-coverage/SKILL.md
---
name: doc-coverage
description: Use when a code change might need matching documentation updates — compares a diff against the docs folder and flags undocumented additions.
---

Compare the code change at $ARGUMENTS against the documentation folder.
List every new or changed public function, endpoint, or config option that
has no corresponding documentation update.

Output: a checklist of undocumented items, one per line.
```

Usage: you can still type `/doc-coverage <diff>` — but you can also just say "does this PR need doc updates?" and Claude reads the description, recognizes the match, and loads the skill on its own.

### Agent — an isolated worker you delegate a whole job to

An **agent** (subagent) is different in kind, not just degree: it runs in its **own context window**, with its **own tool permissions and model**, and reports back only a summary. Use it for multi-step jobs, not single checks.

```markdown
# agents/doc-auditor.md
---
name: doc-auditor
description: Audits an entire documentation set for completeness and style. Use for multi-file jobs, not single-file checks.
tools: Read, Grep, Glob
model: sonnet
---

You are a documentation audit lead. Given a folder, read every file in it,
apply the team's style rules (active voice, sentence case headings, <25-word
sentences) and completeness rules (required sections present), and produce
one consolidated report ranked by severity. Do not paste full file contents
back — summarize.
```

Usage: "Use the doc-auditor agent to review everything in docs/." The agent can read dozens of files — even re-use the `check-style` logic internally — but your main conversation only sees the final report, not the file-by-file churn.

### Hook — fires automatically, no reasoning involved

A **hook** is the odd one out: it isn't "instructions Claude follows" at all, it's a **shell command Claude Code runs automatically** on a lifecycle event (a file edit, a session end, a tool call). No prompt, no reasoning — it fires the same way every time, which makes it the right tool for a rule that must never be skipped.

```json
// hooks/hooks.json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Reminder: run /check-style on this file before committing.'"
          }
        ]
      }
    ]
  }
}
```

This fires after *every* edit or file write — no exceptions, no chance Claude "forgets" to remind you.

### How the four connect

| | Who triggers it | Isolation | Best for |
|---|---|---|---|
| **Hook** | An event (edit, commit, session end) | None — just runs a command | Rules that must *always* fire, deterministically |
| **Command** | You, typing `/name` | Runs in your current conversation | A check you consciously run when you want it |
| **Skill** | You (`/name`) *or* Claude, automatically | Runs in your current conversation | "Whenever a request looks like X, apply this" |
| **Agent** | You, or Claude delegating | Its own context window | A multi-step job too big to run inline |

Put together, a realistic workflow chains all four: a **hook** nudges you after every edit → you (or Claude) run the **skill**/**command** to check one file → for a full pre-release sweep, you delegate to the **agent**, which does the heavy reading and hands back one report. All four ship together inside one **plugin**, and a **plugin** is what a **marketplace** distributes to your team — that's the packaging layer we build next.

**Namespacing.** Once bundled in a plugin, components are prefixed with the plugin name to avoid collisions. A `check-style` command in the `doc-skills` plugin is invoked as:

```
/doc-skills:check-style
```

---

## Installing — as an Individual (15 min)

Using a shared skill is two commands. Let's use the real example repo built for this program.

### Step 1: Add the marketplace (the catalog)

```
/plugin marketplace add AmanProjects/twtai-skill
```

You'll see `Successfully added marketplace: twtai`. GitHub shorthand (`owner/repo`) is the common form; these also work:

| Source | Syntax |
|--------|--------|
| GitHub repo | `/plugin marketplace add owner/repo` |
| GitHub repo at a branch/tag | `/plugin marketplace add owner/repo@v1.0` |
| Git URL (GitLab, etc.) | `/plugin marketplace add https://gitlab.com/team/plugins.git` |
| Local folder | `/plugin marketplace add ./my-marketplace` |

### Step 2: Install a plugin from it

Use `<plugin-name>@<marketplace-name>`. The name is the marketplace's `name` field (`twtai`), **not** the repo name (`twtai-skill`):

```
/plugin install doc-skills@twtai
```

Or browse interactively — run `/plugin`, open the **Discover** tab, pick a plugin, and choose a scope:
- **User** — available in all your projects (default)
- **Project** — shared with your team via `.claude/settings.json`
- **Local** — this repo only

### Step 3: Use it

After install, the plugin's components are live:

```
/doc-skills:check-style sample-docs/orders-api.md
```

Manage everything with `/plugin list`, `/plugin marketplace list`, `/plugin disable`, `/plugin uninstall`, and `/plugin marketplace update <name>` to pull the latest.

---

## Anatomy of a Marketplace Repo (15 min)

This is the **actual layout of `AmanProjects/twtai-skill`** — the repo you just added. One marketplace, one plugin, with a command, a skill, an agent, a hook, and (remote) MCP servers all wired together:

```
twtai-skill/                             ← the marketplace repo (on GitHub)
├── .claude-plugin/
│   └── marketplace.json                 ← the catalog
└── plugins/
    └── doc-skills/                       ← one plugin
        ├── .claude-plugin/
        │   └── plugin.json               ← the plugin manifest
        ├── commands/
        │   ├── check-style.md            ← a command (/doc-skills:check-style)
        │   └── release-notes.md          ← a command (/doc-skills:release-notes)
        ├── skills/
        │   └── doc-coverage/SKILL.md     ← a skill   (auto-invoked when relevant)
        ├── agents/
        │   └── doc-auditor.md            ← an agent  (delegated for big audits)
        ├── hooks/
        │   └── hooks.json                ← a hook    (nudges after edits)
        └── .mcp.json                     ← remote MCP servers (connect on install)
```

**`.claude-plugin/marketplace.json`** — the catalog:
```json
{
  "name": "twtai",
  "owner": { "name": "Tech Writer's Tribe" },
  "plugins": [
    {
      "name": "doc-skills",
      "source": "./plugins/doc-skills",
      "description": "Documentation commands, a skill, an agent, and remote MCP servers."
    }
  ]
}
```

**`plugins/doc-skills/.claude-plugin/plugin.json`** — the plugin manifest:
```json
{
  "name": "doc-skills",
  "version": "1.0.0",
  "description": "Documentation skills built in the TWT program.",
  "author": { "name": "Tech Writer's Tribe" }
}
```

> **🟡 Notes:**
> - Only `plugin.json` and `marketplace.json` go inside `.claude-plugin/`. Your `commands/`, `skills/`, `agents/`, `hooks/` folders live at the plugin **root**.
> - Skip `version` and the plugin auto-updates to the latest commit; set it to pin a release.
> - The marketplace's `name` is `twtai` — that's why you install with `doc-skills@twtai`, even though the repo is called `twtai-skill`.

---

## Workshop: Publish Your Own Marketplace (30 min)

Work in pairs. One of you publishes; the other installs. Then switch.

**Don't start from scratch — clone the example.** `AmanProjects/twtai-skill` is a complete, working version of this exact structure. Open it, copy the layout, and swap in the skill *you* built in Module 3.

### The 5-step loop

1. **Create a GitHub repo** (e.g. `your-name/my-skills`).
2. **Add `.claude-plugin/marketplace.json`** at the root, and pick a `name` for your marketplace.
3. **Add a plugin folder** with `.claude-plugin/plugin.json`, then drop your skill(s) into `commands/`.
4. **Commit and push.**
5. **Share two lines** with your partner (the `@name` is your marketplace's `name`, not the repo):
   ```
   /plugin marketplace add your-name/my-skills
   /plugin install my-plugin@my-marketplace
   ```

### Then your partner

- Runs those two lines.
- Invokes your namespaced command: `/my-plugin:your-skill <file>`.
- Reports back: did it work on *their* machine, first try?

That last step is the whole point — **a skill that runs identically on someone else's machine is a shared skill.**

---

## Lighter-Weight Sharing (10 min)

A full marketplace is the durable, scalable answer. But for quick cases:

| Situation | Lightweight option |
|-----------|--------------------|
| Share one skill with one person, once | Send the single `.md` file; they drop it in `.claude/commands/` |
| Share with your project team | Commit `.claude/commands/*.md` into the project repo — everyone who clones it gets the skills |
| Connect everyone to a hosted tool | Commit a project `.mcp.json` with a remote MCP server URL (no install) |

Reach for a **marketplace** when you want versioning, many skills, auto-updates, and one-command install for a wide audience.

---

## Discussion and Wrap-Up (10 min)

### Reflection Questions

1. What's one skill you'd publish first, and who's the audience?
2. When is a full marketplace overkill — and a committed `.claude/commands/` file enough?
3. What's the risk of a teammate auto-updating to your latest commit without review?

### The Key Takeaway

> "A skill on your laptop is a habit. A skill in a marketplace is a standard."

---

## Homework (Before Module 5)

1. **Publish** a marketplace: using `AmanProjects/twtai-skill` as a template, create your own GitHub repo with one plugin containing at least one of your skills. Push it.
2. **Get one teammate** to add your marketplace and install your plugin — confirm your skill runs on their machine.
3. **Read** the `peer-review-rubric.md` in the `resources/` folder — you'll use it in Module 5.

---

## 🟡 Intermediate Checklist

Before moving to Module 5, confirm you can:

- [ ] Explain the marketplace → plugin → command/agent hierarchy in your own words
- [ ] State the difference between a marketplace and a plugin
- [ ] Tell when to use a command vs. a skill vs. an agent vs. a hook
- [ ] Explain why a hook runs deterministically while a command/skill/agent all involve Claude reasoning
- [ ] Add a marketplace with `/plugin marketplace add`
- [ ] Install a plugin with `/plugin install <plugin>@<marketplace>`
- [ ] Lay out a marketplace repo: `marketplace.json`, a plugin folder, and `plugin.json`
- [ ] Publish your own marketplace on GitHub and have a teammate install it
