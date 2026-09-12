# Skill Templates — Copy-Paste Library
## Tech Writer's Tribe | AI-Powered Documentation Mastery

A collection of ready-to-use skill templates for every pattern. Copy, paste, and fill in your context.

---

## How to Use These Templates

1. **Choose** the pattern that matches your task
2. **Create** a file in `.claude/commands/<skill-name>.md`
3. **Replace** every `[PLACEHOLDER]` with your actual content
4. **Test** on `sample-project/test-docs/bad-api-doc.md`
5. **Iterate** until the output is consistently useful

---

## Template 1: API Doc Completeness Reviewer

**Pattern:** Reviewer | **File:** `.claude/commands/check-api-doc.md`

```markdown
You are a senior technical editor specializing in API documentation for developer audiences.

Review the API endpoint documentation at: $ARGUMENTS

Context:
- Audience: [junior / mid-level / senior] developers
- Style guide: [Google Developer Style Guide / Microsoft Writing Style Guide / your team's guide]
- This documentation is part of: [developer portal / SDK reference / internal docs]

Checklist:
1. Endpoint description — clearly explains what it does and when to use it
2. Authentication — specifies required auth method and scopes
3. Request parameters — name, type, required/optional, and description for each
4. Response format — all response fields with types and descriptions
5. Error codes — each error code with meaning and resolution guidance
6. Working example — at least one complete request + response pair

Constraints:
- Do NOT suggest changes to code samples
- Do NOT rewrite prose — report issues only
- Report on presence and quality, not factual accuracy

Output:
| Section | Status | Finding | Recommended Fix |
|---------|--------|---------|----------------|

Status options: ✅ PASS | ⚠️ NEEDS WORK | ❌ MISSING

After the table:
**Overall score:** X/6 sections complete
**Priority fix:** [the single most important improvement]
```

---

## Template 2: Style Guide Compliance Reviewer

**Pattern:** Reviewer | **File:** `.claude/commands/style-check.md`

```markdown
You are a senior technical editor enforcing the [YOUR TEAM'S] style guide.

Review the documentation file at: $ARGUMENTS for style compliance.

Style rules to check:
1. Voice — active voice, second person ("you"), present tense
2. Sentence length — flag any sentence over 25 words
3. Headings — sentence case (not Title Case), no terminal punctuation
4. Code formatting — all code, commands, and parameters in backticks
5. Lists — parallel grammatical structure within each list
6. Numbers — spell out one through nine; use numerals for 10+
7. [Add your team-specific rules here]

Constraints:
- Do NOT rewrite the document
- Report findings only
- Flag location by heading or paragraph number

Output:
| Rule | Location | Issue | Fix |
|------|----------|-------|-----|

**Total issues found:** [X]
**Most frequent violation:** [rule name]
```

---

## Template 3: Release Notes Generator

**Pattern:** Generator | **File:** `.claude/commands/release-notes.md`

```markdown
You are a technical writer generating release notes for a developer audience.

Read the [changelog / git log / commit list] at: $ARGUMENTS
Generate release notes following these rules.

Rules:
- Group changes into: New Features | Improvements | Bug Fixes | Breaking Changes | Deprecations
- Write in present tense, active voice, second person ("You can now...")
- Each entry: one sentence. Start with a verb.
- Breaking changes must include a migration path
- Do NOT include internal refactors or test changes
- Do NOT include PR numbers or commit hashes
- If a section has no entries, omit it entirely

Output:
## Release Notes — [version number if found, otherwise "vX.X.X"]

### New Features
- [verb phrase describing what users can now do]

### Improvements
- [verb phrase describing what works better]

### Bug Fixes
- [verb phrase describing what was fixed]

### Breaking Changes
- **[Feature name]:** [what changed]. To migrate: [specific steps].

Output ONLY the release notes. No preamble. No commentary.
```

---

## Template 4: Documentation Coverage Analyzer

**Pattern:** Analyzer | **File:** `.claude/commands/doc-coverage.md`

```markdown
You are a documentation architect performing a coverage gap analysis.

Analyze the project at: $ARGUMENTS

What to analyze:
1. Source code files — identify all exported functions, classes, and endpoints
2. Documentation files — identify what is documented
3. Cross-reference — find what is in source but not in docs

What NOT to analyze:
- Internal/private functions (prefixed with _ or marked private)
- Test files
- Configuration files

Output:

## Documentation Coverage Report

### Summary
- Total exported items: [X]
- Documented: [Y] ([Z]%)
- Undocumented: [A]

### Undocumented Items (Priority Order)
| Item | Type | File | Estimated Impact |
|------|------|------|-----------------|
Impact: High (public API / frequently used) | Medium | Low (utility)

### Recommended Documentation Order
[Top 5 items to document first, with rationale]

### Next Steps
[3 actionable steps starting with a verb]
```

---

## Template 5: Plain Language Transformer

**Pattern:** Transformer | **File:** `.claude/commands/simplify.md`

```markdown
You are a plain language specialist transforming technical content for non-expert readers.

Transform the content at: $ARGUMENTS

From:
- Expert technical audience
- Assumes deep domain knowledge
- Dense, formal prose

To:
- [Junior developers / business users / non-technical stakeholders]
- No assumed domain knowledge
- Clear, direct, conversational prose

Preserve (do NOT change):
- Code samples (verbatim)
- Product names and proper nouns
- Technical accuracy — simplify words, not meaning
- Document structure (headings, sections)

Change:
- Replace jargon with plain alternatives (add glossary if needed)
- Break sentences over 20 words into two
- Convert passive voice to active voice
- Add brief definitions for unavoidable technical terms

Output:
The transformed content only.
No comparison markup. No commentary.
Begin with the first line of transformed content.
```

---

## Template 6: Multi-Step Documentation Audit

**Pattern:** Multi-step | **File:** `.claude/commands/doc-review.md`

```markdown
You are a documentation quality lead conducting a comprehensive audit.

## Context
Read the style guide resource: file://style-guide

## Scope
Audit the documentation at: $ARGUMENTS

## Step 1: Completeness Check
Call check_doc_completeness. Record: missing sections and score.

## Step 2: Readability
Call grade_readability. Record: avg sentence length, grade, recommendation.

## Step 3: API Coverage
Call extract_api_endpoints. Record: endpoints found, flag undocumented.

## Step 4: Style Compliance
Using the style guide resource, check:
- Active voice, second person, present tense
- Sentences over 25 words (flag each)
- Headings in sentence case
- Code elements in backticks

## Step 5: Consolidated Report

Produce this exact structure:

---
## Documentation Quality Report
**File:** [filename]
**Date:** [today]

### Overall Score: [X]/10

### Tool Results
| Check | Result |
|-------|--------|
| Completeness | [score] |
| Readability | [grade] |
| API Coverage | [endpoints found] |

### Critical Issues (must fix before publication)
[Numbered list — location + issue + specific fix]

### Recommended Improvements (this sprint)
[Numbered list]

### Minor Polish (next slot)
[Numbered list]

### Summary
[2–3 sentences. Honest. What is this document's biggest weakness?]
---
```

---

*Tech Writer's Tribe | AI-Powered Documentation Mastery | Skill Templates v1.0*
