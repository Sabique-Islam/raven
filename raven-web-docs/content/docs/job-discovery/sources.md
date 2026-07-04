---
title: Sources & tiers
weight: 10
---

# Job sources

Raven orchestrates discovery tiers in parallel via `jobs/discover.mjs`. Each tier uses **public APIs or feeds** — not web search engines.

> Full architecture: [How discovery works](how-it-works/) · WebSearch status: [Scan strategies](scan-strategies/)

## Tier 1 — Live ATS APIs (`--sources ats`)

Reverse-scans public company directories and hits each platform's zero-auth JSON API.

| Platform | Careers URL pattern |
|----------|---------------------|
| Greenhouse | `job-boards.greenhouse.io/{slug}` |
| Lever | `jobs.lever.co/{slug}` |
| Ashby | `jobs.ashbyhq.com/{slug}` |
| Workday | `{tenant}.wd{N}.myworkdayjobs.com/{site}` |
| Rippling | `ats.rippling.com/{slug}/jobs` |
| Workable | `apply.workable.com/{slug}` |
| BambooHR | `{tenant}.bamboohr.com/careers` |
| SmartRecruiters | `careers.smartrecruiters.com/{slug}` |
| Recruitee | `{slug}.recruitee.com` |
| Pinpoint | `{slug}.pinpointhq.com` |
| Teamtailor | `{slug}.teamtailor.com` |
| Personio | `{slug}.jobs.personio.de` |

Company slug lists come from openjobdata (after `raven sync-jobs`) or bundled caches in `data/cache/ats-companies/`.

```bash
raven discover --sources ats --q "software engineer" --since 7
raven scan-ats --ats greenhouse,lever,ashby --json
```

## Tier 2 — Board feeds (`--sources boards`)

Public job board APIs — fast, good for remote roles.

| Board | Provider |
|-------|----------|
| RemoteOK | `remoteok` |
| Remotive | `remotive` |
| Arbeitnow | `arbeitnow` |
| Landing.jobs | `landingjobs` |

Configured in `config/portals.yml` under `job_boards`.

```bash
raven discover --sources boards --q "engineer" --loc Remote
```

## Tier 3 — Local openjobdata index (`--sources index`)

Pre-synced SQLite database from [openjobdata.com](https://openjobdata.com/documentation).

```bash
raven sync-jobs
raven discover --sources index --q "ML engineer"
raven query --q "designer" --since 7
```

See [openjobdata](openjobdata/) for sync details.

## Tier 4 — hiring.cafe (optional)

Opt-in only — Cloudflare may block datacenter IPs.

```bash
export HIRING_CAFE_ENABLED=1
raven discover --sources hiringcafe --q "engineer"
```

Optional Apify fallback:

```bash
export APIFY_TOKEN=...
export HIRING_CAFE_APIFY_ACTOR=manojachari/hiring-cafe-scraper
```

Results are marked `verification: unconfirmed`.

## Not automated — WebSearch

| Config | Status |
|--------|--------|
| `search_queries` in portals.yml | Documented; not executed |
| `scan_method: websearch` | Handoff log only in scan.mjs |

See [Scan strategies](scan-strategies/).

## Unified discovery

Default runs all three primary tiers in parallel:

```bash
raven discover --q "software engineer" --loc Remote --since 7
raven discover --sources ats,boards,index --json
raven discover --max 100 --verbose
```

## Output

Each job record includes:

| Field | Description |
|-------|-------------|
| `title` | Job title |
| `company` | Company name |
| `location` | Location string |
| `url` | Apply or listing URL |
| `source` | Tier and provider (e.g. `ats/greenhouse`) |
| `posted_at` | Posting date when available |

Results auto-save to `data/jobs.json` unless `--no-save` is passed.
