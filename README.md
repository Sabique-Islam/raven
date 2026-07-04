# Raven

Discover jobs across major ATS platforms and board feeds, draft tailored applications from your profile and resume, and send outreach via Gmail or Outlook.

**Discover → Draft → Send**

---

## Requirements

- **Node.js 18+**
- **npm** (comes with Node)
- Optional: **Gmail or Outlook OAuth** for `raven send`
- Optional: **`GEMINI_API_KEY`** in `.env` for AI-assisted email drafts (`raven draft --gemini`)

---

## Installation

Clone the repo, then run setup from the project root:

```bash
cd raven
./raven setup
```

This installs dependencies (`npm install` in the repo root and `jobs/`), and creates starter config files:

| Created | Purpose |
|---------|---------|
| `.env` | Sender identity, OAuth tokens, optional API keys |
| `config/portals.yml` | Job search filters |
| `config/profile.yml` | Your name, links, resume path (drafting source of truth) |
| `files/resume.md` | Starter resume (replace with yours) |

### Run `raven` from anywhere (optional)

```bash
npm link
raven --help
```

Without `npm link`, use `./raven` from the repo root instead of `raven`.

---

## How to use

### 1. One-time setup

```bash
./raven setup
```

Edit these before your first search:

**`.env`** — minimum for sending email later:

```bash
SENDER_NAME=Your Name
SENDER_EMAIL=you@example.com
```

**`config/portals.yml`** — what jobs to search for (title/location filters, enabled boards).

**`config/profile.yml`** — who you are when drafting applications:

```yaml
identity:
  name: "Your Name"
  email: "you@example.com"
  location: "City, Country"

links:
  resume: "files/resume.md"
  portfolio: "https://yoursite.dev"
  github: "https://github.com/yourhandle"
  linkedin: "https://linkedin.com/in/yourhandle"
  x: "https://x.com/yourhandle"
```

Replace **`files/resume.md`** with your real resume (Markdown, plain text, or PDF). Raven parses it and tailors bullets per job.

Run `./raven <command> --help` anytime for full flags on a command.

---

### 2. Discover jobs

Search live ATS APIs, board feeds, and (optionally) a local index in parallel:

```bash
./raven discover --q "backend engineer" --loc Remote --since 7
# auto-saves to data/jobs.json — then:
./raven draft --max 25
```

| Flag | Description |
|------|-------------|
| `--q "keywords"` | Title must match (comma-separated OK) |
| `--not "words"` | Title must not contain |
| `--loc Remote,EU` | Location allow-list |
| `--since 7` | Postings from the last N days (default: 7) |
| `--sources ats,boards,index` | Tiers to search (default: all three) |
| `--max 100` | Cap total results |
| `--json` | Machine-readable stdout |
| `--save PATH` | Custom save path (default: `data/jobs.json`) |
| `--no-save` | Do not write `data/jobs.json` |
| `--verbose` | Extra progress detail |
| `--quiet` | Summary line only |

**Sources:**

| Source | Command prep | Platforms |
|--------|--------------|-----------|
| `ats` | none | Greenhouse, Lever, Ashby, Workday, Rippling, Workable, … |
| `boards` | none | RemoteOK, Remotive, Arbeitnow, Landing.jobs |
| `index` | run `raven sync-jobs` first | Local openjobdata SQLite index |

Logs are written to `data/logs/` by default. Disable with `--no-log`.

---

### 3. Draft applications

Turn discovered jobs into tailored drafts — email copy for outreach, or step-by-step guides for ATS forms (Ashby, Greenhouse, Lever, Workday, etc.):

```bash
./raven discover --q "backend engineer" --since 7 --save data/jobs.json
./raven draft --input data/jobs.json --max 25
```

Or discover and draft in one step:

```bash
./raven draft --q "backend engineer" --since 7 --max 25
```

**Output** (under `drafts/`):

| File | Contents |
|------|----------|
| `outreach-YYYY-MM-DD.csv` | Send-ready spreadsheet + metadata columns |
| `outreach-YYYY-MM-DD.md` | Human-readable review of every draft |

**Useful CSV columns:**

| Column | Meaning |
|--------|---------|
| `application_type` | `email` or `form` |
| `jd_keywords` | Terms extracted from the job title |
| `action_words` | Suggested verbs for this role |
| `tailored_bullets` | Resume bullets matched to the job |
| `form_steps` | Full ATS application guide (form jobs only) |
| `disclaimer` | Reminder to review before submitting |

| Flag | Description |
|------|-------------|
| `--gemini` | Polish email drafts via Gemini (requires `GEMINI_API_KEY`) |
| `--guess-email` | Suggest `careers@` when the apply URL is on a company domain |
| `--refresh-resume` | Re-parse resume (ignore cache) |
| `--xlsx` | Also write Excel |
| `--no-markdown` | Skip the `.md` review file |

**Important:** Review every draft yourself before sending email or submitting an ATS form. Gemini output is a starting point, not a final message.

Form-application rows are **not** sent with `raven send` — open the `.md` file or `form_steps` column and follow the guide in the ATS.

---

### 4. Send email (optional)

For rows where `application_type` is `email` and `contact_email` is filled in:

```bash
./raven auth-gmail          # one-time OAuth (or auth-outlook)
./raven send --input drafts/outreach-2026-07-04.csv --dry-run
./raven send --input drafts/outreach-2026-07-04.csv --delay 60
```

