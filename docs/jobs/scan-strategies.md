# Scan strategies — implementation status

`config/portals.example.yml` documents a **4-level strategy** for finding jobs beyond the default discover tiers. This page maps each level to code and clarifies what runs automatically today.

---

## Strategy overview (from portals.example.yml)

```
Level 0. local_parser  → per-company parser script (zero-token)
Level 1. Playwright    → careers_url browser scrape (real-time)
Level 2. HTTP JSON     → per-company api: on tracked_companies (WebFetch)
Level 3. WebSearch     → site: filtered queries (broad, may be stale)
```

**Default `raven discover`** uses none of these levels directly. It uses:

- ATS **reverse scan** (directory walk + public APIs) — not per-company `tracked_companies`
- Board **feeds** — not per-company scrape
- Local **index** — not WebSearch

The 4-level strategy applies to **`scan.mjs`** extended flows and `tracked_companies` — a different entry point from discover.

---

## Implementation matrix

| Strategy | Config surface | Module | Auto in `discover`? | Auto in `scan.mjs`? | Notes |
|----------|----------------|--------|---------------------|---------------------|-------|
| **HTTP JSON providers** | `provider:`, `api:`, `careers_url` | `jobs/providers/*.mjs` | Via ATS reverse scan + boards | Yes | Primary zero-token path |
| **local_parser** | `parser: { command, script }` | `providers/local-parser.mjs` | No | Yes | Runs local script, expects JSON stdout |
| **Playwright** | `scan_method: playwright` (default) | `scan.mjs` + verify flags | No | Partial | Full browser scan not default; `--verify` uses Playwright on results |
| **WebSearch queries** | `search_queries[]` | — | **No** | **No** | Config documented; **no reader in jobs/** |
| **WebSearch per company** | `scan_method: websearch`, `scan_query` | — | **No** | **Handoff only** | Logged at end of scan; no search execution |
| **ATS reverse scan** | N/A (CLI flags) | `scan-ats-full.mjs` | Yes (`--sources ats`) | N/A | Thousands of companies, no YAML list |
| **Board feeds** | `job_boards[]` | `scan.mjs --boards-only` | Yes (`--sources boards`) | Yes | RemoteOK, Remotive, etc. |
| **Local index** | N/A | `query-index.mjs` | Yes (`--sources index`) | N/A | Requires `sync-jobs` |
| **hiring.cafe** | env flags | `providers/hiring-cafe.mjs` | Opt-in | No | `HIRING_CAFE_ENABLED=1` |

---

## Level 0 — local_parser

For career pages with no public API — custom static sites, SSR output, etc.

```yaml
tracked_companies:
  - name: Example Corp
    careers_url: https://example.com/careers
    parser:
      command: node
      script: parsers/example.mjs
      format: json
```

`providers/local-parser.mjs` spawns `parser.command` + `parser.script`, parses JSON stdout into `{ title, url, company, location }[]`.

On failure, `scan.mjs` may fall back to URL-detected HTTP provider if available.

---

## Level 1 — Playwright

Documented as default `scan_method` for `tracked_companies`. In practice:

- **Discovery** does not launch browsers
- **scan.mjs** uses HTTP providers first via `resolveProvider()`
- **Playwright** appears in:
  - `scan.mjs --verify` — liveness-check apply URLs
  - `scan-ats-full.mjs --liveness` — verify matches before write

Project rule: Playwright checks run **sequentially**, never in parallel.

---

## Level 2 — HTTP JSON (providers)

The workhorse. Each `jobs/providers/*.mjs` exports:

```javascript
export default {
  id: 'greenhouse',
  detect(entry) { /* optional: match careers_url → api url */ },
  async fetch(entry, ctx) { /* return [{ title, url, company, location }] */ },
};
```

`scan.mjs` loads all `providers/*.mjs` (excluding `_` prefixed helpers), matches `provider:` field or `detect(careers_url)`.

Discover's ATS tier uses the **same providers** but drives them from directory slugs, not `tracked_companies`.

---

## Level 3 — WebSearch (not automated)

### `search_queries`

```yaml
search_queries:
  - name: Greenhouse — AI Engineer
    query: 'site:job-boards.greenhouse.io "AI Engineer" remote'
    enabled: true
```

**Intended use:** Broad discovery via search-engine `site:` operators.

**Current behavior:** Not read by any `jobs/*.mjs` module. Safe to keep in your `portals.yml` as documentation or for manual/agent runs; it will not affect `raven discover` output.

### `scan_method: websearch`

For companies without APIs (regional job boards, custom ATS):

```yaml
tracked_companies:
  - name: Kariyer.net
    scan_method: websearch
    scan_query: 'site:kariyer.net "yazılım mühendisi" remote'
```

**Current behavior** in `scan.mjs`:

1. `resolveProvider()` fails (no HTTP provider)
2. Entry added to `agentHandoff[]`
3. End of scan prints:

```
Agent/WebSearch handoff: N companies not handled by zero-token providers
  • Company Name (websearch) — site:example.com "engineer"
```

No WebSearch API is called. No offers added. `verify-portals.mjs` reports these as `skipped`.

**Future direction:** Wire `search_queries` + handoff entries to a search provider or agent loop. Until then, use ATS reverse scan + board feeds + index for automated discovery.

---

## Which command for which goal?

| Goal | Command |
|------|---------|
| Broad automated search (default) | `raven discover` |
| ATS only, verbose | `raven scan-ats --verbose` |
| Remote board feeds only | `raven discover --sources boards` |
| Offline / historical | `raven sync-jobs` then `raven discover --sources index` |
| Watch specific companies (HTTP) | Configure `tracked_companies` + `raven scan` (if exposed) or use provider `api:` |
| Companies needing browser/search | Manual follow-up from handoff log, or implement parser |

---

## Interview-style Q&A

**Q: Why document WebSearch if it's not implemented?**  
A: `portals.example.yml` is a migration from a richer ops/career-ops scanner. Raven CLI prioritized zero-token HTTP paths. WebSearch remains the planned escape hatch for sites without APIs.

**Q: Can I get WebSearch results into discover today?**  
A: Not automatically. Workarounds: add a custom provider that calls a search API, use `hiring.cafe` tier, or run agent-assisted search and import JSON manually.

**Q: What's the difference between discover and scan?**  
A: **Discover** orchestrates parallel tiers and writes `data/jobs.json`. **scan.mjs** is the lower-level portal scanner (companies + boards from YAML) used as a child for the boards tier and for extended watchlist workflows.

---

## Related

- [discovery-deep-dive.md](discovery-deep-dive.md) — how discover tiers work
- [config/portals.md](../config/portals.md) — YAML field reference
- [providers/README.md](providers/README.md) — HTTP provider catalog
