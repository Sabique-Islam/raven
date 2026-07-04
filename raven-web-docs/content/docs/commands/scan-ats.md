---
title: scan-ats
weight: 50
---

# raven scan-ats

Live ATS reverse scan only (without board feeds or index).

```bash
raven scan-ats --q "software engineer" --since 7
raven scan-ats --ats greenhouse,lever,ashby --json
raven scan-ats --use-portals --dry-run
```

Uses filters from CLI flags or `--use-portals` to read `config/portals.yml` directly.

Platforms: Greenhouse, Lever, Ashby, Workday, Rippling, Workable, BambooHR, SmartRecruiters, Recruitee, Pinpoint, Teamtailor, Personio.

For unified search, prefer `raven discover --sources ats`.
