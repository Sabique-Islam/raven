#!/usr/bin/env node

/**
 * discover.mjs — Unified Raven job discovery orchestrator.
 *
 * Tiers (parallel):
 *   ats       — scan-ats-full.mjs (live ATS APIs)
 *   boards    — scan.mjs --boards-only (RemoteOK, Remotive, etc.)
 *   index     — query-index.mjs (local openjobdata SQLite)
 *   hiringcafe — optional hiring.cafe provider (HIRING_CAFE_ENABLED=1)
 *
 * Usage:
 *   raven discover --q "software engineer" --since 7
 *   raven discover --sources ats,boards,index --json
 *   raven discover --stream --q "ML engineer" --loc Remote
 *
 * Logging:
 *   Progress + stats on stderr/stdout; log file in data/logs/ (use --no-log to disable)
 *   --verbose  per-tier detail + child stderr
 *   --quiet    summary only
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'url';
import { cleanChips } from './lib/filters.mjs';
import { mergeDeduped, sortOffers, toDiscoveredOffer } from './lib/dedup.mjs';
import { writeTempPortals, cleanupTempPortals, defaultJobBoards } from './lib/portals.mjs';
import { JOBS_ROOT, JOBS_DB_PATH, LAST_DISCOVER_JSON } from './lib/paths.mjs';
import { createLogger, parseLogFlags } from './lib/log.mjs';
import { queryIndex } from './query-index.mjs';
import { ALL_ATS_SOURCES } from './lib/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = argv.slice(2);
  const valueOf = (flag) => {
    const idx = args.indexOf(flag);
    if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) return args[idx + 1];
    const kv = args.find((a) => a.startsWith(`${flag}=`));
    return kv ? kv.split('=').slice(1).join('=') : null;
  };
  const splitList = (v) => cleanChips(v ? v.split(',') : []);
  const sourcesRaw = valueOf('--sources') || 'ats,boards,index';
  const sources = sourcesRaw.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  const logFlags = parseLogFlags(args);
  return {
    positive: splitList(valueOf('--q')),
    negative: splitList(valueOf('--not')),
    allow: splitList(valueOf('--loc')),
    block: splitList(valueOf('--noloc')),
    alwaysAllow: splitList(valueOf('--home')),
    sinceDays: Math.max(1, Number(valueOf('--since')) || 7),
    ats: splitList(valueOf('--ats')).length ? splitList(valueOf('--ats')) : [...ALL_ATS_SOURCES],
    limitPerAts: Math.min(500, Math.max(50, Number(valueOf('--limit')) || 150)),
    limit: Math.min(5000, Math.max(1, Number(valueOf('--max')) || 1000)),
    sources,
    save: valueOf('--save'),
    noSave: args.includes('--no-save'),
    json: logFlags.json,
    stream: logFlags.stream,
    verbose: logFlags.verbose,
    quiet: logFlags.quiet,
    log: logFlags.log,
    noLog: logFlags.noLog,
  };
}

function emit(event, opts) {
  if (opts.stream) process.stdout.write(JSON.stringify(event) + '\n');
}

function parseJsonStdout(out) {
  const trimmed = out.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    const lines = trimmed.split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.startsWith('{')) {
        try {
          return JSON.parse(line);
        } catch {
          /* continue */
        }
      }
    }
  }
  return null;
}

function spawnJob(args, env, logger, opts) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: path.resolve(JOBS_ROOT, '..'),
      env: { ...process.env, ...env },
    });
    let out = '';
    child.stdout.on('data', (d) => { out += d.toString(); });
    child.stderr.on('data', (d) => {
      if (opts.verbose) logger.pipe(d);
    });
    child.on('close', (code) => resolve({ out, code }));
    child.on('error', reject);
  });
}

