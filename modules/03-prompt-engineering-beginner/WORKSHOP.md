# Workshop: Creating and Using Claude Code Skills in VS Code & Cursor

## What Are Skills?

Skills (formerly called "custom slash commands") are **reusable prompt templates** that extend Claude Code's capabilities. When you type `/skill-name` in Claude Code's chat, the skill's markdown content gets injected into the conversation as a system prompt, giving Claude specialized instructions for a specific task.

Think of skills as **saved expert personas** — instead of typing a long prompt every time, you define it once and invoke it with a short command.

### How Skills Work Under the Hood

1. You create a markdown file (e.g., `SKILL.md` or a `.md` file in a commands directory)
2. The file contains frontmatter (name, description) and prompt content
3. When invoked via `/skill-name`, Claude Code reads the markdown and treats it as instructions
4. Claude then executes the task using its available tools (file read/write, search, bash, etc.)

Skills do **not** run code themselves — they guide Claude's behavior. The power comes from combining natural language instructions with Claude's tool access.

---

## Skills vs. MCP Server Tools — What's the Difference?

| Aspect | Skills | MCP Server Tools |
|--------|--------|-----------------|
| **What they are** | Prompt templates (markdown files) | Executable functions exposed via MCP protocol |
| **Language** | Natural language (markdown) | Code (TypeScript, Python, etc.) |
| **Execution** | Claude interprets the prompt and uses its built-in tools | The MCP server runs the function and returns results to Claude |
| **Determinism** | Non-deterministic (AI-guided) | Deterministic (code runs the same way every time) |
| **Setup** | Drop a `.md` file in the right folder | Build and run an MCP server process |
| **Best for** | Workflows, reviews, documentation, analysis patterns | API calls, database queries, file transformations, calculations |
| **Example** | `/mcp-readme` — "Generate a README for this MCP project" | `analyze_schema` — parses an MCP config and returns structured JSON |

**Rule of thumb:** Use skills for tasks that benefit from AI reasoning and flexibility. Use MCP tools for tasks that need precise, repeatable logic.

---

## Three Levels of Skills

### 1. Global Skills (`~/.claude/skills/<skill-name>/SKILL.md`)

- Available in **every project** on your machine
- Great for personal workflows you use everywhere
- Installed per-user

```
~/.claude/skills/
├── mcp-readme/
│   └── SKILL.md
├── mcp-validate/
│   └── SKILL.md
└── code-review/
    └── SKILL.md
```

### 2. Project Skills (`.claude/commands/*.md`)

- Available only within a **specific project**
- Committed to git — shared with your team
- Lives in the project's `.claude/commands/` directory

```
your-project/
└── .claude/
    └── commands/
        ├── review-pr.md
        ├── run-tests.md
        └── deploy.md
```

### 3. Personal Project Skills (`.claude/commands/user/*.md`)

- Available only within a specific project, but **only for you**
- Not committed to git (add `.claude/commands/user/` to `.gitignore`)
- For personal workflows within a team project

```
your-project/
└── .claude/
    └── commands/
        └── user/
            └── my-debug-flow.md
```

### Priority Order

When skill names conflict, the resolution order is:
1. **Project skills** (`.claude/commands/`) — highest priority
2. **Global skills** (`~/.claude/skills/`) — fallback

---

## Hands-On: Create Your First Skill

### Exercise 1 — A Simple Project Skill

Let's create a skill that generates a summary of any file.

**Step 1:** Create the commands directory in your project:

```bash
mkdir -p .claude/commands
```

**Step 2:** Create `.claude/commands/summarize.md`:

```markdown
Analyze the currently selected file or the file the user specifies.

Provide:
1. **Purpose** — What does this file do? (1-2 sentences)
2. **Key exports** — List the main functions, classes, or constants exported
3. **Dependencies** — What does it import?
4. **Complexity** — Simple / Moderate / Complex, with a brief justification

Keep the summary under 200 words.
```

**Step 3:** Use it in Claude Code:

```
/summarize src/extension.ts
```

That's it! No frontmatter required for project skills — the filename becomes the command name.

---

### Exercise 2 — A Skill with Frontmatter and Arguments

Create `.claude/commands/create-test.md`:

```markdown
You are a test engineer. Generate unit tests for the file or function the user specifies.

User arguments: $ARGUMENTS

## Rules
1. Use the project's existing test framework (look at package.json or existing test files)
2. Cover: happy path, edge cases, and error cases
3. Use descriptive test names that explain the expected behavior
4. Mock external dependencies, not internal logic
5. Output the test file — do not modify the source file
```

