#!/usr/bin/env node
/**
 * scan-boards.js — Board feed scan (RemoteOK, Remotive, Arbeitnow, Landing.jobs).
 *
 * Faster than a full ATS walk; good for remote-first roles.
 *
 * Usage:
 *   node scripts/scan-boards.js --q "software engineer"
 *   node scripts/scan-boards.js --q engineer --loc Remote --json
 *   node scripts/scan-boards.js --use-portals
 *
 * Flags:
 *   --q, --not, --loc, --noloc, --home   Filters (unless --use-portals)
 *   --dry-run          Preview only (default unless you pass --save)
 *   --save             Write matches to data/pipeline.md
 *   --json             Machine-readable stdout
 *   --use-portals      Use config/portals.yml (includes job_boards list)
 *   --help             Show this help
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { loadEnv, hasHelp, requireSetup, printBlock, ROOT } = require('./_lib');

const DEFAULT_BOARDS = [
  { name: 'RemoteOK', provider: 'remoteok', enabled: true },
  { name: 'Remotive', provider: 'remotive', enabled: true },
  { name: 'Arbeitnow', provider: 'arbeitnow', enabled: true },
  { name: 'Landing.jobs', provider: 'landingjobs', enabled: true },
];

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

  let out = '# Ephemeral scan-boards filters\n';
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

  out += 'job_boards:\n';
  for (const board of DEFAULT_BOARDS) {
    out += `  - name: ${JSON.stringify(board.name)}\n`;
    out += `    provider: ${JSON.stringify(board.provider)}\n`;
    out += `    enabled: true\n`;
  }

  const file = path.join(os.tmpdir(), `raven-scan-boards-${Date.now()}.yml`);
  fs.writeFileSync(file, out, 'utf8');
  return file;
}

function stripFilterFlags(argv) {
  const skip = new Set(['--q', '--not', '--loc', '--noloc', '--home', '--use-portals', '--save']);
  const out = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (skip.has(a)) {
      if (['--q', '--not', '--loc', '--noloc', '--home'].includes(a)) i++;
      continue;
    }
    if (['--q=', '--not=', '--loc=', '--noloc=', '--home='].some((p) => a.startsWith(p))) continue;
    out.push(a);
  }
  return out;
}

function showHelp() {
  printBlock('scan-boards.js — board feed scan', [
    'Examples:',
    '  node scripts/scan-boards.js --q "software engineer"',
    '  node scripts/scan-boards.js --q engineer --loc Remote --json',
    '  node scripts/scan-boards.js --use-portals --save',
    '',
    'Boards: RemoteOK, Remotive, Arbeitnow, Landing.jobs',
    'Edit config/portals.yml job_boards to customize when using --use-portals.',
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
  let forward = stripFilterFlags(argv);
  forward.push('--boards-only');

  const save = argv.includes('--save');
  if (!save && !forward.includes('--dry-run')) forward.push('--dry-run');
  if (!forward.includes('--json')) forward.push('--json');

  const env = { ...process.env };
  if (tempPortals) env.RAVEN_PORTALS = tempPortals;
  else if (!env.RAVEN_PORTALS) env.RAVEN_PORTALS = path.join(ROOT, 'config', 'portals.yml');

  const { spawnSync } = require('child_process');
  const script = path.join(ROOT, 'jobs', 'scan.mjs');
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
