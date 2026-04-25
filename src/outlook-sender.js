const fs = require('fs');
const path = require('path');

const sleep = ms => new Promise(r => setTimeout(r, ms));

function buildMessage(mail) {
  const message = {
    subject: mail.subject,
    body: { contentType: 'Text', content: mail.body },
    toRecipients: [{ emailAddress: { address: mail.to } }],
    from: { emailAddress: { address: mail.from } },
  };

  if (mail.attachments && mail.attachments.length > 0) {
    const cwd = process.cwd();
    message.attachments = mail.attachments.map(filePath => {
      const resolvedPath = path.resolve(filePath);
      if (!resolvedPath.startsWith(cwd)) {
        throw new Error(`Security Error: Attachment path traversal detected - ${filePath}`);
      }
      return {
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: path.basename(resolvedPath),
        contentBytes: fs.readFileSync(resolvedPath).toString('base64'),
      };
    });
  }

  return message;
}

async function sendEmail(token, _accountId, mail, opts = {}) {
  const delay429 = opts.delay429 ?? 60_000;
  const delay5xx = opts.delay5xx ?? 10_000;

  const doFetch = () => fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: buildMessage(mail) }),
  });

  let res = await doFetch();

  if (res.ok || res.status === 202) return { outcome: 'sent' };
  if (res.status === 422) return { outcome: 'bounced' };
  if (res.status === 401 || res.status === 403) return { outcome: 'halt' };

  const retryDelay = res.status === 429 ? delay429 : res.status >= 500 ? delay5xx : null;
  if (retryDelay !== null) {
    await sleep(retryDelay);
    res = await doFetch();
    if (res.ok || res.status === 202) return { outcome: 'sent' };
    if (res.status === 401 || res.status === 403) return { outcome: 'halt' };
    return { outcome: 'failed' };
  }

  return { outcome: 'failed' };
}

module.exports = { sendEmail };
