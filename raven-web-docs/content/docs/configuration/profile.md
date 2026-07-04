---
title: profile.yml
weight: 20
---

# profile.yml

`config/profile.yml` is the **source of truth** for who you are when Raven drafts applications.

## Structure

```yaml
identity:
  name: "Your Name"
  email: "you@example.com"
  phone: ""
  location: "City, Country"

links:
  resume: "files/resume.md"
  portfolio: "https://yoursite.dev"
  github: "https://github.com/yourhandle"
  linkedin: "https://linkedin.com/in/yourhandle"
  x: "https://x.com/yourhandle"

highlights: []   # optional manual overrides
skills: []       # optional manual overrides

resume:
  path: "files/resume.md"
  max_bullets: 5

draft:
  gemini:
    enabled: false
    model: "gemini-2.0-flash"
  disclaimer: "Review and edit this draft yourself before sending or submitting."

outreach:
  greeting_generic: "Hey team"
  subject: "Application: {{title}} at {{company}}"
  body: |
    {{greeting}},

    I'm writing about the {{title}} role at {{company}}.

    {{highlights}}

    Best,
    {{senderName}}
```

## Template variables

Used in `outreach.subject` and `outreach.body`:

| Variable | Source |
|----------|--------|
| `{{title}}` | Job title |
| `{{company}}` | Company name |
| `{{location}}` | Job location |
| `{{url}}` | Job listing URL |
| `{{greeting}}` | Generic or company-specific greeting |
| `{{highlights}}` | Tailored bullets from resume |
| `{{linksBlock}}` | Portfolio, GitHub, LinkedIn |
| `{{senderName}}` | `identity.name` |
| `{{senderEmail}}` | `identity.email` |
| `{{company_hook}}` | Optional one-liner about the company |

## Resume path

Set `resume.path` or `links.resume` to:

- Local Markdown: `files/resume.md` (recommended)
- Plain text: `files/resume.txt`
- PDF: `files/resume.pdf` (requires `pdf-parse`)
- HTTPS URL to a PDF or text file

After editing your resume, re-parse:

```bash
raven draft --refresh-resume
```

## Gemini settings

Enable AI polish in profile or via CLI:

```yaml
draft:
  gemini:
    enabled: true
    model: "gemini-2.0-flash"
```

Requires `GEMINI_API_KEY` in `.env`. See [Gemini plugin](../drafting/gemini/).

## Privacy

`profile.yml` is gitignored. Never commit real email, phone, or resume content.