| Flag | Description |
|------|-------------|
| `--input PATH` | CSV or XLSX (`contact_email`, `subject`, `body` columns) |
| `--dry-run` | Preview without sending |
| `--provider gmail` | `gmail` or `outlook` (default: gmail) |
| `--limit N` | Max emails to send |
| `--delay N` | Seconds between sends (default: 30) |

---

### 5. Other commands

```bash
./raven sync-jobs              # Download openjobdata → data/jobs.db
./raven query --q "designer"   # Search local index only
./raven scan-ats --q engineer  # Live ATS scan only
./raven scan-boards --q engineer
```

---

### 6. Logging flags (all job commands)

| Flag | Effect |
|------|--------|
| *(default)* | Live progress on screen + log file in `data/logs/` |
| `--verbose` | Extra detail (e.g. per-ATS logs during discover) |
| `--quiet` | One-line summary |
| `--no-log` | Disable log file |

---

## Example dry run

Walk through the full pipeline without sending any email. Copy and paste from your repo root.

### Step 0 — Install

```bash
cd raven
./raven setup
```

### Step 1 — Configure (edit in your editor)

1. Open **`config/profile.yml`** — set your real name, email, and links.
2. Replace **`files/resume.md`** with your resume (keep `-` bullets under a `## Experience` heading for best parsing).
3. Open **`config/portals.yml`** — set title filters under `title_filter.positive` (e.g. `- backend`, `- engineer`).

You do **not** need Gmail OAuth for this dry run.

### Step 2 — Discover jobs (boards only, fast)

Using board feeds only keeps this example quick. Omit `--sources boards` for the full ATS + boards + index search.

```bash
./raven discover \
  --sources boards \
  --q "backend engineer" \
  --since 7
```

Results are saved automatically to **`data/jobs.json`** (unless you pass `--no-save`).

Expected:

- Progress lines for each search tier (here: board feeds only).
- A summary with match count and elapsed time.
- **`Saved: …/data/jobs.json`** and **`Next: raven draft --max 25`**
- A log path such as `data/logs/discover-….log`.

Inspect results:

```bash
# macOS
open data/jobs.json

# or print match count
node -e "console.log(require('./data/jobs.json').count, 'jobs')"
```

### Step 3 — Draft tailored applications

```bash
./raven draft --max 5
```

(`--input data/jobs.json` is optional — draft uses the latest discover file by default.)

Expected:

- `Parse resume` phase (bullet/skill counts from your resume).
- `Draft N applications` phase.
- Two files created:
  - **`drafts/outreach-YYYY-MM-DD.csv`**
  - **`drafts/outreach-YYYY-MM-DD.md`**

Open the markdown review:

```bash
open drafts/outreach-*.md
```

Each entry shows:

- Job URL and application type (`email` vs `form`).
- **JD keywords** and **action words** for that role.
- **Tailored bullets** pulled from your resume.
- For ATS form jobs: a full **form guide** with your links to copy/paste.
- A **disclaimer** on every draft.

### Step 4 — Preview send (dry run, optional)

Only works for CSV rows that have a valid `contact_email`. Most board listings leave email blank — fill in addresses first, or skip this step.

If `.env` has `SENDER_NAME` and `SENDER_EMAIL` set:

```bash
./raven send --input drafts/outreach-2026-07-04.csv --dry-run
```

Expected:

- Each row printed with subject and body.
- `[dry-run] skipped` — nothing is sent.

### Step 5 — What to do next

| Application type | Next action |
|------------------|-------------|
| **email** | Fill `contact_email` in the CSV → `raven send --dry-run` → `raven send` |
| **form** (Ashby, Greenhouse, …) | Follow `form_steps` in the CSV or `.md` file and submit in the browser |
| **More jobs** | `./raven discover --q "…" --save data/jobs.json` (add `--sources ats` for live ATS) |
| **Local index** | `./raven sync-jobs` then `./raven discover --sources index --q "…"` |
| **AI email polish** | Add `GEMINI_API_KEY` to `.env`, then `./raven draft --input data/jobs.json --gemini` |

---

## Configuration reference

| File | Purpose |
|------|---------|
| `.env` | `SENDER_NAME`, `SENDER_EMAIL`, OAuth tokens, `HF_TOKEN`, `GEMINI_API_KEY` |
| `config/portals.yml` | Title/location filters, job board list |
| `config/profile.yml` | Identity, links, resume path, email templates |
| `config/outreach.yml` | Legacy template (prefer `profile.outreach`) |
| `data/jobs.db` | Local job index (from `raven sync-jobs`) |
| `data/logs/` | Timestamped logs for discover, draft, sync, etc. |
| `drafts/` | Generated CSV / Markdown / XLSX application drafts |

---

## Documentation

- **[raven.nopejs.me](https://raven.nopejs.me)**
- **[docs/README.md](docs/README.md)** — full project documentation (architecture, CLI, config, data formats)
- **[raven-web-docs/](https://raven.nopejs.me)** — Hugo docs site
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · [docs/PIPELINE.md](docs/PIPELINE.md)
- [docs/cli/discover.md](docs/cli/discover.md) · [docs/cli/draft.md](docs/cli/draft.md)
- [docs/config/portals.md](docs/config/portals.md) · [docs/config/profile.md](docs/config/profile.md)
- [docs/JOB_SOURCES.md](docs/JOB_SOURCES.md) · [docs/PROFILE.md](docs/PROFILE.md) — quick references

---

## npm shortcuts

Equivalent to `./raven` subcommands:

```bash
npm run setup
npm run discover -- --q "engineer" --since 7
npm run draft -- --input data/jobs.json
npm run send -- --input drafts/outreach-2026-07-04.csv --dry-run
```
