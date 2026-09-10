/** Routing locales and indexable language declarations are separate contracts. */
import assert from 'node:assert/strict';

import { generateHreflangMetadata } from '../components/seo/SEOHead';
import { locales } from '../i18n';
import { SEO_CONFIG } from '../lib/seo/constants';
import { INDEXABLE_HREFLANG, INDEXABLE_LOCALES } from '../lib/seo/indexing';
import { generateHreflangLinks } from '../lib/seo/metadata';

for (const path of ['/', '/explore', '/ai/chatgpt', '/guides/ai-writing-tools', '/best-ai-tools/ai-student-tools']) {
  const expected = {
    en: `${SEO_CONFIG.siteUrl}${path}`,
    'zh-CN': `${SEO_CONFIG.siteUrl}/cn${path === '/' ? '' : path}`,
    'x-default': `${SEO_CONFIG.siteUrl}${path}`,
  };
  for (const locale of INDEXABLE_LOCALES) {
    const links = generateHreflangLinks(path, locale);
    assert.deepEqual(links, expected, `${locale}${path}: language/URL contract`);
    assert.equal(links['x-default'], links.en);
    const metadata = generateHreflangMetadata(locale, path);
    assert.deepEqual(metadata.alternates?.languages, expected);
    assert.equal(metadata.alternates?.canonical, expected[INDEXABLE_HREFLANG[locale]]);
    // Verify reciprocal en/zh-CN references, including the self reference.
    for (const target of INDEXABLE_LOCALES) {
      assert.equal(
        generateHreflangLinks(path, target)[INDEXABLE_HREFLANG[locale]],
        expected[INDEXABLE_HREFLANG[locale]],
      );
    }
    for (const url of Object.values(links)) {
      assert.equal(new URL(url).origin, new URL(SEO_CONFIG.siteUrl).origin);
      if (path !== '/') assert(!url.endsWith('/'));
    }
  }
  for (const locale of locales.filter((item) => !INDEXABLE_LOCALES.some((allowed) => allowed === item))) {
    assert.deepEqual(generateHreflangLinks(path, locale), {});
    const metadata = generateHreflangMetadata(locale, path);
    assert.equal(metadata.alternates?.languages, undefined);
    assert.equal(metadata.alternates?.canonical, `${SEO_CONFIG.siteUrl}/${locale}${path === '/' ? '' : path}`);
  }
}
console.log(
  'Hreflang verification passed: indexable languages, canonical URLs, x-default, reciprocity, historical exclusions and URL consistency.',
);
