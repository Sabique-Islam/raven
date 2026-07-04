---
title: Quick Start
weight: 20
---

# Quick Start

Five minutes from zero to your first tailored application drafts.

## 1. Setup

```bash
cd raven
./raven setup
```

## 2. Configure filters and profile

Edit **`config/portals.yml`** — what jobs to find:

```yaml
title_filter:
  positive:
    - "software engineer"
    - "backend"
    - "developer"
  negative:
    - "nurse"
    - "sales"

location_filter:
  allow:
    - "Remote"
    - "India"
```

Edit **`config/profile.yml`** — who you are when drafting:

```yaml
identity:
  name: "Your Name"
  email: "you@example.com"
  location: "City, Country"

links:
  resume: "files/resume.md"
  portfolio: "https://yoursite.dev"
  github: "https://github.com/you"
  linkedin: "https://linkedin.com/in/you"
```

Replace **`files/resume.md`** with your real resume (Markdown with `## Experience` and `-` bullets works best).

## 3. Discover jobs

```bash
./raven discover --since 7
```

Raven loads filters from `config/portals.yml` automatically. Results save to **`data/jobs.json`**.

For a faster first run (board feeds only):

```bash
./raven discover --sources boards --since 7
```

## 4. Draft applications

```bash
./raven draft --max 25
```

Outputs:

- `drafts/outreach-YYYY-MM-DD.csv` — spreadsheet for review and send
- `drafts/outreach-YYYY-MM-DD.md` — human-readable review

## 5. Apply

| `application_type` | What to do |
|--------------------|------------|
| **form** (Ashby, Greenhouse, Workday, …) | Follow `form_steps` in the CSV or `.md` file |
| **email** | Fill `contact_email`, then `raven send --dry-run` |

**Always review drafts yourself** before submitting or sending.

## Next steps

- [Example dry run](dry-run/) — detailed walkthrough
- [Discover command](../commands/discover/) — all flags
- [Profile configuration](../configuration/profile/) — resume parsing and Gemini
