#!/usr/bin/env node
/**
 * send-prewritten.js — Send outreach emails from a CSV or XLSX file.
 *
 * Each row needs: contact_email (or email), subject, body.
 * Attachments: drop files in files/ at repo root (attached to every email).
 *
 * Usage:
 *   node scripts/send-prewritten.js --input drafts/contacts.csv --dry-run
 *   node scripts/send-prewritten.js --input contacts.xlsx --provider gmail --delay 60
 *   node scripts/send-prewritten.js --input contacts.csv --provider outlook --limit 20
 *   node scripts/send-prewritten.js --help
 *
 * Setup (once):
 *   node scripts/setup.js
 *   node scripts/auth-gmail.js     # or auth-outlook.js
 *
 * Flags:
 *   --input PATH     CSV or XLSX (default: contacts.csv)
 *   --provider       gmail | outlook (default: gmail)
 *   --limit N        Max emails to send (default: 9999)
 *   --delay N        Seconds between sends (default: 30)
 *   --cc ADDRESS     CC all emails to this address
 *   --dry-run        Preview without sending
 *   --help           Show this help
 */

const { hasHelp, printBlock, loadEnv } = require('./_lib');

function showHelp() {
  printBlock('send-prewritten.js — bulk email outreach', [
    'CSV columns: contact_email (or email), subject, body',
    'Example:     drafts/example_emails.csv',
    '',
    'Examples:',
    '  node scripts/send-prewritten.js --input drafts/contacts.csv --dry-run',
    '  node scripts/send-prewritten.js --input contacts.csv --delay 60',
    '  node scripts/send-prewritten.js --provider outlook --limit 20',
    '',
    'Requires .env: SENDER_NAME, SENDER_EMAIL, and OAuth tokens from auth-gmail.js',
  ]);
}

if (hasHelp(process.argv.slice(2))) {
  showHelp();
  process.exit(0);
}

loadEnv();

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const xlsx = require('xlsx');

function readInput(filePath) {
  const normalizedPath = path.resolve(filePath);
  if (!normalizedPath.startsWith(process.cwd())) {
    console.error('Security Error: Input file must be within the current working directory.');
    process.exit(1);
  }
  const ext = path.extname(normalizedPath).toLowerCase();
  if (ext === '.xlsx' || ext === '.xls') {
    const wb = xlsx.readFile(normalizedPath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    return xlsx.utils.sheet_to_json(ws);
  }
  return parse(fs.readFileSync(normalizedPath, 'utf-8'), { columns: true, skip_empty_lines: true });
}

function parseArgs() {
  const args = process.argv.slice(2);
  const get = flag => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };
  return {
    input: get('--input') || 'contacts.csv',
    limit: parseInt(get('--limit') || '9999', 10),
    dryRun: args.includes('--dry-run'),
    delaySeconds: parseInt(get('--delay') || '30', 10),
    cc: get('--cc') || null,
    provider: get('--provider') || 'gmail',
  };
}

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose');
  const quiet = args.includes('--quiet');
  const noLog = args.includes('--no-log');
  const { input, limit, dryRun, delaySeconds, cc, provider } = parseArgs();

  const logsDir = path.join(__dirname, '..', 'data', 'logs');
  let logPath = null;
  let logStream = null;
  if (!noLog) {
    fs.mkdirSync(logsDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    logPath = path.join(logsDir, `send-${stamp}.log`);
    logStream = fs.createWriteStream(logPath, { flags: 'a' });
  }

  const started = Date.now();
  const log = (msg) => {
    const line = `[${new Date().toISOString().slice(11, 19)}] ${msg}`;
    if (logStream) logStream.write(`${line}\n`);
    if (!quiet) console.log(line);
  };
  const logErr = (msg) => {
    const line = `[${new Date().toISOString().slice(11, 19)}] ERROR ${msg}`;
    if (logStream) logStream.write(`${line}\n`);
    console.error(line);
  };

  const senderName = process.env.SENDER_NAME;
  const senderEmail = process.env.SENDER_EMAIL;
  if (!senderName || !senderEmail) { logErr('Missing SENDER_NAME or SENDER_EMAIL in .env'); process.exit(1); }

  if (!fs.existsSync(input)) { logErr(`File not found: ${input}`); process.exit(1); }

  let refreshToken, getToken, sendEmail;
  if (provider === 'outlook') {
    ({ refreshToken, getToken } = require('../src/outlook-auth'));
    ({ sendEmail } = require('../src/outlook-sender'));
  } else {
    ({ refreshToken, getToken } = require('../src/gmail-auth'));
    ({ sendEmail } = require('../src/gmail-sender'));
  }

  const rows = readInput(input);
  const batch = rows.slice(0, limit);

  if (!dryRun) {
    log(`Refreshing ${provider} token…`);
    await refreshToken();
    log('Token ready.');
  }

  log(`Sending ${batch.length} emails via ${provider} (${dryRun ? 'DRY RUN' : 'LIVE'})…`);

  let sent = 0, failed = 0;

    for (let i = 0; i < batch.length; i++) {
    const row = batch[i];
    const to = String(row.contact_email || row.email || '').trim();
    const subject = String(row.subject || '').trim();
    const body = String(row.body || '').trim();

    if (!to || !subject || !body) {
      log(`[${i + 1}/${batch.length}] Skipping — missing field`);
      failed++;
      continue;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      log(`[${i + 1}/${batch.length}] Skipping — invalid email: ${to}`);
      failed++;
      continue;
    }

    log(`[${i + 1}/${batch.length}] → ${to}`);
    if (verbose) log(`  Subject: ${subject}`);

    if (dryRun) { if (verbose) log('  [dry-run] skipped'); sent++; continue; }

    const filesDir = path.resolve('files');
    const attachments = fs.existsSync(filesDir)
      ? fs.readdirSync(filesDir)
          .filter(f => !f.startsWith('.'))
          .map(f => path.join(filesDir, f))
          .filter(f => {
            const resolvedPath = path.resolve(f);
            return resolvedPath.startsWith(filesDir) && fs.statSync(resolvedPath).isFile();
          })
      : [];

    const { outcome } = await sendEmail(getToken(), null, { from: senderEmail, to, subject, body, ...(cc ? { cc } : {}), ...(attachments.length ? { attachments } : {}) });

    if (outcome === 'sent') {
      if (verbose) log('  Sent.');
      sent++;
    } else if (outcome === 'halt') {
      logErr(`${provider} auth error — halting.`);
      break;
    } else {
      log(`  Failed: ${outcome}`);
      failed++;
    }

    if (i < batch.length - 1 && outcome === 'sent') {
      if (!quiet) process.stdout.write(`  Waiting ${delaySeconds}s...\r`);
      await new Promise(r => setTimeout(r, delaySeconds * 1000));
      if (!quiet) process.stdout.write('                    \r');
    }
  }

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  log('─'.repeat(40));
  log(`send summary (${elapsed}s) — sent: ${sent}, failed: ${failed}, total: ${batch.length}`);
  if (logPath) log(`Log: ${logPath}`);
  logStream?.end();
}

main().catch(err => { console.error(err.message); process.exit(1); });
