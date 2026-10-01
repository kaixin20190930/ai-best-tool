import assert from 'node:assert/strict';
import fs from 'node:fs';

const linkedPages = [
  'app/[locale]/(with-footer)/guides/ai-tools-for-research-comparison/page.tsx',
  'lib/content/guideTaskChecks.ts',
  'lib/data/topicToolSources.ts',
];
const researchGuide = 'app/[locale]/(with-footer)/guides/ai-tools-for-research/page.tsx';
const perplexityComparison = 'app/[locale]/(with-footer)/guides/perplexity-alternatives-comparison/page.tsx';

async function main() {
  const evidenceConfig = fs.readFileSync('lib/config/priorityToolEvidence.ts', 'utf8');
  for (const term of [
    'notebooklm:',
    'Gemini Notebook (formerly NotebookLM)',
    'Gemini Notebook（原 NotebookLM）',
    'Ultra 20 TB 500',
    'Ultra 30 TB 600',
    'citation accuracy',
    'Workspace for Education',
    'support.google.com/gemininotebook/answer/16164461',
    'support.google.com/gemininotebook/answer/16213268',
    'support.google.com/gemininotebook/answer/16215270',
    'blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/',
  ]) {
    assert(evidenceConfig.includes(term), `Gemini Notebook evidence snapshot: ${term} missing`);
  }
  assert(!evidenceConfig.includes('support.google.com/notebooklm/answer/16164461'));
  assert(!evidenceConfig.includes('rather than discovering the open web'));
  console.log('PASS Gemini Notebook source-backed evidence matches migrated identity');

  for (const file of linkedPages) {
    const source = fs.readFileSync(file, 'utf8');
    assert(source.includes('notebooklm'), `${file}: NotebookLM relationship missing`);
  }
  assert(fs.readFileSync(researchGuide, 'utf8').includes("href: '/guides/ai-tools-for-research-comparison'"));
  const comparisonSource = fs.readFileSync(perplexityComparison, 'utf8');
  assert(
    comparisonSource.includes("guideHref: '/guides/ai-tools-for-research'"),
    'Perplexity comparison must retain its research guide fallback',
  );
  assert(
    comparisonSource.includes("content: { kind: 'unavailable'"),
    'Perplexity comparison must retain its unavailable-content guard',
  );
  assert(
    fs
      .readFileSync('lib/content/guideTaskChecks.ts', 'utf8')
      .includes('Review Gemini Notebook (formerly NotebookLM) fit and sources'),
  );
  console.log('PASS research entry points retain the historical notebooklm route');

  const base = process.env.SEO_BASE_URL;
  if (!base) return;
  for (const [path, expected] of [
    [
      '/ai/notebooklm',
      [
        'Gemini Notebook',
        'formerly NotebookLM',
        'Ultra 20 TB 500',
        'Ultra 30 TB 600',
        'citation accuracy',
        'Workspace for Education',
      ],
    ],
    [
      '/cn/ai/notebooklm',
      [
        'Gemini Notebook',
        '原 NotebookLM',
        'Ultra 20 TB 500',
        'Ultra 30 TB 600',
        '引用准确性',
        'Workspace for Education',
      ],
    ],
  ] as const) {
    const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(20000) });
    assert.equal(response.status, 200, path);
    const html = await response.text();
    const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    for (const term of expected) assert(visible.includes(term), `${path}: ${term} missing`);
    assert(/<meta[^>]*name="robots"[^>]*content="noindex, follow"/.test(html), `${path}: noindex/follow missing`);
    assert(html.includes(`<link rel="canonical" href="https://aibesttool.com${path}"`), `${path}: canonical changed`);
    console.log(`PASS ${path}: current/former identity, limits, canonical and noindex/follow`);
  }
  const sitemap = await fetch(`${base}/sitemap.xml`, { signal: AbortSignal.timeout(20000) });
  assert.equal(sitemap.status, 200);
  const sitemapXml = await sitemap.text();
  assert(
    !/<loc>[^<]*\/ai\/notebooklm\/?<\/loc>/.test(sitemapXml),
    'Historical NotebookLM route must stay outside sitemap',
  );
  assert(!/<loc>[^<]*\/ai\/gemini-notebook\/?<\/loc>/.test(sitemapXml), 'No new Gemini Notebook sitemap route');
  console.log('PASS sitemap: historical route excluded; no new Gemini Notebook entry');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
