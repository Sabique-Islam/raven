import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { cleanChips } from './filters.mjs';

/**
 * Serialize ephemeral filter state into a minimal portals.yml for scanners.
 * @param {{ positive?: string[], negative?: string[], allow?: string[], block?: string[], alwaysAllow?: string[], job_boards?: object[] }} f
 */
export function serializePortals(f) {
  const block = (key, items) =>
    items?.length ? `  ${key}:\n${items.map((k) => `    - ${JSON.stringify(k)}`).join('\n')}\n` : '';

  let out = '# Ephemeral Raven discovery filters — safe to delete.\n';
  if (f.positive?.length || f.negative?.length) {
    out += 'title_filter:\n';
    out += block('positive', f.positive);
    out += block('negative', f.negative);
  }
  if (f.allow?.length || f.block?.length || f.alwaysAllow?.length) {
    out += 'location_filter:\n';
    out += block('always_allow', f.alwaysAllow);
    out += block('allow', f.allow);
    out += block('block', f.block);
  }
  if (Array.isArray(f.job_boards) && f.job_boards.length) {
    out += 'job_boards:\n';
    for (const board of f.job_boards) {
      out += `  - name: ${JSON.stringify(board.name)}\n`;
      if (board.provider) out += `    provider: ${JSON.stringify(board.provider)}\n`;
      out += `    enabled: ${board.enabled !== false}\n`;
    }
  }
  return out;
}

/** @param {ReturnType<typeof serializePortals extends (...args: infer A) => any ? A : never>[0]} f */
export function writeTempPortals(f) {
  const file = path.join(os.tmpdir(), `raven-discover-${randomUUID()}.yml`);
  fs.writeFileSync(file, serializePortals(f), 'utf8');
  return file;
}

export function cleanupTempPortals(file) {
  try {
    if (file.startsWith(os.tmpdir()) && file.includes('raven-discover-')) fs.unlinkSync(file);
  } catch {
    /* best-effort */
  }
}

export function defaultJobBoards() {
  return [
    { name: 'RemoteOK', provider: 'remoteok', enabled: true },
    { name: 'Remotive', provider: 'remotive', enabled: true },
    { name: 'Arbeitnow', provider: 'arbeitnow', enabled: true },
    { name: 'Landing.jobs', provider: 'landingjobs', enabled: true },
  ];
}

export { cleanChips };
