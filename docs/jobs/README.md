# jobs/ — Node job engine

All job discovery and drafting logic lives in `jobs/` as ESM modules.

---

## Entry modules

| File | CLI command |
|------|-------------|
| `discover.mjs` | `raven discover` |
| `draft-outreach.mjs` | `raven draft` |
| `sync-openjobdata.mjs` | `raven sync-jobs` |
| `scan-ats-full.mjs` | `raven scan-ats` |
| `scan.mjs` | `raven scan-boards` |
| `query-index.mjs` | `raven query` |

---

## Subdirectories

| Dir | Doc |
|-----|-----|
| `lib/` | [lib/README.md](lib/README.md) |
| `providers/` | [providers/README.md](providers/README.md) |
| `plugins/` | `gemini-draft.mjs` — optional AI polish |

---

## Deep dives

- [discover-engine.md](discover-engine.md)
- [draft-engine.md](draft-engine.md)
- [filters.md](filters.md)
- [dedup.md](dedup.md)
- [logging.md](logging.md)

---

## Direct npm (jobs/)

```bash
cd jobs
npm run discover -- --q "engineer"
npm run sync
npm run query -- --q "designer"
```
