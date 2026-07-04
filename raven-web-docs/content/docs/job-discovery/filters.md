---
title: Filters
weight: 20
---

# Discovery filters

Filters apply during `raven discover`, `raven scan-ats`, `raven scan-boards`, and `raven query`.

## CLI flags

| Flag | Description | Example |
|------|-------------|---------|
| `--q "keywords"` | Title must match (comma-separated) | `--q "backend, engineer"` |
| `--not "words"` | Title must not contain | `--not "nurse, sales"` |
| `--loc Remote,EU` | Location allow-list | `--loc Remote,India` |
| `--noloc "On-site"` | Location block-list | `--noloc "San Francisco"` |
| `--since N` | Posted within last N days | `--since 7` |
| `--ats greenhouse,lever` | Limit ATS platforms | `--ats ashby,workday` |
| `--max N` | Cap total results | `--max 100` |
| `--limit N` | Per-provider limit | `--limit 50` |

## Config vs CLI

When CLI flags are omitted, Raven merges filters from `config/portals.yml`:

```bash
# Uses portals.yml title_filter and location_filter
raven discover

# CLI overrides — portals title filter ignored for --q
raven discover --q "platform engineer"
```

Use `--use-portals` on scan commands to force portals config:

```bash
raven scan-ats --use-portals --dry-run
```

## Filter semantics

### Title (`--q` / `--not`)

- Case-insensitive substring match on job title
- `--q`: at least one keyword must match
- `--not`: no keyword may match
- Empty `--q` with no portals config = all titles pass (dangerous — always set filters)

### Location (`--loc` / `--noloc`)

- Substring match on location string
- Empty location on job → passes (don't penalize missing data)
- `--loc`: if non-empty, at least one must match
- `--noloc`: any match rejects the job

### Recency (`--since`)

- Default: 7 days
- Jobs without a parseable date pass through (conservative)

## Debugging bad matches

1. Check `config/portals.yml` — bare `raven discover` uses it
2. Add negatives for unrelated domains (`nurse`, `clinical`, `retail`)
3. Run `--verbose` and inspect `data/logs/discover-*.log`
4. Test with explicit CLI: `raven discover --q "software engineer" --not "nurse"`

## JSON output

```bash
raven discover --q "backend" --json | jq '.count'
raven discover --json --no-save > /tmp/jobs.json
```

Machine-readable schema: `{ count, jobs[], elapsed_ms, sources[] }`.
