const fs = require('fs');
const path = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));

function encodeHeader(value) {
  if (/^[\x00-\x7F]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value).toString('base64')}?=`;
}

function buildRfc2822(mail) {
  const boundary = `boundary_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const hasAttachments = mail.attachments && mail.attachments.length > 0;

  const headers = [
    'MIME-Version: 1.0',
    `From: ${mail.from}`,
    `To: ${mail.to}`,
    ...(mail.cc ? [`Cc: ${mail.cc}`] : []),
    `Subject: ${encodeHeader(mail.subject)}`,
  ];

  let raw;
  if (!hasAttachments) {
    headers.push('Content-Type: text/plain; charset=UTF-8');
    raw = headers.join('\r\n') + '\r\n\r\n' + mail.body;
  } else {
    headers.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
    const textPart = [
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      '',
      mail.body,
    ].join('\r\n');

    const cwd = process.cwd();
    const attachmentParts = mail.attachments.map(filePath => {
      const resolvedPath = path.resolve(filePath);
      if (!resolvedPath.startsWith(cwd)) {
        throw new Error(`Security Error: Attachment path traversal detected - ${filePath}`);
      }
      const content = fs.readFileSync(resolvedPath).toString('base64');
      const name = path.basename(resolvedPath);
      return [
        `--${boundary}`,
        'Content-Type: application/octet-stream',
        `Content-Disposition: attachment; filename="${name}"`,
        'Content-Transfer-Encoding: base64',
        '',
        content,
      ].join('\r\n');
    });

    const closingBoundary = `--${boundary}--`;
    raw = headers.join('\r\n') + '\r\n\r\n' + [textPart, ...attachmentParts, closingBoundary].join('\r\n');
  }

  return Buffer.from(raw).toString('base64url');
}

async function sendEmail(token, _accountId, mail, opts = {}) {
  const delay429 = opts.delay429 ?? 60_000;
  const delay5xx = opts.delay5xx ?? 10_000;

  const doFetch = () => fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: buildRfc2822(mail) }),
  });

  let res = await doFetch();

  if (res.ok) return { outcome: 'sent' };
  if (res.status === 422) return { outcome: 'bounced' };
  if (res.status === 401 || res.status === 403) return { outcome: 'halt' };

  const retryDelay = res.status === 429 ? delay429 : res.status >= 500 ? delay5xx : null;
  if (retryDelay !== null) {
    await sleep(retryDelay);
    res = await doFetch();
    if (res.ok) return { outcome: 'sent' };
    if (res.status === 401 || res.status === 403) return { outcome: 'halt' };
    return { outcome: 'failed' };
  }

  return { outcome: 'failed' };
}

module.exports = { sendEmail };
