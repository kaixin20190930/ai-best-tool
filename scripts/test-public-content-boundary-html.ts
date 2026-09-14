import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

import { web3ComparisonFaqs } from '../lib/content/web3Comparison';
import { copyViolations } from './lib/public-content-boundary';

const baseUrl = process.env.SEO_BASE_URL || 'http://localhost:3017';
const baseline = JSON.parse(readFileSync('reports/public-content-boundary/pub-01-baseline.json', 'utf8'));
async function main() {
  const results = [];
  for (const previous of baseline.production) {
    const pathname = new URL(previous.url).pathname;
    const response = await fetch(`${baseUrl}${pathname}`, { signal: AbortSignal.timeout(120_000) });
    assert.equal(response.status, 200, pathname);
    const document = new JSDOM(await response.text()).window.document;
    const schema = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((el) =>
      JSON.parse(el.textContent || '{}'),
    );
    const seo = {
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
      alternates: Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]')).map((el) => [
        el.getAttribute('hreflang'),
        el.getAttribute('href'),
      ]),
      robots: document.querySelector('meta[name="robots"]')?.getAttribute('content'),
      xRobotsTag: response.headers.get('x-robots-tag'),
    };
    const { schema: oldSchema, ...previousSeo } = previous.seo;
    assert.deepEqual(JSON.parse(JSON.stringify(seo)), previousSeo, `${pathname}: frozen SEO fields drifted`);
    const sample = pathname.endsWith('/ai-tools-for-web3-comparison');
    if (sample) {
      assert.match(seo.xRobotsTag || '', /noindex, follow/);
      const language = pathname.startsWith('/cn/') ? 'cn' : 'en';
      const faqIndex = oldSchema.findIndex((item: { '@type': string }) => item['@type'] === 'FAQPage');
      const expected = structuredClone(oldSchema);
      expected[faqIndex].mainEntity.forEach((item: { acceptedAnswer: { text: string } }, index: number) => {
        item.acceptedAnswer.text = web3ComparisonFaqs[index].answer[language];
      });
      assert.deepEqual(schema, expected, `${pathname}: only approved FAQ answers may change`);
      const root = document.querySelector('[data-public-comparison="verified"]');
      assert.ok(root, `${pathname}: missing verified sample`);
      assert.equal(document.querySelectorAll('h1').length, 1);
      assert.equal(root.querySelectorAll('[data-comparison-section]').length, 6);
      for (const attribute of ['evidence', 'next', 'primary-cta'])
        assert.equal(root.querySelectorAll(`[data-comparison-${attribute}]`).length, 1);
      assert.equal(root.querySelectorAll('tbody tr').length, 4);
      assert.equal(root.querySelectorAll('a[href*="/submit"],a[href*="/developer/listing"]').length, 0);
      web3ComparisonFaqs.forEach((faq, index) => {
        const details = root.querySelectorAll('[data-comparison-faq] details')[index];
        assert.equal(details.querySelector('summary')?.textContent, faq.question[language]);
        assert.equal(details.querySelector('p')?.textContent, schema[faqIndex].mainEntity[index].acceptedAnswer.text);
      });
    }
    document.querySelectorAll('script,style,noscript').forEach((el) => el.remove());
    const violations = copyViolations(document.body.textContent || '');
    if (sample) assert.deepEqual(violations, [], `${pathname}: public internal copy`);
    else if (pathname.includes('/guides/')) assert.deepEqual(violations, [], `${pathname}: Guide public copy`);
    else assert.deepEqual(violations, previous.violations, `${pathname}: PUB-03 rendering remains frozen`);
    results.push({ pathname, status: response.status, seoFrozen: true, sample, violations });
  }
  const sitemap = await fetch(`${baseUrl}/sitemap.xml`, { signal: AbortSignal.timeout(60_000) });
  const urls = [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.equal(sitemap.status, 200);
  assert.ok(urls.length > 0);
  assert.ok(!urls.some((url) => url.includes('-comparison')));
  const productionSitemap = await fetch('https://aibesttool.com/sitemap.xml', { signal: AbortSignal.timeout(60_000) });
  const productionUrls = [...(await productionSitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(urls.sort(), productionUrls.sort(), 'Candidate sitemap differs from production');
  const report = { checkedAt: new Date().toISOString(), baseUrl, results, sitemapCount: urls.length, pass: true };
  writeFileSync('/tmp/pub-01-html-verification.json', `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
