import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

async function main() {
  const base = process.env.SEO_BASE_URL || 'http://localhost:3107';
  const audit = JSON.parse(fs.readFileSync('data/collection/n8n-preaudit-2026-09-01.json', 'utf8'));
  const released = audit.status === 'released';
  for (const path of ['/ai/n8n', '/cn/ai/n8n']) {
    const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(60000) });
    assert.equal(response.status, 200, path);
    const document = new JSDOM(await response.text()).window.document;
    assert.equal(
      document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
      `https://aibesttool.com${path}`,
    );
    const robots = `${document.querySelector('meta[name="robots"]')?.getAttribute('content') || ''},${response.headers.get('x-robots-tag') || ''}`;
    assert.equal(robots.includes('noindex'), !released, `${path}: robots must match publication state`);
    document.querySelectorAll('script, style').forEach((node) => node.remove());
    const body = document.body.textContent || '';
    for (const term of ['2026-09-04', 'Sustainable Use License', 'Community', '€667', 'AI Assistant']) {
      assert(body.includes(term), `${path}: missing visible ${term}`);
    }
    if (released) {
      assert(
        body.includes(path.startsWith('/cn/') ? '成功业务结果' : 'successful business outcomes'),
        `${path}: migrated decision content must be visible`,
      );
    }
    assert(document.querySelector('a[href="https://docs.n8n.io/privacy-and-security/sustainable-use-license"]'));
    console.log(`${path}: evidence, official sources, canonical and ${released ? 'index' : 'noindex'} passed`);
  }
  const response = await fetch(`${base}/sitemap.xml`, { signal: AbortSignal.timeout(60000) });
  assert.equal(response.status, 200);
  const document = new JSDOM(await response.text(), { contentType: 'text/xml' }).window.document;
  const urls = Array.from(document.querySelectorAll('loc'))
    .map((node) => node.textContent || '')
    .filter((url) => /\/ai\/n8n\/?$/.test(url));
  assert.deepEqual(urls.sort(), released ? ['https://aibesttool.com/ai/n8n', 'https://aibesttool.com/cn/ai/n8n'] : []);
  console.log(`Sitemap: ${released ? 'exactly two localized n8n URLs' : 'n8n excluded before publication'}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
