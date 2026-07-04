#!/usr/bin/env bash
# draft.sh — Draft tailored application emails and ATS form guides from discovered jobs.
#
# Source of truth: config/profile.yml (name, links, resume)
# Optional: GEMINI_API_KEY + --gemini for AI email polish (always review yourself)
#
# Usage:
#   raven draft --input data/jobs.json
#   raven draft --q "backend engineer" --since 7 --max 20
#   raven draft --input data/jobs.json --gemini --xlsx

set -euo pipefail
source "$(dirname "$0")/_lib.sh"

show_help() {
  raven_print_block "draft — tailored applications from jobs" \
    "Uses config/profile.yml + parsed resume to tailor each job." \
    "" \
    "Examples:" \
    "  raven discover --q engineer --save data/jobs.json" \
    "  raven draft --input data/jobs.json" \
    "  raven draft --q \"backend engineer\" --since 7 --max 25" \
    "  raven draft --input data/jobs.json --gemini   # needs GEMINI_API_KEY" \
    "" \
    "Profile (config/profile.yml):" \
    "  identity: name, email, phone, location" \
    "  links: resume, portfolio, github, linkedin, x" \
    "  resume.path: files/resume.md (or .pdf with pdf-parse)" \
    "" \
    "Output columns include:" \
    "  jd_keywords, action_words, tailored_bullets" \
    "  form_steps (Ashby/Greenhouse/Lever/etc. guides)" \
    "  ai_draft, disclaimer" \
    "" \
    "Flags:" \
    "  --input PATH       JSON from raven discover" \
    "  --gemini           Optional Gemini email drafts (review yourself)" \
    "  --guess-email      Suggest careers@ when URL allows" \
    "  --refresh-resume   Re-parse resume (ignore cache)" \
    "  --xlsx             Also write Excel" \
    "" \
    "Pipeline: discover → draft → review → send (email) or follow form_steps (ATS)"
}

if raven_wants_help "$@"; then
  show_help
  exit 0
fi

raven_load_env
raven_require_setup
raven_run_jobs draft-outreach.mjs "$@"
