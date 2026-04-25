---
name: raven-outreach-and-scraping
description: Startup Scraping & Cold Outreach Prompts for lead generation and email drafting.
---

# Startup Scraping & Cold Outreach Prompts

## Lead Generation Prompt

I want to cold-email small AI startups for a summer internship. Help me build a ranked spreadsheet of leads. My resume is attached — use it to write the fit angle for each company.

Hard filters (you can add any other filters you want):
- Under 50 employees, smaller is better
- Pays interns

Sourcing rules:
- Only include rows with verified emails. Verified = on the company's site, in a press release, or personally posted by the founder. "Who is hiring" threads are the best source — scrape them directly via web_fetch not just search snippets
- One contact per startup. Prefer founder/CEO/CTO; fall back to a hiring alias only if no personal email exists
- Flag rows where the email is pattern-inferred from a domain rather than confirmed

Deliverable:
- Excel file `startup_outreach.xlsx` using openpyxl
- Columns: #, Startup, Contact, Title, Email, Fit Angle, Size / Stage, Source / Notes
- Color-coded tiers: green = tiny team + strongest resume fit, yellow = small AI-adjacent, gray = systems/adjacent, red = too big or flagged
- Fit angles should name the specific resume project that opens the conversation for each company — be concrete, not generic

Writing style:
- No em dashes, no sycophantic openers, no rule-of-three padding, no AI clichés ("pivotal," "testament," "underscores"), no inline bold headers
- Fit angles under 25 words each, written like a person talking

When I ask for "50 more," produce a second sheet with zero overlap against the first. Source from different threads to avoid duplication. Keep the same format and tier coloring.

---

## Email Drafting Prompt

I'm going to give you a list of startups and contact emails. I want you to filter and draft cold outreach emails using the rules below.

Rules:
- Use • bullet character, not * or -
- No em dashes anywhere — not in the subject, not in the body
- For generic inboxes (hello@, hiring@, careers@, team@, founders@), use "Hey team" — unless a specific founder name is clearly associated with that inbox, in which case use their first name
- The feature line should name a specific product, model, or system (e.g. "the Lynx hallucination detection model," "the Kubernetes-native data platform operator"). If you're not confident what to say because you don't know the company well enough, scrap the entire feature sentence — just say "I'm interested in interning at {{STARTUP}}." Do not hallucinate product names.
- Don't rewrite the bullets or expand the email with more about my experience. The bullets stay exactly as written.

Output format: Generate an .xlsx file with three columns: email, subject, body. Each row = one contact. Body column should have real line breaks (not \n strings). Wrap text, row height ~220, column widths 30/50/90. Freeze the header row.

My list: [paste or add your list here]
