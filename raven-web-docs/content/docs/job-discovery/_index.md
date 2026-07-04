---
title: Job discovery
weight: 25
bookCollapseSection: true
---

# Job Discovery

Raven searches for jobs through **parallel tiers** — live ATS APIs, public board feeds, and an optional local openjobdata index — then deduplicates and saves results to `data/jobs.json`.

## Pages in this section

{{< section summary >}}

## Discovery tiers

| Tier | Flag | Sources | Prep |
|------|------|---------|------|
| **ATS** | `--sources ats` | Greenhouse, Lever, Ashby, Workday, … | None |
| **Boards** | `--sources boards` | RemoteOK, Remotive, Arbeitnow, Landing.jobs | None |
| **Index** | `--sources index` | Local SQLite from openjobdata | `raven sync-jobs` first |

Default runs all three in parallel.

## Common commands

```bash
# Full search (uses portals.yml if no --q)
./raven discover

# Explicit filters
./raven discover --q "backend engineer" --loc Remote --since 7

# Fast — boards only
./raven discover --sources boards --q "developer" --max 50

# Query local index only
./raven sync-jobs
./raven query --q "ML engineer" --since 7
```

Results auto-save to **`data/jobs.json`** unless you pass `--no-save`.

Start with [Sources & tiers →](sources/)
