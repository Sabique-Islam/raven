---
title: sync-jobs
weight: 40
---

# raven sync-jobs

Download openjobdata daily deltas into a local SQLite index.

## Usage

```bash
raven sync-jobs
raven sync-jobs --days 3
```

## What it does

1. Syncs companies registry from HuggingFace bucket
2. Downloads recent daily parquet deltas
3. Upserts into `data/jobs.db`
4. Exports ATS company slug lists to `data/cache/ats-companies/`

## Environment

If you get HTTP 401:

```bash
# .env
HF_TOKEN=hf_xxxxxxxx
```

## After sync

```bash
raven discover --sources index --q "engineer"
raven query --q "ML engineer" --since 7
```

## Flags

| Flag | Description |
|------|-------------|
| `--days N` | Number of daily deltas to fetch | `2` |
| `--full` | Full backfill (slow) | — |
| `--no-export-ats` | Skip ATS slug export | — |

See [openjobdata](../job-discovery/openjobdata/) for details.
