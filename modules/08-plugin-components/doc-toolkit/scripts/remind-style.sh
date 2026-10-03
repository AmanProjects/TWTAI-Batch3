#!/usr/bin/env bash
# PostToolUse hook: fires after every Write or Edit.
#
# Hooks read the event JSON on stdin and can print context back to Claude.
# Keep them fast — they run on every matching tool call.

set -euo pipefail

payload="$(cat)"

# Only nudge for Markdown files.
if printf '%s' "$payload" | grep -qE '\.(md|mdx)"'; then
  echo "doc-toolkit: Markdown changed — run /doc-toolkit:doc-status before committing."
fi

exit 0
