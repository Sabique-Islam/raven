---
title: Installation
weight: 10
---

# Installation

## Requirements

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 18+ | Required |
| npm | bundled with Node | Required |
| Git | any | Clone the repository |

Optional:

- Gmail or Microsoft OAuth credentials for `raven send`
- `GEMINI_API_KEY` for `raven draft --gemini`
- `HF_TOKEN` (HuggingFace) if openjobdata sync returns HTTP 401

## Clone and setup

From the Raven repository root:

```bash
git clone <your-raven-repo-url> raven
cd raven
./raven setup
```

`raven setup` runs:

1. `npm install` in the repo root
2. `npm install` in `jobs/`
3. Creates starter config from examples (if missing):

| File | Purpose |
|------|---------|
| `.env` | Sender identity, API keys, OAuth tokens |
| `config/portals.yml` | Job search filters |
| `config/profile.yml` | Identity, links, resume path |
| `files/resume.md` | Starter resume (replace with yours) |

## Install `raven` globally (optional)

```bash
npm link
raven --help
```

Without `npm link`, use `./raven` from the repo root.

## Verify installation

```bash
./raven --help
./raven discover --help
./raven draft --help
```

You should see command lists without errors. If dependencies are missing, re-run `./raven setup`.

## Hugo docs (this site)

To preview this documentation locally:

```bash
cd raven-web-docs
hugo mod get
hugo server
```

See [raven-web-docs/README.md](https://github.com/Sabique-Islam/raven/tree/master/raven-web-docs) in the repository.
