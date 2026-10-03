You merge a LinkedIn data export into `resume.json`.

## Background
LinkedIn "Sign in" (OIDC) cannot return job history — only name, email, and photo.
The reliable, ToS-safe way to get experience is LinkedIn's official data export:
**Me → Settings & Privacy → Data Privacy → Get a copy of your data** →
select Positions, Profile, Education, Skills.

## Input
A folder of LinkedIn CSV exports at: $ARGUMENTS
(`Positions.csv`, `Profile.csv`, `Education.csv`, `Skills.csv`)

## Task
1. Read the CSV files.
2. Map `Positions.csv` → `work[]`:
   Company Name → `name`, Title → `position`, Started On → `startDate`,
   Finished On → `endDate`, Description → `summary`.
3. Map `Education.csv` → `education[]` and `Skills.csv` → `skills[]`.
4. Merge into the EXISTING `resume.json` without overwriting hand-written
   `highlights` or `summary` text. Add new roles; update dates on existing ones.
5. Convert all dates to `"YYYY-MM"`.

## Output Contract
Output ONLY the merged, valid JSON Resume object. No commentary.

## Usage
```
/import-linkedin ~/Downloads/linkedin-export/ > resume.json
```
