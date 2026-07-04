# raven auth-gmail / auth-outlook

One-time OAuth for email sending.

```bash
# Set client id/secret in .env first
raven auth-gmail
raven auth-outlook
```

| Command | Writes |
|---------|--------|
| `auth-gmail` | `GMAIL_REFRESH_TOKEN` |
| `auth-outlook` | `MS_REFRESH_TOKEN` |

Full detail: [email/README.md](../email/README.md), [config/env.md](../config/env.md).
