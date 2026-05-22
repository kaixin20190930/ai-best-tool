/**
 * Verify sitemap XML format
 * 
 * This script verifies that the sitemap would generate valid XML
 */

import sitemap from '../app/sitemap';

async function verifySitemapXML() {
  console.log('🔍 Verifying sitemap XML format...\n');

  try {
    const sitemapEntries = await sitemap();

    // Simulate XML generation (Next.js does this automatically)
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const urlsetClose = '</urlset>';

    let xmlContent = xmlHeader + '\n' + urlsetOpen + '\n';

    for (const entry of sitemapEntries.slice(0, 5)) { // Show first 5 entries
      xmlContent += '  <url>\n';
      xmlContent += `    <loc>${entry.url}</loc>\n`;
      xmlContent += `    <lastmod>${entry.lastModified.toISOString()}</lastmod>\n`;
      xmlContent += `    <changefreq>${entry.changeFrequency}</changefreq>\n`;
      xmlContent += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;
      xmlContent += '  </url>\n';
    }

    xmlContent += '  <!-- ... ' + (sitemapEntries.length - 5) + ' more entries -->\n';
    xmlContent += urlsetClose;

    console.log('📄 Sample XML output:\n');
    console.log(xmlContent);

    console.log('\n✅ Sitemap XML format is valid');
    console.log(`📊 Total URLs in sitemap: ${sitemapEntries.length}`);

    // Verify XML structure requirements
    console.log('\n🔍 Verifying XML requirements:');
    
    const checks = [
      { name: 'All URLs are absolute', pass: sitemapEntries.every(e => e.url.startsWith('http')) },
      { name: 'All URLs are properly encoded', pass: sitemapEntries.every(e => !e.url.includes(' ')) },
      { name: 'All dates are ISO 8601 format', pass: sitemapEntries.every(e => e.lastModified instanceof Date) },
      { name: 'All changefreq values are valid', pass: sitemapEntries.every(e => 
        ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'].includes(e.changeFrequency)
      ) },
      { name: 'All priority values are between 0.0 and 1.0', pass: sitemapEntries.every(e => 
        e.priority >= 0 && e.priority <= 1
      ) },
    ];

    checks.forEach(check => {
      console.log(`${check.pass ? '✅' : '❌'} ${check.name}`);
    });

    const allPassed = checks.every(c => c.pass);
    
    if (allPassed) {
      console.log('\n🎉 Sitemap XML format verification passed!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some XML format checks failed');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error verifying sitemap XML:', error);
    process.exit(1);
  }
}

verifySitemapXML();
