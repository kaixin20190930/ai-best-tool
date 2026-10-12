import React from 'react';
import { NextRequest } from 'next/server';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { renderToStaticMarkup } from 'react-dom/server';

import VerifiedComparisonPage from '../components/guides/VerifiedComparisonPage';
import { INDEXABLE_GUIDE_PAGES } from '../lib/content/guides';
import researchComparison from '../lib/content/researchComparison';
import { validateVerifiedComparison } from '../lib/content/verifiedComparison';
import { INDEXABLE_GUIDE_PATHS } from '../lib/seo/guideIndexing';
import { generateLocalizedCanonicalUrl } from '../lib/seo/metadata';
import { middleware } from '../middleware';

const primary = '/guides/ai-tools-for-research-comparison';
const alias = '/guides/ai-research-tools-comparison';
const guide = '/guides/ai-tools-for-research';

assert(validateVerifiedComparison(researchComparison, ['perplexity', 'consensus', 'scite', 'notebooklm']));
assert.deepEqual(
  researchComparison.candidates.map((candidate) => candidate.slug),
  ['perplexity', 'consensus', 'scite', 'notebooklm'],
);
assert(researchComparison.evidence.some((item) => item.id === 'notebook-grounding' && item.source.url.includes('support.google.com/gemininotebook/')));
assert(researchComparison.evidence.some((item) => item.id === 'notebook-import' && item.source.url.includes('support.google.com/gemininotebook/')));
assert(researchComparison.comparisonRows.every((row) => Boolean(row.values.notebooklm?.en && row.values.notebooklm?.cn)));
assert(INDEXABLE_GUIDE_PATHS.has(guide));
assert(!INDEXABLE_GUIDE_PATHS.has(primary));
assert(!INDEXABLE_GUIDE_PATHS.has(alias));
assert(INDEXABLE_GUIDE_PAGES.some((page) => page.href === guide));
assert(!INDEXABLE_GUIDE_PAGES.some((page) => page.href === primary || page.href === alias));

const page = fs.readFileSync('app/[locale]/(with-footer)/guides/ai-tools-for-research-comparison/page.tsx', 'utf8');
const template = fs.readFileSync('app/[locale]/(with-footer)/guides/comparison-template.tsx', 'utf8');
const guidePage = fs.readFileSync('app/[locale]/(with-footer)/guides/ai-tools-for-research/page.tsx', 'utf8');
const registry = fs.readFileSync('lib/content/guides.ts', 'utf8');
assert(page.includes("content: { kind: 'verified', comparison: researchComparison"));
assert(page.includes(`comparisonPath: '${primary}'`));
assert(template.includes('getNoindexMetadata()'));
assert(template.includes('generateLocalizedCanonicalUrl(comparisonPath, locale, siteUrl)'));
assert(/faqSchema:\s*valid && faqs\.length > 0/.test(template));
assert(/generateLocalizedCanonicalUrl\(`\/ai\/\$\{tool\.name\}`, locale, siteUrl\)/.test(template));
assert(guidePage.includes("path: '/guides/ai-tools-for-research'"));
assert(guidePage.includes("toolName: 'notebooklm'"));
assert(!registry.includes(`href: '${alias}'`));
assert(!/HOLD|门禁|索引策略|保留索引|sitemap|SEO 操作|implementation status/i.test(page));

async function main() {
  const rendered = new JSDOM(renderToStaticMarkup(React.createElement(VerifiedComparisonPage, {
    comparison: researchComparison,
    locale: 'en',
    tools: researchComparison.candidates.map((candidate) => ({ name: candidate.slug, title: candidate.name })),
    guideHref: guide,
    faqs: [],
  }))).window.document;
  assert.equal(rendered.querySelectorAll('[data-comparison-section="decision"] article, [data-comparison-section="decision"] > div > div').length, 4);
  assert(rendered.querySelector('a[href="/ai/notebooklm#decision-card"]'));
  assert(rendered.querySelector('a[href="https://support.google.com/gemininotebook/answer/16164461?hl=en"]'));
  assert.equal(rendered.querySelector('[data-comparison-section="capabilities"]'), null);
  for (const locale of ['en', 'cn', 'tw']) {
    const prefix = locale === 'en' ? '' : `/${locale}`;
    const request = new NextRequest(`https://aibesttool.com${prefix}${alias}?source=old`, { method: 'GET' });
    const response = await middleware(request);
    assert.equal(response.status, 308);
    assert.equal(response.headers.get('location'), `https://aibesttool.com${prefix}${primary}?source=old`);
    assert.equal(
      generateLocalizedCanonicalUrl(guide, locale, 'https://aibesttool.com'),
      `https://aibesttool.com${prefix}${guide}`,
    );
  }
  console.log('Research comparison page, evidence, indexing and localized redirect passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
