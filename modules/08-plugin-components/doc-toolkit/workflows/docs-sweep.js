export const meta = {
  name: 'docs-sweep',
  description: 'Review every doc in a folder in parallel, then verify each finding.',
  phases: [{ title: 'Review' }, { title: 'Verify' }],
}

// `args` is whatever the caller passed — here, an array of file paths.
const files = Array.isArray(args) ? args : []

if (!files.length) {
  log('docs-sweep: no files passed in args')
  return { findings: [] }
}

const FINDINGS = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          file: { type: 'string' },
          line: { type: 'number' },
          issue: { type: 'string' },
        },
        required: ['file', 'issue'],
      },
    },
  },
  required: ['findings'],
}

const VERDICT = {
  type: 'object',
  properties: { real: { type: 'boolean' }, why: { type: 'string' } },
  required: ['real'],
}

// pipeline: each file verifies as soon as its own review finishes. No barrier.
const results = await pipeline(
  files,
  (file) =>
    agent(`Review ${file} for style issues: long sentences, passive voice, Title Case headings.`, {
      label: `review:${file}`,
      phase: 'Review',
      schema: FINDINGS,
    }),
  (review, file) =>
    parallel(
      (review?.findings ?? []).map((f) => () =>
        agent(`Try to refute this finding in ${file}: "${f.issue}". Default to refuted if unsure.`, {
          label: `verify:${file}`,
          phase: 'Verify',
          schema: VERDICT,
        }).then((v) => ({ ...f, real: v?.real === true }))
      )
    )
)

const confirmed = results.flat().filter(Boolean).filter((f) => f.real)
log(`docs-sweep: ${confirmed.length} confirmed findings across ${files.length} files`)
return { findings: confirmed }
