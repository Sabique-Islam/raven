#!/usr/bin/env node
require('dotenv').config();

/**
 * setup-outlook-auth.js
 *
 * One-time OAuth setup to authorize Outlook/Microsoft 365 sending via Microsoft Graph.
 * Saves MS_CLIENT_ID, MS_CLIENT_SECRET, and MS_REFRESH_TOKEN to your .env file.
 *
 * Before running, create an Azure App Registration:
 *   1. Go to https://portal.azure.com/ → Azure Active Directory → App registrations
 *   2. New registration → name it anything → Accounts in any organizational directory and personal Microsoft accounts
 *   3. Redirect URI → Web → http://localhost:8765/callback
 *   4. API permissions → Add → Microsoft Graph → Delegated → Mail.Send → Grant admin consent
 *   5. Certificates & secrets → New client secret → copy the Value (not the ID)
 *   6. Overview → copy the Application (client) ID
 */

const fs = require('fs');
const http = require('http');
const https = require('https');
const readline = require('readline');
const { exec } = require('child_process');

const REDIRECT_URI = 'http://localhost:8765/callback';
const SCOPE = 'https://graph.microsoft.com/Mail.Send offline_access';

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
  console.log('\n=== Outlook / Microsoft 365 Send Setup ===\n');
  console.log('You need an Azure App Registration. If you haven\'t created one yet:');
  console.log('  1. Go to https://portal.azure.com/ → Azure Active Directory → App registrations');
  console.log('  2. New registration → name it anything');
  console.log('     Account type: Accounts in any organizational directory and personal Microsoft accounts');
  console.log('  3. Redirect URI → Web → http://localhost:8765/callback');
  console.log('  4. API permissions → Add → Microsoft Graph → Delegated → Mail.Send');
  console.log('  5. Certificates & secrets → New client secret → copy the Value');
  console.log('  6. Overview → copy the Application (client) ID\n');

  const clientId = await prompt('Application (client) ID: ');
  const clientSecret = await prompt('Client secret value: ');

  const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', SCOPE);
  authUrl.searchParams.set('response_mode', 'query');

  console.log('\nOpening browser for Microsoft authorization...');
  console.log('If the browser does not open, visit:\n');
  console.log(authUrl.toString() + '\n');
  openBrowser(authUrl.toString());

  console.log('Waiting for you to authorize in the browser...');
  const code = await waitForAuthCode();

  const tokenRes = await httpsPost('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: REDIRECT_URI,
    code,
    scope: SCOPE,
  });

  if (tokenRes.status !== 200) {
    throw new Error(`Token exchange failed: ${JSON.stringify(tokenRes.body)}`);
  }

  const { refresh_token } = tokenRes.body;
  if (!refresh_token) {
    throw new Error(`No refresh_token in response: ${JSON.stringify(tokenRes.body)}`);
  }

  writeEnvKey('MS_CLIENT_ID', clientId);
  writeEnvKey('MS_CLIENT_SECRET', clientSecret);
  writeEnvKey('MS_REFRESH_TOKEN', refresh_token);

  console.log('\n✅ Outlook credentials written to .env');
  console.log('   MS_CLIENT_ID, MS_CLIENT_SECRET, MS_REFRESH_TOKEN set');
  console.log('\nRun emails with: node scripts/send-prewritten.js --input contacts.csv --provider outlook\n');
}

main().catch(err => {
  console.error('\nError:', err.message);
  process.exit(1);
});
