---
title: Logging
weight: 10
---

# Logging

All Raven job commands emit live progress and write timestamped log files.

## Default behavior

- Progress phases printed to stdout
- Summary line with counts and elapsed time
- Log file written to `data/logs/`

Example log paths:

```
data/logs/discover-2026-07-04T08-30-00.log
data/logs/draft-2026-07-04T08-35-12.log
data/logs/sync-jobs-2026-07-04T07-00-00.log
data/logs/send-2026-07-04T09-00-00.log
```

## Flags

| Flag | Effect |
|------|--------|
| *(default)* | Live progress + log file |
| `--verbose` | Extra detail (per-ATS logs during discover) |
| `--quiet` | One-line summary only |
| `--no-log` | Disable log file (stdout only) |

## Commands with logging

- `raven discover`
- `raven draft`
- `raven sync-jobs`
- `raven scan-ats` / `scan-boards`
- `raven query`
- `raven send`

## Log contents

Typical discover log:

```
[phase] ats: greenhouse — 142 raw, 12 matched
[phase] boards: remoteok — 89 raw, 8 matched
[summary] 20 jobs, 45.2s, saved data/jobs.json
```

Verbose mode adds per-company slug fetches and filter reject reasons.

## Privacy

Logs may contain job titles, company names, and URLs. `data/logs/` is gitignored.
