/**
 * Shared helpers for Raven CLI scripts.
 * All user-facing commands live in scripts/ — import this module, don't duplicate spawn logic.
 */

const { spawnSync, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/** Absolute path to the Raven repo root (parent of scripts/). */
const ROOT = path.join(__dirname, '..');

/** Load .env from repo root if present. Safe before npm install. */
function loadEnv() {
  try {
    require('dotenv').config({ path: path.join(ROOT, '.env') });
  } catch {
    /* dotenv not installed yet — run node scripts/setup.js */
  }
}

/** Run an ESM script under jobs/ and forward exit code. */
function runJobs(relativePath, args = [], opts = {}) {
  const script = path.join(ROOT, 'jobs', relativePath);
  if (!fs.existsSync(script)) {
    console.error(`Missing jobs script: ${relativePath}`);
    console.error('Run: node scripts/setup.js');
    process.exit(1);
  }
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, ...(opts.env || {}) },
  });
  process.exit(result.status ?? 1);
}

/** Run any script relative to repo root. */
function runRoot(relativePath, args = []) {
  const script = path.join(ROOT, relativePath);
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
  });
  process.exit(result.status ?? 1);
}

function hasHelp(argv) {
  return argv.includes('--help') || argv.includes('-h');
}

function jobsInstalled() {
  return fs.existsSync(path.join(ROOT, 'jobs', 'node_modules'));
}

function rootInstalled() {
  return fs.existsSync(path.join(ROOT, 'node_modules'));
}

/** Install npm deps in root and jobs/ if missing. */
function ensureInstalled({ quiet = false } = {}) {
  if (!rootInstalled()) {
    if (!quiet) console.log('Installing root dependencies…');
    execSync('npm install', { cwd: ROOT, stdio: 'inherit' });
  }
  if (!jobsInstalled()) {
    if (!quiet) console.log('Installing jobs/ dependencies…');
    execSync('npm install', { cwd: path.join(ROOT, 'jobs'), stdio: 'inherit' });
  }
}

/** Seed config files on first run. */
function ensureConfig({ quiet = false } = {}) {
  fs.mkdirSync(path.join(ROOT, 'data', 'cache'), { recursive: true });

  const envExample = path.join(ROOT, '.env.example');
  const envFile = path.join(ROOT, '.env');
  if (!fs.existsSync(envFile) && fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envFile);
    if (!quiet) console.log('Created .env from .env.example — fill in your credentials.');
  }

  const portalsFile = path.join(ROOT, 'config', 'portals.yml');
  const portalsExample = path.join(ROOT, 'config', 'portals.example.yml');
  if (!fs.existsSync(portalsFile) && fs.existsSync(portalsExample)) {
    fs.copyFileSync(portalsExample, portalsFile);
    if (!quiet) console.log('Created config/portals.yml from example — edit your search filters.');
  }

  const outreachFile = path.join(ROOT, 'config', 'outreach.yml');
  const outreachExample = path.join(ROOT, 'config', 'outreach.example.yml');
  if (!fs.existsSync(outreachFile) && fs.existsSync(outreachExample)) {
    fs.copyFileSync(outreachExample, outreachFile);
    if (!quiet) console.log('Created config/outreach.yml from example — edit your email template.');
  }

  const profileFile = path.join(ROOT, 'config', 'profile.yml');
  const profileExample = path.join(ROOT, 'config', 'profile.example.yml');
  if (!fs.existsSync(profileFile) && fs.existsSync(profileExample)) {
    fs.copyFileSync(profileExample, profileFile);
    if (!quiet) console.log('Created config/profile.yml — add your name, links, and resume path.');
  }

  const resumeFile = path.join(ROOT, 'files', 'resume.md');
  const resumeExample = path.join(ROOT, 'files', 'resume.example.md');
  if (!fs.existsSync(resumeFile) && fs.existsSync(resumeExample)) {
    fs.copyFileSync(resumeExample, resumeFile);
    if (!quiet) console.log('Created files/resume.md from example — replace with your resume.');
  }
}

function requireSetup() {
  if (!jobsInstalled() || !rootInstalled()) {
    console.error('Dependencies not installed. Run:\n\n  node scripts/setup.js\n');
    process.exit(1);
  }
}

function printBlock(title, lines) {
  console.log(`\n${title}\n${'─'.repeat(title.length)}`);
  for (const line of lines) console.log(line);
  console.log('');
}

module.exports = {
  ROOT,
  loadEnv,
  runJobs,
  runRoot,
  hasHelp,
  ensureInstalled,
  ensureConfig,
  requireSetup,
  printBlock,
};
