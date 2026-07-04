#!/usr/bin/env node

/**
 * sync-openjobdata.mjs — Sync openjobdata HuggingFace Parquet deltas into SQLite.
 *
 * Public bucket: Invicto69/Jobs-Dataset-bucket (no token required).
 * Starts with daily minimal deltas; optionally backfills from base shards with --full.
 *
 * Usage:
 *   node sync-openjobdata.mjs
 *   node sync-openjobdata.mjs --days 3
 *   node sync-openjobdata.mjs --export-ats
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'url';
import { downloadFile } from '@huggingface/hub';
import {
  CACHE_DIR,
  DATA_DIR,
  JOBS_DB_PATH,
  OPENJOBDATA_SYNC_CHECKPOINT,
} from './lib/paths.mjs';
import { createLogger, parseLogFlags } from './lib/log.mjs';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

const BUCKET_REPO = 'Invicto69/Jobs-Dataset-bucket';

function parseArgs(argv) {
  const args = argv.slice(2);
  const valueOf = (flag) => {
    const idx = args.indexOf(flag);
    if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) return args[idx + 1];
    const kv = args.find((a) => a.startsWith(`${flag}=`));
    return kv ? kv.split('=').slice(1).join('=') : null;
  };
  return {
    days: Math.max(1, Number(valueOf('--days')) || 2),
    exportAts: args.includes('--export-ats') || !args.includes('--no-export-ats'),
    full: args.includes('--full'),
    ...parseLogFlags(args),
  };
}

function hfAccessToken() {
  return process.env.HF_TOKEN || process.env.HUGGING_FACE_HUB_TOKEN || undefined;
}

async function fetchBuffer(relPath) {
  try {
    const blob = await downloadFile({
      repo: BUCKET_REPO,
      path: relPath.replace(/^\/+/, ''),
      repoType: 'bucket',
      accessToken: hfAccessToken(),
    });
    return Buffer.from(await blob.arrayBuffer());
  } catch (err) {
    throw new Error(`${err.message}${!hfAccessToken() ? ' (try setting HF_TOKEN if the bucket requires auth)' : ''}`);
  }
}

async function readParquetRecords(buffer) {
  const parquet = require('parquetjs-lite');
  const reader = await parquet.ParquetReader.openBuffer(buffer);
  const cursor = reader.getCursor();
  const rows = [];
  let row;
  while ((row = await cursor.next())) rows.push(row);
  await reader.close();
  return rows;
}

function initDb(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY,
      name TEXT,
      website TEXT,
      ats TEXT,
      slug TEXT,
      unique_id TEXT,
      career_url TEXT,
      country TEXT,
      industry TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_companies_ats ON companies(ats);

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      job_id TEXT,
      company_id INTEGER,
      title TEXT,
      department TEXT,
      employment_type TEXT,
      workplace_type TEXT,
      country TEXT,
      is_remote INTEGER,
      posted_at TEXT,
      apply_url TEXT,
      status TEXT,
      ats TEXT,
      fetched_time TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
    CREATE INDEX IF NOT EXISTS idx_jobs_posted ON jobs(posted_at);
    CREATE INDEX IF NOT EXISTS idx_jobs_ats ON jobs(ats);
  `);

  const upsertCompany = db.prepare(`
    INSERT INTO companies (id, name, website, ats, slug, unique_id, career_url, country, industry)
    VALUES (@id, @name, @website, @ats, @slug, @unique_id, @career_url, @country, @industry)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name, website=excluded.website, ats=excluded.ats, slug=excluded.slug,
      unique_id=excluded.unique_id, career_url=excluded.career_url, country=excluded.country,
      industry=excluded.industry
  `);

  const upsertJob = db.prepare(`
    INSERT INTO jobs (id, job_id, company_id, title, department, employment_type, workplace_type,
      country, is_remote, posted_at, apply_url, status, ats, fetched_time)
    VALUES (@id, @job_id, @company_id, @title, @department, @employment_type, @workplace_type,
      @country, @is_remote, @posted_at, @apply_url, @status, @ats, @fetched_time)
    ON CONFLICT(id) DO UPDATE SET
      title=excluded.title, department=excluded.department, employment_type=excluded.employment_type,
      workplace_type=excluded.workplace_type, country=excluded.country, is_remote=excluded.is_remote,
      posted_at=excluded.posted_at, apply_url=excluded.apply_url, status=excluded.status,
      ats=excluded.ats, fetched_time=excluded.fetched_time
  `);

  return { upsertCompany, upsertJob };
}

function normalizeCompany(row) {
  return {
    id: row.id,
    name: row.name || '',
    website: row.website || '',
    ats: (row.ats || '').toLowerCase(),
    slug: row.slug || '',
    unique_id: row.unique_id || '',
    career_url: row.career_url || '',
    country: row.country || '',
    industry: row.industry || '',
  };
}

function normalizeJob(row, companyAts = '') {
  const posted = row.posted_at instanceof Date
    ? row.posted_at.toISOString()
    : (row.posted_at ? String(row.posted_at) : '');
  const fetched = row.fetched_time instanceof Date
    ? row.fetched_time.toISOString()
    : (row.fetched_time ? String(row.fetched_time) : '');
  return {
    id: String(row.id || ''),
    job_id: String(row.job_id || ''),
    company_id: row.company_id ?? null,
    title: row.title || '',
    department: row.department || '',
    employment_type: row.employment_type || '',
    workplace_type: row.workplace_type || '',
    country: row.country || '',
    is_remote: row.is_remote ? 1 : 0,
    posted_at: posted,
    apply_url: row.apply_url || '',
    status: row.status || 'active',
    ats: (row.ats || companyAts || '').toLowerCase(),
    fetched_time: fetched,
  };
}

function slugFromCareerUrl(careerUrl, ats) {
  if (!careerUrl) return null;
  try {
    const u = new URL(careerUrl);
    const parts = u.pathname.split('/').filter(Boolean);
    switch (ats) {
      case 'greenhouse':
        if (u.hostname.includes('greenhouse.io')) return parts[0] || null;
        break;
      case 'lever':
        if (u.hostname === 'jobs.lever.co') return parts[0] || null;
        break;
      case 'ashby':
        if (u.hostname === 'jobs.ashbyhq.com') return parts[0] || null;
        break;
      case 'rippling':
        if (u.hostname === 'ats.rippling.com') return parts[0] || null;
        break;
      case 'workable':
        if (u.hostname === 'apply.workable.com') return parts[0] || null;
        break;
      case 'bamboohr':
        if (u.hostname.endsWith('.bamboohr.com')) return u.hostname.split('.')[0];
        break;
      case 'smartrecruiters':
        if (u.hostname.includes('smartrecruiters.com')) return parts[0] || null;
        break;
      case 'recruitee':
        if (u.hostname.endsWith('.recruitee.com')) return u.hostname.split('.')[0];
        break;
      case 'pinpoint':
        if (u.hostname.endsWith('.pinpointhq.com')) return u.hostname.split('.')[0];
        break;
      case 'teamtailor':
        if (u.hostname.endsWith('.teamtailor.com')) return u.hostname.split('.')[0];
        break;
      case 'personio':
        if (u.hostname.includes('personio')) return u.hostname.split('.')[0];
        break;
      case 'workday':
        if (u.hostname.endsWith('.myworkdayjobs.com')) {
          const [tenant, instance] = u.hostname.split('.');
          const site = parts[0] || 'External';
          return `${tenant}|${instance}|${site}`;
        }
        break;
      default:
        return parts[0] || u.hostname.split('.')[0] || null;
    }
  } catch {
    return null;
  }
  return null;
}

function exportAtsCompanyLists(db) {
  const atsDir = path.join(CACHE_DIR, 'ats-companies');
  fs.mkdirSync(atsDir, { recursive: true });
  const rows = db.prepare(`
    SELECT ats, slug, career_url, name FROM companies WHERE ats IS NOT NULL AND ats != ''
  `).all();
  /** @type {Record<string, Set<string>>} */
  const byAts = {};
  for (const row of rows) {
    const ats = String(row.ats).toLowerCase();
    let slug = row.slug || slugFromCareerUrl(row.career_url, ats);
    if (!slug) continue;
    if (!byAts[ats]) byAts[ats] = new Set();
    byAts[ats].add(String(slug));
  }
  for (const [ats, slugs] of Object.entries(byAts)) {
    const list = [...slugs].sort();
    fs.writeFileSync(path.join(atsDir, `${ats}.json`), JSON.stringify(list), 'utf8');
  }
  return Object.fromEntries(Object.entries(byAts).map(([k, v]) => [k, v.size]));
}

