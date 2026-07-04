/** Canonical URL normalization and deduplication across discovery tiers. */

/**
 * Strip tracking params and normalize host for dedup keys.
 * @param {string} url
 */
export function canonUrl(url) {
  if (!url || typeof url !== 'string') return '';
  try {
    const u = new URL(url.trim());
    u.hash = '';
    const drop = new Set(['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'source']);
    for (const key of [...u.searchParams.keys()]) {
      if (drop.has(key.toLowerCase()) || key.toLowerCase().startsWith('utm_')) u.searchParams.delete(key);
    }
    u.hostname = u.hostname.toLowerCase();
    if (u.pathname.endsWith('/') && u.pathname.length > 1) u.pathname = u.pathname.slice(0, -1);
    return u.toString();
  } catch {
    return url.trim().toLowerCase();
  }
}

/**
 * @param {Iterable<{ url?: string }>} offers
 * @returns {Map<string, object>}
 */
export function dedupeOffers(offers) {
  const map = new Map();
  for (const offer of offers) {
    const key = canonUrl(offer.url || '');
    if (!key) continue;
    if (!map.has(key)) map.set(key, offer);
  }
  return map;
}

/**
 * Merge multiple offer arrays, keeping first occurrence per canonical URL.
 * @param {...Array<object>} lists
 */
export function mergeDeduped(...lists) {
  const map = new Map();
  for (const list of lists) {
    for (const offer of list) {
      const key = canonUrl(offer.url || '');
      if (!key || map.has(key)) continue;
      map.set(key, offer);
    }
  }
  return [...map.values()];
}

/**
 * Sort offers: newest postedAt first, then company name.
 * @param {Array<{ postedAt?: string|number, company?: string }>} offers
 */
export function sortOffers(offers) {
  return offers.slice().sort((a, b) => {
    const ta = a.postedAt ? Date.parse(String(a.postedAt)) || 0 : 0;
    const tb = b.postedAt ? Date.parse(String(b.postedAt)) || 0 : 0;
    if (tb !== ta) return tb - ta;
    return (a.company || '').localeCompare(b.company || '');
  });
}

/**
 * Map raw scanner job to DiscoveredOffer shape.
 * @param {object} job
 * @param {string[]} positives
 */
export function toDiscoveredOffer(job, positives = []) {
  const source = job.source || job.ats || 'unknown';
  const ats = String(source).replace(/-full$/, '').replace(/-seed$/, '');
  let postedAt = '';
  if (job.postedAt) {
    if (typeof job.postedAt === 'number') {
      postedAt = new Date(job.postedAt).toISOString().slice(0, 10);
    } else if (/^\d{4}-\d{2}-\d{2}/.test(String(job.postedAt))) {
      postedAt = String(job.postedAt).slice(0, 10);
    }
  }
  return {
    url: job.url,
    company: job.company || '',
    title: job.title || '',
    location: job.location || '',
    postedAt,
    ats,
    source,
    matchedKeyword: positives.length ? firstMatchInTitle(job.title, positives) : undefined,
    ...(job.verification ? { verification: job.verification } : {}),
  };
}

function firstMatchInTitle(title, positives) {
  const lower = (title || '').toLowerCase();
  for (const k of positives) {
    if (k && lower.includes(k.toLowerCase())) return k;
  }
  return undefined;
}
