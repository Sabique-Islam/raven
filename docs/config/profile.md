# config/profile.yml

**Source of truth** for identity, resume path, outreach templates, and draft settings.

**Template:** `config/profile.example.yml`  
**Local copy:** `config/profile.yml` (gitignored)  
**Override:** `RAVEN_PROFILE` in `.env`

---

## Full schema

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

highlights: []
skills: []

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
    ...
  company_hook: ""
```

---

## `identity`

| Key | Type | Used for |
|-----|------|----------|
| `name` | string | Email sign-off, form guides (`{{senderName}}`) |
| `email` | string | Sign-off, sender display (`{{senderEmail}}`) |
| `phone` | string | Optional; form guides when ATS asks |
| `location` | string | Context in templates |

**Fallback:** `.env` `SENDER_NAME`, `SENDER_EMAIL` if profile fields empty.

---

## `links`

| Key | Type | Used for |
|-----|------|----------|
| `resume` | path or URL | Default resume; also used if `resume.path` unset |
| `portfolio` | URL | `links_block`, form guides |
| `github` | URL | `links_block`, form guides |
| `linkedin` | URL | `links_block`, form guides |
| `x` | URL | Optional social link |

Local paths resolve relative to `RAVEN_ROOT`.

---

## `highlights` / `skills`

| Key | Type | Behavior |
|-----|------|----------|
| `highlights` | string[] | If non-empty, **override** parsed resume bullets |
| `skills` | string[] | If non-empty, **override** parsed skills |

Leave empty to use resume parser output.

---

## `resume`

| Key | Default | Description |
|-----|---------|-------------|
| `path` | `files/resume.md` | File to parse (`.md`, `.txt`, `.pdf`) |
| `max_bullets` | `5` | Max bullets per job draft (1–10) |

Cache: `data/cache/resume-parsed.json` — use `raven draft --refresh-resume` after edits.

---

## `draft`

| Key | Description |
|-----|-------------|
| `disclaimer` | Appended to every CSV row and Markdown entry |
| `gemini.enabled` | Profile-level Gemini toggle (CLI `--gemini` also works) |
| `gemini.model` | Model id (default `gemini-2.0-flash`) |

Requires `GEMINI_API_KEY` in `.env` for Gemini.

---

## `outreach` templates

Handlebars-like placeholders:

| Placeholder | Source |
|-------------|--------|
| `{{company}}` | Job company name |
| `{{title}}` | Job title |
| `{{location}}` | Job location |
| `{{url}}` | Job listing URL |
| `{{postedAt}}` | Post date |
| `{{ats}}` | ATS platform id |
| `{{senderName}}` | `identity.name` |
| `{{senderEmail}}` | `identity.email` |
| `{{greeting}}` | Generic or inferred greeting |
| `{{highlights}}` | Tailored bullet block |
| `{{linksBlock}}` | Portfolio / GitHub / LinkedIn line |
| `{{company_hook}}` | Optional opener (empty = skip) |
| `{{#if company_hook}}…{{/if}}` | Conditional block |
| `{{#if linksBlock}}…{{/if}}` | Conditional block |

| Key | Description |
|-----|-------------|
| `greeting_generic` | Used for `careers@`, `hiring@`, etc. |
| `subject` | Email subject template |
| `body` | Email body template |
| `company_hook` | One-liner about company (do not invent facts) |

Implementation: `jobs/lib/outreach.mjs` → `renderTemplate()`.

---

## Related

- [files/resume.md](../files/resume.md)
- [cli/draft.md](../cli/draft.md)
- [config/outreach.md](outreach.md) (legacy file)
