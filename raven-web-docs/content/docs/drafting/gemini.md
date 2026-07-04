---
title: Gemini plugin
weight: 40
---

# Gemini draft plugin

Optional AI polish for **email** drafts via Google's Gemini API.

## Setup

1. Get an API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Add to `.env`:

```bash
GEMINI_API_KEY=your_key_here
```

3. Enable in profile (optional):

```yaml
draft:
  gemini:
    enabled: true
    model: "gemini-2.0-flash"
```

## Usage

```bash
raven draft --input data/jobs.json --gemini --max 10
```

Or one-shot discover + draft:

```bash
raven draft --q "backend engineer" --gemini --max 5
```

## What Gemini does

- Rewrites email subject and body for clarity and tone
- Preserves factual content from your resume bullets
- Does **not** fabricate experience — works from parsed resume + JD keywords

## What Gemini does not do

- Form application guides (ATS rows stay template-based)
- Verify email addresses
- Auto-send — you must review and run `raven send` yourself

## Disclaimer

Every draft includes:

> Review and edit this draft yourself before sending or submitting.

Gemini output is a **starting point**, not a final message. Always read and edit before sending or submitting.

## Model selection

Default: `gemini-2.0-flash` (fast, cost-effective).

Override in `profile.yml`:

```yaml
draft:
  gemini:
    model: "gemini-2.5-pro"
```

## Without Gemini

Default drafting uses your `profile.outreach` templates + tailored bullets. No API key required.
