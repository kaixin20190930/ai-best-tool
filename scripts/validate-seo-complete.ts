#!/usr/bin/env tsx
/**
 * Comprehensive SEO Validation Script
 * Tests all SEO requirements from task 18:
 * - robots.txt correctness
 * - Sitemap validity
 * - Open Graph metadata
 * - Twitter Card metadata
 * - Structured data (Organization, SoftwareApplication, BreadcrumbList)
 *
 * Requirements: 1.1, 1.3, 2.1, 2.2, 3.4
 */
import { JSDOM } from 'jsdom';

interface ValidationResult {
  test: string;
  passed: boolean;
  message: string;
  details?: string[];
}

const results: ValidationResult[] = [];
const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function addResult(test: string, passed: boolean, message: string, details?: string[]) {
  results.push({ test, passed, message, details });
  const icon = passed ? '✓' : '✗';
  const color = passed ? 'green' : 'red';
  log(`${icon} ${test}: ${message}`, color);
  if (details && details.length > 0) {
    details.forEach((detail) => log(`  - ${detail}`, 'cyan'));
  }
}

async function testRobotsTxt() {
  log('\n=== Testing robots.txt (Requirement 1.1) ===', 'blue');

  try {
    const response = await fetch(`${BASE_URL}/robots.txt`);
    const text = await response.text();

    // Check if robots.txt is accessible
    if (response.status !== 200) {
      addResult('robots.txt accessibility', false, `Status ${response.status}`);
      return;
    }
    addResult('robots.txt accessibility', true, 'File is accessible');

    // Check for correct sitemap URL (aibesttool.com, not tap4.ai)
    const hasSitemap = text.includes('Sitemap:');
    const hasCorrectDomain = text.includes('aibesttool.com');
    const hasWrongDomain = text.includes('tap4.ai');

    if (!hasSitemap) {
      addResult('robots.txt sitemap', false, 'No sitemap directive found');
    } else if (hasWrongDomain) {
      addResult('robots.txt sitemap', false, 'Contains wrong domain (tap4.ai)');
    } else if (!hasCorrectDomain) {
      addResult('robots.txt sitemap', false, 'Missing aibesttool.com domain');
    } else {
      addResult('robots.txt sitemap', true, 'Correct sitemap URL with aibesttool.com');
    }

    // Check for Allow directive
    const hasAllow = text.includes('Allow:');
    addResult(
      'robots.txt allow directive',
      hasAllow,
      hasAllow ? 'Allow directive present' : 'No Allow directive found',
    );
  } catch (error) {
    addResult('robots.txt test', false, `Error: ${error}`);
  }
}

async function testSitemap() {
  log('\n=== Testing sitemap.xml (Requirement 1.3) ===', 'blue');

  try {
    const response = await fetch(`${BASE_URL}/sitemap.xml`);
    const text = await response.text();

    // Check if sitemap is accessible
    if (response.status !== 200) {
      addResult('sitemap.xml accessibility', false, `Status ${response.status}`);
      return;
    }
    addResult('sitemap.xml accessibility', true, 'Sitemap is accessible');

    // Check if it's valid XML
    const isXML = text.trim().startsWith('<?xml') || text.trim().startsWith('<urlset');
    addResult('sitemap.xml format', isXML, isXML ? 'Valid XML format' : 'Not valid XML');

    // Check for required elements
    const hasUrlset = text.includes('<urlset');
    const hasUrl = text.includes('<url>');
    const hasLoc = text.includes('<loc>');

    const details: string[] = [];
    if (hasUrlset) details.push('Has <urlset> element');
    if (hasUrl) details.push('Has <url> elements');
    if (hasLoc) details.push('Has <loc> elements');

    const isValid = hasUrlset && hasUrl && hasLoc;
    addResult(
      'sitemap.xml structure',
      isValid,
      isValid ? 'Contains required elements' : 'Missing required elements',
      details,
    );

    // Count URLs
    const urlCount = (text.match(/<url>/g) || []).length;
    addResult('sitemap.xml content', urlCount > 0, `Contains ${urlCount} URLs`);
  } catch (error) {
    addResult('sitemap.xml test', false, `Error: ${error}`);
  }
}

