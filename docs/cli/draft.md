# raven draft

Generate tailored application drafts from discovered jobs.

**Module:** `jobs/draft-outreach.mjs`  
**Input:** `data/jobs.json` (default) or `--input`  
**Output:** `drafts/outreach-YYYY-MM-DD.csv` + `.md`

---

## Usage

```bash
raven draft --max 25
raven draft --input data/jobs.json --gemini --xlsx
raven draft --q "backend engineer" --since 7 --max 10   # discover + draft
```

---

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--input` / `--from` | latest `data/jobs.json` | Job JSON file |
| `--output` | `drafts/outreach-YYYY-MM-DD` | Base path (extensions added) |
| `--max` | `50` | Max jobs to draft (1–500) |
| `--xlsx` | off | Also write Excel |
| `--guess-email` | off | Infer `careers@domain` from job URL |
| `--gemini` | off | AI-polish email drafts (`GEMINI_API_KEY`) |
| `--refresh-resume` | off | Bypass resume parse cache |
| `--no-markdown` | off | Skip `.md` review file |
| `--json` | off | Full rows JSON on stdout |
| `--verbose`, `--quiet`, `--log`, `--no-log` | | Logging |

**Inline discover:** If no `--input` and discover flags present (`--q`, `--loc`, `--since`, `--sources`, `--ats`), runs discover first.

---

## CSV columns

| Column | Description |
|--------|-------------|
| `application_type` | `email` or `form` |
| `application_label` | Human label |
| `contact_email` | Recipient (email rows) |
| `subject` | Email subject or form header |
| `body` | Email body or short guide |
| `company` | Company name |
| `title` | Job title |
| `job_url` | Listing URL |
| `location` | Location string |
| `posted_at` | Post date |
| `ats` | Platform id |
| `email_source` | `manual`, `inferred`, or `n/a` |
| `jd_keywords` | Comma-separated title keywords |
| `action_words` | Suggested verbs for role |
| `tailored_bullets` | Matched resume bullets |
| `form_steps` | Full ATS guide (form rows) |
| `links_block` | Portfolio / GitHub / LinkedIn |
| `ai_draft` | `yes`, `no`, or `fallback` |
| `disclaimer` | Review reminder |

Full detail: [drafts/README.md](../drafts/README.md)

---

## Application types

| Type | When | Next step |
|------|------|-----------|
| `email` | Non-ATS or direct outreach | Fill email → `raven send` |
| `form` | Greenhouse, Lever, Ashby, Workday, … | Follow `form_steps` in browser |

---

## Data sources

1. `config/profile.yml` — identity, templates, resume path
2. `files/resume.md` — parsed bullets (cache: `data/cache/resume-parsed.json`)
3. Optional `GEMINI_API_KEY` — email polish only

---

## Related

- [config/profile.md](../config/profile.md)
- [files/resume.md](../files/resume.md)
- [jobs/draft-engine.md](../jobs/draft-engine.md)
