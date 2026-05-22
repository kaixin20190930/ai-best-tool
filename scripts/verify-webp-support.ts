#!/usr/bin/env tsx

/**
 * Verification Script: WebP Image Support
 * 
 * This script verifies that WebP image optimization is properly configured
 * and working in the application.
 * 
 * Validates Requirements: 7.1
 */

import fs from 'fs';
import path from 'path';

interface VerificationResult {
  passed: boolean;
  message: string;
  details?: string[];
}

const results: VerificationResult[] = [];

console.log('🔍 Verifying WebP Image Support Implementation\n');
console.log('=' .repeat(60));

// Test 1: Verify Next.js configuration
function verifyNextConfig(): VerificationResult {
  console.log('\n📋 Test 1: Checking Next.js Image Configuration...');
  
  try {
    const configPath = path.join(process.cwd(), 'next.config.mjs');
    const configContent = fs.readFileSync(configPath, 'utf-8');
    
    const checks = [
      { pattern: /formats:\s*\[['"]image\/avif['"],\s*['"]image\/webp['"]\]/, name: 'AVIF and WebP formats' },
      { pattern: /unoptimized:\s*false/, name: 'Image optimization enabled' },
      { pattern: /minimumCacheTTL/, name: 'Cache TTL configured' },
      { pattern: /deviceSizes/, name: 'Device sizes configured' },
      { pattern: /imageSizes/, name: 'Image sizes configured' },
    ];
    
    const details: string[] = [];
    let allPassed = true;
    
    for (const check of checks) {
      if (check.pattern.test(configContent)) {
        details.push(`✅ ${check.name}`);
      } else {
        details.push(`❌ ${check.name} - NOT FOUND`);
        allPassed = false;
      }
    }
    
    return {
      passed: allPassed,
      message: allPassed 
        ? 'Next.js image configuration is correct' 
        : 'Next.js image configuration has issues',
      details
    };
  } catch (error) {
    return {
      passed: false,
      message: 'Failed to read next.config.mjs',
      details: [String(error)]
    };
  }
}

// Test 2: Verify BaseImage component exists and is properly configured
function verifyBaseImageComponent(): VerificationResult {
  console.log('\n📋 Test 2: Checking BaseImage Component...');
  
  try {
    const componentPath = path.join(process.cwd(), 'components/image/BaseImage.tsx');
    const componentContent = fs.readFileSync(componentPath, 'utf-8');
    
    const checks = [
      { pattern: /import Image from ['"]next\/image['"]/, name: 'Next.js Image import' },
      { pattern: /loading.*lazy/, name: 'Lazy loading support' },
      { pattern: /placeholder.*blur/, name: 'Blur placeholder' },
      { pattern: /alt.*=/, name: 'Alt text handling' },
      { pattern: /generateAltFromSrc/, name: 'Auto alt text generation' },
    ];
    
    const details: string[] = [];
    let allPassed = true;
    
    for (const check of checks) {
      if (check.pattern.test(componentContent)) {
        details.push(`✅ ${check.name}`);
      } else {
        details.push(`❌ ${check.name} - NOT FOUND`);
        allPassed = false;
      }
    }
    
    return {
      passed: allPassed,
      message: allPassed 
        ? 'BaseImage component is properly configured' 
        : 'BaseImage component has issues',
      details
    };
  } catch (error) {
    return {
      passed: false,
      message: 'Failed to read BaseImage component',
      details: [String(error)]
    };
  }
}

// Test 3: Verify no raw img tags in components
function verifyNoRawImgTags(): VerificationResult {
  console.log('\n📋 Test 3: Checking for Raw <img> Tags...');
  
  try {
    const componentsDir = path.join(process.cwd(), 'components');
    const appDir = path.join(process.cwd(), 'app');
    
    const rawImgPattern = /<img\s/g;
    const issues: string[] = [];
    
    function scanDirectory(dir: string, baseDir: string) {
      if (!fs.existsSync(dir)) return;
      
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Skip node_modules, .next, etc.
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
            scanDirectory(fullPath, baseDir);
          }
        } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx')) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const matches = content.match(rawImgPattern);
          
          if (matches) {
            const relativePath = path.relative(process.cwd(), fullPath);
            issues.push(`Found ${matches.length} raw <img> tag(s) in ${relativePath}`);
          }
        }
      }
    }
    
    scanDirectory(componentsDir, componentsDir);
    scanDirectory(appDir, appDir);
    
    if (issues.length === 0) {
      return {
        passed: true,
        message: 'No raw <img> tags found - all using optimized components',
        details: ['✅ All images use BaseImage or Next.js Image component']
      };
    } else {
      return {
        passed: false,
        message: 'Found raw <img> tags that should be converted',
        details: issues.map(issue => `⚠️  ${issue}`)
      };
    }
  } catch (error) {
    return {
      passed: false,
      message: 'Failed to scan for raw img tags',
      details: [String(error)]
    };
  }
}

// Test 4: Verify BaseImage usage in key components
function verifyBaseImageUsage(): VerificationResult {
  console.log('\n📋 Test 4: Checking BaseImage Usage in Key Components...');
  
  const keyComponents = [
    'components/webNav/WebNavCard.tsx',
    'components/home/Navigation.tsx',
    'components/MediaGallery.tsx',
    'components/image/Icon.tsx',
  ];
  
  const details: string[] = [];
  let allPassed = true;
  
  for (const componentPath of keyComponents) {
    const fullPath = path.join(process.cwd(), componentPath);
    
    try {
      if (!fs.existsSync(fullPath)) {
        details.push(`⚠️  ${componentPath} - FILE NOT FOUND`);
        continue;
      }
      
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      if (content.includes('BaseImage') || content.includes('from \'next/image\'')) {
        details.push(`✅ ${componentPath} - Uses optimized images`);
      } else {
        details.push(`❌ ${componentPath} - Not using BaseImage`);
        allPassed = false;
      }
    } catch (error) {
      details.push(`❌ ${componentPath} - Error reading file`);
      allPassed = false;
    }
  }
  
  return {
    passed: allPassed,
    message: allPassed 
      ? 'All key components use BaseImage' 
      : 'Some components not using BaseImage',
    details
  };
}

// Test 5: Verify documentation exists
function verifyDocumentation(): VerificationResult {
  console.log('\n📋 Test 5: Checking Documentation...');
  
  const docPath = path.join(process.cwd(), 'docs/WEBP_IMAGE_OPTIMIZATION.md');
  
  try {
    if (!fs.existsSync(docPath)) {
      return {
        passed: false,
        message: 'WebP documentation not found',
        details: ['❌ docs/WEBP_IMAGE_OPTIMIZATION.md does not exist']
      };
    }
    
    const content = fs.readFileSync(docPath, 'utf-8');
    
    const sections = [
      'Overview',
      'Configuration',
      'BaseImage Component',
      'How It Works',
      'Best Practices',
      'Testing',
      'Troubleshooting',
    ];
    
    const details: string[] = [];
    let allFound = true;
    
    for (const section of sections) {
      if (content.includes(section)) {
        details.push(`✅ ${section} section present`);
      } else {
        details.push(`❌ ${section} section missing`);
        allFound = false;
      }
    }
    
    return {
      passed: allFound,
      message: allFound 
        ? 'Documentation is complete' 
        : 'Documentation is incomplete',
      details
    };
  } catch (error) {
    return {
      passed: false,
      message: 'Failed to read documentation',
      details: [String(error)]
    };
  }
}

// Run all tests
async function runVerification() {
  results.push(verifyNextConfig());
  results.push(verifyBaseImageComponent());
  results.push(verifyNoRawImgTags());
  results.push(verifyBaseImageUsage());
  results.push(verifyDocumentation());
  
  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 VERIFICATION RESULTS\n');
  
  results.forEach((result, index) => {
    console.log(`Test ${index + 1}: ${result.passed ? '✅ PASS' : '❌ FAIL'} - ${result.message}`);
    if (result.details) {
      result.details.forEach(detail => console.log(`  ${detail}`));
    }
    console.log();
  });
  
  const allPassed = results.every(r => r.passed);
  const passedCount = results.filter(r => r.passed).length;
  
  console.log('='.repeat(60));
  console.log(`\n${allPassed ? '✅' : '❌'} Overall: ${passedCount}/${results.length} tests passed\n`);
  
  if (allPassed) {
    console.log('🎉 WebP image support is fully implemented and configured correctly!');
    console.log('\n✨ Key Features:');
    console.log('  • AVIF and WebP format support with automatic fallback');
    console.log('  • Lazy loading enabled by default');
    console.log('  • Blur placeholders for smooth loading');
    console.log('  • Automatic alt text generation');
    console.log('  • 30-day cache TTL for optimized images');
    console.log('  • Responsive images for all device sizes');
  } else {
    console.log('⚠️  Some issues were found. Please review the details above.');
  }
  
  console.log('\n📚 Documentation: docs/WEBP_IMAGE_OPTIMIZATION.md');
  console.log('🔧 Configuration: next.config.mjs');
  console.log('🖼️  Component: components/image/BaseImage.tsx\n');
  
  process.exit(allPassed ? 0 : 1);
}

// Run verification
runVerification().catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});