function runScanAtsFull(filters, logger, opts) {
  return new Promise(async (resolve) => {
    const phase = logger.phase(`ATS scan (${filters.ats.length} platforms)`);
    const tempPortals = writeTempPortals({
      positive: filters.positive,
      negative: filters.negative,
      allow: filters.allow,
      block: filters.block,
      alwaysAllow: filters.alwaysAllow,
    });
    const ats = filters.ats.filter((a) => ALL_ATS_SOURCES.includes(a));
    const args = [
      path.join(JOBS_ROOT, 'scan-ats-full.mjs'),
      '--dry-run',
      '--json',
      '--since', String(filters.sinceDays),
      '--ats', ats.join(','),
      '--limit', String(filters.limitPerAts),
    ];
    if (opts.verbose) args.push('--verbose');

    try {
      const { out, code } = await spawnJob(args, { RAVEN_PORTALS: tempPortals }, logger, opts);
      cleanupTempPortals(tempPortals);
      const j = parseJsonStdout(out) || { offers: [] };
      const offers = (j.offers || []).map((o) => toDiscoveredOffer({
        ...o,
        postedAt: o.postedAt,
        source: o.source,
      }, filters.positive));
      phase.done({
        matches: offers.length,
        companiesScanned: j.companiesScanned,
        unreachable: j.unreachableBoards,
      });
      if (code !== 0) logger.warn(`ATS scan exited with code ${code}`);
      emit({ kind: 'atsDone', ats: 'all', matches: offers.length, companiesScanned: j.companiesScanned }, opts);
      resolve(offers);
    } catch (err) {
      cleanupTempPortals(tempPortals);
      phase.fail(err.message);
      resolve([]);
    }
  });
}

function runBoardsScan(filters, logger, opts) {
  return new Promise(async (resolve) => {
    const phase = logger.phase('Board feeds');
    const tempPortals = writeTempPortals({
      positive: filters.positive,
      negative: filters.negative,
      allow: filters.allow,
      block: filters.block,
      alwaysAllow: filters.alwaysAllow,
      job_boards: defaultJobBoards(),
    });
    const args = [
      path.join(JOBS_ROOT, 'scan.mjs'),
      '--dry-run',
      '--boards-only',
      '--json',
    ];
    if (opts.verbose) args.push('--verbose');

    try {
      const { out } = await spawnJob(args, { RAVEN_PORTALS: tempPortals }, logger, opts);
      cleanupTempPortals(tempPortals);
      const j = parseJsonStdout(out) || { offers: [] };
      const offers = (j.offers || []).map((o) => toDiscoveredOffer(o, filters.positive));
      phase.done({ matches: offers.length });
      emit({ kind: 'boardsDone', matches: offers.length }, opts);
      resolve(offers);
    } catch (err) {
      cleanupTempPortals(tempPortals);
      phase.fail(err.message);
      resolve([]);
    }
  });
}

async function runHiringCafe(filters, logger) {
  const phase = logger.phase('hiring.cafe');
  if (process.env.HIRING_CAFE_ENABLED !== '1') {
    phase.skip('HIRING_CAFE_ENABLED not set');
    return [];
  }
  try {
    const mod = await import('./providers/hiring-cafe.mjs');
    const { makeHttpCtx } = await import('./providers/_http.mjs');
    const ctx = makeHttpCtx();
    const entry = {
      name: 'Hiring.cafe',
      provider: 'hiring-cafe',
      keywords: filters.positive,
      location: filters.allow[0] || '',
      since_days: filters.sinceDays,
    };
    const jobs = await mod.default.fetch(entry, ctx);
    const { buildTitleFilter, buildLocationFilter, filtersFromLists } = await import('./lib/filters.mjs');
    const fc = filtersFromLists(filters);
    const titleFilter = buildTitleFilter(fc.title_filter);
    const locationFilter = buildLocationFilter(fc.location_filter);
    const offers = jobs
      .filter((j) => titleFilter(j.title) && locationFilter(j.location))
      .map((j) => toDiscoveredOffer({ ...j, verification: 'unconfirmed' }, filters.positive));
    phase.done({ matches: offers.length });
    return offers;
  } catch (err) {
    phase.fail(err.message);
    return [];
  }
}

