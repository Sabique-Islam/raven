---
title: Documentation
weight: 1
bookFlatSection: true
description: Full Raven CLI documentation — installation, job discovery, resume-aware drafting, ATS form guides, and email outreach.
---

# Raven Documentation

Raven helps you **find jobs** across major ATS platforms and board feeds, **draft tailored applications** from your profile and resume, and **send outreach** via Gmail or Outlook — all from a single CLI.

## What Raven does

| Stage | Command | Output |
|-------|---------|--------|
| **Discover** | `raven discover` | Matching jobs → `data/jobs.json` |
| **Draft** | `raven draft` | CSV + Markdown application drafts |
| **Send** | `raven send` | Email delivery (optional) |

## Who this is for

- Software engineers and builders searching across Greenhouse, Lever, Ashby, Workday, and board feeds
- Job seekers who want resume-aware drafts and ATS form guides, not generic cover letters
- Power users who prefer a scriptable, local-first workflow over browser tab sprawl

## Quick links

### Getting started
- [Installation](getting-started/installation/) — first-time setup
- [Quick start](getting-started/quickstart/) — five-minute overview
- [Example dry run](getting-started/dry-run/) — full pipeline walkthrough

### Core workflow
- [Architecture](concepts/architecture/) — how Raven is structured
- [Pipeline](concepts/pipeline/) — Discover → Draft → Send
- [Discover command](commands/discover/) — job search reference
- [Draft command](commands/draft/) — tailored application drafts
- [Send command](commands/send/) — email outreach

### Configuration
- [portals.yml](configuration/portals/) — job search filters
- [profile.yml](configuration/profile/) — your source of truth
- [Environment variables](configuration/env/) — `.env` reference

### Advanced
- [Job sources](job-discovery/sources/) — ATS, boards, openjobdata
- [Resume parsing](drafting/resume/) — format and cache
- [ATS form guides](drafting/form-guides/) — non-email applications
- [Gemini plugin](drafting/gemini/) — optional AI polish
- [Troubleshooting](reference/troubleshooting/) — common issues

## Requirements

- Node.js 18+
- Optional: Gmail/Outlook OAuth for sending email
- Optional: `GEMINI_API_KEY` for AI-assisted email drafts
- Optional: `HF_TOKEN` for openjobdata sync (if bucket requires auth)
