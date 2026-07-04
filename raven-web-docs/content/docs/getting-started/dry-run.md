---
title: Example Dry Run
weight: 30
---

# Example Dry Run

Complete pipeline walkthrough **without sending email**. Copy commands from your Raven repo root.

## Step 0 — Install

```bash
cd raven
./raven setup
```

## Step 1 — Configure

1. **`config/profile.yml`** — name, email, portfolio, GitHub, LinkedIn, resume path
2. **`files/resume.md`** — your resume with `-` bullets under `## Experience`
3. **`config/portals.yml`** — title keywords (e.g. `software engineer`, `backend`, `developer`)

No Gmail OAuth needed for this dry run.

## Step 2 — Discover (boards only, fast)

```bash
./raven discover \
  --sources boards \
  --since 7
```

Omit `--sources boards` for full ATS + boards + index (slower, ~1–2 minutes).

**Expected output:**

```
[08:47:54] Raven discover — sources: boards | since 7d | max 1000
[08:47:54]   title keywords: software engineer, developer, …
[08:47:54]   locations: Remote, India
[08:47:57] ✓ Board feeds — matches=58 (3.5s)
[08:47:57] Saved: …/data/jobs.json
[08:47:57] Next: raven draft --max 25
```

Inspect saved jobs:

```bash
node -e "console.log(require('./data/jobs.json').count, 'jobs')"
```

## Step 3 — Draft

```bash
./raven draft --max 5
```

**Expected:**

- `Parse resume` — bullet and skill counts
- `Draft N applications` — email vs form breakdown
- Files: `drafts/outreach-YYYY-MM-DD.csv` and `.md`

Open the review file:

```bash
open drafts/outreach-*.md   # macOS
```

Each entry includes JD keywords, action words, tailored bullets, and form guides for ATS jobs.

## Step 4 — Preview send (optional)

Only for CSV rows with a valid `contact_email`. Most listings leave this blank.

```bash
./raven send --input drafts/outreach-2026-07-04.csv --dry-run
```

Nothing is sent in dry-run mode.

## Step 5 — What next?

| Goal | Command |
|------|---------|
| Full ATS scan | `./raven discover` (all sources) |
| Local index breadth | `./raven sync-jobs` then discover with `--sources index` |
| AI email polish | Add `GEMINI_API_KEY`, run `./raven draft --gemini` |
| Submit ATS forms | Follow `form_steps` column in CSV |

See [Troubleshooting](../reference/troubleshooting/) if you see unrelated jobs (e.g. nurse roles) — usually means `portals.yml` title filters need tightening.
