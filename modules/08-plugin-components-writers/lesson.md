# Module 8 (Writers' Track): Ship Your Standard as a Plugin

## 🟡 Intermediate

**Duration:** 2 hours | **Prerequisite:** Modules 3–4 (you've written a skill and published a marketplace)
**Who this is for:** technical writers, content designers, and docs leads who do **not** write code.

> **Choosing a track.** This is the writers' version of Module 8. You'll build and ship a real team plugin. If you write code and want the complete component reference — LSP servers, workflows, monitors, the manifest schema field by field, the Agent Plugins spec — take the [engineering track](../08-plugin-components/lesson.md) instead. Facilitators: run one, not both.

---

## The Problem This Solves

You wrote a style-check skill in Module 3. It's good. It's on your laptop.

Now picture your team:

- Priya has her own version with different rules
- Sam copied yours in March and it's four revisions out of date
- The new hire has none and doesn't know they exist
- Nobody knows which one is current

This is the **documentation scaling problem**, pointed at your own tooling. You've solved it for content — one source, versioned, published. Today you solve it for the AI instructions your team runs.

| Where you are | Where you'll be by 5pm |
|---|---|
| A skill on your laptop | A plugin your team installs in one command |
| "Email me the file" | `/plugin install house-style@your-team` |
| Five drifting copies | One source, versioned in Git |
| Update = re-email everyone | Update = push; everyone gets it |

### Learning objectives

By the end you will be able to:

- Explain what a plugin is and what belongs inside one — in plain language
- Pick the right piece for a job: **skill**, **command**, **agent**, **hook**, or **tool**
- Say why every extra piece costs your team tokens in **every** conversation
- Build, validate, and test a three-piece plugin
- Publish it and get a teammate running it
- Set up a value your teammates are *asked* for on install, instead of hand-editing files
- Understand why the industry is standardizing this, and what that means for the work you do today

### What you will *not* be asked to do

No language servers. No JSON-RPC. No JavaScript. No workflow scripts. You'll edit three small files, two of which are Markdown.

---

## Part 1: What's Actually in the Box (25 min)

A **plugin** is a folder someone installs. Inside it are pieces. There are thirteen possible kinds — and **you will use three**.

Here's the honest version of the list. The right-hand column is the one to read.

| Piece | What it is | Should you? |
|---|---|---|
| **Skill** | Saved instructions Claude can also start on its own | ✅ **Yes — this is the core** |
| **Command** | Saved instructions only *you* can start, by typing `/name` | ✅ Sometimes |
| **Agent** | A helper you hand a whole multi-file job to | ✅ For big sweeps |
| **Hook** | Something that fires automatically on an event | ✅ **Yes — for rules that must never be skipped** |
| **Tool** (`bin/`) | A small program Claude can run to get a *fact* | ✅ Yes, one is plenty |
| **MCP server** | A real program that gives Claude a new ability | 🟡 Module 6 territory |
| Output style | Changes how Claude writes while enabled | 🟡 Nice, optional |
| Theme | Terminal colours | ⬜ Cosmetic |
| LSP server, Workflow, Monitor, Settings, Channel | Engineering-track material | ⬜ Skip |

> **Cut this list down and it's simple:** *save your standard as a **skill**, make a **hook** remind people, and give Claude one **tool** so it stops guessing at facts.*

### The four you need to tell apart

Same job — checking a doc's style — done four different ways. The difference is **who starts it** and **how much room it gets**.

**1. Command — you start it, on purpose**

```markdown
Review the file at $ARGUMENTS against our style guide.
Output a table: Line | Issue | Fix.
```

You type `/check-style guide.md`. It never runs unless you ask. Good when you want deliberate control.

**2. Skill — you *or* Claude can start it**

```markdown
---
name: house-style
description: Use when reviewing any doc against our team's writing standard —
  sentence length, voice, heading case, banned words.
---
Review the Markdown file the user names…
```

Structurally almost identical. The difference is that `description`. It tells Claude *when this is relevant*, so you can say "does this page follow our standard?" and it loads the skill unprompted.

> **The description is a routing decision, not a summary.** Write *when to use this*, not *what this is*. "Checks style" tells Claude nothing about when to reach for it.

**3. Agent — a helper with its own desk**

```markdown
---
name: doc-auditor
description: Audits an entire documentation set. Use for multi-file sweeps,
  not single-file checks.
tools: Read, Grep, Glob
model: sonnet
---
Read every Markdown file in the folder. Apply our standard.
Return ONE report ranked by severity. Never paste file contents back.
```

Reads forty files, hands you one report. Your conversation stays clean. Use it when the job is too big to do inline.

**4. Hook — fires by itself, no thinking involved**

```json
{
  "hooks": {
    "PostToolUse": [
      { "matcher": "Write|Edit",
        "hooks": [{ "type": "command",
                    "command": "\"${CLAUDE_PLUGIN_ROOT}\"/scripts/nudge.sh" }] }
    ]
  }
}
```

This is the odd one out. It isn't instructions Claude follows — it's a small program that runs on an event, the same way every time. No judgment, no chance of being forgotten.

| | Who starts it | Can it be skipped? | Best for |
|---|---|---|---|
| **Hook** | An event | **No** | A rule that must always fire |
| **Command** | You typing `/name` | Yes | A check you run deliberately |
| **Skill** | You *or* Claude | Yes | "Whenever a request looks like X" |
| **Agent** | You, or Claude delegating | Yes | A job too big for the main chat |

> **🟡 The distinction that matters for governance:** a skill fires when Claude *judges* it relevant. A hook fires **always**. If your team has a rule that genuinely must never be skipped — a legal disclaimer, a required frontmatter field, a security review — that's a hook, not a skill. Everything a skill does is subject to a judgment call.

### The budget nobody tells you about

Here's the part most plugin authors get wrong.

> **Every skill, command, and agent description is loaded into *every single conversation* your team has — whether or not it ever fires.**

Ten skills means ten descriptions in the context window of every message, all day, for everyone who installed it. It's a standing cost.

You can see the number:

```bash
claude plugin details house-style
```

```
Component inventory
  Skills (1)  house-style
  Hooks (1)   PostToolUse   (harness-only — no model context cost)

Projected token cost
  Always-on:   ~90 tok   added to every session
```

**Always-on** is the tax. **On-invoke** is what you pay when it actually runs. Hooks and `bin/` tools are free until used — that's a real argument for using them.

> **The rule for the rest of this module:** *A plugin is a budget, not a bucket. Ship the three pieces that earn their place.*

---

## Part 2: Read a Real Plugin (15 min)

Two examples ship with this course. Open both — they teach opposite lessons.

### The one you'd actually build

[`house-style/`](house-style/) — three pieces, nothing else:

```
house-style/
├── .claude-plugin/plugin.json      ← the label on the box
├── skills/house-style/
│   ├── SKILL.md                    ← the standard itself
│   └── examples.md                 ← loaded ONLY when asked for
├── hooks/hooks.json                ← "remind me after every edit"
├── scripts/nudge.sh                ← what that reminder runs
└── bin/longest-sentence            ← a tool Claude can run by name
```

Run it right now:

```bash
cd modules/08-plugin-components-writers
claude --plugin-dir ./house-style
```

`--plugin-dir` loads a plugin for **one session** — no install, no publishing. It's the try-it-out loop: edit, restart, test.

Then inside the session:

```
/house-style ../08-plugin-components/fixture/needs-work.md
```

Now edit any `.md` file and watch the hook fire on its own.

### The one that shows you everything

[`../08-plugin-components/doc-toolkit/`](../08-plugin-components/doc-toolkit/) uses **all thirteen** component types at once. No sane team plugin does this. It exists so you can see them side by side.

**Open it and compare the two.** The contrast *is* the lesson: capability is easy, restraint is the skill.

### The four files that matter in `house-style`

**1. `SKILL.md` — your standard, written as instructions**

```markdown
---
name: house-style
description: Use when reviewing or editing any documentation page against our
  team's writing standard — checks sentence length, voice, heading case, and
  banned words. Trigger on "check this against our style guide".
---

## Our standard
1. Sentence length — nothing over ${user_config.max_sentence_words} words.
2. Voice — active, second person, present tense.
3. Headings — sentence case. Not Title Case.
4. Banned words — "simply", "just", "obviously", "easy", "note that".
5. Lists — parallel structure.

## What to produce
One table: Line | Rule | Current | Suggested rewrite.
End with: `N issues · longest sentence M words`.

## What not to do
- Do not rewrite the file. Propose; the writer decides.
- Do not flag anything inside a fenced code block.
```

**This is your style guide, written for a reader who does exactly what it says.** Notice what makes it work: numbered rules, an explicit output shape, and an explicit list of what *not* to do. That last section is what separates a skill that behaves from one that surprises you.

**2. `examples.md` — the long material, kept out of the way**

The before/after examples live in a *separate file* next to `SKILL.md`, and the skill says:

> Read that file only if the user asks what "good" looks like.

**This is the single most useful technique in the module.** `SKILL.md` costs tokens in every session. `examples.md` costs nothing until Claude actually opens it. Keep the rules in the skill; keep the worked examples, edge cases, and reference tables in sibling files.

You already do this. It's progressive disclosure — a quick-start page that links to the reference, not one 4,000-word page.

**3. `hooks/hooks.json` — the reminder**

Fires after every file edit. Runs `scripts/nudge.sh`, which is nine lines and reads like plain English:

```bash
event="$(cat)"                        # what just happened

if printf '%s' "$event" | grep -qE '\.(md|mdx)"'; then
  echo "house-style: a Markdown file changed — run /house-style before publishing."
fi
```

If you can read a conditional in a template language, you can read that.

**4. `bin/longest-sentence` — give Claude a fact**

```bash
$ longest-sentence needs-work.md
needs-work.md   51 words   In order to be able to successfully begin working…
```

Anything in `bin/` becomes a command Claude can run **by name** while the plugin is enabled.

> **🟡 Why this matters more than it looks.** Claude eyeballing "that sentence seems long" is a guess. Counting words is a fact. Every time you can replace a judgment with a measurement, do it — the review gets more consistent and you stop arguing with the model about whether 26 words is 26 words.

---

## Part 3: Build Your Own (35 min)

Work in pairs. One publishes, the other installs, then swap.

**The brief: one skill, one hook, one tool. Nothing else.**

### Step 1 — Scaffold it (3 min)

```bash
claude plugin init your-name-style --with skills hooks
```

That creates `~/.claude/skills/your-name-style/` with the folders already in place. It loads automatically next session with no install step at all.

**Or just copy the working one:**

```bash
cp -r modules/08-plugin-components-writers/house-style ~/.claude/skills/your-name-style
```

### Step 2 — Write the skill (15 min — this is the module)

Open `skills/<name>/SKILL.md`. Replace the rules with **your team's actual standard.**

Not a generic one. The rules you correct in review over and over.

| Section | What goes in it | Do this |
|---|---|---|
| `description` | *When* Claude should use this | Write the trigger phrase, not a summary |
| Your standard | 4–6 numbered rules | Specific and checkable. "Be concise" is not a rule. "Under 25 words" is. |
| What to produce | The exact output shape | Give it a table with named columns |
| What not to do | The failure modes you've seen | "Don't rewrite the file." "Don't skip code blocks." |

Then move your worked examples into a sibling `examples.md` and point at it from `SKILL.md`.

> **The test of a good rule:** could a new hire apply it without asking you a follow-up question? If not, the AI can't either.

### Step 3 — Add the hook (5 min)

Copy `hooks/hooks.json` and `scripts/nudge.sh` from `house-style`. Change the message to yours.

Make the script runnable — **this is the number-one reason hooks silently don't work:**

```bash
chmod +x scripts/nudge.sh
```

### Step 4 — Add a tool (5 min)

Copy `bin/longest-sentence`, or ask Claude:

```
Write me a bin/ script for this plugin that counts how many times our banned
words appear in a Markdown file. Keep it short and readable.
```

Then `chmod +x bin/<name>`.

### Step 5 — Check it (4 min)

```bash
claude plugin validate ~/.claude/skills/your-name-style --strict
claude plugin details your-name-style
```

`validate` catches typos and structural mistakes before anyone else sees them. **Run it every single time before you publish.** `--strict` turns warnings into failures — use it once you're confident.

`details` shows your always-on token cost. **Look at the number.** If it's higher than you expected, your descriptions are too long.

### Step 6 — Test it cold (3 min)

Hand your folder path to your partner:

```bash
claude --plugin-dir /path/to/your-name-style
```

Did it work on their machine, first try? That's the only test that counts.

---

## Part 4: Ask, Don't Make Them Edit Files (10 min)

Your skill has a number in it: 25 words. Priya's team says 30. Sam's legal docs allow 40.

Don't fork the plugin. **Ask on install.**

In `plugin.json`:

```json
"userConfig": {
  "max_sentence_words": {
    "type": "number",
    "title": "Max sentence length",
    "description": "Flag any sentence longer than this many words.",
    "default": 25,
    "min": 10,
    "max": 60
  }
}
```

Then use it in your skill:

```markdown
1. Sentence length — nothing over ${user_config.max_sentence_words} words.
```

When someone enables the plugin, Claude Code **prompts them** for the value and remembers it. Same plugin, their number.

| Type | Use it for |
|---|---|
| `string` | A style guide URL, a team name |
| `number` | Limits and thresholds |
| `boolean` | On/off switches |
| `directory` / `file` | "Where is your docs folder?" |

Add `"sensitive": true` for anything secret — an API token. It goes into the operating system's keychain, never into a settings file, and never into a Git repo.

> **Configuration is a documentation decision.** Every value you hardcode is a fork somebody has to maintain. Every value you ask for is a plugin one more team can adopt unchanged.

---

## Part 5: Ship It (20 min)

Module 4 covered this. Here's the short version plus the parts that bite.

### Three ways to distribute, in increasing order of effort

| Situation | Do this |
|---|---|
| **Just you, on this machine** | Leave it in `~/.claude/skills/<name>/`. It loads every session. Done. |
| **Your project team** | Commit the plugin folder into your docs repo. Everyone who clones gets it. |
| **A wide audience, versioned** | Publish a marketplace on GitHub (Module 4) |

For the third, add a `.claude-plugin/marketplace.json` at your repo root:

```json
{
  "name": "your-team",
  "owner": { "name": "Your Name" },
  "plugins": [
    {
      "name": "house-style",
      "source": "./house-style",
      "description": "Our team's writing standard."
    }
  ]
}
```

Push it. Your teammates then run two lines:

```
/plugin marketplace add your-org/your-repo
/plugin install house-style@your-team
```

> The `@your-team` part is the marketplace's **`name` field**, not the repo name. This trips up everyone once.

### The rules that will bite you

**1. The structural rule.** Only `plugin.json` goes inside `.claude-plugin/`. Every other folder — `skills/`, `hooks/`, `commands/`, `agents/`, `bin/` — sits at the **top level** of the plugin.

```
✅  house-style/skills/house-style/SKILL.md
❌  house-style/.claude-plugin/skills/house-style/SKILL.md
```

Get this wrong and the plugin loads but your skill is invisible. It's the most common mistake there is.

**2. Namespacing.** Once bundled, your skill is called by the plugin name too:

```
/house-style:house-style guide.md
```

Which is a reason to name the plugin and the skill differently.

**3. Versioning — pick one deliberately.**

| Approach | What happens | Choose it when |
|---|---|---|
| Put a `version` in `plugin.json` and bump it | Teammates update only when you bump | You want reviewed releases |
| Leave `version` out entirely | Teammates get every commit, automatically | Small team, active development |

There's a governance question hiding in that table: do you want your standard to change under people's feet, or on a release you announce? That's a documentation decision, and it's yours.

**4. Nothing outside the plugin folder.** When someone installs your plugin, only the plugin folder is copied. A path like `../shared/glossary.md` works on your machine and breaks on theirs. Everything the plugin needs lives inside the plugin.

### When it doesn't work

| What you see | What's wrong | Fix |
|---|---|---|
| Plugin doesn't load at all | Broken `plugin.json` | `claude plugin validate ./your-plugin` |
| Plugin loads, skill missing | Folder inside `.claude-plugin/` | Move `skills/` to the top level |
| Hook never fires | Script isn't executable | `chmod +x scripts/nudge.sh` |
| `bin/` command not found | Same thing | `chmod +x bin/<name>` |
| Changed a file, nothing happened | Only `SKILL.md` reloads live | Run `/reload-plugins` or restart |

When you're stuck, `claude --debug` prints exactly what loaded and what didn't.

---

## Part 6: Why This Is Becoming a Standard (10 min)

One piece of context, because it changes how you should think about the work you did today.

Every AI coding tool grew its own plugin format. A skill you wrote for one wouldn't load in another. In 2026 the industry agreed on a shared one: **Agent Plugins v1.0.0** — an open standard, drafted by Vercel and refined with AWS, Cursor, Microsoft, and OpenAI. Launch clients: ChatGPT, Codex, Cursor, GitHub Copilot, Kiro, and VS Code.

This is the same pattern you've watched before. DITA did it for structured content. Markdown did it for plain text. OpenAPI did it for API descriptions. Someone standardizes the container, and suddenly the content outlives the tool it was written in.

**What the standard covers:** two things only.

| Included | Not included (yet) |
|---|---|
| **Skills** — the `SKILL.md` format | Commands, agents, hooks |
| **MCP servers** | Themes, monitors, language servers |

The reason given is that skills and MCP already had independent specs and real adoption across tools. Everything else is still too tool-specific.

**What that means for you, practically:**

> **The skill you wrote today is the portable part.** Your `SKILL.md` — the rules, the output shape, the examples — is the asset. It already conforms to an open standard used across six major tools. The hook and the `bin/` script are Claude Code conveniences that may need rewriting elsewhere.

So write the skill carefully. It'll outlive this course, and probably this tool.

A working example of the portable layout is at [`../08-plugin-components/portable-doc-toolkit/`](../08-plugin-components/portable-doc-toolkit/) — same capability, repackaged to the standard. The differences are mechanical: the manifest moves to the top level, `.mcp.json` becomes `mcp.json`, and anything Claude-specific moves into a clearly-labelled folder. The engineering track has the full porting checklist if you ever need it.

---

## Discussion (10 min)

1. You wrote your team's standard as a `SKILL.md`. What's the difference between that and your existing style guide page — and should they be the same file?
2. Which of your team's rules must *never* be skipped? Those are hooks. The rest are skills. Where's the line?
3. Every skill you add taxes every conversation your team has. What's your policy for adding one?
4. If your plugin auto-updates on every commit, your standard can change without anyone being told. Is that a feature or a governance failure?
5. The skill format is standardized; hooks aren't. Does that change what you'd invest effort in?

---

## Homework (before the showcase)

1. **Publish** your plugin and get one teammate to install and run it. If it doesn't work on their machine, it isn't shipped.
2. **Move the long material** out of your `SKILL.md` into a sibling reference file, and check the token cost dropped with `claude plugin details`.
3. **Add one `userConfig` value** so another team could adopt your plugin without forking it.
4. **Audit your Module 4 marketplace** with `claude plugin validate --strict`. Fix the warnings.
5. **Write down** which of your team's rules should be hooks rather than skills, and why.

---

## ✅ Writers' Track Checklist

Before the showcase, confirm you can:

- [ ] Explain what a plugin is, in one sentence, to someone who's never seen one
- [ ] Tell a command from a skill from an agent from a hook — and say who starts each
- [ ] Say why a hook is the right choice for a rule that must never be skipped
- [ ] Explain the always-on token cost and check it with `claude plugin details`
- [ ] Write a `SKILL.md` with a trigger-shaped description, checkable rules, an output shape, and a "what not to do" section
- [ ] Move long material into a sibling file and explain why that saves tokens
- [ ] Make a hook script executable, and know that's why hooks usually fail
- [ ] Give Claude a `bin/` tool so it measures instead of guessing
- [ ] Run `claude plugin validate` and act on what it says
- [ ] Add a `userConfig` value so another team can adopt your plugin unchanged
- [ ] State the structural rule: only `plugin.json` goes in `.claude-plugin/`
- [ ] Choose a versioning approach and defend it as a governance decision
- [ ] Say which part of your plugin is portable across AI tools, and why that's the part to invest in

---

## Where to go next

| If you want… | Go to |
|---|---|
| Every component, the full manifest, and the Agent Plugins spec | [Module 8, engineering track](../08-plugin-components/lesson.md) |
| A refresher on marketplaces and publishing | [Module 4](../04-skill-patterns/lesson.md) |
| To build a real tool instead of a `bin/` script | [Module 6](../06-building-mcp-tools/lesson.md) |