async function discover(filters, logger, opts) {
  emit({ kind: 'start', sources: filters.sources, sinceDays: filters.sinceDays, free: true }, opts);

  logger.info(`Raven discover — sources: ${filters.sources.join(', ')} | since ${filters.sinceDays}d | max ${filters.limit}`);
  if (filters.positive.length) logger.info(`  keywords: ${filters.positive.join(', ')}`);
  if (filters.allow.length) logger.info(`  locations: ${filters.allow.join(', ')}`);
  if (filters.ats.length && filters.sources.includes('ats')) {
    logger.verbose(`  ATS: ${filters.ats.join(', ')} (${filters.limitPerAts} companies/platform)`);
  }

  const tasks = [];
  const labels = [];

  if (filters.sources.includes('ats')) {
    labels.push('ats');
    tasks.push(runScanAtsFull(filters, logger, opts));
  }
  if (filters.sources.includes('boards')) {
    labels.push('boards');
    tasks.push(runBoardsScan(filters, logger, opts));
  }
  if (filters.sources.includes('index')) {
    labels.push('index');
    tasks.push(Promise.resolve().then(() => {
      const phase = logger.phase('Local index (openjobdata)');
      if (!fs.existsSync(JOBS_DB_PATH)) {
        phase.skip('index missing — run: raven sync-jobs');
        emit({ kind: 'log', line: 'Local index missing — run raven sync-jobs first' }, opts);
        return [];
      }
      try {
        const o = queryIndex({
          positive: filters.positive,
          negative: filters.negative,
          allow: filters.allow,
          block: filters.block,
          alwaysAllow: filters.alwaysAllow,
          sinceDays: filters.sinceDays,
          ats: filters.ats,
          limit: filters.limit,
        });
        phase.done({ matches: o.length });
        emit({ kind: 'indexDone', matches: o.length }, opts);
        return o;
      } catch (err) {
        phase.fail(err.message);
        return [];
      }
    }));
  }
  if (filters.sources.includes('hiringcafe')) {
    labels.push('hiringcafe');
    tasks.push(runHiringCafe(filters, logger));
  }

  const results = await Promise.all(tasks);
  const rawTotal = results.reduce((n, r) => n + r.length, 0);
  let offers = mergeDeduped(...results);
  offers = sortOffers(offers).slice(0, filters.limit);
  const deduped = rawTotal - offers.length;

  logger.stat('rawMatches', rawTotal);
  logger.stat('uniqueMatches', offers.length);
  if (deduped > 0) logger.stat('deduped', deduped);

  for (const offer of offers) {
    emit({ kind: 'offer', offer }, opts);
  }

  const summaryPayload = {
    kind: 'summary',
    matches: offers.length,
    rawMatches: rawTotal,
    deduped,
    sources: labels,
  };
  emit(summaryPayload, opts);

  return { offers, rawTotal, deduped, labels };
}

/** Write discover results JSON for raven draft. */
export function saveDiscoverResults(offers, meta, savePath) {
  const target = path.resolve(savePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const payload = {
    count: offers.length,
    rawMatches: meta.rawTotal,
    deduped: meta.deduped,
    offers,
    savedAt: new Date().toISOString(),
    ...(meta.sources ? { sources: meta.sources } : {}),
  };
  fs.writeFileSync(target, JSON.stringify(payload, null, 2), 'utf8');
  return target;
}

async function main() {
  const filters = parseArgs(process.argv);
  const opts = { stream: filters.stream, json: filters.json, verbose: filters.verbose };
  const logger = createLogger('discover', {
    json: filters.json,
    quiet: filters.quiet,
    verbose: filters.verbose,
    log: filters.log,
    noLog: filters.noLog,
  });

  try {
    const { offers, rawTotal, deduped } = await discover(filters, logger, opts);

    logger.summary({
      counters: {
        rawMatches: rawTotal,
        uniqueMatches: offers.length,
        deduped,
        sources: filters.sources.join(','),
      },
    });

    if (!filters.noSave) {
      const savePath = saveDiscoverResults(offers, {
        rawTotal,
        deduped,
        sources: filters.sources,
      }, filters.save || LAST_DISCOVER_JSON);
      logger.info(`Saved: ${savePath}`);
      if (!filters.quiet && offers.length) {
        logger.info(`Next: raven draft --max 25`);
      }
    }

    if (filters.json && !filters.stream) {
      process.stdout.write(JSON.stringify({
        count: offers.length,
        rawMatches: rawTotal,
        deduped,
        offers,
        savedTo: filters.noSave ? null : path.resolve(filters.save || LAST_DISCOVER_JSON),
        log: logger.logPath,
      }, null, 2) + '\n');
      return;
    }

    if (filters.stream) {
      emit({ kind: 'done', count: offers.length, rawMatches: rawTotal, deduped, offers, log: logger.logPath, cost: { tokens: 0, usd: 0 } }, opts);
      return;
    }

    if (filters.quiet) return;

    if (offers.length) {
      logger.info('');
      logger.info(`Top matches (${Math.min(30, offers.length)} of ${offers.length}):`);
      for (const o of offers.slice(0, 30)) {
        logger.info(`  + [${o.ats}] ${o.postedAt || 'n/a'} | ${o.company} | ${o.title}`);
        logger.info(`    ${o.url}`);
      }
      if (offers.length > 30) logger.info(`  … ${offers.length - 30} more (use --json)`);
    } else {
      logger.info('No matches. Try widening --since, keywords, or run raven sync-jobs for the local index.');
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

export { discover, parseArgs };