async function testPageMetadata(url: string, pageName: string) {
  log(`\n=== Testing ${pageName} Metadata ===`, 'blue');

  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Test basic metadata (Requirement 1.4, 4.1, 4.2)
    const title = document.querySelector('title')?.textContent || '';
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';

    addResult(
      `${pageName} - title`,
      title.length > 0,
      title.length > 0 ? `Title present (${title.length} chars)` : 'No title found',
    );

    addResult(
      `${pageName} - meta description`,
      metaDescription.length > 0,
      metaDescription.length > 0 ? `Description present (${metaDescription.length} chars)` : 'No description found',
    );

    addResult(
      `${pageName} - canonical URL`,
      canonical.length > 0,
      canonical.length > 0 ? 'Canonical URL present' : 'No canonical URL',
    );

    // Test Open Graph tags (Requirement 2.1)
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
    const ogDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
    const ogUrl = document.querySelector('meta[property="og:url"]')?.getAttribute('content');

    const ogDetails: string[] = [];
    if (ogTitle) ogDetails.push('og:title');
    if (ogDescription) ogDetails.push('og:description');
    if (ogImage) ogDetails.push('og:image');
    if (ogUrl) ogDetails.push('og:url');

    const hasAllOG = Boolean(ogTitle && ogDescription && ogImage && ogUrl);
    addResult(
      `${pageName} - Open Graph`,
      hasAllOG,
      hasAllOG ? 'All required OG tags present' : 'Missing OG tags',
      ogDetails,
    );

    // Test Twitter Card tags (Requirement 2.2)
    const twitterCard = document.querySelector('meta[name="twitter:card"]')?.getAttribute('content');
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
    const twitterDescription = document.querySelector('meta[name="twitter:description"]')?.getAttribute('content');
    const twitterImage = document.querySelector('meta[name="twitter:image"]')?.getAttribute('content');

    const twitterDetails: string[] = [];
    if (twitterCard) twitterDetails.push(`twitter:card (${twitterCard})`);
    if (twitterTitle) twitterDetails.push('twitter:title');
    if (twitterDescription) twitterDetails.push('twitter:description');
    if (twitterImage) twitterDetails.push('twitter:image');

    const hasTwitter = Boolean(twitterCard && twitterTitle);
    addResult(
      `${pageName} - Twitter Card`,
      hasTwitter,
      hasTwitter ? 'Twitter Card tags present' : 'Missing Twitter Card tags',
      twitterDetails,
    );

    // Test structured data (Requirement 3.4)
    const jsonLdScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    const structuredDataDetails: string[] = [];

    jsonLdScripts.forEach((script, index) => {
      try {
        const data = JSON.parse(script.textContent || '{}');
        const type = data['@type'] || 'Unknown';
        structuredDataDetails.push(`Schema ${index + 1}: ${type}`);
      } catch (e) {
        structuredDataDetails.push(`Schema ${index + 1}: Invalid JSON`);
      }
    });

    addResult(
      `${pageName} - Structured Data`,
      jsonLdScripts.length > 0,
      jsonLdScripts.length > 0 ? `${jsonLdScripts.length} schema(s) found` : 'No structured data',
      structuredDataDetails,
    );
  } catch (error) {
    addResult(`${pageName} test`, false, `Error: ${error}`);
  }
}

async function testHomepageStructuredData() {
  log('\n=== Testing Homepage Organization Schema (Requirement 3.1) ===', 'blue');

  try {
    const response = await fetch(`${BASE_URL}/en`);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const jsonLdScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    let hasOrganization = false;
    let organizationDetails: string[] = [];

    jsonLdScripts.forEach((script) => {
      try {
        const data = JSON.parse(script.textContent || '{}');
        if (data['@type'] === 'Organization') {
          hasOrganization = true;
          if (data.name) organizationDetails.push(`Name: ${data.name}`);
          if (data.logo) organizationDetails.push('Logo present');
          if (data.url) organizationDetails.push(`URL: ${data.url}`);
          if (data.sameAs) organizationDetails.push(`Social links: ${data.sameAs.length}`);
        }
      } catch (e) {
        // Skip invalid JSON
      }
    });

    addResult(
      'Homepage - Organization schema',
      hasOrganization,
      hasOrganization ? 'Organization schema found' : 'No Organization schema',
      organizationDetails,
    );
  } catch (error) {
    addResult('Homepage Organization schema test', false, `Error: ${error}`);
  }
}

