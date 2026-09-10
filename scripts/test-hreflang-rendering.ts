import { NextRequest } from 'next/server';
import assert from 'node:assert/strict';

import { generateHreflangMetadata, generateSEOMetadataWithLocales } from '../components/seo/SEOHead';
import { locales } from '../i18n';
import { buildLocalizedPageMetadata, generateHreflangLinks } from '../lib/seo/metadata';
import intlMiddleware from '../middlewares/intlMiddleware';

const baseUrl = 'https://aibesttool.com';
for (const locale of locales) {
  for (const path of ['/', '/explore', '/best-ai-tools/ai-automation-tools']) {
    const allowed = locale === 'en' || locale === 'cn';
    const canonicalPath = locale === 'en' ? path : `/${locale}${path === '/' ? '' : path}`;
    const expected = {
      en: `${baseUrl}${path}`,
      'zh-CN': `${baseUrl}/cn${path === '/' ? '' : path}`,
      'x-default': `${baseUrl}${path}`,
    };
    const metadata = buildLocalizedPageMetadata({ locale, path, title: 'Title', description: 'Description', baseUrl });
    assert.equal(metadata.alternates?.canonical, `${baseUrl}${canonicalPath}`);
    assert.deepEqual(metadata.alternates?.languages, allowed ? expected : undefined);
    assert.deepEqual(generateHreflangLinks(path, locale, baseUrl), allowed ? expected : {});
    const helper = generateHreflangMetadata(locale, path);
    assert.equal(helper.alternates?.canonical, `${baseUrl}${canonicalPath}`);
    assert.deepEqual(helper.alternates?.languages, allowed ? expected : undefined);
    for (const noindex of [false, true]) {
      const legacy = generateSEOMetadataWithLocales(
        { title: 'Title', description: 'Description', canonical: canonicalPath, locale, noindex },
        path,
      );
      assert.deepEqual(legacy.alternates?.languages, allowed && !noindex ? expected : undefined);
    }
    const noindex = buildLocalizedPageMetadata({
      locale,
      path,
      title: 'Title',
      description: 'Description',
      indexable: false,
    });
    assert.equal(noindex.alternates?.languages, undefined);

    // The actual installed next-intl middleware must leave hreflang to page
    // metadata, which can evaluate data-dependent noindex decisions.
    const response = intlMiddleware(new NextRequest(`${baseUrl}${canonicalPath}`));
    assert(
      !response.headers.get('link')?.includes('hreflang='),
      `${canonicalPath}: routing emitted competing HTTP alternates.`,
    );
  }
}
for (const path of ['/pricing', '/guides/ai-tools-for-ecommerce', '/profile/decisions']) {
  const response = intlMiddleware(new NextRequest(`${baseUrl}${path}`));
  assert(!response.headers.get('link')?.includes('hreflang='), `${path}: noindex route emitted HTTP alternates.`);
}
console.log(
  'Hreflang passed: en / zh-CN / x-default only; /cn URLs; no alternates for noindex languages or competing HTTP declarations.',
);
