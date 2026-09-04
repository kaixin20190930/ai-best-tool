import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

async function main() {
  const base = process.env.SEO_BASE_URL || 'http://localhost:3107';
  for (const path of ['/ai/openrouter', '/cn/ai/openrouter']) {
    const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(60000) });
    assert.equal(response.status, 200, path);
    const document = new JSDOM(await response.text()).window.document;
    assert(document.title.includes('OpenRouter'), `${path}: title`);
    assert.equal(
      document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
      `https://aibesttool.com${path}`,
    );
    assert(
      !`${document.querySelector('meta[name="robots"]')?.getAttribute('content') || ''},${response.headers.get('x-robots-tag') || ''}`.includes(
        'noindex',
      ),
    );
    document.querySelectorAll('script, style').forEach((element) => element.remove());
    const body = document.body.textContent || '';
    assert(body.includes('2026-09-04'), `${path}: updated evidence date`);
    assert(body.includes('$25,000'), `${path}: current BYOK threshold`);
    assert(!body.includes('one million BYOK') && !body.includes('100 万请求'), `${path}: obsolete terms`);
    assert(body.includes('fallback'), `${path}: decision content`);
    assert(document.querySelector('a[href="https://openrouter.ai/pricing"]'), `${path}: official source`);
    console.log(`${path}: 200, canonical, index, current evidence and source passed`);
  }
  const response = await fetch(`${base}/sitemap.xml`, { signal: AbortSignal.timeout(60000) });
  assert.equal(response.status, 200);
  const document = new JSDOM(await response.text(), { contentType: 'text/xml' }).window.document;
  const urls = Array.from(document.querySelectorAll('loc'))
    .map((node) => node.textContent || '')
    .filter((url) => /\/ai\/openrouter\/?$/.test(url));
  assert.deepEqual(urls.sort(), ['https://aibesttool.com/ai/openrouter', 'https://aibesttool.com/cn/ai/openrouter']);
  console.log('Sitemap: exactly two localized OpenRouter canonical URLs');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
