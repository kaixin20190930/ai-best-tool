/** Verify every advertised URL from the built server, not a metadata helper sample. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

import { INDEXABLE_GUIDE_PATHS } from '../lib/seo/guideIndexing';

const base = process.env.SEO_BASE_URL || 'http://127.0.0.1:3108';
const reportPath = 'reports/seo-topic-consistency-2026-09-10/qa-revision/sitemap-pages.json';
async function main() {
  const response = await fetch(`${base}/sitemap.xml`, { signal: AbortSignal.timeout(60000) });
  assert.equal(response.status, 200);
  const xml = new JSDOM(await response.text(), { contentType: 'text/xml' }).window.document;
  assert(!xml.querySelector('parsererror'));
  const urls = [...xml.querySelectorAll('loc')].map((node) => new URL(node.textContent!));
  assert(urls.length > 0);
  assert.equal(new Set(urls.map(String)).size, urls.length);
  for (const path of INDEXABLE_GUIDE_PATHS) {
    for (const prefix of ['', '/cn'])
      assert(
        urls.some((url) => url.pathname === `${prefix}${path}`),
        `Missing guide: ${prefix}${path}`,
      );
  }
  const results: Array<{ url: string; status?: number; error?: string }> = [];
  const queue = [...urls];
  async function worker() {
    for (let url = queue.shift(); url; url = queue.shift()) {
      try {
        const response = await fetch(`${base}${url.pathname}`, {
          redirect: 'manual',
          signal: AbortSignal.timeout(60000),
        });
        assert.equal(response.status, 200, 'Advertised URL must return 200 without redirect.');
        assert(!response.headers.get('x-robots-tag')?.includes('noindex'), 'HTTP noindex');
        assert(!response.headers.get('link')?.includes('hreflang='), 'Competing HTTP language declarations');
        const document = new JSDOM(await response.text()).window.document;
        const robots = [...document.querySelectorAll('meta[name="robots"], meta[name="googlebot"]')];
        assert(!robots.some((node) => node.getAttribute('content')?.includes('noindex')), 'HTML noindex');
        const canonicals = [...document.querySelectorAll('link[rel="canonical"]')];
        assert.equal(canonicals.length, 1, 'Exactly one canonical');
        assert.equal(new URL(canonicals[0].getAttribute('href')!).href, url.href, 'Canonical disagrees with sitemap');
        const links = [...document.querySelectorAll('link[rel="alternate"][hreflang]')];
        assert.equal(links.length, 3, 'Exactly three HTML hreflang links');
        const path = url.pathname.replace(/^\/cn(?=\/|$)/, '') || '/';
        assert(!/^\/(en|jp|fr|de|es|pt|ru|tw)(?=\/|$)/.test(path), 'Historical language in sitemap');
        const expected = {
          en: `${url.origin}${path}`,
          'zh-CN': `${url.origin}/cn${path === '/' ? '' : path}`,
          'x-default': `${url.origin}${path}`,
        };
        assert.deepEqual(
          Object.fromEntries(links.map((node) => [node.getAttribute('hreflang'), new URL(node.getAttribute('href')!).href])),
          expected,
          'Incomplete or incorrect alternate set',
        );
        results.push({ url: url.href, status: response.status });
      } catch (error) {
        results.push({ url: url.href, error: error instanceof Error ? error.message : String(error) });
      }
    }
  }
  await Promise.all([worker(), worker()]);
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2) + '\n');
  const failures = results.filter((result) => result.error);
  assert.deepEqual(failures, [], `${failures.length}/${urls.length} sitemap pages failed. See ${reportPath}`);
  console.log(
    `All ${urls.length} sitemap URLs passed HTTP/HTML robots, canonical and exact en/zh-CN/x-default alternates; all ${INDEXABLE_GUIDE_PATHS.size * 2} guide URLs included.`,
  );
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
