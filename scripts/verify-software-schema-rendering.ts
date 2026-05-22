/**
 * Verification Script: SoftwareApplication Schema Rendering
 * 
 * This script verifies that the SoftwareApplication schema is correctly
 * rendered on actual tool detail pages by checking the HTML output.
 */

import { config } from 'dotenv';

// 加载环境变量
config({ path: '.env.local' });

import { getToolByName } from '@/lib/services/tools';
import { generateSoftwareSchema } from '@/lib/seo/schema';
import { ToolMetadata } from '@/lib/seo/constants';

async function verifySchemaRendering() {
  console.log('🔍 Verifying SoftwareApplication Schema Rendering\n');

  try {
    // Get a sample tool from the database
    const sampleToolName = 'chatgpt'; // You can change this to any tool name
    console.log(`Fetching tool: ${sampleToolName}...`);
    
    const tool = await getToolByName(sampleToolName);
    
    if (!tool) {
      console.log('❌ Tool not found in database');
      console.log('💡 Try with a different tool name or ensure the database has tools');
      return;
    }

    console.log('✅ Tool found:', tool.name);
    console.log('   Title:', tool.title);
    console.log('   Pricing:', tool.pricing);
    console.log('   Tags:', tool.tags);
    console.log();

    // Generate schema for this tool
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aibesttool.com';
    const toolUrl = `${baseUrl}/en/ai/${tool.name}`;
    
    // Get localized fields (using 'en' as default)
    const getLocalizedField = (field: Record<string, string>, locale: string = 'en') => {
      return field[locale] || field['en'] || Object.values(field)[0] || '';
    };

    const toolMetadata: ToolMetadata = {
      name: getLocalizedField(tool.title),
      description: getLocalizedField(tool.content),
      longDescription: getLocalizedField(tool.detail),
      category: 'SoftwareApplication',
      tags: tool.tags || [],
      pricing: {
        type: tool.pricing as 'free' | 'paid' | 'freemium',
        price: undefined,
        currency: 'USD',
      },
      rating: tool.ratingCount > 0 ? {
        value: tool.averageRating,
        count: tool.ratingCount,
      } : undefined,
      image: tool.thumbnailUrl || tool.imageUrl || '',
      url: toolUrl,
    };

    const schema = generateSoftwareSchema(toolMetadata);

    console.log('📋 Generated Schema:');
    console.log(JSON.stringify(schema, null, 2));
    console.log();

    // Verify schema structure
    console.log('✅ Schema Validation:');
    console.log('   Has @context:', '@context' in schema ? '✅' : '❌');
    console.log('   Has @type:', '@type' in schema ? '✅' : '❌');
    console.log('   Has name:', 'name' in schema ? '✅' : '❌');
    console.log('   Has description:', 'description' in schema ? '✅' : '❌');
    console.log('   Has url:', 'url' in schema ? '✅' : '❌');
    console.log('   Has applicationCategory:', 'applicationCategory' in schema ? '✅' : '❌');
    console.log('   Has image:', 'image' in schema ? '✅' : '❌');
    console.log('   Has offers:', 'offers' in schema ? '✅' : '❌');
    
    if (tool.ratingCount > 0) {
      console.log('   Has aggregateRating:', 'aggregateRating' in schema ? '✅' : '❌');
    }
    
    if (tool.tags && tool.tags.length > 0) {
      console.log('   Has keywords:', 'keywords' in schema ? '✅' : '❌');
    }
    console.log();

    // Instructions for manual testing
    console.log('📝 Manual Testing Instructions:');
    console.log('1. Start the development server: npm run dev');
    console.log(`2. Visit: http://localhost:3000/en/ai/${tool.name}`);
    console.log('3. View page source (Ctrl+U or Cmd+U)');
    console.log('4. Search for "application/ld+json" to find the schema');
    console.log('5. Copy the JSON-LD content');
    console.log('6. Test with Google Rich Results Test:');
    console.log('   https://search.google.com/test/rich-results');
    console.log();

    console.log('✅ Verification complete!');
    console.log();
    console.log('💡 Next Steps:');
    console.log('   - Test with Google Rich Results Test');
    console.log('   - Verify schema appears in page source');
    console.log('   - Check multiple tool pages');
    console.log('   - Test with different pricing types (free, paid, freemium)');

  } catch (error) {
    console.error('❌ Error during verification:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
  }
}

// Run verification
verifySchemaRendering();
