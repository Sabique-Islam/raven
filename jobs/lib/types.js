// Type catalog for Raven job discovery — documentation-only JSDoc.

/**
 * @typedef {object} Job
 * @property {string} title
 * @property {string} url
 * @property {string} company
 * @property {string} [location]
 * @property {number} [postedAt]
 * @property {string} [description]
 * @property {string} [source]
 */

/**
 * @typedef {object} DiscoveredOffer
 * @property {string} url
 * @property {string} company
 * @property {string} title
 * @property {string} location
 * @property {string} postedAt
 * @property {string} ats
 * @property {string} source
 * @property {string} [matchedKeyword]
 * @property {'unconfirmed'} [verification]
 * @property {string} [why]
 * @property {'low'|'medium'|'high'} [confidence]
 */

/**
 * @typedef {object} ExploreFilters
 * @property {string[]} positive
 * @property {string[]} negative
 * @property {string[]} allow
 * @property {string[]} block
 * @property {string[]} alwaysAllow
 * @property {number} sinceDays
 * @property {string[]} ats
 * @property {number} limitPerAts
 */

/** @type {ExploreFilters} */
export const DEFAULT_FILTERS = {
  positive: [],
  negative: [],
  allow: [],
  block: [],
  alwaysAllow: [],
  sinceDays: 7,
  ats: [
    'greenhouse', 'lever', 'ashby', 'workday',
    'rippling', 'workable', 'bamboohr', 'smartrecruiters',
    'recruitee', 'pinpoint', 'teamtailor', 'personio',
  ],
  limitPerAts: 150,
};

export const ALL_ATS_SOURCES = [...DEFAULT_FILTERS.ats];

export const ATS_LABEL = {
  greenhouse: 'Greenhouse',
  lever: 'Lever',
  ashby: 'Ashby',
  workday: 'Workday',
  rippling: 'Rippling',
  workable: 'Workable',
  bamboohr: 'BambooHR',
  smartrecruiters: 'SmartRecruiters',
  recruitee: 'Recruitee',
  pinpoint: 'Pinpoint',
  teamtailor: 'Teamtailor',
  personio: 'Personio',
};

export {};
