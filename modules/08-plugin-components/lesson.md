# Module 8: Plugin Anatomy — Every Component, End to End
## 🟠 Advanced Level

**Duration:** 2 hours | **Prerequisite:** Modules 4 (marketplaces), 6 (MCP servers) | **Reference:** [code.claude.com/docs/en/plugins-reference](https://code.claude.com/docs/en/plugins-reference)

---

## What This Level Means

Module 4 taught you the *shape* of a plugin: a manifest, some commands, a marketplace that ships it. That was enough to publish. This module is the **reference pass** — every component a plugin can contain, what it costs, when to reach for it, and the rules that decide whether it loads at all.

Then we look outward. In 2026 a vendor-neutral **Agent Plugins** standard landed, backed by AWS, Cursor, Microsoft, OpenAI, and Vercel. You'll learn what it standardizes, what it deliberately leaves out, and how to package the same plugin so it runs in ChatGPT, Codex, Cursor, Copilot, Kiro, and VS Code — not just Claude Code.

### Advanced Learning Objectives

By the end of Module 8, you will be able to:
- Name all 13 plugin component types and pick the right one for a given job
- Read and write a full `plugin.json`, including `userConfig`, `dependencies`, and `experimental`
- Explain `${CLAUDE_PLUGIN_ROOT}` vs `${CLAUDE_PLUGIN_DATA}` vs `${CLAUDE_PROJECT_DIR}` and where each expands
- Scaffold, validate, install, and debug a plugin from the CLI
- Package a plugin to the Agent Plugins v1.0.0 spec for cross-client portability

---

## The Example Plugin

Everything in this lesson is a real file in this folder. One plugin, `doc-toolkit`, uses **every component type at once** — which no sane production plugin would do, and which is exactly what makes it useful to read.

```
modules/08-plugin-components/
├── .claude-plugin/
│   └── marketplace.json           ← the catalog
├── doc-toolkit/                   ← the everything-plugin
│   ├── .claude-plugin/plugin.json
│   ├── skills/readability-pass/SKILL.md + reference.md
│   ├── commands/doc-status.md
│   ├── agents/doc-auditor.md
│   ├── hooks/hooks.json
│   ├── .mcp.json         + mcp/docstats-server.js
│   ├── .lsp.json         + lsp/markdown-server.js
│   ├── monitors/monitors.json
│   ├── themes/docs-dark.json
│   ├── output-styles/terse-editor.md
│   ├── workflows/docs-sweep.js
│   ├── bin/doc-wordcount
│   ├── scripts/*.sh
│   ├── settings.json
│   └── CHANGELOG.md
├── portable-doc-toolkit/          ← the same thing, Agent Plugins v1.0.0
└── fixture/needs-work.md          ← a deliberately bad doc to test against
```

### Load it before we start (2 min)

```bash
cd modules/08-plugin-components
claude --plugin-dir ./doc-toolkit
```

`--plugin-dir` loads a plugin for one session with no install and no marketplace. It is the development loop: edit, restart, test. Inside the session, run `/plugin` and confirm `doc-toolkit` is listed.

Then try it:

```
/doc-toolkit:doc-status fixture/
```

> **🟠 Warning label on this plugin:** it enables hooks that print on every edit, a monitor that polls in the background, and an LSP that pushes diagnostics. That's a lot of noise for one folder. Real plugins ship two or three components, not thirteen.

---

## Part 1: The Thirteen Components (35 min)

Two questions sort every component: **who triggers it**, and **does it cost tokens in every session even when unused?**

| # | Component | Default location | Triggered by | Always-on token cost |
|---|-----------|------------------|--------------|----------------------|
| 1 | **Skill** | `skills/<name>/SKILL.md` | You or Claude | Yes — its description |
| 2 | **Command** | `commands/*.md` | You (`/name`) | Yes — its name + description |
| 3 | **Agent** | `agents/*.md` | You or Claude delegating | Yes — its description |
| 4 | **Hook** | `hooks/hooks.json` | A lifecycle event | No — runs in the harness |
| 5 | **MCP server** | `.mcp.json` | Claude calling a tool | Yes — tool schemas |
| 6 | **LSP server** | `.lsp.json` | File edits, automatically | No — diagnostics on demand |
| 7 | **Monitor** | `monitors/monitors.json` | Session start / skill invoke | No |
| 8 | **Workflow** | `workflows/*.js` | Explicit invocation | No |
| 9 | **Output style** | `output-styles/*.md` | Active while enabled | Yes |
| 10 | **Theme** | `themes/*.json` | User picks it in `/theme` | No |
| 11 | **Executable** | `bin/*` | Claude, as a bare Bash command | No |
| 12 | **Settings** | `settings.json` | Applied on enable | No |
| 13 | **Channel** | `channels` in manifest | Inbound messages | No |

> **🟠 The always-on column is the one that matters.** Every skill, command, and agent description is loaded into *every* session whether or not it fires. Run `claude plugin details doc-toolkit` to see the number. A plugin with 30 skills is a tax on every conversation your team has.

### 1. Skills — `skills/<name>/SKILL.md`

A directory with a `SKILL.md` and optional supporting files. The frontmatter `description` is what lets Claude decide to invoke it unprompted.

```markdown
---
name: readability-pass
description: Use when a Markdown doc needs a readability review — flags long
  sentences, passive voice, and Title Case headings. Trigger on "tighten this doc".
---

Read the file. Call word_stats. Output a table: Line | Issue | Current | Rewrite.

A worked example lives at ${CLAUDE_PLUGIN_ROOT}/skills/readability-pass/reference.md.
Read it only when the user asks what "good" looks like.
```
→ `doc-toolkit/skills/readability-pass/SKILL.md`

Two things to notice:

- **Progressive disclosure.** `reference.md` sits next to `SKILL.md` and costs nothing until Claude reads it. Put the long material there, not in the frontmatter.
- **The description is a routing decision, not a summary.** Write *when to use this*, not *what this is*.

**Single-skill plugins.** A plugin with a `SKILL.md` at its root, no `skills/` folder, and no `skills` manifest field loads as one skill automatically (v2.1.142+). Set `name` in the frontmatter — otherwise Claude Code falls back to the install directory name, which for marketplace installs is a *version string that changes on every update*.

### 2. Commands — `commands/*.md`

A flat Markdown file. Same idea, older format, no folder. Use `skills/` for anything new; `commands/` still works and is right when you want a pure `/`-only entry point.

```markdown
---
description: Print a one-screen health summary for a docs folder.
argument-hint: <folder>
disable-model-invocation: true
---

Produce a health summary for the docs folder: $ARGUMENTS
```
→ `doc-toolkit/commands/doc-status.md`

`disable-model-invocation: true` is the whole difference from a skill here: Claude will never fire this on its own. In plugin skills and commands, boolean frontmatter also accepts `yes`/`no`/`on`/`off`/`1`/`0` in any case (v2.1.218+).

### 3. Agents — `agents/*.md`

A subagent: its own context window, its own tools, its own model. Use it when the job would flood your main conversation.

```markdown
---
name: doc-auditor
description: Audits an entire documentation set. Use for multi-file sweeps.
model: sonnet
effort: medium
maxTurns: 20
tools: Read, Grep, Glob
disallowedTools: Write, Edit
skills: readability-pass
memory: false
background: false
---
```
→ `doc-toolkit/agents/doc-auditor.md`

Supported frontmatter: `name`, `description`, `model`, `effort`, `maxTurns`, `tools`, `disallowedTools`, `skills`, `memory`, `background`, `isolation` (only valid value: `"worktree"`).

> **🟠 Security rule:** plugin-shipped agents may **not** declare `hooks`, `mcpServers`, or `permissionMode`. A plugin you install shouldn't be able to hand its subagent a fresh set of permissions.

Invoke it as `@doc-toolkit:doc-auditor`.

### 4. Hooks — `hooks/hooks.json`

The only component that isn't "instructions Claude follows." A hook is code the harness runs on an event. Deterministic, unskippable.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          { "type": "command",
            "command": "\"${CLAUDE_PLUGIN_ROOT}\"/scripts/remind-style.sh" }
        ]
      }
    ]
  }
}
```
→ `doc-toolkit/hooks/hooks.json`

**Five hook types:**

| Type | What it does |
|------|--------------|
| `command` | Runs a shell command or script |
| `http` | POSTs the event JSON to a URL |
| `mcp_tool` | Calls a tool on a configured MCP server |
| `prompt` | Evaluates a prompt with an LLM (`$ARGUMENTS` = context) |
| `agent` | Runs an agentic verifier with tools |

**The events you'll actually use**, out of the ~30 available:

| Event | Fires |
|-------|-------|
| `SessionStart` | Session begins or resumes |
| `UserPromptSubmit` | You submit a prompt, before Claude sees it |
| `PreToolUse` | Before a tool call — **can block it** |
| `PostToolUse` | After a tool call succeeds |
| `PostToolUseFailure` | After a tool call fails |
| `Stop` | Claude finishes responding |
| `SubagentStart` / `SubagentStop` | A subagent spawns / finishes |
| `FileChanged` | A watched file changes (`matcher` = filenames) |
| `PreCompact` / `PostCompact` | Around context compaction |
| `SessionEnd` | Session terminates |

The full list also covers `Setup`, `UserPromptExpansion`, `PermissionRequest`, `PermissionDenied`, `PostToolBatch`, `Notification`, `MessageDisplay`, `TaskCreated`, `TaskCompleted`, `StopFailure`, `TeammateIdle`, `InstructionsLoaded`, `ConfigChange`, `CwdChanged`, `DirectoryAdded`, `WorktreeCreate`, `WorktreeRemove`, `Elicitation`, and `ElicitationResult`.

> **🟠 The scoped-name trap.** To hook your *own* bundled MCP server, you must use the scoped name. A matcher against the bare server key silently never fires:
>
> - Tool matcher / `if`: `mcp__plugin_<plugin>_<server>__<tool>`
> - `mcp_tool` hook's `server` field: `plugin:<plugin>:<server>`
>
> In `doc-toolkit` that's `mcp__plugin_doc-toolkit_docstats__word_stats`.

### 5. MCP servers — `.mcp.json`

Module 6 built one from scratch. Bundling one in a plugin is the same server plus a config file:

```json
{
  "mcpServers": {
    "docstats": {
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/mcp/docstats-server.js"],
      "env": { "CACHE_DIR": "${CLAUDE_PLUGIN_DATA}/cache" }
    },
    "team-docs-api": {
      "type": "http",
      "url": "https://example.com/mcp",
      "headers": { "X-Client": "doc-toolkit" }
    }
  }
}
```
→ `doc-toolkit/.mcp.json`, server at `doc-toolkit/mcp/docstats-server.js`

The bundled server is **dependency-free on purpose** — raw JSON-RPC over stdio, ~130 lines, no `npm install`. Whatever you bundle has to start on a teammate's machine the second they enable the plugin. Test it without Claude Code at all:

```bash
printf '%s\n%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"word_stats","arguments":{"path":"fixture/needs-work.md"}}}' \
  | node doc-toolkit/mcp/docstats-server.js
