# Email sending

Gmail and Outlook integration for `raven send`.

**Modules:** `src/gmail-*.js`, `src/outlook-*.js`  
**Orchestrator:** `scripts/send-prewritten.js`

---

## Prerequisites

```bash
# .env
SENDER_NAME=Your Name
SENDER_EMAIL=you@example.com

raven auth-gmail     # or auth-outlook
```

---

## OAuth setup

| Command | Script | Writes to `.env` |
|---------|--------|------------------|
| `raven auth-gmail` | `setup-gmail-auth.js` | `GMAIL_REFRESH_TOKEN` |
| `raven auth-outlook` | `setup-outlook-auth.js` | `MS_REFRESH_TOKEN` |

Required before auth:

| Provider | `.env` keys |
|----------|-------------|
| Gmail | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Outlook | `MS_CLIENT_ID`, `MS_CLIENT_SECRET` |

See [config/env.md](../config/env.md).

---

## Send workflow

```bash
raven send --input drafts/outreach-2026-07-04.csv --dry-run
raven send --input drafts/outreach-2026-07-04.csv --delay 60 --limit 20
```

---

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--input` | `contacts.csv` | CSV or XLSX path |
| `--provider` | `gmail` | `gmail` or `outlook` |
| `--dry-run` | off | Print emails without sending |
| `--limit` | `9999` | Max emails this run |
| `--delay` | `30` | Seconds between sends |
| `--cc` | — | CC address for all emails |

---

## Required CSV columns

| Column | Description |
|--------|-------------|
| `contact_email` | Recipient (alias: `email`) |
| `subject` | Subject line |
| `body` | Plain-text body |

Extra draft columns are ignored by sender.

---

## Attachments

Files in `files/` at repo root are attached to every sent email.

---

## Send outcomes

| Status | Meaning |
|--------|---------|
| `sent` | Delivered |
| `bounced` | Hard bounce |
| `halt` | Auth failure — fix OAuth |
| `failed` | Other error |

Retries on HTTP 429 / 5xx with backoff.

---

## Rate limiting

Use `--delay 60` or higher to avoid Gmail/Outlook throttling during bulk send.

Always run `--dry-run` first.

---

## Related

- [cli/send.md](../cli/send.md)
- [cli/auth.md](../cli/auth.md)
- [drafts/README.md](../drafts/README.md)
