/** JD keyword extraction, resume tailoring, and action-word suggestions. */

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'you', 'your', 'our', 'will', 'are', 'this', 'that',
  'from', 'have', 'has', 'been', 'into', 'about', 'role', 'team', 'work', 'job',
  'senior', 'junior', 'staff', 'lead', 'remote', 'hybrid', 'full', 'time', 'per',
  'mwd', 'mfx', 'fmd', 'intern', 'internship',
]);

const TECH_PATTERNS = [
  /\b(python|typescript|javascript|java|go|golang|ruby|rust|kotlin|swift|c\+\+|c#)\b/gi,
  /\b(react|vue|angular|node\.?js|django|flask|fastapi|spring|rails)\b/gi,
  /\b(aws|gcp|azure|kubernetes|k8s|docker|terraform|postgres|postgresql|mysql|redis|mongodb)\b/gi,
  /\b(machine learning|ml|ai|llm|nlp|data engineer|backend|frontend|fullstack|full-stack|devops|sre|platform)\b/gi,
];

const ACTION_BY_THEME = {
  backend: ['Architected', 'Built', 'Scaled', 'Optimized', 'Deployed'],
  frontend: ['Shipped', 'Designed', 'Implemented', 'Polished', 'Delivered'],
  fullstack: ['End-to-end owned', 'Shipped', 'Built', 'Launched', 'Delivered'],
  data: ['Modeled', 'Pipelined', 'Analyzed', 'Productionized', 'Automated'],
  ml: ['Trained', 'Evaluated', 'Deployed', 'Fine-tuned', 'Productionized'],
  devops: ['Automated', 'Hardened', 'Orchestrated', 'Migrated', 'Observed'],
  default: ['Built', 'Shipped', 'Led', 'Improved', 'Delivered'],
};

/**
 * Extract keywords from job title (+ optional description).
 * @param {string} title
 * @param {string} [description]
 */
export function extractJdKeywords(title, description = '') {
  const text = `${title} ${description}`.toLowerCase();
  const found = new Set();

  for (const re of TECH_PATTERNS) {
    for (const m of text.matchAll(re)) found.add(m[0].toLowerCase().replace(/\s+/g, ' '));
  }

  for (const word of text.match(/[a-z0-9+#.]{2,}/g) || []) {
    if (!STOP_WORDS.has(word) && word.length > 2) found.add(word);
  }

  return [...found].slice(0, 30);
}

/**
 * Score and rank resume bullets against JD keywords.
 * @param {string[]} bullets
 * @param {string[]} keywords
 */
export function rankBullets(bullets, keywords) {
  return bullets
    .map((text) => {
      const lower = text.toLowerCase();
      const matched = keywords.filter((k) => lower.includes(k));
      return { text, score: matched.length, matchedKeywords: matched };
    })
    .sort((a, b) => b.score - a.score || b.text.length - a.text.length);
}

/**
 * Pick top tailored bullets for a job.
 */
export function tailorBullets(bullets, offer, maxBullets = 3) {
  const keywords = extractJdKeywords(offer.title || '', offer.description || '');
  const ranked = rankBullets(bullets, keywords);
  const top = ranked.filter((b) => b.score > 0).slice(0, maxBullets);
  const fallback = ranked.slice(0, maxBullets);
  const chosen = top.length ? top : fallback;
  return {
    bullets: chosen.map((b) => b.text),
    keywords,
    ranked,
  };
}

/** Suggest strong action verbs based on JD theme. */
export function suggestActionWords(keywords, title = '') {
  const hay = `${title} ${keywords.join(' ')}`.toLowerCase();
  let theme = 'default';
  if (/backend|api|service|platform/.test(hay)) theme = 'backend';
  else if (/frontend|ui|react|vue|design/.test(hay)) theme = 'frontend';
  else if (/full.?stack|fullstack/.test(hay)) theme = 'fullstack';
  else if (/data|analytics|warehouse|etl/.test(hay)) theme = 'data';
  else if (/ml|machine learning|llm|ai|nlp/.test(hay)) theme = 'ml';
  else if (/devops|sre|infra|kubernetes|terraform/.test(hay)) theme = 'devops';

  const verbs = ACTION_BY_THEME[theme] || ACTION_BY_THEME.default;
  const matched = keywords.slice(0, 8);
  return {
    theme,
    verbs,
    matchedKeywords: matched,
    hint: matched.length
      ? `Lead bullets with: ${verbs.slice(0, 3).join(', ')} — weave in: ${matched.join(', ')}`
      : `Lead bullets with: ${verbs.slice(0, 3).join(', ')}`,
  };
}

/** Prefix bullet with suggested action verb if it starts lowercase. */
export function applyActionVerb(bullet, verbs) {
  if (!verbs?.length) return bullet;
  const trimmed = bullet.trim();
  if (/^[A-Z]/.test(trimmed)) return trimmed;
  return `${verbs[0]} ${trimmed.charAt(0).toLowerCase()}${trimmed.slice(1)}`;
}

export function formatActionWordsField(actionWords) {
  return actionWords.hint;
}

export function formatKeywordsField(keywords) {
  return keywords.join(', ');
}

export function formatTailoredBullets(bullets) {
  return bullets.map((b) => `• ${b.replace(/^[-*•]\s*/, '')}`).join('\n');
}
