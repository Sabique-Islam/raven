# Draft engine internals

**Modules:** `jobs/draft-outreach.mjs`, `jobs/lib/draft-engine.mjs`

> **Architecture overview:** [draft-deep-dive.md](draft-deep-dive.md) — classification, tailoring, Gemini, interview Q&A.

---

## Flow

1. **Resolve input** — `--input` or `data/jobs.json` or inline discover
2. **createDraftContext()** — load profile, parse resume, merge outreach config
3. For each offer (up to `--max`):
   - **classifyApplication(offer)** → `email` | `form`
   - **extractJdKeywords(title)**
   - **tailorBullets(resume, title, max_bullets)**
   - **suggestActionWords(title)**
   - If email: **draftEmailRow()** + optional **geminiDraftEmail()**
   - If form: **buildFormGuide()** + **buildFormGuideShort()**
   - **profileDisclaimer()**
4. **rowsToCsv()** → CSV
5. **writeMarkdownReview()** → MD
6. Optional **writeXlsx()**

---

## Gemini plugin

**File:** `jobs/plugins/gemini-draft.mjs`

| Function | Purpose |
|----------|---------|
| `isGeminiAvailable()` | Checks `GEMINI_API_KEY` |
| `geminiDraftEmail(row, profile)` | Rewrites subject/body |

Only runs on `application_type: email` when `--gemini` or profile `draft.gemini.enabled`.

Sets `ai_draft`: `yes`, `no`, or `fallback`.

---

## Email guess

`--guess-email` → `guessContactEmail(url)`:

- Skips known job-board hosts
- Suggests `careers@<company-domain>`
- Sets `email_source: inferred` — **verify before send**

---

## Related

- [draft-deep-dive.md](draft-deep-dive.md)
- [cli/draft.md](../cli/draft.md)
- [drafts/README.md](../drafts/README.md)
- [lib/README.md](lib/README.md)
- [DEEP_DIVES.md](../DEEP_DIVES.md)
