# raven query

Search the local openjobdata SQLite index.

**Module:** `jobs/query-index.mjs`  
**Requires:** `data/jobs.db` from `raven sync-jobs`

```bash
raven query --q "software engineer" --since 7
raven query --q "ML engineer" --ats greenhouse,lever --json
```

## Flags

Same as [discover.md](discover.md): `--q`, `--not`, `--loc`, `--noloc`, `--home`, `--since`, `--ats`, `--max`, `--json`, logging flags.

## vs discover

| Command | Scope |
|---------|-------|
| `query` | Local SQLite only |
| `discover --sources index` | Index tier inside parallel discover |

See [data/jobs-db.md](../data/jobs-db.md).
