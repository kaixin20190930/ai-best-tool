import { createElement } from 'react';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { config } from 'dotenv';
import { JSDOM } from 'jsdom';
import { Client } from 'pg';
import { renderToStaticMarkup } from 'react-dom/server';
import Markdown from 'react-markdown';

import { getCanonicalToolSlug } from '../lib/config/toolRouteAliases';
import { getDatabaseConnectionString } from '../lib/database/connection';
import { getToolIndexDecision } from '../lib/seo/toolIndexing';

const phase = process.argv.find((arg) => arg.startsWith('--phase='))?.split('=')[1] || 'baseline';
const output =
  process.argv.find((arg) => arg.startsWith('--output='))?.slice(9) ||
  `reports/releases/2026-09-14/production-${phase}.json`;
assert(['baseline', 'media', 'released'].includes(phase));
const selectedCandidate = process.argv.find((arg) => arg.startsWith('--candidate='))?.split('=')[1];
assert(!selectedCandidate || ['lovable', 'midjourney', 'elevenlabs'].includes(selectedCandidate));
const requestBaseUrl = (process.env.SEO_BASE_URL || 'https://aibesttool.com').replace(/\/$/, '');
const hash = (value: Buffer | string) => createHash('sha256').update(value).digest('hex');
const normalizeText = (value: string) => value.replace(/\s+/g, ' ').trim();
const candidateAliases: Record<string, string[]> = {
  lovable: ['lovable', 'lovable-dev', 'lovable.dev'],
  midjourney: ['midjourney', 'mid-journey', 'midjourney.com'],
  elevenlabs: ['elevenlabs', 'eleven-labs', 'elevenlabs.io'],
};

async function main() {
  config({ path: '.env.local', quiet: true });
  const client = new Client({ connectionString: getDatabaseConnectionString() });
  const report: {
    checkedAt: string;
    requestBaseUrl: string;
    phase: string;
    productionWrites: number;
    candidates: unknown[];
    failures: string[];
    sitemap?: unknown;
  } = { checkedAt: new Date().toISOString(), requestBaseUrl, phase, productionWrites: 0, candidates: [], failures: [] };
  await client.connect();
  try {
    await client.query('BEGIN READ ONLY');
    const sitemapResponse = await fetch(`${requestBaseUrl}/sitemap.xml`, { signal: AbortSignal.timeout(20_000) });
    assert(sitemapResponse.ok);
    const sitemap = await sitemapResponse.text();
    report.sitemap = {
      status: sitemapResponse.status,
      urlCount: (sitemap.match(/<loc>/g) || []).length,
      sha256: hash(sitemap),
    };
    for (const slug of selectedCandidate ? [selectedCandidate] : ['lovable', 'midjourney']) {
      const payload = JSON.parse(fs.readFileSync(`data/collection/${slug}-release.json`, 'utf8'));
      const aliases = candidateAliases[slug];
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
        identityMatchesPayload: row.id === payload.id && row.name === slug && row.url === payload.officialUrl,
        featuresMatchPayload: isDeepStrictEqual(row.features, payload.features),
        mediaMatchPayload: row.image_url === payload.imageUrl && row.thumbnail_url === payload.thumbnailUrl,
        contentMatchesPayload: ['en', 'zh', 'cn'].every(
          (lang) =>
            row.title?.[lang] === payload.title[lang === 'cn' ? 'zh' : lang] &&
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
          const response = await fetch(`${requestBaseUrl}${pathname}`, {
            redirect: 'manual',
            signal: AbortSignal.timeout(20_000),
          });
          const html = await response.text();
          const document = new JSDOM(html).window.document;
          document.querySelectorAll('script,style,noscript').forEach((node) => node.remove());
          const body = document.body.textContent || '';
          const locale = prefix ? 'zh' : 'en';
          const expectedArticle = normalizeText(
            new JSDOM(renderToStaticMarkup(createElement(Markdown, null, payload.detail[locale]))).window.document.body
              .textContent || '',
          );
          const cardText = normalizeText(document.querySelector('#decision-card')?.textContent || '');
          const reviewedDate = new Date(`${payload.reviewedAt}T00:00:00Z`);
          const reviewedDateVariants = [
            payload.reviewedAt,
            new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(reviewedDate),
            new Intl.DateTimeFormat('zh-CN', { dateStyle: 'long', timeZone: 'UTC' }).format(reviewedDate),
          ];
          const requiredCardItems: string[] = [
            ...payload.features.audience.bestFit[locale],
            ...payload.features.audience.notIdealFor[locale],
            ...payload.features.decision.compareAxes[locale],
            ...payload.features.decision.limitations[locale],
          ];
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
            fullArticleMatchesPayload: Array.from(document.querySelectorAll('article')).some(
              (article) => normalizeText(article.textContent || '') === expectedArticle,
            ),
            missingDecisionCardItems: requiredCardItems.filter((item) => !cardText.includes(normalizeText(item))),
            imagePaths: Array.from(document.querySelectorAll('img')).map((img) => {
              const url = new URL(img.getAttribute('src') || '', 'https://aibesttool.com');
              return url.searchParams.get('url') || url.pathname;
            }),
            hasReviewedDate: reviewedDateVariants.some((value) => body.includes(value)),
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
              (!page.hasDecisionCard ||
                !page.hasPayloadCopy ||
                !h1.toLowerCase().includes(slug) ||
                !page.fullArticleMatchesPayload ||
                !page.hasReviewedDate ||
                page.missingDecisionCardItems.length > 0 ||
                !page.imagePaths.includes(payload.thumbnailUrl))
            ) report.failures.push(`${pathname}: released content missing`);
          } else if (inSitemap) report.failures.push(`${pathname}: alias entered sitemap`);
        }
      }
      const media = [];
      for (const assetPath of [payload.imageUrl, payload.thumbnailUrl]) {
        const response = await fetch(`${requestBaseUrl}${assetPath}`, { signal: AbortSignal.timeout(20_000) });
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
          !rows[0].identityMatchesPayload ||
          !rows[0].featuresMatchPayload ||
          !rows[0].mediaMatchPayload ||
          rows[0].indexDecision.indexable ||
          rows[0].nextReviewDate !== payload.nextReviewDate ||
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
