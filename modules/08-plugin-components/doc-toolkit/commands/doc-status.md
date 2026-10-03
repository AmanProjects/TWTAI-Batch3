---
description: Print a one-screen health summary for a docs folder.
argument-hint: <folder>
disable-model-invocation: true
---

Produce a health summary for the docs folder: $ARGUMENTS

Steps:

1. List every `.md` file in the folder.
2. For each, call `mcp__plugin_doc-toolkit_docstats__word_stats`.
3. Print one table: `File | Words | Longest sentence | Headings | Verdict`.
   Verdict is `ok` when the longest sentence is under 25 words, else `review`.

Print the table and nothing else. No preamble, no recommendations.

<!--
Teaching notes (not part of the prompt Claude runs):

- This is a COMMAND: a flat .md file in commands/. It has no SKILL.md folder.
- `disable-model-invocation: true` means Claude will never fire it on its own.
  You must type /doc-toolkit:doc-status. Compare with skills/readability-pass,
  which Claude can invoke automatically because its description says when to.
- Plugin skills and commands accept yes/no/on/off/1/0 for boolean frontmatter,
  not just true/false (Claude Code v2.1.218+).
-->
