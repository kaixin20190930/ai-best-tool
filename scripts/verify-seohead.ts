/**
 * Verification script for SEOHead component
 * Validates that the component meets all task requirements
 */

import { generateSEOMetadata, generateSEOMetadataWithLocales } from '../components/seo/SEOHead';
import { SEO_CONFIG } from '../lib/seo';

console.log('🔍 Verifying SEOHead Component Implementation\n');

// Test 1: Basic metadata generation
console.log('✓ Test 1: Basic metadata with title and description');
const basicMetadata = generateSEOMetadata({
  title: 'Test Page',
  description: 'This is a test page description that is long enough to meet SEO requirements and provide good context for search engines.',
});

if (!basicMetadata.title || !basicMetadata.description) {
  console.error('❌ FAILED: Missing title or description');
  process.exit(1);
}
console.log('  ✓ Title:', basicMetadata.title);
console.log('  ✓ Description:', basicMetadata.description);

// Test 2: Canonical URL
console.log('\n✓ Test 2: Canonical URL support');
const canonicalMetadata = generateSEOMetadata({
  title: 'Test Page',
  description: 'This is a test page description that is long enough to meet SEO requirements and provide good context for search engines.',
  canonical: '/test-page',
});

if (!canonicalMetadata.alternates?.canonical) {
  console.error('❌ FAILED: Missing canonical URL');
  process.exit(1);
}
console.log('  ✓ Canonical URL:', canonicalMetadata.alternates.canonical);

// Test 3: Image prop
console.log('\n✓ Test 3: Image prop support');
const imageMetadata = generateSEOMetadata({
  title: 'Test Page',
  description: 'This is a test page description that is long enough to meet SEO requirements and provide good context for search engines.',
  image: '/test-image.png',
});

if (!imageMetadata.openGraph?.images || !imageMetadata.twitter?.images) {
  console.error('❌ FAILED: Missing social images');
  process.exit(1);
}
console.log('  ✓ Open Graph images:', imageMetadata.openGraph.images);
console.log('  ✓ Twitter images:', imageMetadata.twitter.images);

// Test 4: Meta tags generation
console.log('\n✓ Test 4: Meta tags for basic SEO');
if (!basicMetadata.openGraph || !basicMetadata.twitter) {
  console.error('❌ FAILED: Missing Open Graph or Twitter metadata');
  process.exit(1);
}
console.log('  ✓ Open Graph metadata generated');
console.log('  ✓ Twitter Card metadata generated');

// Test 5: Locale support
console.log('\n✓ Test 5: Locale support');
const localeMetadata = generateSEOMetadata({
  title: 'Test Page',
  description: 'This is a test page description that is long enough to meet SEO requirements and provide good context for search engines.',
  locale: 'es',
});

if (localeMetadata.openGraph?.locale !== 'es') {
  console.error('❌ FAILED: Locale not set correctly');
  process.exit(1);
}
console.log('  ✓ Locale set to:', localeMetadata.openGraph.locale);

// Test 6: Alternate locales
console.log('\n✓ Test 6: Alternate locales support');
const alternateLocales = [
  { locale: 'es', url: 'https://aibesttool.com/es/test' },
  { locale: 'fr', url: 'https://aibesttool.com/fr/test' },
];

const alternateMetadata = generateSEOMetadata({
  title: 'Test Page',
  description: 'This is a test page description that is long enough to meet SEO requirements and provide good context for search engines.',
  canonical: '/test',
  alternateLocales,
});

if (!alternateMetadata.openGraph?.alternateLocale || !alternateMetadata.alternates?.languages) {
  console.error('❌ FAILED: Alternate locales not configured');
  process.exit(1);
}
console.log('  ✓ Alternate locales in OG:', alternateMetadata.openGraph.alternateLocale);
console.log('  ✓ Alternate languages:', Object.keys(alternateMetadata.alternates.languages));

// Test 7: Automatic alternate locales
console.log('\n✓ Test 7: Automatic alternate locales generation');
const autoLocaleMetadata = generateSEOMetadataWithLocales(
  {
    title: 'Test Page',
    description: 'This is a test page description that is long enough to meet SEO requirements and provide good context for search engines.',
    locale: 'en',
  },
  '/test-page',
);

if (!autoLocaleMetadata.openGraph?.alternateLocale || autoLocaleMetadata.openGraph.alternateLocale.length === 0) {
  console.error('❌ FAILED: Automatic alternate locales not generated');
  process.exit(1);
}
console.log('  ✓ Auto-generated alternate locales:', autoLocaleMetadata.openGraph.alternateLocale.length, 'locales');

// Test 8: Additional props (noindex, keywords, type)
console.log('\n✓ Test 8: Additional props support');
const advancedMetadata = generateSEOMetadata({
  title: 'Test Page',
  description: 'This is a test page description that is long enough to meet SEO requirements and provide good context for search engines.',
  noindex: true,
  keywords: ['AI', 'tools', 'testing'],
  type: 'article',
});

if (!advancedMetadata.robots || advancedMetadata.robots.index !== false) {
  console.error('❌ FAILED: noindex not working');
  process.exit(1);
}
if (!advancedMetadata.keywords || advancedMetadata.keywords.length !== 3) {
  console.error('❌ FAILED: keywords not working');
  process.exit(1);
}
if (advancedMetadata.openGraph?.type !== 'article') {
  console.error('❌ FAILED: type not working');
  process.exit(1);
}
console.log('  ✓ noindex:', advancedMetadata.robots.index === false);
console.log('  ✓ keywords:', advancedMetadata.keywords);
console.log('  ✓ type:', advancedMetadata.openGraph.type);

// Requirements validation
console.log('\n📋 Requirements Validation:');
console.log('  ✓ Requirement 8.1: Accepts title, description, canonical, image props');
console.log('  ✓ Requirement 8.4: Generates meta tags for basic SEO');
console.log('  ✓ Supports locale and alternate locales');
console.log('  ✓ Generates Open Graph metadata');
console.log('  ✓ Generates Twitter Card metadata');
console.log('  ✓ Supports noindex, keywords, and type options');

console.log('\n✅ All tests passed! SEOHead component is fully implemented.\n');
