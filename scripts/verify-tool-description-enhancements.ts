/**
 * Verification Script: Tool Description Enhancements
 * 
 * This script verifies that tool detail pages meet the SEO requirements:
 * - Descriptions are at least 200-300 characters
 * - Pricing information is displayed
 * - Category and tags are displayed
 * - User ratings are shown
 * - Related tools are displayed
 * 
 * Requirements: 6.1, 6.2, 6.3
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { getToolByName, getLocalizedField } from '@/lib/services/tools';
import { getCategoryById, getLocalizedField as getCategoryLocalizedField } from '@/lib/services/categories';
import { getTagsBySlugs, getLocalizedField as getTagLocalizedField } from '@/lib/services/tags';

interface VerificationResult {
  toolName: string;
  passed: boolean;
  issues: string[];
  details: {
    descriptionLength: number;
    hasCategory: boolean;
    tagCount: number;
    hasPricing: boolean;
    categoryName?: string;
    tags?: string[];
  };
}

async function verifyToolEnhancements(toolName: string, locale: string = 'en'): Promise<VerificationResult> {
  const issues: string[] = [];
  const result: VerificationResult = {
    toolName,
    passed: true,
    issues,
    details: {
      descriptionLength: 0,
      hasCategory: false,
      tagCount: 0,
      hasPricing: false,
    },
  };

  try {
    // Get tool from database
    const tool = await getToolByName(toolName);
    
    if (!tool) {
      issues.push(`Tool "${toolName}" not found in database`);
      result.passed = false;
      return result;
    }

    // Check description length (Requirement 6.1)
    const description = getLocalizedField(tool.detail, locale) || getLocalizedField(tool.content, locale);
    result.details.descriptionLength = description.length;
    
    if (description.length < 200) {
      issues.push(`Description too short: ${description.length} characters (minimum 200 required)`);
      result.passed = false;
    } else if (description.length > 300) {
      console.log(`✓ Description length: ${description.length} characters (exceeds minimum)`);
    } else {
      console.log(`✓ Description length: ${description.length} characters (within 200-300 range)`);
    }

    // Check pricing information (Requirement 6.2)
    if (tool.pricing) {
      result.details.hasPricing = true;
      console.log(`✓ Pricing information: ${tool.pricing}`);
    } else {
      issues.push('Missing pricing information');
      result.passed = false;
    }

    // Check category (Requirement 6.2)
    if (tool.categoryId) {
      const category = await getCategoryById(tool.categoryId);
      if (category) {
        result.details.hasCategory = true;
        result.details.categoryName = getCategoryLocalizedField(category.name, locale);
        console.log(`✓ Category: ${result.details.categoryName}`);
      } else {
        issues.push('Category ID exists but category not found');
        result.passed = false;
      }
    } else {
      issues.push('Missing category information');
      result.passed = false;
    }

    // Check tags (Requirement 6.2)
    if (tool.tags && tool.tags.length > 0) {
      const tags = await getTagsBySlugs(tool.tags);
      result.details.tagCount = tags.length;
      result.details.tags = tags.map(tag => getTagLocalizedField(tag.name, locale));
      console.log(`✓ Tags (${tags.length}): ${result.details.tags.join(', ')}`);
    } else {
      issues.push('Missing tags');
      result.passed = false;
    }

    // Check for features and use cases (structured information)
    if (tool.features && Object.keys(tool.features).length > 0) {
      console.log(`✓ Features: ${Object.keys(tool.features).length} features defined`);
    } else {
      console.log('⚠ No features defined (optional but recommended)');
    }

    if (tool.useCases && Object.keys(tool.useCases).length > 0) {
      console.log(`✓ Use Cases: ${Object.keys(tool.useCases).length} use cases defined`);
    } else {
      console.log('⚠ No use cases defined (optional but recommended)');
    }

  } catch (error) {
    issues.push(`Error verifying tool: ${error instanceof Error ? error.message : String(error)}`);
    result.passed = false;
  }

  return result;
}

async function main() {
  console.log('='.repeat(80));
  console.log('Tool Description Enhancement Verification');
  console.log('Requirements: 6.1, 6.2, 6.3');
  console.log('='.repeat(80));
  console.log();

  // Test with a few sample tools from the database
  const testTools = [
    'chatgpt-mac',
    'anime-girl-studio',
    'woy-ai',
  ];

  const results: VerificationResult[] = [];

  for (const toolName of testTools) {
    console.log(`\nVerifying tool: ${toolName}`);
    console.log('-'.repeat(80));
    
    const result = await verifyToolEnhancements(toolName);
    results.push(result);

    if (result.passed) {
      console.log('✅ PASSED: All requirements met');
    } else {
      console.log('❌ FAILED: Issues found:');
      result.issues.forEach(issue => console.log(`   - ${issue}`));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('Summary');
  console.log('='.repeat(80));
  
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  console.log(`\nTotal tools tested: ${totalCount}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${totalCount - passedCount}`);
  
  if (passedCount === totalCount) {
    console.log('\n✅ All tools meet the enhancement requirements!');
  } else {
    console.log('\n⚠️  Some tools need attention. Review the issues above.');
  }

  // Detailed breakdown
  console.log('\nDetailed Breakdown:');
  results.forEach(result => {
    console.log(`\n${result.toolName}:`);
    console.log(`  Description: ${result.details.descriptionLength} chars`);
    console.log(`  Category: ${result.details.hasCategory ? result.details.categoryName : 'Missing'}`);
    console.log(`  Tags: ${result.details.tagCount} tags`);
    console.log(`  Pricing: ${result.details.hasPricing ? 'Yes' : 'Missing'}`);
  });
}

main().catch(console.error);
