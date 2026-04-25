#!/usr/bin/env node
require('dotenv').config();

/**
 * setup-gmail-auth.js
 *
 * One-time OAuth setup to authorize Gmail sending.
 * Saves GMAIL_REFRESH_TOKEN to your .env file.
 *
 * Requires: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
 *
 * To get credentials:
 *   1. Go to https://console.cloud.google.com/
 *   2. Create a project → APIs & Services → Enable Gmail API
 *   3. OAuth consent screen → External → Add your email as test user
 *   4. Credentials → Create OAuth 2.0 Client ID → Desktop app
 *   5. Set authorized redirect URI: http://localhost:8765/callback
 */

const fs = require('fs');
const http = require('http');
const https = require('https');
const readline = require('readline');
const { exec } = require('child_process');

const REDIRECT_URI = 'http://localhost:8765/callback';
const SCOPE = 'https://www.googleapis.com/auth/gmail.send';

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, answer => { rl.close(); resolve(answer.trim()); }));
}

function openBrowser(url) {
  const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${cmd} "${url}"`);
}

function httpsPost(url, fields) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams(fields).toString();
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function waitForAuthCode() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, 'http://localhost:8765');
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      if (code) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h2>Authorization successful — you can close this tab.</h2>');
        server.close();
        resolve(code);
      } else {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(`<h2>Authorization failed: ${error || 'unknown'}</h2>`);
        server.close();
        reject(new Error(`OAuth error: ${error}`));
      }
    });
    server.listen(8765, () => {});
    server.on('error', reject);
  });
}

function writeEnvKey(key, value) {
  let envContent = '';
  try { envContent = fs.readFileSync('.env', 'utf-8'); } catch {}
  const re = new RegExp(`^${key}=.*$`, 'm');
  if (re.test(envContent)) {
    envContent = envContent.replace(re, `${key}=${value}`);
  } else {
    envContent += (envContent.endsWith('\n') ? '' : '\n') + `${key}=${value}\n`;
  }
  fs.writeFileSync('.env', envContent);
}

async function main() {
  console.log('\n=== Gmail Send Setup ===\n');

  let clientId = process.env.GOOGLE_CLIENT_ID;
  let clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.log('You need Google OAuth credentials to authorize Gmail sending.');
    console.log('\nTo get them:');
    console.log('  1. Go to https://console.cloud.google.com/');
    console.log('  2. Create a project → APIs & Services → Enable Gmail API');
    console.log('  3. OAuth consent screen → External → Add your email as test user');
    console.log('  4. Credentials → Create OAuth 2.0 Client ID → Desktop app');
    console.log('  5. Set authorized redirect URI: http://localhost:8765/callback\n');
    clientId = await prompt('Google Client ID: ');
    clientSecret = await prompt('Google Client Secret: ');
  }

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', SCOPE);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');

  console.log('\nOpening browser for Gmail authorization...');
  console.log('If the browser does not open, visit:\n');
  console.log(authUrl.toString() + '\n');
  openBrowser(authUrl.toString());

  console.log('Waiting for you to authorize in the browser...');
  const code = await waitForAuthCode();

  const tokenRes = await httpsPost('https://oauth2.googleapis.com/token', {
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
  });

  if (tokenRes.status !== 200) {
    throw new Error(`Token exchange failed: ${JSON.stringify(tokenRes.body)}`);
  }

  const { refresh_token } = tokenRes.body;
  if (!refresh_token) {
    throw new Error('No refresh_token in response. Ensure access_type=offline and prompt=consent were set.');
  }

  writeEnvKey('GOOGLE_CLIENT_ID', clientId);
  writeEnvKey('GOOGLE_CLIENT_SECRET', clientSecret);
  writeEnvKey('GMAIL_REFRESH_TOKEN', refresh_token);

  console.log('\n✅ Gmail credentials written to .env');
  console.log('   GMAIL_REFRESH_TOKEN set');
  console.log('\nRun emails with: node scripts/send-prewritten.js --input contacts.csv\n');
}

main().catch(err => {
  console.error('\nError:', err.message);
  process.exit(1);
});
