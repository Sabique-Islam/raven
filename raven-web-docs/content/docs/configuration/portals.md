---
title: portals.yml
weight: 10
---

# portals.yml

`config/portals.yml` controls **what jobs Raven considers relevant** when you run `raven discover` without explicit `--q` / `--loc` flags.

## How discover uses it

When you run bare `raven discover`:

1. Raven loads `config/portals.yml` (or path from `RAVEN_PORTALS` in `.env`)
2. Title keywords from `title_filter.positive` become `--q` filters
3. Negative keywords become `--not` filters
4. Location rules from `location_filter` become `--loc` / `--noloc`

CLI flags **override** portals config when provided:

```bash
# Uses portals.yml filters
raven discover

# Ignores portals title filter — uses CLI only
raven discover --q "backend engineer" --loc Remote
```

## Minimal example

```yaml
title_filter:
  positive:
    - "software engineer"
    - "backend"
    - "developer"
    - "intern"
  negative:
    - "nurse"
    - "sales"
    - "Junior"

location_filter:
  allow:
    - "Remote"
    - "India"
  block:
    - "On-site only"
```

### Title filter semantics

- At least **one** positive keyword must match the job title (case-insensitive substring)
- **Zero** negative keywords may match
- Empty `positive` list = match all titles (use negatives to exclude)

### Location filter semantics

Applied in order:

1. Empty location on job → **pass**
2. Any `always_allow` keyword → **pass**
3. Any `block` keyword → **reject**
4. `allow` empty → **pass**
5. `allow` non-empty → must match at least one keyword

## Optional filters

| Block | Purpose |
|-------|---------|
| `salary_filter` | Min/max annual compensation (when structured data exists) |
| `content_filter` | Match job description text (positive/negative keywords) |
| `trust_filter` | Annotate jobs with trust score (never drops jobs) |
| `scan_history` | Re-check URLs after N days |

See `config/portals.example.yml` for full documentation and examples.

## Job boards

Board feeds used by `raven discover --sources boards`:

```yaml
job_boards:
  - name: RemoteOK
    provider: remoteok
    enabled: true
  - name: Remotive
    provider: remotive
    enabled: true
```

## Tracked companies

The `tracked_companies` section is used by legacy career-ops scan flows. Raven's `discover --sources ats` uses live ATS APIs with company slug lists from openjobdata or bundled caches — not this list directly.

## Tips

- **Too many unrelated jobs?** Add negatives (`nurse`, `clinical`, `retail`)
- **Too few jobs?** Broaden positives or remove overly specific negatives
- **Wrong geography?** Tighten `location_filter.block` and `allow`
- **Debug filters:** Run with `--verbose` and check `data/logs/discover-*.log`
