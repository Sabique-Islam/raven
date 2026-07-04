# Deduplication & sorting

**Module:** `jobs/lib/dedup.mjs`

---

## Canonical URL (`canonUrl`)

Normalizes URLs before comparison:

- Lowercase hostname
- Remove trailing slash
- Strip common tracking query params

Used as dedup key — two listings with same canonical URL → one offer kept.

---

## Functions

| Function | Purpose |
|----------|---------|
| `dedupeOffers(offers)` | Drop duplicate canonical URLs within one tier |
| `mergeDeduped(arrays)` | Merge parallel tier results + dedup |
| `sortOffers(offers)` | Sort by `postedAt` descending, then `company` |
| `toDiscoveredOffer(raw)` | Normalize provider record to schema |

---

## Discover flow

```
tier ATS results  ──┐
tier boards       ──┼── mergeDeduped() ── sortOffers() ── slice(--max)
tier index        ──┘
```

Counts in output:

- `rawMatches` — before dedup
- `deduped` — unique URLs
- `count` — after `--max` cap

---

## Related

- [data/jobs-json.md](../data/jobs-json.md)
