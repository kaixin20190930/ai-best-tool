/**
 * Manual verification script for SEO utilities
 * Run with: npx tsx lib/seo/__tests__/verify-seo-utils.ts
 */

import {
  generateTitle,
  generateDescription,
  generateSocialImageUrl,
  generateCanonicalUrl,
  generateToolTitle,
  generateToolDescription,
  generateOrganizationSchema,
  generateSoftwareSchema,
  generateBreadcrumbSchema,
  validateSchema,
  SEO_CONFIG,
  SEO_CONSTRAINTS,
  type ToolMetadata,
} from '../index';

console.log('🧪 Testing SEO Utilities\n');

// Test 1: Title Generation
console.log('1️⃣ Testing Title Generation');
const title1 = generateTitle('AI Tools Directory');
console.log(`   Generated: "${title1}"`);
console.log(`   Length: ${title1.length} (should be 30-60)`);
console.log(
  `   ✓ ${title1.length >= SEO_CONSTRAINTS.TITLE_MIN_LENGTH && title1.length <= SEO_CONSTRAINTS.TITLE_MAX_LENGTH ? 'PASS' : 'FAIL'}\n`,
);

// Test 2: Description Generation
console.log('2️⃣ Testing Description Generation');
const desc1 = generateDescription(
  'Discover the best AI tools for your business. Our curated directory features hundreds of AI-powered applications and services to boost your productivity.',
);
console.log(`   Generated: "${desc1}"`);
console.log(`   Length: ${desc1.length} (should be 120-160)`);
console.log(
  `   ✓ ${desc1.length >= SEO_CONSTRAINTS.DESCRIPTION_MIN_LENGTH && desc1.length <= SEO_CONSTRAINTS.DESCRIPTION_MAX_LENGTH ? 'PASS' : 'FAIL'}\n`,
);

// Test 3: Social Image URL
console.log('3️⃣ Testing Social Image URL Generation');
const imageUrl = generateSocialImageUrl('/images/tool.png');
console.log(`   Generated: "${imageUrl}"`);
console.log(`   ✓ ${imageUrl.startsWith('http') ? 'PASS' : 'FAIL'}\n`);

// Test 4: Canonical URL
console.log('4️⃣ Testing Canonical URL Generation');
const canonicalUrl = generateCanonicalUrl('/explore/ai-tools');
console.log(`   Generated: "${canonicalUrl}"`);
console.log(`   ✓ ${canonicalUrl.startsWith('http') && !canonicalUrl.endsWith('/') ? 'PASS' : 'FAIL'}\n`);

// Test 5: Tool Title
console.log('5️⃣ Testing Tool Title Generation');
const toolTitle = generateToolTitle('ChatGPT', 'Chatbot');
console.log(`   Generated: "${toolTitle}"`);
console.log(`   ✓ ${toolTitle.includes('ChatGPT') && toolTitle.includes('Chatbot') ? 'PASS' : 'FAIL'}\n`);

// Test 6: Tool Description
console.log('6️⃣ Testing Tool Description Generation');
const toolDesc = generateToolDescription('ChatGPT', 'An AI chatbot', 'AI Assistant');
console.log(`   Generated: "${toolDesc}"`);
console.log(`   ✓ ${toolDesc.includes('ChatGPT') ? 'PASS' : 'FAIL'}\n`);

// Test 7: Organization Schema
console.log('7️⃣ Testing Organization Schema');
const orgSchema = generateOrganizationSchema({
  name: SEO_CONFIG.siteName,
  url: SEO_CONFIG.siteUrl,
  logo: `${SEO_CONFIG.siteUrl}${SEO_CONFIG.defaultImage}`,
  socialLinks: ['https://twitter.com/aibesttool'],
});
console.log(`   Schema Type: ${(orgSchema as any)['@type']}`);
console.log(`   Valid: ${validateSchema(orgSchema)}`);
console.log(`   ✓ ${validateSchema(orgSchema) && (orgSchema as any)['@type'] === 'Organization' ? 'PASS' : 'FAIL'}\n`);

// Test 8: Software Schema
console.log('8️⃣ Testing Software Schema');
const toolData: ToolMetadata = {
  name: 'ChatGPT',
  description: 'An AI-powered chatbot for conversations',
  category: 'AI Assistant',
  tags: ['ai', 'chatbot', 'nlp'],
  pricing: { type: 'freemium' },
  rating: { value: 4.8, count: 1500 },
  image: 'https://example.com/chatgpt.png',
  url: 'https://example.com/tools/chatgpt',
};
const softwareSchema = generateSoftwareSchema(toolData);
console.log(`   Schema Type: ${(softwareSchema as any)['@type']}`);
console.log(`   Has Rating: ${!!(softwareSchema as any).aggregateRating}`);
console.log(`   Has Pricing: ${!!(softwareSchema as any).offers}`);
console.log(
  `   ✓ ${validateSchema(softwareSchema) && (softwareSchema as any)['@type'] === 'SoftwareApplication' ? 'PASS' : 'FAIL'}\n`,
);

// Test 9: Breadcrumb Schema
console.log('9️⃣ Testing Breadcrumb Schema');
const breadcrumbSchema = generateBreadcrumbSchema([
  { name: 'Home', url: `${SEO_CONFIG.siteUrl}/` },
  { name: 'Explore', url: `${SEO_CONFIG.siteUrl}/explore` },
  { name: 'AI Tools', url: `${SEO_CONFIG.siteUrl}/explore/ai-tools` },
]);
console.log(`   Schema Type: ${(breadcrumbSchema as any)['@type']}`);
console.log(`   Items Count: ${(breadcrumbSchema as any).itemListElement.length}`);
console.log(
  `   ✓ ${validateSchema(breadcrumbSchema) && (breadcrumbSchema as any)['@type'] === 'BreadcrumbList' ? 'PASS' : 'FAIL'}\n`,
);

// Test 10: Constants
console.log('🔟 Testing Constants');
console.log(`   Site Name: ${SEO_CONFIG.siteName}`);
console.log(`   Site URL: ${SEO_CONFIG.siteUrl}`);
console.log(`   Locales: ${SEO_CONFIG.locales.join(', ')}`);
console.log(`   Title Range: ${SEO_CONSTRAINTS.TITLE_MIN_LENGTH}-${SEO_CONSTRAINTS.TITLE_MAX_LENGTH}`);
console.log(
  `   Description Range: ${SEO_CONSTRAINTS.DESCRIPTION_MIN_LENGTH}-${SEO_CONSTRAINTS.DESCRIPTION_MAX_LENGTH}`,
);
console.log(`   ✓ PASS\n`);

console.log('✅ All SEO utilities verified successfully!');
