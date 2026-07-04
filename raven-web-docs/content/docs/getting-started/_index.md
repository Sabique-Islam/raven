---
title: Getting Started
weight: 10
bookCollapseSection: true
description: Install Raven, configure your profile and resume, and run your first discover → draft pipeline.
---

# Getting Started

New to Raven? These guides take you from a fresh clone to your first tailored application drafts — no email sending required.

Raven is a local CLI: **Discover** jobs across ATS platforms and board feeds, **Draft** tailored emails or ATS form guides from your resume, and optionally **Send** outreach via Gmail or Outlook.

## Pages in this section

{{< section summary >}}

## Recommended order

| Step | Guide | Time |
|------|-------|------|
| 1 | [Installation](installation/) | 5 min — clone, `raven setup`, edit config |
| 2 | [Quick Start](quickstart/) | 5 min — discover + draft your first jobs |
| 3 | [Example Dry Run](dry-run/) | 15 min — full pipeline walkthrough |

## Minimum setup before your first search

```bash
./raven setup
# Edit config/profile.yml — name, email, links
# Replace files/resume.md with your resume
# Edit config/portals.yml — title filters for your target roles
```

Then run:

```bash
./raven discover --q "software engineer" --since 7
./raven draft --max 10
open drafts/outreach-*.md
```

Next: [Installation →](installation/)
