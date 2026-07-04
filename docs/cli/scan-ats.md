# raven scan-ats / scan-boards / query

## scan-ats

Live ATS reverse scan only (no boards/index).

```bash
raven scan-ats --q "software engineer" --since 7
raven scan-ats --ats greenhouse,lever --json
```

Same filter flags as [discover.md](discover.md). Module: `jobs/scan-ats-full.mjs`.

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
