---
title: send
weight: 30
---

# raven send

Send outreach emails from a CSV or XLSX file via Gmail or Outlook.

## Prerequisites

```bash
raven auth-gmail    # or auth-outlook
```

Configure in `.env`:

```bash
SENDER_NAME=Your Name
SENDER_EMAIL=you@example.com
GOOGLE_CLIENT_ID=…
GOOGLE_CLIENT_SECRET=…
GMAIL_REFRESH_TOKEN=…
```

## Usage

```bash
raven send --input drafts/outreach-2026-07-04.csv --dry-run
raven send --input drafts/outreach-2026-07-04.csv --delay 60 --limit 20
raven send --provider outlook --input contacts.xlsx
```

## Required CSV columns

| Column | Description |
|--------|-------------|
| `contact_email` | Recipient (or `email`) |
| `subject` | Email subject |
| `body` | Plain-text body |

Extra columns (company, job_url, etc.) are ignored by the sender.

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--input PATH` | `contacts.csv` | CSV or XLSX |
| `--provider` | `gmail` | `gmail` or `outlook` |
| `--dry-run` | off | Preview without sending |
| `--limit N` | `9999` | Max emails |
| `--delay N` | `30` | Seconds between sends |
| `--cc ADDRESS` | — | CC all emails |

## Attachments

Place files in `files/` at repo root — attached to every email.

## Logging

Send progress and summary are logged to `data/logs/send-*.log`.

## Notes

- Only use for rows where `application_type` is **email**
- Form applications use `form_steps` — submit in the ATS browser
- Always run `--dry-run` first
