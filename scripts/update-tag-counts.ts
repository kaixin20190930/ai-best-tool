/**
 * Update tag counts based on actual tool usage
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { updateAllTagCounts, getAllTags } from '../lib/services/tags';

async function updateTagCounts() {
  console.log('Updating tag counts...\n');

  try {
    // Get current tags
    console.log('Current tag counts:');
    const tagsBefore = await getAllTags('count');
    tagsBefore.forEach(tag => {
      console.log(`  ${tag.slug}: ${tag.count}`);
    });

    // Update all tag counts
    console.log('\nUpdating counts...');
    await updateAllTagCounts();

    // Get updated tags
    console.log('\nUpdated tag counts:');
    const tagsAfter = await getAllTags('count');
    tagsAfter.forEach(tag => {
      console.log(`  ${tag.slug}: ${tag.count}`);
    });

    console.log('\n✅ Tag counts updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error updating tag counts:', error);
    process.exit(1);
  }
}

updateTagCounts();
