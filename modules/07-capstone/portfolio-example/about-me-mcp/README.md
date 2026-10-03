# about-me MCP server

An MCP server that answers questions about a person from their [JSON Resume](https://jsonresume.org/schema/).
Install it, and anyone using Claude (or any MCP client) can ask about your experience,
skills, education, and contact details — grounded in your real data, never guessed.

## What it exposes

**Tools**
| Tool | What it returns |
|------|-----------------|
| `get_summary` | Name, title, location, professional summary |
| `get_experience` | Work history — optional `keyword` filter (e.g. `"API"`, `"leadership"`) |
| `get_skills` | Skills and areas of expertise |
| `get_education` | Education and certifications |
| `get_contact` | Email, phone, portfolio, and profile links |

**Resource** — `about-me://resume` — the full JSON Resume document.

**Prompt** — `introduce_me` — drafts a short, factual introduction for a given `audience`.

## Try it locally

```bash
npm install
npm run build
```

Add it to Claude Code:

```bash
claude mcp add about-me -- node /absolute/path/to/about-me-mcp/dist/index.js
```

Then in Claude Code:

```
/mcp                                 # confirm "about-me" is connected
What is this person's experience with APIs?   # calls get_experience
```

## Data source

By default the server serves the bundled `data/resume.json`. To point it at a
different file (for example, the live `resume.json` from your portfolio):

```bash
RESUME_PATH=/path/to/resume.json node dist/index.js
```

Keep `data/resume.json` in sync with your portfolio's `resume.json` — it is the same
schema, so a copy is all it takes.

## Publish so others can install it

Follow the Module 6 method:

```bash
npm login
npm publish --access public
```

Anyone can then run it with `npx`:

```bash
claude mcp add about-me -- npx -y about-me-aman
```

> Rename the package in `package.json` (`name` and `bin`) to your own handle before publishing.
