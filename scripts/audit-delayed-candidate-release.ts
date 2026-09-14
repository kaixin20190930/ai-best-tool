import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { config } from 'dotenv';
import { JSDOM } from 'jsdom';
import { Client } from 'pg';

import { getCanonicalToolSlug } from '../lib/config/toolRouteAliases';
import { getDatabaseConnectionString } from '../lib/database/connection';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';

const phase = process.argv.find((arg) => arg.startsWith('--phase='))?.split('=')[1] || 'baseline';
const output =
  process.argv.find((arg) => arg.startsWith('--output='))?.slice(9) ||
  `reports/releases/2026-09-14/production-${phase}.json`;
assert(['baseline', 'media', 'released'].includes(phase));
const hash = (value: Buffer | string) => createHash('sha256').update(value).digest('hex');

async function main() {
  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  const report: {
    checkedAt: string;
    phase: string;
    productionWrites: number;
    candidates: unknown[];
    failures: string[];
    sitemap?: unknown;
  } = { checkedAt: new Date().toISOString(), phase, productionWrites: 0, candidates: [], failures: [] };
  await client.connect();
  try {
    await client.query('BEGIN READ ONLY');
    const sitemapResponse = await fetch('https://aibesttool.com/sitemap.xml', { signal: AbortSignal.timeout(20_000) });
    assert(sitemapResponse.ok);
    const sitemap = await sitemapResponse.text();
    report.sitemap = {
      status: sitemapResponse.status,
      urlCount: (sitemap.match(/<loc>/g) || []).length,
      sha256: hash(sitemap),
    };
    for (const slug of ['lovable', 'midjourney']) {
      const payload = JSON.parse(fs.readFileSync(`data/collection/${slug}-release.json`, 'utf8'));
      const aliases =
        slug === 'lovable'
          ? ['lovable', 'lovable-dev', 'lovable.dev']
          : ['midjourney', 'mid-journey', 'midjourney.com'];
      const result = await client.query(
        'SELECT id,name,url,status,page_quality_status,category_id,title,content,detail,features,image_url,thumbnail_url,pricing,tags,next_review_date::text AS next_review_date,created_at,updated_at FROM tools WHERE lower(name)=ANY($1::text[]) OR url ILIKE $2 OR title::text ILIKE $3',
        [aliases, `%${new URL(payload.officialUrl).hostname.replace(/^www\./, '')}%`, `%${slug}%`],
      );
      const rows = result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        url: row.url,
        status: row.status,
        pageQualityStatus: row.page_quality_status,
        reviewedAt: row.features?.editorial?.reviewedAt,
        nextReviewDate: row.next_review_date,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        contentMatchesPayload: ['en', 'zh', 'cn'].every(
          (lang) =>
            row.content?.[lang] === payload.content[lang === 'cn' ? 'zh' : lang] &&
            row.detail?.[lang] === payload.detail[lang === 'cn' ? 'zh' : lang],
        ),
        indexDecision: getToolIndexDecision({
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
      const pages = [];
      for (const prefix of ['', '/cn']) {
        for (const routeSlug of [slug, aliases[1]]) {
          const pathname = `${prefix}/ai/${routeSlug}`;
          const response = await fetch(`https://aibesttool.com${pathname}`, {
            redirect: 'manual',
            signal: AbortSignal.timeout(20_000),
          });
          const html = await response.text();
          const document = new JSDOM(html).window.document;
          const body = document.body.textContent || '';
          const h1 = document.querySelector('h1')?.textContent || '';
          const inSitemap = sitemap.includes(`<loc>https://aibesttool.com${pathname}</loc>`);
          const page = {
            pathname,
            status: response.status,
            location: response.headers.get('location'),
            canonical: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href,
            robots: document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.content,
            xRobotsTag: response.headers.get('x-robots-tag'),
            h1,
            hasDecisionCard: Boolean(document.querySelector('#decision-card')),
            hasPayloadCopy: body.includes(payload.content[prefix ? 'zh' : 'en']),
            hasReviewedDate:
              body.includes('2026') &&
              (body.includes('Sep 14') || body.includes('9月14') || body.includes('2026-09-14')),
            inSitemap,
            htmlSha256: hash(html),
          };
          pages.push(page);
          if (routeSlug === slug) {
            if (
              page.status !== 200 ||
              page.canonical !== `https://aibesttool.com${pathname}` ||
              !`${page.robots},${page.xRobotsTag}`.includes('noindex') ||
              inSitemap
            ) report.failures.push(`${pathname}: route/index boundary failed`);
            if (
              phase === 'released' &&
              (!page.hasDecisionCard || !page.hasPayloadCopy || !h1.toLowerCase().includes(slug))
            ) report.failures.push(`${pathname}: released content missing`);
          } else if (inSitemap) report.failures.push(`${pathname}: alias entered sitemap`);
        }
      }
      const media = [];
      for (const assetPath of [payload.imageUrl, payload.thumbnailUrl]) {
        const response = await fetch(`https://aibesttool.com${assetPath}`, { signal: AbortSignal.timeout(20_000) });
        const bytes = Buffer.from(await response.arrayBuffer());
        const localHash = hash(fs.readFileSync(`public${assetPath}`));
        const item = {
          path: assetPath,
          status: response.status,
          contentType: response.headers.get('content-type'),
          sha256: hash(bytes),
          expectedSha256: localHash,
          ready:
            response.ok &&
            response.headers.get('content-type')?.startsWith('image/') === true &&
            hash(bytes) === localHash,
        };
        media.push(item);
        if (phase !== 'baseline' && !item.ready) report.failures.push(`${slug}: production media unavailable or different: ${assetPath}`);
      }
      if (phase === 'baseline' && rows.length !== 0) report.failures.push(`${slug}: existing entity requires review`);
      if (
        phase === 'released' &&
        (rows.length !== 1 ||
          rows[0].status !== 'published' ||
          rows[0].pageQualityStatus !== 'monitor' ||
          !rows[0].contentMatchesPayload ||
          rows[0].indexDecision.indexable ||
          rows[0].reviewedAt !== payload.reviewedAt)
      ) report.failures.push(`${slug}: database release contract failed`);
      report.candidates.push({
        slug,
        canonicalSlug: getCanonicalToolSlug(slug),
        identityQuery: 'slug, aliases, official domain and localized title',
        rows,
        pages,
        media,
      });
    }
    await client.query('COMMIT');
  } finally {
    await client.end();
    fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
  }
  console.log(
    `${report.failures.length ? 'FAIL' : 'PASS'} ${phase}: ${output}; ${report.failures.length} failure(s); read-only`,
  );
  report.failures.forEach((failure) => console.log(failure));
  process.exitCode = report.failures.length ? 1 : 0;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Audit failed');
  process.exitCode = 1;
});
