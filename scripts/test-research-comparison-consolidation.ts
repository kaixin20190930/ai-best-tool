import { NextRequest } from 'next/server';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { INDEXABLE_GUIDE_PAGES } from '../lib/content/guides';
import researchComparison from '../lib/content/researchComparison';
import { validateVerifiedComparison } from '../lib/content/verifiedComparison';
import { INDEXABLE_GUIDE_PATHS } from '../lib/seo/guideIndexing';
import { generateLocalizedCanonicalUrl } from '../lib/seo/metadata';
import { middleware } from '../middleware';

const primary = '/guides/ai-tools-for-research-comparison';
const alias = '/guides/ai-research-tools-comparison';
const guide = '/guides/ai-tools-for-research';

assert(validateVerifiedComparison(researchComparison, ['perplexity', 'consensus', 'scite']));
assert.equal(researchComparison.candidates.length, 3);
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
assert(template.includes('faqSchema: valid && faqs.length > 0'));
assert(/generateLocalizedCanonicalUrl\(`\/ai\/\$\{tool\.name\}`, locale, siteUrl\)/.test(template));
assert(guidePage.includes("path: '/guides/ai-tools-for-research'"));
assert(!registry.includes(`href: '${alias}'`));
assert(!/HOLD|门禁|索引策略|保留索引|sitemap|SEO 操作|implementation status/i.test(page));

async function main() {
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
