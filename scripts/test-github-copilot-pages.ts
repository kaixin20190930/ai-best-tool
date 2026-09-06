import assert from 'node:assert/strict';
import fs from 'node:fs';

const linkedPages = [
  'app/[locale]/(with-footer)/best-ai-tools/[topic]/page.tsx',
  'app/[locale]/(with-footer)/guides/ai-tools-for-developers/page.tsx',
  'app/[locale]/(with-footer)/guides/ai-coding-tools-comparison/page.tsx',
  'app/[locale]/(with-footer)/guides/ai-coding-tools/page.tsx',
];

async function main() {
  for (const file of linkedPages) {
    const source = fs.readFileSync(file, 'utf8');
    assert(source.includes('/ai/github-copilot'), `${file}: GitHub Copilot route missing`);
    assert(!/name: 'GitHub Copilot'[\s\S]{0,180}\/ai\/copilot/.test(source), `${file}: points to Microsoft Copilot`);
  }
  console.log('PASS four developer entry points keep GitHub and Microsoft Copilot identities separate');

  const base = process.env.SEO_BASE_URL;
  if (!base) return;
  for (const [path, expected] of [
    ['/ai/github-copilot', ['GitHub Copilot', 'AI Credits', 'Content exclusion']],
    ['/cn/ai/github-copilot', ['GitHub Copilot', 'AI Credits', '内容排除']],
  ] as const) {
    const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(20000) });
    assert.equal(response.status, 200, path);
    const html = await response.text();
    const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    for (const term of expected) assert(visible.includes(term), `${path}: ${term} missing`);
    assert(/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html), `${path}: noindex missing`);
    assert(html.includes(`<link rel="canonical" href="https://aibesttool.com${path}"`), `${path}: canonical changed`);
    console.log(`PASS ${path}: identity, evidence, canonical and noindex`);
  }
  const sitemap = await fetch(`${base}/sitemap.xml`, { signal: AbortSignal.timeout(20000) });
  assert.equal(sitemap.status, 200);
  assert(!/<loc>[^<]*\/ai\/github-copilot\/?<\/loc>/.test(await sitemap.text()), 'GitHub Copilot must stay outside sitemap');
  console.log('PASS sitemap: GitHub Copilot excluded while monitored');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
