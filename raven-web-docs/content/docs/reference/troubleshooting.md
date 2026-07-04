---
title: Troubleshooting
weight: 30
---

# Troubleshooting

Common issues and fixes.

## `raven: command not found`

```bash
# From repo root
./raven --help

# Or install globally
npm link
raven --help
```

If `npm link` resolves to the wrong path, use `./raven` from the repo root.

## `raven draft` — no input file

Discover auto-saves to `data/jobs.json`. Run discover first:

```bash
raven discover --q "engineer"
raven draft --max 25
```

Or pass explicit input:

```bash
raven draft --input data/jobs.json
```

## Unrelated jobs (nurse, sales, etc.)

Bare `raven discover` reads `config/portals.yml`. Fix filters:

```yaml
title_filter:
  positive:
    - "software engineer"
    - "developer"
  negative:
    - "nurse"
    - "clinical"
```

Or override on CLI:

```bash
raven discover --q "software engineer" --not "nurse"
```

## Zero tailored bullets

1. Check resume has `## Experience` with `-` bullets
2. Run `raven draft --refresh-resume`
3. See [Resume parsing](../drafting/resume/)

## `sync-jobs` HTTP 401

Add HuggingFace token to `.env`:

```bash
HF_TOKEN=hf_xxxxxxxx
```

## Gmail send fails

1. Run `raven auth-gmail` again
2. Verify `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN` in `.env`
3. Check OAuth app has Gmail send scope

## Gemini draft errors

1. Verify `GEMINI_API_KEY` in `.env`
2. Check API quota at Google AI Studio
3. Try without `--gemini` to confirm base drafting works

## Empty `contact_email` in CSV

Normal for board listings. Fill manually or use `--guess-email` (verify before send).

## Slow discover

```bash
# Fast: boards only
raven discover --sources boards --q "engineer"

# Narrow ATS platforms
raven discover --sources ats --ats greenhouse,lever --max 50
```

## Logs for debugging

```bash
raven discover --verbose
ls -lt data/logs/
tail -50 data/logs/discover-*.log
```

## Still stuck?

1. Run `./raven <command> --help`
2. Check `data/logs/` for the failing command
3. Open an issue with command, flags, and log excerpt (redact personal info)
