#!/usr/bin/env node
// send-prewritten.js — send emails with pre-written subject+body from a CSV or XLSX
// Usage: node scripts/send-prewritten.js [--input contacts.xlsx] [--limit 50] [--dry-run] [--delay 30] [--provider gmail|outlook]
require('dotenv').config();

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
  const { input, limit, dryRun, delaySeconds, cc, provider } = parseArgs();

  const senderName = process.env.SENDER_NAME;
  const senderEmail = process.env.SENDER_EMAIL;
  if (!senderName || !senderEmail) { console.error('Missing SENDER_NAME or SENDER_EMAIL in .env'); process.exit(1); }

  if (!fs.existsSync(input)) { console.error(`File not found: ${input}`); process.exit(1); }

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
    console.log(`Refreshing ${provider} token...`);
    await refreshToken();
    console.log('Token ready.\n');
  }

  console.log(`Sending ${batch.length} emails via ${provider} (${dryRun ? 'DRY RUN' : 'LIVE'})...\n`);

  let sent = 0, failed = 0;

    for (let i = 0; i < batch.length; i++) {
    const row = batch[i];
    const to = String(row.contact_email || row.email || '').trim();
    const subject = String(row.subject || '').trim();
    const body = String(row.body || '').trim();

    if (!to || !subject || !body) {
      console.log(`[${i + 1}/${batch.length}] Skipping — missing field`);
      failed++;
      continue;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      console.log(`[${i + 1}/${batch.length}] Skipping — invalid email format for ${to}`);
      failed++;
      continue;
    }

    console.log(`[${i + 1}/${batch.length}] → ${to}`);
    console.log(`  Subject: ${subject}`);

    if (dryRun) { console.log('  [dry-run] skipped\n'); sent++; continue; }

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
      console.log('  Sent.\n');
      sent++;
    } else if (outcome === 'halt') {
      console.error(`  ${provider} auth error — halting.`);
      break;
    } else {
      console.log(`  Failed: ${outcome}\n`);
      failed++;
    }

    if (i < batch.length - 1 && outcome === 'sent') {
      process.stdout.write(`  Waiting ${delaySeconds}s...\r`);
      await new Promise(r => setTimeout(r, delaySeconds * 1000));
      process.stdout.write('                    \r');
    }
  }

  console.log(`\nDone. Sent: ${sent}  Failed: ${failed}`);
}

main().catch(err => { console.error(err.message); process.exit(1); });
