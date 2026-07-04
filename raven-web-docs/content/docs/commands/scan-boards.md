---
title: scan-boards
weight: 55
---

# raven scan-boards

Board feed scan only (RemoteOK, Remotive, Arbeitnow, Landing.jobs).

```bash
raven scan-boards --q "software engineer"
raven scan-boards --q engineer --loc Remote --json
```

Faster than full ATS walk — good for remote-first roles.

For unified search, prefer `raven discover --sources boards`.
