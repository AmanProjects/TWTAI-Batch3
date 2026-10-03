# Module 7 (Writers' Track): Capstone — Your Portfolio, Single-Sourced

## 🟡 Intermediate → 🟠 Advanced

**Duration:** 2 hours | **Prerequisite:** Modules 1–5 (Module 6 helpful, not required)
**Who this is for:** technical writers, content designers, and docs leads who do **not** write code.

> **Choosing a track.** This is the writers' version of Module 7. It produces the *same* live portfolio site as [`../07-capstone/`](../07-capstone/) but you never write HTML, CSS, or JavaScript, and you never build a language server. If you write code comfortably and want the protocol-level material, take the [engineering track](../07-capstone/lesson.md) instead. Facilitators: run one or the other, not both.

---

## What This Module Really Is

You already know how to do this. You've done it for years.

You take unstructured source material, put it into a **structured format**, keep **one source of truth**, and publish it to **multiple outputs**. That's single-sourcing. That's DITA. That's every content model you've ever built.

Today you do it to your own résumé:

| The docs concept you know | Today's version |
|---|---|
| Content source (DITA topics, Markdown source) | `resume.json` — your résumé as structured data |
| A schema / content model | **JSON Resume** — an open standard for what a résumé's fields are called |
| A publishing pipeline | A **skill** and an **agent** that render the site |
| An output (PDF, HTML, help centre) | A live website at a public URL |
| Your CMS | GitHub — free hosting, full version history |

**The rule that makes it work:** you never hand-edit the website. You edit the source, and the output regenerates. Exactly like your docs pipeline.

By the end you'll have a real URL you can put on your résumé — like [amantalwar04.github.io/portfolio](https://amantalwar04.github.io/portfolio/).

### Learning objectives

By the end of this module you will be able to:

- Explain **skill vs. agent vs. MCP server vs. plugin** in plain language, and pick the right one
- Turn your own résumé into structured `resume.json` using an open schema
- Direct an **agent** to build a complete website from that data — reviewing its work, not writing it
- Publish to the web and get a public URL, without using the command line
- Update the site later by changing **one file**
- Use a **link checker** on your own docs set and fix what it finds
- Write a `CLAUDE.md` so Claude follows your conventions in every session

### What you will *not* be asked to do

No hand-written HTML, CSS, or JavaScript. No terminal, unless you want it. No npm. No JSON-RPC. No language server internals.

You will **read** code that Claude produces and judge whether it's right. That's editing, and you're already good at it.

---

## Part 1: The Four Building Blocks, In Plain Language (20 min)

You've met several things that "extend the AI." They blur together. Here they are with no jargon.

| Block | What it actually is | The docs analogy |
|---|---|---|
| **Skill** | A saved set of instructions you reuse | A **style guide entry** — "here's how we always do this" |
| **Agent** | A helper you hand a whole job to; it works separately and reports back | A **freelancer** you brief once and who returns a finished draft |
| **MCP server** | A real program that gives the AI a new ability it genuinely lacks | A **plugin for your CMS** — new capability, not new instructions |
| **Plugin** | A bundle of the above that a teammate installs in one step | A **template pack** you distribute to the team |

### The decision that trips everyone up

| If you're thinking… | Reach for a… | Because… |
|---|---|---|
| "I keep typing the same long instructions" | **Skill** | It's a prompt you want back. No new ability needed. |
| "This is a big job and I don't want the mess in my chat" | **Agent** | It works in its own space and hands back a summary |
| "The AI genuinely *cannot* do this — read our CMS, hit an API" | **MCP server** | Only real code adds real abilities |
| "My whole team should get all of this at once" | **Plugin** | Bundling is how you distribute |

> **The one-line heuristic:** *If better instructions would fix it, it's a skill. If it needs to touch a system outside the chat, it's an MCP server. If it's a big delegated job, it's an agent. If you need to hand it to other people, it's a plugin.*

### Your portfolio uses three of the four

- A **skill** (`/parse-resume`) turns your résumé document into structured `resume.json`
- An **agent** (`portfolio-builder`) builds the whole website from that data
- A **plugin** *could* bundle both, so a colleague builds theirs in one install

**The division of labour is the important part:** facts live in the data, judgment lives in the prompts. Your `resume.json` never changes on its own. The skill and agent generate everything around it. This is the same discipline as keeping content out of your stylesheet.

---

## Part 2: Set Up (10 min)

You need three things. Nothing else.

