---
title: setup
weight: 5
---

# raven setup

First-time installation and config seeding.

```bash
raven setup
```

Installs npm dependencies (root + `jobs/`) and creates:

- `.env` from `.env.example`
- `config/portals.yml` from example
- `config/profile.yml` from example
- `config/outreach.yml` from example
- `files/resume.md` from example

Safe to re-run — existing files are not overwritten.
