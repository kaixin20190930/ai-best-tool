/**
 * Test Script: SoftwareApplication Schema Verification
 * 
 * This script verifies that the SoftwareApplication schema is correctly
 * generated for tool pages and validates against Schema.org specifications.
 */

import { generateSoftwareSchema, validateSchema } from '@/lib/seo/schema';
import { ToolMetadata } from '@/lib/seo/constants';

console.log('🧪 Testing SoftwareApplication Schema Generation\n');

// Test Case 1: Free tool with ratings
console.log('Test 1: Free tool with ratings');
const freeTool: ToolMetadata = {
  name: 'ChatGPT',
  description: 'AI-powered conversational assistant',
  longDescription: 'ChatGPT is an advanced AI language model that can engage in natural conversations.',
  category: 'AI Assistant',
  tags: ['AI', 'Chat', 'NLP'],
  pricing: {
    type: 'free',
  },
  rating: {
    value: 4.5,
    count: 1250,
  },
  image: 'https://example.com/chatgpt.png',
  url: 'https://aibesttool.com/ai/chatgpt',
};

const freeToolSchema = generateSoftwareSchema(freeTool);
console.log('Schema:', JSON.stringify(freeToolSchema, null, 2));
console.log('Valid:', validateSchema(freeToolSchema) ? '✅' : '❌');
console.log('Has @context:', '@context' in freeToolSchema ? '✅' : '❌');
console.log('Has @type:', '@type' in freeToolSchema ? '✅' : '❌');
console.log('Has name:', 'name' in freeToolSchema ? '✅' : '❌');
console.log('Has description:', 'description' in freeToolSchema ? '✅' : '❌');
console.log('Has offers:', 'offers' in freeToolSchema ? '✅' : '❌');
console.log('Has aggregateRating:', 'aggregateRating' in freeToolSchema ? '✅' : '❌');
console.log('Has keywords:', 'keywords' in freeToolSchema ? '✅' : '❌');
console.log();

// Test Case 2: Paid tool without ratings
console.log('Test 2: Paid tool without ratings');
const paidTool: ToolMetadata = {
  name: 'Midjourney',
  description: 'AI image generation tool',
  category: 'Image Generation',
  tags: ['AI', 'Image', 'Art'],
  pricing: {
    type: 'paid',
    price: 30,
    currency: 'USD',
  },
  image: 'https://example.com/midjourney.png',
  url: 'https://aibesttool.com/ai/midjourney',
};

const paidToolSchema = generateSoftwareSchema(paidTool);
console.log('Schema:', JSON.stringify(paidToolSchema, null, 2));
console.log('Valid:', validateSchema(paidToolSchema) ? '✅' : '❌');
console.log('Has offers with price:', 
  'offers' in paidToolSchema && 
  (paidToolSchema as any).offers.price === '30' ? '✅' : '❌'
);
console.log('Has priceCurrency:', 
  'offers' in paidToolSchema && 
  (paidToolSchema as any).offers.priceCurrency === 'USD' ? '✅' : '❌'
);
console.log();

// Test Case 3: Freemium tool
console.log('Test 3: Freemium tool');
const freemiumTool: ToolMetadata = {
  name: 'Notion AI',
  description: 'AI-powered workspace',
  category: 'Productivity',
  tags: ['AI', 'Productivity', 'Notes'],
  pricing: {
    type: 'freemium',
  },
  rating: {
    value: 4.8,
    count: 3500,
  },
  image: 'https://example.com/notion.png',
  url: 'https://aibesttool.com/ai/notion-ai',
};

const freemiumToolSchema = generateSoftwareSchema(freemiumTool);
console.log('Schema:', JSON.stringify(freemiumToolSchema, null, 2));
console.log('Valid:', validateSchema(freemiumToolSchema) ? '✅' : '❌');
console.log('Has AggregateOffer:', 
  'offers' in freemiumToolSchema && 
  (freemiumToolSchema as any).offers['@type'] === 'AggregateOffer' ? '✅' : '❌'
);
console.log();

// Test Case 4: Tool with no ratings (rating count = 0)
console.log('Test 4: Tool with no ratings');
const noRatingTool: ToolMetadata = {
  name: 'New Tool',
  description: 'A brand new AI tool',
  category: 'AI Tool',
  tags: ['AI', 'New'],
  pricing: {
    type: 'free',
  },
  rating: {
    value: 0,
    count: 0,
  },
  image: 'https://example.com/new-tool.png',
  url: 'https://aibesttool.com/ai/new-tool',
};

const noRatingSchema = generateSoftwareSchema(noRatingTool);
console.log('Schema:', JSON.stringify(noRatingSchema, null, 2));
console.log('Valid:', validateSchema(noRatingSchema) ? '✅' : '❌');
console.log('Should NOT have aggregateRating:', 
  !('aggregateRating' in noRatingSchema) ? '✅' : '❌'
);
console.log();

// Summary
console.log('📊 Summary');
console.log('All schemas should be valid and contain required Schema.org fields');
console.log('Free tools should have price: "0"');
console.log('Paid tools should have the specified price');
console.log('Freemium tools should use AggregateOffer');
console.log('Tools with ratings should include aggregateRating');
console.log('Tools without ratings should NOT include aggregateRating');
console.log();
console.log('✅ Test complete!');
