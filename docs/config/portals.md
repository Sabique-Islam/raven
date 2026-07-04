# config/portals.yml

Job search filters and optional company/board lists. Used by `raven discover` when CLI flags are omitted.

**Template:** `config/portals.example.yml`  
**Local copy:** `config/portals.yml` (gitignored)  
**Override path:** `RAVEN_PORTALS` in `.env`

---

## Raven discover — fields that matter

For the Raven CLI discover pipeline, these sections are actively used:

### `title_filter`

Controls which job titles pass the search.

```yaml
title_filter:
  positive:
    - "software engineer"
    - "backend"
    - "developer"
  negative:
    - "nurse"
    - "sales"
    - "Junior"
  seniority_boost:    # optional — ranking hint, not required match
    - "Senior"
    - "Staff"
```

| Key | Type | Semantics |
|-----|------|-----------|
| `positive` | string[] | **At least one** must appear in title (case-insensitive substring). Empty = match all titles. |
| `negative` | string[] | **Zero** may appear in title. Any match → reject. |
| `seniority_boost` | string[] | Optional prefixes that increase relevance (not required). |
| `skip_tiers` | string[] | Optional: skip `intern`, `entry`, etc. by seniority tier |

**Maps to CLI:** `positive` → `--q`, `negative` → `--not`

---

### `location_filter`

Applied after title filter.

```yaml
location_filter:
  always_allow:
    - "India"
  allow:
    - "Remote"
    - "India"
  block:
    - "On-site only"
```

| Key | Check order | Semantics |
|-----|-------------|-----------|
| *(empty location on job)* | 1 | **Pass** — do not penalize missing data |
| `always_allow` | 2 | Any match → **pass** (overrides block) |
| `block` | 3 | Any match → **reject** |
| `allow` (empty) | 4 | **Pass** |
| `allow` (non-empty) | 5 | Must match **at least one** |

**Maps to CLI:** `allow` → `--loc`, `block` → `--noloc`, `always_allow` → `--home`

---

### Optional filters (advanced)

| Section | Keys | Semantics |
|---------|------|-----------|
| **`salary_filter`** | `min`, `max` (0=no cap), `currency` | Annual salary; jobs without salary data **pass** |
| **`content_filter`** | `positive[]`, `negative[]` | Match job **description** text (when available) |
| **`trust_filter`** | `enabled`, `suspicious_domains[]` | Annotates trust score 0–100; **never drops** jobs |
| **`scan_history`** | `recheck_after_days` | Re-check URLs in `data/scan-history.tsv` after N days |

---

### `job_boards`

Board feeds for `--sources boards`:

```yaml
job_boards:
  - name: RemoteOK
    provider: remoteok
    enabled: true
  - name: Remotive
    provider: remotive
    enabled: true
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | yes | Display label |
| `provider` | yes | `remoteok`, `remotive`, `arbeitnow`, `landingjobs` |
| `enabled` | no | Default `true` |
| `careers_url` | some | Feed URL for aggregator providers |
| `api` | no | Override API endpoint |
| `notes` | no | Free text |

---

### `tracked_companies`

Per-company career pages (used by extended scan flows; not the primary ATS reverse-scan in discover):

| Field | Description |
|-------|-------------|
| `name` | Company display name |
| `careers_url` | Branded careers page (preferred over raw ATS URL) |
| `enabled` | `true` / `false` |
| `api` | Direct JSON API (e.g. Greenhouse `boards-api.greenhouse.io/...`) |
| `provider` | Force provider id (`greenhouse`, `lever`, `ashby`, …) |
| `scan_method` | `playwright`, `websearch`, `local_parser` |
| `scan_query` | WebSearch query when `scan_method: websearch` |
| `parser` | `{ command, script, format }` for local JSON stdout parsers |
| `max_pages` | Pagination cap for large boards |
| `notes` | Annotation |

See `portals.example.yml` for hundreds of example company entries and provider-specific keys (`amazon`, `arbeitsagentur`, `ibm`, Jobstreet, Glints, etc.).

---

### `search_queries`

WebSearch-based discovery queries:

```yaml
search_queries:
  - name: Ashby — AI Engineer
    query: 'site:jobs.ashbyhq.com "AI Engineer" remote'
    enabled: true
```

| Field | Description |
|-------|-------------|
| `name` | Label for logs |
| `query` | Search string (often `site:` filtered) |
| `enabled` | Include in scan when `true` |

---

## CLI vs config

| Scenario | Behavior |
|----------|----------|
| `raven discover` (no flags) | Uses `portals.yml` title + location filters |
| `raven discover --q "engineer"` | CLI `--q` used; config positive may still merge per `resolveDiscoverFilters()` |
| `raven discover --not "nurse"` | Adds negative filter |

Implementation: `jobs/lib/portals.mjs` → `loadPortalsFilters()`, `resolveDiscoverFilters()`.

---

## Minimal example

```yaml
title_filter:
  positive:
    - "software engineer"
    - "developer"
    - "intern"
  negative:
    - "nurse"
    - "clinical"

location_filter:
  allow:
    - "Remote"
    - "India"
  block: []
```

---

## Related

- [cli/discover.md](../cli/discover.md)
- [jobs/filters.md](../jobs/filters.md)
