# Raven documentation

Complete reference for the Raven CLI: job discovery, tailored drafting, and email outreach.

**Live docs site:** [raven.nopejs.me](https://raven.nopejs.me) (Hugo site in `raven-web-docs/`)

---

## Start here

| Doc | What you'll learn |
|-----|-------------------|
| [Architecture](ARCHITECTURE.md) | Repo layout, layers, how bash + Node fit together |
| [Pipeline](PIPELINE.md) | Discover → Draft → Send flow with diagrams |
| [Deep dives](DEEP_DIVES.md) | **Technical & interview-style** — how discovery really works, scan strategies, draft pipeline |
| [File layout](FILE_LAYOUT.md) | Every directory and path constant |

---

## CLI commands

| Command | Doc |
|---------|-----|
| `raven setup` | [cli/setup.md](cli/setup.md) |
| `raven discover` | [cli/discover.md](cli/discover.md) |
| `raven draft` | [cli/draft.md](cli/draft.md) |
| `raven send` | [cli/send.md](cli/send.md) |
| `raven sync-jobs` | [cli/sync-jobs.md](cli/sync-jobs.md) |
| `raven scan-ats` | [cli/scan-ats.md](cli/scan-ats.md) |
| `raven scan-boards` | [cli/scan-boards.md](cli/scan-boards.md) |
| `raven query` | [cli/query.md](cli/query.md) |
| `raven auth-gmail` / `auth-outlook` | [cli/auth.md](cli/auth.md) |

Overview: [cli/README.md](cli/README.md)

---

## Configuration

| File | Doc |
|------|-----|
| `config/portals.yml` | [config/portals.md](config/portals.md) |
| `config/profile.yml` | [config/profile.md](config/profile.md) |
| `config/outreach.yml` | [config/outreach.md](config/outreach.md) |
| `.env` | [config/env.md](config/env.md) |

Overview: [config/README.md](config/README.md)

---

## Job engine (`jobs/`)

| Topic | Doc |
|-------|-----|
| **Discovery deep dive** | [jobs/discovery-deep-dive.md](jobs/discovery-deep-dive.md) |
| Scan strategies (WebSearch status) | [jobs/scan-strategies.md](jobs/scan-strategies.md) |
| **Draft deep dive** | [jobs/draft-deep-dive.md](jobs/draft-deep-dive.md) |
| Discover orchestrator | [jobs/discover-engine.md](jobs/discover-engine.md) |
| Draft orchestrator | [jobs/draft-engine.md](jobs/draft-engine.md) |
| Filters | [jobs/filters.md](jobs/filters.md) |
| Deduplication | [jobs/dedup.md](jobs/dedup.md) |
| Logging | [jobs/logging.md](jobs/logging.md) |
| Library modules | [jobs/lib/README.md](jobs/lib/README.md) |
| Providers | [jobs/providers/README.md](jobs/providers/README.md) |

Overview: [jobs/README.md](jobs/README.md) · Index: [DEEP_DIVES.md](DEEP_DIVES.md)

---

## Data & output

| Topic | Doc |
|-------|-----|
| `data/jobs.json` | [data/jobs-json.md](data/jobs-json.md) |
| `data/jobs.db` | [data/jobs-db.md](data/jobs-db.md) |
| Logs & cache | [data/logs-and-cache.md](data/logs-and-cache.md) |
| Draft output | [drafts/README.md](drafts/README.md) |
| Resume format | [files/resume.md](files/resume.md) |

Overview: [data/README.md](data/README.md)

---

## Other

| Doc | Topic |
|-----|-------|
| [scripts/README.md](scripts/README.md) | Bash wrapper layer |
| [email/README.md](email/README.md) | Gmail / Outlook OAuth & sending |
