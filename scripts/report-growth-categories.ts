/* eslint-disable no-console */
import fs from 'node:fs';

import { closePool, query } from '@/db/neon/client';

const CANDIDATE_NAMES = [
  'sudowrite',
  'anyword',
  'hyperwrite',
  'nansen',
  'arkham',
  'token-terminal',
  'messari',
  'zapper',
  'surfer',
  'frase',
  'clearscope',
  'jasper',
  'copy-ai',
  'rytr',
  'scalenut',
  'marketmuse',
  'koala-writer',
];

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

  const categoryCounts = await query(
    `
      select
        c.slug,
        c.name->>'en' as name,
        count(t.id)::int as count
      from categories c
      left join tools t
        on t.category_id = c.id
       and t.status in ('published', 'active')
      group by c.id, c.slug, c.name
      order by count desc, c.slug asc
    `,
  );

  const candidateStatus = await query(
    `
      select
        name,
        title->>'en' as title,
        status,
        pricing,
        image_url,
        thumbnail_url
      from tools
      where name = any($1)
      order by name
    `,
    [CANDIDATE_NAMES],
  );

  const existingNames = new Set(candidateStatus.rows.map((row) => String(row.name)));
  const missingNames = CANDIDATE_NAMES.filter((name) => !existingNames.has(name));

  console.log(
    JSON.stringify(
      {
        categoryCounts: categoryCounts.rows,
        existingCandidates: candidateStatus.rows,
        missingCandidates: missingNames,
      },
      null,
      2,
    ),
  );

  await closePool();
}

main().catch(async (error) => {
  console.error(error);
  await closePool();
  process.exit(1);
});
