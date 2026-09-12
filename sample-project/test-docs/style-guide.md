# Documentation Style Guide

## Voice and Tone

### Active Voice
Use active voice. The subject should perform the action.

- **Do:** "The function returns a JSON object."
- **Don't:** "A JSON object is returned by the function."

### Present Tense
Write in present tense. Describe what the software does, not what it will do.

- **Do:** "This endpoint accepts a POST request."
- **Don't:** "This endpoint will accept a POST request."

### Second Person
Address the reader directly as "you."

- **Do:** "You can configure the timeout with the `timeout` parameter."
- **Don't:** "The user can configure the timeout with the `timeout` parameter."
- **Don't:** "One can configure the timeout with the `timeout` parameter."

## Formatting

### Sentence Length
Keep sentences under 25 words. If a sentence exceeds 25 words, split it into two sentences.

### Headings
Use sentence case for all headings. Capitalize only the first word and proper nouns.

- **Do:** "Getting started with authentication"
- **Don't:** "Getting Started With Authentication"

### Code References
Use backticks for:
- Parameter names: `user_id`
- Function names: `getUser()`
- File paths: `src/config.ts`
- Status codes: `200 OK`
- Inline code: `const x = 5`

### Lists
- Use bullet lists for unordered items
- Use numbered lists for sequential steps
- Start each item with the same part of speech (parallel structure)
- End items consistently (all with periods, or none)

## Content Standards

### API Documentation Requirements
Every API endpoint must document:
1. A clear description of what the endpoint does (1-2 sentences)
2. The HTTP method and path
3. Authentication requirements
4. All parameters with type, required status, and description
5. The response format with a complete example
6. Error codes and their meanings
7. At least one code example
8. Rate limits (if applicable)

### Jargon
Define technical terms on first use. If a term is domain-specific, include a brief definition or link to the glossary.

- **Do:** "The server uses WebSocket (a protocol for real-time bidirectional communication) for live updates."
- **Don't:** "The server uses WebSocket for live updates."

### Accuracy
- All code examples must be syntactically valid
- All API paths must match the actual implementation
- All parameter descriptions must match the schema
- Update documentation before or alongside code changes, never after
