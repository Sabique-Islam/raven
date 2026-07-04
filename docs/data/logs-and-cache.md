# Logs & cache

---

## Logs (`data/logs/`)

| Pattern | Command |
|---------|---------|
| `discover-*.log` | `raven discover` |
| `draft-*.log` | `raven draft` |
| `sync-jobs-*.log` | `raven sync-jobs` |
| `send-*.log` | `raven send` |

Timestamp in filename. Gitignored.

See [jobs/logging.md](../jobs/logging.md).

---

## Cache (`data/cache/`)

| File | Written by | Contents |
|------|------------|----------|
| `resume-parsed.json` | draft | Parsed bullets + skills |
| `openjobdata-last-sync.json` | sync-jobs | Sync checkpoint |
| `ats-companies/*.json` | sync-jobs | Greenhouse/Lever/Ashby/Workday slug lists |

All gitignored.

---

## Resume cache invalidation

```bash
raven draft --refresh-resume
```

Or delete `data/cache/resume-parsed.json` manually.
