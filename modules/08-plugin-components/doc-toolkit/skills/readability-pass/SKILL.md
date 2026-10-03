---
name: readability-pass
description: Use when a Markdown doc needs a readability and plain-language review — flags long sentences, passive voice, and Title Case headings, then proposes rewrites. Trigger on "make this readable", "tighten this doc", or before publishing a guide.
---

# Readability pass

Review the Markdown file the user names. If they name no file, ask for one.

## Rules

Your team's style guide: `${user_config.style_guide_url}`
Flag any sentence longer than `${user_config.max_sentence_words}` words.

1. **Sentence length** — over the limit above, split it.
2. **Voice** — active, second person ("you"), present tense.
3. **Headings** — sentence case, not Title Case.
4. **Hedging** — delete "simply", "just", "obviously", "of course".

## Method

1. Read the file.
2. Call `mcp__plugin_doc-toolkit_docstats__word_stats` on it to get objective counts —
   do not eyeball sentence length.
3. Produce the table below. Nothing else.

| Line | Issue | Current | Suggested rewrite |
|------|-------|---------|-------------------|

End with one line: `N issues · longest sentence M words`.

## Supporting files

A worked before/after example lives at `${CLAUDE_PLUGIN_ROOT}/skills/readability-pass/reference.md`.
Read it only when the user asks what "good" looks like.
