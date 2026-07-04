import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { CONFIG_DIR, PROFILE_PATH, RAVEN_ROOT } from './paths.mjs';

/** @typedef {object} UserProfile
 * @property {object} identity
 * @property {object} links
 * @property {string[]} [highlights]
 * @property {string[]} [skills]
 * @property {object} [resume]
 * @property {object} [draft]
 * @property {object} [outreach]
 */

/** Load config/profile.yml (falls back to example). */
export function loadProfile() {
  const candidates = [PROFILE_PATH, path.join(CONFIG_DIR, 'profile.example.yml')];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const data = yaml.load(fs.readFileSync(p, 'utf8')) || {};
      return normalizeProfile(data);
    }
  }
  return normalizeProfile({});
}

function normalizeProfile(raw) {
  return {
    identity: {
      name: raw.identity?.name || '',
      email: raw.identity?.email || '',
      phone: raw.identity?.phone || '',
      location: raw.identity?.location || '',
    },
    links: {
      resume: raw.links?.resume || raw.resume?.path || '',
      portfolio: raw.links?.portfolio || '',
      github: raw.links?.github || '',
      linkedin: raw.links?.linkedin || '',
      x: raw.links?.x || '',
    },
    highlights: Array.isArray(raw.highlights) ? raw.highlights.filter(Boolean) : [],
    skills: Array.isArray(raw.skills) ? raw.skills.filter(Boolean) : [],
    resume: {
      path: raw.resume?.path || raw.links?.resume || 'files/resume.md',
      max_bullets: Math.min(10, Math.max(1, Number(raw.resume?.max_bullets) || 5)),
    },
    draft: {
      gemini: {
        enabled: Boolean(raw.draft?.gemini?.enabled),
        model: raw.draft?.gemini?.model || 'gemini-2.0-flash',
      },
      disclaimer: raw.draft?.disclaimer || 'Review and edit this draft yourself before sending or submitting.',
    },
    outreach: raw.outreach || {},
  };
}

/** Resolve a profile path (relative to repo root) or pass through URLs. */
export function resolveProfilePath(value) {
  if (!value) return null;
  const v = String(value).trim();
  if (/^https?:\/\//i.test(v)) return v;
  const abs = path.isAbsolute(v) ? v : path.join(RAVEN_ROOT, v);
  return fs.existsSync(abs) ? abs : abs;
}

/** Merge profile identity with .env fallbacks. */
export function getIdentity(profile, env = process.env) {
  return {
    name: profile.identity.name || env.SENDER_NAME || 'Your Name',
    email: profile.identity.email || env.SENDER_EMAIL || '',
    phone: profile.identity.phone || '',
    location: profile.identity.location || '',
  };
}

/** One-line links string for emails and form paste fields. */
export function formatLinksBlock(profile) {
  const parts = [];
  const { links } = profile;
  if (links.portfolio) parts.push(`Portfolio: ${links.portfolio}`);
  if (links.github) parts.push(`GitHub: ${links.github}`);
  if (links.linkedin) parts.push(`LinkedIn: ${links.linkedin}`);
  if (links.x) parts.push(`X: ${links.x}`);
  if (links.resume && /^https?:\/\//i.test(links.resume)) parts.push(`Resume: ${links.resume}`);
  return parts.join(' · ');
}

/** Structured links for form guides. */
export function getLinksForForms(profile) {
  const identity = getIdentity(profile);
  return {
    name: identity.name,
    email: identity.email,
    phone: identity.phone,
    location: identity.location,
    resume: profile.links.resume,
    portfolio: profile.links.portfolio,
    github: profile.links.github,
    linkedin: profile.links.linkedin,
    x: profile.links.x,
  };
}

/** Merge profile outreach template with legacy outreach.yml shape. */
export function mergeOutreachConfig(profile, legacyOutreach = {}) {
  const o = profile.outreach || {};
  return {
    greeting_generic: o.greeting_generic || legacyOutreach.greeting_generic || 'Hey team',
    subject: o.subject || legacyOutreach.subject || 'Application: {{title}} at {{company}}',
    body: o.body || legacyOutreach.body || '',
    company_hook: o.company_hook || legacyOutreach.company_hook || '',
    highlights: profile.highlights.length ? profile.highlights : (legacyOutreach.highlights || []),
    guess_email: legacyOutreach.guess_email || false,
    sender: {
      name: profile.identity.name || legacyOutreach.sender?.name || '',
      email: profile.identity.email || legacyOutreach.sender?.email || '',
    },
  };
}

export function profileDisclaimer(profile) {
  return profile.draft?.disclaimer || 'Review and edit this draft yourself before sending or submitting.';
}

export function geminiConfig(profile) {
  return profile.draft?.gemini || { enabled: false, model: 'gemini-2.0-flash' };
}