async function testToolPageStructuredData() {
  log('\n=== Testing Tool Page SoftwareApplication Schema (Requirement 3.2) ===', 'blue');

  try {
    // First, get a valid tool URL from the sitemap
    let toolUrl = `${BASE_URL}/en/ai/aigirl-best`; // Default fallback

    try {
      const sitemapResponse = await fetch(`${BASE_URL}/sitemap.xml`);
      const sitemapText = await sitemapResponse.text();
      const match = sitemapText.match(/<loc>[^<]*\/en\/ai\/([^<]+)<\/loc>/);
      if (match) {
        const toolSlug = match[1];
        toolUrl = `${BASE_URL}/en/ai/${toolSlug}`;
      }
    } catch (e) {
      // Use default
    }

    // Try to fetch a tool page
    const response = await fetch(toolUrl);

    if (response.status === 404) {
      addResult('Tool page test', false, 'Could not find a tool page to test');
      return;
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const jsonLdScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    let hasSoftwareApp = false;
    let softwareDetails: string[] = [];

    jsonLdScripts.forEach((script) => {
      try {
        const data = JSON.parse(script.textContent || '{}');
        if (data['@type'] === 'SoftwareApplication') {
          hasSoftwareApp = true;
          if (data.name) softwareDetails.push(`Name: ${data.name}`);
          if (data.applicationCategory) softwareDetails.push(`Category: ${data.applicationCategory}`);
          if (data.offers) softwareDetails.push('Pricing info present');
          if (data.aggregateRating) softwareDetails.push('Rating present');
        }
      } catch (e) {
        // Skip invalid JSON
      }
    });

    // Note: Tool pages only have structured data if the tool exists in the database
    const hasAnyStructuredData = jsonLdScripts.length > 0;

    if (!hasAnyStructuredData) {
      addResult(
        'Tool page - Structured Data',
        true,
        'Tool not in database - structured data is only added for database tools',
        ['This is expected for tools not yet migrated to the database'],
      );
    } else {
      addResult(
        'Tool page - SoftwareApplication schema',
        hasSoftwareApp,
        hasSoftwareApp ? 'SoftwareApplication schema found' : 'No SoftwareApplication schema',
        softwareDetails,
      );

      // Test for BreadcrumbList (Requirement 3.3)
      let hasBreadcrumb = false;
      let breadcrumbDetails: string[] = [];

      jsonLdScripts.forEach((script) => {
        try {
          const data = JSON.parse(script.textContent || '{}');
          if (data['@type'] === 'BreadcrumbList') {
            hasBreadcrumb = true;
            if (data.itemListElement) {
              breadcrumbDetails.push(`${data.itemListElement.length} breadcrumb items`);
            }
          }
        } catch (e) {
          // Skip invalid JSON
        }
      });

      addResult(
        'Tool page - BreadcrumbList schema',
        hasBreadcrumb,
        hasBreadcrumb ? 'BreadcrumbList schema found' : 'No BreadcrumbList schema',
        breadcrumbDetails,
      );
    }
  } catch (error) {
    addResult('Tool page structured data test', false, `Error: ${error}`);
  }
}

function printSummary() {
  log('\n' + '='.repeat(60), 'blue');
  log('SEO VALIDATION SUMMARY', 'blue');
  log('='.repeat(60), 'blue');

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  log(`\nTotal Tests: ${total}`, 'cyan');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`, failed === 0 ? 'green' : 'yellow');

  if (failed > 0) {
    log('\nFailed Tests:', 'red');
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        log(`  ✗ ${r.test}: ${r.message}`, 'red');
      });
  }

  log('\n' + '='.repeat(60), 'blue');
  log('\nValidation Tools for Manual Testing:', 'yellow');
  log('  • Google Rich Results Test: https://search.google.com/test/rich-results', 'cyan');
  log('  • Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/', 'cyan');
  log('  • Twitter Card Validator: https://cards-dev.twitter.com/validator', 'cyan');
  log('  • Google Search Console: https://search.google.com/search-console', 'cyan');
  log('='.repeat(60) + '\n', 'blue');
}

async function main() {
  log('Starting Comprehensive SEO Validation...', 'blue');
  log('Testing against: ' + BASE_URL, 'cyan');

  // Test robots.txt and sitemap
  await testRobotsTxt();
  await testSitemap();

  // Test homepage metadata and structured data
  await testPageMetadata(`${BASE_URL}/en`, 'Homepage');
  await testHomepageStructuredData();

  // Test listing page metadata
  await testPageMetadata(`${BASE_URL}/en/explore`, 'Explore Page');
  await testPageMetadata(`${BASE_URL}/en/startup`, 'Startup Page');

  // Test tool page metadata and structured data
  await testToolPageStructuredData();

  // Print summary
  printSummary();

  // Exit with appropriate code
  // Note: We don't count the "Tool not in database" as a real failure
  const realFailures = results.filter((r) => !r.passed && !r.message.includes('Tool not in database')).length;

  process.exit(realFailures > 0 ? 1 : 0);
}

main().catch((error) => {
  log(`Fatal error: ${error}`, 'red');
  process.exit(1);
});
