---
title: auth-gmail / auth-outlook
weight: 70
---

# OAuth setup

One-time OAuth for email sending.

## Gmail

```bash
# Set in .env first:
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=

raven auth-gmail
```

Saves `GMAIL_REFRESH_TOKEN` to `.env`.

## Outlook

```bash
# Set in .env first:
# MS_CLIENT_ID=
# MS_CLIENT_SECRET=

raven auth-outlook
```

Saves refresh token to `.env`.

## Send

```bash
raven send --provider gmail --input drafts/outreach.csv --dry-run
raven send --provider outlook --input drafts/outreach.csv
```

See [Environment variables](../configuration/env/) for all `.env` keys.
