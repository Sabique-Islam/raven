---
title: JD tailoring
weight: 20
---

# Job description tailoring

For each job, Raven extracts keywords from the title and matches your resume bullets to produce tailored application content.

## Output columns

| Column | Meaning |
|--------|---------|
| `jd_keywords` | Terms extracted from job title (e.g. `backend`, `python`, `remote`) |
| `action_words` | Suggested verbs for this role type |
| `tailored_bullets` | Top resume bullets ranked by relevance to the JD |

## How matching works

1. **Keyword extraction** — splits title on common separators, filters stop words
2. **Bullet scoring** — each resume bullet scored by keyword overlap with title
3. **Action words** — role-type heuristics (backend → "architected", "scaled"; ML → "trained", "deployed")
4. **Top N** — `resume.max_bullets` from profile (default 5)

## Example

Job title: **Senior Backend Engineer — Node.js**

Generated fields:

```
jd_keywords: senior, backend, engineer, node
action_words: architected, scaled, optimized, shipped
tailored_bullets:
  - Built REST APIs in Node.js serving 10M requests/day
  - Migrated monolith to microservices, reducing latency 40%
```

## Email integration

Tailored bullets populate `{{highlights}}` in your outreach template:

```yaml
outreach:
  body: |
    {{greeting}},

    Relevant experience for the {{title}} role:

    {{highlights}}

    Best,
    {{senderName}}
```

## Form applications

For ATS form jobs, `tailored_bullets` appear in the `form_steps` guide — copy/paste into "Why are you interested?" or "Relevant experience" fields.

## Improving match quality

1. Write resume bullets with concrete tech stacks and metrics
2. Mirror vocabulary you target (e.g. "platform engineer", "LLM", "Kubernetes")
3. Keep bullets under `## Experience` — parser ignores other sections for matching
