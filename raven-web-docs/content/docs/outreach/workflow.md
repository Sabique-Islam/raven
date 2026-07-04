---
title: Workflow
weight: 10
---

# Outreach workflow

End-to-end flow from discovery to sent email.

## 1. Discover

```bash
raven discover --q "backend engineer" --loc Remote --since 7
```

Results save to `data/jobs.json`.

## 2. Draft

```bash
raven draft --max 25
```

Creates:

| File | Purpose |
|------|---------|
| `drafts/outreach-YYYY-MM-DD.csv` | Spreadsheet with all columns |
| `drafts/outreach-YYYY-MM-DD.md` | Human-readable review |

Optional: `--xlsx` for Excel, `--gemini` for AI polish.

## 3. Review

Open the markdown file:

```bash
open drafts/outreach-*.md   # macOS
```

Check each entry:

- **email** rows — subject, body, disclaimer
- **form** rows — follow `form_steps` in browser (skip send)

Edit CSV directly if needed before sending.

## 4. Fill contact emails

Board listings often leave `contact_email` blank. For email outreach:

1. Find hiring manager or careers contact
2. Fill `contact_email` column in CSV
3. Or use `--guess-email` during draft (verify guesses)

## 5. Authenticate

```bash
raven auth-gmail     # or auth-outlook
```

Ensure `.env` has `SENDER_NAME` and `SENDER_EMAIL`.

## 6. Dry run

```bash
raven send --input drafts/outreach-2026-07-04.csv --dry-run
```

Prints each email without sending. Fix any issues in the CSV.

## 7. Send

```bash
raven send --input drafts/outreach-2026-07-04.csv --delay 60 --limit 20
```

| Flag | Default | Purpose |
|------|---------|---------|
| `--delay N` | 30 | Seconds between sends (rate limiting) |
| `--limit N` | 9999 | Max emails this run |
| `--cc ADDRESS` | — | CC all emails |
| `--provider` | gmail | `gmail` or `outlook` |

## 8. Attachments

Place files in `files/` at repo root — attached to every sent email.

## Application type decision

| `application_type` | Next action |
|--------------------|-------------|
| `email` | Fill contact → dry-run → send |
| `form` | Open apply URL → follow form guide → submit in browser |

## Best practices

- Always dry-run first
- Use `--delay 60` or higher to avoid provider rate limits
- Personalize subject lines in CSV before bulk send
- Never send form-application rows via `raven send`
- Keep a log: sends are recorded in `data/logs/send-*.log`