function dateRange(days) {
  const out = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

async function main() {
  const opts = parseArgs(process.argv);
  const logger = createLogger('sync-jobs', {
    json: opts.json,
    quiet: opts.quiet,
    verbose: opts.verbose,
    log: opts.log,
    noLog: opts.noLog,
  });

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  const db = new Database(JOBS_DB_PATH);
  const { upsertCompany, upsertJob } = initDb(db);

  let companiesUpserted = 0;
  const companiesPhase = logger.phase('Companies registry');
  try {
    const companiesBuf = await fetchBuffer('data/companies/companies.parquet');
    const companies = await readParquetRecords(companiesBuf);
    const tx = db.transaction((rows) => {
      for (const row of rows) upsertCompany.run(normalizeCompany(row));
    });
    tx(companies);
    companiesUpserted = companies.length;
    companiesPhase.done({ rows: companiesUpserted });
  } catch (err) {
    companiesPhase.fail(err.message);
  }

  const companyAts = new Map(
    db.prepare('SELECT id, ats FROM companies').all().map((r) => [r.id, r.ats]),
  );

  let jobsSynced = 0;
  let deltasOk = 0;
  let deltasMiss = 0;
  const deltaPhase = logger.phase(`Daily deltas (${opts.days} days)`);
  for (const day of dateRange(opts.days)) {
    const rel = `data/minimal/changes/${day}.parquet`;
    logger.verbose(`  checking ${day}…`);
    try {
      const buf = await fetchBuffer(rel);
      const rows = await readParquetRecords(buf);
      const tx = db.transaction((items) => {
        for (const row of items) {
          const ats = companyAts.get(row.company_id) || '';
          upsertJob.run(normalizeJob(row, ats));
        }
      });
      tx(rows);
      jobsSynced += rows.length;
      deltasOk++;
      logger.verbose(`  ${day}: ${rows.length} rows`);
    } catch (err) {
      deltasMiss++;
      logger.verbose(`  ${day}: no delta (${err.message})`);
    }
  }
  deltaPhase.done({ rows: jobsSynced, deltasOk, deltasMiss });

  let atsExport = {};
  if (opts.exportAts) {
    const exportPhase = logger.phase('Export ATS company lists');
    atsExport = exportAtsCompanyLists(db);
    const totalSlugs = Object.values(atsExport).reduce((n, v) => n + v, 0);
    exportPhase.done({ platforms: Object.keys(atsExport).length, slugs: totalSlugs });
    logger.verbose(`  exported: ${Object.keys(atsExport).join(', ')}`);
  }

  fs.writeFileSync(OPENJOBDATA_SYNC_CHECKPOINT, JSON.stringify({
    syncedAt: new Date().toISOString(),
    jobsSynced,
    companiesUpserted,
    atsExport,
  }, null, 2), 'utf8');

  logger.stat('companies', companiesUpserted);
  logger.stat('jobRows', jobsSynced);
  logger.info(`Index: ${JOBS_DB_PATH}`);
  logger.summary();

  if (opts.json) {
    process.stdout.write(JSON.stringify({
      companiesUpserted,
      jobsSynced,
      deltasOk,
      deltasMiss,
      atsExport,
      dbPath: JOBS_DB_PATH,
      log: logger.logPath,
    }, null, 2) + '\n');
  }

  db.close();
  logger.close();
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  main().catch((err) => {
    console.error('Fatal:', err.message);
    process.exit(1);
  });
}

export { initDb, slugFromCareerUrl, exportAtsCompanyLists };
