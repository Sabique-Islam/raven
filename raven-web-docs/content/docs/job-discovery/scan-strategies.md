---
title: Scan strategies
weight: 15
---

# Scan strategies

`portals.example.yml` documents a **4-level strategy** for job discovery beyond default tiers. This page maps each level to what Raven runs automatically today.

---

## Four levels (from portals.example.yml)

```
Level 0. local_parser  → custom script per company
Level 1. Playwright    → browser scrape of careers_url
Level 2. HTTP JSON     → public ATS/board APIs (providers)
Level 3. WebSearch     → site: filtered search queries
```

**Default `raven discover`** uses HTTP JSON at scale (ATS reverse scan + board feeds) — not levels 0–1 per company, and **not level 3**.

---

## Implementation status

| Strategy | Config | Auto in discover? | Notes |
|----------|--------|-------------------|-------|
| HTTP providers | `provider:`, `api:` | Yes (ATS + boards) | Primary path |
| local_parser | `parser:` block | No | `scan.mjs` only |
| Playwright | `scan_method: playwright` | No | `--verify` / `--liveness` only |
| `search_queries` | YAML array | **No** | Not read by any module |
| `scan_method: websearch` | per company | **No** | Handoff log at end of scan |
| ATS reverse scan | CLI | Yes | Thousands of companies |
| Local index | `sync-jobs` | Yes | SQLite query |

---

## WebSearch (not automated)

### `search_queries`

```yaml
search_queries:
  - name: Greenhouse — AI Engineer
    query: 'site:job-boards.greenhouse.io "AI Engineer" remote'
    enabled: true
```

Documented for broad `site:` discovery. **No `jobs/*.mjs` module reads this today.**

### `scan_method: websearch`

When `scan.mjs` cannot match an HTTP provider:

```
Agent/WebSearch handoff: N companies not handled by zero-token providers
  • Company (websearch) — site:example.com "engineer"
```

No search API is called. No offers added.

---

## Which command when?

| Goal | Command |
|------|---------|
| Broad automated search | `raven discover` |
| ATS only | `raven scan-ats` |
| Boards only | `raven discover --sources boards` |
| Offline index | `raven sync-jobs` + `raven discover --sources index` |

---

## Related

- [How discovery works](how-it-works/)
- [portals.yml](../configuration/portals/)
- [Sources & tiers](sources/)
