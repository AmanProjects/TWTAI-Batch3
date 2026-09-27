# Capstone Project Guidelines

*Two project tracks, one individual capstone, presented on Day 8*

**Purpose.** This document defines how the capstone works. There are two project tracks. Each individual is assigned to exactly one track, builds their own proof-of-concept inside that track, and presents it on Day 8 of the workshop.

**Guiding principle.** Each individual should solve a real documentation workflow problem, demonstrate a working proof-of-concept, and show how the workshop learnings were applied to build it.

> **Important — capstone demos are published publicly.** As noted by Punit, the demo video of every capstone project will be uploaded to YouTube. Build and present the project as a **generic, public-safe** piece of work from day one. See Section 5 for what this means in practice.

## 1. Project Tracks

| Project Track | Scope / Included Ideas | Assignment | Members |
| ------------- | ---------------------- | ---------- | ------- |
| Release Notes | Release note generator and release-notes/project-update workflow. | One track per individual |  |
| Document Intelligence Platform | Rapid first drafts from demo recordings, wiki pages, and marketing content; automated pre-review for style, completeness, and readiness; converter, rebranding across documents, document transformation, and document cleanup. | One track per individual |  |

Track assignment is fixed once confirmed. Individuals work within their assigned track only; cross-track ideas can be referenced but must not become the deliverable.

## 2. What Each Individual Delivers

1. A one-page project charter: problem statement, users, input sources, expected output, exclusions, and success criteria.
2. A public or shared GitHub repository containing all project material.
3. A working proof-of-concept that runs end to end on at least two realistic sample inputs.
4. A 3-slide presentation deck delivered live on Day 8.
5. A 2-minute-or-less demo video embedded in or linked from the deck.

## 3. Day 8 Capstone Presentation

Every individual presents on Day 8. The deck is exactly three slides — no appendix slides during the live run.

| Slide | Content | Notes |
| ----- | ------- | ----- |
| Slide 1 — Problem and Project | The problem statement, who it affects, and what the project is. State the input, the output, and what "good" looks like. | Keep it to the problem and the solution shape. No architecture dumps. |
| Slide 2 — Demo Video | A recorded demo of the working proof-of-concept, 2 minutes or less. | Must be a recording, not a live run. Show real input to real output. |
| Slide 3 — Workshop Learnings and Repo | How the workshop learnings were applied — prompts, skills, subagents, MCP servers, workflows, or other techniques covered — plus a link to the GitHub repository holding the source. | Name the specific techniques used and where in the project they were applied. |

**Presentation rules.**

- Total speaking time including the video: keep within the slot assigned on Day 8.
- The demo video must be recorded and tested in advance. A failed live demo is not a substitute.
- The GitHub link on Slide 3 must be reachable by reviewers without extra access requests. If the repo must stay private, add reviewers before Day 8.
- The deck must be committed to the repository alongside the code.

## 4. Demo Video Requirements

- Maximum length: 2 minutes. Anything longer will be cut off.
- Show the actual proof-of-concept running: input goes in, output comes out.
- Include a visible before/after or input/output comparison.
- Narration or on-screen captions are required so the video is understandable without the presenter talking over it.
- Commit the video file or a stable link to it in the repository.
- **The video will be uploaded to YouTube.** Record it as public-facing content: no confidential screens, no internal URLs or tool names that are not already public, no customer or employee names, and no copyrighted material. Clear your browser tabs, notifications, and desktop before recording.

## 5. Public Content and Confidentiality Rules

Because the demo videos are published to YouTube and repositories are shared for review, every capstone must be safe to show to anyone outside the organization.

**Keep it generic.**

- Frame the problem in generic terms — "release notes for a software product", not a named internal product, program, or release.
- Use synthetic or anonymized sample data that you created for the capstone. Do not use real internal documents, tickets, wiki pages, or customer content.
- Replace internal system names, URLs, repo paths, project codenames, and team names with neutral placeholders.
- Do not show internal dashboards, chat threads, email, ticketing systems, or anything behind a corporate login.
- Do not include roadmap, financial, unreleased-feature, personnel, or customer information.

