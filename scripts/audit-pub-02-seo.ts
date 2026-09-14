import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

import { INDEXABLE_GUIDE_PATHS } from '../lib/seo/guideIndexing';
import { copyViolations } from './lib/public-content-boundary';

const capture = process.argv.includes('--capture');
const base = process.env.SEO_BASE_URL || (capture ? 'https://aibesttool.com' : 'http://127.0.0.1:3027');
const directory = 'reports/public-content-boundary/';
const manifest = JSON.parse(readFileSync(`${directory}pub-02-comparison-disposition.json`, 'utf8'));
const paths = [
  ...new Set([...INDEXABLE_GUIDE_PATHS, ...manifest.pages.map((page: { path: string }) => page.path)]),
].flatMap((path) => [String(path), `/cn${path}`]);
async function inspect(path: string) {
  const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(90_000) });
  assert.equal(response.status, 200, `${path}: status`);
  const document = new JSDOM(await response.text()).window.document;
  const schemas = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((node) =>
    JSON.parse(node.textContent || '{}'),
  );
  const head = {
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') || null,
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || null,
    hreflang: Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]')).map((node) => [
      node.getAttribute('hreflang'),
      node.getAttribute('href'),
    ]),
    robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') || null,
    xRobotsTag: response.headers.get('x-robots-tag'),
  };
  const state = document.querySelector('[data-public-comparison]')?.getAttribute('data-public-comparison') || null;
  const structures = {
    h1: document.querySelectorAll('h1').length,
    evidence: document.querySelectorAll('[data-comparison-evidence]').length,
    next: document.querySelectorAll('[data-comparison-next]').length,
    primaryCta: document.querySelectorAll('[data-comparison-primary-cta]').length,
    guideChecks: document.querySelectorAll('[data-guide-task-checks]').length,
    guideNext: document.querySelectorAll('[data-guide-next] a').length,
  };
  const visibleFaqs = Array.from(document.querySelectorAll('[data-comparison-faq] details')).map((node) => [
    node.querySelector('summary')?.textContent,
    node.querySelector('p')?.textContent,
  ]);
  document.querySelectorAll('script,style,noscript,header,footer').forEach((node) => node.remove());
  const violations = copyViolations(document.body.textContent || '');
  return { path, head, schemas, state, structures, visibleFaqs, violations };
}
async function main() {
  const results: Awaited<ReturnType<typeof inspect>>[] = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (next < paths.length) {
        const path = paths[next++];
        results.push(await inspect(path));
        if (results.length % 20 === 0) console.log(`Checked ${results.length}/${paths.length}`);
      }
    }),
  );
  results.sort((a, b) => a.path.localeCompare(b.path));
  const response = await fetch(`${base}/sitemap.xml`, { signal: AbortSignal.timeout(60_000) });
  assert.equal(response.status, 200);
  const sitemap = [...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1]).sort();
  if (capture) {
    writeFileSync(
      `${directory}pub-02-seo-before.json`,
      JSON.stringify({ base, capturedAt: new Date().toISOString(), results, sitemap }, null, 2) + '\n',
    );
    console.log('Captured baseline');
    return;
  }
  const before = JSON.parse(readFileSync(`${directory}pub-02-seo-before.json`, 'utf8'));
  assert.deepEqual(sitemap, before.sitemap, 'Sitemap URL set changed');
  const diffs = [];
  for (const current of results) {
    const old = before.results.find((x: { path: string }) => x.path === current.path);
    assert.deepEqual(current.head, old.head, `${current.path}: frozen head changed`);
    assert.deepEqual(current.violations, [], `${current.path}: public internal language`);
    assert.equal(current.structures.h1, 1, `${current.path}: h1`);
    if (current.path.endsWith('-comparison')) {
      assert.match(current.head.xRobotsTag || '', /noindex/);
      assert.equal(current.structures.next, 1);
      assert.equal(current.structures.primaryCta, 1);
      const breadcrumbs = (items: any[]) => items.filter((item) => item['@type'] === 'BreadcrumbList');
      assert.deepEqual(breadcrumbs(current.schemas), breadcrumbs(old.schemas), `${current.path}: breadcrumb frozen`);
      if (current.state === 'unavailable') {
        assert.ok(current.schemas.every((item) => !['FAQPage', 'ItemList'].includes(item['@type'])));
        const removed = old.schemas.filter((item: any) => ['FAQPage', 'ItemList'].includes(item['@type']));
        assert.deepEqual(
          current.schemas,
          old.schemas.filter((item: any) => !['FAQPage', 'ItemList'].includes(item['@type'])),
          `${current.path}: only optional comparison schemas may be removed`,
        );
        diffs.push({
          path: current.path,
          removed,
          added: [],
          reason:
            'No sourced candidate-by-dimension comparison; legacy generic FAQ claims and search/popularity ItemList withdrawn under controller approval.',
        });
      } else {
        assert.equal(current.state, 'verified');
        assert.deepEqual(current.schemas, old.schemas, `${current.path}: sourced sample schema must remain unchanged`);
        const faq = current.schemas.find((item) => item['@type'] === 'FAQPage');
        assert.deepEqual(
          current.visibleFaqs,
          faq.mainEntity.map((item: any) => [item.name, item.acceptedAnswer.text]),
        );
        diffs.push({ path: current.path, removed: [], added: [], reason: 'Verified Web3 sample preserved.' });
      }
    } else {
      assert.deepEqual(current.schemas, old.schemas, `${current.path}: Guide schema frozen`);
      assert.equal(current.structures.guideChecks, 1);
      assert.equal(current.structures.guideNext, 2);
      assert.equal(current.structures.evidence, 1);
    }
  }
  writeFileSync(
    `${directory}pub-02-schema-diff.json`,
    JSON.stringify(
      { approvedException: 'Controller message 2026-09-14; optional invalid FAQ/ItemList only', pages: diffs },
      null,
      2,
    ) + '\n',
  );
  writeFileSync(
    `${directory}pub-02-html-verification.json`,
    JSON.stringify(
      { base, checkedAt: new Date().toISOString(), pass: true, results, sitemapCount: sitemap.length },
      null,
      2,
    ) + '\n',
  );
  console.log(
    `PASS ${results.length} bilingual pages; frozen head, breadcrumb, valid schema/body, sitemap ${sitemap.length}`,
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
