import assert from 'node:assert/strict';

import { PRIORITY_TOOL_EVIDENCE } from '../lib/config/priorityToolEvidence';

async function main() {
  const base = process.env.SEO_BASE_URL || 'http://localhost:3000';
  for (const [path, language] of [
    ['/ai/gamma', 'en'],
    ['/cn/ai/gamma', 'zh'],
  ] as const) {
    const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(20000) });
    assert.equal(response.status, 200, path);
    const html = await response.text();
    // RSC payloads can contain text that is not actually visible on the page.
    const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    assert(visible.includes(PRIORITY_TOOL_EVIDENCE.gamma.limitation[language]), `${path}: visible evidence missing`);
    assert(visible.includes(PRIORITY_TOOL_EVIDENCE.gamma.checkedAt), `${path}: scoped check date missing`);
    assert(/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html), `${path}: noindex missing`);
    assert(html.includes(`<link rel="canonical" href="https://aibesttool.com${path}"`), `${path}: canonical changed`);
    console.log(`PASS ${path}: visible export limits, scoped date, canonical and noindex`);
  }
  const response = await fetch(`${base}/sitemap.xml`, { signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, 200);
  assert(!/<loc>[^<]*\/ai\/gamma\/?<\/loc>/.test(await response.text()), 'Gamma must remain outside sitemap');
  console.log('PASS sitemap: Gamma excluded');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