**Do not use copyrighted material.**

- No third-party documentation, book excerpts, articles, images, logos, icons, fonts, music, or stock media unless it is your own or carries a license that clearly permits public reuse.
- No organization branding, templates, or style assets in the deck or the video.
- If you need sample content, write it yourself or generate it.

**Before you record or publish, confirm:**

1. Every input and output shown on screen is synthetic or public.
2. No internal names, URLs, logos, or credentials are visible in any frame.
3. All media in the deck and video is yours or openly licensed.
4. The repository contains no confidential files, secrets, tokens, or `.env` values in code or history.
5. You would be comfortable with a stranger watching the video and reading the repo.

Anything you are unsure about should be removed or replaced with a placeholder. When in doubt, leave it out.

## 6. Individual Responsibilities

- Create the project charter before starting build work.
- Create and own the project GitHub repository.
- Own the full flow: research, sample data, workflow mapping, prompt design, prototype logic, validation, testing, and demo material.
- Keep all work in the repository so it does not depend on private files, chat history, or one local machine.
- Raise blockers early with a proposed option, not just a problem statement.
- Prepare the Day 8 narrative: problem, approach, workflow, proof-of-concept, limitations, and recommended next steps.

## 7. GitHub Repository and Information Management

Each individual must have their own GitHub repository. The repository is the official source of truth for the project.

All project information belongs in the repository: charter, README, decisions, assumptions, sample input references, prototype code, prompts, skills, scripts, validation notes, the 3-slide deck, the demo video or its link, and final recommendations.

The README should explain the problem, scope, setup steps, how to run or review the proof-of-concept, known limitations, and how the workshop learnings were applied.

No critical work should live only on a personal machine, private drive, or chat thread. If a file cannot be committed because of permissions or confidentiality, add a clear reference, access note, or redacted placeholder.

## 8. Proof-of-Concept Expectations

- The proof-of-concept must demonstrate a working flow, not just slides or discussion notes.
- It can be lightweight: a script, workflow, prototype UI, prompt chain, skill, MCP server, automation, or integrated tool flow is acceptable.
- It must use at least two realistic sample inputs and show before/after or input/output comparison.
- It must clearly state what is automated, what still requires human review, and where the solution can fail.
- It must include a README or usage note so another person can reproduce the demo.
- It must end with an honest recommendation: continue, pivot, merge with another project, or stop.

## 9. Scope Boundaries

### Release Notes

- Focus on extracting or generating release-note-ready content from structured or semi-structured inputs.
- Do not expand into every documentation output type unless it directly improves release note generation.
- Suggested demo: input feature/change data -> generated release note draft -> reviewer checklist or quality score.

### Document Intelligence Platform

- Focus on one or two high-value flows: document transformation, format conversion, brand terminology cleanup, first-draft generation, or automated pre-review for style, completeness, and readiness.
- Avoid building a full platform in the proof-of-concept. Depth on one flow beats breadth across five.
- Suggested demo (converter/rebranding): Word/sample content -> DITA-XML or cleaned/rebranded output -> validation summary.
- Suggested demo (draft generator/pre-review): source material -> first draft -> automated review report -> revised draft recommendations.

## 10. Required Artifacts

- Project charter in the GitHub repository: problem, target users, scope, exclusions, success criteria.
- Sample input set and expected output examples.
- Working proof-of-concept or reproducible demo evidence committed to the repository.
- Validation notes: what worked, what failed, risks, and open questions.
- The 3-slide deck and the 2-minute demo video.
- Final recommendation: continue, merge, pivot, or stop.

## 11. Collaboration Norms

- Each individual owns their own capstone. Helping others is encouraged; submitting shared work as an individual capstone is not.
- Keep discussion threads decision-oriented: proposal, decision needed, response, next action.
- Capture decisions in the GitHub repository, not only in chat.
- Use respectful disagreement. Challenge the idea, not the person.
- Escalate anything that blocks the Day 8 presentation as early as possible.
