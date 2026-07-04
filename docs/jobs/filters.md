# Filters

Title, location, and content matching for discover and scan commands.

**Module:** `jobs/lib/filters.mjs`

---

## Title filter

**Rule:** ≥1 `positive` keyword matches **AND** 0 `negative` keywords match.

- Case-insensitive **substring** on job title
- Empty `positive` → all titles pass (use negatives to exclude)

```javascript
buildTitleFilter(['engineer', 'developer'], ['nurse', 'sales'])
// (title) => boolean
```

---

## Location filter

**Order of checks:**

| Step | Condition | Result |
|------|-----------|--------|
| 1 | Location string empty | Pass |
| 2 | Any `always_allow` matches | Pass |
| 3 | Any `block` matches | Reject |
| 4 | `allow` empty | Pass |
| 5 | `allow` non-empty | Pass if ≥1 matches |

---

## Content filter

Matches job **description** when provider supplies it (e.g. Lever `descriptionPlain`).

| Rule | Behavior |
|------|----------|
| No description on job | Pass |
| Any `negative` in description | Reject |
| `positive` empty | Pass after negatives |
| `positive` non-empty | ≥1 must match |

---

## Recency (`--since`)

Jobs without parseable `postedAt` **pass** (conservative).

Jobs older than N days are excluded when date is known.

---

## Config → CLI mapping

| portals.yml | CLI flag |
|-------------|----------|
| `title_filter.positive` | `--q` |
| `title_filter.negative` | `--not` |
| `location_filter.allow` | `--loc` |
| `location_filter.block` | `--noloc` |
| `location_filter.always_allow` | `--home` |

See [config/portals.md](../config/portals.md).
