# style-guide-enforcer

An MCP server that checks technical documentation against a custom style guide, terminology glossary, and required structure rules — for any doc type.

## Tools

| Tool | Description |
|------|-------------|
| `check_terminology` | Flags banned terms and suggests approved alternatives from `data/glossary.json` |
| `detect_passive_voice` | Finds passive voice sentences and suggests active rewrites |
| `validate_doc_structure` | Checks required sections by doc type (how-to, reference, tutorial, release-note) |

## Resources

| Resource URI | Description |
|---|---|
| `style-guide://glossary` | The approved terms list as JSON |
| `style-guide://structure-rules` | Required and optional sections per doc type as JSON |

## Installation

```bash
npm install
npm run build
claude mcp add style-guide-enforcer -- node /absolute/path/to/dist/index.js
```

## Usage

```
Use check_terminology on test-docs/sample-how-to.md
Use validate_doc_structure on test-docs/sample-how-to.md with docType "how-to"
Use detect_passive_voice on test-docs/sample-how-to.md
```

## Customizing the Glossary

Edit `data/glossary.json`. Each entry has:
- `banned` — the word or phrase to flag
- `approved` — the preferred alternative (empty string = delete the word)
- `note` — the reason, shown in the violation report

## Customizing Structure Rules

Edit `data/structure-rules.json`. Each doc type maps to `required` and `optional` section name arrays. Section matching is case-insensitive and partial (a heading "Next Steps" matches rule "Next steps").

## License

MIT
