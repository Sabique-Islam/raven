# jobs/lib — library modules

Shared Node modules used by discover, draft, and scan commands.

---

## Module reference

| Module | Exports | Purpose |
|--------|---------|---------|
| **types.js** | `DEFAULT_FILTERS`, `ALL_ATS_SOURCES`, `ATS_LABEL` | JSDoc types + ATS catalog |
| **paths.mjs** | `RAVEN_ROOT`, `DATA_DIR`, `PORTALS_PATH`, … | Repo path constants |
| **log.mjs** | `parseLogFlags`, `createLogger`, `stripLogFlags` | CLI logging to screen + file |
| **filters.mjs** | `buildTitleFilter`, `buildLocationFilter`, `firstMatchKeyword`, … | Title/location/content matching |
| **dedup.mjs** | `canonUrl`, `dedupeOffers`, `mergeDeduped`, `sortOffers` | URL dedup + sort |
| **portals.mjs** | `loadPortalsFilters`, `resolveDiscoverFilters`, `writeTempPortals` | YAML filter merge + temp config |
| **profile.mjs** | `loadProfile`, `getIdentity`, `formatLinksBlock`, `geminiConfig` | Profile YAML loader |
| **resume.mjs** | `parseResume`, `parseMarkdownResume`, `RESUME_CACHE_PATH` | Resume parser (.md/.txt/.pdf) |
| **outreach.mjs** | `renderTemplate`, `draftEmailRow`, `DRAFT_COLUMNS`, `writeMarkdownReview` | Templates + CSV/MD output |
| **jd-tailor.mjs** | `extractJdKeywords`, `tailorBullets`, `suggestActionWords` | Per-job keyword matching |
| **application-type.mjs** | `classifyApplication`, `isFormApplication` | email vs form |
| **form-guides.mjs** | `buildFormGuide`, `buildFormGuideShort` | ATS step-by-step guides |
| **draft-engine.mjs** | `buildDraftRow`, `buildDraftRows`, `createDraftContext` | Draft orchestration |

---

## types.js — ATS catalog

`ALL_ATS_SOURCES` (12 platforms):

```
greenhouse, lever, ashby, workday, rippling, workable,
bamboohr, smartrecruiters, recruitee, pinpoint, teamtailor, personio
```

`ATS_LABEL` — human-readable names for logs and CSV.

---

## log.mjs

```javascript
const logger = createLogger('discover', { verbose, quiet, noLog });
logger.phase('ATS scan', 'greenhouse');
logger.stat('matches', 42);
logger.info('Saved', path);
logger.close();
```

Log files: `data/logs/<command>-<timestamp>.log`

---

## filters.mjs

| Function | Input | Output |
|----------|-------|--------|
| `buildTitleFilter(positive, negative)` | keyword lists | `(title) => boolean` |
| `buildLocationFilter(allow, block, alwaysAllow)` | location rules | `(location) => boolean` |
| `buildContentFilter(positive, negative)` | description rules | `(text) => boolean` |
| `firstMatchKeyword(title, keywords)` | title, list | first matching keyword or null |

All matching is **case-insensitive substring**.

---

## dedup.mjs

| Function | Purpose |
|----------|---------|
| `canonUrl(url)` | Normalize URL for comparison |
| `dedupeOffers(offers)` | Remove duplicate canonical URLs |
| `mergeDeduped(tierResults)` | Merge parallel tier arrays |
| `sortOffers(offers)` | Sort by `postedAt` desc, then company |
| `toDiscoveredOffer(raw)` | Normalize provider output to schema |

---

## portals.mjs

| Function | Purpose |
|----------|---------|
| `loadPortalsFilters(path)` | Read YAML title/location filters |
| `resolveDiscoverFilters(cliArgs, portals)` | Merge CLI + config |
| `writeTempPortals(config)` | Write temp YAML for child processes |
| `defaultJobBoards()` | Default board list if YAML empty |

---

## profile.mjs

| Function | Purpose |
|----------|---------|
| `loadProfile()` | Parse `profile.yml` |
| `getIdentity(profile)` | Merge profile + `.env` sender |
| `formatLinksBlock(links)` | One-line links for emails |
| `getLinksForForms(links)` | Structured links for form guides |
| `mergeOutreachConfig(profile, legacy)` | profile.outreach + outreach.yml |
| `profileDisclaimer(profile)` | Disclaimer string |

---

## resume.mjs

| Function | Input formats |
|----------|---------------|
| `parseResume(path)` | `.md`, `.txt`, `.pdf` |
| `parseMarkdownResume(text)` | `## Experience` + `-` bullets |
| `parsePlainResume(text)` | Bullet lines + `Skills:` |

Output shape:

```json
{
  "bullets": ["...", "..."],
  "skills": ["JavaScript", "Node.js"],
  "parsedAt": "ISO-8601"
}
```

---

## jd-tailor.mjs

| Function | Purpose |
|----------|---------|
| `extractJdKeywords(title)` | Split title → keyword chips |
| `rankBullets(bullets, keywords)` | Score bullets by overlap |
| `tailorBullets(bullets, title, max)` | Top N bullets for job |
| `suggestActionWords(title, ats)` | Verb hints (backend, ML, …) |
| `applyActionVerb(bullet, verb)` | Optional bullet rewrite |

---

## application-type.mjs

Form ATS list includes: `greenhouse`, `lever`, `ashby`, `workday`, `workable`, `bamboohr`, `smartrecruiters`, `recruitee`, `pinpoint`, `teamtailor`, `personio`, `rippling`.

Also checks URL host patterns.

---

## form-guides.mjs

`buildFormGuide(offer, profile, tailoredBullets)` returns multi-line steps per ATS:

- Open apply URL
- Paste portfolio / GitHub / LinkedIn
- Paste tailored bullets into free-text fields
- Upload resume
- Review disclaimer

---

## draft-engine.mjs

`buildDraftRow(offer, ctx)` — single CSV row:

1. Classify application type
2. Tailor bullets + keywords
3. Render email OR form guide
4. Optional Gemini polish
5. Attach disclaimer

---

## Related

- [filters.md](../filters.md)
- [dedup.md](../dedup.md)
- [draft-engine.md](../draft-engine.md)
