# Raven

> placeholder

## Features

- Gmail and Outlook OAuth2 (no password storage)
- CSV and XLSX input support
- Per-email delay to avoid rate limits
- Dry-run mode to preview without sending
- Optional file attachments via a `files/` folder
- CC support

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

### Gmail

```bash
node setup-gmail-auth.js
```

Follow the OAuth flow. Your refresh token will be saved to `.env`.

### Outlook

```bash
node setup-outlook-auth.js
```

## Usage

```bash
node scripts/send-prewritten.js [options]
```

| Flag | Default | Description |
|------|---------|-------------|
| `--input` | `contacts.csv` | Path to CSV or XLSX file |
| `--provider` | `gmail` | `gmail` or `outlook` |
| `--limit` | `9999` | Max emails to send |
| `--delay` | `30` | Seconds between sends |
| `--cc` | — | CC address for all emails |
| `--dry-run` | — | Preview without sending |

**Examples:**

```bash
# Dry run to preview
node scripts/send-prewritten.js --input example_emails.csv --dry-run

# Send via Gmail with a 60s delay
node scripts/send-prewritten.js --input contacts.csv --delay 60

# Send via Outlook, limit to 20
node scripts/send-prewritten.js --provider outlook --limit 20
```

## CSV Format

See `example_emails.csv` for reference. Required columns:

| Column | Description |
|--------|-------------|
| `contact_email` | Recipient address (`email` also works) |
| `subject` | Email subject line |
| `body` | Full email body (supports multi-line) |

## Attachments

Place any files in a `files/` folder in the project root — they'll be attached to every email automatically.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SENDER_NAME` | Your display name |
| `SENDER_EMAIL` | Your sending address |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GMAIL_REFRESH_TOKEN` | Gmail refresh token (set by setup script) |
| `AZURE_CLIENT_ID` | Azure app client ID |
| `AZURE_CLIENT_SECRET` | Azure app client secret |
| `OUTLOOK_REFRESH_TOKEN` | Outlook refresh token (set by setup script) |
