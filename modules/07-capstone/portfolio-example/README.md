# Portfolio Example — Résumé to a Live Site + about-me MCP

The worked example for **Module 7**. It shows all four building blocks working together
around one data file, `resume.json`.

> ⚠️ **`resume.json` is sample data — replace it with your own.** The exercise needs
> *your* résumé to be real. Run `/parse-resume` on your résumé (PDF/DOCX/MD/TXT), or
> `/import-linkedin` on a LinkedIn data export, to regenerate it.

## What's here

```
portfolio-example/
  index.html          ← page shell + section containers
  styles.css          ← all styling (light + dark)
  app.js              ← fetches resume.json and renders every populated section
  resume.json         ← SINGLE SOURCE OF TRUTH (JSON Resume schema) — sample data
  CLAUDE.md           ← always-on project rules for Claude
  .claude/
    commands/
      parse-resume.md      ← SKILL: résumé → resume.json
      import-linkedin.md   ← SKILL: LinkedIn export → resume.json
    agents/
      portfolio-builder.md ← AGENT: (re)generates the whole site from resume.json
  about-me-mcp/       ← MCP SERVER: others install it to query your background
```

| Building block | File | What it does |
|----------------|------|--------------|
| **Skill** | `.claude/commands/parse-resume.md` | Turns a résumé into `resume.json` |
| **Agent** | `.claude/agents/portfolio-builder.md` | Delegated job: build/rebuild the site |
| **MCP server** | `about-me-mcp/` | Installable — answers questions about you |
| **Resource** | JSON Resume schema | The contract the skill fills |

## 1. Preview the site

A static site must be *served* (not opened as a `file://`) so `fetch` works:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Change one line in `resume.json`, reload — the page updates. You never touch HTML.

## 2. Make it yours

```
/parse-resume ~/Documents/my-resume.pdf > resume.json
```

Add your photo as `profile.jpg`. (Optionally re-copy `resume.json` into
`about-me-mcp/data/` so the MCP server serves your data too.)

## 3. Run the agent

```
Use the portfolio-builder agent to rebuild my site from resume.json
```

## 4. Try the about-me MCP server

See `about-me-mcp/README.md`. Build it, connect it, then ask Claude
*"What is this person's experience with APIs?"*

## 5. Ship it

```bash
git init && git add . && git commit -m "Portfolio from resume.json"
gh repo create portfolio --public --source=. --push
# GitHub → Settings → Pages → Deploy from branch → main / root
```

Your site goes live at `https://YOUR-USERNAME.github.io/portfolio/`.
