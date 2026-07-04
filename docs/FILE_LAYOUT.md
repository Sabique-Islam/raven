# File layout

Every significant path in the Raven repository.

---

## Repository tree

```
raven/
├── bin/raven                 # CLI entry (npm bin → npm link)
├── raven                     # Symlink to bin/raven
├── package.json              # Root npm deps + scripts
├── .env.example              # Environment template
├── setup-gmail-auth.js       # Gmail OAuth one-time setup
├── setup-outlook-auth.js     # Outlook OAuth one-time setup
│
├── config/
│   ├── portals.example.yml   # Search filters (tracked template)
│   ├── profile.example.yml   # Identity + outreach (tracked)
│   ├── outreach.example.yml  # Legacy templates (tracked)
│   ├── portals.yml           # YOUR filters (gitignored)
│   ├── profile.yml           # YOUR identity (gitignored)
│   └── outreach.yml          # YOUR legacy outreach (gitignored)
│
├── files/
│   ├── resume.example.md     # Resume template (tracked)
│   └── resume.md             # YOUR resume (gitignored)
│
├── data/                     # Runtime data (mostly gitignored)
│   ├── jobs.json             # Latest discover output
│   ├── jobs.db               # openjobdata SQLite index
│   ├── cache/
│   │   ├── resume-parsed.json
│   │   ├── openjobdata-last-sync.json
│   │   └── ats-companies/    # Exported slug lists
│   └── logs/                 # Timestamped command logs
│
├── drafts/                   # Generated drafts (gitignored)
│   └── outreach-YYYY-MM-DD.{csv,md,xlsx}
│
├── scripts/                  # Bash wrappers
│   ├── _lib.sh               # Shared shell helpers
│   ├── setup.sh
│   ├── discover.sh
│   ├── draft.sh
│   ├── send.sh
│   └── …
│
├── jobs/                     # Node job engine
│   ├── discover.mjs
│   ├── draft-outreach.mjs
│   ├── sync-openjobdata.mjs
│   ├── scan-ats-full.mjs
│   ├── scan.mjs
│   ├── query-index.mjs
│   ├── lib/                  # Shared modules
│   ├── providers/            # ATS + board fetchers
│   └── plugins/              # Optional plugins (Gemini)
│
├── src/                      # Email send (CommonJS)
│   ├── gmail-auth.js
│   ├── gmail-sender.js
│   ├── outlook-auth.js
│   └── outlook-sender.js
│
├── docs/                     # This documentation
└── raven-web-docs/           # Hugo documentation site
```

---

## Path constants (`jobs/lib/paths.mjs`)

| Constant | Default path | Purpose |
|----------|--------------|---------|
| `RAVEN_ROOT` | Repo root | Base for all paths |
| `JOBS_ROOT` | `jobs/` | Node engine directory |
| `DATA_DIR` | `data/` | Runtime data |
| `CONFIG_DIR` | `config/` | YAML config |
| `PORTALS_PATH` | `config/portals.yml` | Override: `RAVEN_PORTALS` |
| `PROFILE_PATH` | `config/profile.yml` | Override: `RAVEN_PROFILE` |
| `JOBS_DB_PATH` | `data/jobs.db` | Override: `RAVEN_JOBS_DB` |
| `LAST_DISCOVER_JSON` | `data/jobs.json` | Default draft input |
| `SCAN_HISTORY_PATH` | `data/scan-history.tsv` | URL dedup history |
| `RESUME_CACHE_PATH` | `data/cache/resume-parsed.json` | Parsed resume cache |

---

## Gitignored vs tracked

| Tracked (committed) | Gitignored (local only) |
|---------------------|-------------------------|
| `config/*.example.yml` | `config/profile.yml`, `portals.yml`, `outreach.yml` |
| `files/resume.example.md` | `files/resume.md`, `.pdf`, `.txt` |
| Source code | `.env` |
| `docs/` | `data/jobs.json`, `data/jobs.db` |
| | `data/cache/`, `data/logs/` |
| | `drafts/outreach-*` |

---

## Environment path overrides

| Variable | Overrides |
|----------|-----------|
| `RAVEN_PORTALS` | Portals YAML path |
| `RAVEN_PROFILE` | Profile YAML path |
| `RAVEN_JOBS_DB` | SQLite database path |
| `RAVEN_LAST_DISCOVER` | Default discover JSON for draft |
| `RAVEN_ROOT` | Set by `bin/raven` automatically |
