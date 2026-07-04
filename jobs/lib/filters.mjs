/** Shared title/location/content filter builders for scanners and query-index. */

export function compileKeyword(kw) {
  if (/^[a-z]{2,3}$/.test(kw)) {
    const re = new RegExp(`\\b${kw}\\b`);
    return (lower) => re.test(lower);
  }
  return (lower) => lower.includes(kw);
}

function normalizeKeywordList(value) {
  if (value == null) return [];
  const arr = Array.isArray(value) ? value : [value];
  return arr
    .filter((k) => typeof k === 'string')
    .map((k) => k.toLowerCase().trim())
    .filter(Boolean);
}

export function buildTitleFilter(titleFilter) {
  const normalize = (arr) => (Array.isArray(arr) ? arr : [])
    .filter((k) => typeof k === 'string')
    .map((k) => k.trim().toLowerCase())
    .filter((k) => k.length > 0)
    .map(compileKeyword);
  const positive = normalize(titleFilter?.positive);
  const negative = normalize(titleFilter?.negative);

  return (title) => {
    const lower = (title || '').toLowerCase();
    const hasPositive = positive.length === 0 || positive.some((m) => m(lower));
    const hasNegative = negative.some((m) => m(lower));
    return hasPositive && !hasNegative;
  };
}

export function buildLocationFilter(locationFilter) {
  if (!locationFilter) return () => true;
  const alwaysAllow = normalizeKeywordList(locationFilter.always_allow);
  const allow = normalizeKeywordList(locationFilter.allow);
  const block = normalizeKeywordList(locationFilter.block);

  return (location) => {
    if (typeof location !== 'string' || location.trim() === '') return true;
    const lower = location.toLowerCase();
    if (alwaysAllow.length > 0 && alwaysAllow.some((k) => lower.includes(k))) return true;
    if (block.length > 0 && block.some((k) => lower.includes(k))) return false;
    if (allow.length === 0) return true;
    return allow.some((k) => lower.includes(k));
  };
}

export function buildContentFilter(contentFilter) {
  if (!contentFilter) return () => true;
  const positive = normalizeKeywordList(contentFilter.positive);
  const negative = normalizeKeywordList(contentFilter.negative);

  return (description) => {
    if (typeof description !== 'string' || description.trim() === '') return true;
    const lower = description.toLowerCase();
    if (negative.length > 0 && negative.some((k) => lower.includes(k))) return false;
    if (positive.length === 0) return true;
    return positive.some((k) => lower.includes(k));
  };
}

/** Build filter config object from CLI-style filter lists. */
export function filtersFromLists({ positive = [], negative = [], allow = [], block = [], alwaysAllow = [] } = {}) {
  return {
    title_filter: { positive, negative },
    location_filter: { always_allow: alwaysAllow, allow, block },
  };
}

export function firstMatchKeyword(title, positives) {
  const lower = (title || '').toLowerCase();
  for (const k of positives) {
    if (k && lower.includes(k.toLowerCase())) return k;
  }
  return undefined;
}

export function cleanChips(v) {
  const CHIP_CAP = 16;
  if (v == null) return [];
  const arr = Array.isArray(v) ? v : [v];
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    if (typeof item !== 'string') continue;
    const k = item.trim();
    if (!k || !/[\p{L}\p{N}]/u.test(k)) continue;
    const key = k.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(k);
    if (out.length >= CHIP_CAP) break;
  }
  return out;
}
