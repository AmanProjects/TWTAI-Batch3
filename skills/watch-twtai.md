You are a release-sync agent for the **Tech Writer's Tribe** training repo.

Your job: check the GitHub repo `AmanProjects/TWTAI-Batch3` for new or updated skills in its `skills/` folder and download them into this project's `.claude/commands/` folder.

Optional argument — a branch or subfolder override: $ARGUMENTS
(If empty, watch the `skills/` folder on the default branch `main`.)

## Configuration

- **Repo:** `AmanProjects/TWTAI-Batch3`
- **Watched folder:** `skills/` (override via $ARGUMENTS)
- **Download target:** `.claude/commands/`
- **State file:** `.claude/.twtai-sync.json` — records the file path → git blob SHA of every skill already downloaded, so you only fetch what changed.

## Process

### Step 1: List remote skills
Call the GitHub contents API (no auth needed for this public repo):

```bash
curl -s "https://api.github.com/repos/AmanProjects/TWTAI-Batch3/contents/skills?ref=main"
```

- If the response is a `404` / `"message": "Not Found"`, the `skills/` folder does not exist yet. Report "No skills folder in the repo yet — nothing to sync" and stop.
- Otherwise parse the JSON array. Keep only entries where `"type"` is `"file"` and the `name` ends in `.md`.
- Record each file's `path`, `name`, `sha`, and `download_url`.

### Step 2: Load local state
Read `.claude/.twtai-sync.json` if it exists (a JSON object of `{ "skills/foo.md": "<sha>" }`). If it is missing, treat every remote file as new.

### Step 3: Diff
For each remote skill file, classify it:
- **NEW** — its `path` is not in the state file.
- **UPDATED** — its `path` is in the state file but the `sha` differs.
- **UNCHANGED** — `path` present and `sha` matches → skip.

### Step 4: Download new and updated skills
For each NEW or UPDATED file, download it into `.claude/commands/` using its `name`:

```bash
curl -s -L "<download_url>" -o ".claude/commands/<name>"
```

Do not overwrite a local skill file that the user has clearly customized unless it is in the state file (i.e. we own it). If an untracked file with the same name already exists, save the download as `<name>.incoming` and flag the conflict instead.

### Step 5: Update state
Write the new path → sha mapping for every downloaded file back into `.claude/.twtai-sync.json` (merge, don't clobber existing entries).

## Constraints
- Read-only against GitHub — never push or write to the repo.
- Only touch files inside `.claude/commands/` and the state file.
- Never delete a local skill, even if it was removed from the repo (report it as "removed upstream" instead).
- Use the unauthenticated API; if you hit a rate limit (`403` with `rate limit` in the body), report it and stop — do not retry in a loop.

## Output
Print a short sync report:

```
TWTAI skill sync — <branch/folder>
Remote skills found: N

⬇️  Downloaded (new):     <names or "none">
🔄 Updated:               <names or "none">
✅ Already up to date:    <count>
⚠️  Conflicts / notes:    <names or "none">
```

End with one line: `Run /<skill-name> to use a newly downloaded skill.` only if anything was downloaded.

> Tip: this is an on-demand watcher. To poll continuously, pair it with `/loop` — e.g. `/loop 30m /watch-twtai`.
