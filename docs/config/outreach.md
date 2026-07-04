# config/outreach.yml (legacy)

**Status:** Legacy — prefer `config/profile.yml` → `outreach` section.

**Template:** `config/outreach.example.yml`  
**Override:** `RAVEN_OUTREACH`

---

## Schema

```yaml
sender:
  name: ""
  email: ""

greeting_generic: "Hey team"
subject: "Application: {{title}} at {{company}}"

body: |
  {{greeting}},
  ...

highlights:
  - "Bullet one"
  - "Bullet two"

company_hook: ""
guess_email: false
```

---

## Field reference

| Key | Description |
|-----|-------------|
| `sender.name` | Sign-off name (fallback: profile / `.env`) |
| `sender.email` | Sign-off email |
| `greeting_generic` | For generic inboxes (`careers@`, `hiring@`) |
| `subject` | Email subject template |
| `body` | Email body template |
| `highlights` | Static bullets if resume parser empty |
| `company_hook` | Optional company opener (empty = skip) |
| `guess_email` | Enable careers@ inference (prefer CLI `--guess-email`) |

Same placeholders as [profile.md](profile.md).

---

## Merge order

`draft-engine` loads:

1. `config/profile.yml` (primary)
2. `config/outreach.yml` (fallback for missing keys)

---

## Migration

Copy `outreach` block from `outreach.yml` into `profile.yml`, then ignore `outreach.yml`.
