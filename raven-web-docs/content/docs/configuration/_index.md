---
title: Configuration
weight: 20
bookCollapseSection: true
---

# Configuration

Raven reads YAML from `config/` and secrets from `.env`. User-specific files are **gitignored** — templates ship as `*.example.yml`.

Run `raven setup` once to copy all examples into place.

## Pages in this section

{{< section summary >}}

## Config files overview

| File | Purpose | Required for |
|------|---------|--------------|
| `config/portals.yml` | Title/location filters, enabled boards | `raven discover` (default filters) |
| `config/profile.yml` | Identity, links, resume path, email templates | `raven draft` |
| `config/outreach.yml` | Legacy templates | Optional (prefer `profile.outreach`) |
| `.env` | OAuth tokens, API keys, sender identity | `raven send`, optional Gemini/HF |

## What to edit first

1. **`profile.yml`** — your name, email, portfolio, GitHub, LinkedIn
2. **`files/resume.md`** — replace the example with your real resume
3. **`portals.yml`** — `title_filter.positive` keywords for roles you want
4. **`.env`** — only needed when you are ready to send email

```bash
./raven setup          # creates all config from examples
./raven discover       # uses portals.yml filters
./raven draft --max 5  # uses profile.yml + resume
```

Start with [portals.yml →](portals/)
