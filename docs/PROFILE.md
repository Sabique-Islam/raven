# Profile & drafting (quick reference)

> **Full documentation:** [docs/config/profile.md](config/profile.md) · [docs/cli/draft.md](cli/draft.md) · [docs/files/resume.md](files/resume.md)

`config/profile.yml` is the **source of truth** for drafting.

---

## Setup

```bash
raven setup   # copies profile.example.yml → profile.yml
```

Edit identity, links, resume path, outreach templates.

---

## Resume

- Path: `files/resume.md` (or `resume.path` in profile)
- Formats: `.md` (best), `.txt`, `.pdf`
- Cache: `data/cache/resume-parsed.json`
- Refresh: `raven draft --refresh-resume`

---

## Draft output

| Field | Meaning |
|-------|---------|
| `jd_keywords` | Terms from job title |
| `action_words` | Suggested verbs |
| `tailored_bullets` | Resume bullets matched to job |
| `application_type` | `email` or `form` |
| `form_steps` | ATS guide (form jobs) |

Full column list: [drafts/README.md](drafts/README.md)

---

## Gemini (optional)

```bash
# .env: GEMINI_API_KEY=...
raven draft --gemini
```

Email rows only. Always review before sending.

---

## Pipeline

```bash
raven discover --q "backend engineer"
raven draft --max 20
# Review drafts/outreach-*.md
raven send --input drafts/outreach-....csv --dry-run   # email rows only
```
