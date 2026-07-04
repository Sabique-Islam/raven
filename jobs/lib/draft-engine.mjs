/**
 * Draft engine — orchestrates profile, resume tailoring, form guides, optional Gemini.
 */

import { classifyApplication, applicationTypeLabel } from './application-type.mjs';
import { buildFormGuide, buildFormGuideShort } from './form-guides.mjs';
import {
  tailorBullets,
  suggestActionWords,
  applyActionVerb,
  formatActionWordsField,
  formatKeywordsField,
  formatTailoredBullets,
} from './jd-tailor.mjs';
import {
  mergeOutreachConfig,
  getIdentity,
  formatLinksBlock,
  profileDisclaimer,
} from './profile.mjs';
import { parseResume } from './resume.mjs';
import {
  draftEmailRow,
  guessContactEmail,
  greetingForEmail,
} from './outreach.mjs';
import { isGeminiAvailable, geminiDraftEmail, geminiApiKey } from '../plugins/gemini-draft.mjs';
import { geminiConfig } from './profile.mjs';

/**
 * @typedef {object} DraftContext
 * @property {import('./profile.mjs').UserProfile} profile
 * @property {object} outreachConfig
 * @property {import('./resume.mjs').ParsedResume} resume
 * @property {boolean} [useGemini]
 * @property {boolean} [guessEmail]
 */

/**
 * Build one application draft row (email or ATS form guide).
 * @param {object} offer
 * @param {DraftContext} ctx
 */
export async function buildDraftRow(offer, ctx) {
  const appType = classifyApplication(offer);
  const maxBullets = ctx.profile.resume?.max_bullets || 3;
  const sourceBullets = ctx.resume.highlights.length ? ctx.resume.highlights : (ctx.outreachConfig.highlights || []);
  const tailored = tailorBullets(sourceBullets, offer, maxBullets);
  const actionWords = suggestActionWords(tailored.keywords, offer.title);
  const verbs = actionWords.verbs;

  const tailoredTexts = tailored.ranked.slice(0, maxBullets).map((r) => applyActionVerb(r.text, verbs));

  const tailoringMeta = {
    jdKeywords: formatKeywordsField(tailored.keywords),
    actionWords: formatActionWordsField(actionWords),
    tailoredBullets: formatTailoredBullets(tailoredTexts),
  };

  const identity = getIdentity(ctx.profile);
  const linksBlock = formatLinksBlock(ctx.profile);
  const disclaimer = profileDisclaimer(ctx.profile);

  if (appType === 'form') {
    const formGuide = buildFormGuideShort(offer, ctx.profile, tailoringMeta);
    const formGuideFull = buildFormGuide(offer, ctx.profile, tailoringMeta);
    return {
      application_type: 'form',
      contact_email: '',
      subject: `Apply via form: ${offer.title} @ ${offer.company}`,
      body: formGuide,
      company: offer.company || '',
      title: offer.title || '',
      job_url: offer.url || '',
      location: offer.location || '',
      posted_at: offer.postedAt || '',
      ats: offer.ats || '',
      email_source: 'n/a',
      jd_keywords: tailoringMeta.jdKeywords,
      action_words: tailoringMeta.actionWords,
      tailored_bullets: tailoringMeta.tailoredBullets,
      form_steps: formGuideFull,
      links_block: linksBlock,
      ai_draft: 'no',
      disclaimer,
      application_label: applicationTypeLabel('form'),
    };
  }

  const guess = ctx.guessEmail ? guessContactEmail(offer.url) : { email: '', source: 'manual' };
  const outreachRow = draftEmailRow(offer, ctx.outreachConfig, {
    identity,
    linksBlock,
    highlights: tailoredTexts,
    contactEmail: guess.email,
    greeting: greetingForEmail(guess.email, ctx.outreachConfig),
  });

  let subject = outreachRow.subject;
  let body = outreachRow.body;
  let aiDraft = 'no';

  const wantGemini = ctx.useGemini && isGeminiAvailable();
  if (wantGemini) {
    try {
      const g = await geminiDraftEmail({
        profile: ctx.profile,
        offer,
        templateSubject: subject,
        templateBody: body,
        tailoredBullets: tailoredTexts,
        actionWordsHint: tailoringMeta.actionWords,
        jdKeywords: tailoringMeta.jdKeywords,
        model: geminiConfig(ctx.profile).model,
      });
      subject = g.subject;
      body = g.body;
      aiDraft = 'yes';
    } catch (err) {
      body = `${body}\n\n---\n(Gemini draft failed: ${err.message}. Using template draft.)\n${disclaimer}`;
      aiDraft = 'fallback';
    }
  } else {
    body = `${body}\n\n---\n${disclaimer}`;
  }

  return {
    application_type: 'email',
    contact_email: outreachRow.contact_email,
    subject,
    body,
    company: outreachRow.company,
    title: outreachRow.title,
    job_url: outreachRow.job_url,
    location: outreachRow.location,
    posted_at: outreachRow.posted_at,
    ats: outreachRow.ats,
    email_source: guess.source,
    jd_keywords: tailoringMeta.jdKeywords,
    action_words: tailoringMeta.actionWords,
    tailored_bullets: tailoringMeta.tailoredBullets,
    form_steps: '',
    links_block: linksBlock,
    ai_draft: aiDraft,
    disclaimer,
    application_label: applicationTypeLabel('email'),
  };
}

/** @param {object[]} offers @param {DraftContext} ctx */
export async function buildDraftRows(offers, ctx) {
  const rows = [];
  for (const offer of offers) {
    rows.push(await buildDraftRow(offer, ctx));
  }
  return rows;
}

export async function createDraftContext(profile, legacyOutreach, opts = {}) {
  const outreachConfig = mergeOutreachConfig(profile, legacyOutreach);
  if (opts.guessEmail) outreachConfig.guess_email = true;
  const resume = await parseResume(profile, { refresh: opts.refreshResume });
  return {
    profile,
    outreachConfig,
    resume,
    useGemini: Boolean(opts.useGemini),
    guessEmail: Boolean(opts.guessEmail),
  };
}
