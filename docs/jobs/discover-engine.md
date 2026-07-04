# Discover engine internals

**Module:** `jobs/discover.mjs`

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

## Related

- [cli/discover.md](../cli/discover.md)
- [filters.md](filters.md)
- [dedup.md](dedup.md)
- [providers/README.md](providers/README.md)
