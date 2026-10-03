#!/usr/bin/env bash
# SessionStart hook: prints once per session.
#
# CLAUDE_PLUGIN_ROOT, CLAUDE_PLUGIN_DATA, and CLAUDE_PROJECT_DIR are exported
# into every hook process. userConfig values arrive as CLAUDE_PLUGIN_OPTION_<KEY>.

set -euo pipefail
cat </dev/null >/dev/null 2>&1 || true

echo "doc-toolkit ready. Style guide: ${CLAUDE_PLUGIN_OPTION_STYLE_GUIDE_URL:-not configured}"
echo "Plugin root: ${CLAUDE_PLUGIN_ROOT}"
echo "Persistent data: ${CLAUDE_PLUGIN_DATA:-unset}"
