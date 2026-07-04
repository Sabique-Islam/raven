---
title: Architecture
weight: 10
---

# Architecture

Raven is a **bash CLI** (`bin/raven`) that dispatches to **shell scripts** (`scripts/*.sh`), which invoke a **Node.js discovery engine** (`jobs/`).

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  bin/raven  │────▶│ scripts/*.sh │────▶│  jobs/*.mjs     │
│  (CLI)      │     │  (_lib.sh)   │     │  (ESM engine)   │
└─────────────┘     └──────────────┘     └─────────────────┘
                           │                      │
                           ▼                      ▼
                    config/*.yml            data/jobs.json
                    .env                    data/jobs.db
                    files/resume.md         drafts/
```

## Layers

### CLI layer (`bin/raven`, `scripts/`)

- Resolves repo root (works with `npm link`)
- Loads `.env`
- Ensures dependencies installed
- Forwards to Node scripts or bash helpers

### Discovery engine (`jobs/`)

| Module | Role |
|--------|------|
| `discover.mjs` | Orchestrates parallel tier scans |
| `scan-ats-full.mjs` | Reverse ATS walk (12 platforms) |
| `scan.mjs` | Board feeds + portal scanner |
| `sync-openjobdata.mjs` | HuggingFace → SQLite index |
| `query-index.mjs` | Search local index |
| `draft-outreach.mjs` | Application draft CLI |
| `lib/draft-engine.mjs` | Profile + resume + form guides |
| `plugins/gemini-draft.mjs` | Optional Gemini email polish |

### Providers (`jobs/providers/`)

One module per ATS or board feed. Each exports `{ id, fetch, detect? }` and uses shared HTTP helpers.

## Data flow

1. **Discover** — parallel HTTP/API calls → deduplicated offers → `data/jobs.json` ([details](../job-discovery/how-it-works/))
2. **Draft** — load profile + parse resume → tailor per job → CSV/MD
3. **Send** — read CSV → Gmail/Outlook API

## Discovery model

`raven discover` runs **ATS reverse scan**, **board feeds**, and **local index** in parallel. It does not call Google or execute `search_queries` from portals.yml ([scan strategies](../job-discovery/scan-strategies/)).

## Design principles

- **Local-first** — jobs, drafts, logs stay on disk; no required cloud service
- **Zero LLM by default** — discovery is pure HTTP; Gemini is opt-in for drafts
- **Modular** — filters, profile, resume, JD tailor, form guides are separate modules
- **Config as source of truth** — `portals.yml` for search, `profile.yml` for identity