| What | How to get it | How to check it worked |
|---|---|---|
| **Claude Code** | Already installed from Module 1 | Type `claude` in a terminal and it opens |
| **A GitHub account** | Free at [github.com/signup](https://github.com/signup) | You can log in |
| **Your résumé** | A PDF, Word doc, or text file | You can find it on your computer |

Then make a folder for the project. Anywhere is fine — Desktop is fine.

```
Desktop/
  portfolio/          ← make this folder, then open Claude Code inside it
```

Open Claude Code in that folder:

```bash
cd ~/Desktop/portfolio
claude
```

> **That's the only terminal command in this module** that you can't avoid. Everything after this happens in conversation with Claude, or in a web browser.

> **📁 A finished example to look at:** [`../07-capstone/portfolio-example/`](../07-capstone/portfolio-example/) is a complete working version — the site, the skills, the agent, a `CLAUDE.md`. Its `resume.json` is **sample data**. Look at it to see where you're heading; don't copy it, because the point is that it's *yours*.

---

## Part 3: Your Résumé Becomes Content (25 min)

### Why a schema, and why you already believe in this

Every portfolio site that invents its own field names is a content silo. No other tool can read it.

**JSON Resume** ([jsonresume.org/schema](https://jsonresume.org/schema/)) is an open standard — an agreed vocabulary for what a résumé's parts are called. `basics`. `work`. `education`. `skills`. It's a content model, published and shared, exactly like DITA is for topics.

Use it and your data is portable: any JSON Resume theme, any other tool, any future site can read it.

Here's what a fragment looks like. You will not type this — read it to understand the shape:

```json
{
  "basics": {
    "name": "Your Name",
    "label": "Senior Technical Writer",
    "email": "you@example.com",
    "summary": "12 years turning complex platform services into docs people finish.",
    "location": { "city": "Hyderabad", "region": "India" }
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
  ]
}
```

**Read it as a content model.** `basics` is your topic metadata. `work` is a repeating element. `highlights` is a list inside it. If you've ever specified a content type, you've written something harder than this.

**The one rule of JSON:** every `{` needs a `}`, every `[` needs a `]`, every item except the last needs a comma after it. When it breaks, that's almost always why — and you'll ask Claude to fix it rather than hunting yourself.

### Create the `/parse-resume` skill

You're not typing that JSON. You're writing a skill that produces it — and *this* is the part where your professional judgment does the real work.

In Claude Code, create the file `.claude/commands/parse-resume.md` (ask Claude to create it if you'd rather not):

```markdown
You convert a résumé into a valid JSON Resume file.

## Input
The résumé to convert is at: $ARGUMENTS
(It may be .pdf, .docx, .md, or .txt.)

## Task
1. Read the résumé.
2. Extract every fact into the JSON Resume schema (jsonresume.org/schema):
   basics, work, education, skills, certificates, projects.
3. For each role, write 2–4 achievement-focused `highlights`.
   Start with a verb. Include a number wherever the résumé gives one.
4. Use "YYYY-MM" for dates. Leave `endDate` empty for the current role.
5. Do NOT invent facts. If a field is missing, omit it —
   never guess a date, a job title, or an employer.

## Output Contract
Output ONLY the JSON object — no preamble, no markdown fences, no commentary.
It must be valid JSON and parse on the first try.
```

Run it:

```
/parse-resume ~/Documents/my-resume.pdf
```

Claude reads your résumé and prints the JSON. Ask it to save the result as `resume.json`:

```
Save that as resume.json in this folder.
```

### Now do the part only you can do (10 min — don't skip it)

Open `resume.json` and **edit it as content**. This is the highest-value ten minutes in the module.

| Check | What you're looking for |
|---|---|
| **Accuracy** | Every date, title, and employer correct? AI transcription drifts. |
| **Invented facts** | Anything in there that isn't in your résumé? Delete it. |
| **Weak highlights** | "Responsible for documentation" → "Rewrote 40 API reference pages; support tickets down 30%" |
| **Verb-first** | Every highlight starts with a verb |
| **Numbers** | Every claim that *has* a number, *shows* the number |
| **Length** | 2–4 highlights per role, one line each |

> **🟡 This is the module's real lesson.** The AI structured your content in thirty seconds. It cannot tell you which achievement matters most to a hiring manager, or that "supported the release process" undersells what you did. **The AI does the transformation; you do the judgment.** That split is the whole job now.

If the JSON breaks while you edit, paste the error to Claude: `This JSON is invalid, fix it and keep all my content.`

---

## Part 4: Direct the Agent to Build the Site (30 min)

Here's the shift. The engineering track hand-writes `index.html`, `styles.css`, and `app.js`. You're going to **brief a specialist and review the result** — the thing you already do with contractors, designers, and SMEs.

### Create the `portfolio-builder` agent

Ask Claude to create `.claude/agents/portfolio-builder.md`, or make the file yourself:

```markdown
---
name: portfolio-builder
description: >
  Builds or rebuilds a static portfolio website from resume.json.
  Use when someone wants to create, regenerate, or restyle their portfolio site.
tools: Read, Write, Glob
model: sonnet
---

You build a simple portfolio website driven entirely by resume.json.

## Rules
1. resume.json is the ONLY source of content. Never put résumé text
   directly into the HTML.
2. Create exactly three files: index.html, styles.css, app.js.
   No frameworks, no build step, no dependencies.
3. Render every section present in resume.json: basics, work, education,
   skills, certificates, projects.
4. If a section has no data, hide it. Never show an empty heading.
5. Accessible by default: alt text on images, headings in order,
   text that passes WCAG AA contrast.
6. Readable on a phone.

## Return
A short summary: which files you wrote, which sections were rendered,
and the exact command to preview the site locally.
Do NOT paste the file contents back to me.
```

**Read that agent file again — it's a creative brief.** Scope, constraints, house rules, deliverable, and "don't send me the raw files." You've written this document a hundred times for a different medium.

| Field | Why it's there |
|---|---|
| `description` | Tells Claude *when* to use this agent — phrase it as a trigger |
| `tools` | `Read, Write, Glob` — it can create files, but can't delete or run commands |
| `model` | `sonnet` — enough reasoning for real design work |

### Run it

```
Use the portfolio-builder agent to build my site from resume.json
```

It works for a minute and returns a summary — not 300 lines of code in your chat. That's the point of an agent.

### Preview it

Ask Claude:

```
Start a local preview of the site and tell me the URL to open.
```

It'll start a small local server and give you an address like `http://localhost:8000`. Open it in your browser.

> **If the page is blank:** the data file didn't load. Tell Claude exactly that — *"the page is blank"* — and let it diagnose. Do not go looking through the code yourself.

### Now review it like an editor (15 min)

The site works. Is it *good*? Go through it the way you'd review a draft:

| Review pass | Ask yourself | If it's wrong, say this to Claude |
|---|---|---|
| **Content** | Is anything shown that shouldn't be? Missing? | "The certificates section is missing. Add it." |
| **Hierarchy** | Does the most important thing come first? | "Move the summary above the timeline." |
| **Scanability** | Can someone get the gist in 10 seconds? | "Job titles need more weight than company names." |
| **Voice** | Does it sound like you? | "Too corporate. Warmer, first person." |
| **Mobile** | Resize the browser narrow — still readable? | "Text is too small on mobile. Fix it." |
| **Accessibility** | Ask Claude: *"Check this site for accessibility issues and fix them."* | Let it audit itself |

**Iterate in plain English.** You are the art director:

```
Make the header less tall and put my photo on the left instead of centred.
Use a warmer accent colour — something in the amber range, not blue.
Add generous whitespace between career entries; it feels cramped.
```

Reload after each change. Keep going until you'd be happy sending the link to a hiring manager.

> **🟡 What just happened.** You produced a professional website and wrote zero lines of code. What you *did* write was a precise brief and six rounds of specific, actionable feedback. That's not a lesser contribution — on any real project it's the scarcer one.

---

## Part 5: Publish It (20 min)

Your site is on your laptop. To get a public URL, it needs to be on GitHub with **GitHub Pages** switched on.

**Two routes.** Pick the browser one unless you're already comfortable with Git.

### Route A — Your browser only (recommended)

No terminal. No Git. Roughly six minutes.

1. Go to [github.com/new](https://github.com/new).
2. **Repository name:** `portfolio`
   *(For a site at your root address instead, name it `YOUR-USERNAME.github.io`.)*
3. **Visibility:** **Public** — Pages requires public on the free plan.
4. **Do not tick** "Add a README", ".gitignore", or "license". Leave the repo empty.
5. Click **Create repository.**
6. On the next screen, click **uploading an existing file**.
7. Open your `portfolio` folder and **drag these four files** into the browser window:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `resume.json`
   - *(and your photo, if you used one)*
8. Scroll down, click **Commit changes.**

**Switch on Pages:**

9. In the repo, go to **Settings** (top bar) → **Pages** (left sidebar).
10. **Source:** *Deploy from a branch*
11. **Branch:** `main` · Folder: `/ (root)` → **Save**
12. Wait about a minute, then refresh the Pages screen. Your live URL appears:
    `https://YOUR-USERNAME.github.io/portfolio/`

**Open it on your phone.** That's the moment.

**To update it later:** edit `resume.json` on your computer, then in the repo click the file → the pencil icon → paste the new content → **Commit changes.** The site rebuilds in about a minute. Or drag the updated file in again.

### Route B — Let Claude do it (if you have Git installed)

Ask Claude:

```
Turn this folder into a git repository, commit everything, and give me
the exact steps to push it to a new public GitHub repo called "portfolio".
```

Follow what it gives you. If it asks for a password when pushing, GitHub wants a **Personal Access Token**, not your account password — create one at [github.com/settings/tokens](https://github.com/settings/tokens) (Tokens (classic) → Generate new token → tick `repo`). [GitHub Desktop](https://desktop.github.com/) avoids this entirely with a normal login.

### If something goes wrong

| What you see | What it means | What to do |
|---|---|---|
| **404** right after enabling Pages | First build hasn't finished | Wait 60 seconds, refresh |
| **Blank white page** | `resume.json` didn't load or is invalid | Confirm you uploaded it; paste it to Claude to validate |
| **Page loads, no content** | JavaScript can't find the data file | Confirm the filename is exactly `resume.json`, lowercase |
| **Site looks unstyled** | `styles.css` wasn't uploaded | Upload it |
| **Old version still showing** | Browser cache | Hard refresh: <kbd>Cmd/Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd> |

---

## Part 6: `CLAUDE.md` — Teach Claude Your House Style (10 min)

`CLAUDE.md` is a file Claude Code reads **automatically at the start of every session** in that folder. It's your project style guide, and Claude actually follows it.

Create `CLAUDE.md` in your portfolio folder:

```markdown
## This project
- A static portfolio site. resume.json is the single source of truth.
- Never hand-edit index.html to change content — update resume.json instead.
- Never invent résumé facts. If data is missing, omit the field.

## Style
- Plain HTML, CSS, and JavaScript. No frameworks, no build step.
- Accessible by default: alt text, headings in order, WCAG-AA contrast.
- Mobile-first.

## How to work with me
- No preambles. Show me what changed, skip the summary.
- Ask before deleting anything.
```

Three levels stack, most specific winning: `~/.claude/CLAUDE.md` (you, everywhere) → `./CLAUDE.md` (this project) → `./subfolder/CLAUDE.md` (one folder).

Run `/init` and Claude will draft one by reading your project — then **trim it hard**. Every line is loaded into every prompt forever, so it costs you tokens on every single message. Treat it like a landing page: only what earns its place.

> **Using Cursor too?** The equivalent is `.cursor/rules/*.mdc`. Same idea, but scoped by file pattern instead of folder. Point both at the same conventions so your standards hold whichever tool you open.

---

## Part 7: A Link Checker for Your Real Docs (15 min)

One idea from the engineering track is genuinely valuable to you, so here it is with none of the plumbing.

### Your docs already contain a graph

Think about your documentation set:

```
  a heading   ══ is a ══►  a DESTINATION     ## Authentication  →  #authentication
  a link      ══ points to ══►  a heading    [see auth](./api.md#authentication)
```

Every heading is somewhere you can link *to*. Every link is a pointer *at* one. Together they form a map of your docs — and a program can walk that map and tell you every place it's broken.

### What it catches that review never does

| Problem | Why humans miss it |
|---|---|
| **Broken links** | The target page was renamed six months ago in a different PR |
| **Dead anchors** | The page exists; the heading it points at was reworded |
| **Duplicate headings** | Two `## Authentication` sections — the second silently becomes `#authentication-1`, so *every* link to `#authentication` lands on the first one |
| **Orphan pages** | Nothing links to them; navigation can't reach them |

That third one is the killer. Nobody catches it by reading. It's invisible until a reader ends up on the wrong section and doesn't tell you.

### Run it on your own docs — now

A working checker ships with this course. It needs no setup:

```bash
cd modules/07-capstone/docs-lsp
node scan.js /path/to/your/docs/folder
```

Point it at a real docs folder you own. Read what it finds. **Fix at least one thing.**

> **What the first real run on this course repo found:** two `## macOS` headings in the setup guide, meaning the second is silently `#macos-1`. Nothing linked to it *yet* — which is what made it dangerous. The first person to add a table of contents would have pointed at `#macos` and sent readers to the wrong section.

You can also run this automatically on every change — the `/docs-lsp:check-links` skill in the course marketplace does exactly this, and Module 4 showed you how to install it.

> **Want to know how it works?** The engineering track ([`../07-capstone/lesson.md`](../07-capstone/lesson.md), "Code Intelligence: LSP Servers") explains the protocol and walks the source. It is genuinely interesting and completely optional. Using the tool is the skill that pays; building it is a different job.

---

## Part 8: Optional — Make Your Résumé Queryable (10 min)

Your website is something people **look at**. An MCP server is something their **AI can ask questions of**.

If a recruiter installs your `about-me` server, they can ask their own Claude *"What's this person's experience with API documentation?"* and get a factual answer straight from your `resume.json` — no hallucination, no skimming.

A complete one is built for you at [`../07-capstone/portfolio-example/about-me-mcp/`](../07-capstone/portfolio-example/about-me-mcp/). To try it, ask Claude:

```
Set up the about-me MCP server in ../07-capstone/portfolio-example/about-me-mcp/
using my resume.json, and connect it to Claude Code.
```

Then:

```
/mcp                                          ← confirm "about-me" is connected
What is this person's experience with APIs?   ← it answers from your data
```

| It exposes | What a visitor's AI gets |
|---|---|
| `get_summary` | Your title, location, professional summary |
| `get_experience` | Your work history, filterable by keyword |
| `get_skills` / `get_education` / `get_contact` | The rest of your background |

**This is optional and does not affect your capstone.** Skip it if you're short on time. The website is the deliverable.

---

## Before You Call It Done (5 min)

Five checks. All of them are editorial, not technical.

1. **Every fact is true.** Re-read `resume.json` one more time. Nothing invented, nothing drifted.
2. **No empty sections.** A "Certifications" heading with nothing under it looks broken.
3. **It works on a phone.** Actually open it on your phone. Not a narrow browser window.
4. **The URL is public.** Send it to one person and confirm they can open it.
5. **Nothing private is in the repo.** GitHub is public. Home address, personal phone number, anything you wouldn't put on LinkedIn — take it out.

---

## Discussion (5 min)

1. Which part of this took you longest — writing the brief, reviewing the output, or publishing? What does that tell you about where your time goes now?
2. You edited `resume.json` for ten minutes after the AI generated it. What did you change, and could the AI have known to change it?
3. `resume.json` → website is single-sourcing. What in your day job has the same shape and isn't single-sourced yet?
4. The agent got a written brief with scope, constraints, and a deliverable. How is that different from how you usually prompt?
5. The link checker found problems no review caught. What else about your docs is true, checkable, and currently unchecked?

---

## Homework — before the showcase

1. **Publish** your portfolio and confirm the URL loads on your phone.
2. **Rewrite every `highlights` line** in `resume.json` to start with a verb and carry a number where one exists. Push the change and watch the site update.
3. **Write a `CLAUDE.md`** for the repo — run `/init`, then cut it in half.
4. **Run the link checker** on a real docs folder you own and fix at least one thing it finds.
5. **Prepare a 5-minute demo:** show the site, then change one line of `resume.json` live and reload.

---

## ✅ Writers' Track Checklist

Before the showcase, confirm you can:

- [ ] Explain skill vs. agent vs. MCP server vs. plugin — in plain language, no jargon
- [ ] Say why a shared schema (JSON Resume) beats inventing your own field names
- [ ] Turn your résumé into `resume.json` with `/parse-resume`
- [ ] Name three things you fixed in that file that the AI got wrong or weak
- [ ] Write an agent brief with a scope, constraints, and a defined deliverable
- [ ] Direct a website's design through conversation alone
- [ ] Publish to GitHub Pages and produce a working public URL
- [ ] Update the live site by changing one file
- [ ] Write a `CLAUDE.md` and explain why every line in it costs you tokens forever
- [ ] Explain the heading-and-link graph, and why duplicate headings are dangerous
- [ ] Run a link checker on a real docs set and act on the result
- [ ] State where the human judgment was in all of this — and why it wasn't optional

---

## Where to go next

| If you want… | Go to |
|---|---|
| The protocol internals, and to build a language server | [Module 7, engineering track](../07-capstone/lesson.md) |
| To build MCP servers yourself | [Module 6](../06-building-mcp-tools/lesson.md) |
| To ship all of this to your team as one install | [Module 4](../04-skill-patterns/lesson.md) and [Module 8](../08-plugin-components/lesson.md) |
