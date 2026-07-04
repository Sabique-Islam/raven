---
title: Outreach & sending
weight: 40
bookCollapseSection: true
---

# Outreach & Sending

Send tailored outreach emails from your draft CSV via **Gmail** or **Outlook**. Form-application rows are handled in the browser — not via email.

## Pages in this section

{{< section summary >}}

## When to use `raven send`

| `application_type` | Action |
|--------------------|--------|
| **email** | Fill `contact_email` in CSV → dry-run → send |
| **form** | Follow `form_steps` in CSV or `.md` and submit in the ATS |

## Prerequisites

```bash
# .env
SENDER_NAME=Your Name
SENDER_EMAIL=you@example.com

./raven auth-gmail    # or auth-outlook
```

## Safe send workflow

```bash
# 1. Review drafts
open drafts/outreach-*.md

# 2. Fill contact_email for email rows in CSV

# 3. Preview
./raven send --input drafts/outreach-2026-07-04.csv --dry-run

# 4. Send with rate limiting
./raven send --input drafts/outreach-2026-07-04.csv --delay 60 --limit 20
```

Always run **`--dry-run`** first. Use **`--delay 60`** or higher to avoid provider rate limits.

Start with [Email workflow →](workflow/)
