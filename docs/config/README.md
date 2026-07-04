# config/README.md

Configuration files live in `config/` and `.env`. User copies are **gitignored**; templates ship as `*.example.yml`.

---

## Files

| File | Template | Gitignored | Used by |
|------|----------|------------|---------|
| `portals.yml` | `portals.example.yml` | yes | `discover`, `scan-*` |
| `profile.yml` | `profile.example.yml` | yes | `draft` |
| `outreach.yml` | `outreach.example.yml` | yes | `draft` (legacy fallback) |
| `.env` | `.env.example` | yes | `send`, OAuth, API keys |

---

## Setup

```bash
raven setup
```

Never overwrites existing user files.

---

## Docs

- [portals.md](portals.md) — search filters, job boards, tracked companies
- [profile.md](profile.md) — identity, resume, outreach templates
- [outreach.md](outreach.md) — legacy outreach YAML
- [env.md](env.md) — environment variables

---

## Path overrides

| Env var | Default |
|---------|---------|
| `RAVEN_PORTALS` | `config/portals.yml` |
| `RAVEN_PROFILE` | `config/profile.yml` |
| `RAVEN_OUTREACH` | `config/outreach.yml` |
