/**
 * Hreflang Rendering Test
 * 
 * This script tests that hreflang tags are properly rendered in actual pages
 * by checking the metadata output from Next.js pages
 */

import { generateHreflangMetadata } from '@/components/seo';
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

function testMetadataStructure() {
  console.log('\n=== Testing Metadata Structure ===\n');

  const testCases = [
    { locale: 'en', path: '/explore', description: 'English explore page' },
    { locale: 'es', path: '/explore', description: 'Spanish explore page' },
    { locale: 'fr', path: '/ai/chatgpt', description: 'French tool page' },
    { locale: 'de', path: '/startup', description: 'German startup page' },
    { locale: 'jp', path: '/', description: 'Japanese homepage' },
  ];

  testCases.forEach(({ locale, path, description }) => {
    const metadata = generateHreflangMetadata(locale, path);

    // Test 1: Metadata has alternates
    const hasAlternates = !!metadata.alternates;
    addResult(
      `${description} - has alternates`,
      hasAlternates,
      hasAlternates ? 'Alternates object present' : 'Missing alternates'
    );

    if (!hasAlternates || !metadata.alternates) return;

    // Test 2: Has canonical
    const hasCanonical = !!metadata.alternates.canonical;
    addResult(
      `${description} - has canonical`,
      hasCanonical,
      hasCanonical ? 'Canonical URL present' : 'Missing canonical'
    );

    // Test 3: Has languages
    const hasLanguages = !!metadata.alternates.languages;
    addResult(
      `${description} - has languages`,
      hasLanguages,
      hasLanguages ? 'Languages object present' : 'Missing languages'
    );

    if (!hasLanguages || !metadata.alternates.languages) return;

    const languages = metadata.alternates.languages;

    // Test 4: All locales present
    const missingLocales = SEO_CONFIG.locales.filter(loc => !(loc in languages));
    const hasAllLocales = missingLocales.length === 0;
    addResult(
      `${description} - all locales`,
      hasAllLocales,
      hasAllLocales ? 'All locales present' : `Missing: ${missingLocales.join(', ')}`
    );

    // Test 5: x-default present
    const hasXDefault = 'x-default' in languages;
    addResult(
      `${description} - x-default`,
      hasXDefault,
      hasXDefault ? 'x-default present' : 'Missing x-default'
    );

    // Test 6: x-default points to default locale
    if (hasXDefault) {
      const xDefaultUrl = languages['x-default'];
      const defaultUrl = languages[SEO_CONFIG.defaultLocale];
      const pointsToDefault = xDefaultUrl === defaultUrl;
      addResult(
        `${description} - x-default correct`,
        pointsToDefault,
        pointsToDefault ? 'x-default points to default locale' : 'x-default incorrect'
      );
    }

    // Test 7: Current locale URL is canonical
    if (hasCanonical && locale in languages) {
      const canonicalUrl = metadata.alternates.canonical;
      const localeUrl = languages[locale];
      const matches = canonicalUrl === localeUrl;
      addResult(
        `${description} - canonical matches locale`,
        matches,
        matches ? 'Canonical matches current locale URL' : 'Canonical mismatch'
      );
    }
  });
}

function testURLFormats() {
  console.log('\n=== Testing URL Formats ===\n');

  const locale = 'en';
  const testPaths = [
    { path: '/', expectedPattern: /\/en$/ },
    { path: '/explore', expectedPattern: /\/en\/explore$/ },
    { path: '/ai/chatgpt', expectedPattern: /\/en\/ai\/chatgpt$/ },
    { path: '/explore/page/2', expectedPattern: /\/en\/explore\/page\/2$/ },
  ];

  testPaths.forEach(({ path, expectedPattern }) => {
    const metadata = generateHreflangMetadata(locale, path);
    
    if (!metadata.alternates?.languages) {
      addResult(`URL format for ${path}`, false, 'No languages object');
      return;
    }

    const url = metadata.alternates.languages[locale];
    const matches = expectedPattern.test(url);
    
    addResult(
      `URL format for ${path}`,
      matches,
      matches ? 'URL format correct' : 'URL format incorrect',
      { url, expectedPattern: expectedPattern.toString() }
    );
  });
}

