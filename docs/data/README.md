# data/ — runtime data

Local files produced by Raven commands. Most paths are **gitignored**.

---

## Files

| Path | Doc |
|------|-----|
| `data/jobs.json` | [jobs-json.md](jobs-json.md) |
| `data/jobs.db` | [jobs-db.md](jobs-db.md) |
| `data/logs/`, `data/cache/` | [logs-and-cache.md](logs-and-cache.md) |

---

## Quick reference

| Path | Created by | Purpose |
|------|------------|---------|
| `jobs.json` | discover | Latest job matches |
| `jobs.db` | sync-jobs | openjobdata SQLite |
| `cache/resume-parsed.json` | draft | Resume parse cache |
| `cache/ats-companies/` | sync-jobs | ATS slug lists |
| `cache/openjobdata-last-sync.json` | sync-jobs | Sync checkpoint |
| `logs/*.log` | all job cmds | Timestamped logs |
| `scan-history.tsv` | scan flows | URL dedup history |

---

## Gitignore

See [FILE_LAYOUT.md](../FILE_LAYOUT.md).
