---
name: readability-pass
description: Use when a Markdown doc needs a readability and plain-language review — flags long sentences, passive voice, and Title Case headings, then proposes rewrites.
---

# Readability pass

Review the Markdown file the user names.

1. Read the file.
2. Call the `word_stats` tool from the `docstats` server to get objective counts.
3. Output one table: `Line | Issue | Current | Suggested rewrite`.
4. End with `N issues · longest sentence M words`.

Rules: sentences under 25 words, active voice, second person, sentence-case
headings, no "simply" / "just" / "obviously".

A worked before/after example is in `references/example.md`. Read it only if
the user asks what "good" looks like.

<!--
Portability note: no ${user_config.*}, no ${CLAUDE_PLUGIN_ROOT}, no scoped
mcp__plugin_… tool name. Agent Plugins v1 standardizes discovery, not how a
client names or exposes tools — so a portable skill refers to tools by their
plain name and lets each client resolve it.
-->
