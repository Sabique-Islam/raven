#!/usr/bin/env node

/**
 * draft-outreach.mjs — Turn discovered jobs into tailored application drafts.
 *
 * Source of truth: config/profile.yml (identity, links, resume path)
 * Optional: GEMINI_API_KEY + --gemini for AI-polished email drafts
 *
 * Usage:
 *   raven draft --input data/jobs.json
 *   raven draft --q "backend engineer" --since 7 --gemini
 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'url';
import { discover, parseArgs as parseDiscoverArgs } from './discover.mjs';
import { createLogger, parseLogFlags } from './lib/log.mjs';
import { RAVEN_ROOT } from './lib/paths.mjs';
import { loadProfile } from './lib/profile.mjs';
import { loadOutreachConfig, loadOffersFromInput, rowsToCsv, writeMarkdownReview, writeXlsx, DRAFT_COLUMNS } from './lib/outreach.mjs';
import { buildDraftRows, createDraftContext } from './lib/draft-engine.mjs';
import { isGeminiAvailable } from './plugins/gemini-draft.mjs';

const DRAFTS_DIR = path.join(RAVEN_ROOT, 'drafts');

function parseArgs(argv) {
  const args = argv.slice(2);
  const valueOf = (flag) => {
    const idx = args.indexOf(flag);
    if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) return args[idx + 1];
    const kv = args.find((a) => a.startsWith(`${flag}=`));
    return kv ? kv.split('=').slice(1).join('=') : null;
  };
  const logFlags = parseLogFlags(args);
  const input = valueOf('--input') || valueOf('--from');
  const hasDiscover = args.some((a) => ['--q', '--loc', '--since', '--sources', '--ats'].includes(a) || a.startsWith('--q='));
  return {
    input,
    output: valueOf('--output'),
    max: Math.min(500, Math.max(1, Number(valueOf('--max')) || 50)),
    xlsx: args.includes('--xlsx'),
    guessEmail: args.includes('--guess-email'),
    gemini: args.includes('--gemini'),
    refreshResume: args.includes('--refresh-resume'),
    markdown: !args.includes('--no-markdown'),
    discoverInline: !input && hasDiscover,
    discoverArgv: args,
    ...logFlags,
  };
}

function stripDraftFlags(args) {
  const skip = new Set([
    '--input', '--from', '--output', '--max', '--xlsx', '--guess-email', '--gemini',
    '--refresh-resume', '--no-markdown', '--verbose', '--quiet', '--log', '--no-log', '--json',
  ]);
  const out = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (skip.has(a)) {
      if (['--input', '--from', '--output', '--max'].includes(a) && args[i + 1] && !args[i + 1].startsWith('--')) i++;
      continue;
    }
    out.push(a);
  }
  return out;
}

function defaultOutputBase() {
  const date = new Date().toISOString().slice(0, 10);
  return path.join(DRAFTS_DIR, `outreach-${date}`);
}

async function loadOffers(opts, logger) {
  if (opts.input) {
    const resolved = path.resolve(opts.input);
    if (!fs.existsSync(resolved)) throw new Error(`Input not found: ${resolved}`);
    logger.info(`Loading jobs from ${resolved}`);
    return loadOffersFromInput(resolved);
  }

  if (opts.discoverInline) {
    logger.info('Running discover, then drafting…');
    const filters = parseDiscoverArgs(['node', 'discover.mjs', ...stripDraftFlags(opts.discoverArgv)]);
    filters.json = true;
    filters.quiet = opts.quiet;
    const discoverLogger = createLogger('discover', {
      json: true,
      quiet: opts.quiet,
      verbose: opts.verbose,
      log: opts.log,
      noLog: opts.noLog,
    });
    try {
      const { offers } = await discover(filters, discoverLogger, { stream: false, json: true, verbose: opts.verbose });
      return offers;
    } finally {
      discoverLogger.close();
    }
  }

  throw new Error('Provide --input PATH or discover flags (--q, --since, …)');
}

async function main() {
  const opts = parseArgs(process.argv);
  const logger = createLogger('draft', {
    json: opts.json,
    quiet: opts.quiet,
    verbose: opts.verbose,
    log: opts.log,
    noLog: opts.noLog,
  });

  try {
    try {
      const { config } = await import('dotenv');
      config({ path: path.join(RAVEN_ROOT, '.env') });
    } catch { /* optional */ }

    fs.mkdirSync(DRAFTS_DIR, { recursive: true });

    const profile = loadProfile();
    const legacyOutreach = loadOutreachConfig();

    if (opts.gemini && !isGeminiAvailable()) {
      logger.warn('GEMINI_API_KEY not set — using template drafts only');
      opts.gemini = false;
    } else if (opts.gemini) {
      logger.info('Gemini plugin enabled — review all AI drafts before sending');
    }

    const parsePhase = logger.phase('Parse resume');
    const ctx = await createDraftContext(profile, legacyOutreach, {
      useGemini: opts.gemini,
      guessEmail: opts.guessEmail,
      refreshResume: opts.refreshResume,
    });
    parsePhase.done({
      bullets: ctx.resume.highlights.length,
      skills: ctx.resume.skills.length,
    });

    const offers = await loadOffers(opts, logger);
    if (!offers.length) {
      logger.warn('No jobs to draft. Run discover first or check your filters.');
      process.exit(1);
    }

    const slice = offers.slice(0, opts.max);
    const draftPhase = logger.phase(`Draft ${slice.length} applications`);
    const rows = await buildDraftRows(slice, ctx);
    draftPhase.done({ rows: rows.length });

    const formCount = rows.filter((r) => r.application_type === 'form').length;
    const emailCount = rows.length - formCount;

    const base = opts.output ? path.resolve(opts.output).replace(/\.(csv|xlsx|md)$/i, '') : defaultOutputBase();
    const csvPath = `${base}.csv`;
    const mdPath = `${base}.md`;
    const xlsxPath = `${base}.xlsx`;

    fs.writeFileSync(csvPath, rowsToCsv(rows, DRAFT_COLUMNS), 'utf8');
    logger.info(`CSV:  ${csvPath}`);

    if (opts.markdown) {
      writeMarkdownReview(rows, mdPath, { count: rows.length, csvPath });
      logger.info(`Review: ${mdPath}`);
    }

    if (opts.xlsx) {
      writeXlsx(rows, xlsxPath);
      logger.info(`XLSX: ${xlsxPath}`);
    }

    logger.stat('drafts', rows.length);
    logger.stat('email', emailCount);
    logger.stat('form', formCount);
    logger.stat('ai', rows.filter((r) => r.ai_draft === 'yes').length);
    logger.summary();

    logger.info('Review every draft yourself before sending or submitting forms.');
    if (emailCount) {
      logger.info(`Email drafts: raven send --input ${path.relative(RAVEN_ROOT, csvPath)} --dry-run`);
    }
    if (formCount) {
      logger.info(`Form guides: open ${path.relative(RAVEN_ROOT, mdPath)} and follow form_steps per job`);
    }

    if (opts.json) {
      process.stdout.write(JSON.stringify({
        count: rows.length,
        emailCount,
        formCount,
        csv: csvPath,
        markdown: opts.markdown ? mdPath : null,
        xlsx: opts.xlsx ? xlsxPath : null,
        rows,
        log: logger.logPath,
      }, null, 2) + '\n');
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

export { main as draftOutreach };
