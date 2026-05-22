/**
 * Hreflang Tags Verification Script
 * 
 * This script verifies that hreflang tags are properly implemented:
 * - All locales have hreflang links
 * - x-default is present and points to default locale
 * - Bidirectional relationships exist
 * - URLs are properly formatted
 */

import { generateHreflangMetadata } from '@/components/seo';
import { generateHreflangLinks } from '@/lib/seo';
import { SEO_CONFIG } from '@/lib/seo/constants';

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function addResult(test: string, passed: boolean, message: string, details?: any) {
  results.push({ test, passed, message, details });
  const icon = passed ? '✓' : '✗';
  const color = passed ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}${icon}\x1b[0m ${test}: ${message}`);
  if (details) {
    console.log('  Details:', JSON.stringify(details, null, 2));
  }
}

function testHreflangLinks() {
  console.log('\n=== Testing generateHreflangLinks ===\n');

  // Test 1: Basic hreflang generation
  const path = '/explore';
  const locale = 'en';
  const hreflangLinks = generateHreflangLinks(path, locale);

  // Check all locales are present
  const hasAllLocales = SEO_CONFIG.locales.every(loc => loc in hreflangLinks);
  addResult(
    'All locales present',
    hasAllLocales,
    hasAllLocales ? 'All configured locales have hreflang links' : 'Some locales are missing',
    { expected: SEO_CONFIG.locales, actual: Object.keys(hreflangLinks).filter(k => k !== 'x-default') }
  );

  // Check x-default is present
  const hasXDefault = 'x-default' in hreflangLinks;
  addResult(
    'x-default present',
    hasXDefault,
    hasXDefault ? 'x-default hreflang tag exists' : 'x-default is missing'
  );

  // Check x-default points to default locale
  if (hasXDefault) {
    const xDefaultUrl = hreflangLinks['x-default'];
    const defaultLocaleUrl = hreflangLinks[SEO_CONFIG.defaultLocale];
    const pointsToDefault = xDefaultUrl === defaultLocaleUrl;
    addResult(
      'x-default points to default locale',
      pointsToDefault,
      pointsToDefault 
        ? `x-default correctly points to ${SEO_CONFIG.defaultLocale}` 
        : 'x-default does not point to default locale',
      { xDefault: xDefaultUrl, defaultLocale: defaultLocaleUrl }
    );
  }

  // Check URL format
  const allUrlsValid = Object.entries(hreflangLinks).every(([locale, url]) => {
    if (locale === 'x-default') return true;
    return url.includes(`/${locale}${path}`);
  });
  addResult(
    'URL format correct',
    allUrlsValid,
    allUrlsValid ? 'All URLs follow correct format' : 'Some URLs have incorrect format',
    { sample: hreflangLinks['en'] }
  );

  // Test 2: Different paths
  console.log('\n--- Testing different paths ---\n');
  
  const testPaths = [
    '/',
    '/explore',
    '/ai/chatgpt',
    '/startup',
    '/explore/page/2'
  ];

  testPaths.forEach(testPath => {
    const links = generateHreflangLinks(testPath, 'en');
    // For root path, expect /en (no trailing slash after locale)
    // For other paths, expect /en/path
    const expectedEnding = testPath === '/' ? '/en' : `/en${testPath}`;
    const hasCorrectPath = links['en'].endsWith(expectedEnding);
    addResult(
      `Path: ${testPath}`,
      hasCorrectPath,
      hasCorrectPath ? 'Path correctly included in URL' : 'Path format incorrect',
      { url: links['en'], expected: expectedEnding }
    );
  });

  // Test 3: Different locales
  console.log('\n--- Testing different locales ---\n');
  
  SEO_CONFIG.locales.forEach(testLocale => {
    const links = generateHreflangLinks('/explore', testLocale);
    const hasAllLinks = SEO_CONFIG.locales.every(loc => loc in links) && 'x-default' in links;
    addResult(
      `Locale: ${testLocale}`,
      hasAllLinks,
      hasAllLinks ? 'All hreflang links generated' : 'Missing some links'
    );
  });
}

function testHreflangMetadata() {
  console.log('\n=== Testing generateHreflangMetadata ===\n');

  const locale = 'en';
  const path = '/explore';
  const metadata = generateHreflangMetadata(locale, path);

  // Check metadata structure
  const hasAlternates = !!metadata.alternates;
  addResult(
    'Metadata has alternates',
    hasAlternates,
    hasAlternates ? 'alternates object exists' : 'alternates object missing'
  );

  if (hasAlternates && metadata.alternates) {
    // Check canonical
    const hasCanonical = !!metadata.alternates.canonical;
    addResult(
      'Canonical URL present',
      hasCanonical,
      hasCanonical ? 'Canonical URL is set' : 'Canonical URL missing',
      { canonical: metadata.alternates.canonical }
    );

    // Check languages
    const hasLanguages = !!metadata.alternates.languages;
    addResult(
      'Languages object present',
      hasLanguages,
      hasLanguages ? 'Languages object exists' : 'Languages object missing'
    );

    if (hasLanguages && metadata.alternates.languages) {
      const languages = metadata.alternates.languages;
      
      // Check all locales
      const hasAllLocales = SEO_CONFIG.locales.every(loc => loc in languages);
      addResult(
        'All locales in languages',
        hasAllLocales,
        hasAllLocales ? 'All locales present in languages object' : 'Some locales missing'
      );

      // Check x-default
      const hasXDefault = 'x-default' in languages;
      addResult(
        'x-default in languages',
        hasXDefault,
        hasXDefault ? 'x-default present in languages object' : 'x-default missing'
      );
    }
  }
}

function testBidirectionalRelationships() {
  console.log('\n=== Testing Bidirectional Relationships ===\n');

  const path = '/explore';
  
  // Generate hreflang for each locale
  const allHreflangMaps = SEO_CONFIG.locales.map(locale => ({
    locale,
    links: generateHreflangLinks(path, locale)
  }));

  // Check bidirectional relationships
  let allBidirectional = true;
  
  for (const { locale: localeA, links: linksA } of allHreflangMaps) {
    for (const localeB of SEO_CONFIG.locales) {
      if (localeA === localeB) continue;
      
      // If A links to B, B should link to A
      const aLinksToB = localeB in linksA;
      const bLinksMap = allHreflangMaps.find(m => m.locale === localeB);
      const bLinksToA = bLinksMap ? localeA in bLinksMap.links : false;
      
      if (aLinksToB !== bLinksToA) {
        allBidirectional = false;
        addResult(
          `Bidirectional: ${localeA} ↔ ${localeB}`,
          false,
          'Relationship is not bidirectional'
        );
      }
    }
  }

  if (allBidirectional) {
    addResult(
      'All relationships bidirectional',
      true,
      'All locale pairs have bidirectional hreflang relationships'
    );
  }
}

function testURLConsistency() {
  console.log('\n=== Testing URL Consistency ===\n');

  const testPaths = ['/', '/explore', '/ai/chatgpt'];
  
  testPaths.forEach(path => {
    const links = generateHreflangLinks(path, 'en');
    
    // Check that all URLs use the same base URL
    const baseUrls = Object.values(links).map(url => {
      const urlObj = new URL(url);
      return urlObj.origin;
    });
    
    const allSameBase = baseUrls.every(base => base === baseUrls[0]);
    addResult(
      `Consistent base URL for ${path}`,
      allSameBase,
      allSameBase ? 'All URLs use same base URL' : 'URLs use different base URLs',
      { baseUrl: baseUrls[0] }
    );

    // Check that URLs don't have trailing slashes (except root)
    const noTrailingSlashes = Object.entries(links).every(([locale, url]) => {
      if (path === '/') return true; // Root can have trailing slash
      return !url.endsWith('/');
    });
    
    addResult(
      `No trailing slashes for ${path}`,
      noTrailingSlashes,
      noTrailingSlashes ? 'URLs properly formatted without trailing slashes' : 'Some URLs have trailing slashes'
    );
  });
}

// Run all tests
console.log('🔍 Hreflang Tags Verification\n');
console.log('Configuration:');
console.log(`  Site URL: ${SEO_CONFIG.siteUrl}`);
console.log(`  Default Locale: ${SEO_CONFIG.defaultLocale}`);
console.log(`  Available Locales: ${SEO_CONFIG.locales.join(', ')}`);

testHreflangLinks();
testHreflangMetadata();
testBidirectionalRelationships();
testURLConsistency();

// Summary
console.log('\n=== Summary ===\n');
const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;
const total = results.length;

console.log(`Total Tests: ${total}`);
console.log(`\x1b[32mPassed: ${passed}\x1b[0m`);
console.log(`\x1b[31mFailed: ${failed}\x1b[0m`);

if (failed === 0) {
  console.log('\n✅ All hreflang tests passed!');
  console.log('\nNext steps:');
  console.log('1. Deploy your changes');
  console.log('2. Test with Google Search Console');
  console.log('3. Verify hreflang tags in page source');
  console.log('4. Check for hreflang errors in Search Console');
} else {
  console.log('\n❌ Some tests failed. Please review the errors above.');
  process.exit(1);
}
