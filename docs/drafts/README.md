# Draft output

Files written by `raven draft` to `drafts/` (gitignored).

---

## Files

| Pattern | When |
|---------|------|
| `outreach-YYYY-MM-DD.csv` | Always |
| `outreach-YYYY-MM-DD.md` | Always (unless `--no-markdown`) |
| `outreach-YYYY-MM-DD.xlsx` | With `--xlsx` |

Date is run date (local). Override base with `--output drafts/my-run`.

---

## CSV columns (complete)

| Column | Type | Description |
|--------|------|-------------|
| `application_type` | `email` \| `form` | How to apply |
| `application_label` | string | `Email outreach` or `ATS form` |
| `contact_email` | string | Recipient; empty for form rows |
| `subject` | string | Email subject or form section title |
| `body` | string | Email body or abbreviated guide |
| `company` | string | Company name from listing |
| `title` | string | Job title |
| `job_url` | string | Apply / listing URL |
| `location` | string | Location string |
| `posted_at` | string | Post date |
| `ats` | string | Platform id (`greenhouse`, `remoteok`, …) |
| `email_source` | string | `manual`, `inferred`, or `n/a` |
| `jd_keywords` | string | Comma-separated keywords from title |
| `action_words` | string | Suggested verbs for this role |
| `tailored_bullets` | string | Newline or bullet-separated resume matches |
| `form_steps` | string | Full multi-step ATS guide (form only) |
| `links_block` | string | Portfolio · GitHub · LinkedIn one-liner |
| `ai_draft` | string | `yes` / `no` / `fallback` (Gemini) |
| `disclaimer` | string | Review-before-send reminder |

Constant in code: `DRAFT_COLUMNS` in `jobs/lib/outreach.mjs`.

---

## Markdown review (`.md`)

Human-readable document with one section per job:

- Header: company, title, URL
- Application type badge
- JD keywords, action words, tailored bullets
- Full email OR form guide
- Disclaimer

Open with:

```bash
open drafts/outreach-*.md
```

---

## Email rows workflow

1. Fill `contact_email` if blank (or use `--guess-email` during draft)
2. Edit `subject` / `body` in CSV if needed
3. `raven send --input drafts/outreach-....csv --dry-run`
4. `raven send --input ... --delay 60`

Required send columns: `contact_email`, `subject`, `body`.

---

## Form rows workflow

1. Read `form_steps` in CSV or `.md`
2. Open `job_url` in browser
3. Paste links and bullets from guide
4. Upload resume
5. Submit manually

**Do not** use `raven send` for form rows.

---

## Related

- [cli/draft.md](../cli/draft.md)
- [cli/send.md](../cli/send.md)
- [files/resume.md](../files/resume.md)
