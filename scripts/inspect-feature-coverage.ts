/* eslint-disable no-console */
import fs from 'node:fs';

import { closePool, query } from '@/db/neon/client';

const TOOL_NAMES = [
  'chatgpt',
  'claude',
  'perplexity',
  'cursor',
  'notion-ai',
  'grammarly',
  'midjourney',
  'gamma',
  'runway',
  'dune',
  'fathom',
  'quillbot',
  'defillama',
  'the-graph',
  'n8n',
  'make',
  'openrouter',
  'sigoo',
  'elevenlabs',
  'phind',
  'lovable',
  'bolt-new',
  'v0',
  'gemini',
  'grok',
  'copilot',
  'alchemy',
  'thirdweb',
  'frase',
  'sudowrite',
  'rytr',
  'messari',
  'nansen',
  'arkham',
  'token-terminal',
  'zapper',
  'debank',
  'bubblemaps',
];

function loadLocalEnv() {
  const envPath = '.env.local';
  if (!fs.existsSync(envPath)) {
    return;
  }

  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadLocalEnv();

  const result = await query(
    `
      select name, features
      from tools
      where name = any($1)
      order by name
    `,
    [TOOL_NAMES]
  );

  const rows = result.rows.map((row: any) => ({
    name: row.name,
    editorial: Boolean(row.features?.editorial),
    decision: Boolean(row.features?.decision),
    mediaReview: Boolean(row.features?.mediaReview),
    officialSiteReview: Boolean(row.features?.officialSiteReview),
    pricingSnapshot: Boolean(row.features?.pricingSnapshot),
  }));

  console.log(JSON.stringify(rows, null, 2));
  await closePool();
}

main().catch(async (error) => {
  console.error(error);
  await closePool();
  process.exit(1);
});
