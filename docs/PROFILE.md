# Profile & drafting

`config/profile.yml` is the **source of truth** for who you are when Raven drafts applications.

## Setup

```bash
raven setup   # copies profile.example.yml → profile.yml, resume.example.md → files/resume.md
```

Edit:

- **identity** — name, email, phone, location
- **links** — resume file/URL, portfolio, GitHub, LinkedIn, X
- **resume.path** — markdown, plain text, or PDF for parsing
- **outreach** — email subject/body templates (optional)

## Resume parsing

Raven parses `files/resume.md` (or your path) and caches structured bullets/skills in `data/cache/resume-parsed.json`.

Supported formats:

| Format | Notes |
|--------|--------|
| `.md` | Best — use `## Experience` with `-` bullets |
| `.txt` | Bullet lines + `Skills:` line |
| `.pdf` | Requires `pdf-parse` (installed in `jobs/` via setup) |

Re-parse after edits:

```bash
raven draft --input data/jobs.json --refresh-resume
```

## Tailoring per job

For each job, `raven draft` adds:

| Field | Meaning |
|-------|---------|
| `jd_keywords` | Terms extracted from the job title |
| `action_words` | Suggested verbs (backend, frontend, ML, etc.) |
| `tailored_bullets` | Top resume bullets matched to the JD |

## Application types

| Type | When | Output |
|------|------|--------|
| **email** | Direct outreach possible | Subject + body + disclaimer |
| **form** | Greenhouse, Lever, Ashby, Workday, … | Step-by-step guide in `form_steps` |

Form rows are **not** sent via `raven send` — follow the guide and paste your links/bullets into the ATS.

## Optional Gemini plugin

Add to `.env`:

```bash
GEMINI_API_KEY=your_key
```

```bash
raven draft --input data/jobs.json --gemini
```

Gemini polishes **email** drafts only. Every draft includes a disclaimer — **review and edit yourself** before sending or submitting.

## Pipeline

```bash
raven discover --q "backend engineer" --save data/jobs.json
raven draft --input data/jobs.json --max 20
# Review drafts/outreach-*.md and CSV
raven send --input drafts/outreach-2026-07-04.csv --dry-run   # email rows only
```
