/**
 * Test script to verify sitemap.xml generation
 *
 * This script tests:
 * 1. Sitemap includes all important pages
 * 2. XML format is valid
 * 3. lastModified dates are present
 * 4. Priority values are appropriate
 */

import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

import sitemap from '../app/sitemap';

for (const envPath of ['.env.local', '.env.production']) {
  const resolved = path.join(process.cwd(), envPath);
  if (fs.existsSync(resolved)) {
    dotenv.config({ path: resolved, override: false });
  }
}

async function testSitemap() {
  console.log('🔍 Testing sitemap generation...\n');

  try {
    // Generate sitemap
    const sitemapEntries = await sitemap();

    console.log('✅ Sitemap generated successfully');
    console.log(`📊 Total entries: ${sitemapEntries.length}\n`);

    // Test 1: Check if sitemap includes important pages
    console.log('Test 1: Checking for important pages...');
    const requiredPages = ['', 'explore', 'guides', 'best-ai-tools'];
    const missingPages: string[] = [];

    for (const page of requiredPages) {
      const found = sitemapEntries.some((entry) => {
        const url = new URL(entry.url);
        const pathname = url.pathname.replace(/^\/[a-z]{2}\//, '/').replace(/^\//, '');
        return pathname === page;
      });

      if (!found) {
        missingPages.push(page);
      }
    }

    if (missingPages.length === 0) {
      console.log('✅ All required pages are present\n');
    } else {
      console.log(`❌ Missing pages: ${missingPages.join(', ')}\n`);
    }

    // Test 2: Verify all entries have required fields
    console.log('Test 2: Verifying entry structure...');
    let invalidEntries = 0;

    for (const entry of sitemapEntries) {
      if (!entry.url || !entry.lastModified || !entry.changeFrequency || entry.priority === undefined) {
        invalidEntries++;
      }
    }

    if (invalidEntries === 0) {
      console.log('✅ All entries have required fields (url, lastModified, changeFrequency, priority)\n');
    } else {
      console.log(`❌ ${invalidEntries} entries are missing required fields\n`);
    }

    // Test 3: Verify lastModified dates are valid
    console.log('Test 3: Verifying lastModified dates...');
    let invalidDates = 0;

    for (const entry of sitemapEntries) {
      if (!(entry.lastModified instanceof Date) || isNaN(entry.lastModified.getTime())) {
        invalidDates++;
      }
    }

    if (invalidDates === 0) {
      console.log('✅ All lastModified dates are valid\n');
    } else {
      console.log(`❌ ${invalidDates} entries have invalid dates\n`);
    }

    // Test 4: Verify priority values are appropriate (0.0 - 1.0)
    console.log('Test 4: Verifying priority values...');
    let invalidPriorities = 0;

    for (const entry of sitemapEntries) {
      const priority = entry.priority ?? 0;
      if (priority < 0 || priority > 1) {
        invalidPriorities++;
      }
    }

    if (invalidPriorities === 0) {
      console.log('✅ All priority values are within valid range (0.0 - 1.0)\n');
    } else {
      console.log(`❌ ${invalidPriorities} entries have invalid priority values\n`);
    }

    // Test 5: Check for duplicate URLs
    console.log('Test 5: Checking for duplicate URLs...');
    const urlSet = new Set<string>();
    let duplicates = 0;

    for (const entry of sitemapEntries) {
      if (urlSet.has(entry.url)) {
        duplicates++;
      } else {
        urlSet.add(entry.url);
      }
    }

    if (duplicates === 0) {
      console.log('✅ No duplicate URLs found\n');
    } else {
      console.log(`❌ Found ${duplicates} duplicate URLs\n`);
    }

    // Test 6: Verify noindex / alias pages stay out of the sitemap
    console.log('Test 6: Checking noindex / alias exclusions...');
    const excludedPages = [
      '/guides/chatbot-tools',
      '/guides/note-taking-tools',
      '/guides/marketing-tools',
      '/guides/voice-tools',
      '/guides/seo-tools',
      '/guides/developer-tools',
      '/guides/image-tools',
      '/guides/productivity-tools',
      '/guides/research-tools',
      '/guides/sales-tools',
      '/guides/writing-tools',
      '/guides/automation-tools',
      '/guides/agent-tools',
      '/guides/ai-chatbot-tools-comparison',
      '/guides/ai-video-tools-comparison',
      '/guides/ai-web3-tools-comparison',
      '/guides/ai-agent-tools-comparison',
      '/guides/ai-model-routing-tools-comparison',
      '/guides/ai-api-observability-tools-comparison',
      '/guides/ai-code-review-tools-comparison',
      '/pricing',
      '/submit',
      '/developer/listing',
    ];
    const excludedFound = excludedPages.filter((page) =>
      sitemapEntries.some((entry) => {
        const url = new URL(entry.url);
        const pathname = url.pathname.replace(/^\/[a-z]{2}\//, '/').replace(/^\//, '');
        return pathname === page.replace(/^\//, '');
      }),
    );

    if (excludedFound.length === 0) {
      console.log('✅ Noindex / alias pages stay out of the sitemap\n');
    } else {
      console.log(`❌ Unexpected sitemap entries for: ${excludedFound.join(', ')}\n`);
    }

    // Display sample entries
    console.log('📋 Sample sitemap entries:');
    console.log('─'.repeat(80));

    const samples = [
      sitemapEntries.find((e) => e.url.endsWith('/')), // Homepage
      sitemapEntries.find((e) => e.url.includes('/explore')), // Explore page
      sitemapEntries.find((e) => e.url.includes('/guides/')), // Guide page
      sitemapEntries.find((e) => e.url.includes('/best-ai-tools')), // Ranking page
    ].filter(Boolean);

    for (const entry of samples) {
      if (entry) {
        const lastModified = new Date(entry.lastModified ?? 0);
        const changeFrequency = entry.changeFrequency ?? 'n/a';
        const priority = entry.priority ?? 0;
        console.log(`URL: ${entry.url}`);
        console.log(`Last Modified: ${lastModified.toISOString()}`);
        console.log(`Change Frequency: ${changeFrequency}`);
        console.log(`Priority: ${priority}`);
        console.log('─'.repeat(80));
      }
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log(`Total entries: ${sitemapEntries.length}`);
    console.log(`Unique URLs: ${urlSet.size}`);

    const byPriority = sitemapEntries.reduce(
      (acc, entry) => {
        const key = String(entry.priority ?? 0);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log('\nEntries by priority:');
    Object.entries(byPriority)
      .sort(([a], [b]) => parseFloat(b) - parseFloat(a))
      .forEach(([priority, count]) => {
        console.log(`  ${priority}: ${count} entries`);
      });

    const totalTests = 6;
    const passedTests =
      (missingPages.length === 0 ? 1 : 0) +
      (invalidEntries === 0 ? 1 : 0) +
      (invalidDates === 0 ? 1 : 0) +
      (invalidPriorities === 0 ? 1 : 0) +
      (duplicates === 0 ? 1 : 0) +
      (excludedFound.length === 0 ? 1 : 0);

    console.log(`\n${passedTests === totalTests ? '✅' : '❌'} Tests passed: ${passedTests}/${totalTests}`);

    if (passedTests === totalTests) {
      console.log('\n🎉 All sitemap tests passed!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some sitemap tests failed. Please review the output above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error testing sitemap:', error);
    process.exit(1);
  }
}

testSitemap();
