---
title: query
weight: 60
---

# raven query

Search the local openjobdata SQLite index.

```bash
raven query --q "software engineer" --since 7
raven query --q "designer" --ats greenhouse,lever --json
```

Requires `data/jobs.db` from `raven sync-jobs`.

Same filter semantics as discover (`--q`, `--not`, `--loc`, `--since`, `--ats`, `--max`).
