#!/usr/bin/env node

/**
 * query-index.mjs — Search the local openjobdata SQLite index.
 *
 * Usage:
 *   node query-index.mjs --q "software engineer" --since 7
 *   node query-index.mjs --q "designer" --ats greenhouse,lever --json
 */

import { createRequire } from 'node:module';
import { pathToFileURL } from 'url';
import { JOBS_DB_PATH } from './lib/paths.mjs';
import { buildTitleFilter, buildLocationFilter, filtersFromLists } from './lib/filters.mjs';
import { toDiscoveredOffer, sortOffers } from './lib/dedup.mjs';
import { createLogger, parseLogFlags } from './lib/log.mjs';
import fs from 'node:fs';

const require = createRequire(import.meta.url);

function parseArgs(argv) {
  const args = argv.slice(2);
  const valueOf = (flag) => {
    const idx = args.indexOf(flag);
    if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) return args[idx + 1];
    const kv = args.find((a) => a.startsWith(`${flag}=`));
    return kv ? kv.split('=').slice(1).join('=') : null;
  };
  const splitList = (v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : []);
  return {
    positive: splitList(valueOf('--q')),
    negative: splitList(valueOf('--not')),
    allow: splitList(valueOf('--loc')),
    block: splitList(valueOf('--noloc')),
    alwaysAllow: splitList(valueOf('--home')),
    sinceDays: Math.max(1, Number(valueOf('--since')) || 7),
    ats: splitList(valueOf('--ats')),
    limit: Math.min(5000, Math.max(1, Number(valueOf('--limit')) || 500)),
    ...parseLogFlags(args),
  };
}

export function queryIndex(opts) {
  if (!fs.existsSync(JOBS_DB_PATH)) {
    throw new Error(`Index not found at ${JOBS_DB_PATH}. Run: npm run sync-jobs`);
  }

  const Database = require('better-sqlite3');
  const db = new Database(JOBS_DB_PATH, { readonly: true });

  const filterConfig = filtersFromLists(opts);
  const titleFilter = buildTitleFilter(filterConfig.title_filter);
  const locationFilter = buildLocationFilter(filterConfig.location_filter);

  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - opts.sinceDays);
  const cutoffIso = cutoff.toISOString();

  let sql = `
    SELECT j.apply_url AS url, j.title, j.country, j.workplace_type, j.is_remote,
           j.posted_at, j.ats, c.name AS company
    FROM jobs j
    LEFT JOIN companies c ON c.id = j.company_id
    WHERE j.status = 'active' AND j.apply_url != ''
      AND (j.posted_at IS NULL OR j.posted_at >= @cutoff)
  `;
  const params = { cutoff: cutoffIso };

  if (opts.ats?.length) {
    const placeholders = opts.ats.map((_, i) => `@ats${i}`).join(',');
    sql += ` AND LOWER(COALESCE(j.ats, c.ats, '')) IN (${placeholders})`;
    opts.ats.forEach((a, i) => { params[`ats${i}`] = a.toLowerCase(); });
  }

  sql += ' ORDER BY j.posted_at DESC LIMIT @limit';
  params.limit = opts.limit * 4;

  const rows = db.prepare(sql).all(params);
  db.close();

  const offers = [];
  for (const row of rows) {
    const location = [row.workplace_type, row.country].filter(Boolean).join(', ')
      || (row.is_remote ? 'Remote' : '');
    if (!titleFilter(row.title)) continue;
    if (!locationFilter(location)) continue;
    offers.push(toDiscoveredOffer({
      url: row.url,
      company: row.company || 'Unknown',
      title: row.title,
      location,
      postedAt: row.posted_at ? String(row.posted_at).slice(0, 10) : '',
      source: `openjobdata:${row.ats || 'unknown'}`,
      ats: row.ats || 'unknown',
    }, opts.positive));
    if (offers.length >= opts.limit) break;
  }

  return sortOffers(offers);
}

async function main() {
  const opts = parseArgs(process.argv);
  const logger = createLogger('query', {
    json: opts.json,
    quiet: opts.quiet,
    verbose: opts.verbose,
    log: opts.log,
    noLog: opts.noLog,
  });

  try {
    const phase = logger.phase('SQLite index query');
    logger.info(`Query — since ${opts.sinceDays}d | limit ${opts.limit}${opts.positive.length ? ` | q: ${opts.positive.join(', ')}` : ''}`);

    const offers = queryIndex(opts);
    phase.done({ matches: offers.length });
    logger.stat('matches', offers.length);
    logger.summary();

    if (opts.json) {
      process.stdout.write(JSON.stringify({ count: offers.length, offers, log: logger.logPath }, null, 2) + '\n');
      return;
    }

    if (offers.length) {
      for (const o of offers.slice(0, 50)) {
        logger.info(`  + [${o.ats}] ${o.postedAt || 'n/a'} | ${o.company} | ${o.title}`);
        logger.info(`    ${o.url}`);
      }
      if (offers.length > 50) logger.info(`  … ${offers.length - 50} more (use --json)`);
    } else {
      logger.info('No matches in local index.');
    }
  } finally {
    logger.close();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  main().catch((err) => {
    console.error('Fatal:', err.message);
    process.exit(1);
  });
}
