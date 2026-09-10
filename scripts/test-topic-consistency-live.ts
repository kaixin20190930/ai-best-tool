import assert from 'node:assert/strict';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { JSDOM } from 'jsdom';

import { getCanonicalToolSlug } from '../lib/config/toolRouteAliases';
import { topListTopics } from '../lib/data/topLists';
import { getEditorialReviewRecord } from '../lib/seo/contentReviewDates';
import { getStaticPageLastModified } from '../lib/seo/staticPageDates';
import { getTopicCatalog } from '../lib/services/topicTools';

for (const path of ['.env.local', '.env.production']) dotenv.config({ path, quiet: true });
const base = process.env.SEO_BASE_URL || 'http://127.0.0.1:3108';
const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://aibesttool.com';

async function read(path: string) {
  const response = await fetch(`${base}${path}`, { redirect: 'manual', signal: AbortSignal.timeout(60000) });
  return { response, html: await response.text() };
}

async function main() {
  const catalog = await getTopicCatalog();
  const sitemap = await read('/sitemap.xml');
  assert.equal(sitemap.response.status, 200);
  const xml = new JSDOM(sitemap.html, { contentType: 'text/xml' }).window.document;
  assert.equal(xml.querySelector('parsererror'), null);
  const sitemapPaths = new Set([...xml.querySelectorAll('loc')].map((node) => new URL(node.textContent!).pathname));
  for (const node of xml.querySelectorAll('url')) {
    const path = new URL(node.querySelector('loc')!.textContent!).pathname.replace(/^\/cn(?=\/|$)/, '') || '/';
    if (!/^\/(ai|categories)\//.test(path)) {
      assert.equal(node.querySelector('lastmod')?.textContent, getStaticPageLastModified(path).toISOString());
    }
  }
  const results: Array<{ path: string; status: number; count: number; indexable: boolean }> = [];
  for (const topic of topListTopics) {
    const data = catalog.topics.get(topic.key)!;
    await Promise.all(
      ['en', 'cn'].map(async (locale) => {
        const path = `${locale === 'cn' ? '/cn' : ''}/best-ai-tools/${topic.key}`;
        const { response, html } = await read(path);
        assert.equal(response.status, 200, path);
        assert(!response.headers.get('link')?.includes('hreflang='), `${path}: competing HTTP alternates`);
        const document = new JSDOM(html).window.document;
        document.querySelectorAll('script').forEach((node) => node.remove());
        const text = document.body.textContent || '';
        const noindex = [...document.querySelectorAll('meta[name="robots"]')].some((node) =>
          node.getAttribute('content')?.includes('noindex'),
        );
        assert.equal(noindex, !data.indexable, `${path}: robots`);
        assert.equal(sitemapPaths.has(path), data.indexable, `${path}: sitemap`);
        const languages = Object.fromEntries(
          [...document.querySelectorAll('link[hreflang]')].map((link) => [
            link.getAttribute('hreflang'),
            link.getAttribute('href'),
          ]),
        );
        assert.deepEqual(
          languages,
          data.indexable
            ? {
                en: `${site}/best-ai-tools/${topic.key}`,
                'zh-CN': `${site}/cn/best-ai-tools/${topic.key}`,
                'x-default': `${site}/best-ai-tools/${topic.key}`,
              }
            : {},
          `${path}: metadata alternates`,
        );
        const countLabel = [...document.querySelectorAll('p')].find(
          (node) => node.textContent === (locale === 'cn' ? '匹配工具数' : 'Matching tools'),
        );
        assert.equal(countLabel?.nextElementSibling?.textContent, String(data.toolCount), `${path}: count`);
        const cards = [...document.querySelectorAll('p')].filter((node) => /^#\d+$/.test(node.textContent || ''));
        assert.equal(cards.length, data.tools.length, `${path}: visible tool cards`);
        if (data.indexable) assert(cards.length >= 2, `${path}: indexable list needs two candidates`);
        const topicSection = document.querySelector(`[data-topic="${topic.key}"]`)!;
        assert(topicSection, `${path}: topic content missing`);
        const allowedToolSlugs = data.tools.map((tool) => getCanonicalToolSlug(tool.name));
        for (const link of topicSection.querySelectorAll('a[href]')) {
          const href = link.getAttribute('href')!;
          if (/\/ai\//.test(href) && href.startsWith('/')) {
            assert(allowedToolSlugs.includes(getCanonicalToolSlug(decodeURIComponent(href.split('/').pop()!))), `${path}: unreviewed example link ${href}`);
          }
        }
        assert(text.includes(getEditorialReviewRecord('best-topic-template').reviewedAt), `${path}: panel date`);
        assert(
          !/2026-07-15|转化|routes traffic|pure traffic|keep clicking/.test(text),
          `${path}: stale date or operator copy`,
        );
        results.push({ path, status: response.status, count: data.toolCount, indexable: data.indexable });
      }),
    );
    console.log(`${topic.key}: ${data.toolCount} matches; indexable=${data.indexable}`);
  }
  for (const locale of ['jp', 'fr', 'tw']) {
    const { response, html } = await read(`/${locale}/best-ai-tools/ai-automation-tools`);
    assert.equal(response.status, 200);
    const document = new JSDOM(html).window.document;
    assert.equal(document.querySelectorAll('link[hreflang]').length, 0);
    assert(document.querySelector('meta[name="robots"]')?.getAttribute('content')?.includes('noindex'));
    assert(!response.headers.get('link')?.includes('hreflang='));
  }
  const unknown = await read('/best-ai-tools/unknown-topic');
  // Next can already have streamed layout bytes before notFound: verify its
  // noindex/error boundary, not an unconditional HTTP 404 promise.
  assert([200, 404].includes(unknown.response.status));
  const unknownDocument = new JSDOM(unknown.html).window.document;
  assert(unknownDocument.querySelector('meta[name="robots"]')?.getAttribute('content')?.includes('noindex'));
  assert.equal(unknownDocument.querySelectorAll('link[hreflang]').length, 0);
  assert(!sitemapPaths.has('/best-ai-tools/unknown-topic'));
  const second = await read('/sitemap.xml');
  assert.equal(second.html, sitemap.html, 'Repeated sitemap requests must have stable lastmod.');
  fs.writeFileSync('reports/seo-topic-consistency-2026-09-10/qa-revision/live-pages.json', JSON.stringify(results, null, 2) + '\n');
  console.log(
    `Live checks passed: ${results.length} topic pages, 3 historical locales, unknown-topic noindex, and actual sitemap XML.`,
  );
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
