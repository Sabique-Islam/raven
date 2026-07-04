// @ts-check
/** @typedef {import('./_types.js').Provider} Provider */

/**
 * hiring.cafe provider — OPT-IN ONLY (HIRING_CAFE_ENABLED=1).
 *
 * hiring.cafe uses Cloudflare/Vercel bot protection; results may be blocked from
 * datacenter IPs. Set HIRING_CAFE_ENABLED=1 to try the public search transport.
 * Fallback: set APIFY_TOKEN + HIRING_CAFE_APIFY_ACTOR=manojachari/hiring-cafe-scraper
 *
 * All results carry verification: unconfirmed.
 */

const SEARCH_URL = 'https://hiring.cafe/api/search-jobs';

/** @type {Provider} */
export default {
  id: 'hiring-cafe',

  async fetch(entry, ctx) {
    if (process.env.HIRING_CAFE_ENABLED !== '1') {
      return [];
    }

    if (process.env.APIFY_TOKEN && process.env.HIRING_CAFE_APIFY_ACTOR) {
      return fetchViaApify(entry);
    }

    const keywords = Array.isArray(entry.keywords) ? entry.keywords : [];
    const searchTerm = keywords.join(' ') || entry.name || 'software engineer';
    const body = {
      searchQuery: searchTerm,
      limit: Math.min(Number(entry.limit) || 50, 100),
    };

    try {
      const json = await ctx.fetchJson(SEARCH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; RavenJobs/1.0)',
        },
        body: JSON.stringify(body),
        redirect: 'error',
      });
      return normalizeResults(json, entry.name || 'Hiring.cafe');
    } catch (err) {
      throw new Error(`hiring.cafe blocked or unavailable (${err.message}). Try APIFY_TOKEN fallback or run from a residential network.`);
    }
  },
};

function normalizeResults(json, fallbackCompany) {
  const items = json?.jobs || json?.results || json?.data || (Array.isArray(json) ? json : []);
  if (!Array.isArray(items)) return [];
  return items
    .filter((j) => j && (j.url || j.applyUrl || j.link))
    .map((j) => ({
      title: j.title || j.jobTitle || j.position || '',
      url: j.url || j.applyUrl || j.link || '',
      company: j.company || j.companyName || fallbackCompany,
      location: j.location || j.workplaceType || '',
      source: 'hiring-cafe',
      verification: 'unconfirmed',
    }))
    .filter((j) => j.title && j.url);
}

async function fetchViaApify(entry) {
  const token = process.env.APIFY_TOKEN;
  const actor = process.env.HIRING_CAFE_APIFY_ACTOR || 'manojachari/hiring-cafe-scraper';
  const keywords = Array.isArray(entry.keywords) ? entry.keywords : [];
  const input = {
    searchQuery: keywords.join(' ') || 'software engineer',
    maxResults: Math.min(Number(entry.limit) || 50, 100),
  };
  const runUrl = `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}`;
  const res = await fetch(runUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Apify actor failed: HTTP ${res.status}`);
  const items = await res.json();
  return normalizeResults({ jobs: items }, entry.name || 'Hiring.cafe');
}
