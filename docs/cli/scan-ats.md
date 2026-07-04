# raven scan-ats / scan-boards / query

Lower-level scan commands. **`raven discover`** orchestrates ATS + boards + index in parallel — prefer discover for day-to-day use.

Deep dive: [jobs/discovery-deep-dive.md](../jobs/discovery-deep-dive.md)

---

## scan-ats

Live ATS **reverse scan** only (no boards/index).

Walks public company directories per platform (Greenhouse, Lever, Ashby, …), hits each company's public jobs JSON API, filters by `portals.yml` title/location rules.

```bash
raven scan-ats --q "software engineer" --since 7
raven scan-ats --ats greenhouse,lever --json
raven scan-ats --limit 200 --verbose
```

| Flag | Default | Meaning |
|------|---------|---------|
| `--since` | 3 (scan-ats) / 7 (discover) | Postings within N days |
| `--ats` | all 12 | Platform subset |
| `--limit` | all companies | Max companies per platform |
| `--liveness` | off | Playwright-verify URLs before output |

Same filter flags as [discover.md](discover.md). Module: `jobs/scan-ats-full.mjs`.

Company slugs: `data/cache/ats-companies/` or GitHub job-board-aggregator dataset.

---

## scan-boards

Board feeds only (RemoteOK, Remotive, Arbeitnow, Landing.jobs).

```bash
raven scan-boards --q "developer" --loc Remote
```

Module: `jobs/scan.mjs --boards-only`.

---

## query

Search local SQLite index (requires `raven sync-jobs` first).

```bash
raven query --q "ML engineer" --since 7 --json
```

Module: `jobs/query-index.mjs`. See [data/jobs-db.md](../data/jobs-db.md).
