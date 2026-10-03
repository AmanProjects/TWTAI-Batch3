#!/usr/bin/env bash
# Runs automatically after Claude writes or edits any file.
#
# Read it top to bottom — it is four lines of logic:
#   1. Read the event details that Claude Code sends in.
#   2. If a Markdown file was touched, print a reminder.
#   3. Otherwise say nothing.
#   4. Exit cleanly so the session continues.
#
# Whatever this prints goes to Claude, not to a log file nobody reads.

set -euo pipefail

event="$(cat)"

if printf '%s' "$event" | grep -qE '\.(md|mdx)"'; then
  echo "house-style: a Markdown file changed — run /house-style on it before publishing."
fi

exit 0
