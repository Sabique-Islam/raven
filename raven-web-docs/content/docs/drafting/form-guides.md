---
title: ATS form guides
weight: 30
---

# ATS form guides

When a job's apply URL points to an ATS (Greenhouse, Lever, Ashby, Workday, etc.), Raven generates a **form application guide** instead of an email.

## Application types

| Type | Detected when | Raven output |
|------|---------------|--------------|
| `email` | Direct email outreach possible | Subject + body |
| `form` | Apply URL on known ATS domain | Step-by-step `form_steps` |

Form rows are **not** sent via `raven send`. Open the markdown review or CSV `form_steps` column and follow the guide in your browser.

## Supported ATS platforms

Guides include platform-specific instructions for:

- Greenhouse (`boards.greenhouse.io`, `job-boards.greenhouse.io`)
- Lever (`jobs.lever.co`)
- Ashby (`jobs.ashbyhq.com`)
- Workday (`*.myworkdayjobs.com`)
- Workable, Rippling, SmartRecruiters, and others

## What's in a form guide

Each guide typically includes:

1. **Apply URL** — direct link to the posting
2. **Your links** — portfolio, GitHub, LinkedIn from `profile.yml`
3. **Tailored bullets** — paste into free-text fields
4. **Suggested answers** — common fields (cover letter snippet, "Why this company?")
5. **Disclaimer** — reminder to review before submitting

## CSV column

The `form_steps` column contains the full multi-line guide. In the markdown review file, each form job shows the guide in a readable block.

## Workflow

```bash
raven discover --q "backend engineer" --since 7
raven draft --max 10
open drafts/outreach-*.md
```

For each `application_type: form` entry:

1. Open the apply URL
2. Copy links from the guide into profile/website fields
3. Paste tailored bullets into experience or motivation fields
4. Upload resume from `files/resume.md` or PDF export
5. Review every field before submitting

## Email guess mode

Some board listings lack contact email but have a company domain apply URL:

```bash
raven draft --guess-email
```

Suggests `careers@company.com` when the apply URL is on a company domain. **Verify** addresses before sending — guesses are not verified.
