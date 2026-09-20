Analyze the content at $ARGUMENTS for documentation coverage and gaps. (Module 4 — Analyzer pattern.)

## What to Analyze
- Which required API sections are present vs. missing (description, auth, parameters, response, error codes, example, rate limits)
- Parameters that lack a type, required/optional status, or description
- Examples that are missing, incomplete, or inconsistent with the documented parameters
- Undefined jargon a new reader would not know

## What NOT to Analyze
- Prose style or grammar (that is the Reviewer's job)
- The correctness of code logic

## Output
[SECTION 1: Summary Statistics] — counts of sections present/missing, parameters fully vs. partially documented.
[SECTION 2: Detailed Findings] — organized by category, with line references.
[SECTION 3: Priority Recommendations] — ranked by impact on the reader.

Keep each recommendation actionable. Start with a verb.
