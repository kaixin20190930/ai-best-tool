import fs from 'node:fs';
import path from 'node:path';

import { config } from 'dotenv';
import { Client } from 'pg';

import { getCanonicalToolSlug } from '../lib/config/toolRouteAliases';
import { getDatabaseConnectionString } from '../lib/database/connection';
import { INDEXABLE_LOCALES } from '../lib/seo/indexing';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';

type ToolRow = {
  id: string;
  name: string;
  status: string;
  page_quality_status: string | null;
  category_id: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  content: unknown;
  detail: unknown;
  pricing: string | null;
  tags: string[] | null;
};

const baseUrl = (process.env.SEO_BASE_URL || 'https://aibesttool.com').replace(/\/$/, '');
const outputArg = process.argv.find((arg) => arg.startsWith('--output='))?.slice('--output='.length);

function toolPath(slug: string, locale: string) {
  return locale === 'en' ? `/ai/${slug}` : `/${locale}/ai/${slug}`;
}

function canonicalFromHtml(html: string) {
  const tags = html.match(/<link\s+[^>]*>/g) || [];
  return tags.find((tag) => tag.includes('rel="canonical"'))?.match(/href="([^"]+)"/)?.[1] || null;
}

function isNoindex(response: Response, html: string) {
  const robots = html.match(/<meta name="robots" content="([^"]+)"/)?.[1] || '';
  return `${response.headers.get('x-robots-tag') || ''},${robots}`.toLowerCase().includes('noindex');
}

async function fetchText(pathname: string) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    headers: { 'user-agent': 'ai-best-tool-index-consistency/1.0' },
    signal: AbortSignal.timeout(20_000),
  });
  return { response, html: await response.text() };
}

async function mapConcurrent<T, R>(items: T[], limit: number, mapper: (item: T) => Promise<R>) {
  const results = new Array<R>(items.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor++;
        results[index] = await mapper(items[index]);
      }
    }),
  );
  return results;
}

async function main() {
  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  await client.connect();
  let rows: ToolRow[];
  try {
    const result = await client.query<ToolRow>(
      `SELECT id,name,status,page_quality_status,category_id,image_url,thumbnail_url,content,detail,pricing,tags
         FROM tools ORDER BY name`,
    );
    rows = result.rows;
  } finally {
    await client.end();
  }

  const decisions = rows.map((row) => ({
    row,
    slug: getCanonicalToolSlug(row.name),
    decision: getToolIndexDecision({
      status: row.status,
      pageQualityStatus: row.page_quality_status,
      categoryId: row.category_id,
      imageUrl: row.image_url,
      thumbnailUrl: row.thumbnail_url,
      content: row.content,
      detail: row.detail,
      pricing: row.pricing,
      tags: row.tags,
    }),
  }));
  const published = decisions.filter((item) => item.row.status === 'published');
  const indexable = decisions.filter((item) => item.decision.indexable);
  const expectedToolUrls = new Set(
    indexable.flatMap((item) => INDEXABLE_LOCALES.map((locale) => `${baseUrl}${toolPath(item.slug, locale)}`)),
  );

  const sitemapResult = await fetchText('/sitemap.xml');
  if (!sitemapResult.response.ok) throw new Error(`sitemap returned ${sitemapResult.response.status}`);
  const sitemapUrls = [...sitemapResult.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const sitemapToolUrls = sitemapUrls.filter((url) => /^\/(?:cn\/)?ai\//.test(new URL(url).pathname));
  const duplicateSitemapUrls = sitemapUrls.filter((url, index) => sitemapUrls.indexOf(url) !== index);
  const missingToolUrls = [...expectedToolUrls].filter((url) => !sitemapToolUrls.includes(url));
  const unexpectedToolUrls = sitemapToolUrls.filter((url) => !expectedToolUrls.has(url));

  const canonicalOwners = new Map<string, string[]>();
  for (const item of decisions) canonicalOwners.set(item.slug, [...(canonicalOwners.get(item.slug) || []), item.row.name]);
  const duplicateCanonicalEntities = [...canonicalOwners.entries()]
    .filter(([, owners]) => owners.length > 1)
    .map(([slug, owners]) => ({ slug, owners }));

  const pageChecks = await mapConcurrent(published, 8, async (item) => {
    const issues: string[] = [];
    for (const locale of INDEXABLE_LOCALES) {
      const pathname = toolPath(item.slug, locale);
      try {
        const { response, html } = await fetchText(pathname);
        if (!response.ok) issues.push(`${pathname}:http_${response.status}`);
        const expectedCanonical = `${baseUrl}${pathname}`;
        if (canonicalFromHtml(html) !== expectedCanonical) issues.push(`${pathname}:canonical`);
        if (isNoindex(response, html) === item.decision.indexable) issues.push(`${pathname}:robots`);
      } catch (error) {
        issues.push(`${pathname}:fetch_${error instanceof Error ? error.name : 'error'}`);
      }
    }
    return { slug: item.slug, indexable: item.decision.indexable, reason: item.decision.reason, issues };
  });
  const pageIssues = pageChecks.filter((check) => check.issues.length > 0);
  const reasonCounts = decisions.reduce<Record<string, number>>((counts, item) => {
    counts[item.decision.reason] = (counts[item.decision.reason] || 0) + 1;
    return counts;
  }, {});
  const failures = duplicateSitemapUrls.length + missingToolUrls.length + unexpectedToolUrls.length + duplicateCanonicalEntities.length + pageIssues.length;
  const report = {
    auditedAt: new Date().toISOString(),
    baseUrl,
    success: failures === 0,
    database: { total: rows.length, published: published.length, indexable: indexable.length, reasonCounts },
    sitemap: {
      totalUrls: sitemapUrls.length,
      toolUrls: sitemapToolUrls.length,
      duplicateUrls: duplicateSitemapUrls,
      missingToolUrls,
      unexpectedToolUrls,
    },
    duplicateCanonicalEntities,
    pageChecks: { checkedTools: pageChecks.length, issueCount: pageIssues.length, issues: pageIssues },
  };
  if (outputArg) {
    const outputPath = path.resolve(outputArg);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  }
  console.log(JSON.stringify(report, null, 2));
  if (!report.success) throw new Error(`Index consistency audit failed with ${failures} issue group(s).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
