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

const gammaLimit = PRIORITY_TOOL_EVIDENCE.gamma.limitation;
if (!gammaLimit.en.includes('PPTX') || !gammaLimit.en.includes('fonts') || !gammaLimit.zh.includes('字体')) {
  throw new Error('Gamma evidence must explain the PPTX import and font boundary in both languages.');
}

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

const gammaStart = detailPage.indexOf("if (key === 'gamma')");
const gammaEnd = detailPage.indexOf('\n  if (key ===', gammaStart + 1);
const gammaBranch = detailPage.slice(gammaStart, gammaEnd);
for (const locale of ['en', 'zh']) {
  if (!gammaBranch.includes(`PRIORITY_TOOL_EVIDENCE.gamma.limitation.${locale}`)) {
    throw new Error(`Gamma visible official snapshot must reuse the reviewed ${locale} export boundary.`);
  }
}

for (const [officialSnapshotSlug, expectedDate] of Object.entries({
  cursor: '2026-09-01',
  'luma-ai': '2026-09-01',
  make: '2026-09-01',
  openrouter: '2026-09-04',
  n8n: '2026-09-04',
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
  if (officialSnapshotSlug === 'n8n') {
    for (const term of ['Sustainable Use License', 'Community', 'queue mode', '€667', '40,000', 'AI Assistant']) {
      if (branch.split(term).length - 1 < 2) {
        throw new Error(`n8n: both languages must explain ${term}.`);
      }
    }
    if (!branch.includes('not OSI open source') || !branch.includes('不等于 OSI 开源')) {
      throw new Error('n8n: source-available license must not be presented as unrestricted open source.');
    }
  }
}

console.log('Priority tool evidence checks passed.');
