# AI-Powered Documentation Mastery
## A Tech Writer's Tribe Training Program

**Practical MCP & Agent Skills for Modern Technical Communicators**

Presented by **Tech Writer's Tribe** | 8 modules | 16 hours | Novice → Expert

> **New: a browser-based workshop site.** A full set of styled workshop pages — program overview, facilitator lesson plan, a page per workshop day, a Claude.ai web-interface guide, and a participant playbook — lives in [`workshop-site/`](workshop-site/index.html). Open `workshop-site/index.html` in a browser to start.

---

## About This Program

This course takes technical writers from zero AI experience to expert-level practitioners who build reusable, AI-powered documentation workflows using the Model Context Protocol (MCP) and Claude Agent Skills.

The curriculum is deliberately structured across five skill tiers — **Novice → Beginner → Intermediate → Advanced → Expert** — so every participant knows exactly where they stand and what they're working toward.

**No coding experience required.** If you can write a procedure, you can write a skill.

---

## Who Is This For?

| Audience | You'll Benefit If... |
|----------|----------------------|
| **Technical Writers** | You write API docs, developer guides, or product documentation |
| **Content Designers** | You work on developer-facing or UX-adjacent content |
| **Docs Engineers** | You manage docs-as-code pipelines and want AI integration |
| **Senior Writers / Leads** | You want to build AI tooling your whole team can use |
| **Career Changers** | You're entering tech writing and want AI fluency from day one |

---

## Skill Levels at a Glance

```
NOVICE          BEGINNER        INTERMEDIATE    ADVANCED        EXPERT
Module 1-2      Module 3        Module 4-5      Module 6        Module 7-8

Understand AI   Write prompts   Build skills    Build MCP       Lead & mentor
and MCP         and first       and patterns    servers and     others; ship
concepts        skill                           workflows       production tools
```

---

## Course Structure

Eight modules, one per workshop day, two hours each. Days 7 and 8 each have a parallel **writers' track** (no-code) alongside the engineering track.

