# portable-doc-toolkit

The same capability as `../doc-toolkit`, repackaged to the **Agent Plugins v1.0.0**
open standard so a client other than Claude Code can load it.

```
portable-doc-toolkit/
├── plugin.json                     ← REQUIRED, at the root (not in .claude-plugin/)
├── skills/
│   └── readability-pass/
│       ├── SKILL.md
│       └── references/example.md
├── mcp.json                        ← REQUIRED name (not .mcp.json)
└── com.anthropic.claude-code/      ← client extension directory
    └── hooks/hooks.json
```

## What changed from the Claude Code version

| Claude Code | Agent Plugins v1.0.0 |
|---|---|
| `.claude-plugin/plugin.json` | `plugin.json` at the root |
| `$schema` optional | `$schema` **required**, exact canonical value |
| `.mcp.json` | `mcp.json` |
| MCP transport inferred | `type` **required**: `stdio` / `streamable-http` / `sse` |
| `${CLAUDE_PLUGIN_ROOT}` | `${PLUGIN_ROOT}` |
| `${CLAUDE_PLUGIN_DATA}` | `${PLUGIN_DATA}` |
| Any top-level field allowed | Closed schema — 10 fields only |
| `commands/`, `agents/`, `hooks/`, `.lsp.json`, `themes/` | Not in v1 → move under `com.anthropic.claude-code/` |
| Custom component paths in the manifest | Fixed locations only, no overrides |

The 10 permitted top-level manifest fields are exactly: `$schema`, `name`,
`version`, `description`, `author`, `homepage`, `repository`, `license`,
`keywords`, `extensions`.
