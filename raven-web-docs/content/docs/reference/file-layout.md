---
title: File layout
weight: 20
---

# Repository layout

```
raven/
├── bin/raven              # CLI entry (npm link → global raven)
├── raven                  # Symlink to bin/raven
├── scripts/               # Bash wrappers (_lib.sh, discover.sh, draft.sh, …)
├── jobs/                  # Node.js job engine
│   ├── discover.mjs       # Unified discovery orchestrator
│   ├── draft-outreach.mjs # Draft orchestrator
│   ├── lib/               # Shared modules (profile, resume, log, portals, …)
│   └── plugins/           # Optional plugins (gemini-draft.mjs)
├── config/
│   ├── portals.example.yml
│   ├── profile.example.yml
│   └── outreach.example.yml
├── files/
│   └── resume.example.md  # Template resume
├── data/                  # Gitignored runtime data
│   ├── jobs.json          # Latest discover results
│   ├── jobs.db            # openjobdata SQLite index
│   ├── cache/             # Resume parse cache, ATS slug lists
│   └── logs/              # Command logs
├── drafts/                # Generated outreach CSV/MD/XLSX
├── docs/                  # Markdown docs (source for this site)
└── raven-web-docs/        # Hugo documentation site
```

## Tracked vs gitignored

| Tracked (committed) | Gitignored (local) |
|---------------------|-------------------|
| `*.example.yml` | `config/profile.yml` |
| `files/resume.example.md` | `config/portals.yml` |
| Source code | `config/outreach.yml` |
| | `files/resume.md` |
| | `data/*.json`, `data/jobs.db` |
| | `data/logs/`, `data/cache/` |
| | `drafts/outreach-*` |
| | `.env` |

## Key data files

| Path | Created by | Purpose |
|------|------------|---------|
| `data/jobs.json` | `raven discover` | Latest job matches (default draft input) |
| `data/jobs.db` | `raven sync-jobs` | Local openjobdata index |
| `data/cache/resume-parsed.json` | `raven draft` | Parsed resume cache |
| `drafts/outreach-*.csv` | `raven draft` | Send-ready spreadsheet |

## npm scripts

Equivalent to `./raven` subcommands:

```bash
npm run setup
npm run discover -- --q "engineer" --since 7
npm run draft -- --max 25
npm run send -- --input drafts/outreach.csv --dry-run
```