function testConsistencyAcrossLocales() {
  console.log('\n=== Testing Consistency Across Locales ===\n');

  const path = '/explore';
  const allMetadata = SEO_CONFIG.locales.map(locale => ({
    locale,
    metadata: generateHreflangMetadata(locale, path)
  }));

  // Test 1: All have same number of languages
  const languageCounts = allMetadata.map(({ locale, metadata }) => ({
    locale,
    count: Object.keys(metadata.alternates?.languages || {}).length
  }));

  const allSameCount = languageCounts.every(({ count }) => count === languageCounts[0].count);
  addResult(
    'Same language count',
    allSameCount,
    allSameCount ? 'All locales have same number of hreflang links' : 'Inconsistent counts',
    { counts: languageCounts }
  );

  // Test 2: All have x-default
  const allHaveXDefault = allMetadata.every(({ metadata }) => 
    'x-default' in (metadata.alternates?.languages || {})
  );
  addResult(
    'All have x-default',
    allHaveXDefault,
    allHaveXDefault ? 'All locales include x-default' : 'Some missing x-default'
  );

  // Test 3: All x-default point to same URL
  const xDefaultUrls = allMetadata.map(({ locale, metadata }) => ({
    locale,
    xDefault: metadata.alternates?.languages?.['x-default']
  }));

  const allSameXDefault = xDefaultUrls.every(({ xDefault }) => 
    xDefault === xDefaultUrls[0].xDefault
  );
  addResult(
    'Consistent x-default',
    allSameXDefault,
    allSameXDefault ? 'All x-default URLs are identical' : 'x-default URLs differ',
    { xDefaultUrl: xDefaultUrls[0].xDefault }
  );

  // Test 4: Bidirectional consistency
  let bidirectionalErrors = 0;
  for (const { locale: localeA, metadata: metadataA } of allMetadata) {
    const languagesA = metadataA.alternates?.languages || {};
    
    for (const localeB of SEO_CONFIG.locales) {
      if (localeA === localeB) continue;
      
      const urlToB = languagesA[localeB];
      const metadataB = allMetadata.find(m => m.locale === localeB)?.metadata;
      const languagesB = metadataB?.alternates?.languages || {};
      const urlToA = languagesB[localeA];
      
      // Check if both exist
      if (!urlToB || !urlToA) {
        bidirectionalErrors++;
      }
    }
  }

  addResult(
    'Bidirectional links',
    bidirectionalErrors === 0,
    bidirectionalErrors === 0 ? 'All links are bidirectional' : `${bidirectionalErrors} bidirectional errors`
  );
}

function testRealWorldScenarios() {
  console.log('\n=== Testing Real-World Scenarios ===\n');

  // Scenario 1: Homepage
  const homepageMetadata = generateHreflangMetadata('en', '/');
  const homepageHasAll = homepageMetadata.alternates?.languages && 
    SEO_CONFIG.locales.every(loc => loc in homepageMetadata.alternates!.languages!) &&
    'x-default' in homepageMetadata.alternates!.languages!;
  
  addResult(
    'Homepage hreflang',
    homepageHasAll,
    homepageHasAll ? 'Homepage has complete hreflang tags' : 'Homepage missing hreflang tags'
  );

  // Scenario 2: Tool detail page
  const toolMetadata = generateHreflangMetadata('en', '/ai/chatgpt');
  const toolHasAll = toolMetadata.alternates?.languages &&
    SEO_CONFIG.locales.every(loc => loc in toolMetadata.alternates!.languages!) &&
    'x-default' in toolMetadata.alternates!.languages!;
  
  addResult(
    'Tool page hreflang',
    toolHasAll,
    toolHasAll ? 'Tool page has complete hreflang tags' : 'Tool page missing hreflang tags'
  );

  // Scenario 3: Paginated page
  const paginatedMetadata = generateHreflangMetadata('en', '/explore/page/2');
  const paginatedHasAll = paginatedMetadata.alternates?.languages &&
    SEO_CONFIG.locales.every(loc => loc in paginatedMetadata.alternates!.languages!) &&
    'x-default' in paginatedMetadata.alternates!.languages!;
  
  addResult(
    'Paginated page hreflang',
    paginatedHasAll,
    paginatedHasAll ? 'Paginated page has complete hreflang tags' : 'Paginated page missing hreflang tags'
  );

  // Scenario 4: Non-English locale
  const spanishMetadata = generateHreflangMetadata('es', '/explore');
  const spanishCanonical = spanishMetadata.alternates?.canonical;
  const spanishHasCorrectCanonical = spanishCanonical?.includes('/es/explore');
  
  addResult(
    'Non-English canonical',
    spanishHasCorrectCanonical || false,
    spanishHasCorrectCanonical ? 'Non-English page has correct canonical' : 'Canonical incorrect',
    { canonical: spanishCanonical }
  );
}

// Run all tests
console.log('🔍 Hreflang Rendering Test\n');
console.log('Configuration:');
console.log(`  Site URL: ${SEO_CONFIG.siteUrl}`);
console.log(`  Default Locale: ${SEO_CONFIG.defaultLocale}`);
console.log(`  Available Locales: ${SEO_CONFIG.locales.join(', ')}`);

testMetadataStructure();
testURLFormats();
testConsistencyAcrossLocales();
testRealWorldScenarios();

// Summary
console.log('\n=== Summary ===\n');
const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;
const total = results.length;

console.log(`Total Tests: ${total}`);
console.log(`\x1b[32mPassed: ${passed}\x1b[0m`);
console.log(`\x1b[31mFailed: ${failed}\x1b[0m`);

if (failed === 0) {
  console.log('\n✅ All hreflang rendering tests passed!');
  console.log('\nThe hreflang implementation is working correctly.');
  console.log('\nTo verify in production:');
  console.log('1. Deploy your changes');
  console.log('2. View page source and look for <link rel="alternate" hreflang="...">');
  console.log('3. Use Google Search Console to verify hreflang tags');
  console.log('4. Check for hreflang errors in Search Console');
  console.log('\nExample verification command:');
  console.log('  curl -s https://aibesttool.com/en/explore | grep hreflang');
} else {
  console.log('\n❌ Some tests failed. Please review the errors above.');
  process.exit(1);
}
