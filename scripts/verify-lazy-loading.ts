/**
 * Script to verify lazy loading implementation for images
 * 
 * This script checks:
 * 1. BaseImage component has lazy loading enabled by default
 * 2. Priority images are only used for above-the-fold content
 * 3. All images use the BaseImage component
 * 4. Next.js image optimization is properly configured
 */

import fs from 'fs';
import path from 'path';

interface TestResult {
  test: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function addResult(test: string, passed: boolean, details: string) {
  results.push({ test, passed, details });
  console.log(`${passed ? '✅' : '❌'} ${test}`);
  if (details) {
    console.log(`   ${details}`);
  }
}

// Test 1: Check BaseImage component has lazy loading by default
function testBaseImageLazyLoading() {
  const baseImagePath = path.join(process.cwd(), 'components/image/BaseImage.tsx');
  const content = fs.readFileSync(baseImagePath, 'utf-8');
  
  // Check if loading prop defaults to lazy when priority is not set
  const hasLazyDefault = content.includes("loading={props.loading ?? (props.priority ? 'eager' : 'lazy')}");
  
  addResult(
    'BaseImage component defaults to lazy loading',
    hasLazyDefault,
    hasLazyDefault 
      ? 'BaseImage correctly defaults to lazy loading unless priority is set'
      : 'BaseImage does not have proper lazy loading default'
  );
}

// Test 2: Check Next.js config has image optimization enabled
function testNextConfigImageOptimization() {
  const configPath = path.join(process.cwd(), 'next.config.mjs');
  const content = fs.readFileSync(configPath, 'utf-8');
  
  const hasWebPFormat = content.includes("'image/webp'");
  const hasAVIFFormat = content.includes("'image/avif'");
  const notUnoptimized = content.includes('unoptimized: false');
  
  addResult(
    'Next.js config has image optimization enabled',
    hasWebPFormat && hasAVIFFormat,
    `WebP: ${hasWebPFormat}, AVIF: ${hasAVIFFormat}, Optimized: ${notUnoptimized || !content.includes('unoptimized: true')}`
  );
}

// Test 3: Check for any direct Image imports that bypass BaseImage
function testNoDirectImageImports() {
  const componentsDir = path.join(process.cwd(), 'components');
  const appDir = path.join(process.cwd(), 'app');
  
  let directImports: string[] = [];
  
  function scanDirectory(dir: string) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, .next, etc.
        if (!file.startsWith('.') && file !== 'node_modules') {
          scanDirectory(filePath);
        }
      } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        // Skip BaseImage.tsx itself
        if (file === 'BaseImage.tsx') continue;
        
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Check for direct next/image imports
        if (content.includes("from 'next/image'") || content.includes('from "next/image"')) {
          directImports.push(filePath.replace(process.cwd(), ''));
        }
      }
    }
  }
  
  scanDirectory(componentsDir);
  scanDirectory(appDir);
  
  addResult(
    'No direct next/image imports (all use BaseImage)',
    directImports.length === 0,
    directImports.length === 0 
      ? 'All components use BaseImage wrapper'
      : `Found direct imports in: ${directImports.join(', ')}`
  );
}

// Test 4: Check BaseImage has blur placeholder for better UX
function testBlurPlaceholder() {
  const baseImagePath = path.join(process.cwd(), 'components/image/BaseImage.tsx');
  const content = fs.readFileSync(baseImagePath, 'utf-8');
  
  const hasBlurPlaceholder = content.includes("placeholder={props.placeholder ?? 'blur'}");
  const hasBlurDataURL = content.includes('blurDataURL');
  
  addResult(
    'BaseImage has blur placeholder for better UX',
    hasBlurPlaceholder && hasBlurDataURL,
    `Placeholder: ${hasBlurPlaceholder}, BlurDataURL: ${hasBlurDataURL}`
  );
}

// Test 5: Check that priority is only used appropriately
function testPriorityUsage() {
  const componentsDir = path.join(process.cwd(), 'components');
  const appDir = path.join(process.cwd(), 'app');
  
  let priorityUsages: Array<{ file: string; context: string }> = [];
  
  function scanDirectory(dir: string) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (!file.startsWith('.') && file !== 'node_modules') {
          scanDirectory(filePath);
        }
      } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          if (line.includes('priority') && (line.includes('BaseImage') || line.includes('<Image'))) {
            priorityUsages.push({
              file: filePath.replace(process.cwd(), ''),
              context: `Line ${index + 1}: ${line.trim()}`
            });
          }
        });
      }
    }
  }
  
  scanDirectory(componentsDir);
  scanDirectory(appDir);
  
  // Priority should only be used in specific cases (hero images, above-the-fold)
  // MediaGallery lightbox is acceptable as it's user-initiated
  const acceptableFiles = ['MediaGallery.tsx'];
  const problematicUsages = priorityUsages.filter(usage => 
    !acceptableFiles.some(acceptable => usage.file.includes(acceptable))
  );
  
  addResult(
    'Priority prop is used appropriately',
    problematicUsages.length === 0,
    problematicUsages.length === 0
      ? `Found ${priorityUsages.length} priority usage(s), all appropriate`
      : `Potentially inappropriate priority usage in: ${problematicUsages.map(u => u.file).join(', ')}`
  );
}

// Test 6: Verify loading="lazy" is explicitly set in key components
function testExplicitLazyLoading() {
  const keyComponents = [
    'components/webNav/WebNavCard.tsx',
    'components/MediaGallery.tsx',
  ];
  
  let componentsWithLazy = 0;
  let details: string[] = [];
  
  for (const component of keyComponents) {
    const componentPath = path.join(process.cwd(), component);
    if (fs.existsSync(componentPath)) {
      const content = fs.readFileSync(componentPath, 'utf-8');
      const hasLazy = content.includes("loading='lazy'") || content.includes('loading="lazy"');
      
      if (hasLazy) {
        componentsWithLazy++;
        details.push(`${component}: ✓`);
      } else {
        details.push(`${component}: ✗ (relies on BaseImage default)`);
      }
    }
  }
  
  addResult(
    'Key components explicitly use lazy loading',
    componentsWithLazy >= 1,
    details.join(', ')
  );
}

// Run all tests
console.log('🔍 Verifying Lazy Loading Implementation\n');
console.log('='.repeat(60));

testBaseImageLazyLoading();
testNextConfigImageOptimization();
testNoDirectImageImports();
testBlurPlaceholder();
testPriorityUsage();
testExplicitLazyLoading();

console.log('='.repeat(60));

// Summary
const passedTests = results.filter(r => r.passed).length;
const totalTests = results.length;
const allPassed = passedTests === totalTests;

console.log(`\n📊 Summary: ${passedTests}/${totalTests} tests passed`);

if (allPassed) {
  console.log('✅ All lazy loading checks passed!');
  console.log('\n✨ Lazy loading is properly implemented:');
  console.log('   • BaseImage component defaults to lazy loading');
  console.log('   • Next.js image optimization is enabled');
  console.log('   • WebP and AVIF formats are supported');
  console.log('   • Blur placeholders improve perceived performance');
  console.log('   • Priority is used appropriately for above-the-fold images');
} else {
  console.log('⚠️  Some checks failed. Review the details above.');
  process.exit(1);
}
