/**
 * Verification Script: Tool Detail Pages Metadata
 * 
 * This script verifies that tool detail pages have optimized metadata including:
 * - Dynamic titles from tool names
 * - Descriptions from tool data
 * - Tool-specific social images
 * - Canonical URLs
 * 
 * Requirements: 2.1, 2.2, 2.3, 4.1, 4.2
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

import { getToolByName, getLocalizedField as getToolLocalizedField } from '../lib/services/tools';
import { getCategoryById, getLocalizedField as getCategoryLocalizedField } from '../lib/services/categories';
import { 
  generateToolTitle, 
  generateToolDescription, 
  generateCanonicalUrl, 
  generateSocialImageUrl 
} from '../lib/seo/metadata';
import { SEO_CONFIG, SEO_CONSTRAINTS, SOCIAL_IMAGE_DIMENSIONS } from '../lib/seo/constants';

interface MetadataCheck {
  check: string;
  passed: boolean;
  details?: string;
}

async function verifyToolDetailMetadata(toolName: string, locale: string = 'en'): Promise<void> {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Verifying Tool Detail Metadata: ${toolName} (${locale})`);
  console.log('='.repeat(80));

  const checks: MetadataCheck[] = [];

  try {
    // Get tool from database
    const dbTool = await getToolByName(toolName);
    
    if (!dbTool) {
      console.log(`\n❌ Tool not found: ${toolName}`);
      return;
    }

    // Get localized content
    const toolTitle = getToolLocalizedField(dbTool.title, locale);
    const toolDescription = getToolLocalizedField(dbTool.content, locale);
    
    // Get category name if available
    let toolCategory: string | undefined;
    if (dbTool.categoryId) {
      const category = await getCategoryById(dbTool.categoryId);
      if (category) {
        toolCategory = getCategoryLocalizedField(category.name, locale);
      }
    }

    // Generate metadata
    const optimizedTitle = generateToolTitle(toolTitle, toolCategory);
    const optimizedDescription = generateToolDescription(
      toolTitle,
      toolDescription,
      toolCategory
    );
    const canonicalUrl = generateCanonicalUrl(`/${locale}/ai/${toolName}`);
    const toolImage = dbTool.thumbnailUrl || dbTool.imageUrl || SEO_CONFIG.defaultImage;
    const socialImageUrl = generateSocialImageUrl(toolImage);

    // Check 1: Title is generated dynamically from tool name
    checks.push({
      check: 'Title includes tool name',
      passed: optimizedTitle.includes(toolTitle),
      details: `Title: "${optimizedTitle}"`
    });

    // Check 2: Title length is within SEO constraints (30-60 characters)
    const titleLength = optimizedTitle.length;
    checks.push({
      check: `Title length is within ${SEO_CONSTRAINTS.TITLE_MIN_LENGTH}-${SEO_CONSTRAINTS.TITLE_MAX_LENGTH} characters`,
      passed: titleLength >= SEO_CONSTRAINTS.TITLE_MIN_LENGTH && titleLength <= SEO_CONSTRAINTS.TITLE_MAX_LENGTH,
      details: `Length: ${titleLength} characters`
    });

    // Check 3: Description is generated from tool data
    checks.push({
      check: 'Description is generated from tool data',
      passed: optimizedDescription.length > 0,
      details: `Description: "${optimizedDescription.substring(0, 100)}..."`
    });

    // Check 4: Description length is within SEO constraints (120-160 characters)
    const descLength = optimizedDescription.length;
    checks.push({
      check: `Description length is within ${SEO_CONSTRAINTS.DESCRIPTION_MIN_LENGTH}-${SEO_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} characters`,
      passed: descLength >= SEO_CONSTRAINTS.DESCRIPTION_MIN_LENGTH && descLength <= SEO_CONSTRAINTS.DESCRIPTION_MAX_LENGTH,
      details: `Length: ${descLength} characters`
    });

    // Check 5: Canonical URL is properly formatted
    checks.push({
      check: 'Canonical URL is properly formatted',
      passed: canonicalUrl.startsWith(SEO_CONFIG.siteUrl) && canonicalUrl.includes(toolName),
      details: `URL: ${canonicalUrl}`
    });

    // Check 6: Social image URL is absolute
    checks.push({
      check: 'Social image URL is absolute',
      passed: socialImageUrl.startsWith('http://') || socialImageUrl.startsWith('https://'),
      details: `Image URL: ${socialImageUrl}`
    });

    // Check 7: Category is included in title if available
    if (toolCategory) {
      checks.push({
        check: 'Category is included in metadata',
        passed: optimizedTitle.toLowerCase().includes(toolCategory.toLowerCase()) || 
                optimizedDescription.toLowerCase().includes(toolCategory.toLowerCase()),
        details: `Category: ${toolCategory}`
      });
    }

    // Check 8: Tool-specific image is used (not default)
    checks.push({
      check: 'Tool-specific image is used',
      passed: !socialImageUrl.includes(SEO_CONFIG.defaultImage),
      details: dbTool.thumbnailUrl || dbTool.imageUrl ? 'Using tool image' : 'Using default image'
    });

    // Print results
    console.log('\n📋 Metadata Checks:');
    console.log('-'.repeat(80));
    
    let passedCount = 0;
    checks.forEach((check, index) => {
      const status = check.passed ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${check.check}`);
      if (check.details) {
        console.log(`   ${check.details}`);
      }
      if (check.passed) passedCount++;
    });

    console.log('-'.repeat(80));
    console.log(`\n📊 Summary: ${passedCount}/${checks.length} checks passed`);

    // Print full metadata for review
    console.log('\n📄 Generated Metadata:');
    console.log('-'.repeat(80));
    console.log(`Title: ${optimizedTitle}`);
    console.log(`Description: ${optimizedDescription}`);
    console.log(`Canonical URL: ${canonicalUrl}`);
    console.log(`Social Image: ${socialImageUrl}`);
    console.log(`Category: ${toolCategory || 'N/A'}`);
    
    // Print Open Graph metadata
    console.log('\n🌐 Open Graph Metadata:');
    console.log('-'.repeat(80));
    console.log(`og:title: ${optimizedTitle}`);
    console.log(`og:description: ${optimizedDescription}`);
    console.log(`og:url: ${canonicalUrl}`);
    console.log(`og:site_name: ${SEO_CONFIG.siteName}`);
    console.log(`og:image: ${socialImageUrl}`);
    console.log(`og:image:width: ${SOCIAL_IMAGE_DIMENSIONS.OPEN_GRAPH.width}`);
    console.log(`og:image:height: ${SOCIAL_IMAGE_DIMENSIONS.OPEN_GRAPH.height}`);
    console.log(`og:locale: ${locale}`);
    console.log(`og:type: website`);

    // Print Twitter Card metadata
    console.log('\n🐦 Twitter Card Metadata:');
    console.log('-'.repeat(80));
    console.log(`twitter:card: summary_large_image`);
    console.log(`twitter:title: ${optimizedTitle}`);
    console.log(`twitter:description: ${optimizedDescription}`);
    console.log(`twitter:image: ${socialImageUrl}`);

    if (passedCount === checks.length) {
      console.log('\n✅ All metadata checks passed!');
    } else {
      console.log(`\n⚠️  ${checks.length - passedCount} check(s) failed. Please review.`);
    }

  } catch (error) {
    console.error('\n❌ Error verifying metadata:', error);
    throw error;
  }
}

// Main execution
async function main() {
  console.log('🔍 Tool Detail Pages Metadata Verification');
  console.log('='.repeat(80));
  console.log('This script verifies that tool detail pages have optimized metadata.');
  console.log('Requirements: 2.1, 2.2, 2.3, 4.1, 4.2');

  // Test with a few sample tools
  const testTools = [
    'chatgpt-mac',
    'viggle',
    'gpt_4o'
  ];

  for (const toolName of testTools) {
    try {
      await verifyToolDetailMetadata(toolName, 'en');
    } catch (error) {
      console.error(`Failed to verify ${toolName}:`, error);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ Verification complete!');
  console.log('='.repeat(80));
  
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
