---
title: Concepts
weight: 20
bookCollapseSection: true
---

# Concepts

Understand how Raven is structured and how the **Discover → Draft → Send** pipeline fits together before diving into individual commands.

## Pages in this section

{{< section summary >}}

## The pipeline at a glance

```
config/profile.yml + files/resume.md
         │
         ▼
   raven discover  ──►  data/jobs.json
         │
         ▼
   raven draft     ──►  drafts/outreach-*.csv + .md
         │
         ▼
   raven send      ──►  Gmail / Outlook (email rows only)
```

| Stage | Input | Output |
|-------|-------|--------|
| **Discover** | Search filters, ATS APIs, board feeds | Matching jobs saved to JSON |
| **Draft** | Jobs + your profile + resume | Tailored CSV, Markdown review, form guides |
| **Send** | CSV with `contact_email` | Delivered emails (optional) |

## Design principles

- **Local-first** — jobs, drafts, logs, and config stay on your machine
- **Profile as source of truth** — one YAML file drives all drafting
- **Resume-aware** — bullets are matched per job, not generic templates
- **Form vs email** — ATS applications get step-by-step guides, not blind sends

Start with [Architecture →](architecture/)
