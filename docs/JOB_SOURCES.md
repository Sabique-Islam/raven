# Supported Job Sources

Raven discovers jobs through three tiers, orchestrated by `jobs/discover.mjs`.

## Tier 1 — Live ATS APIs (`--sources ats`)

Reverse-scans public company directories and hits each platform's zero-auth API:

| Platform | Provider | Careers URL pattern |
| --- | --- | --- |
| Greenhouse | `greenhouse.mjs` | `job-boards.greenhouse.io/{slug}` |
| Lever | `lever.mjs` | `jobs.lever.co/{slug}` |
| Ashby | `ashby.mjs` | `jobs.ashbyhq.com/{slug}` |
| Workday | `workday.mjs` | `{tenant}.{instance}.myworkdayjobs.com/{site}` |
| Rippling | `rippling.mjs` | `ats.rippling.com/{slug}/jobs` |
| Workable | `workable.mjs` | `apply.workable.com/{slug}` |
| BambooHR | `bamboohr.mjs` | `{tenant}.bamboohr.com/careers` |
| SmartRecruiters | `smartrecruiters.mjs` | `careers.smartrecruiters.com/{slug}` |
| Recruitee | `recruitee.mjs` | `{slug}.recruitee.com` |
| Pinpoint | `pinpoint.mjs` | `{slug}.pinpointhq.com` |
| Teamtailor | `teamtailor.mjs` | `{slug}.teamtailor.com` |
| Personio | `personio.mjs` | `{slug}.jobs.personio.de` |

Company slug lists come from [job-board-aggregator](https://github.com/Feashliaa/job-board-aggregator) (Greenhouse/Lever/Ashby/Workday) or from the openjobdata companies registry after `raven sync-jobs`.

## Tier 2 — Board feeds (`--sources boards`)

Configured in `config/portals.yml` under `job_boards`:

| Board | Provider |
| --- | --- |
| RemoteOK | `remoteok` |
| Remotive | `remotive` |
| Arbeitnow | `arbeitnow` |
| Landing.jobs | `landingjobs` |

## Tier 3 — Local openjobdata index (`--sources index`)

Sync from [openjobdata.com](https://openjobdata.com/documentation) (HuggingFace bucket `Invicto69/Jobs-Dataset-bucket`):

```bash
raven sync-jobs
```

If you get HTTP 401, set a HuggingFace read token: `export HF_TOKEN=hf_...`

Stores jobs in `data/jobs.db` (SQLite). Also exports ATS company slug lists to `data/cache/ats-companies/` for live ATS scans.

```bash
raven query --q "ML engineer" --since 3 --json
```

## Tier 4 — hiring.cafe (optional, `--sources hiringcafe`)

Opt-in only — Cloudflare may block datacenter IPs.

```bash
export HIRING_CAFE_ENABLED=1
# Optional Apify fallback:
export APIFY_TOKEN=...
export HIRING_CAFE_APIFY_ACTOR=manojachari/hiring-cafe-scraper
```

Results are marked `verification: unconfirmed`.

## Unified discovery

```bash
raven discover --q "software engineer" --loc Remote --since 7
raven discover --sources ats,boards,index --json
raven discover --stream --q "backend developer"
```

Filter flags: `--q`, `--not`, `--loc`, `--noloc`, `--home`, `--since`, `--ats`, `--limit`, `--max`.
