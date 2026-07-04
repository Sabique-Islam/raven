---
title: Commands
weight: 30
bookCollapseSection: true
description: Complete Raven CLI command reference — discover, draft, send, sync-jobs, scan-ats, and more.
---

# Commands

Full CLI reference for every `raven` subcommand. Run `./raven <command> --help` anytime for flags.

## Pages in this section

{{< section summary >}}

## Command map

| Command | Purpose |
|---------|---------|
| `raven setup` | First-time install and config seeding |
| `raven discover` | Unified job search (ATS + boards + index) |
| `raven draft` | Tailored application drafts from jobs |
| `raven send` | Send outreach emails from CSV/XLSX |
| `raven sync-jobs` | Download openjobdata into local SQLite |
| `raven scan-ats` | Live ATS scan only |
| `raven scan-boards` | Board feed scan only |
| `raven query` | Search local jobs.db index |
| `raven auth-gmail` | One-time Gmail OAuth |
| `raven auth-outlook` | One-time Outlook OAuth |

## Typical workflow

```bash
./raven setup
./raven discover --q "software engineer" --since 7
./raven draft --max 25
./raven send --input drafts/outreach-2026-07-04.csv --dry-run
```

## Logging flags (all job commands)

| Flag | Effect |
|------|--------|
| *(default)* | Live progress + log file in `data/logs/` |
| `--verbose` | Extra detail per source |
| `--quiet` | One-line summary |
| `--no-log` | Disable log file |

Start with [discover →](discover/)