```

Servers start when the plugin is enabled. `/reload-plugins` keeps live connections for servers whose config didn't change.

### 6. LSP servers — `.lsp.json`

A language server gives Claude *real-time* code intelligence: diagnostics after every edit, go-to-definition, find-references. Module 7's capstone built one for Markdown; here's how a plugin ships it.

```json
{
  "markdown-docs": {
    "command": "node",
    "args": ["${CLAUDE_PLUGIN_ROOT}/lsp/markdown-server.js"],
    "extensionToLanguage": { ".md": "markdown", ".mdx": "markdown" },
    "startupTimeout": 5000,
    "restartOnCrash": true,
    "maxRestarts": 3,
    "diagnostics": true
  }
}
```
→ `doc-toolkit/.lsp.json`

**Required:** `command`, `extensionToLanguage`.
**Optional:** `args`, `transport` (`stdio` default, or `socket`), `env`, `initializationOptions`, `settings`, `workspaceFolder`, `startupTimeout`, `shutdownTimeout`, `restartOnCrash`, `maxRestarts`, `diagnostics`.

Three rules that bite:

1. **You must install the binary separately.** LSP plugins configure a connection; they don't ship the language server. `Executable not found in $PATH` in the `/plugin` Errors tab means install it. (`doc-toolkit` sidesteps this by bundling a Node script.)
2. **First registration wins per extension.** If two enabled plugins both claim `.md`, one starts and the other never does. `/plugin` warns you which.
3. **A bad config is skipped silently** — no `command`, no `extensionToLanguage`, server skipped. `claude --debug` tells you why. A skipped server doesn't claim its extensions, so a valid one elsewhere still handles them.

Official LSP plugins exist for `pyright-lsp`, `typescript-lsp`, and `rust-analyzer-lsp`. Search "lsp" in the `/plugin` Discover tab before writing your own.

### 7. Monitors — `monitors/monitors.json` *(experimental)*

A shell command that runs for the whole session. Every line it prints to stdout reaches Claude as a notification — so Claude can react to a build failing without you telling it to watch.

```json
[
  { "name": "docs-build",
    "command": "\"${CLAUDE_PLUGIN_ROOT}\"/scripts/poll-build.sh",
    "description": "Docs site build status changes",
    "when": "always" },
  { "name": "audit-log",
    "command": "tail -F ./logs/doc-audit.log",
    "description": "Streams the doc audit log",
    "when": "on-skill-invoke:readability-pass" }
]
```
→ `doc-toolkit/monitors/monitors.json`

Required: `name`, `command`, `description`. Optional: `when` (`"always"` default, or `"on-skill-invoke:<skill>"`).

Constraints worth knowing: interactive CLI sessions only; unsandboxed at hook trust level; **skipped entirely for project-scope skills-dir plugins**; disabling a plugin mid-session doesn't stop a running monitor. Monitor commands **cannot** use `${user_config.*}` — have the script read a config file instead.

### 8. Workflows — `workflows/*.js`

Deterministic multi-agent orchestration as a script: fan out, verify, synthesize. Plain JavaScript, not TypeScript.

```js
export const meta = {
  name: 'docs-sweep',
  description: 'Review every doc in a folder in parallel, then verify each finding.',
  phases: [{ title: 'Review' }, { title: 'Verify' }],
}

const results = await pipeline(
  files,
  (file)      => agent(`Review ${file} for style issues.`, { phase: 'Review', schema: FINDINGS }),
  (rev, file) => parallel(rev.findings.map(f => () =>
                   agent(`Try to refute: "${f.issue}"`, { phase: 'Verify', schema: VERDICT })))
)
```
→ `doc-toolkit/workflows/docs-sweep.js`

`pipeline()` is the default because each item flows through all stages independently — file B verifies while file C is still under review. Use `parallel()` only when a stage genuinely needs *all* prior results at once.

### 9. Output styles — `output-styles/*.md`

Changes how Claude writes while the plugin is enabled. This is the whole file:

```markdown
---
name: terse-editor
description: Copy-desk voice — findings only, no encouragement, no preamble.
---

You are a copy desk, not a coach.
- No preamble. No summary after a table.
- Findings as tables. Never prose paragraphs for lists.
- Never praise the draft.
```
→ `doc-toolkit/output-styles/terse-editor.md`

### 10. Themes — `themes/*.json` *(experimental)*

A `base` preset plus a sparse override map. Appears in `/theme`.

```json
{ "name": "Docs Dark", "base": "dark",
  "overrides": { "claude": "#7aa2f7", "error": "#f7768e", "success": "#9ece6a" } }
```
→ `doc-toolkit/themes/docs-dark.json`

Saved in user config as `custom:<plugin-name>:<slug>`. Plugin themes are read-only — `Ctrl+E` copies one to `~/.claude/themes/` for editing.

### 11. Executables — `bin/*`

Anything in `bin/` joins the Bash tool's `PATH` while the plugin is enabled. Claude runs it as a bare command — no path, no `npx`.

```bash
#!/usr/bin/env bash
for f in "$@"; do printf '%s\t%s words\n' "$f" "$(wc -w < "$f")"; done
```
→ `doc-toolkit/bin/doc-wordcount` — Claude can now just run `doc-wordcount fixture/needs-work.md`.

Remember `chmod +x`. This is the single most common "why isn't it working."

### 12. Settings — `settings.json`

Defaults applied when the plugin is enabled. Only two keys are supported today: `agent` and `subagentStatusLine`.

```json
{ "subagentStatusLine": { "type": "command", "command": "echo \"📝 doc-toolkit\"" } }
```
→ `doc-toolkit/settings.json`

### 13. Channels — `channels` in `plugin.json`

Declares a message channel (Telegram/Slack/Discord style) that injects content into the conversation. Each channel binds to one of the plugin's own MCP servers.

```json
{
  "channels": [
    { "server": "telegram",
      "userConfig": {
        "bot_token": { "type": "string", "title": "Bot token",
                       "description": "Telegram bot token", "sensitive": true }
      } }
  ]
}
```

`server` is required and must match a key in `mcpServers`. Scaffold one with `claude plugin init x --with channel`.

---

## Part 2: The Manifest (20 min)

### The manifest is optional

Drop components in the default folders and Claude Code finds them; the plugin name comes from the directory name. Write a `plugin.json` when you need metadata, custom paths, or user config.

### Full schema

```json
{
  "$schema": "https://json.schemastore.org/claude-code-plugin-manifest.json",
  "name": "doc-toolkit",
  "displayName": "Docs Toolkit",
  "version": "1.0.0",
  "description": "…",
  "author": { "name": "Aman Talwar", "email": "…", "url": "…" },
  "homepage": "…", "repository": "…", "license": "MIT",
  "keywords": ["documentation"],
  "metadata": { "course": "…", "module": 8 },
  "defaultEnabled": true,
  "skills": "./custom/skills/",
  "commands": ["./custom/commands/special.md"],
  "agents": ["./custom/agents/reviewer.md"],
  "workflows": "./workflows/",
  "hooks": "./config/hooks.json",
  "mcpServers": "./mcp-config.json",
  "outputStyles": "./styles/",
  "lspServers": "./.lsp.json",
  "experimental": { "themes": "./themes/", "monitors": "./monitors.json" },
  "userConfig": { },
  "channels": [ ],
  "dependencies": ["helper-lib", { "name": "secrets-vault", "version": "~2.1.0" }]
}
```

**`name` is the only required field.** It's kebab-case and it's what namespaces everything: the `doc-auditor` agent in `doc-toolkit` is `doc-toolkit:doc-auditor`.

### Three rules that surprise people

**1. Unrecognized top-level fields are ignored, not fatal.** You can keep VS Code, npm, or MCPB metadata in the same `plugin.json` and it still loads. `claude plugin validate` reports them as *warnings* and suggests corrections for near-misses. Use `--strict` in CI to make warnings fail.

**2. Wrong *types* usually are fatal.** `"keywords": "docs"` (string, not array) is a load error. The exceptions: `experimental` and `metadata` — a non-object value there is ignored with a warning.

**3. Some path fields replace the default folder, one adds to it.**

| Behavior | Fields |
|----------|--------|
| **Replaces** the default | `commands`, `agents`, `workflows`, `outputStyles`, `experimental.themes`, `experimental.monitors` |
| **Adds to** the default | `skills` — `skills/` is always scanned |
| **Own merge rules** | `hooks`, `mcpServers`, `lspServers` |

So `"commands": ["./extras/"]` means `commands/` is **no longer scanned**. To keep both: `"commands": ["./commands/", "./extras/"]`. Claude Code v2.1.140+ warns in `claude plugin list` when a default folder is being ignored this way.

All paths are relative to the plugin root and start with `./`. Only `skills` also accepts `"."` (plugin root; needs v2.1.221+, use `"./"` for older).

### `userConfig` — ask the user, don't make them edit JSON

```json
"userConfig": {
  "style_guide_url": {
    "type": "string", "title": "Style guide URL",
    "description": "Where your team's style guide lives.",
    "default": "https://example.com/style-guide"
  },
  "max_sentence_words": {
    "type": "number", "title": "Max sentence length",
    "description": "Flag sentences longer than this.",
    "default": 25, "min": 10, "max": 60
  },
  "docs_api_token": {
    "type": "string", "title": "Docs API token",
    "description": "Stored in the OS keychain, never in settings.json.",
    "sensitive": true
  }
}
```
→ `doc-toolkit/.claude-plugin/plugin.json`

Field types: `string`, `number`, `boolean`, `directory`, `file`. Options: `sensitive`, `required`, `default`, `multiple`, `min`/`max`.

**Where the values show up:**

| Surface | How |
|---------|-----|
| Skill and agent content | `${user_config.KEY}` — non-sensitive only |
| MCP and LSP configs | `${user_config.KEY}` |
| Hook processes | `CLAUDE_PLUGIN_OPTION_<KEY>` env var (uppercased) |

**Where they're rejected, and why.** Anything that runs through a shell refuses `${user_config.*}` — substituting a user value into a shell string would let the shell execute whatever it contains. That's shell-form hook commands (use exec form with `args`, or read the env var), monitor commands (read a config file), and MCP `headersHelper` (read a config file). Before v2.1.207 these did substitute; update old plugins.

Non-sensitive values land in `pluginConfigs` in `~/.claude/settings.json`. Sensitive ones go to the macOS Keychain (~2 KB shared budget — keep them small). **Project settings are ignored for `pluginConfigs`**, deliberately: a cloned repo shouldn't be able to feed values into your hook commands.

### `defaultEnabled` and dependencies

`"defaultEnabled": false` ships a plugin that installs turned off — right for anything that costs money or reaches an external service. It's only a fallback: an existing `enabledPlugins` entry wins, and so does being required by another active plugin. A marketplace entry's `defaultEnabled` beats `plugin.json`'s.

`dependencies` pulls in other plugins, optionally with semver constraints. Enabling transitively enables them; disabling fails if a dependent is still on. `claude plugin prune` removes orphaned auto-installed dependencies.

### The three path variables

| Variable | Resolves to | Use for |
|----------|-------------|---------|
| `${CLAUDE_PLUGIN_ROOT}` | The plugin's install directory | Bundled scripts, binaries, configs |
| `${CLAUDE_PLUGIN_DATA}` | `~/.claude/plugins/data/{id}/` — survives updates | `node_modules`, venvs, caches, generated files |
| `${CLAUDE_PROJECT_DIR}` | The project root | Project-local scripts |

All three are exported to hook processes and to MCP/LSP subprocesses. Inline expansion depends on the component:

| Component | Fields where placeholders expand |
|-----------|----------------------------------|
| Skill and agent content | Anywhere |
| Hook and monitor commands | Anywhere |
| MCP stdio servers | `command`, `args`, `env` |
| MCP http/sse/ws servers | `url`, `headers`, `headersHelper` |
| LSP servers | `command`, `args`, `env`, `workspaceFolder` |

> **🟠 `${CLAUDE_PLUGIN_ROOT}` changes on every update.** Never write state there. The old directory lingers ~14 days for running sessions, then vanishes. That's what `${CLAUDE_PLUGIN_DATA}` is for.

**The dependency-install pattern.** Because the data directory outlives any version, "does the folder exist" can't tell you an update changed `package.json`. Diff the manifests instead:

```json
{
  "hooks": { "SessionStart": [ { "hooks": [ { "type": "command",
    "command": "diff -q \"${CLAUDE_PLUGIN_ROOT}/package.json\" \"${CLAUDE_PLUGIN_DATA}/package.json\" >/dev/null 2>&1 || (cd \"${CLAUDE_PLUGIN_DATA}\" && cp \"${CLAUDE_PLUGIN_ROOT}/package.json\" . && npm install) || rm -f \"${CLAUDE_PLUGIN_DATA}/package.json\""
  } ] } ] }
}
```

Then point the server at it: `"env": { "NODE_PATH": "${CLAUDE_PLUGIN_DATA}/node_modules" }`.

---

## Part 3: Loading, Scopes, and the CLI (20 min)

### Four scopes

| Scope | Settings file | Use |
|-------|---------------|-----|
| `user` | `~/.claude/settings.json` | Personal, all projects (default) |
| `project` | `.claude/settings.json` | Team, shared via version control |
| `local` | `.claude/settings.local.json` | This repo only, gitignored |
| `managed` | Managed settings | Org policy, read-only |

### Skills-directory plugins — no marketplace at all

Any folder under a skills directory containing `.claude-plugin/plugin.json` loads next session as `<name>@skills-dir`. No install, no copy — it's read in place, so editing is instant.

```bash
claude plugin init my-helper --with skills agents hooks mcp lsp
# → ~/.claude/skills/my-helper/, loads as my-helper@skills-dir
```

| What you have | What it is |
|---|---|
| `<skills-dir>/foo/SKILL.md`, no manifest | A plain skill `foo` |
| `<skills-dir>/foo/.claude-plugin/plugin.json` | A plugin `foo@skills-dir` |
| `<plugin>/skills/bar/SKILL.md` | A skill `bar` inside a plugin |

Personal (`~/.claude/skills/`) loads everywhere with no restrictions. Project (`<cwd>/.claude/skills/`) loads only after you accept the workspace trust dialog, its MCP servers need per-server approval, its LSP needs trust, and **its monitors don't load at all**.

> **🟠 Gotcha:** project-scope `@skills-dir` plugins load only from the `.claude/skills/` of the directory you launched from — they don't walk up to the repo root the way plain skills do. Launch from the root, or `/reload-plugins` after `cd`.

**What reloads live:** `SKILL.md` edits, immediately. Everything else — `hooks/`, `.mcp.json`, `agents/`, `output-styles/` — needs `/reload-plugins` or a restart.

### CLI reference

| Command | What it does |
|---------|--------------|
| `claude plugin init <name> [--with …]` | Scaffold at `~/.claude/skills/<name>/`. `--with`: `skills agents hooks mcp lsp output-style channel` |
| `claude plugin validate ./dir [--strict]` | Check manifest, frontmatter, `hooks.json`. **Run this before every publish** |
| `claude plugin install <p>@<mkt> [-s scope] [--config k=v]` | Install |
| `claude plugin uninstall <p> [--keep-data] [--prune]` | Remove; deletes the data dir unless `--keep-data` |
| `claude plugin prune [--dry-run]` | Drop orphaned auto-installed dependencies |
| `claude plugin enable` / `disable [-a]` | Toggle without uninstalling |
| `claude plugin update <p>` | Pull the latest version |
| `claude plugin list [--json] [--available]` | Installed plugins, versions, status |
| `claude plugin details <name>` | **Component inventory + projected token cost** |
| `claude plugin tag [path] [--push]` | Create a release git tag |

Try the one that changes how you design plugins:

```bash
claude plugin details doc-toolkit
```

```
Component inventory
  Skills (2)  readability-pass, doc-status
  Agents (1)  doc-auditor
  Hooks (4)   SessionStart, PostToolUse, PreToolUse, Stop  (harness-only)
  MCP servers (2)
  LSP servers (1)

Projected token cost
  Always-on:   ~180 tok   added to every session
```

Always-on is what every session pays for the listing text. On-invoke is per firing.

### Caching and path traversal

Marketplace plugins are **copied** to `~/.claude/plugins/cache`, one directory per version, old versions orphaned and removed after 14 days. Two consequences:

1. **`../shared-utils` will not work after install** — files outside the plugin root aren't copied.
2. **Symlinks resolve by target**: inside the plugin → preserved; elsewhere in the same marketplace → dereferenced and copied (this is how a meta-plugin links sibling skills); outside the marketplace → skipped, for security.

### Versioning

Version is the cache key that decides whether an update exists. Resolved from the first that's set:

1. `version` in `plugin.json`
2. `version` in the marketplace entry
3. The git commit SHA (github/url/git-subdir/relative-path sources)
4. The SHA-256 digest (archive sources)
5. `unknown` (npm sources, non-git local dirs)

| Approach | Update behavior | Best for |
|----------|-----------------|----------|
| **Explicit** — set `version` | Only when you bump it | Published plugins with releases |
| **Commit SHA** — omit `version` everywhere | Every new commit | Internal, actively developed |
| **Digest** — archive source, no version | When the zip bytes or `sha256` pin change | Zip distribution |

### Debugging

```bash
claude --debug          # plugin loading, manifest errors, component registration
```

| Symptom | Cause | Fix |
|---------|-------|-----|
| Plugin doesn't load | Invalid `plugin.json` | `claude plugin validate ./my-plugin` |
| Skills missing | Wrong directory structure | `skills/` at the plugin **root**, not in `.claude-plugin/` |
| Hooks don't fire | Script not executable | `chmod +x script.sh` |
| Hooks don't fire on MCP tools | Bare server name in matcher | Use `mcp__plugin_<plugin>_<server>__<tool>` |
| MCP server fails | Hardcoded path | Use `${CLAUDE_PLUGIN_ROOT}` |
| Path errors | Absolute paths | Relative, starting `./` |
| LSP not found in `$PATH` | Binary not installed | Install the language server |

> **🟠 The one structural rule:** only `plugin.json` goes in `.claude-plugin/`. Every other folder — `skills/`, `commands/`, `agents/`, `hooks/`, `workflows/`, `themes/`, `monitors/`, `output-styles/`, `bin/` — lives at the plugin root. A `CLAUDE.md` at the plugin root is **not** loaded as context; ship instructions as a skill.

---

## Part 4: The Agent Plugins Standard (25 min)

### What happened

Everything above is Claude Code's plugin format. Every other agent client grew its own — and a skill you wrote for one didn't load in another.

In 2026, **Agent Plugins v1.0.0** was published as a vendor-neutral standard: *"a portable package format for Agent Skills and MCP servers."* Vercel drafted it, then a working group with AWS, Cursor, Microsoft, and OpenAI refined it. Launch clients: **ChatGPT, Codex, Cursor, GitHub Copilot, Kiro, and VS Code**. Spec text is CC-BY-4.0, code Apache-2.0, governed by a Technical Steering Committee.

It's the same pattern that already played out one layer down: MCP standardized *tools*, Agent Skills standardized `SKILL.md`, and Agent Plugins standardizes *the package that carries them*.

> **🟠 Anthropic is not on the maintainer list.** Claude Code's format and Agent Plugins are two formats today. Learn both — the portable one for reach, the Claude Code one for depth. The layout in `portable-doc-toolkit/` supports both from one directory.

### Two component types. That's it.

| Component | Fixed location | Pattern |
|-----------|----------------|---------|
| Skills | `skills/` | Immediate subdirectories containing `SKILL.md` |
| MCP servers | `mcp.json` | JSON configuration |

Nothing else is in v1. Commands, hooks, agents, rules, LSP servers were all considered and deliberately left out — the spec's own reasoning is that they remain "too client-specific for a stable portable contract." Skills and MCP made the cut because both already had independent specs and real cross-client adoption.

**Locations are fixed and cannot be overridden.** No `"skills": "./custom/"` in the manifest. No inline MCP config. The spec calls this out as intentional: every client would otherwise need to implement discovery indirection and precedence rules.

### The portable manifest

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "portable-doc-toolkit",
  "version": "1.0.0",
  "description": "…",
  "author": { "name": "Aman Talwar", "email": "…", "url": "…" },
  "homepage": "…", "repository": "…", "license": "MIT",
  "keywords": ["documentation"],
  "extensions": {
    "com.anthropic.claude-code": { "note": "client-specific data goes here" }
  }
}
```
→ `portable-doc-toolkit/plugin.json`

**The schema is closed.** Exactly ten top-level fields are permitted: `$schema`, `name`, `version`, `description`, `author`, `homepage`, `repository`, `license`, `keywords`, `extensions`. This is the inverse of Claude Code, where unknown fields are simply ignored.

`$schema` and `name` are **required**. `$schema` must be that exact string — clients use it to pick validation rules and **must not fetch it over the network** at load time.

`name` rules: 1–64 chars, `a-z 0-9 - .` only, must start and end alphanumeric, no `--` or `..`. Valid: `my-plugin`, `acme.tools`, `a`. Invalid: `My-Plugin`, `-start`, `has--double`.

**Failure model:**

| Situation | Result |
|-----------|--------|
| Unknown top-level field | Report and ignore, keep loading |
| Non-object `extensions` | Report and ignore, keep loading |
| Any other schema violation | **Reject the whole plugin** |
| Invalid skill | Skip that skill, keep the rest |
| Invalid or unreachable MCP server | Skip that server, keep the rest |

That asymmetry is the design: a broken manifest is fatal, a broken component never is. A plugin with a skill and a server shouldn't die because the server is down.

### `mcp.json` — explicit transports

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
  "mcpServers": {
    "docstats": {
      "type": "stdio",
      "command": "node",
      "args": ["${PLUGIN_ROOT}/mcp/docstats-server.js"],
      "cwd": "${PLUGIN_ROOT}",
      "env": { "CACHE_DIR": "${PLUGIN_DATA}/cache" }
    },
    "team-docs-api": {
      "type": "streamable-http",
      "url": "https://example.com/mcp",
      "headers": { "X-Client": "portable-doc-toolkit" }
    }
  }
}
```
→ `portable-doc-toolkit/mcp.json`

`type` is **required** and selects a closed variant — `stdio`, `streamable-http`, or `sse` (the deprecated 2024-11-05 HTTP+SSE transport, not SSE-within-Streamable-HTTP). An unknown field, unknown `type`, or a field from another variant invalidates that entry. Clients must support at least one of `stdio` / `streamable-http`.

Rules with teeth:

- `command` is **one executable token**, never a shell string — a bare name (platform search) or a `./` plugin-relative path. No placeholder expansion in `command`.
- `${PLUGIN_ROOT}` and `${PLUGIN_DATA}` expand in `args`, `env` values, and `cwd`. Nothing else expands anywhere, and expansion is single-pass and non-recursive.
- Every plugin-relative path starts with `./` and must resolve **inside** the plugin root. `../bin/server` is invalid. So is bare `data` for `cwd` — not `./`-prefixed.
- Remote `url` must be absolute HTTP(S), no user info, no fragment. **HTTPS is mandatory except for loopback.**
- `env` must not contain `PLUGIN_ROOT` or `PLUGIN_DATA` — the client supplies those.
- **No secrets in `headers` or `env`.** They're visible package data. v1 defines no portable credential mechanism at all; auth is client-managed, and an auth failure is a connection failure, not a config error.

### Client extensions — how the two formats coexist

Anything a client needs that the spec doesn't cover goes under a **reverse-domain namespace**, in the manifest, in a top-level directory, or both:

```
portable-doc-toolkit/
├── plugin.json
├── skills/readability-pass/SKILL.md
├── mcp.json
└── com.anthropic.claude-code/
    └── hooks/hooks.json
```

The spec assigns *no* meaning to what's in there. Each client owns its namespace. Reverse-domain avoids a central name registry.

### Translation table

| Claude Code | Agent Plugins v1.0.0 |
|-------------|----------------------|
| `.claude-plugin/plugin.json` | `plugin.json` at the root |
| `$schema` optional | `$schema` **required**, exact canonical value |
| Unknown fields ignored | Closed schema — 10 fields, others reported |
| `.mcp.json` | `mcp.json` |
| Transport inferred | `type` required: `stdio` / `streamable-http` / `sse` |
| `${CLAUDE_PLUGIN_ROOT}` | `${PLUGIN_ROOT}` |
| `${CLAUDE_PLUGIN_DATA}` | `${PLUGIN_DATA}` |
| Manifest can remap component paths | Fixed locations, no overrides |
| Commands, agents, hooks, LSP, themes, monitors | Not in v1 → `com.<vendor>.<client>/` |
| `userConfig`, `channels`, `dependencies` | Not in v1 |

Compare the two folders side by side — they're the same capability:

```bash
diff -r doc-toolkit/skills portable-doc-toolkit/skills
```

### Porting checklist

1. Move `plugin.json` from `.claude-plugin/` to the root.
2. Add the required `$schema`.
3. Strip every field outside the permitted ten; move the useful ones under `extensions["com.yourorg.client"]`.
4. Check `name` against the character rules.
5. Rename `.mcp.json` → `mcp.json`, add its `$schema`, add `type` to each server.
6. `CLAUDE_PLUGIN_ROOT` → `PLUGIN_ROOT`, `CLAUDE_PLUGIN_DATA` → `PLUGIN_DATA`.
7. Move commands, agents, hooks, LSP, themes, monitors into `com.<vendor>.<client>/`.
8. Rewrite skills to avoid `${user_config.*}` and scoped `mcp__plugin_…` tool names.
9. Verify no path escapes the plugin root and no secrets sit in `env` or `headers`.

---

## Workshop: Build a Three-Component Plugin (25 min)

Pairs. You're building something small and real — the opposite of `doc-toolkit`.

**Brief:** one skill, one hook, one MCP server or `bin/` script. Nothing else.

1. **Scaffold** — `claude plugin init <yourname>-toolkit --with skills hooks mcp` (2 min)
2. **Write the skill** — port your Module 3 or Module 5 skill into `skills/<name>/SKILL.md`. Move the long material into a sibling `reference.md`. (8 min)
3. **Add one hook** — pick an event where a reminder genuinely helps. `chmod +x` the script. (5 min)
4. **Add a tool** — either copy `doc-toolkit/mcp/docstats-server.js` and adapt it, or write a `bin/` script. (5 min)
5. **Validate and measure** (3 min):
   ```bash
   claude plugin validate ~/.claude/skills/<yourname>-toolkit --strict
   claude plugin details <yourname>-toolkit
   ```
6. **Swap** — your partner runs `claude --plugin-dir <your-path>` and tries it cold. (2 min)

**Stretch:** port it to `portable-doc-toolkit/`'s layout using the checklist above.

**Grading question:** what's your always-on token cost, and is each component earning it?

---

## Discussion and Wrap-Up (10 min)

1. `doc-toolkit` has thirteen components. Which three would you keep, and what does that say about how plugins should be scoped?
2. A hook fires deterministically; a skill fires when Claude judges it relevant. Which of your team's rules must be deterministic?
3. Agent Plugins v1 excludes hooks and agents as "too client-specific." Do you agree — or does that make the standard too thin to matter?
4. Your plugin needs an API token. Walk through where it's stored and every place it must *not* appear.

### The Key Takeaway

> "A plugin is a budget, not a bucket. Every component you add is a tax on every session — ship the three that earn it."

---

## Homework (Before the Capstone Review)

1. **Audit** your Module 4 marketplace with `claude plugin validate --strict` and `claude plugin details`. Fix the warnings; cut any component whose always-on cost isn't earning its keep.
2. **Add one component type you've never used** — a hook, a `bin/` script, or an output style — to your own plugin.
3. **Port one plugin** to the Agent Plugins v1.0.0 layout and open `portable-doc-toolkit/README.md` next to it as you go.
4. **Read** the spec's "Design Decisions" section — it's short, non-normative, and explains *why* v1 is this small.

---

## 🟠 Advanced Checklist

- [ ] Name all thirteen component types and their default locations
- [ ] Say which components cost tokens in every session, and check with `claude plugin details`
- [ ] Explain why only `plugin.json` goes in `.claude-plugin/`
- [ ] Write a hook matcher that actually fires on a bundled MCP server's tool
- [ ] Pick correctly between `${CLAUDE_PLUGIN_ROOT}` and `${CLAUDE_PLUGIN_DATA}`
- [ ] Declare a `userConfig` value and name every place it can and can't be substituted
- [ ] State which manifest path fields replace the default folder and which add to it
- [ ] Choose a versioning approach and explain its update behavior
- [ ] Debug a non-loading plugin with `validate` and `--debug`
- [ ] List the two component types in Agent Plugins v1 and explain what was left out
- [ ] Port a Claude Code plugin to the portable layout without breaking it

---

## References

- [Plugins reference](https://code.claude.com/docs/en/plugins-reference) — the source for Parts 1–3
- [Plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces)
- [Hooks](https://code.claude.com/docs/en/hooks) · [Subagents](https://code.claude.com/docs/en/sub-agents) · [MCP](https://code.claude.com/docs/en/mcp) · [Skills](https://code.claude.com/docs/en/skills)
- [Agent Plugins](https://agent-plugins.org/) · [spec v1.0.0 on GitHub](https://github.com/agentplugins/agent-plugins-spec)
- [Agent Skills specification](https://agentskills.io/specification) · [Model Context Protocol](https://modelcontextprotocol.io/specification)
