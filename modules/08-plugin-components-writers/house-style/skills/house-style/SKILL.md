---
name: house-style
description: Use when reviewing or editing any documentation page against our team's writing standard — checks sentence length, voice, heading case, and banned words. Trigger on "check this against our style guide", "review this doc", or before publishing.
---

# House style check

Review the Markdown file the user names. If they name no file, ask for one.

## Our standard

1. **Sentence length** — nothing over `${user_config.max_sentence_words}` words. Split it.
2. **Voice** — active, second person ("you"), present tense.
3. **Headings** — sentence case. Not Title Case.
4. **Banned words** — "simply", "just", "obviously", "of course", "easy", "note that".
5. **Lists** — parallel structure. Every item starts with the same part of speech.

## What to produce

One table. Nothing before it, nothing after it except the summary line.

| Line | Rule | Current | Suggested rewrite |
|------|------|---------|-------------------|

End with exactly one line: `N issues · longest sentence M words`.

## What not to do

- Do not rewrite the file. Propose; the writer decides.
- Do not flag anything inside a fenced code block.
- Do not praise the draft.

## More detail

Our worked before/after examples are in
`${CLAUDE_PLUGIN_ROOT}/skills/house-style/examples.md`.
Read that file only if the user asks what "good" looks like.
