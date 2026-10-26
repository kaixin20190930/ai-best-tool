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
    for (const term of ['Sustainable Use License', 'Community', '€667', 'AI Assistant']) {
      assert(body.includes(term), `${path}: missing visible ${term}`);
    }
    assert(document.querySelector('[data-official-evidence="true"]'), `${path}: official evidence block must be visible`);
    if (released) {
      assert(
        body.includes(path.startsWith('/cn/') ? '成功业务结果' : 'successful business outcomes'),
        `${path}: migrated decision content must be visible`,
      );
    }
    assert(document.querySelector('a[href="https://docs.n8n.io/privacy-and-security/sustainable-use-license"]'));
    const expectedGuideHref = path.startsWith('/cn/')
      ? '/cn/guides/n8n-self-hosted-requirements'
      : '/guides/n8n-self-hosted-requirements';
    assert(document.querySelector(`a[href="${expectedGuideHref}"]`));
    console.log(`${path}: evidence, official sources, canonical and ${released ? 'index' : 'noindex'} passed`);
  }
  for (const path of ['/guides/n8n-self-hosted-requirements', '/cn/guides/n8n-self-hosted-requirements']) {
    const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(60000) });
    assert.equal(response.status, 200, path);
    const document = new JSDOM(await response.text()).window.document;
    assert.equal(
      document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
      `https://aibesttool.com${path}`,
    );
    const robots = `${document.querySelector('meta[name="robots"]')?.getAttribute('content') || ''},${response.headers.get('x-robots-tag') || ''}`;
    assert.equal(robots.includes('noindex'), false, `${path}: reviewed guide must be indexable`);
    document.querySelectorAll('script, style').forEach((node) => node.remove());
    const body = document.body.textContent || '';
    for (const term of ['N8N_ENCRYPTION_KEY', 'N8N_WEBHOOK_URL', 'PostgreSQL', 'queue mode', 'E0']) {
      assert(body.includes(term), `${path}: missing visible ${term}`);
    }
    assert(
      document.querySelector(
        'a[href="https://docs.n8n.io/deploy/host-n8n/install-options/install-using-docker-compose/"]',
      ),
      `${path}: current official Docker Compose source must be visible`,
    );
    assert(document.querySelector('a[href$="/ai/n8n#decision-card"]'));
    console.log(`${path}: requirements, evidence boundary, canonical and index passed`);
  }
  const response = await fetch(`${base}/sitemap.xml`, { signal: AbortSignal.timeout(60000) });
  assert.equal(response.status, 200);
  const document = new JSDOM(await response.text(), { contentType: 'text/xml' }).window.document;
  const urls = Array.from(document.querySelectorAll('loc'))
    .map((node) => node.textContent || '')
    .filter((url) => /\/ai\/n8n\/?$/.test(url));
  assert.deepEqual(urls.sort(), released ? ['https://aibesttool.com/ai/n8n', 'https://aibesttool.com/cn/ai/n8n'] : []);
  const guideUrls = Array.from(document.querySelectorAll('loc'))
    .map((node) => node.textContent || '')
    .filter((url) => /\/guides\/n8n-self-hosted-requirements\/?$/.test(url));
  assert.deepEqual(guideUrls.sort(), [
    'https://aibesttool.com/cn/guides/n8n-self-hosted-requirements',
    'https://aibesttool.com/guides/n8n-self-hosted-requirements',
  ]);
  console.log(`Sitemap: ${released ? 'exactly two localized n8n URLs' : 'n8n excluded before publication'}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
