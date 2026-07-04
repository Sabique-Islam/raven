---
title: Reference
weight: 50
bookCollapseSection: true
---

# Reference

Technical reference for logging, repository layout, and troubleshooting common issues.

## Pages in this section

{{< section summary >}}

## Quick diagnostics

```bash
./raven discover --verbose          # see per-source progress
ls -lt data/logs/                   # find latest log file
tail -50 data/logs/discover-*.log   # inspect filters and matches
./raven draft --refresh-resume      # re-parse resume after edits
```

## Important paths

| Path | Purpose |
|------|---------|
| `data/jobs.json` | Latest discover results (default draft input) |
| `data/jobs.db` | Local openjobdata index |
| `data/logs/` | Timestamped command logs |
| `data/cache/resume-parsed.json` | Parsed resume cache |
| `drafts/outreach-*` | Generated application drafts |

## Gitignored (local only)

`config/profile.yml`, `config/portals.yml`, `.env`, `files/resume.md`, `data/*.json`, `drafts/`

Start with [Logging →](logging/)
