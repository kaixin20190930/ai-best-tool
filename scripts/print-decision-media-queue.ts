/* eslint-disable no-console */
import fs from 'node:fs';

import { getPriorityMediaQueue } from '@/lib/services/admin/analytics';

function loadLocalEnv() {
  const envPath = '/Users/liukai/web/ai-best-tool/.env.local';
  const envText = fs.readFileSync(envPath, 'utf8');

  for (const line of envText.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    const value = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function getCategoryName(categoryName: Record<string, string> | null, fallback: string | null) {
  if (categoryName && typeof categoryName === 'object') {
    return categoryName.en || categoryName.zh || Object.values(categoryName)[0] || fallback || 'Uncategorized';
  }

  return fallback || 'Uncategorized';
}

async function main() {
  loadLocalEnv();

  const queue = await getPriorityMediaQueue(20);
  const focused = queue.filter((tool) => tool.hasDecisionGuide).slice(0, 5);

  console.log(
    JSON.stringify(
      focused.map((tool, index) => ({
        rank: index + 1,
        name: tool.name,
        title:
          typeof tool.title === 'object' && tool.title !== null
            ? tool.title.en || tool.title.zh || Object.values(tool.title)[0] || tool.name
            : tool.name,
        category: getCategoryName(tool.categoryName, tool.categorySlug),
        decisionGuide: tool.hasDecisionGuide,
        mediaIssues: tool.mediaIssues,
        mediaReason: tool.mediaReason,
        views: tool.views,
        clicks: tool.clicks,
        qualityScore: tool.qualityScore,
        priorityScore: tool.priorityScore,
        editPath: `/admin/tools/${tool.id}/edit`,
      })),
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
