---
title: Environment variables
weight: 30
---

# .env reference

Copy from `.env.example` on `raven setup`. Secrets stay local — never commit `.env`.

## Sender identity

```bash
SENDER_NAME=Your Name
SENDER_EMAIL=you@example.com
```

Used by `raven send` and draft disclaimers.

## Gmail OAuth

```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=     # populated by raven auth-gmail
```

Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/) with Gmail send scope.

## Outlook OAuth

```bash
MS_CLIENT_ID=
MS_CLIENT_SECRET=
MS_REFRESH_TOKEN=        # populated by raven auth-outlook
```

Register an app in [Azure Portal](https://portal.azure.com/) with Mail.Send permission.

## Optional API keys

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | AI email polish (`raven draft --gemini`) |
| `HF_TOKEN` | HuggingFace read token for openjobdata sync (fixes HTTP 401) |
| `APIFY_TOKEN` | Apify fallback for hiring.cafe scraper |
| `HIRING_CAFE_ENABLED=1` | Opt into hiring.cafe tier in discover |

## Path overrides

| Variable | Default | Purpose |
|----------|---------|---------|
| `RAVEN_PORTALS` | `config/portals.yml` | Portals config path |
| `RAVEN_JOBS_DB` | `data/jobs.db` | SQLite index path |
| `HIRING_CAFE_APIFY_ACTOR` | `manojachari/hiring-cafe-scraper` | Apify actor ID |

## Loading order

1. `.env` at repo root (loaded by bash scripts and Node jobs)
2. Shell environment variables override `.env`
3. CLI flags override config files
