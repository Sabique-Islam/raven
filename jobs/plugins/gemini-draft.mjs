/**
 * Optional Gemini plugin for outreach drafting.
 * Enable with GEMINI_API_KEY in .env and `raven draft --gemini`.
 */

const DEFAULT_MODEL = 'gemini-2.0-flash';

export function isGeminiAvailable(env = process.env) {
  return Boolean(env.GEMINI_API_KEY || env.GOOGLE_AI_API_KEY);
}

export function geminiApiKey(env = process.env) {
  return env.GEMINI_API_KEY || env.GOOGLE_AI_API_KEY || '';
}

/**
 * @param {object} ctx
 * @param {import('../lib/profile.mjs').UserProfile} ctx.profile
 * @param {object} ctx.offer
 * @param {string} ctx.templateSubject
 * @param {string} ctx.templateBody
 * @param {string[]} ctx.tailoredBullets
 * @param {string} ctx.actionWordsHint
 * @param {string} ctx.jdKeywords
 * @param {string} [ctx.model]
 */
export async function geminiDraftEmail(ctx) {
  const key = geminiApiKey();
  if (!key) {
    throw new Error('GEMINI_API_KEY not set — add to .env or omit --gemini');
  }

  const model = ctx.model || DEFAULT_MODEL;
  const identity = ctx.profile.identity || {};
  const links = ctx.profile.links || {};
  const disclaimer = ctx.profile.draft?.disclaimer
    || 'Review and edit this draft yourself before sending.';

  const prompt = [
    'Write a concise job application email (plain text, no markdown).',
    'Rules:',
    '- No em dashes (—). Use commas or periods instead.',
    '- Use • for bullets, not asterisks.',
    '- Do not invent company product names you are unsure about.',
    '- Keep bullets aligned with the candidate highlights provided — do not fabricate experience.',
    '- Include portfolio/github/linkedin links naturally if provided.',
    '- Output JSON only: {"subject":"...","body":"..."}',
    '',
    `Candidate: ${identity.name || 'Candidate'} <${identity.email || ''}>`,
    `Location: ${identity.location || 'n/a'}`,
    `Portfolio: ${links.portfolio || 'n/a'}`,
    `GitHub: ${links.github || 'n/a'}`,
    `LinkedIn: ${links.linkedin || 'n/a'}`,
    '',
    `Job: ${ctx.offer.title} at ${ctx.offer.company}`,
    `Location: ${ctx.offer.location || 'n/a'}`,
    `Listing: ${ctx.offer.url}`,
    `JD keywords: ${ctx.jdKeywords || 'n/a'}`,
    `Action word hint: ${ctx.actionWordsHint || 'n/a'}`,
    '',
    'Tailored resume bullets to use (keep meaning, light polish only):',
    ...(ctx.tailoredBullets || []).map((b) => `- ${b}`),
    '',
    'Template draft for reference (improve, do not copy blindly):',
    `Subject: ${ctx.templateSubject}`,
    `Body:\n${ctx.templateBody}`,
  ].join('\n');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  const parsed = parseJsonFromText(text);

  const subject = parsed.subject || ctx.templateSubject;
  let body = parsed.body || ctx.templateBody;
  body = `${body.trim()}\n\n---\n${disclaimer}`;

  return { subject, body, aiGenerated: true, disclaimer };
}

function parseJsonFromText(text) {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch { /* fall through */ }
    }
  }
  return {};
}

export const PLUGIN_ID = 'gemini-draft';
