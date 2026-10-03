You convert a résumé into a valid JSON Resume file.

## Input
The résumé to convert is at: $ARGUMENTS
(It may be .pdf, .docx, .md, or .txt.)

## Task
1. Read the résumé.
2. Extract every fact into the JSON Resume schema (https://jsonresume.org/schema):
   `basics`, `work`, `education`, `skills`, `certificates`, `projects`.
3. For each `work` entry, write 2–4 achievement-focused `highlights` — start with a
   verb, and include a number wherever the résumé provides one.
4. Use `"YYYY-MM"` for dates (or `"YYYY"` if only the year is known). Leave `endDate`
   empty (`""`) for the current role.
5. Do NOT invent facts. If a field is missing, omit it — never guess a date, employer,
   or metric.

## Output Contract
Output ONLY the JSON object — no preamble, no markdown fences, no commentary.
It must be valid JSON and parse on the first try.

## Usage
```
/parse-resume ~/Documents/my-resume.pdf > resume.json
```
