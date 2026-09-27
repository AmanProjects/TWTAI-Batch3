# API Documentation Style Guide

## Voice and Tone

Write in second person ("you"). Use active voice. Address the developer directly.

- **Do:** "Send a POST request to create a user."
- **Don't:** "A POST request is used to create a user."

## Required Sections

Every API endpoint document must include:

1. **Description** — one sentence explaining what the endpoint does and what it returns
2. **Authentication** — the required token type and scope
3. **Parameters** — a table with Name, Type, Required, and Description columns
4. **Response** — the HTTP status code and a JSON example of the response body
5. **Errors** — a table of possible error status codes with descriptions
6. **Example** — a working curl command

## Formatting Rules

- Use backticks for all code values: `email`, `201`, `users:write`
- Use tables for parameters and errors (not bullet lists)
- HTTP status codes appear as code: `200 OK`, `404 Not Found`
- JSON examples must be valid and use realistic placeholder values

## Terminology

| Use | Avoid |
|-----|-------|
| allowlist | whitelist |
| blocklist | blacklist |
| primary / replica | master / slave |
| cancel | abort |
| sign in | log in / login (as verb) |
