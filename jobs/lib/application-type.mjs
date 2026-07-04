/** Classify how a job should be applied to (email vs ATS form). */

const FORM_ATS = new Set([
  'greenhouse', 'lever', 'ashby', 'workday', 'workable', 'bamboohr',
  'smartrecruiters', 'recruitee', 'pinpoint', 'teamtailor', 'personio', 'rippling',
]);

const FORM_URL_HINTS = [
  'greenhouse.io', 'lever.co', 'ashbyhq.com', 'myworkdayjobs.com',
  'workable.com', 'bamboohr.com', 'smartrecruiters.com', 'recruitee.com',
  'teamtailor.com', 'personio.de', 'rippling.com', 'pinpointhq.com',
];

/**
 * @param {object} offer
 * @returns {'form'|'email'}
 */
export function classifyApplication(offer) {
  const ats = String(offer.ats || offer.source || '').toLowerCase().replace(/-full$/, '').replace(/-seed$/, '');
  const url = String(offer.url || '').toLowerCase();

  if (FORM_ATS.has(ats)) return 'form';
  if (FORM_URL_HINTS.some((h) => url.includes(h))) return 'form';
  return 'email';
}

export function applicationTypeLabel(type) {
  return type === 'form' ? 'ATS form' : 'Email outreach';
}

export function isFormApplication(offer) {
  return classifyApplication(offer) === 'form';
}
