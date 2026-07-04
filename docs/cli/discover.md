# raven discover

Unified parallel job search across ATS APIs, board feeds, and optional local index.

**Module:** `jobs/discover.mjs`  
**Default output:** `data/jobs.json`

---

## Usage

```bash
raven discover
raven discover --q "backend engineer" --loc Remote --since 7
raven discover --sources boards --max 50
raven discover --json --no-save
```

---

## Flags

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--q` | comma string | from `portals.yml` | Title **must include** one of these keywords (case-insensitive substring) |
| `--not` | comma string | from `portals.yml` | Title **must not include** any keyword |
| `--loc` | comma string | from `portals.yml` | Location **must include** one keyword (if non-empty) |
| `--noloc` | comma string | from `portals.yml` | Location **must not include** any keyword |
| `--home` | comma string | from `portals.yml` | Location **always_allow** — checked before block |
| `--since` | number | `7` | Only jobs posted within last N days (min 1) |
| `--sources` | comma list | `ats,boards,index` | Tiers to run in parallel |
| `--ats` | comma list | all 12 | Subset of ATS platforms |
| `--limit` | number | `150` | Max companies scanned per ATS platform (50–500) |
| `--max` | number | `1000` | Max total results after dedup (1–5000) |
| `--save` | path | `data/jobs.json` | Custom output path |
| `--no-save` | boolean | — | Do not write JSON file |
| `--json` | boolean | — | JSON summary on stdout (logs → stderr) |
| `--stream` | boolean | — | NDJSON events on stdout |
| `--verbose` | boolean | — | Per-tier / per-ATS detail |
| `--quiet` | boolean | — | Summary line only |
| `--log` / `--no-log` | boolean | — | Control log file |

---

## Sources (`--sources`)

| Value | What it runs | Prep required |
|-------|--------------|---------------|
| `ats` | `scan-ats-full.mjs` — 12 ATS platforms | None |
| `boards` | `scan.mjs --boards-only` — RemoteOK, Remotive, Arbeitnow, Landing.jobs | None |
| `index` | `query-index.mjs` — local SQLite | `raven sync-jobs` first |
| `hiringcafe` | `providers/hiring-cafe.mjs` | `HIRING_CAFE_ENABLED=1` in `.env` |

---

## ATS platforms (`--ats`)

All values for `--ats`:

`greenhouse`, `lever`, `ashby`, `workday`, `rippling`, `workable`, `bamboohr`, `smartrecruiters`, `recruitee`, `pinpoint`, `teamtailor`, `personio`

---

## Filter merge with `portals.yml`

When you run bare `raven discover` (no `--q`), filters come from `config/portals.yml`:

- `title_filter.positive` → `--q`
- `title_filter.negative` → `--not`
- `location_filter.*` → `--loc`, `--noloc`, `--home`

CLI flags **add to or override** config lists — see [config/portals.md](../config/portals.md).

---

## Output schema

Saved file (default `data/jobs.json`):

```json
{
  "count": 42,
  "rawMatches": 120,
  "deduped": 78,
  "offers": [ { "url", "company", "title", "location", "postedAt", "ats", "source", ... } ],
  "savedAt": "ISO-8601",
  "sources": ["ats", "boards", "index"]
}
```

Each offer field: [data/jobs-json.md](../data/jobs-json.md)

---

## Stream mode (`--stream`)

NDJSON lines with `kind`:

| kind | Meaning |
|------|---------|
| `start` | Search started |
| `atsDone` / `boardsDone` / `indexDone` | Tier finished |
| `offer` | Single job object |
| `summary` | Counts |
| `done` | Final payload |

---

## Examples

```bash
# Uses portals.yml filters
raven discover

# Explicit title + location
raven discover --q "software engineer,developer" --not "nurse,sales" --loc Remote,India

# Fast boards-only
raven discover --sources boards --q "backend" --max 30

# Index only after sync
raven sync-jobs
raven discover --sources index --q "ML engineer" --since 14
```

---

## Related

- [jobs/discover-engine.md](../jobs/discover-engine.md)
- [jobs/filters.md](../jobs/filters.md)
- [config/portals.md](../config/portals.md)