The `$ARGUMENTS` variable captures whatever the user types after the command:

```
/create-test src/utils/parser.ts
```

Here, `$ARGUMENTS` becomes `src/utils/parser.ts`.

---

### Exercise 3 — A Global Skill (Available Everywhere)

Create a reusable code review skill:

**Step 1:** Create the skill directory:

```bash
mkdir -p ~/.claude/skills/code-review
```

**Step 2:** Create `~/.claude/skills/code-review/SKILL.md`:

```markdown
---
name: code-review
description: Perform a thorough code review on staged or specified files
---

Review the code changes (staged git diff, or the files/selection the user specifies).

## Review Checklist
- [ ] **Correctness** — Does the logic do what it claims?
- [ ] **Edge cases** — Are boundary conditions handled?
- [ ] **Security** — Any injection, auth, or data exposure risks?
- [ ] **Performance** — Unnecessary loops, allocations, or blocking calls?
- [ ] **Readability** — Clear naming, reasonable function length?
- [ ] **Tests** — Are changes covered by tests?

## Output Format
For each issue found:
- **File:Line** — location
- **Severity** — Critical / Warning / Suggestion
- **Issue** — What's wrong
- **Fix** — How to fix it

If the code looks good, say so briefly. Don't invent problems.
```

**Step 3:** Use it from any project:

```
/code-review
```

> **Note:** Global skills require the `SKILL.md` filename and frontmatter with `name` and `description` fields. Project skills use the filename as the name and don't require frontmatter.

---

### Exercise 4 — A Skill That Chains Other Skills

Skills can reference other skills or multi-step workflows. Create `.claude/commands/full-review.md`:

```markdown
Perform a complete review of this project's MCP server:

1. First, read the project structure and identify the MCP server entry point
2. Check that `mcp-assistant-manifest.json` exists. If not, tell the user to run `/mcp-manifest` first
3. Validate the server against quality standards (perform the checks from `/mcp-validate`)
4. Generate an updated README if the current one is outdated
5. Summarize findings in a table:
   | Category | Status | Issues |
   |----------|--------|--------|

Stop after each major step and report progress.
```

---

## Using Skills in VS Code and Cursor

### VS Code (with Claude Code extension)

1. Open the **Claude Code** panel (Cmd+Shift+P → "Claude Code: Open")
2. Type `/` to see available skills
3. Select a skill or type its name (e.g., `/summarize`)
4. Add arguments after the command if needed

### Cursor

1. Open **Cursor Chat** (Cmd+L) or **Composer** (Cmd+I)
2. If using Claude Code within Cursor's terminal, type `/` to list skills
3. Skills in `.claude/commands/` are automatically detected

### Both IDEs

- Skills are picked up automatically — no restart needed after creating a new `.md` file
- The skill list updates when you add/remove files from the commands directory
- You can invoke skills mid-conversation to switch Claude's behavior

---

## Tips and Best Practices

### Do

- **Be specific** — "You are a security auditor" works better than "Review this code"
- **Set constraints** — "Output only the markdown, no commentary" prevents rambling
- **Use $ARGUMENTS** — Makes skills flexible and reusable
- **Structure output** — Tell Claude exactly what format you want (tables, checklists, etc.)
- **Keep skills focused** — One skill = one task. Compose them for workflows.

### Don't

- **Don't write code in skills** — Skills are prompts, not scripts. Use MCP tools for code execution.
- **Don't make skills too long** — If your skill exceeds ~500 words, consider breaking it into multiple skills
- **Don't duplicate tool functionality** — If an MCP tool already does it deterministically, don't recreate it as a skill

---

## Quick Reference

| I want to... | Create a skill at... |
|---|---|
| Use it in every project | `~/.claude/skills/<name>/SKILL.md` (with frontmatter) |
| Share it with my team | `.claude/commands/<name>.md` (commit to git) |
| Keep it personal in one project | `.claude/commands/user/<name>.md` (gitignore it) |

| Skill feature | Syntax |
|---|---|
| Capture user input | `$ARGUMENTS` |
| Set the command name | Filename (project) or `name:` frontmatter (global) |
| Set the description | First line of file (project) or `description:` frontmatter (global) |

---

## Exercises to Try on Your Own

1. **`/explain-error`** — A skill that takes an error message and searches the codebase for the likely cause
2. **`/migration-guide`** — A skill that reads a `CHANGELOG.md` and generates upgrade steps
3. **`/doc-function`** — A skill that adds JSDoc/docstring to a selected function
4. **`/security-scan`** — A skill that checks for OWASP Top 10 vulnerabilities in a file
