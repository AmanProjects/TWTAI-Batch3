Read the source material at $ARGUMENTS (a changelog, git log, or list of changes) and generate release notes. (Module 4 — Generator pattern.)

## Rules
- Group entries under: Added, Changed, Fixed, Deprecated, Removed (omit empty groups).
- Write each entry as one user-facing sentence in present tense, starting with a verb.
- Exclude internal-only churn (merge commits, lint fixes, version bumps).
- Lead with the most impactful change in each group.

## Output
Output ONLY the release notes in markdown.
No preamble, no commentary, no explanations.
Begin with a version heading, then the grouped sections.
