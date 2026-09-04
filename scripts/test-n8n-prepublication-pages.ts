import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

async function main() {
  const base = process.env.SEO_BASE_URL || 'http://localhost:3107';
  for (const path of ['/ai/n8n', '/cn/ai/n8n']) {
    const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(60000) });
    assert.equal(response.status, 200, path);
    const document = new JSDOM(await response.text()).window.document;
    assert.equal(
      document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
      `https://aibesttool.com${path}`,
    );
    assert(
      document.querySelector('meta[name="robots"]')?.getAttribute('content')?.includes('noindex'),
      `${path}: preserve prepublication noindex`,
    );
    document.querySelectorAll('script, style').forEach((node) => node.remove());
    const body = document.body.textContent || '';
    for (const term of ['2026-09-04', 'Sustainable Use License', 'Community', '€667', 'AI Assistant']) {
      assert(body.includes(term), `${path}: missing visible ${term}`);
    }
    assert(document.querySelector('a[href="https://docs.n8n.io/privacy-and-security/sustainable-use-license"]'));
    console.log(`${path}: current evidence, official sources, canonical and noindex passed`);
  }
  const response = await fetch(`${base}/sitemap.xml`, { signal: AbortSignal.timeout(60000) });
  assert.equal(response.status, 200);
  const document = new JSDOM(await response.text(), { contentType: 'text/xml' }).window.document;
  assert(!Array.from(document.querySelectorAll('loc')).some((node) => /\/ai\/n8n\/?$/.test(node.textContent || '')));
  console.log('Sitemap: n8n remains excluded before publication');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
