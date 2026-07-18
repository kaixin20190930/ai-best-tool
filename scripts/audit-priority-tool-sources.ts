import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

import { detailList } from '../lib/data';
import { getToolByName } from '../lib/services/tools';

for (const envPath of ['.env.local', '.env.production']) {
  const resolved = path.join(process.cwd(), envPath);
  if (fs.existsSync(resolved)) {
    dotenv.config({ path: resolved, override: false });
  }
}

process.env.DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL_UNPOOLED;

const PRIORITY_TOOL_SLUGS = ['fathom', 'pipedream'];
const strict = process.argv.includes('--strict');

async function auditPriorityToolSources() {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️ DATABASE_URL is not set; skipped database source checks.');
    process.exitCode = strict ? 1 : 0;
    return;
  }

  const missingSources: string[] = [];

  for (const slug of PRIORITY_TOOL_SLUGS) {
    const databaseTool = await getToolByName(slug);
    const hasPublishedDatabaseSource = databaseTool?.status === 'published';
    const hasStaticSource = detailList.some((tool) => tool.name === slug);

    if (hasPublishedDatabaseSource || hasStaticSource) {
      const source = hasPublishedDatabaseSource ? 'published database' : 'legacy static data';
      console.log(`✅ ${slug}: ${source}`);
      continue;
    }

    missingSources.push(slug);
    console.warn(`⚠️ ${slug}: no published database record or legacy static fallback`);
  }

  if (missingSources.length > 0) {
    console.warn(`\nMissing priority tool sources: ${missingSources.join(', ')}`);
    console.warn('Do not mark these pages editorially verified until their source is restored.');
    if (strict) {
      process.exitCode = 1;
    }
    return;
  }

  console.log('\n✅ All priority tool slugs have a published source.');
}

auditPriorityToolSources()
  .catch((error) => {
    console.error('Priority tool source audit failed:', error);
    process.exitCode = 1;
  })
  .finally(() => process.exit(process.exitCode ?? 0));
