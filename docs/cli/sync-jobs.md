# raven sync-jobs

Download openjobdata into local SQLite index.

**Module:** `jobs/sync-openjobdata.mjs`

See [data/jobs-db.md](../data/jobs-db.md).

```bash
raven sync-jobs
raven sync-jobs --days 3
```

| Flag | Default | Description |
|------|---------|-------------|
| `--days` | `2` | Daily delta files to fetch |
| `--full` | off | Full backfill (slow) |
| `--no-export-ats` | off | Skip ATS slug export |

Set `HF_TOKEN` in `.env` if HTTP 401.
