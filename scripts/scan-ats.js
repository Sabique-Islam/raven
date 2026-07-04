#!/usr/bin/env node
/**
 * scan-ats.js — Live ATS reverse scan (Greenhouse, Lever, Ashby, Workday, …).
 *
 * Walks public company directories and hits each platform's zero-auth API.
 * Uses filters from a temporary config built from your CLI flags (or config/portals.yml
 * when you pass --use-portals).
 *
 * Usage:
 *   node scripts/scan-ats.js --q "software engineer" --since 7
 *   node scripts/scan-ats.js --q engineer --ats greenhouse,lever --limit 100 --json
 *   node scripts/scan-ats.js --use-portals --dry-run
 *
 * Flags (passed through to jobs/scan-ats-full.mjs):
 *   --q, --not, --loc, --noloc, --home   Filter keywords (unless --use-portals)
 *   --since N          Postings from last N days (default: 3 in scanner, 7 via discover)
 *   --ats              Comma-separated ATS list (default: all supported)
 *   --limit N          Max companies per ATS
 *   --dry-run          Preview without writing data/pipeline.md
 *   --json             Machine-readable stdout
 *   --verbose          Log per-board fetch failures
 *   --use-portals      Use config/portals.yml filters instead of CLI flags
 *   --help             Show this help
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { loadEnv, runJobs, hasHelp, requireSetup, printBlock, ROOT } = require('./_lib');

function buildTempPortals(argv) {
  if (argv.includes('--use-portals')) return null;

  const valueOf = (flag) => {
    const idx = argv.indexOf(flag);
    if (idx !== -1 && argv[idx + 1] && !argv[idx + 1].startsWith('--')) return argv[idx + 1];
    return null;
  };
  const split = (v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : []);

  const positive = split(valueOf('--q'));
  const negative = split(valueOf('--not'));
  const allow = split(valueOf('--loc'));
  const block = split(valueOf('--noloc'));
  const alwaysAllow = split(valueOf('--home'));

  let out = '# Ephemeral scan-ats filters\n';
  const blockYaml = (key, items) =>
    items.length ? `  ${key}:\n${items.map((k) => `    - ${JSON.stringify(k)}`).join('\n')}\n` : '';

  if (positive.length || negative.length) {
    out += 'title_filter:\n';
    out += blockYaml('positive', positive);
    out += blockYaml('negative', negative);
  }
  if (allow.length || block.length || alwaysAllow.length) {
    out += 'location_filter:\n';
    out += blockYaml('always_allow', alwaysAllow);
    out += blockYaml('allow', allow);
    out += blockYaml('block', block);
  }

  const file = path.join(os.tmpdir(), `raven-scan-ats-${Date.now()}.yml`);
  fs.writeFileSync(file, out, 'utf8');
  return file;
}

function stripFilterFlags(argv) {
  const skip = new Set(['--q', '--not', '--loc', '--noloc', '--home', '--use-portals']);
  const out = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (skip.has(a)) {
      i++;
      continue;
    }
    if (['--q=', '--not=', '--loc=', '--noloc=', '--home='].some((p) => a.startsWith(p))) continue;
    out.push(a);
  }
  return out;
}

function showHelp() {
  printBlock('scan-ats.js — live ATS scan', [
    'Examples:',
    '  node scripts/scan-ats.js --q "software engineer" --since 7 --dry-run',
    '  node scripts/scan-ats.js --q engineer --ats greenhouse,lever,ashby --json',
    '  node scripts/scan-ats.js --use-portals --dry-run',
    '',
    'Supported ATS: greenhouse, lever, ashby, workday, rippling, workable,',
    '  bamboohr, smartrecruiters, recruitee, pinpoint, teamtailor, personio',
  ]);
}

function main() {
  const argv = process.argv.slice(2);
  if (hasHelp(argv)) {
    showHelp();
    return;
  }

  loadEnv();
  requireSetup();

  const tempPortals = buildTempPortals(argv);
  const forward = stripFilterFlags(argv);
  if (!forward.includes('--dry-run') && !forward.includes('--json')) {
    forward.push('--dry-run');
  }
  if (!forward.some((a) => a === '--since' || a.startsWith('--since='))) {
    forward.push('--since', '7');
  }

  const env = { ...process.env };
  if (tempPortals) env.RAVEN_PORTALS = tempPortals;
  else if (!env.RAVEN_PORTALS) env.RAVEN_PORTALS = path.join(ROOT, 'config', 'portals.yml');

  const { spawnSync } = require('child_process');
  const script = path.join(ROOT, 'jobs', 'scan-ats-full.mjs');
  const result = spawnSync(process.execPath, [script, ...forward], {
    cwd: ROOT,
    stdio: 'inherit',
    env,
  });

  if (tempPortals) {
    try { fs.unlinkSync(tempPortals); } catch { /* ignore */ }
  }

  process.exit(result.status ?? 1);
}

main();