| Module | Level | Topic | Folder | Duration |
|--------|-------|-------|--------|----------|
| 1 | 🟢 Novice | **AI literacy** — how LLMs work, the human + AI model | `01-ai-literacy-novice` | 2 hrs |
| 2 | 🟢 Novice | **Introduction to MCP** — protocol, tools, resources, prompts | `02-intro-to-mcp-novice` | 2 hrs |
| 3 | 🔵 Beginner | **Prompt engineering** — prompts, first skill, skill anatomy | `03-prompt-engineering-beginner` | 2 hrs |
| 4 | 🟡 Intermediate | **Sharing your skills** — marketplaces, plugins, install and publish | `04-skill-patterns-intermediate` | 2 hrs |
| 5 | 🟡 Intermediate | **Advanced skills** — MCP servers, multi-step workflows, peer review | `05-advanced-skills-intermediate` | 2 hrs |
| 6 | 🟠 Advanced | **Building MCP tools** — explore and extend a real MCP server | `06-building-mcp-tools-advanced` | 2 hrs |
| 7 | 🟠 Advanced | **Capstone** — build and publish a portfolio site (+ writers' track) | `07-capstone`, `07-capstone-writers` | 2 hrs |
| 8 | 🔴 Expert | **Plugin anatomy** — every component, ship your standard (+ writers' track) | `08-plugin-components`, `08-plugin-components-writers` | 2 hrs |

**Total:** 16 hours live + ~2 hrs pre-work + ~1–2 hrs/week practice

> **Using Claude.ai instead of Claude Code?** The lessons are written for the Claude Code CLI, but days 1–5 can be done entirely in the Claude.ai web interface, and day 7 publishes from the browser. See the [Claude.ai web-interface guide](workshop-site/claude-web-guide.html) for a step-by-step mapping of every command-line task to its browser equivalent.

---

## What You Will Build

Over 8 modules, you will assemble a **professional portfolio**:

### Skills Portfolio (5–7 Claude Skills)
- `/check-api-doc` — Review API docs against a completeness checklist
- `/style-check` — Enforce your team's style guide automatically
- `/release-notes` — Generate release notes from git history
- `/doc-coverage` — Surface undocumented code
- `/doc-review` — Multi-step documentation quality audit
- *Plus one custom skill tailored to your workflow*

### A Working MCP Server
A **Documentation Quality Checker** you own and can deploy:
- Checks documentation files for required sections
- Extracts API endpoints from docs
- Scores readability using Flesch-Kincaid
- Exposes your style guide as an AI-readable resource

### A Personal AI Integration Plan
Your concrete roadmap for bringing AI tooling into your daily work.

---

## Prerequisites

What you need depends on your track.

**Writers' track (Claude.ai web interface)** — enough for days 1–5 and the day-7 publish step:

- A **Claude account** (Pro, Max, Team, or Enterprise for custom Skills)
- A **web browser**
- A **GitHub account** (free) for publishing in day 7
- **Claude Desktop** (optional) for local Connectors

**Engineering track (Claude Code)** — adds, for days 4, 6, and 8:

- **VS Code** or **Cursor** installed
- **Node.js 18+** (`node --version` to verify)
- **Git** (`git --version` to verify)
- **Claude Code CLI** (`npm install -g @anthropic-ai/claude-code`)
- An **Anthropic API key** (provided during training, or bring your own)

> You do **not** need an Anthropic API key to use the Claude.ai web interface — you simply sign in. An API key is only needed for Claude Code or for building against the API directly.

A setup guide ([`SETUP_GUIDE.md`](SETUP_GUIDE.md)) is distributed 2 weeks before Module 1.

---

## Quick Start

```bash
# Clone this repo
git clone <repo-url> TWTAI-Batch3
cd TWTAI-Batch3

# Install sample project dependencies (engineering track)
cd sample-project
npm install
npm run build
```

Writers' track: no clone or build needed for days 1–5. Open [`workshop-site/index.html`](workshop-site/index.html) in a browser and follow along in the Claude.ai web interface.

---

## Repository Structure

```
TWTAI-Batch3/
  README.md                      # This file
  SETUP_GUIDE.md                 # Prerequisites and installation
  workshop-site/                 # Browser-based workshop site (start here)
    index.html                   # Program overview
    lesson-plan.html             # Facilitator lesson plan
    day-1.html … day-8.html      # One page per workshop day
    claude-web-guide.html        # Claude.ai web-interface guide
    playbook.html                # Participant playbook
    assets/styles.css
  modules/
    01-ai-literacy-novice/            # 🟢 Novice
    02-intro-to-mcp-novice/           # 🟢 Novice
    03-prompt-engineering-beginner/   # 🔵 Beginner (+ WORKSHOP.md)
    04-skill-patterns-intermediate/   # 🟡 Intermediate
    05-advanced-skills-intermediate/  # 🟡 Intermediate
    06-building-mcp-tools-advanced/   # 🟠 Advanced (+ sample servers)
    07-capstone/                      # 🟠 Advanced — engineering track
    07-capstone-writers/              # 🟠 Advanced — writers' track
    08-plugin-components/             # 🔴 Expert — engineering track
    08-plugin-components-writers/     # 🔴 Expert — writers' track
  slides/                        # Presentation decks (modules 00–08)
  resources/
    cheat-sheet.md               # Quick reference for all skills
    skill-templates.md           # Copy-paste skill templates
    peer-review-rubric.md        # Rubric for peer skill reviews
    generate_mermaid.md          # MCP architecture diagram
  skills/                        # Standalone skill files (m1–m4, watch-twtai)
  sample-docs/                   # Example docs for exercises
  sample-project/                # The MCP server you'll build
```

> **Note:** earlier drafts of this README referenced an `A1`/`A2` pre-cursor, a `TRAINING_OUTLINE.md`, a `TWT-ProgramPlan.md`, and modules named "expert-workflows" and "capstone-expert". Those do not exist in this repo — the structure above is accurate.

---

## Contributing

This is a **Tech Writer's Tribe** community resource. Contributions welcome:
- Bug fixes and clarifications via pull request
- New skill examples in the `resources/` folder
- Module translations or accessibility improvements

**Tech Writer's Tribe** | community.techwriterstribe.com
