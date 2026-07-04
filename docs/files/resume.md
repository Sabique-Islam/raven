# Resume file (`files/resume.md`)

Parsed by `jobs/lib/resume.mjs` during `raven draft`. Cached at `data/cache/resume-parsed.json`.

**Template:** `files/resume.example.md`  
**Your file:** `files/resume.md` (gitignored)

Path set in `config/profile.yml` → `resume.path` or `links.resume`.

---

## Supported formats

| Extension | Parser | Notes |
|-----------|--------|-------|
| `.md` | `parseMarkdownResume` | **Recommended** |
| `.txt` | `parsePlainResume` | Bullet lines + optional `Skills:` |
| `.pdf` | `pdf-parse` | Requires `jobs/` npm deps |

HTTPS URLs to PDF/text also supported.

---

## Markdown structure (recommended)

```markdown
# Your Name

## Experience

### Company A — Role Title
- Built X using Y, achieving Z metric
- Led migration of ...

### Company B — Role Title  
- Shipped feature that ...

## Skills

JavaScript, TypeScript, Node.js, React, PostgreSQL
```

---

## Parsing rules

| Rule | Detail |
|------|--------|
| Experience section | Detected by `## Experience` heading (H2) |
| Subheadings | `### Company — Role` under Experience are OK |
| Bullets | Lines starting with `-` under Experience |
| Skills | `## Skills` section or `Skills: a, b, c` line |
| Overrides | Non-empty `highlights` / `skills` in profile.yml win |

---

## Cache

After first parse, structured data saved to:

```
data/cache/resume-parsed.json
```

Force re-parse:

```bash
raven draft --refresh-resume
```

---

## Tailoring

Resume bullets are **ranked per job** by keyword overlap with job title:

- Output column: `tailored_bullets`
- Max count: `resume.max_bullets` in profile (default 5)

Tips for better matches:

- Include tech stacks in bullet text
- Use metrics and action verbs
- Mirror vocabulary you search for in `portals.yml`

---

## Related

- [config/profile.md](../config/profile.md)
- [jobs/lib/README.md](../jobs/lib/README.md)
- [cli/draft.md](../cli/draft.md)
