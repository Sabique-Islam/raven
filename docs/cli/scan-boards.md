# raven scan-boards

Board feed scan only — no live ATS walk, no local index.

**Module:** `jobs/scan.mjs --boards-only`

```bash
raven scan-boards --q "software engineer"
raven scan-boards --loc Remote --json
```

## Boards scanned

| Provider | Source |
|----------|--------|
| RemoteOK | `remoteok.mjs` |
| Remotive | `remotive.mjs` |
| Arbeitnow | `arbeitnow.mjs` |
| Landing.jobs | `landingjobs.mjs` |

Same filter flags as [discover.md](discover.md).

For unified search, prefer `raven discover --sources boards`.

See [jobs/providers/README.md](../jobs/providers/README.md).
