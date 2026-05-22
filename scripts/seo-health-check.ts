#!/usr/bin/env tsx

/**
 * SEO Health Check Script
 * 
 * This script performs a quick daily health check of critical SEO elements.
 * It's designed to be run automatically (e.g., via cron job) to detect issues early.
 * 
 * Usage: npm run seo:health-check
 */

interface HealthCheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

const results: HealthCheckResult[] = [];

function addResult(result: HealthCheckResult) {
  results.push(result);
  const icon = result.status === 'pass' ? '✓' : result.status === 'fail' ? '✗' : '⚠';
  console.log(`${icon} ${result.name}: ${result.message}`);
}

async function checkRobotsTxt() {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
    const content = await fs.readFile(robotsPath, 'utf-8');
    
    // Check for correct sitemap URL
    if (content.includes('aibesttool.com/sitemap.xml')) {
      addResult({
        name: 'robots.txt',
        status: 'pass',
        message: 'Contains correct sitemap URL'
      });
    } else if (content.includes('sitemap.xml')) {
      addResult({
        name: 'robots.txt',
        status: 'warning',
        message: 'Contains sitemap but URL may be incorrect'
      });
    } else {
      addResult({
        name: 'robots.txt',
        status: 'fail',
        message: 'Missing sitemap reference'
      });
    }
    
    // Check for blocking directives
    if (content.includes('Disallow: /')) {
      addResult({
        name: 'robots.txt crawling',
        status: 'warning',
        message: 'Contains Disallow: / directive - may block crawlers'
      });
    } else {
      addResult({
        name: 'robots.txt crawling',
        status: 'pass',
        message: 'No blocking directives found'
      });
    }
  } catch (error) {
    addResult({
      name: 'robots.txt',
      status: 'fail',
      message: `Error reading robots.txt: ${error}`
    });
  }
}

async function checkSitemap() {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // Check if sitemap.ts exists
    const sitemapPath = path.join(process.cwd(), 'app', 'sitemap.ts');
    
    try {
      await fs.access(sitemapPath);
      addResult({
        name: 'sitemap.ts',
        status: 'pass',
        message: 'Sitemap generation file exists'
      });
    } catch {
      addResult({
        name: 'sitemap.ts',
        status: 'fail',
        message: 'Sitemap generation file not found'
      });
      return;
    }
    
    // Read sitemap.ts to verify it exports a function
    const content = await fs.readFile(sitemapPath, 'utf-8');
    
    if (content.includes('export default') && content.includes('MetadataRoute.Sitemap')) {
      addResult({
        name: 'sitemap configuration',
        status: 'pass',
        message: 'Sitemap is properly configured'
      });
    } else {
      addResult({
        name: 'sitemap configuration',
        status: 'warning',
        message: 'Sitemap configuration may be incomplete'
      });
    }
    
    // Note: To fully test sitemap generation, the site needs to be running
    addResult({
      name: 'sitemap runtime check',
      status: 'warning',
      message: 'Sitemap runtime check skipped (requires running server). Test manually at /sitemap.xml'
    });
    
  } catch (error) {
    addResult({
      name: 'sitemap.xml',
      status: 'fail',
      message: `Error checking sitemap: ${error}`
    });
  }
}

async function checkSEOComponents() {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // Check if SEO components exist
    const componentsPath = path.join(process.cwd(), 'components', 'seo');
    const files = await fs.readdir(componentsPath);
    
    const requiredComponents = ['SEOHead.tsx', 'StructuredData.tsx', 'SocialMeta.tsx'];
    const missingComponents = requiredComponents.filter(comp => !files.includes(comp));
    
    if (missingComponents.length === 0) {
      addResult({
        name: 'SEO Components',
        status: 'pass',
        message: 'All required SEO components exist'
      });
    } else {
      addResult({
        name: 'SEO Components',
        status: 'fail',
        message: `Missing components: ${missingComponents.join(', ')}`
      });
    }
  } catch (error) {
    addResult({
      name: 'SEO Components',
      status: 'fail',
      message: `Error checking components: ${error}`
    });
  }
}

