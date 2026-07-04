# raven setup

First-time installation and configuration seeding.

**Script:** `scripts/setup.sh`

---

## Usage

```bash
raven setup
```

Safe to re-run — **does not overwrite** existing user files.

---

## What it does

1. `npm install` in repo root
2. `npm install` in `jobs/`
3. Copies templates → user config (if missing):

| Template | Creates |
|----------|---------|
| `.env.example` | `.env` |
| `config/portals.example.yml` | `config/portals.yml` |
| `config/profile.example.yml` | `config/profile.yml` |
| `config/outreach.example.yml` | `config/outreach.yml` |
| `files/resume.example.md` | `files/resume.md` |

---

## After setup

1. Edit [config/profile.yml](../config/profile.md)
2. Replace [files/resume.md](../files/resume.md)
3. Edit [config/portals.yml](../config/portals.md)
4. Run `raven discover`

---

## Optional global CLI

```bash
npm link
raven --help
```
