---
title: draft
weight: 20
---

# raven draft

Generate tailored application drafts from discovered jobs.

## Usage

```bash
raven draft --max 25
raven draft --input data/jobs.json --max 25
raven draft --q "backend engineer" --since 7 --max 20
raven draft --gemini
```

## Input sources

| Method | Command |
|--------|---------|
| Latest discover (default) | `raven draft` → reads `data/jobs.json` |
| Explicit file | `raven draft --input data/jobs.json` |
| Inline discover + draft | `raven draft --q "engineer" --since 7` |

## Output files

| File | Purpose |
|------|---------|
| `drafts/outreach-YYYY-MM-DD.csv` | Spreadsheet — review, edit, send |
| `drafts/outreach-YYYY-MM-DD.md` | Human-readable review |
| `drafts/outreach-YYYY-MM-DD.xlsx` | Optional (`--xlsx`) |

## CSV columns

| Column | Description |
|--------|-------------|
| `application_type` | `email` or `form` |
| `application_label` | Human label |
| `contact_email` | For email rows (often blank — fill manually) |
| `subject` | Email subject or form title |
| `body` | Email body or short form guide |
| `company`, `title`, `job_url` | Job metadata |
| `jd_keywords` | Terms extracted from job title |
| `action_words` | Suggested verbs for this role |
| `tailored_bullets` | Resume bullets matched to JD |
| `form_steps` | Full ATS guide (form jobs) |
| `links_block` | Your portfolio/GitHub/LinkedIn line |
| `ai_draft` | `yes`, `no`, or `fallback` |
| `disclaimer` | Review-before-submit reminder |

## Flags

| Flag | Description |
|------|-------------|
| `--input PATH` | Jobs JSON (default: `data/jobs.json`) |
| `--max N` | Max drafts to generate | `50` |
| `--gemini` | AI-polish email drafts (needs `GEMINI_API_KEY`) |
| `--guess-email` | Suggest `careers@` from apply URL domain |
| `--refresh-resume` | Re-parse resume (ignore cache) |
| `--xlsx` | Also write Excel |
| `--no-markdown` | Skip `.md` review file |
| `--output PATH` | Custom output base path |

## Application types

### Form (`application_type: form`)

Greenhouse, Lever, Ashby, Workday, and similar ATS listings. Raven generates **step-by-step guides** with your links and tailored bullets — not sendable email.

### Email (`application_type: email`)

Direct outreach when you have or can infer a contact address. Use `raven send` after filling `contact_email`.

## Important

**Review every draft yourself** before sending or submitting. Gemini output is a starting point only.

See [Drafting](../drafting/) and [Profile](../configuration/profile/) for details.
