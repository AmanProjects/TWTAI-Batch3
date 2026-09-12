Perform a comprehensive documentation quality review.

Target: $ARGUMENTS

## Process

### Step 1: Completeness Check
Use the `check_doc_completeness` tool to verify the file has all required sections.
Report which sections are present and which are missing.

### Step 2: Readability Assessment
Use the `grade_readability` tool to get the readability score.
Interpret the results:
- Grade 6-8: Excellent for developer docs
- Grade 9-12: Acceptable, could be simpler
- Grade 13+: Too complex, needs simplification

### Step 3: API Endpoint Verification
Use the `extract_api_endpoints` tool to find all mentioned endpoints.
For each endpoint, note if it appears to be fully documented (method, path, description, parameters, response).

### Step 4: Style Guide Compliance
Read the style-guide resource. Check the document against the top 5 rules in the style guide.

## Report Format

### Documentation Quality Report

**File:** [filename]
**Date:** [today]
**Reviewer:** AI-Assisted Review (doc-quality-checker)

#### Completeness: [X/Y sections present]
| Section | Status | Line |
|---------|--------|------|
| ... | ✅/❌ | ... |

#### Readability: Grade [X] — [Category]
- Words: [count]
- Sentences: [count]
- Avg words/sentence: [count]
- Recommendations: [list]

#### API Coverage: [X endpoints found]
| Method | Path | Documented? |
|--------|------|-------------|
| ... | ... | ✅/❌ |

#### Style Compliance
| Rule | Status | Example |
|------|--------|---------|
| ... | ✅/⚠️ | ... |

#### Overall Assessment
- **Quality Score:** [Excellent / Good / Needs Work / Poor]
- **Top 3 Action Items:**
  1. [Most impactful improvement]
  2. [Second priority]
  3. [Third priority]

---
Be thorough but concise. Focus on actionable improvements.
