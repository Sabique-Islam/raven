---
title: discover
weight: 10
---

# raven discover

Unified job search across ATS APIs, board feeds, and optional local index.

## Usage

```bash
raven discover [options]
raven discover --q "backend engineer" --loc Remote --since 7
raven discover --sources boards --since 7
raven discover --json
```

## Behavior

- Loads title/location filters from **`config/portals.yml`** by default
- CLI flags (`--q`, `--loc`, …) **extend** config filters
- Runs tiers **in parallel**
- Deduplicates by canonical job URL
- **Auto-saves** results to `data/jobs.json` (unless `--no-save`)
- Prints `Next: raven draft --max 25` when complete

## Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--q "keywords"` | Title must match (comma-separated) | from `portals.yml` |
| `--not "words"` | Title must not contain | from `portals.yml` |
| `--loc Remote,EU` | Location allow-list | from `portals.yml` |
| `--noloc "X"` | Location block-list | from `portals.yml` |
| `--home "City"` | Location always-allow | — |
| `--since N` | Postings from last N days | `7` |
| `--sources` | `ats`, `boards`, `index`, `hiringcafe` | `ats,boards,index` |
| `--ats` | Subset of ATS platforms | all 12 |
| `--limit N` | Max companies per ATS | `150` |
| `--max N` | Max total results | `1000` |
| `--save PATH` | Custom save path | `data/jobs.json` |
| `--no-save` | Skip writing JSON | — |
| `--json` | Machine-readable stdout | — |
| `--stream` | NDJSON stream (for tooling) | — |
| `--verbose` | Extra tier/child logs | — |
| `--quiet` | Summary only | — |
| `--no-log` | Disable `data/logs/` file | — |

## Output JSON shape

```json
{
  "count": 42,
  "rawMatches": 120,
  "deduped": 78,
  "offers": [
    {
      "url": "https://…",
      "company": "Acme",
      "title": "Backend Engineer",
      "location": "Remote",
      "postedAt": "2026-07-04",
      "ats": "greenhouse",
      "source": "greenhouse-full"
    }
  ],
  "savedAt": "2026-07-04T08:47:54.000Z"
}
```

## Tips

- **Always set title filters** in `portals.yml` — empty filters match every job
- Use `--sources boards` for quick tests (~3s vs ~1min full scan)
- Run `raven sync-jobs` before using `--sources index`

See [Job sources](../job-discovery/sources/) for platform details.
