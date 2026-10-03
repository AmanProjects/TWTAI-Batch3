## This project
- Static portfolio site. The single source of truth is `resume.json` (JSON Resume schema).
- NEVER hand-edit `index.html` to change content — update `resume.json` and let `app.js` render it.
- NEVER invent résumé facts. If data is missing, omit the field.

## Style
- Keep the site framework-free: plain HTML/CSS/JS, no build step.
- Accessible by default: alt text, semantic headings, WCAG-AA contrast, dark-mode support.

## LinkedIn
- "Sign in with LinkedIn" (OIDC) gives only name/email/photo — never job history.
- Experience comes from a LinkedIn data export merged in via `/import-linkedin`.
- The client secret lives in a serverless function's env, NEVER in this repo.

## How to work with me
- No preambles. Show the diff, skip the summary.
