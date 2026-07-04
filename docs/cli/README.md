# CLI reference

All commands are invoked as:

```bash
./raven <command> [flags]
# or after npm link:
raven <command> [flags]
```

Run `./raven <command> --help` for flag details on any command.

---

## Commands

| Command | Script | Node module | Purpose |
|---------|--------|-------------|---------|
| `setup` | `scripts/setup.sh` | — | Install deps + seed config |
| `discover` | `scripts/discover.sh` | `jobs/discover.mjs` | Unified job search |
| `draft` | `scripts/draft.sh` | `jobs/draft-outreach.mjs` | Tailored application drafts |
| `send` | `scripts/send.sh` | `scripts/send-prewritten.js` | Email outreach |
| `sync-jobs` | `scripts/sync-jobs.sh` | `jobs/sync-openjobdata.mjs` | openjobdata → SQLite |
| `scan-ats` | `scripts/scan-ats.sh` | `jobs/scan-ats-full.mjs` | ATS-only scan |
| `scan-boards` | `scripts/scan-boards.sh` | `jobs/scan.mjs` | Board feeds only |
| `query` | `scripts/query-index.sh` | `jobs/query-index.mjs` | Search local index |
| `auth-gmail` | `scripts/auth-gmail.sh` | `setup-gmail-auth.js` | Gmail OAuth |
| `auth-outlook` | `scripts/auth-outlook.sh` | `setup-outlook-auth.js` | Outlook OAuth |

---

## Shared logging flags

Available on all **job commands** (`discover`, `draft`, `sync-jobs`, `scan-*`, `query`, `send`):

| Flag | Effect |
|------|--------|
| *(default)* | Live progress + log file in `data/logs/` |
| `--verbose` | Extra detail (per-ATS, per-tier) |
| `--quiet` | One-line summary only |
| `--log` | Force log file even if quiet |
| `--no-log` | Disable log file |

---

## npm shortcuts

```bash
npm run setup
npm run discover -- --q "engineer" --since 7
npm run draft -- --max 25
npm run send -- --input drafts/outreach.csv --dry-run
```

---

## Per-command docs

- [setup.md](setup.md)
- [discover.md](discover.md)
- [draft.md](draft.md)
- [send.md](send.md)
- [sync-jobs.md](sync-jobs.md)
- [scan-ats.md](scan-ats.md)
- [scan-boards.md](scan-boards.md)
- [query.md](query.md)
- [auth.md](auth.md)
