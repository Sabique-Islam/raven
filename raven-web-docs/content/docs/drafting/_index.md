---
title: Drafting
weight: 35
bookCollapseSection: true
---

# Drafting

Turn discovered jobs into **tailored application drafts** — email copy for direct outreach, or step-by-step guides for ATS forms (Greenhouse, Lever, Ashby, Workday, etc.).

## Pages in this section

{{< section summary >}}

## What you get

| Output | Contents |
|--------|----------|
| `drafts/outreach-YYYY-MM-DD.csv` | All columns — send-ready spreadsheet |
| `drafts/outreach-YYYY-MM-DD.md` | Human-readable review of every draft |

## Key CSV columns

| Column | Meaning |
|--------|---------|
| `application_type` | `email` or `form` |
| `jd_keywords` | Terms extracted from the job title |
| `action_words` | Suggested verbs for this role |
| `tailored_bullets` | Resume bullets matched to the job |
| `form_steps` | Full ATS guide (form jobs only) |
| `disclaimer` | Reminder to review before submitting |

## Quick start

```bash
./raven discover --q "backend engineer" --since 7
./raven draft --max 25
open drafts/outreach-*.md
```

Optional: add `GEMINI_API_KEY` to `.env` and pass `--gemini` for AI-polished email drafts.

**Important:** Review every draft yourself. Form rows are not sent via `raven send`.

Start with [Resume parsing →](resume/)
