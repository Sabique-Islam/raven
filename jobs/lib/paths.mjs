import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Absolute path to the jobs/ package root. */
export const JOBS_ROOT = path.resolve(__dirname, '..');

/** Absolute path to the Raven repo root (parent of jobs/). */
export const RAVEN_ROOT = path.resolve(JOBS_ROOT, '..');

export const DATA_DIR = path.join(RAVEN_ROOT, 'data');
export const CACHE_DIR = path.join(DATA_DIR, 'cache');
export const CONFIG_DIR = path.join(RAVEN_ROOT, 'config');
export const PROVIDERS_DIR = path.join(JOBS_ROOT, 'providers');

export const PORTALS_PATH = process.env.RAVEN_PORTALS || path.join(CONFIG_DIR, 'portals.yml');
export const PROFILE_PATH = process.env.RAVEN_PROFILE || path.join(CONFIG_DIR, 'profile.yml');
export const JOBS_DB_PATH = process.env.RAVEN_JOBS_DB || path.join(DATA_DIR, 'jobs.db');
export const SCAN_HISTORY_PATH = path.join(DATA_DIR, 'scan-history.tsv');
export const PIPELINE_PATH = path.join(DATA_DIR, 'pipeline.md');
export const APPLICATIONS_PATH = path.join(DATA_DIR, 'applications.md');
export const OPENJOBDATA_SYNC_CHECKPOINT = path.join(CACHE_DIR, 'openjobdata-last-sync.json');
