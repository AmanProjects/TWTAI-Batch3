# TWT Quick Reference Cheat Sheet
## AI-Powered Documentation Mastery | Tech Writer's Tribe

---

## Skill Level Ladder

| Level | You Can Do |
|-------|-----------|
| 🟢 Novice | Explain AI and MCP; identify skill candidates |
| 🔵 Beginner | Build skills using RTCCO; test and iterate |
| 🟡 Intermediate | Share skills via marketplaces & plugins; build multi-step workflows; peer review |
| 🟠 Advanced | Extend MCP servers; build end-to-end automation |
| 🔴 Expert | Ship production tools; certify; mentor others |

---

## Skill File Locations

| Scope | Path | Commit to Git? |
|-------|------|---------------|
| **Project** (team-shared) | `.claude/commands/<name>.md` | ✅ Yes |
| **Personal** (you only) | `.claude/commands/user/<name>.md` | ❌ No |
| **Global** (all projects) | `~/.claude/skills/<name>/SKILL.md` | N/A |

---

## The RTCCO Framework

| Element | What It Does | Common Mistake |
|---------|-------------|---------------|
| **R**ole | Sets AI perspective and expertise | Too vague: "You are an editor" |
| **T**ask | What the AI should do | Missing: assumes AI knows |
| **C**ontext | Background the AI needs | Skipped entirely |
| **C**onstraints | Boundaries and rules | "Do NOT..." is often missing |
| **O**utput format | How the result should look | Left open-ended |

---

## Sharing Skills: Marketplaces & Plugins

| Term | What it is |
|------|-----------|
| **Marketplace** | A catalog (`.claude-plugin/marketplace.json`) in a Git repo that lists plugins |
| **Plugin** | An installable bundle (`.claude-plugin/plugin.json` + `commands/`, `skills/`, `agents/`, `hooks/`, `.mcp.json`) |
| **Command** | A slash-command skill — run with `/plugin-name:command` |
| **Agent** | A subagent with its own prompt, tools, and model |

**Install (two commands):**
```
/plugin marketplace add owner/repo        # add the catalog
/plugin install <plugin>@<marketplace>    # install the plugin
```
> The `@name` is the marketplace's `name` field, not the repo name. Live example: `/plugin marketplace add AmanProjects/twtai-skill` then `/plugin install doc-skills@twtai`.

**Publish your own:** create a repo → add `marketplace.json` → add a plugin folder with `plugin.json` + your `commands/` → commit & push → share the two install lines.

---

## Minimal Skill Template

```markdown
You are a [specific role and expertise].

[Task verb] the [content type] at: $ARGUMENTS

Context:
- [Audience description]
- [Style guide or standards reference]

[Checklist / Rules]:
1. [Criterion — describe what PASS looks like]
2. [Criterion — describe what PASS looks like]

Constraints:
- Do NOT [most important limitation]
- [Additional boundary]

Output:
[Exact format: table | list | report | JSON]
[Include column names or section names]
No preamble. Begin with the first line of content.
```

---

## MCP Server Quick Reference

### Server Anatomy

```typescript
// 1. Create server
const server = new McpServer({ name: "doc-quality-checker", version: "1.0.0" });

// 2. Register tool (deterministic)
server.tool(
  "tool_name",          // name AI uses to call it
  "What it does",       // helps AI decide WHEN to call it
  { filePath: { type: "string", description: "..." } },
  async ({ filePath }) => {
    return { content: [{ type: "text", text: "result" }] };
  }
);

// 3. Register resource (readable data)
server.resource("style-guide", "file://style-guide", async (uri) => ({
  contents: [{ uri: uri.href, mimeType: "text/markdown", text: content }],
}));

// 4. Start
await server.connect(new StdioServerTransport());
```

### Common CLI Commands

```bash
# Build TypeScript server
npm run build

# Add server to Claude Code
claude mcp add <server-name> -- node /absolute/path/to/dist/index.js

# Verify connection
/mcp

# Run a skill
/skill-name path/to/file.md
```

---

## Tool vs. Skill: Decision Guide

| Question | Answer | Use |
|----------|--------|-----|
| Does the task require reading/computing from files or APIs? | Yes | **Tool** |
| Does the task require AI judgment or interpretation? | Yes | **Skill** |
| Do you need consistent, identical output every time? | Yes | **Tool** |
| Do you want the AI to synthesize or explain? | Yes | **Skill** |
| Does the output feed an automated system (CI, Slack, JIRA)? | Yes | **Tool** (for data) + **Skill** (for narrative) |

---

## Production Hardening Checklist

Before shipping a skill or tool to your team:

- [ ] Skill has a comment header (name, version, author, tested-with model, date)
- [ ] `$ARGUMENTS` used — not a hardcoded file path
- [ ] Output format explicitly specified
- [ ] "Do NOT" constraints are written
- [ ] Tool has input validation (file exists check)
- [ ] Test suite created (known-good + known-bad documents)
- [ ] Tested on at least 3 different real documents
- [ ] Breaking changes documented in CHANGELOG

---

## Skill Writing Tips

| ✅ Do | ❌ Don't |
|-------|---------|
| Set a specific, expert role | Use vague roles ("You are an editor") |
| Constrain the output format explicitly | Leave output format open-ended |
| Write "Do NOT..." boundaries | Assume AI knows your limits |
| Use `$ARGUMENTS` for any file input | Hardcode file paths |
| Keep skills under 600 words | Write a novel |
| Test on `bad-api-doc.md` first | Only test on perfect documents |
| Version skills when output format changes | Update silently |

---

## The Hybrid Automation Model

```
Your Expertise    Claude Skill      Claude AI        MCP Tools       Report
(what to check) → (instructions) → (reasoning)  → (precision)  → (synthesis)
                                                    ↑ deterministic
                       ↑ you write this             ↑ you or dev writes this
```

**Deterministic where you can. AI where you must.**

---

*Tech Writer's Tribe | AI-Powered Documentation Mastery*
