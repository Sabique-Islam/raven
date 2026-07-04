---
title: Resume parsing
weight: 10
---

# Resume parsing

Raven parses your resume from `config/profile.yml` → `resume.path` and caches structured bullets and skills.

## Supported formats

| Format | Notes |
|--------|--------|
| `.md` | **Best** — use `## Experience` with `-` bullet lines |
| `.txt` | Bullet lines + optional `Skills:` line |
| `.pdf` | Requires `pdf-parse` (installed via `raven setup`) |

## Markdown structure

```markdown
# Your Name

## Experience

### Company A — Role Title
- Built X using Y, achieving Z
- Led migration of ...

### Company B — Role Title
- Shipped feature that ...

## Skills

JavaScript, TypeScript, Node.js, React, PostgreSQL
```

### Parsing rules

- Sections detected by `## Heading` (H2)
- Bullets under `## Experience` (including `###` subheadings) are extracted
- Skills from `## Skills` section or comma-separated line
- `highlights` and `skills` in `profile.yml` override parser output when set

## Cache

Parsed output is cached at `data/cache/resume-parsed.json` for speed.

Re-parse after resume edits:

```bash
raven draft --refresh-resume
```

## PDF resumes

Point `resume.path` to a PDF:

```yaml
resume:
  path: "files/resume.pdf"
```

Or use an HTTPS URL to a hosted PDF.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Zero bullets parsed | Ensure `## Experience` heading and `-` bullets |
| Wrong bullets selected | Add more specific tech terms to bullet text |
| Stale content | Run `--refresh-resume` |
| PDF parse fails | Convert to Markdown or check `pdf-parse` install |

See [Tailoring](tailoring/) for how bullets are matched to each job.
