import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from './paths.mjs';

export const LOGS_DIR = path.join(DATA_DIR, 'logs');

/** Parse shared CLI logging flags from argv. */
export function parseLogFlags(args) {
  return {
    verbose: args.includes('--verbose') || process.env.RAVEN_VERBOSE === '1',
    quiet: args.includes('--quiet') || process.env.RAVEN_QUIET === '1',
    log: args.includes('--log') || process.env.RAVEN_LOG === '1',
    noLog: args.includes('--no-log'),
    json: args.includes('--json'),
    stream: args.includes('--stream'),
  };
}

/** Strip logging-only flags before forwarding argv to child scripts. */
export function stripLogFlags(args) {
  const skip = new Set(['--verbose', '--quiet', '--log', '--no-log']);
  const out = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (skip.has(a)) continue;
    if (a.startsWith('--') && skip.has(a.split('=')[0])) continue;
    out.push(a);
  }
  return out;
}

function formatMs(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem ? `${m}m ${rem}s` : `${m}m`;
}

function formatMeta(meta) {
  return Object.entries(meta)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${v}`)
    .join(', ');
}

/**
 * @param {string} command  e.g. "discover", "sync-jobs"
 * @param {object} opts
 * @param {boolean} [opts.json]     stdout is JSON — human lines go to stderr
 * @param {boolean} [opts.quiet]    errors + summary only
 * @param {boolean} [opts.verbose]  extra detail
 * @param {boolean} [opts.log]      force log file
 * @param {boolean} [opts.noLog]    disable log file
 */
export function createLogger(command, opts = {}) {
  const started = Date.now();
  const json = Boolean(opts.json);
  const quiet = Boolean(opts.quiet);
  const verbose = Boolean(opts.verbose);
  const wantFile = !opts.noLog && (opts.log || !json);

  const stats = {
    command,
    startedAt: new Date().toISOString(),
    phases: [],
    counters: {},
    errors: [],
  };

  let logPath = null;
  /** @type {import('fs').WriteStream | null} */
  let logStream = null;

  if (wantFile) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    logPath = path.join(LOGS_DIR, `${command}-${stamp}.log`);
    logStream = fs.createWriteStream(logPath, { flags: 'a' });
    logStream.write(`# Raven ${command} — ${stats.startedAt}\n`);
  }

  function write(level, msg) {
    const ts = new Date().toISOString().slice(11, 19);
    const prefix = level === 'info' ? `[${ts}]` : `[${ts}] ${level.toUpperCase()}`;
    const line = `${prefix} ${msg}`;
    if (logStream) logStream.write(`${line}\n`);
    if (quiet && level === 'info') return;
    const out = json ? console.error : console.log;
    if (level === 'error') console.error(line);
    else out(line);
  }

  return {
    stats,
    logPath,

    info(msg) { write('info', msg); },
    warn(msg) { stats.errors.push(msg); write('warn', msg); },
    error(msg) { stats.errors.push(msg); write('error', msg); },
    verbose(msg) { if (verbose) write('info', msg); },

    /** Forward subprocess stderr/stdout into log + terminal. */
    pipe(chunk) {
      const text = chunk.toString();
      if (logStream) logStream.write(text);
      if (quiet) return;
      process.stderr.write(text);
    },

    stat(key, value) {
      stats.counters[key] = value;
    },

    phase(name) {
      const phaseStart = Date.now();
      const phase = { name, startedAt: new Date().toISOString() };
      stats.phases.push(phase);
      if (!quiet) write('info', `▶ ${name}…`);
      return {
        done(meta = {}) {
          const elapsedMs = Date.now() - phaseStart;
          Object.assign(phase, { ...meta, elapsedMs, status: 'ok' });
          if (!quiet) {
            const detail = formatMeta(meta);
            write('info', `✓ ${name}${detail ? ` — ${detail}` : ''} (${formatMs(elapsedMs)})`);
          }
        },
        fail(errMsg, meta = {}) {
          const elapsedMs = Date.now() - phaseStart;
          Object.assign(phase, { ...meta, elapsedMs, status: 'failed', error: errMsg });
          stats.errors.push(`${name}: ${errMsg}`);
          write('warn', `✗ ${name} — ${errMsg} (${formatMs(elapsedMs)})`);
        },
        skip(reason, meta = {}) {
          const elapsedMs = Date.now() - phaseStart;
          Object.assign(phase, { ...meta, elapsedMs, status: 'skipped', reason });
          if (!quiet) write('info', `○ ${name} — ${reason} (${formatMs(elapsedMs)})`);
        },
      };
    },

    /** Print a stats block and return the stats object. */
    summary(extra = {}) {
      const elapsedMs = Date.now() - started;
      const merged = { ...stats, elapsedMs, logPath, ...extra };

      if (quiet) {
        const ts = new Date().toISOString().slice(11, 19);
        const counterBits = [];
        if (merged.counters?.uniqueMatches != null) counterBits.push(`${merged.counters.uniqueMatches} matches`);
        else if (merged.counters?.matches != null) counterBits.push(`${merged.counters.matches} matches`);
        const line = `[${ts}] ${command}: ${formatMs(elapsedMs)}${counterBits.length ? ` | ${counterBits.join(', ')}` : ''}`;
        if (logStream) logStream.write(`${line}\n`);
        console.log(line);
        if (logPath) console.log(`[${ts}] Log: ${logPath}`);
      } else {
        write('info', '─'.repeat(48));
        write('info', `${command} summary (${formatMs(elapsedMs)})`);
        for (const p of stats.phases) {
          const detail = formatMeta({
            ...(p.matches != null ? { matches: p.matches } : {}),
            ...(p.companiesScanned != null ? { companies: p.companiesScanned } : {}),
            ...(p.rows != null ? { rows: p.rows } : {}),
            ...(p.status && p.status !== 'ok' ? { status: p.status } : {}),
          });
          write('info', `  ${p.name}: ${formatMs(p.elapsedMs || 0)}${detail ? ` (${detail})` : ''}`);
        }
        const counterLine = formatMeta(stats.counters);
        if (counterLine) write('info', `  totals: ${counterLine}`);
        if (stats.errors.length) write('warn', `  warnings: ${stats.errors.length}`);
        write('info', '─'.repeat(48));
      }

      if (logPath) write('info', `Log: ${logPath}`);
      return merged;
    },

    close() {
      logStream?.end();
    },
  };
}
