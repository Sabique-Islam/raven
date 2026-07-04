---
title: Pipeline
weight: 20
---

# Discover → Draft → Send

Raven's workflow is three stages. Each stage produces artifacts the next stage consumes.

## Stage 1: Discover

```bash
raven discover
```

**Input:** `config/portals.yml` filters (+ optional CLI flags)

**Output:** `data/jobs.json` (auto-saved)

**Sources (parallel):**

| Tier | Flag | Description |
|------|------|-------------|
| ATS | `--sources ats` | Live APIs: Greenhouse, Lever, Ashby, Workday, … |
| Boards | `--sources boards` | RemoteOK, Remotive, Arbeitnow, Landing.jobs |
| Index | `--sources index` | Local SQLite from openjobdata |
| hiring.cafe | `--sources hiringcafe` | Opt-in; may need `HIRING_CAFE_ENABLED=1` |

## Stage 2: Draft

```bash
raven draft --max 25
```

**Input:** `data/jobs.json` + `config/profile.yml` + parsed resume

**Output:**

- `drafts/outreach-YYYY-MM-DD.csv`
- `drafts/outreach-YYYY-MM-DD.md`

Each row is classified as **email** or **form** (ATS application).

## Stage 3: Send (optional)

```bash
raven auth-gmail
raven send --input drafts/outreach-2026-07-04.csv --dry-run
raven send --input drafts/outreach-2026-07-04.csv
```

**Input:** CSV with `contact_email`, `subject`, `body`

**Output:** Sent emails (or dry-run preview)

Form-application rows are **not** sent — use `form_steps` from the draft instead.

## One-liner pipeline

```bash
raven discover && raven draft --max 20
```

## Logging

Every job command writes timestamped logs to `data/logs/` and prints live progress with per-phase stats.
