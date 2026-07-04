# raven send

Send outreach emails from draft CSV or XLSX.

**Script:** `scripts/send.sh` → `scripts/send-prewritten.js`

See [email/README.md](../email/README.md) for full detail.

```bash
raven send --input drafts/outreach-2026-07-04.csv --dry-run
raven send --provider outlook --delay 60 --limit 20
```
