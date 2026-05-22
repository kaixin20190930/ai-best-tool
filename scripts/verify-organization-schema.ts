/**
 * Verification script for Organization schema on homepage
 * Tests that the Organization schema is properly rendered
 */

import { generateOrganizationSchema } from '../lib/seo/schema';
import { SEO_CONFIG } from '../lib/seo/constants';
import { validateSchema } from '../lib/seo/schema';

console.log('🔍 Verifying Organization Schema Implementation\n');

// Test 1: Generate Organization schema
console.log('Test 1: Generating Organization schema...');
const organizationSchema = generateOrganizationSchema({
  name: SEO_CONFIG.siteName,
  url: SEO_CONFIG.siteUrl,
  logo: `${SEO_CONFIG.siteUrl}/images/aibesttool.png`,
  description: SEO_CONFIG.defaultDescription,
  socialLinks: [],
});

console.log('Generated schema:');
console.log(JSON.stringify(organizationSchema, null, 2));
console.log('');

// Test 2: Validate schema structure
console.log('Test 2: Validating schema structure...');
const isValid = validateSchema(organizationSchema);
console.log(`Schema is valid: ${isValid ? '✅' : '❌'}`);
console.log('');

// Test 3: Check required fields
console.log('Test 3: Checking required fields...');
const schema = organizationSchema as any;
const requiredFields = ['@context', '@type', 'name', 'url', 'logo'];
const missingFields: string[] = [];

requiredFields.forEach((field) => {
  const hasField = field in schema;
  console.log(`  ${field}: ${hasField ? '✅' : '❌'}`);
  if (!hasField) {
    missingFields.push(field);
  }
});

if (missingFields.length > 0) {
  console.log(`\n❌ Missing required fields: ${missingFields.join(', ')}`);
} else {
  console.log('\n✅ All required fields present');
}
console.log('');

// Test 4: Verify schema type
console.log('Test 4: Verifying schema type...');
if (schema['@type'] === 'Organization') {
  console.log('✅ Schema type is Organization');
} else {
  console.log(`❌ Schema type is ${schema['@type']}, expected Organization`);
}
console.log('');

// Test 5: Verify logo structure
console.log('Test 5: Verifying logo structure...');
if (schema.logo && typeof schema.logo === 'object') {
  const logo = schema.logo as any;
  if (logo['@type'] === 'ImageObject' && logo.url) {
    console.log('✅ Logo has correct ImageObject structure');
    console.log(`   Logo URL: ${logo.url}`);
  } else {
    console.log('❌ Logo structure is incorrect');
  }
} else {
  console.log('❌ Logo is missing or not an object');
}
console.log('');

// Test 6: Check optional fields
console.log('Test 6: Checking optional fields...');
if (schema.description) {
  console.log(`✅ Description present: "${schema.description.substring(0, 50)}..."`);
} else {
  console.log('⚠️  Description not present (optional)');
}

if (schema.sameAs && Array.isArray(schema.sameAs) && schema.sameAs.length > 0) {
  console.log(`✅ Social links present: ${schema.sameAs.length} links`);
  schema.sameAs.forEach((link: string) => {
    console.log(`   - ${link}`);
  });
} else {
  console.log('⚠️  Social links not present (optional)');
}
console.log('');

// Summary
console.log('📊 Summary:');
console.log('─────────────────────────────────────────');
if (isValid && missingFields.length === 0 && schema['@type'] === 'Organization') {
  console.log('✅ Organization schema is correctly implemented');
  console.log('✅ Ready for Google Rich Results Test');
  console.log('');
  console.log('Next steps:');
  console.log('1. Build and run the application');
  console.log('2. Visit the homepage');
  console.log('3. View page source and look for <script type="application/ld+json">');
  console.log('4. Test with Google Rich Results Test:');
  console.log('   https://search.google.com/test/rich-results');
} else {
  console.log('❌ Organization schema has issues that need to be fixed');
}
