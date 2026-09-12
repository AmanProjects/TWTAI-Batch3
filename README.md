# AI-Powered Documentation Mastery
## A Tech Writer's Tribe Training Program

**Practical MCP & Agent Skills for Modern Technical Communicators**

Presented by **Tech Writer's Tribe** | 8 Modules | 16 Hours | Novice → Expert

Optional pre-cursor available: **A1 + A2 (4 hours total)** for general audiences in technical communication.

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

### Optional Pre-Cursor (Recommended for General Audience)

| Module | Focus | Duration |
|--------|-------|----------|
| A1 | AI fundamentals, tool landscape, AI in technical communication | 2 hrs |
| A2 | Hands-on workshop: drafting, transforming, reviewing, and adoption planning | 2 hrs |

Use this 4-hour track before Module 1 if participants are early in their AI journey.

| Module | Level | Topic | Duration |
|--------|-------|-------|----------|
| 1 | 🟢 Novice | **AI Literacy** — How LLMs work, the Human + AI model | 2 hrs |
| 2 | 🟢 Novice | **Introduction to MCP** — Protocol, tools, resources, prompts | 2 hrs |
| 3 | 🔵 Beginner | **Prompt Engineering** — Prompts, first skill, skill anatomy | 2 hrs |
| 4 | 🟡 Intermediate | **Sharing Your Skills** — Marketplaces, plugins, install & publish | 2 hrs |
| 5 | 🟡 Intermediate | **Advanced Skills** — Multi-step workflows, team collaboration | 2 hrs |
| 6 | 🟠 Advanced | **Building MCP Tools** — Explore and extend an MCP server | 2 hrs |
| 7 | 🟠 Advanced | **Expert Workflows** — Production-grade skills and automation | 2 hrs |
| 8 | 🔴 Expert | **Capstone & Portfolio** — Ship, certify, and lead | 2 hrs |

**Total:** 16 hours live + ~2 hrs pre-work + ~1–2 hrs/week practice

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

- **VS Code** or **Cursor** installed
- **Node.js 18+** (`node --version` to verify)
- **Git** (`git --version` to verify)
- **Claude Code CLI** (`npm install -g @anthropic-ai/claude-code`)
- An **Anthropic API key** (provided during training, or bring your own)
- **GitHub account** (free)

A setup guide is distributed 2 weeks before Module 1.

---

## Quick Start

```bash
# Clone this repo
git clone <repo-url> TWT_MCP_Training
cd TWT_MCP_Training

# Install sample project dependencies
cd sample-project
npm install
npm run build
```

---

## Repository Structure

```
TWT_MCP_Training/
  README.md                      # This file
  TRAINING_OUTLINE.md            # Facilitator session guide
  TWT-ProgramPlan.md             # Program overview and certification
  modules/
    A1-ai-foundations-general-audience/ # Optional pre-cursor (2 hrs)
    A2-applied-ai-tools-tech-comm/   # Optional pre-cursor (2 hrs)
    01-ai-literacy-novice/       # 🟢 Novice
    02-intro-to-mcp-novice/      # 🟢 Novice
    03-prompt-engineering-beginner/ # 🔵 Beginner
    04-skill-patterns-intermediate/ # 🟡 Intermediate
    05-advanced-skills-intermediate/ # 🟡 Intermediate
    06-building-mcp-tools-advanced/ # 🟠 Advanced
    07-expert-workflows-advanced/   # 🟠 Advanced
    08-capstone-expert/          # 🔴 Expert
  slides/                        # Presentation slides for each module
  resources/
    cheat-sheet.md               # Quick reference for all skills
    skill-templates.md           # Copy-paste skill templates
    peer-review-rubric.md        # Rubric for peer skill reviews
  sample-project/                # The MCP server you'll build
```

---

## Contributing

This is a **Tech Writer's Tribe** community resource. Contributions welcome:
- Bug fixes and clarifications via pull request
- New skill examples in the `resources/` folder
- Module translations or accessibility improvements

**Tech Writer's Tribe** | community.techwriterstribe.com
