# Environment variables (`.env`)

Copy from `.env.example` on `raven setup`. Never commit `.env`.

---

## Sender identity

| Variable | Required for | Description |
|----------|--------------|-------------|
| `SENDER_NAME` | `send`, drafts | Display name in emails |
| `SENDER_EMAIL` | `send`, drafts | From address |

Fallback when `config/profile.yml` identity fields are empty.

---

## Gmail OAuth

| Variable | Set by | Description |
|----------|--------|-------------|
| `GOOGLE_CLIENT_ID` | You (Google Cloud Console) | OAuth client id |
| `GOOGLE_CLIENT_SECRET` | You | OAuth client secret |
| `GMAIL_REFRESH_TOKEN` | `raven auth-gmail` | Long-lived refresh token |

---

## Outlook OAuth

| Variable | Set by | Description |
|----------|--------|-------------|
| `MS_CLIENT_ID` | You (Azure Portal) | App registration id |
| `MS_CLIENT_SECRET` | You | Client secret |
| `MS_REFRESH_TOKEN` | `raven auth-outlook` | Refresh token |

---

## Optional API keys

| Variable | Used by | Description |
|----------|---------|-------------|
| `GEMINI_API_KEY` | `draft --gemini` | Google AI Studio key |
| `HF_TOKEN` | `sync-jobs` | HuggingFace read token (fixes HTTP 401 on openjobdata) |
| `HIRING_CAFE_ENABLED=1` | `discover --sources hiringcafe` | Opt into hiring.cafe tier |
| `APIFY_TOKEN` | hiring.cafe fallback | Apify actor token |
| `HIRING_CAFE_APIFY_ACTOR` | hiring.cafe | Actor id (default: `manojachari/hiring-cafe-scraper`) |

---

## Path overrides

| Variable | Default | Description |
|----------|---------|-------------|
| `RAVEN_PORTALS` | `config/portals.yml` | Portals config path |
| `RAVEN_PROFILE` | `config/profile.yml` | Profile config path |
| `RAVEN_JOBS_DB` | `data/jobs.db` | SQLite index path |
| `RAVEN_LAST_DISCOVER` | `data/jobs.json` | Default draft input JSON |
| `RAVEN_ROOT` | *(auto)* | Set by `bin/raven` |

---

## Logging overrides

| Variable | Effect |
|----------|--------|
| `RAVEN_VERBOSE=1` | Verbose logging |
| `RAVEN_QUIET=1` | Quiet mode |
| `RAVEN_LOG=1` | Force log file |

CLI flags take precedence over env.

---

## Loading order

1. `.env` at repo root (via `dotenv` in scripts)
2. Shell environment (overrides `.env`)
3. CLI flags (override config files)
