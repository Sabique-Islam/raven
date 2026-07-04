# data/jobs.db (openjobdata)

Local SQLite index from [openjobdata.com](https://openjobdata.com/documentation).

**Path:** `data/jobs.db` (gitignored)  
**Override:** `RAVEN_JOBS_DB` in `.env`  
**Created by:** `raven sync-jobs`

---

## Sync

```bash
raven sync-jobs
raven sync-jobs --days 5 --full
```

Source: HuggingFace bucket `Invicto69/Jobs-Dataset-bucket`

| Flag | Description |
|------|-------------|
| `--days N` | Number of daily parquet deltas (default 2) |
| `--full` | Full historical backfill |
| `--no-export-ats` | Skip exporting slug lists to `data/cache/ats-companies/` |

**Auth:** Set `HF_TOKEN` if HTTP 401.

---

## Query

```bash
raven query --q "software engineer" --since 7
raven discover --sources index --q "backend"
```

Same filter semantics as discover.

---

## Checkpoint

`data/cache/openjobdata-last-sync.json` — last successful sync metadata.

---

## Related

- [cli/sync-jobs.md](../cli/sync-jobs.md)
- [cli/discover.md](../cli/discover.md)
