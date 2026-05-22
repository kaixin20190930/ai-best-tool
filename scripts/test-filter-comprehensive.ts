/**
 * Comprehensive test for the filter system
 * Tests all filtering capabilities including category, tags, pricing, and combinations
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { getTools, ToolFilters } from '../lib/services/tools';
import { getAllCategories } from '../lib/services/categories';
import { getAllTags } from '../lib/services/tags';

async function testFilterComprehensive() {
  console.log('🧪 Comprehensive Filter System Test\n');
  console.log('='.repeat(60));

  let passedTests = 0;
  let totalTests = 0;

  try {
    // Test 1: Fetch categories and tags
    console.log('\n📋 Test 1: Fetching categories and tags...');
    totalTests++;
    const categories = await getAllCategories(true);
    const tags = await getAllTags('count');
    
    if (categories.length > 0 && tags.length > 0) {
      console.log(`   ✅ Found ${categories.length} categories and ${tags.length} tags`);
      passedTests++;
    } else {
      console.log(`   ❌ Failed: No categories or tags found`);
    }

    // Test 2: Category filter accuracy (Property 5)
    console.log('\n🔍 Test 2: Category filter accuracy (Property 5)...');
    totalTests++;
    if (categories.length > 0) {
      const testCategory = categories[0];
      const result = await getTools(
        { category: testCategory.slug, status: 'published' },
        { page: 1, pageSize: 100 }
      );
      
      // Verify all returned tools belong to the selected category
      const allBelongToCategory = result.data.every(tool => {
        // Get the category ID for this slug
        const category = categories.find(c => c.slug === testCategory.slug);
        return tool.categoryId === category?.id;
      });
      
      if (allBelongToCategory) {
        console.log(`   ✅ All ${result.data.length} tools belong to category "${testCategory.slug}"`);
        passedTests++;
      } else {
        console.log(`   ❌ Failed: Some tools don't belong to the selected category`);
      }
    } else {
      console.log(`   ⚠️  Skipped: No categories available`);
    }

    // Test 3: Tag filter intersection (Property 6)
    console.log('\n🏷️  Test 3: Tag filter intersection (Property 6)...');
    totalTests++;
    const tagsWithCount = tags.filter(t => t.count > 0);
    if (tagsWithCount.length >= 2) {
      const selectedTags = [tagsWithCount[0].slug, tagsWithCount[1].slug];
      const result = await getTools(
        { tags: selectedTags, status: 'published' },
        { page: 1, pageSize: 100 }
      );
      
      // Verify all returned tools contain ALL selected tags
      const allContainTags = result.data.every(tool =>
        selectedTags.every(tag => tool.tags.includes(tag))
      );
      
      if (allContainTags) {
        console.log(`   ✅ All ${result.data.length} tools contain tags: ${selectedTags.join(', ')}`);
        passedTests++;
      } else {
        console.log(`   ❌ Failed: Some tools don't contain all selected tags`);
      }
    } else {
      console.log(`   ⚠️  Skipped: Not enough tags with tools`);
    }

    // Test 4: Pricing filter
    console.log('\n💰 Test 4: Pricing filter...');
    totalTests++;
    const pricingOptions: Array<'free' | 'freemium' | 'paid'> = ['free', 'freemium', 'paid'];
    let pricingTestPassed = true;
    
    for (const pricing of pricingOptions) {
      const result = await getTools(
        { pricing, status: 'published' },
        { page: 1, pageSize: 100 }
      );
      
      const allMatchPricing = result.data.every(tool => tool.pricing === pricing);
      if (!allMatchPricing && result.data.length > 0) {
        console.log(`   ❌ Failed: Some tools don't match pricing "${pricing}"`);
        pricingTestPassed = false;
        break;
      }
    }
    
    if (pricingTestPassed) {
      console.log(`   ✅ Pricing filter works correctly for all options`);
      passedTests++;
    }

    // Test 5: Combined filters
    console.log('\n🔗 Test 5: Combined filters (category + tags + pricing)...');
    totalTests++;
    if (categories.length > 0 && tagsWithCount.length > 0) {
      const testCategory = categories[0];
      const testTag = tagsWithCount[0].slug;
      const testPricing = 'free';
      
      const result = await getTools(
        {
          category: testCategory.slug,
          tags: [testTag],
          pricing: testPricing,
          status: 'published',
        },
        { page: 1, pageSize: 100 }
      );
      
      // Verify all conditions are met
      const category = categories.find(c => c.slug === testCategory.slug);
      const allMatch = result.data.every(tool =>
        tool.categoryId === category?.id &&
        tool.tags.includes(testTag) &&
        tool.pricing === testPricing
      );
      
      if (allMatch) {
        console.log(`   ✅ Combined filters work correctly (${result.data.length} tools found)`);
        passedTests++;
      } else {
        console.log(`   ❌ Failed: Some tools don't match all filter criteria`);
      }
    } else {
      console.log(`   ⚠️  Skipped: Not enough data for combined test`);
    }

    // Test 6: Empty filter returns all published tools
    console.log('\n📦 Test 6: No filters returns all published tools...');
    totalTests++;
    const allPublished = await getTools(
      { status: 'published' },
      { page: 1, pageSize: 100 }
    );
    
    if (allPublished.data.every(tool => tool.status === 'published')) {
      console.log(`   ✅ Found ${allPublished.total} published tools`);
      passedTests++;
    } else {
      console.log(`   ❌ Failed: Some non-published tools were returned`);
    }

    // Test 7: Pagination works with filters
    console.log('\n📄 Test 7: Pagination with filters...');
    totalTests++;
    if (categories.length > 0) {
      const testCategory = categories[0];
      const page1 = await getTools(
        { category: testCategory.slug, status: 'published' },
        { page: 1, pageSize: 2 }
      );
      const page2 = await getTools(
        { category: testCategory.slug, status: 'published' },
        { page: 2, pageSize: 2 }
      );
      
      // Verify pages don't overlap
      const page1Ids = page1.data.map(t => t.id);
      const page2Ids = page2.data.map(t => t.id);
      const noOverlap = !page1Ids.some(id => page2Ids.includes(id));
      
      if (noOverlap && page1.total === page2.total) {
        console.log(`   ✅ Pagination works correctly (total: ${page1.total})`);
        passedTests++;
      } else {
        console.log(`   ❌ Failed: Pagination has issues`);
      }
    } else {
      console.log(`   ⚠️  Skipped: No categories available`);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 Test Summary: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('✅ All tests passed! Filter system is working correctly.\n');
      process.exit(0);
    } else {
      console.log(`⚠️  ${totalTests - passedTests} test(s) failed.\n`);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error during testing:', error);
    process.exit(1);
  }
}

testFilterComprehensive();
