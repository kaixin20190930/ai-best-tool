/* eslint-disable no-console */
import fs from 'node:fs';

import { closePool, query } from '@/db/neon/client';

const TOOL_NAMES = ['copy-ai', 'jasper', 'surfer', 'frase', 'clearscope', 'scalenut', 'marketmuse', 'koala-writer'];

function loadLocalEnv() {
  const envPath = '.env.local';
  if (!fs.existsSync(envPath)) {
    return;
  }

  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

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
      select
        name,
        title,
        url,
        image_url,
        thumbnail_url,
        pricing,
        content,
        detail,
        features->'mediaReview' as media_review,
        features->'editorial' as editorial,
        features->'decision' as decision,
        features->'audience' as audience
      from tools
      where name = any($1)
      order by name
    `,
    [TOOL_NAMES],
  );

  console.log(JSON.stringify(result.rows, null, 2));
  await closePool();
}

main().catch(async (error) => {
  console.error(error);
  await closePool();
  process.exit(1);
});