async function checkSEOUtilities() {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // Check if SEO utilities exist
    const libPath = path.join(process.cwd(), 'lib', 'seo');
    const files = await fs.readdir(libPath);
    
    const requiredFiles = ['constants.ts', 'metadata.ts', 'schema.ts'];
    const missingFiles = requiredFiles.filter(file => !files.includes(file));
    
    if (missingFiles.length === 0) {
      addResult({
        name: 'SEO Utilities',
        status: 'pass',
        message: 'All required SEO utilities exist'
      });
    } else {
      addResult({
        name: 'SEO Utilities',
        status: 'fail',
        message: `Missing utilities: ${missingFiles.join(', ')}`
      });
    }
  } catch (error) {
    addResult({
      name: 'SEO Utilities',
      status: 'fail',
      message: `Error checking utilities: ${error}`
    });
  }
}

async function checkDocumentation() {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const docsPath = path.join(process.cwd(), 'docs');
    const files = await fs.readdir(docsPath);
    
    const seoDocsCount = files.filter(file => 
      file.includes('SEO') || 
      file.includes('HREFLANG') || 
      file.includes('IMAGE') ||
      file.includes('LAZY_LOADING') ||
      file.includes('STRUCTURED_DATA')
    ).length;
    
    if (seoDocsCount >= 5) {
      addResult({
        name: 'SEO Documentation',
        status: 'pass',
        message: `Found ${seoDocsCount} SEO documentation files`
      });
    } else {
      addResult({
        name: 'SEO Documentation',
        status: 'warning',
        message: `Only ${seoDocsCount} SEO documentation files found`
      });
    }
  } catch (error) {
    addResult({
      name: 'SEO Documentation',
      status: 'fail',
      message: `Error checking documentation: ${error}`
    });
  }
}

async function generateReport() {
  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  const totalCount = results.length;
  
  console.log('\n' + '='.repeat(60));
  console.log('SEO HEALTH CHECK SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Checks: ${totalCount}`);
  console.log(`✓ Passed: ${passCount}`);
  console.log(`✗ Failed: ${failCount}`);
  console.log(`⚠ Warnings: ${warningCount}`);
  console.log('='.repeat(60));
  
  const healthScore = Math.round((passCount / totalCount) * 100);
  console.log(`\nHealth Score: ${healthScore}%`);
  
  if (failCount > 0) {
    console.log('\n⚠️  ATTENTION REQUIRED: Some checks failed');
    console.log('Failed checks:');
    results.filter(r => r.status === 'fail').forEach(r => {
      console.log(`  - ${r.name}: ${r.message}`);
    });
  }
  
  if (warningCount > 0) {
    console.log('\n⚠️  Warnings detected:');
    results.filter(r => r.status === 'warning').forEach(r => {
      console.log(`  - ${r.name}: ${r.message}`);
    });
  }
  
  // Save report to file
  const fs = await import('fs/promises');
  const path = await import('path');
  
  const reportPath = path.join(process.cwd(), '.kiro', 'specs', 'seo-optimization', 'health-check-report.json');
  await fs.writeFile(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    healthScore,
    results,
    summary: {
      total: totalCount,
      passed: passCount,
      failed: failCount,
      warnings: warningCount
    }
  }, null, 2));
  
  console.log(`\nReport saved to: ${reportPath}`);
  
  // Exit with error code if there are failures
  if (failCount > 0) {
    process.exit(1);
  }
}

async function main() {
  console.log('Starting SEO Health Check...\n');
  
  await checkRobotsTxt();
  await checkSEOComponents();
  await checkSEOUtilities();
  await checkDocumentation();
  await checkSitemap();
  
  await generateReport();
}

main().catch(console.error);
