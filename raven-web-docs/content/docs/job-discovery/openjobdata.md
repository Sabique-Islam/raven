---
title: openjobdata
weight: 30
---

# openjobdata index

Raven syncs the [openjobdata](https://openjobdata.com/documentation) dataset into a local SQLite database for fast offline search.

## Sync

```bash
raven sync-jobs
raven sync-jobs --days 3
```

### What happens

1. Downloads companies registry from HuggingFace bucket `Invicto69/Jobs-Dataset-bucket`
2. Fetches recent daily parquet deltas
3. Upserts into `data/jobs.db`
4. Exports ATS company slug lists to `data/cache/ats-companies/`

### Authentication

If sync returns HTTP 401:

```bash
# .env
HF_TOKEN=hf_xxxxxxxx
```

Create a read token at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens).

## Query local index

```bash
raven query --q "software engineer" --since 7
raven query --q "ML engineer" --ats greenhouse,lever --json
```

Same filter flags as discover: `--q`, `--not`, `--loc`, `--since`, `--ats`, `--max`.

## Use in discover

```bash
raven sync-jobs
raven discover --sources index --q "backend developer"
```

Index tier runs in parallel with ATS and boards when `--sources` includes `index` (default).

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--days N` | `2` | Number of daily deltas to fetch |
| `--full` | off | Full backfill (slow, large download) |
| `--no-export-ats` | off | Skip ATS slug export to cache |

## Storage

| Path | Contents |
|------|----------|
| `data/jobs.db` | SQLite index (~millions of rows after full sync) |
| `data/cache/ats-companies/` | Greenhouse/Lever/Ashby/Workday slug JSON files |

Both paths are gitignored. Re-run `sync-jobs` periodically to stay current.

## When to use index vs live ATS

| Scenario | Recommendation |
|----------|----------------|
| Broad search across many companies | `--sources index` after sync |
| Latest postings from specific ATS | `--sources ats` |
| Remote board listings | `--sources boards` |
| Maximum coverage | Default (all three tiers) |

Index data may lag live ATS by 1–2 days. Live ATS scans are slower but fresher.
