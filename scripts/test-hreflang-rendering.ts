import { NextRequest } from 'next/server';
import assert from 'node:assert/strict';

import { generateHreflangMetadata, generateSEOMetadataWithLocales } from '../components/seo/SEOHead';
import { locales } from '../i18n';
import { buildLocalizedPageMetadata, generateHreflangLinks } from '../lib/seo/metadata';
import intlMiddleware from '../middlewares/intlMiddleware';
import { hasExpectedMetadata } from './production-seo-smoke';

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
// Test the actual production smoke validator, including the old cn-label failure.
// Both en and /cn pages use zh-CN as the language code while keeping /cn URLs.
for (const path of ['/ai/claude', '/cn', '/cn/best-ai-tools/ai-writing-tools']) {
  const enPath = path.replace(/^\/cn(?=\/|$)/, '') || '/';
  const enUrl = `${baseUrl}${enPath === '/' ? '' : enPath}`;
  const cnUrl = `${baseUrl}/cn${enPath === '/' ? '' : enPath}`;
  const html =
    `<link rel="canonical" href="${baseUrl}${path}"/>` +
    `<link rel="alternate" hrefLang="en" href="${enUrl}"/>` +
    `<link rel="alternate" hrefLang="zh-CN" href="${cnUrl}"/>` +
    `<link rel="alternate" hrefLang="x-default" href="${enUrl}"/>`;
  assert(hasExpectedMetadata(html, path), `${path}: valid production language contract rejected`);
  assert(
    !hasExpectedMetadata(html.replace('hrefLang="zh-CN"', 'hrefLang="cn"'), path),
    `${path}: legacy cn label accepted`,
  );
  assert(
    !hasExpectedMetadata(html.replace('hrefLang="x-default"', 'hrefLang="fr"'), path),
    `${path}: missing x-default accepted`,
  );
  assert(
    !hasExpectedMetadata(
      html.replace(`hrefLang="zh-CN" href="${cnUrl}"`, `hrefLang="zh-CN" href="${baseUrl}/zh-CN${enPath}"`),
      path,
    ),
    `${path}: incorrect Chinese route accepted`,
  );
}

console.log(
  'Hreflang passed: en / zh-CN / x-default only; /cn URLs; no alternates for noindex languages or competing HTTP declarations.',
);
