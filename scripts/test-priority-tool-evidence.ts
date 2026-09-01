import fs from 'node:fs';
import path from 'node:path';

import { PRIORITY_TOOL_EVIDENCE } from '../lib/config/priorityToolEvidence';

const expectedSlugs = [
  'claude',
  'consensus',
  'cursor',
  'deepl',
  'fathom',
  'gamma',
  'lindy',
  'luma-ai',
  'pipedream',
  'runway',
  'the-graph',
];
const actualSlugs = Object.keys(PRIORITY_TOOL_EVIDENCE).sort();

if (JSON.stringify(actualSlugs) !== JSON.stringify(expectedSlugs)) {
  throw new Error(`Priority evidence slugs differ: ${actualSlugs.join(', ')}`);
}

for (const slug of expectedSlugs) {
  const evidence = PRIORITY_TOOL_EVIDENCE[slug];
  const urls = evidence.sources.map((source) => source.url);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(evidence.checkedAt)) {
    throw new Error(`${slug}: checkedAt must use YYYY-MM-DD.`);
  }
  if (!evidence.limitation.en.trim() || !evidence.limitation.zh.trim()) {
    throw new Error(`${slug}: bilingual limitation is required.`);
  }
  if (urls.length < 2 || new Set(urls).size !== urls.length) {
    throw new Error(`${slug}: at least two unique official sources are required.`);
  }
  if (urls.some((url) => !/^https:\/\//i.test(url))) {
    throw new Error(`${slug}: official sources must use HTTPS.`);
  }
}

const detailPage = fs.readFileSync(
  path.join(process.cwd(), 'app/[locale]/(with-footer)/ai/[websiteName]/page.tsx'),
  'utf8',
);

if (!detailPage.includes('data-priority-tool-evidence')) {
  throw new Error('Tool detail page does not expose the priority evidence block.');
}

if (!detailPage.includes('priorityEvidence && !priorityOfficialEvidence')) {
  throw new Error('Tool detail page must avoid duplicating an existing official evidence snapshot.');
}

for (const [officialSnapshotSlug, expectedDate] of Object.entries({
  cursor: '2026-09-01',
  'luma-ai': '2026-09-01',
  make: '2026-09-01',
  perplexity: '2026-09-01',
  pipedream: '2026-09-01',
  runway: '2026-09-01',
  'the-graph': '2026-09-01',
})) {
  const branchStart = detailPage.indexOf(`if (key === '${officialSnapshotSlug}')`);
  const branchEnd = detailPage.indexOf('\n  if (key ===', branchStart + 1);
  const branch = detailPage.slice(branchStart, branchEnd > branchStart ? branchEnd : undefined);
  const checkedCount = branch.match(new RegExp(`checkedAt: '${expectedDate}'`, 'g'))?.length || 0;

  if (checkedCount !== 2) {
    throw new Error(`${officialSnapshotSlug}: both localized official snapshots must use the latest review date.`);
  }
}

console.log('Priority tool evidence checks passed.');
