# Discover engine internals

**Module:** `jobs/discover.mjs`

> **Architecture overview:** [discovery-deep-dive.md](discovery-deep-dive.md) — how tiers work, what is *not* web search, interview Q&A.

---

## Exports

```javascript
export { discover, parseArgs, saveDiscoverResults };
```

---

## Algorithm

1. **parseArgs(argv)** — CLI flags
2. **resolveDiscoverFilters(args, loadPortalsFilters())** — merge YAML
3. **Parallel tasks** per `--sources`:
   - `ats` → spawn `scan-ats-full.mjs` with temp portals YAML
   - `boards` → spawn `scan.mjs --boards-only`
   - `index` → spawn `query-index.mjs` (skip if no DB)
   - `hiringcafe` → `providers/hiring-cafe.mjs` if enabled
4. **mergeDeduped** all tier arrays
5. **sortOffers** by date
6. **slice** to `--max`
7. **saveDiscoverResults** → JSON (unless `--no-save`)
8. **createLogger** → `data/logs/discover-*.log`

---

## Temp portals

Child processes receive filters via temp file:

```
$TMPDIR/raven-discover-<uuid>.yml
```

Set on child env: `RAVEN_PORTALS=<temp path>`

Cleaned up after run via `cleanupTempPortals()`.

---

## Stream mode

`--stream` emits NDJSON on stdout for programmatic consumers (web UI, CI).

Event kinds: `start`, `atsDone`, `boardsDone`, `indexDone`, `offer`, `summary`, `done`, `log`.

---

## Child process contract

ATS and boards tiers spawn Node children instead of importing scan modules:

| Child | Args | Env |
|-------|------|-----|
| `scan-ats-full.mjs` | `--dry-run --json --since N --ats … --limit N` | `RAVEN_PORTALS=<temp yml>` |
| `scan.mjs` | `--dry-run --boards-only --json` | `RAVEN_PORTALS=<temp yml>` |

Stdout must contain a single JSON object with `{ offers: [...] }`. Discover parses the last JSON line if mixed with logs.

Index and hiring.cafe tiers run **in-process** (no spawn).

---

## Related

- [discovery-deep-dive.md](discovery-deep-dive.md) — full architecture
- [scan-strategies.md](scan-strategies.md) — WebSearch / Playwright status
- [cli/discover.md](../cli/discover.md)
- [filters.md](filters.md)
- [dedup.md](dedup.md)
- [providers/README.md](providers/README.md)
- [DEEP_DIVES.md](../DEEP_DIVES.md)
