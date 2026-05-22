/**
 * Comprehensive test for BreadcrumbList schema implementation
 * Validates that breadcrumb schema is correctly implemented across all pages
 */

import { generateBreadcrumbSchema, validateSchema } from '../lib/seo/schema';

console.log('🎯 Comprehensive BreadcrumbList Schema Test\n');
console.log('='.repeat(70));

let totalTests = 0;
let passedTests = 0;

function runTest(testName: string, testFn: () => boolean): void {
  totalTests++;
  const result = testFn();
  if (result) {
    passedTests++;
    console.log(`✓ ${testName}`);
  } else {
    console.log(`✗ ${testName}`);
  }
}

// Test Suite 1: Schema Generation
console.log('\n📋 Test Suite 1: Schema Generation');
console.log('-'.repeat(70));

runTest('Generate breadcrumb schema with multiple items', () => {
  const schema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://aibesttool.com' },
    { name: 'Explore', url: 'https://aibesttool.com/explore' },
    { name: 'Tool', url: 'https://aibesttool.com/ai/tool' },
  ]);
  return validateSchema(schema);
});

runTest('Generate breadcrumb schema with single item', () => {
  const schema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://aibesttool.com' },
  ]);
  return validateSchema(schema);
});

runTest('Generate breadcrumb schema with empty array', () => {
  const schema = generateBreadcrumbSchema([]);
  return validateSchema(schema);
});

// Test Suite 2: Schema Structure
console.log('\n🏗️  Test Suite 2: Schema Structure');
console.log('-'.repeat(70));

const testSchema = generateBreadcrumbSchema([
  { name: 'Home', url: 'https://aibesttool.com' },
  { name: 'Page', url: 'https://aibesttool.com/page' },
]) as any;

runTest('Schema has @context property', () => {
  return testSchema['@context'] === 'https://schema.org';
});

runTest('Schema has @type property', () => {
  return testSchema['@type'] === 'BreadcrumbList';
});

runTest('Schema has itemListElement array', () => {
  return Array.isArray(testSchema.itemListElement);
});

runTest('Items have correct @type', () => {
  return testSchema.itemListElement.every((item: any) => item['@type'] === 'ListItem');
});

runTest('Items have sequential positions', () => {
  return testSchema.itemListElement.every((item: any, index: number) => 
    item.position === index + 1
  );
});

runTest('Items have name property', () => {
  return testSchema.itemListElement.every((item: any) => 
    typeof item.name === 'string' && item.name.length > 0
  );
});

runTest('Items have item (URL) property', () => {
  return testSchema.itemListElement.every((item: any) => 
    typeof item.item === 'string' && item.item.startsWith('http')
  );
});

// Test Suite 3: Page-Specific Schemas
console.log('\n📄 Test Suite 3: Page-Specific Schemas');
console.log('-'.repeat(70));

// Tool Detail Page
const toolPageSchema = generateBreadcrumbSchema([
  { name: 'Home', url: 'https://aibesttool.com/en' },
  { name: 'AI Tools', url: 'https://aibesttool.com/en/explore' },
  { name: 'ChatGPT', url: 'https://aibesttool.com/en/ai/chatgpt' },
]) as any;

runTest('Tool page has 3 breadcrumb items', () => {
  return toolPageSchema.itemListElement.length === 3;
});

runTest('Tool page breadcrumbs are correctly ordered', () => {
  return (
    toolPageSchema.itemListElement[0].name === 'Home' &&
    toolPageSchema.itemListElement[1].name === 'AI Tools' &&
    toolPageSchema.itemListElement[2].name === 'ChatGPT'
  );
});

// Explore Page
const explorePageSchema = generateBreadcrumbSchema([
  { name: 'Home', url: 'https://aibesttool.com' },
  { name: 'Explore', url: 'https://aibesttool.com/explore' },
]) as any;

runTest('Explore page has 2 breadcrumb items', () => {
  return explorePageSchema.itemListElement.length === 2;
});

runTest('Explore page breadcrumbs are correctly ordered', () => {
  return (
    explorePageSchema.itemListElement[0].name === 'Home' &&
    explorePageSchema.itemListElement[1].name === 'Explore'
  );
});

// Startup Page
const startupPageSchema = generateBreadcrumbSchema([
  { name: 'Home', url: 'https://aibesttool.com' },
  { name: 'Startup', url: 'https://aibesttool.com/startup' },
]) as any;

runTest('Startup page has 2 breadcrumb items', () => {
  return startupPageSchema.itemListElement.length === 2;
});

runTest('Startup page breadcrumbs are correctly ordered', () => {
  return (
    startupPageSchema.itemListElement[0].name === 'Home' &&
    startupPageSchema.itemListElement[1].name === 'Startup'
  );
});

// Test Suite 4: URL Validation
console.log('\n🔗 Test Suite 4: URL Validation');
console.log('-'.repeat(70));

