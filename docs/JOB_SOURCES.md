# Job sources (quick reference)

> **Full documentation:** [docs/jobs/providers/README.md](jobs/providers/README.md) · [docs/cli/discover.md](cli/discover.md)

Raven discovers jobs through parallel tiers via `jobs/discover.mjs`.

---

## Tier 1 — Live ATS (`--sources ats`)

12 platforms: Greenhouse, Lever, Ashby, Workday, Rippling, Workable, BambooHR, SmartRecruiters, Recruitee, Pinpoint, Teamtailor, Personio.

```bash
raven discover --sources ats --q "engineer" --since 7
```

---

## Tier 2 — Board feeds (`--sources boards`)

RemoteOK, Remotive, Arbeitnow, Landing.jobs.

```bash
raven discover --sources boards --loc Remote
```

---

## Tier 3 — Local index (`--sources index`)

Requires `raven sync-jobs` → `data/jobs.db`.

```bash
raven sync-jobs
raven discover --sources index --q "ML engineer"
raven query --q "designer" --since 7
```

Set `HF_TOKEN` if sync returns HTTP 401.

---

## Tier 4 — hiring.cafe (optional)

```bash
export HIRING_CAFE_ENABLED=1
raven discover --sources hiringcafe
```

Results marked `verification: unconfirmed`.

---

## Unified discover

```bash
raven discover --q "software engineer" --loc Remote --since 7
```

Default sources: `ats,boards,index`. Filters: `--q`, `--not`, `--loc`, `--since`, `--ats`, `--max`.

See [config/portals.md](config/portals.md) for YAML filter config.
