Generate user-facing release notes from recent git history.

Run `git log --oneline -20` to see recent commits.

## Rules
- Write for **end users**, not developers
- Group changes: **New**, **Improved**, **Fixed**
- Skip: refactors, test changes, CI/CD updates, dependency bumps
- Each item: one sentence, start with a verb, focus on user benefit
- Most important items first
- Maximum 10 items total

## Format

### What's New in [version from package.json]

#### New
- Added [feature] for [user benefit]

#### Improved
- Enhanced [feature] to [improvement]

#### Fixed
- Resolved an issue where [problem description]

---
Output ONLY the release notes. No commentary.
