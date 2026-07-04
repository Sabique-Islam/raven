# data/jobs.json

Default output of `raven discover`. Default input of `raven draft`.

**Path:** `data/jobs.json` (gitignored)  
**Override save:** `--save PATH`  
**Override read:** `--input PATH` on draft

---

## Top-level schema

| Field | Type | Description |
|-------|------|-------------|
| `count` | number | Final offer count (after dedup + `--max`) |
| `rawMatches` | number | Matches before dedup |
| `deduped` | number | Unique URLs after dedup |
| `offers` | array | Job objects (see below) |
| `savedAt` | string | ISO-8601 timestamp |
| `sources` | string[] | Tiers used (`ats`, `boards`, `index`, …) |

---

## Offer object (`DiscoveredOffer`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | yes | Apply or listing URL (dedup key) |
| `company` | string | | Company name |
| `title` | string | | Job title |
| `location` | string | | Location string (may be empty) |
| `postedAt` | string | | `YYYY-MM-DD` when parseable |
| `ats` | string | | Normalized platform: `greenhouse`, `lever`, `remoteok`, … |
| `source` | string | | Raw tier label |
| `matchedKeyword` | string | | First `--q` keyword that matched title |
| `verification` | string | | `unconfirmed` for hiring.cafe only |
| `why` | string | | Optional match explanation |
| `confidence` | string | | `low`, `medium`, `high` when trust filter runs |

---

## Example

```json
{
  "count": 2,
  "rawMatches": 5,
  "deduped": 2,
  "savedAt": "2026-07-04T10:30:00.000Z",
  "sources": ["boards"],
  "offers": [
    {
      "url": "https://remoteok.com/remote-jobs/12345",
      "company": "Acme",
      "title": "Senior Backend Engineer",
      "location": "Remote",
      "postedAt": "2026-07-01",
      "ats": "remoteok",
      "source": "boards/remoteok",
      "matchedKeyword": "backend"
    }
  ]
}
```

---

## `--json` stdout

Same fields plus:

| Field | Description |
|-------|-------------|
| `savedTo` | Path written, or `null` if `--no-save` |
| `log` | Path to log file |

---

## Canonical URL dedup

URLs normalized in `jobs/lib/dedup.mjs`:

- Lowercase host
- Strip trailing slashes
- Remove common tracking params

Two listings with same canonical URL → one offer kept (newest `postedAt` wins sort).

---

## Related

- [cli/discover.md](../cli/discover.md)
- [jobs/dedup.md](../jobs/dedup.md)
