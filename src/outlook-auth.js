const querystring = require('querystring');

let cachedToken = null;

async function refreshToken() {
  const clientId = process.env.MS_CLIENT_ID;
  const clientSecret = process.env.MS_CLIENT_SECRET;
  const rt = process.env.MS_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !rt) {
    throw new Error('Missing Outlook credentials in .env. Run setup-outlook-auth.js first.');
  }

  const body = querystring.stringify({
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: rt,
    scope: 'https://graph.microsoft.com/Mail.Send offline_access',
  });

  const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    throw new Error(`Outlook token refresh failed: HTTP ${response.status}`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Outlook token refresh failed: non-JSON response (HTTP ${response.status})`);
  }

  if (!data.access_token) {
    throw new Error(`Outlook token refresh returned no access_token: ${JSON.stringify(data)}`);
  }

  cachedToken = data.access_token;
  return cachedToken;
}

function getToken() {
  if (!cachedToken) throw new Error('Token not initialized. Call refreshToken() first.');
  return cachedToken;
}

module.exports = { refreshToken, getToken };
