# Module 7: Capstone Build — Your Portfolio Site From a Résumé

## 🟠 Advanced Level (Upper)

**Duration:** 2 hours core (+55 min optional LSP track) | **Prerequisite:** Modules 1–6

---

## What This Level Means

**Upper Advanced** means you stop practicing on sample files and build something that is *yours* and public. In this module you turn your résumé into a live, professional **portfolio website** — using every primitive from this program: a **skill** to structure your résumé as data, an **agent** to generate the site, a **resource** for the schema, and Git + GitHub Pages to ship it. You'll also wire in **Sign in with LinkedIn**.

By the end, you will have a real URL you can put on your résumé — like [amantalwar04.github.io/portfolio](https://amantalwar04.github.io/portfolio/).

### Advanced (Upper) Learning Objectives

By the end of Module 7, you will be able to:

- **Explain the complete mental model** — when to reach for a skill, an agent, a plugin, or an MCP server, and how they compose
- Turn a résumé (PDF/DOCX/text) into structured `resume.json` using the JSON Resume schema
- Generate a **static portfolio site** (HTML/CSS/JS) that renders from `resume.json`
- Build a `portfolio-builder` **agent** that regenerates the whole site from your data
- Add **Sign in with LinkedIn** and import your work experience from a LinkedIn data export
- **Deploy** to GitHub Pages and get a public URL
- **Explain and build an LSP server** — the fifth extension mechanism, and the only one that isn't Claude-specific
- **Tune the model** with `CLAUDE.md`, Cursor rules, and context/cost optimizations

---



## The Five Building Blocks — A Complete Mental Model (20 min)

Across this program you've met several things that all "extend the AI." By now they can blur together. Before you build, lock down what each one *is*, when to reach for it, and how they **compose** into one system — because your portfolio uses four of the five.

### The one-line definitions


| Block                     | What it is                                                                                                                    | Who invokes it                                          | Lives in                                       |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------- |
| **Skill** (slash command) | A reusable **prompt** — instructions the model follows. No new capabilities, just a repeatable *way of thinking*              | You (`/name`) or the model auto-triggers by description | `.claude/commands/*.md` or `skills/*/SKILL.md` |
| **Agent** (subagent)      | An **isolated worker** with its own context window, tool permissions, and model — for a delegated multi-step job              | The model delegates to it, or you name it               | `.claude/agents/*.md`                          |
| **MCP server**            | A **program or URL** that gives the AI genuinely new *capabilities* — tools (actions), resources (data), prompts              | The model calls its tools; you connect it               | External process / remote URL (`.mcp.json`)    |
| **Plugin**                | A **distributable bundle** of the above — commands + skills + agents + hooks + MCP servers + LSP servers, shipped as one unit | You install it from a marketplace                       | A repo listed in a marketplace                 |
| **LSP server**            | A **language server** giving real-time code intelligence — live diagnostics, go-to-definition, type info                      | Nobody "calls" it; it pushes automatically as you edit  | A separate binary, configured by `.lsp.json`   |




### The mental model in one picture

```
        ┌─────────────────────── PLUGIN (the shipping container) ───────────────────────┐
        │                                                                                │
        │  SKILLS         AGENTS          HOOKS          MCP SERVERS      LSP SERVERS    │
        │  (how to        (who does the  (when things   (what's newly    (what the code  │
        │   think)         delegated      auto-fire)     possible)        already says)  │
        │     │             work)                            │                │         │
        │     ▼               ▼                              ▼                ▼         │
        │  a repeatable   an isolated    run on save /   tools (actions)  live errors    │
        │  prompt         context +      commit / etc.   resources (data) definitions    │
        │                 model                          prompts          type info      │
        └────────────────────────────────────────────────────────────────────────────────┘
                     ▲                                              ▲
         CLAUDE.md / Cursor rules                        Model settings & caching
         (always-on behavior & context)                 (which model, how cheap)
```

**Read it this way:** a *skill* changes **how** the model thinks. An *MCP server* changes **what** the model can do. An *agent* is **who** you hand a big job to. An *LSP server* changes **what the model already knows** about your code without reading it. A *plugin* is **how you ship** it all. And `CLAUDE.md` / Cursor rules sit underneath as **always-on** context.

### The decision that trips everyone up


| Ask yourself…                                                         | Reach for a…   | Because…                                                                |
| --------------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------- |
| "I keep typing the same complex instructions"                         | **Skill**      | It's a prompt you want to reuse — no new capability needed              |
| "This is a big, multi-step job I want to hand off"                    | **Agent**      | It needs its own context so it doesn't clutter yours                    |
| "The AI *literally cannot do this* — read a file format, call an API" | **MCP server** | Only real code gives new capabilities                                   |
| "Claude keeps grepping for a function it could jump straight to"      | **LSP server** | Code intelligence comes from a language server, not from more prompting |
| "My whole team should get all of this with one install"               | **Plugin**     | Bundling + a marketplace is the distribution mechanism                  |


> **The single most useful heuristic:** *If you can accomplish it by writing better instructions, it's a skill. If it requires touching a system outside the chat, it's an MCP server. If it's a large delegated job, it's an agent. If it's a fact about your code that a compiler already knows, it's an LSP server. If you need to distribute it, it's a plugin.*



### How they compose — your portfolio is proof

The site you build today is all four ideas working together:

- A **skill** (`/parse-resume`) turns your résumé into structured `resume.json`
- A **resource** (the JSON Resume schema) is the contract the skill fills
- An **agent** (`portfolio-builder`) regenerates the entire static site from `resume.json` as one delegated job
- A **plugin** could bundle the skill + agent + schema so a teammate builds *their* portfolio with one install

Deterministic vs. generative: your `resume.json` **is the ground truth** (it never changes on its own); the **skill/agent generate** the site around it. Keep facts in data; keep judgment in prompts.

---



## What You're Building (10 min)

A single-page, static portfolio site — no build step, no framework — that reads one data file and renders it. This is the same shape as the reference site [amantalwar04.github.io/portfolio](https://amantalwar04.github.io/portfolio/): a profile header, summary, career timeline, education, skills, and contact.

```
portfolio/
  index.html          ← the page shell + section containers
  styles.css          ← all styling (one file)
  app.js              ← fetches resume.json and renders every section
  resume.json         ← YOUR data — the single source of truth (JSON Resume schema)
  profile.jpg         ← your photo
  .claude/
    commands/
      parse-resume.md  ← skill: résumé → resume.json
    agents/
      portfolio-builder.md  ← agent: resume.json → full site
  CLAUDE.md           ← project conventions
```

**The core idea:** you never hand-edit HTML to update your portfolio. You update `resume.json` (or re-run the parse skill on a new résumé), and the site re-renders itself. **Résumé-as-data.**

> **📁 Worked example:** A complete, runnable version of everything in this module lives in `[portfolio-example/](./portfolio-example/)` — the site, the `/parse-resume` and `/import-linkedin` skills, the `portfolio-builder` agent, a `CLAUDE.md`, and the installable `about-me` MCP server. Its `resume.json` is **sample data — replace it with your own.** You'll need your real résumé to make the exercise yours.

---



## Step 1: Turn Your Résumé Into Data (25 min)



### Why a schema?

If every portfolio invents its own data shape, no tool can read it. **JSON Resume** ([jsonresume.org/schema](https://jsonresume.org/schema/)) is an open standard — a shared contract for what a résumé's fields are called. Using it means your data is portable and any JSON Resume theme could render it too.

Here's the subset you'll use (`resume.json`):

```json
{
  "basics": {
    "name": "Your Name",
    "label": "Technical Communication Leader",
    "image": "profile.jpg",
    "email": "you@example.com",
    "phone": "+91 90000 00000",
    "summary": "20+ years aligning technical strategy with business goals...",
    "location": { "city": "Hyderabad", "region": "India" },
    "profiles": [
      { "network": "LinkedIn", "url": "https://www.linkedin.com/in/your-handle" }
    ]
  },
  "work": [
    {
      "name": "Autodesk",
      "position": "Principal Technical Writer",
      "startDate": "2018-04",
      "endDate": "",
      "summary": "Lead documentation strategy for platform services.",
      "highlights": [
        "Cut release-doc turnaround from 3 days to 4 hours",
        "Built the team's first AI-assisted review workflow"
      ]
    }
  ],
  "education": [
    { "institution": "Kakatiya University", "studyType": "MCA", "area": "Computer Applications", "startDate": "2000", "endDate": "2003" }
  ],
  "skills": [
    { "name": "Technical Writing", "keywords": ["DITA", "Markdown", "API docs"] },
    { "name": "AI Tooling", "keywords": ["Claude Code", "MCP", "Prompt design"] }
  ],
  "certificates": [
    { "name": "AI Documentation Practitioner", "issuer": "Aman Talwar", "date": "2026-07" }
  ]
}
```



### The `/parse-resume` skill

You won't type this JSON by hand. Create a skill that reads your existing résumé and produces it. Create `.claude/commands/parse-resume.md`:

```markdown
You convert a résumé into a valid JSON Resume file.

## Input
The résumé to convert is at: $ARGUMENTS
(It may be .pdf, .docx, .md, or .txt.)

## Task
1. Read the résumé.
2. Extract every fact into the JSON Resume schema (jsonresume.org/schema):
   basics, work, education, skills, certificates, projects.
3. For each work entry, write 2–4 achievement-focused `highlights`
   (start with a verb, include a number where the résumé gives one).
4. Use "YYYY-MM" for dates. Leave `endDate` empty for the current role.
5. Do NOT invent facts. If a field is missing, omit it — never guess a date or employer.

## Output Contract
Output ONLY the JSON object — no preamble, no markdown fences, no commentary.
It must be valid JSON and parse on the first try.
```

Run it:

```
/parse-resume ~/Documents/my-resume.pdf > resume.json
```

Open `resume.json` and check it. This is the one file you'll maintain from now on.

> **🟠 Advanced Insight:** Notice the **output contract** — "output ONLY the JSON." A skill whose output another program reads (here, your website) must be strict. This is the same hardening you'll apply to every production skill.

---



## Step 2: Generate the Static Site (25 min)

Now the page that renders `resume.json`. Three files, no framework.

### `index.html` — the shell

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Portfolio</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header id="hero"></header>
  <main>
    <section id="summary"></section>
    <section id="experience"><h2>Career Timeline</h2><div id="work-list"></div></section>
    <section id="education"><h2>Education</h2><div id="edu-list"></div></section>
    <section id="skills"><h2>Skills</h2><div id="skill-list"></div></section>
    <section id="contact"><h2>Get In Touch</h2><a id="contact-btn" class="btn">Email me</a></section>
  </main>
  <script src="app.js"></script>
</body>
</html>
```



### `app.js` — fetch data, render sections

```javascript
async function loadPortfolio() {
  const res = await fetch("resume.json");
  const data = await res.json();
  const b = data.basics || {};

  // Hero
  document.getElementById("hero").innerHTML = `
    <img src="${b.image || ""}" alt="${b.name}" class="avatar" />
    <h1>${b.name}</h1>
    <p class="label">${b.label || ""}</p>
    <p class="location">${b.location?.city || ""}, ${b.location?.region || ""}</p>
  `;

  // Summary
  document.getElementById("summary").innerHTML = `<p>${b.summary || ""}</p>`;

  // Experience (career timeline)
  document.getElementById("work-list").innerHTML = (data.work || []).map(w => `
    <article class="entry">
      <h3>${w.position} · ${w.name}</h3>
      <span class="dates">${w.startDate} – ${w.endDate || "Present"}</span>
      <p>${w.summary || ""}</p>
      <ul>${(w.highlights || []).map(h => `<li>${h}</li>`).join("")}</ul>
    </article>
  `).join("");

  // Education
  document.getElementById("edu-list").innerHTML = (data.education || []).map(e => `
    <article class="entry">
      <h3>${e.studyType}${e.area ? " · " + e.area : ""}</h3>
      <span class="dates">${e.startDate} – ${e.endDate || ""}</span>
      <p>${e.institution}</p>
    </article>
  `).join("");

  // Skills
  document.getElementById("skill-list").innerHTML = (data.skills || []).map(s => `
    <div class="skill"><strong>${s.name}</strong>: ${(s.keywords || []).join(", ")}</div>
  `).join("");

  // Contact
  const btn = document.getElementById("contact-btn");
  if (b.email) btn.href = `mailto:${b.email}`;
}
loadPortfolio();
```



### `styles.css` — starter (customize freely)

```css
:root { --accent: #0a66c2; --ink: #1a1a1a; --muted: #666; }
* { box-sizing: border-box; margin: 0; }
body { font-family: system-ui, sans-serif; color: var(--ink); line-height: 1.6; }
#hero { text-align: center; padding: 3rem 1rem; background: #f5f7fa; }
.avatar { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; }
main { max-width: 760px; margin: 0 auto; padding: 2rem 1rem; }
section { margin-bottom: 3rem; }
h2 { border-bottom: 2px solid var(--accent); padding-bottom: .3rem; }
.entry { padding: 1rem 0; border-bottom: 1px solid #eee; }
.dates { color: var(--muted); font-size: .9rem; }
.btn { display: inline-block; background: var(--accent); color: #fff; padding: .6rem 1.2rem; border-radius: 6px; text-decoration: none; }
```



### Preview locally

A static site needs to be *served* (not opened as a `file://`) so `fetch` works:

```bash
cd portfolio
python3 -m http.server 8000
# open http://localhost:8000
```

Change one line in `resume.json`, reload — the page updates. You never touched HTML.

---



## Step 3: Build the `portfolio-builder` Agent (15 min)

You've built a skill (`/parse-resume`) and a hand-written renderer. The **agent** ties them together and does the multi-step job for you: read the résumé, produce `resume.json`, and (re)generate the site files — as one delegated task with its own context.

Create `.claude/agents/portfolio-builder.md`:

```markdown
---
name: portfolio-builder
description: >
  Builds or rebuilds a static portfolio website from a résumé or from resume.json.
  Use when someone wants to create, regenerate, or restyle their portfolio site.
tools: Read, Write, Glob
model: sonnet
---

You build a static, framework-free portfolio site (HTML/CSS/JS) driven by resume.json.

## Steps
1. If resume.json is missing, read the résumé the user names and create it using
   the JSON Resume schema. Never invent facts.
2. Ensure index.html, styles.css, and app.js exist and render every section present
   in resume.json (basics, work, education, skills, certificates, projects).
3. If a section has no data, hide it — never show an empty heading.
4. Keep it accessible: alt text on images, semantic headings, sufficient contrast.

## Return
A short summary: which files you wrote, which résumé sections were rendered,
and the exact command to preview locally. Do not paste full file contents back.
```

Run it:

```
Use the portfolio-builder agent to rebuild my site from resume.json
```

**Why an agent here?** Generating four files and reconciling them against your data is a multi-step job with a lot of intermediate reading. Delegating it keeps that churn out of your main conversation — you get back a clean summary, not 300 lines of generated code.


| Field         | Why it matters                                                              |
| ------------- | --------------------------------------------------------------------------- |
| `description` | *When* the model auto-delegates — phrase it as a trigger                    |
| `tools`       | `Read, Write, Glob` — it needs to write files, but not run shell or delete  |
| `model`       | `sonnet` — site generation needs real reasoning; Haiku would be too shallow |


---



## Step 4: Create a GitHub Repo and Deploy (15 min)

Your site is on your laptop. To get a public URL, it needs to live in a **GitHub repository** with **GitHub Pages** turned on. There are two ways to create the repo — pick one.

### Prerequisites

- A free **GitHub account** ([github.com/signup](https://github.com/signup))
- **Git** installed (`git --version` should print a version)
- Your `portfolio/` folder with `index.html`, `styles.css`, `app.js`, `resume.json`

First, turn your folder into a Git repository:

```bash
cd portfolio
git init
git add .
git commit -m "Portfolio site from resume.json"
```



### Option A — Create the repo on GitHub.com (recommended, no extra tools)

1. Go to [github.com/new](https://github.com/new) (or click the **+** in the top-right → **New repository**).
2. **Repository name:** `portfolio`.
  - For a personal site at the *root* URL, name it `YOUR-USERNAME.github.io` instead.
3. **Visibility:** **Public** — GitHub Pages needs public on the free plan.
4. **Do NOT** check "Add a README", ".gitignore", or "license" — your folder already has files, and an empty repo avoids a merge conflict.
5. Click **Create repository.**
6. GitHub now shows a "…or push an existing repository" box. Copy the commands it gives you — they look like this (replace `YOUR-USERNAME`):

```bash
git remote add origin https://github.com/YOUR-USERNAME/portfolio.git
git branch -M main
git push -u origin main
```

> **First push authentication:** GitHub will ask you to sign in. Use a **Personal Access Token** as the password, not your account password — create one at [github.com/settings/tokens](https://github.com/settings/tokens) (Tokens (classic) → Generate new token → check the `repo` scope). Or install [GitHub Desktop](https://desktop.github.com/) / the `gh` CLI (Option B), which handle login for you.



### Option B — Create the repo from the terminal (GitHub CLI)

If you have the [GitHub CLI](https://cli.github.com/) installed and authenticated (`gh auth login`), it creates the repo and pushes in one command:

```bash
gh repo create portfolio --public --source=. --push
```



### Turn on GitHub Pages

However you created the repo:

1. On GitHub, open the repo → **Settings → Pages** (left sidebar).
2. **Source:** *Deploy from a branch.*
3. **Branch:** `main` · Folder: `/ (root)` → **Save.**
4. Wait ~1 minute, then refresh. Pages shows your live URL:
  `https://YOUR-USERNAME.github.io/portfolio/`

> **Troubleshooting:** a blank page usually means `resume.json` didn't load — open the browser console (F12). A **404** right after enabling Pages just means it hasn't finished the first build; wait a minute and refresh.



### Update it later

Edit `resume.json` (or re-run `/import-linkedin`), then push:

```bash
git add resume.json && git commit -m "Update experience" && git push
```

Pages redeploys automatically within a minute. **Your résumé is now a living, versioned website.**

---



## Bonus: An `about-me` MCP Server Others Can Install (15 min)

Your site is something people *look at*. An MCP server is something their *AI can query*. Ship both and your résumé becomes queryable: a recruiter who adds your server can ask their own Claude *"What's this person's experience with API documentation?"* and get a grounded, factual answer — straight from your `resume.json`.

The full server is in `[portfolio-example/about-me-mcp/](./portfolio-example/about-me-mcp/)`. It reuses the exact MCP patterns from Module 6 — tools, a resource, and a prompt — but its data is *you*:


| It exposes                                          | What a visitor's AI gets                            |
| --------------------------------------------------- | --------------------------------------------------- |
| Tool `get_summary`                                  | Your title, location, and professional summary      |
| Tool `get_experience` (optional `keyword`)          | Your work history, filterable ("API", "leadership") |
| Tool `get_skills` / `get_education` / `get_contact` | The rest of your background                         |
| Resource `about-me://resume`                        | Your full JSON Resume document                      |
| Prompt `introduce_me`                               | A factual intro drafted for a given audience        |


The key design choice: the server reads a **bundled** `data/resume.json` by default (with a `RESUME_PATH` override), so when someone installs it from npm it serves *your* data with no setup.

**Build and connect it:**

```bash
cd portfolio-example/about-me-mcp
npm install && npm run build
claude mcp add about-me -- node "$(pwd)/dist/index.js"
```

Then in Claude Code:

```
/mcp                                          # confirm about-me is connected
What is this person's experience with APIs?   # calls get_experience
```

**Publish it** (Module 6 method) so anyone can install with one line:

```bash
npm publish --access public
# others then run:
claude mcp add about-me -- npx -y about-me-aman
```

> **Portfolio power move:** bundle the `/parse-resume` skill + `portfolio-builder` agent into a **plugin**, and publish the `about-me` server to the registry. Now you can hand a colleague *one install* that builds their portfolio — and your own résumé is discoverable by any MCP-capable AI. That's the whole program in one artifact.

---



## Code Intelligence: LSP Servers (25 min)

The fifth building block, and the one most people never touch. It's also the only one in this program that **isn't a Claude concept at all.**

### What LSP actually is

**Language Server Protocol** is an open standard Microsoft published in 2016 and now stewards publicly. It solves an M×N problem: before LSP, supporting *N* languages in *M* editors meant writing M×N integrations. LSP makes it M+N — each language writes **one** server, each editor writes **one** client.

The same `pyright-langserver` binary powers Python IntelliSense in VS Code, Cursor, Neovim, Zed, JetBrains, Sublime, Emacs, and Claude Code. Nobody rewrote it for any of them.


| Tool                               | Speaks LSP?                                                          |
| ---------------------------------- | -------------------------------------------------------------------- |
| VS Code, Cursor, Windsurf          | ✅ Native — LSP was designed for VS Code                              |
| Neovim, Zed, Sublime, Emacs, Helix | ✅ Built-in clients                                                   |
| JetBrains (IntelliJ, PyCharm…)     | ✅ Supported alongside their own native engines                       |
| **Claude Code**                    | ✅ Via a plugin's `.lsp.json`                                         |
| GitHub Copilot                     | ⚠️ Consumes its *host editor's* LSP data; isn't itself an LSP client |


An LSP server you write is portable. A Claude **skill** or **MCP server** is not — an MCP server needs an MCP-capable host; a language server runs in any LSP editor, unchanged.

### The idea underneath: a symbol graph

Here's the thing to actually internalize, because everything else follows from it.

**LSP is not "a channel for putting squiggly lines in a file." It is a protocol for exposing a *symbol graph* over a structured document.**

A symbol graph has two kinds of node:

- **Definitions** — a place where a name is introduced. A function, a class, a type, a heading.
- **References** — a place where that name is used. A call site, an import, a link.

Once a server has built that graph, every capability in the protocol is just a different *query* against it:


| Query                                | What it asks the graph                                           |
| ------------------------------------ | ---------------------------------------------------------------- |
| `textDocument/definition`            | This reference — where's its definition?                         |
| `textDocument/references`            | This definition — where are all its references?                  |
| `textDocument/documentSymbol`        | What definitions live in this one file?                          |
| `workspace/symbol`                   | Find a definition by name, anywhere in the project               |
| `textDocument/hover`                 | Tell me about the symbol under the cursor                        |
| `textDocument/completion`            | What symbols are valid at this position?                         |
| `textDocument/rename`                | Change this definition **and every reference to it**, atomically |
| `textDocument/publishDiagnostics`    | What does the graph prove is broken?                             |
| `callHierarchy/*`, `typeHierarchy/*` | Walk the graph transitively                                      |


Notice that **diagnostics come last, and they're derivative.** An unresolved reference is a broken edge in the graph. A type error is a mismatch between what a definition promises and what a reference expects. Squiggles are an *output* of understanding, not the point of it.

> **🟠 Advanced Insight:** This is the test for whether something belongs in an LSP server. *Does my document have definitions and references?* If yes, LSP is the right shape and you'll get seven capabilities from one index. If no — if you just want to annotate a file with a computed number — you're using the diagnostic channel as a generic notification pipe, and a **hook** is the honest tool for that job.



### How it works on the wire

A language server is a **separate process**. The editor launches it and they exchange **JSON-RPC 2.0** messages over stdin/stdout, each framed with a `Content-Length` header. That's the whole transport — no HTTP, no sockets (unless you opt into `transport: "socket"`).

```
Editor (client)                          Language server (process)
     │                                              │
     │  ──── initialize ──────────────────────────► │  root path; "what can you do?"
     │  ◄─── capabilities ───────────────────────── │  "definition, references, hover, …"
     │                                              │      ← builds its index here
     │  ──── textDocument/didOpen ────────────────► │  full file contents
     │  ◄─── publishDiagnostics ─────────────────── │  server-initiated, unprompted
     │                                              │
     │  ──── textDocument/didChange ──────────────► │  you typed something
     │  ◄─── publishDiagnostics ─────────────────── │  re-derived from the updated graph
     │                                              │
     │  ──── textDocument/definition ─────────────► │  "what's at line 12, col 4?"
     │  ◄─── Location ───────────────────────────── │  file + line of the definition
     │                                              │
     │  ──── shutdown / exit ─────────────────────► │
```

Three things to notice:

1. **Diagnostics are pushed, not pulled.** The server volunteers them; nothing has to ask.
2. **The server owns the document state.** The editor streams edits; the server maintains its own copy and re-analyzes.
3. `initialize` **is where the index gets built.** That's why a big Java project takes a while before go-to-definition starts working.



### The real use cases

Where a language server genuinely earns its keep:

**1. Compiled and typed languages — the classic case.** `gopls`, `rust-analyzer`, `pyright`, `typescript-language-server`, `clangd`. Type errors without a build, refactors that can't miss a call site.

**2. Any language, for navigation alone.** Even in untyped code, "find all references to this function" beats a `grep` that also matches a comment, a string literal, and a similarly named method on a different class.

**3. Configuration and schema-driven formats.** `yaml-language-server` validates against JSON Schema — this is what gives you OpenAPI autocomplete and inline spec errors in an editor. Also Terraform (`terraform-ls`), Kubernetes manifests, and JSON with `$schema`.

**4. Prose and documentation.** This surprises people, and it's the one most relevant to this program:


| Server                                                 | What it does                                                        |
| ------------------------------------------------------ | ------------------------------------------------------------------- |
| `[marksman](https://github.com/artempyanykh/marksman)` | Markdown LSP — link completion, go-to-definition, backlinks, rename |
| `[markdown-oxide](https://oxide.md/)`                  | Markdown LSP with wikilink and daily-note support                   |
| `[vale-ls](https://vale.sh/)`                          | The Vale prose linter, exposed over LSP                             |
| `[ltex-ls](https://valentjn.github.io/ltex/)`          | LanguageTool grammar checking for Markdown, LaTeX, AsciiDoc         |
| `[harper-ls](https://writewithharper.com/)`            | Fast offline grammar checker as a language server                   |


These are legitimate because **prose with cross-references has a symbol graph too.** A heading is a definition; a link to `#that-heading` is a reference. Everything follows.

**5. Domain-specific languages.** Protobuf, GraphQL SDL, SQL, Dockerfile, shell (`bash-language-server`). If your team has an internal DSL, this is the case where writing your own is genuinely worth it.

### Using LSP effectively in Claude Code

Here's what differs from every other editor. In VS Code, LSP output goes to **a human** — a red squiggle, a hover tooltip. In Claude Code, it goes to **Claude**.

**What Claude can do with a running language server:**

- Jump to a symbol's definition
- Find all references to a symbol
- Get type information at a position
- List symbols in a file
- Search for a symbol by name across the workspace
- Find implementations of an interface
- Trace call hierarchies

**And what happens without being asked:** after every edit Claude makes, type errors and warnings are injected into its context automatically. No build step, no test run, no `npx tsc` round-trip.

**Why it saves tokens rather than costing them.** This is the counterintuitive part and the reason Anthropic lists code-intelligence plugins under *cost optimization*. A single "go to definition" replaces a `Grep` plus reading three or four candidate files. Symbol lookups substitute for broad file reads, so **net context usage goes down**.

#### The practical playbook

1. **Install the binary first, the plugin second.** The plugin only configures the connection — it never installs the server. Skip step one and `/plugin` → **Errors** shows `Executable not found in $PATH`.
  ```bash
   npm install -g typescript-language-server typescript
  ```
   If the marketplace isn't found: `/plugin marketplace add anthropics/claude-plugins-official`. If the plugin isn't found, your local copy is stale: `/plugin marketplace update claude-plugins-official`.
2. **Verify it's actually running.** `/reload-plugins` prints a count — look for `1 plugin LSP server`. A server that fails to *start* appears in the `/plugin` **Errors** tab. A server with an *invalid config* is skipped **silently** — `claude --debug` is the only place that says why.
3. **Enable it for the whole team, not just yourself.** Add the plugin to the `enabledPlugins` project setting in `.claude/settings.json` so every clone of the repo gets it.
4. **Pair it with context hygiene.** `claudeMdExcludes` and `Read` deny rules keep irrelevant files *out* of context; code intelligence keeps Claude from reading through what remains just to locate a definition. They compose.
5. **Turn diagnostics off, keep navigation on**, when a legacy repo has thousands of pre-existing warnings that would flood context:
  ```json
   { "mypy": { "command": "…", "extensionToLanguage": { ".py": "python" }, "diagnostics": false } }
  ```
6. **Watch for extension collisions.** When two enabled servers declare the same extension, the **first registered wins** and the other never starts. `/plugin` shows a warning naming the active one.

**Official plugins:** C/C++ (`clangd-lsp`), C# (`csharp-lsp`), Go (`gopls-lsp`), Java (`jdtls-lsp`), Kotlin (`kotlin-lsp`), Lua (`lua-lsp`), PHP (`php-lsp`), Python (`pyright-lsp`), Rust (`rust-analyzer-lsp`), Swift (`swift-lsp`), TypeScript (`typescript-lsp`).

### Writing your own: `.lsp.json`

Only write one when nothing already exists for your format. The config lives at `.lsp.json` in the plugin root (or inline as `lspServers` in `plugin.json`):

```json
{
  "go": {
    "command": "gopls",
    "args": ["serve"],
    "extensionToLanguage": { ".go": "go" }
  }
}
```

`command` and `extensionToLanguage` are the only required fields. Useful optional ones:


| Field                                | Why you'd set it                                              |
| ------------------------------------ | ------------------------------------------------------------- |
| `env`                                | Environment variables for the server process                  |
| `diagnostics`                        | `false` keeps navigation but stops auto-injecting diagnostics |
| `restartOnCrash` / `maxRestarts`     | Crash recovery (defaults: `true`, unbounded)                  |
| `startupTimeout` / `shutdownTimeout` | Milliseconds to wait on start/stop                            |
| `initializationOptions` / `settings` | Server-specific configuration                                 |


---



### 🛠 Exercise: a language server for your documentation (30 min)

A complete, dependency-free, runnable version is in `[docs-lsp/](./docs-lsp/)`. Read `server.js` — it's ~450 lines and implements seven LSP capabilities.

**The premise.** A documentation set is a symbol graph hiding in plain sight:

```
  a heading   ══ is a ══►  DEFINITION      ## Authentication  →  #authentication
  a link      ══ is a ══►  REFERENCE       [auth](./api.md#authentication)
```

Build that index once and every capability falls out of it:


| Capability            | What it gives you in a docs repo                                              |
| --------------------- | ----------------------------------------------------------------------------- |
| **Definition**        | Cursor on a link → jump to that heading, in that file, at that line           |
| **References**        | Cursor on a heading → **every page that links to it**. Backlinks, for free.   |
| **Document symbols**  | The heading outline of a page, nested by level                                |
| **Workspace symbols** | Search every heading across the whole docs set                                |
| **Completion**        | After `](` completes file paths; after `#` completes that file's real anchors |
| **Hover**             | Preview the target heading and its first two lines without leaving the page   |
| **Diagnostics**       | Broken links, dead anchors (with "did you mean?"), duplicate headings         |


That last one is worth dwelling on. Two `## Authentication` sections mean the second one's anchor is silently `#authentication-1` — so every link written to `#authentication` lands on the first. Nobody catches that by reading. The graph catches it instantly.

**Run it now:**

```bash
cd modules/07-capstone/docs-lsp
node probe.js        # watch the protocol against a fixture
node scan.js         # lint every .md in this repo
```

`probe.js` is a minimal LSP *client* — it launches the server, sends a scripted conversation, and prints the replies. Seeing both halves of the protocol in one terminal is the fastest way to understand it.

`scan.js` is the same server in batch mode: open every file, collect diagnostics, exit non-zero on errors. **The index doesn't care who's asking** — the graph that answers go-to-definition in your editor also answers "is this docs set internally consistent?" in a pre-commit hook. One implementation, two surfaces.

> **What the first real scan found.** Running `scan.js` against this repo immediately surfaced two `## macOS` headings in `SETUP_GUIDE.md` — meaning the second one's anchor is silently `#macos-1`. Nothing links to it *yet*, which is exactly what makes it dangerous: the first person to add a table of contents will point at `#macos` and land on the wrong section.
>
> It also found a bug **in the server itself** — twice over. The README quotes link syntax as an example inside backticks, and the parser flagged it as a broken link: fenced blocks were skipped, inline code spans weren't. The obvious fix is a regex, `/`+[^`]`*+/`, blanking each span with spaces of *equal length* so character offsets stay valid.
>
> That fix was also wrong. CommonMark closes a code span with a backtick run of *exactly* the opening length — which is how a double-backtick span quotes a single-backtick one. On ``[text](./api.md)`` the naive regex masks the delimiters and leaves the link exposed in the middle. It needs a scanner that measures the opening run and searches for a matching close.
>
> The fixture never caught either one. **Real documents are the test suite for a language server** — a hand-written fixture only contains the mistakes you already thought of. Both cases are now *in* the fixture, so they can't come back.

**Build it yourself in three steps:**

1. **Frame the protocol.** Read stdin, parse `Content-Length: N\r\n\r\n` + N bytes of JSON, dispatch on `method`. Always reply to anything with an `id`, even on error — an unanswered request hangs the client forever. Never reply to a notification.
2. **Build the index.** On `initialize`, walk the workspace root for `.md` files. For each, extract headings (with GitHub-style anchor slugs) and links (resolved to an absolute path plus optional anchor). **Skip both fenced code blocks and inline code spans** — a docs repo is full of code samples and quoted link syntax, and neither is a real reference. Getting this wrong is the difference between a useful server and one that cries wolf constantly.
3. **Answer queries against it.** `definition` finds the link under the cursor and returns its target's line. `references` scans every link in the index for ones pointing at the heading under the cursor. Same data, different questions.

**Then extend it** — in rough order of value:

- **A rename code action.** `textDocument/rename` on a heading: change the heading text *and* rewrite every inbound link's anchor in one atomic `WorkspaceEdit`. This is the capability that makes an LSP feel like magic, and it is only possible because you already have the reference graph.
- **Glossary terms as symbols.** Treat a `glossary.md` entry as a definition and every occurrence of that term elsewhere as a reference. Go-to-definition on domain vocabulary — the highest-value feature for any docs set with house terminology.
- **Orphan detection.** Flag documents with zero inbound links. In a large docs set, orphans are pages nobody can reach by navigation.
- **Frontmatter validation.** Parse YAML frontmatter; require `title`, `owner`, `last_reviewed`; warn when `last_reviewed` is older than 12 months.
- **Style-guide diagnostics.** Flag banned terms or heading capitalization violations — then compare your result against [Vale](https://vale.sh/), and seriously consider just running `vale-ls` instead.

> **Know when *not* to build one.** If `marksman` already does link navigation and `vale-ls` already runs your style guide, wiring those up is a `.lsp.json` and zero code. Write your own only for a format nothing supports, or a rule nothing else can express.



### LSP vs. MCP — the distinction to hold onto

They're both "a separate process that extends the AI," which is exactly why they get confused:


|                   | MCP server                              | LSP server                                      |
| ----------------- | --------------------------------------- | ----------------------------------------------- |
| **Who initiates** | The model decides to call a tool        | The server pushes; the editor asks              |
| **Shape**         | Tools, resources, prompts               | Definitions, references, symbols, diagnostics   |
| **Mental model**  | A set of *actions*                      | A *graph* over a document                       |
| **Scope**         | Anything — APIs, databases, the network | Understanding a structured document             |
| **Portability**   | Needs an MCP-capable host               | Any LSP editor, unchanged                       |
| **Context cost**  | Adds tool definitions                   | Often *reduces* it — lookups replace file reads |
| **Standard by**   | Anthropic (2024)                        | Microsoft (2016)                                |


**The heuristic:** if the answer requires *acting on the world*, it's MCP. If it's a fact that's already latent in the structure of your files, it's LSP.

Your `about-me` MCP server reaches out to fetch and filter your résumé — an action. A docs language server just makes explicit what your Markdown already encodes.

---



## Tuning the Model: CLAUDE.md, Cursor Rules & Context Optimization (15 min)

These are the optimizations that make Claude behave consistently and cheaply on *any* project — including this one.

### 1. `CLAUDE.md` — the always-on instruction file

Claude Code **loads** `CLAUDE.md` **automatically into every session.** Put it in your portfolio repo so Claude always knows the rules:

```markdown
## This project
- Static portfolio site. Single source of truth is resume.json (JSON Resume schema).
- Never hand-edit index.html to change content — update resume.json and re-render.
- Never invent résumé facts. If data is missing, omit the field.

## Style
- Keep the site framework-free: plain HTML/CSS/JS, no build step.
- Accessible by default: alt text, semantic headings, WCAG-AA contrast.

## How to work with me
- No preambles. Show the diff, skip the summary.
```

Three levels stack (most specific wins): `~/.claude/CLAUDE.md` (global) → `./CLAUDE.md` (this repo) → `./subdir/CLAUDE.md` (one folder).

Build one with `/init` (Claude scans the repo and drafts it), then trim — every line is loaded into *every* prompt, so it costs tokens forever. Keep stable rules at the top for better caching.

### 2. Cursor rules — the same idea, in Cursor

If your team uses **Cursor**, the equivalent is `.cursor/rules/*.mdc` (the legacy `.cursorrules` still works but is deprecated). The difference: Cursor rules scope by **file glob**, `CLAUDE.md` by folder.

```markdown
---
description: Portfolio site conventions
globs: ["**/*.js", "**/*.html"]
alwaysApply: false
---
- resume.json is the source of truth; never hardcode résumé content in markup.
- Keep it framework-free and accessible.
```

Point both `CLAUDE.md` and a Cursor rule at the same conventions so standards match no matter which tool you open.

### 3. Model selection & cost habits

- **Model:** `/model` to switch — Sonnet for site generation, Haiku for cheap bulk passes, Opus for the hardest reasoning. Pin a model **per agent** (your `portfolio-builder` uses Sonnet).
- **Read once, reference thereafter** — re-reading files is the #1 token waster.
- **Install a code-intelligence plugin** — on a large repo, letting Claude jump to a definition instead of grepping and reading four files is one of the biggest token savings available.
- **Batch independent actions** into one message.
- **Prompt caching** rewards stable-content-first — that's why `CLAUDE.md` rules stay put.
- `/clear` between unrelated tasks; `/compact` to summarize a long session.

---



## Production Hardening (10 min)

Before you call the site done:

1. **Validate the data.** A broken `resume.json` breaks the whole page. Add a guard in `app.js`:
  ```javascript
   try { data = await (await fetch("resume.json")).json(); }
   catch { document.body.innerHTML = "<p>Could not load resume.json — check it's valid JSON.</p>"; return; }
  ```
2. **Hide empty sections.** Never render a "Certifications" heading with nothing under it.
3. **Output contracts on your skills.** `/parse-resume` and `/import-linkedin` must output *only* JSON — already done above. That's what lets you pipe them to a file.
4. **Version your data.** `resume.json` is in Git — every edit is a diff you can revert. That *is* your version history.
5. **Don't commit secrets.** Your LinkedIn client secret lives in the serverless function's environment, never in the repo. Add a `.gitignore` for any local `.env`.

---



## Discussion and Wrap-Up (5 min)



### Reflection Questions

1. Which primitive did the most work in your build — the skill, the agent, or plain code? Why?
2. What's the trade-off you accepted by using OIDC sign-in *plus* a manual data export instead of a live API sync?
3. What would you bundle into a plugin so a colleague could build their portfolio in one step?
4. Your `about-me` MCP server and an LSP server are both separate processes that extend the AI. What decides which one a given problem needs?
5. An LSP server you write runs in Cursor, Neovim, and Claude Code unchanged. An MCP server needs an MCP-capable host. When is that portability worth designing for?
6. Pick a file format your team owns — an OpenAPI spec, a config schema, a content model. Does it have definitions and references? If so, sketch what go-to-definition and find-references would mean in it.
7. Code intelligence is listed as a *cost* optimization, not just a quality one. Why does giving Claude more information end up using fewer tokens?

---



## Homework — before the showcase

1. **Ship your portfolio** to GitHub Pages and confirm the public URL loads on your phone.
2. **Populate** `resume.json` with your real experience (via `/parse-resume` and/or `/import-linkedin`).
3. **Write a** `CLAUDE.md` for the repo (run `/init`, then trim it).
4. **Install a code-intelligence plugin** for your language and confirm `/reload-plugins` reports at least `1 plugin LSP server`.
5. **Run** `node probe.js` in `[docs-lsp/](./docs-lsp/)`, then point the server at a real docs folder of your own and fix whatever broken links it finds.
6. **Prepare a 5-minute demo** for the showcase: show the site, then change `resume.json` live and watch it re-render.

---



## 🟠 Advanced Checklist

Before the showcase, confirm you can:

- [ ] Explain when to use a skill vs. an agent vs. an MCP server vs. an LSP server vs. a plugin, and how they compose
- [ ] Convert a résumé into valid `resume.json` (JSON Resume schema) with `/parse-resume`
- [ ] Render a static site from `resume.json` with no framework and no build step
- [ ] Build a `portfolio-builder` agent (`name`/`description`/`tools`/`model`) and run it
- [ ] Explain why Sign in with LinkedIn returns only basic profile fields, not job history
- [ ] Import work experience from a LinkedIn data export into `resume.json`
- [ ] Deploy to GitHub Pages and produce a public URL
- [ ] Build and connect the `about-me` MCP server so another AI can query your background
- [ ] Explain what LSP is, why it's an open Microsoft standard rather than a Claude feature, and name three editors that speak it
- [ ] Explain the **symbol graph** — definitions vs. references — and why diagnostics are derived from it rather than being the point of it
- [ ] Describe the LSP lifecycle — `initialize` → `didOpen`/`didChange` → `publishDiagnostics` → `shutdown` — and say which messages the *server* initiates
- [ ] Name a real LSP use case outside programming languages, and the production server that does it
- [ ] Install a code-intelligence plugin, verify the binary is on `$PATH`, and confirm `/reload-plugins` reports the server
- [ ] Explain why symbol lookups *reduce* net context usage instead of adding to it
- [ ] Run or extend `docs-lsp`, and say which LSP request answers "what links to this heading?"
- [ ] State the MCP-vs-LSP heuristic: acting on the world vs. facts already latent in your files
- [ ] Say when *not* to write a language server — and name an off-the-shelf one you'd use instead
- [ ] Write a `CLAUDE.md`; explain Cursor rules' glob scoping
- [ ] Name three context/cost optimizations and why caching favors stable-content-first