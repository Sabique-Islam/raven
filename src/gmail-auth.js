const querystring = require('querystring');

let cachedToken = null;

async function refreshToken() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const rt = process.env.GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !rt) {
    throw new Error('Missing Gmail credentials in .env. Run setup-gmail-auth.js first.');
  }

  const body = querystring.stringify({
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: rt,
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    throw new Error(`Gmail token refresh failed: HTTP ${response.status}`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Gmail token refresh failed: non-JSON response (HTTP ${response.status})`);
  }

  if (!data.access_token) {
    throw new Error(`Gmail token refresh returned no access_token: ${JSON.stringify(data)}`);
  }

  cachedToken = data.access_token;
  return cachedToken;
}

function getToken() {
  if (!cachedToken) throw new Error('Token not initialized. Call refreshToken() first.');
  return cachedToken;
}

module.exports = { refreshToken, getToken };
