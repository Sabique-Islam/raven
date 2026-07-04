# Raven CLI

The **`raven`** command is the entry point. Implementation lives in `bin/raven`; subcommand scripts are in `scripts/`.

## Usage

```bash
# From repo (no install)
./raven --help
./raven setup
./raven discover --q "software engineer" --since 7

# Global (after npm link)
npm link
raven --help
raven discover --q "engineer" --json
```

## Commands

| Command | Description |
|---------|-------------|
| `raven setup` | First-time install |
| `raven discover` | Unified job search |
| `raven sync-jobs` | Download openjobdata index |
| `raven scan-ats` | Live ATS scan only |
| `raven scan-boards` | Board feeds only |
| `raven query` | Search local SQLite index |
| `raven send` | Email outreach from CSV/XLSX |
| `raven auth-gmail` | Gmail OAuth |
| `raven auth-outlook` | Outlook OAuth |

Every subcommand accepts `--help`.

## Logging

All job commands print live progress and save a timestamped log under `data/logs/`:

| Flag | Effect |
|------|--------|
| *(default)* | Progress on screen + log file |
| `--verbose` | Extra detail (e.g. per-ATS child logs during discover) |
| `--quiet` | Summary only |
| `--no-log` | Disable log file |
| `--log` | Force log file even with `--json` |

Example:

```bash
raven discover --q "backend engineer" --verbose
# … live tier progress …
# discover summary (12.3s)
# Log: data/logs/discover-2026-07-04T08-30-00.log
```

## Layout

```
bin/raven           CLI dispatcher (npm bin entry)
raven               Repo-root wrapper → bin/raven
scripts/*.sh        Subcommand implementations
scripts/_lib.sh     Shared bash helpers
jobs/               Node discovery engine
```

## Internal Node files

Not for direct use — called by bash scripts:

- `scripts/scan-ats.js` — temp filter YAML for ATS scans
- `scripts/scan-boards.js` — temp filter YAML for board scans
- `scripts/send-prewritten.js` — email sending
