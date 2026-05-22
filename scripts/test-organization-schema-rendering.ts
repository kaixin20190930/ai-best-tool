/**
 * Test script to verify Organization schema rendering
 * This simulates what would be rendered on the homepage
 */

import { generateOrganizationSchema } from '../lib/seo/schema';
import { SEO_CONFIG } from '../lib/seo/constants';

console.log('🧪 Testing Organization Schema Rendering\n');

// Simulate the schema generation as it would happen on the homepage
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aibesttool.com';

const organizationSchema = generateOrganizationSchema({
  name: SEO_CONFIG.siteName,
  url: siteUrl,
  logo: `${siteUrl}/images/aibesttool.png`,
  description: SEO_CONFIG.defaultDescription,
  socialLinks: [],
});

console.log('Generated Organization Schema:');
console.log('═══════════════════════════════════════════════════════════');
console.log(JSON.stringify(organizationSchema, null, 2));
console.log('═══════════════════════════════════════════════════════════\n');

// Simulate the HTML output
const jsonLdScript = `<script type="application/ld+json">
${JSON.stringify(organizationSchema, null, 2)}
</script>`;

console.log('HTML Output (as it would appear in page source):');
console.log('═══════════════════════════════════════════════════════════');
console.log(jsonLdScript);
console.log('═══════════════════════════════════════════════════════════\n');

// Validation checks
console.log('✅ Validation Checks:');
console.log('─────────────────────────────────────────');

const schema = organizationSchema as any;

// Check 1: Schema.org context
if (schema['@context'] === 'https://schema.org') {
  console.log('✅ Correct @context: https://schema.org');
} else {
  console.log('❌ Invalid @context');
}

// Check 2: Organization type
if (schema['@type'] === 'Organization') {
  console.log('✅ Correct @type: Organization');
} else {
  console.log('❌ Invalid @type');
}

// Check 3: Name
if (schema.name && schema.name.length > 0) {
  console.log(`✅ Organization name: "${schema.name}"`);
} else {
  console.log('❌ Missing organization name');
}

// Check 4: URL
if (schema.url && schema.url.startsWith('http')) {
  console.log(`✅ Organization URL: ${schema.url}`);
} else {
  console.log('❌ Invalid or missing URL');
}

// Check 5: Logo
if (schema.logo && schema.logo['@type'] === 'ImageObject' && schema.logo.url) {
  console.log(`✅ Logo URL: ${schema.logo.url}`);
} else {
  console.log('❌ Invalid or missing logo');
}

// Check 6: Description
if (schema.description && schema.description.length > 0) {
  console.log(`✅ Description: "${schema.description.substring(0, 60)}..."`);
} else {
  console.log('⚠️  No description (optional but recommended)');
}

console.log('\n📋 Testing Instructions:');
console.log('─────────────────────────────────────────');
console.log('1. Start the development server: npm run dev');
console.log('2. Open http://localhost:3000 in your browser');
console.log('3. Right-click and select "View Page Source"');
console.log('4. Search for "application/ld+json" in the source');
console.log('5. Verify the Organization schema appears in the HTML');
console.log('');
console.log('6. Test with Google Rich Results Test:');
console.log('   a. Go to: https://search.google.com/test/rich-results');
console.log('   b. Enter your homepage URL');
console.log('   c. Verify "Organization" appears in the results');
console.log('');
console.log('7. Alternative: Use Schema.org validator:');
console.log('   a. Go to: https://validator.schema.org/');
console.log('   b. Paste the JSON-LD from page source');
console.log('   c. Verify no errors are reported');

console.log('\n✅ Organization schema implementation complete!');
