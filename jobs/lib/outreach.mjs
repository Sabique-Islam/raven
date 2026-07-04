import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import yaml from 'js-yaml';
import { CONFIG_DIR, RAVEN_ROOT } from './paths.mjs';

const require = createRequire(import.meta.url);

export const OUTREACH_PATH = process.env.RAVEN_OUTREACH || path.join(CONFIG_DIR, 'outreach.yml');

const BOARD_HOSTS = [
  'greenhouse.io', 'lever.co', 'ashbyhq.com', 'myworkdayjobs.com', 'workable.com',
  'smartrecruiters.com', 'recruitee.com', 'teamtailor.com', 'personio.de',
  'arbeitnow.com', 'remoteok.com', 'remotive.com', 'landing.jobs', 'rippling.com',
];

const GENERIC_LOCALS = new Set(['careers', 'hiring', 'hello', 'team', 'jobs', 'recruiting', 'hr', 'people']);

/** Load legacy outreach.yml (optional — profile.yml is preferred). */
export function loadOutreachConfig() {
  const candidates = [OUTREACH_PATH, path.join(CONFIG_DIR, 'outreach.example.yml')];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return yaml.load(fs.readFileSync(p, 'utf8')) || {};
    }
  }
  return {};
}

/** Simple {{var}} and {{#if var}}…{{/if}} templating. */
export function renderTemplate(template, vars) {
  if (!template) return '';
  let out = String(template);
  out = out.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, block) => (vars[key] ? block : ''));
  out = out.replace(/\{\{(\w+)\}\}/g, (_, key) => (vars[key] != null ? String(vars[key]) : ''));
  return out.trim();
}

export function formatHighlights(list) {
  return (list || [])
    .filter(Boolean)
    .map((line) => `• ${String(line).replace(/^[-*•]\s*/, '')}`)
    .join('\n');
}

export function isGenericEmail(email) {
  const local = String(email || '').split('@')[0]?.toLowerCase() || '';
  return GENERIC_LOCALS.has(local) || local.includes('career') || local.includes('hiring');
}

export function greetingForEmail(email, config) {
  if (!email || isGenericEmail(email)) return config.greeting_generic || 'Hey team';
  const local = email.split('@')[0];
  const first = local.split(/[._-]/)[0];
  if (first && first.length > 1 && !GENERIC_LOCALS.has(first.toLowerCase())) {
    return `Hi ${first.charAt(0).toUpperCase()}${first.slice(1).toLowerCase()}`;
  }
  return config.greeting_generic || 'Hey team';
}

/** Guess careers@ from apply URL when not a job-board host. */
export function guessContactEmail(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '').toLowerCase();
    if (BOARD_HOSTS.some((b) => host.includes(b))) return { email: '', source: 'manual' };
    const parts = host.split('.');
    if (parts.length < 2) return { email: '', source: 'manual' };
    const domain = parts.slice(-2).join('.');
    return { email: `careers@${domain}`, source: 'inferred' };
  } catch {
    return { email: '', source: 'manual' };
  }
}

export function loadOffersFromInput(inputPath) {
  const raw = fs.readFileSync(inputPath, 'utf8');
  const data = JSON.parse(raw);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.offers)) return data.offers;
  throw new Error('JSON must be { offers: [...] } or an array of jobs');
}

/**
 * Build template-based email fields (used by draft-engine).
 * @param {object} offer
 * @param {object} config
 * @param {object} [extras]
 */
export function draftEmailRow(offer, config, extras = {}) {
  const identity = extras.identity || {
    name: config.sender?.name || 'Your Name',
    email: config.sender?.email || '',
  };
  const highlights = formatHighlights(extras.highlights || config.highlights || []);
  const contactEmail = extras.contactEmail ?? '';
  const greeting = extras.greeting ?? greetingForEmail(contactEmail, config);

  const vars = {
    company: offer.company || 'the team',
    title: offer.title || 'the open role',
    location: offer.location || '',
    url: offer.url || '',
    postedAt: offer.postedAt || '',
    ats: offer.ats || offer.source || '',
    senderName: identity.name,
    senderEmail: identity.email,
    greeting,
    highlights,
    linksBlock: extras.linksBlock || '',
    company_hook: config.company_hook || '',
  };

  const subject = renderTemplate(config.subject || 'Application: {{title}} at {{company}}', vars);
  const body = renderTemplate(config.body || '', vars);

  return {
    contact_email: contactEmail,
    subject,
    body,
    company: offer.company || '',
    title: offer.title || '',
    job_url: offer.url || '',
    location: offer.location || '',
    posted_at: offer.postedAt || '',
    ats: offer.ats || '',
  };
}

/** Escape a field for CSV. */
export function csvEscape(value) {
  const s = String(value ?? '');
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function rowsToCsv(rows, columns) {
  const header = columns.join(',');
  const lines = rows.map((row) => columns.map((c) => csvEscape(row[c])).join(','));
  return [header, ...lines].join('\n') + '\n';
}

export const DRAFT_COLUMNS = [
  'application_type', 'application_label', 'contact_email', 'subject', 'body',
  'company', 'title', 'job_url', 'location', 'posted_at', 'ats', 'email_source',
  'jd_keywords', 'action_words', 'tailored_bullets', 'form_steps', 'links_block',
  'ai_draft', 'disclaimer',
];

export function writeMarkdownReview(rows, outPath, meta = {}) {
  const lines = [
    '# Application drafts',
    '',
    `Generated: ${new Date().toISOString()}`,
    ...(meta.count != null ? [`Jobs: ${meta.count}`] : []),
    '',
    '**Review every draft yourself** before sending email or submitting an ATS form.',
    '',
    'Email rows → `raven send --input … --dry-run`',
    'Form rows → follow **form_steps** in the CSV or sections below',
    '',
  ];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    lines.push(`## ${i + 1}. ${r.title} @ ${r.company}`);
    lines.push('');
    lines.push(`- **Type:** ${r.application_label || r.application_type}`);
    lines.push(`- **URL:** ${r.job_url}`);
    lines.push(`- **JD keywords:** ${r.jd_keywords || 'n/a'}`);
    lines.push(`- **Action words:** ${r.action_words || 'n/a'}`);
    lines.push(`- **AI draft:** ${r.ai_draft || 'no'}`);
    lines.push('');

    if (r.tailored_bullets) {
      lines.push('**Tailored bullets:**');
      lines.push('```');
      lines.push(r.tailored_bullets);
      lines.push('```');
      lines.push('');
    }

    if (r.application_type === 'form' && r.form_steps) {
      lines.push('**Form guide:**');
      lines.push('```');
      lines.push(r.form_steps);
      lines.push('```');
    } else {
      lines.push(`**Contact:** ${r.contact_email || '_(add email)_'}`);
      lines.push('');
      lines.push('**Subject:** ' + r.subject);
      lines.push('');
      lines.push('```');
      lines.push(r.body);
      lines.push('```');
    }

    lines.push('');
    lines.push(`> ${r.disclaimer || 'Review before submitting.'}`);
    lines.push('');
  }
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
}

/** Write XLSX using root node_modules/xlsx (optional). */
export function writeXlsx(rows, outPath, columns = DRAFT_COLUMNS) {
  let XLSX;
  try {
    XLSX = require(path.join(RAVEN_ROOT, 'node_modules/xlsx'));
  } catch {
    throw new Error('xlsx not installed — run raven setup, or use CSV output');
  }
  const sheet = XLSX.utils.json_to_sheet(rows, { header: columns });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, 'outreach');
  XLSX.writeFile(wb, outPath);
}
