import assert from 'node:assert/strict';
import fs from 'node:fs';

const linkedPages = [
  'app/[locale]/(with-footer)/guides/ai-tools-for-research/page.tsx',
  'app/[locale]/(with-footer)/guides/perplexity-alternatives-comparison/page.tsx',
  'app/[locale]/(with-footer)/guides/ai-tools-for-research-comparison/page.tsx',
];

async function main() {
  const evidenceConfig = fs.readFileSync('lib/config/priorityToolEvidence.ts', 'utf8');
  for (const term of [
    'notebooklm:',
    '600 sources',
    '600 个来源',
    'citation accuracy',
    'Workspace for Education',
    'support.google.com/notebooklm/answer/16164461',
    'support.google.com/googleone/answer/16105039',
  ]) {
    assert(evidenceConfig.includes(term), `NotebookLM evidence snapshot: ${term} missing`);
  }
  console.log('PASS NotebookLM official evidence snapshot retains limits and account boundaries');

  for (const file of linkedPages) {
    const source = fs.readFileSync(file, 'utf8');
    assert(source.includes('notebooklm'), `${file}: NotebookLM relationship missing`);
  }
  console.log('PASS research entry points retain the NotebookLM relationship');

  const base = process.env.SEO_BASE_URL;
  if (!base) return;
  for (const [path, expected] of [
    ['/ai/notebooklm', ['NotebookLM', '600 sources', 'citation accuracy', 'Workspace for Education']],
    ['/cn/ai/notebooklm', ['NotebookLM', '600 个来源', '引用准确性', 'Workspace for Education']],
  ] as const) {
    const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(20000) });
    assert.equal(response.status, 200, path);
    const html = await response.text();
    const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    for (const term of expected) assert(visible.includes(term), `${path}: ${term} missing`);
    assert(/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html), `${path}: noindex missing`);
    assert(html.includes(`<link rel="canonical" href="https://aibesttool.com${path}"`), `${path}: canonical changed`);
    console.log(`PASS ${path}: evidence, limits, canonical and noindex`);
  }
  const sitemap = await fetch(`${base}/sitemap.xml`, { signal: AbortSignal.timeout(20000) });
  assert.equal(sitemap.status, 200);
  assert(!/<loc>[^<]*\/ai\/notebooklm\/?<\/loc>/.test(await sitemap.text()), 'NotebookLM must stay outside sitemap');
  console.log('PASS sitemap: NotebookLM excluded while monitored');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
