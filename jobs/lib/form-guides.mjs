import { ATS_LABEL } from './types.js';
import { getLinksForForms } from './profile.mjs';

const BASE_STEPS = [
  'Open the job listing and click Apply.',
  'Use your profile links when paste fields appear (portfolio, GitHub, LinkedIn, resume URL).',
  'Tailor your bullets using the suggested action words and JD keywords for this role.',
  'Proofread every field before submitting — ATS forms rarely allow edits after submit.',
];

const ATS_STEPS = {
  ashby: [
    'Ashby often asks for LinkedIn, portfolio, and resume upload on one page.',
    'Paste your GitHub and portfolio URLs in "Links" or "Website" fields if shown.',
    'For free-text "Why this role?" use 2–3 tailored bullets from your resume — no em dashes.',
    'Upload resume PDF or paste link if the form accepts a URL.',
  ],
  greenhouse: [
    'Greenhouse: upload resume (PDF), cover letter optional — paste tailored bullets if no upload.',
    'Fill LinkedIn and website fields from your profile links.',
    'Custom questions: answer concisely; mirror JD keywords naturally.',
  ],
  lever: [
    'Lever: resume upload + short application form.',
    'Use "Additional information" for 2–3 tailored bullets if no cover letter field.',
    'Add portfolio/GitHub in any URL field provided.',
  ],
  workday: [
    'Workday wizards are multi-step — allow 10–15 minutes.',
    'Create account if required; reuse saved profile data carefully.',
    'Paste links in "Website" / "LinkedIn" fields; upload resume when prompted.',
  ],
  workable: [
    'Workable: resume + basic details, sometimes a short note field.',
    'Use the note field for tailored bullets; keep under 150 words.',
  ],
  default: [
    'Complete all required fields before moving to the next step.',
    'Save a copy of your answers locally — some ATS sessions expire.',
  ],
};

function normalizeAts(offer) {
  return String(offer.ats || offer.source || 'unknown')
    .toLowerCase()
    .replace(/-full$/, '')
    .replace(/-seed$/, '')
    .replace(/-api$/, '');
}

/**
 * Build step-by-step ATS application guide for form-based jobs.
 * @param {object} offer
 * @param {import('./profile.mjs').UserProfile} profile
 * @param {{ actionWords?: string, jdKeywords?: string, tailoredBullets?: string }} [tailoring]
 */
export function buildFormGuide(offer, profile, tailoring = {}) {
  const ats = normalizeAts(offer);
  const label = ATS_LABEL[ats] || ats;
  const links = getLinksForForms(profile);
  const specific = ATS_STEPS[ats] || ATS_STEPS.default;

  const lines = [
    `# Apply via ${label} form`,
    '',
    `Role: ${offer.title} @ ${offer.company}`,
    `Listing: ${offer.url}`,
    '',
    '## Your details (copy/paste)',
    `- Name: ${links.name}`,
    `- Email: ${links.email}`,
    ...(links.phone ? [`- Phone: ${links.phone}`] : []),
    ...(links.location ? [`- Location: ${links.location}`] : []),
    ...(links.linkedin ? [`- LinkedIn: ${links.linkedin}`] : []),
    ...(links.github ? [`- GitHub: ${links.github}`] : []),
    ...(links.portfolio ? [`- Portfolio: ${links.portfolio}`] : []),
    ...(links.resume ? [`- Resume: ${links.resume}`] : []),
    ...(links.x ? [`- X: ${links.x}`] : []),
    '',
  ];

  if (tailoring.jdKeywords) {
    lines.push('## JD keywords to mirror', tailoring.jdKeywords, '');
  }
  if (tailoring.actionWords) {
    lines.push('## Suggested action words', tailoring.actionWords, '');
  }
  if (tailoring.tailoredBullets) {
    lines.push('## Tailored bullets for free-text fields', tailoring.tailoredBullets, '');
  }

  lines.push('## Steps');
  let n = 1;
  for (const step of BASE_STEPS) {
    lines.push(`${n}. ${step}`);
    n++;
  }
  for (const step of specific) {
    lines.push(`${n}. ${step}`);
    n++;
  }
  lines.push(`${n}. Submit only after you have reviewed every field yourself.`);

  return lines.join('\n');
}

/** Short form guide for CSV body column. */
export function buildFormGuideShort(offer, profile, tailoring = {}) {
  const ats = normalizeAts(offer);
  const label = ATS_LABEL[ats] || ats;
  const links = getLinksForForms(profile);
  const linkLine = [links.linkedin, links.github, links.portfolio].filter(Boolean).join(' · ');

  return [
    `[${label} form application — not an email]`,
    '',
    `1. Open: ${offer.url}`,
    `2. Apply as ${links.name} (${links.email})`,
    linkLine ? `3. Paste links: ${linkLine}` : '3. Paste your profile links where requested',
    tailoring.actionWords ? `4. Action words: ${tailoring.actionWords}` : null,
    tailoring.tailoredBullets ? `5. Use tailored bullets in free-text fields:\n${tailoring.tailoredBullets}` : '5. Use tailored bullets in "Why us?" / cover fields',
    '',
    'Review all fields yourself before submitting.',
  ].filter(Boolean).join('\n');
}
