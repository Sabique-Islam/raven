# Logging

**Module:** `jobs/lib/log.mjs`

---

## Default behavior

Every job command writes:

1. **Stdout/stderr** — live progress phases and stats
2. **Log file** — `data/logs/<command>-<YYYY-MM-DDTHH-MM-SS>.log`

---

## Flags

| Flag | Screen | Log file |
|------|--------|----------|
| *(default)* | Progress + summary | Yes |
| `--verbose` | Per-source detail | Yes (more detail) |
| `--quiet` | One line | Yes |
| `--no-log` | Progress | No |
| `--log` | (with quiet) | Force file |

---

## Logger API

```javascript
const log = createLogger('discover', { verbose, quiet, noLog });
log.phase('ATS', 'scanning greenhouse');
log.stat('matches', 42);
log.info('Saved', 'data/jobs.json');
log.warn('Index missing', 'run sync-jobs');
log.close();
```

---

## Environment

| Variable | Effect |
|----------|--------|
| `RAVEN_VERBOSE=1` | Verbose |
| `RAVEN_QUIET=1` | Quiet |
| `RAVEN_LOG=1` | Force log |

---

## Privacy

Logs may contain job titles, companies, URLs. `data/logs/` is gitignored.