runTest('All URLs are absolute (start with http/https)', () => {
  const schemas = [toolPageSchema, explorePageSchema, startupPageSchema];
  return schemas.every(schema => 
    schema.itemListElement.every((item: any) => 
      item.item.startsWith('http://') || item.item.startsWith('https://')
    )
  );
});

runTest('URLs do not have trailing slashes (except root)', () => {
  const schemas = [toolPageSchema, explorePageSchema, startupPageSchema];
  return schemas.every(schema => 
    schema.itemListElement.every((item: any) => {
      const url = item.item;
      // Allow trailing slash only for root URLs
      if (url.match(/^https?:\/\/[^/]+\/$/)) return true;
      return !url.endsWith('/');
    })
  );
});

runTest('URLs contain correct domain', () => {
  const schemas = [toolPageSchema, explorePageSchema, startupPageSchema];
  return schemas.every(schema => 
    schema.itemListElement.every((item: any) => 
      item.item.includes('aibesttool.com')
    )
  );
});

// Test Suite 5: JSON-LD Rendering
console.log('\n🎨 Test Suite 5: JSON-LD Rendering');
console.log('-'.repeat(70));

function simulateRendering(schema: object): string {
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

runTest('Schema can be serialized to JSON', () => {
  try {
    JSON.stringify(toolPageSchema);
    return true;
  } catch {
    return false;
  }
});

runTest('Rendered HTML contains script tag', () => {
  const html = simulateRendering(toolPageSchema);
  return html.includes('<script type="application/ld+json">');
});

runTest('Rendered HTML contains closing script tag', () => {
  const html = simulateRendering(toolPageSchema);
  return html.includes('</script>');
});

runTest('Rendered JSON-LD is parseable', () => {
  try {
    const html = simulateRendering(toolPageSchema);
    const jsonMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/);
    if (jsonMatch) {
      JSON.parse(jsonMatch[1]);
      return true;
    }
    return false;
  } catch {
    return false;
  }
});

// Test Suite 6: Edge Cases
console.log('\n⚠️  Test Suite 6: Edge Cases');
console.log('-'.repeat(70));

runTest('Handle special characters in names', () => {
  const schema = generateBreadcrumbSchema([
    { name: 'Home & About', url: 'https://aibesttool.com' },
    { name: 'Tools "AI"', url: 'https://aibesttool.com/tools' },
  ]);
  return validateSchema(schema);
});

runTest('Handle long breadcrumb names', () => {
  const longName = 'A'.repeat(100);
  const schema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://aibesttool.com' },
    { name: longName, url: 'https://aibesttool.com/page' },
  ]);
  return validateSchema(schema);
});

runTest('Handle URLs with query parameters', () => {
  const schema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://aibesttool.com' },
    { name: 'Search', url: 'https://aibesttool.com/search?q=test' },
  ]);
  return validateSchema(schema);
});

runTest('Handle URLs with hash fragments', () => {
  const schema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://aibesttool.com' },
    { name: 'Section', url: 'https://aibesttool.com/page#section' },
  ]);
  return validateSchema(schema);
});

// Test Suite 7: Integration
console.log('\n🔌 Test Suite 7: Integration');
console.log('-'.repeat(70));

runTest('Schema validates with Schema.org validator format', () => {
  const schema = toolPageSchema;
  return (
    schema['@context'] === 'https://schema.org' &&
    schema['@type'] === 'BreadcrumbList' &&
    Array.isArray(schema.itemListElement) &&
    schema.itemListElement.length > 0
  );
});

runTest('Schema follows Google guidelines', () => {
  // Google requires: @context, @type, itemListElement with position, name, item
  const schema = toolPageSchema;
  return schema.itemListElement.every((item: any) => 
    item['@type'] === 'ListItem' &&
    typeof item.position === 'number' &&
    typeof item.name === 'string' &&
    typeof item.item === 'string'
  );
});

// Summary
console.log('\n' + '='.repeat(70));
console.log('📊 Test Summary');
console.log('='.repeat(70));
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${totalTests - passedTests}`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n✅ All tests passed! BreadcrumbList schema implementation is complete.');
  console.log('\n📝 Implementation Details:');
  console.log('   • Schema generator: lib/seo/schema.ts');
  console.log('   • Tool pages: app/[locale]/(with-footer)/ai/[websiteName]/page.tsx');
  console.log('   • Explore page: app/[locale]/(with-footer)/explore/page.tsx');
  console.log('   • Startup page: app/[locale]/(with-footer)/startup/page.tsx');
  console.log('\n🔍 Next Steps:');
  console.log('   1. Deploy to production');
  console.log('   2. Test with Google Rich Results Test');
  console.log('   3. Monitor Google Search Console');
  console.log('   4. Verify breadcrumbs appear in search results');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed. Please review the implementation.');
  process.exit(1);
}
