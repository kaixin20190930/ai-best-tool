import fs from 'node:fs';
import path from 'node:path';

import { PRIORITY_TOOL_FALLBACK_PROFILES } from '../lib/config/priorityToolFallbacks';

const expectedSlugs = [
  'anthropic',
  'chatgpt',
  'claude',
  'cursor',
  'deepl',
  'defillama',
  'dune',
  'fathom',
  'gamma',
  'grammarly',
  'lindy',
  'make',
  'n8n',
  'notta',
  'openrouter',
  'perplexity',
  'pipedream',
  'runway',
  'the-graph',
];
const actualSlugs = Object.keys(PRIORITY_TOOL_FALLBACK_PROFILES).sort();

if (JSON.stringify(actualSlugs) !== JSON.stringify(expectedSlugs)) {
  throw new Error(`Priority fallback slugs differ: ${actualSlugs.join(', ')}`);
}

for (const slug of expectedSlugs) {
  const profile = PRIORITY_TOOL_FALLBACK_PROFILES[slug];
  if (!profile.title.trim() || !profile.categoryName.trim() || !profile.tagName.trim()) {
    throw new Error(`${slug}: title, category, and tags are required.`);
  }
  if (!/^https:\/\//i.test(profile.url)) {
    throw new Error(`${slug}: official URL must use HTTPS.`);
  }
}

const detailPage = fs.readFileSync(
  path.join(process.cwd(), 'app/[locale]/(with-footer)/ai/[websiteName]/page.tsx'),
  'utf8',
);
const fallbackUseCount = detailPage.match(/getPriorityToolFallbackDetail\(websiteName, locale\)/g)?.length || 0;

if (fallbackUseCount !== 2) {
  throw new Error('Priority fallback must be used by both metadata and page rendering.');
}

console.log('Priority tool fallback checks passed.');
