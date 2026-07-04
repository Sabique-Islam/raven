# Technical deep dives

Interview-style architecture notes for contributors and power users. These docs explain **how Raven actually works** — not just CLI flags — including what is implemented today vs. what is only configured or planned.

---

## Discovery & job search

| Doc | What you'll learn |
|-----|-------------------|
| [jobs/discovery-deep-dive.md](jobs/discovery-deep-dive.md) | **Start here.** How `raven discover` works end-to-end: parallel tiers, ATS reverse scan, filtering, dedup, and why it is **not** a Google-style web search |
| [jobs/scan-strategies.md](jobs/scan-strategies.md) | The 4-level scan strategy (`local_parser` → Playwright → HTTP JSON → WebSearch): implementation status per level |
| [jobs/discover-engine.md](jobs/discover-engine.md) | `discover.mjs` orchestrator: spawn model, temp portals, stream events |
| [jobs/providers/README.md](jobs/providers/README.md) | Per-platform HTTP fetchers (12 ATS + 4 boards) |
| [jobs/filters.md](jobs/filters.md) | Title/location/content filter semantics |
| [jobs/dedup.md](jobs/dedup.md) | Canonical URL dedup across tiers |

---

## Drafting & outreach

| Doc | What you'll learn |
|-----|-------------------|
| [jobs/draft-deep-dive.md](jobs/draft-deep-dive.md) | Email vs form classification, resume tailoring, Gemini opt-in, output shapes |
| [jobs/draft-engine.md](jobs/draft-engine.md) | `draft-outreach.mjs` + `lib/draft-engine.mjs` module map |

---

## System & pipeline

| Doc | What you'll learn |
|-----|-------------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Repo layers: bash → Node → providers → data |
| [PIPELINE.md](PIPELINE.md) | Discover → Draft → Send workflow |
| [FILE_LAYOUT.md](FILE_LAYOUT.md) | Every path constant and directory |

---

## Quick FAQ (discovery)

**Does `raven discover` search Google or scrape arbitrary websites?**  
No. It queries **structured APIs and feeds** (ATS JSON endpoints, board APIs, local SQLite index). See [discovery-deep-dive.md](jobs/discovery-deep-dive.md).

**What about `search_queries` and `scan_method: websearch` in `portals.yml`?**  
Documented in config but **not executed** by the discover pipeline today. `websearch` entries are logged as agent handoff hints. See [scan-strategies.md](jobs/scan-strategies.md).

**How does Raven find jobs at companies I've never heard of?**  
**Reverse ATS scan**: walk public company directories per platform (Greenhouse, Lever, …), hit each company's public jobs API, filter client-side. No company list curation required.

**Why three default tiers in parallel?**  
ATS APIs are broad and fresh; board feeds are fast for remote roles; the local index adds coverage when APIs miss listings. Results are merged and deduplicated by canonical apply URL.

---

## Related quick references

- [JOB_SOURCES.md](JOB_SOURCES.md) — tier cheat sheet
- [cli/discover.md](cli/discover.md) — flags and examples
- [config/portals.md](config/portals.md) — YAML filter config
