import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

import { detailList } from '../lib/data';
import { getToolByName } from '../lib/services/tools';

const isLocalAudit = process.env.SEO_AUDIT_ENV === 'local';
const envPaths = isLocalAudit ? ['.env.local'] : ['.env.production'];

for (const envPath of envPaths) {
  const resolved = path.join(process.cwd(), envPath);
  if (fs.existsSync(resolved)) {
    dotenv.config({ path: resolved, override: false });
  }
}

if (isLocalAudit && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_URL || process.env.DATABASE_URL_UNPOOLED || '';
}

const PRIORITY_TOOL_SLUGS = ['fathom', 'pipedream'];
const strict = process.argv.includes('--strict');
const productionBaseUrl = (process.env.SEO_BASE_URL || 'https://aibesttool.com').replace(/\/$/, '');

function getRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function hasCompleteEditorialEvidence(tool: unknown) {
  const features = getRecord(getRecord(tool).features);
  const editorial = getRecord(features.editorial);
  const reviewedAt = typeof editorial.reviewedAt === 'string' && editorial.reviewedAt.trim();
  const reviewedBy = typeof editorial.reviewedBy === 'string' && editorial.reviewedBy.trim();
  const sourceUrl = typeof editorial.sourceUrl === 'string' && /^https?:\/\//i.test(editorial.sourceUrl.trim());
  const summary = getRecord(editorial.summary);
  const summaryPresent =
    (typeof summary.en === 'string' && summary.en.trim()) || (typeof summary.zh === 'string' && summary.zh.trim());

  return Boolean(reviewedAt && reviewedBy && sourceUrl && summaryPresent);
}

async function isProductionPageAvailable(slug: string) {
  try {
    const response = await fetch(`${productionBaseUrl}/en/ai/${slug}`, {
      headers: { 'user-agent': 'ai-best-tool-priority-source-audit/1.0' },
      redirect: 'follow',
    });
    return response.status >= 200 && response.status < 400;
  } catch {
    return false;
  }
}

async function auditPriorityToolSources() {
  const hasDatabase = Boolean(process.env.DATABASE_URL);
  if (!hasDatabase) console.warn('⚠️ DATABASE_URL is not set; database source checks are unavailable.');

  const missingSources: string[] = [];
  const incompleteEditorial: string[] = [];

  for (const slug of PRIORITY_TOOL_SLUGS) {
    const databaseTool = hasDatabase ? await getToolByName(slug) : null;
    const hasPublishedDatabaseSource = databaseTool?.status === 'published';
    const hasStaticSource = detailList.some((tool) => tool.name === slug);
    const hasProductionPage = await isProductionPageAvailable(slug);

    if (hasPublishedDatabaseSource || hasStaticSource) {
      const source = hasPublishedDatabaseSource ? 'published database' : 'legacy static data';
      if (hasPublishedDatabaseSource && !hasCompleteEditorialEvidence(databaseTool)) {
        incompleteEditorial.push(slug);
        console.warn(
          `⚠️ ${slug}: ${source}; editorial evidence incomplete; production page ${hasProductionPage ? 'available' : 'unavailable'}`,
        );
      } else {
        console.log(`✅ ${slug}: ${source}; editorial evidence complete; production page ${hasProductionPage ? 'available' : 'unavailable'}`);
      }
      continue;
    }

    missingSources.push(slug);
    console.warn(
      `⚠️ ${slug}: editorial source missing; production page ${hasProductionPage ? 'available' : 'unavailable'}`,
    );
  }

  if (missingSources.length > 0) {
    console.warn(`\nMissing priority tool sources: ${missingSources.join(', ')}`);
    console.warn('Do not mark these pages editorially verified until their source is restored.');
  }

  if (incompleteEditorial.length > 0) {
    console.warn(`\nIncomplete priority editorial evidence: ${incompleteEditorial.join(', ')}`);
    console.warn('Do not expose these pages as editorially verified until date, reviewer, summary, and HTTP(S) source URL are complete.');
    if (strict) process.exitCode = 1;
  }

  if (missingSources.length === 0 && incompleteEditorial.length === 0) {
    console.log('\n✅ All priority tool slugs have a published source and complete editorial evidence.');
  }
}

auditPriorityToolSources()
  .catch((error) => {
    console.error('Priority tool source audit failed:', error);
    process.exitCode = 1;
  })
  .finally(() => process.exit(process.exitCode ?? 0));
