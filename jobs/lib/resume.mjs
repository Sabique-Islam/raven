import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { CACHE_DIR } from './paths.mjs';
import { resolveProfilePath } from './profile.mjs';

const CACHE_FILE = path.join(CACHE_DIR, 'resume-parsed.json');

/** @typedef {object} ParsedResume
 * @property {string[]} highlights
 * @property {string[]} skills
 * @property {string} [rawText]
 * @property {string} [sourcePath]
 */

function fileHash(content) {
  return createHash('sha256').update(content).digest('hex').slice(0, 16);
}

function readResumeFile(resolvedPath) {
  const ext = path.extname(resolvedPath).toLowerCase();
  if (ext === '.pdf') return parsePdf(resolvedPath);
  const text = fs.readFileSync(resolvedPath, 'utf8');
  if (ext === '.md' || ext === '.markdown') return parseMarkdownResume(text);
  return parsePlainResume(text);
}

async function parsePdf(resolvedPath) {
  try {
    const { createRequire } = await import('node:module');
    const { fileURLToPath } = await import('url');
    const require = createRequire(fileURLToPath(import.meta.url));
    const pdfParse = require('pdf-parse');
    const buffer = fs.readFileSync(resolvedPath);
    const data = await pdfParse(buffer);
    return parsePlainResume(data.text || '');
  } catch {
    throw new Error(`PDF resume requires pdf-parse — run npm install in jobs/, or use .md/.txt resume at ${resolvedPath}`);
  }
}

/** Extract bullet lines and skills sections from markdown resume. */
export function parseMarkdownResume(text) {
  const lines = text.split('\n');
  const highlights = [];
  const skills = [];
  let section = '';
  let inExperience = false;

  for (const line of lines) {
    const trimmed = line.trim();
    const hMatch = trimmed.match(/^(#{1,3})\s+(.+)/);
    if (hMatch) {
      const level = hMatch[1].length;
      const heading = hMatch[2].toLowerCase();
      if (level <= 2 && /experience|work history|employment|projects/i.test(heading)) {
        inExperience = /experience|work history|employment/i.test(heading);
        section = inExperience ? 'experience' : 'projects';
      } else if (level <= 2) {
        inExperience = false;
        section = heading;
      } else if (inExperience) {
        section = 'experience';
      }
      continue;
    }
    if (/^[-*•]\s+/.test(trimmed) && (inExperience || /projects|impact/i.test(section))) {
      highlights.push(trimmed.replace(/^[-*•]\s+/, '').trim());
      continue;
    }
    if (/^[-*•]\s+/.test(trimmed) && /skill/i.test(section)) {
      skills.push(...trimmed.replace(/^[-*•]\s+/, '').split(/[,;|·]/).map((s) => s.trim()).filter(Boolean));
      continue;
    }
    if (/skill/i.test(section) && trimmed && !trimmed.startsWith('#')) {
      skills.push(...trimmed.split(/[,;|·]/).map((s) => s.trim()).filter(Boolean));
    }
  }

  return {
    highlights: dedupeStrings(highlights),
    skills: dedupeStrings(skills),
    rawText: text,
  };
}

/** Plain text: bullets + comma-separated skill lines. */
export function parsePlainResume(text) {
  const highlights = [];
  const skills = [];
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (/^[-*•]\s+/.test(t)) highlights.push(t.replace(/^[-*•]\s+/, ''));
    if (/^skills?\s*:/i.test(t)) {
      skills.push(...t.split(':')[1].split(/[,;|]/).map((s) => s.trim()).filter(Boolean));
    }
  }
  return { highlights: dedupeStrings(highlights), skills: dedupeStrings(skills), rawText: text };
}

function dedupeStrings(arr) {
  return [...new Set(arr.map((s) => s.trim()).filter(Boolean))];
}

/**
 * Parse resume from profile path with optional disk cache.
 * @param {import('./profile.mjs').UserProfile} profile
 * @param {{ refresh?: boolean }} [opts]
 * @returns {Promise<ParsedResume>}
 */
export async function parseResume(profile, opts = {}) {
  const resumePath = resolveProfilePath(profile.resume?.path || profile.links?.resume);
  if (!resumePath || /^https?:\/\//i.test(resumePath)) {
    return {
      highlights: profile.highlights || [],
      skills: profile.skills || [],
      sourcePath: resumePath || null,
    };
  }
  if (!fs.existsSync(resumePath)) {
    return {
      highlights: profile.highlights || [],
      skills: profile.skills || [],
      sourcePath: resumePath,
    };
  }

  const stat = fs.statSync(resumePath);
  const content = fs.readFileSync(resumePath);
  const hash = fileHash(content);
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  if (!opts.refresh && fs.existsSync(CACHE_FILE)) {
    try {
      const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      if (cache.hash === hash && cache.parsed) {
        return { ...cache.parsed, sourcePath: resumePath };
      }
    } catch { /* refresh */ }
  }

  const parsed = await readResumeFile(resumePath);
  const merged = {
    highlights: dedupeStrings([...(profile.highlights || []), ...parsed.highlights]),
    skills: dedupeStrings([...(profile.skills || []), ...parsed.skills]),
    rawText: parsed.rawText,
    sourcePath: resumePath,
  };

  fs.writeFileSync(CACHE_FILE, JSON.stringify({ hash, mtime: stat.mtimeMs, parsed: merged }, null, 2));
  return merged;
}

export { CACHE_FILE as RESUME_CACHE_PATH };
