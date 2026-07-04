# jobs/providers — ATS & board fetchers

Each provider module fetches jobs from one platform's public API or feed.

**Directory:** `jobs/providers/`  
**Utilities:** `_http.mjs`, `_trust-validator.mjs`, `_types.js`

---

## ATS providers (12)

Used by `scan-ats-full.mjs` and discover `--sources ats`.

| ID | File | API / endpoint pattern |
|----|------|------------------------|
| `greenhouse` | `greenhouse.mjs` | `boards-api.greenhouse.io/v1/boards/{slug}/jobs` |
| `lever` | `lever.mjs` | `api.lever.co/v0/postings/{slug}` |
| `ashby` | `ashby.mjs` | `jobs.ashbyhq.com` posting-api |
| `workday` | `workday.mjs` | CXS POST `{tenant}.wdN.myworkdayjobs.com/.../jobs` |
| `rippling` | `rippling.mjs` | `api.rippling.com/platform/api/ats/v1/board/{slug}/jobs` |
| `workable` | `workable.mjs` | `apply.workable.com/{slug}/jobs.md` (markdown feed) |
| `bamboohr` | `bamboohr.mjs` | `{tenant}.bamboohr.com/careers/list` |
| `smartrecruiters` | `smartrecruiters.mjs` | `api.smartrecruiters.com` postings API |
| `recruitee` | `recruitee.mjs` | `{slug}.recruitee.com/api/offers` |
| `pinpoint` | `pinpoint.mjs` | `{slug}.pinpointhq.com/postings.json` |
| `teamtailor` | `teamtailor.mjs` | `{slug}.teamtailor.com/jobs.rss` (XML) |
| `personio` | `personio.mjs` | `{slug}.jobs.personio.de/xml` |

Company slug lists come from:

- `data/cache/ats-companies/` (after `sync-jobs`)
- Bundled seeds in discover flow

---

## Board providers (4)

Used by `scan.mjs --boards-only` and discover `--sources boards`.

| ID | File | Endpoint |
|----|------|----------|
| `remoteok` | `remoteok.mjs` | `remoteok.com/api` (~100 jobs) |
| `remotive` | `remotive.mjs` | `remotive.com/api/remote-jobs` |
| `arbeitnow` | `arbeitnow.mjs` | `arbeitnow.com/api/job-board-api` (paginated) |
| `landingjobs` | `landingjobs.mjs` | `landing.jobs/api/v1/jobs` |

Configured in `config/portals.yml` → `job_boards[]` with `provider:` key.

---

## Optional aggregator

| ID | File | Notes |
|----|------|-------|
| `hiring-cafe` | `hiring-cafe.mjs` | Requires `HIRING_CAFE_ENABLED=1`; may need `APIFY_TOKEN`; marks `verification: unconfirmed` |

---

## Provider output shape

Each provider returns raw objects normalized by `dedup.mjs` → `toDiscoveredOffer()`:

| Field | Description |
|-------|-------------|
| `url` | Apply link |
| `company` | Company name |
| `title` | Job title |
| `location` | Location string |
| `postedAt` | Date if available |
| `ats` | Provider id |
| `source` | `{tier}/{provider}` label |

---

## `_http.mjs`

Shared fetch helper:

- Timeout defaults
- Retry on transient failures
- User-Agent for API compliance

---

## `_trust-validator.mjs`

Optional trust scoring (when `trust_filter.enabled` in portals):

- Malformed URLs
- Suspicious domains (bit.ly, forms.gle, …)
- Company ↔ domain mismatch (with ATS allowlist)

Jobs are **annotated**, not dropped.

---

## Adding a provider

1. Create `jobs/providers/myplatform.mjs`
2. Export fetch function matching existing pattern
3. Register in `scan-ats-full.mjs` or `scan.mjs`
4. Add slug source or board config in `portals.yml`

---

## Related

- [JOB_SOURCES.md](../../JOB_SOURCES.md)
- [cli/discover.md](../../cli/discover.md)
- [data/jobs-db.md](../data/jobs-db.md)
