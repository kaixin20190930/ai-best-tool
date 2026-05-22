/**
 * Test script for the filter system
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { getTools, ToolFilters } from '../lib/services/tools';
import { getAllCategories } from '../lib/services/categories';
import { getAllTags } from '../lib/services/tags';

async function testFilterSystem() {
  console.log('Testing Filter System...\n');

  try {
    // Test 1: Get all categories
    console.log('1. Fetching all categories...');
    const categories = await getAllCategories(true);
    console.log(`   Found ${categories.length} categories`);
    categories.forEach((cat) => {
      console.log(`   - ${cat.slug}: ${JSON.stringify(cat.name)}`);
    });

    // Test 2: Get all tags
    console.log('\n2. Fetching all tags...');
    const tags = await getAllTags('count');
    console.log(`   Found ${tags.length} tags`);
    tags.slice(0, 5).forEach((tag) => {
      console.log(`   - ${tag.slug}: ${JSON.stringify(tag.name)} (count: ${tag.count})`);
    });

    // Test 3: Get tools without filters
    console.log('\n3. Fetching tools without filters...');
    const allTools = await getTools({ status: 'published' }, { page: 1, pageSize: 5 });
    console.log(`   Found ${allTools.total} total tools, showing ${allTools.data.length}`);

    // Test 4: Filter by category
    if (categories.length > 0) {
      const firstCategory = categories[0];
      console.log(`\n4. Filtering by category: ${firstCategory.slug}...`);
      const categoryTools = await getTools(
        { category: firstCategory.slug, status: 'published' },
        { page: 1, pageSize: 5 }
      );
      console.log(`   Found ${categoryTools.total} tools in this category`);
    }

    // Test 5: Filter by tags
    if (tags.length > 0) {
      const firstTag = tags[0];
      console.log(`\n5. Filtering by tag: ${firstTag.slug}...`);
      const tagTools = await getTools(
        { tags: [firstTag.slug], status: 'published' },
        { page: 1, pageSize: 5 }
      );
      console.log(`   Found ${tagTools.total} tools with this tag`);
    }

    // Test 6: Filter by pricing
    console.log('\n6. Filtering by pricing: free...');
    const freeTools = await getTools(
      { pricing: 'free', status: 'published' },
      { page: 1, pageSize: 5 }
    );
    console.log(`   Found ${freeTools.total} free tools`);

    // Test 7: Combined filters
    if (categories.length > 0 && tags.length > 0) {
      const firstCategory = categories[0];
      const firstTag = tags[0];
      console.log(`\n7. Combined filters (category: ${firstCategory.slug}, tag: ${firstTag.slug})...`);
      const combinedTools = await getTools(
        {
          category: firstCategory.slug,
          tags: [firstTag.slug],
          status: 'published',
        },
        { page: 1, pageSize: 5 }
      );
      console.log(`   Found ${combinedTools.total} tools matching both filters`);
    }

    console.log('\n✅ All tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during testing:', error);
    process.exit(1);
  }
}

testFilterSystem();
