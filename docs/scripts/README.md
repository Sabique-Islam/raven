# scripts/ — Bash wrapper layer

Every `raven` command (except help) runs a script in `scripts/`.

---

## `_lib.sh`

Shared by all scripts:

| Function | Purpose |
|----------|---------|
| `raven_load_env` | Load `.env` from repo root |
| `raven_ensure_installed` | Check `node_modules` exist |
| `raven_ensure_config` | Warn if config missing |
| `raven_require_setup` | Exit if setup not run |
| `raven_run_jobs` | `node jobs/$1.mjs "${@:2}"` |
| `raven_run_node` | `node "$@"` from repo root |

Sets `RAVEN_ROOT` if not already set by `bin/raven`.

---

## Script map

| Script | Command | Executes |
|--------|---------|----------|
| `setup.sh` | `raven setup` | `npm install` + copy example configs |
| `discover.sh` | `raven discover` | `node jobs/discover.mjs` |
| `draft.sh` | `raven draft` | `node jobs/draft-outreach.mjs` |
| `sync-jobs.sh` | `raven sync-jobs` | `node jobs/sync-openjobdata.mjs` |
| `scan-ats.sh` | `raven scan-ats` | `node scripts/scan-ats.js` |
| `scan-boards.sh` | `raven scan-boards` | `node scripts/scan-boards.js` |
| `query-index.sh` | `raven query` | `node jobs/query-index.mjs` |
| `send.sh` | `raven send` | `node scripts/send-prewritten.js` |
| `auth-gmail.sh` | `raven auth-gmail` | `node setup-gmail-auth.js` |
| `auth-outlook.sh` | `raven auth-outlook` | `node setup-outlook-auth.js` |

---

## JS helpers (`scripts/`)

| File | Purpose |
|------|---------|
| `scan-ats.js` | Thin wrapper → `jobs/scan-ats-full.mjs` |
| `scan-boards.js` | Thin wrapper → `jobs/scan.mjs --boards-only` |
| `send-prewritten.js` | CSV/XLSX → Gmail/Outlook |
| `_lib.js` | Shared Node helpers for send |

---

## `setup.sh` detail

Copies (only if target missing):

| Source | Target |
|--------|--------|
| `.env.example` | `.env` |
| `config/portals.example.yml` | `config/portals.yml` |
| `config/profile.example.yml` | `config/profile.yml` |
| `config/outreach.example.yml` | `config/outreach.yml` |
| `files/resume.example.md` | `files/resume.md` |

Runs `npm install` in root and `jobs/`.

---

## Deprecated

`scripts/raven.sh` — forwards to `bin/raven`. Use `./raven` or `npm link`.

---

## Related

- [ARCHITECTURE.md](../ARCHITECTURE.md)
- [cli/README.md](../cli/README.md)
