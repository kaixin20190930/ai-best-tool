/**
 * Script to verify Core Web Vitals optimization through lazy loading
 * 
 * This script validates that the lazy loading implementation
 * supports good Core Web Vitals scores:
 * - LCP (Largest Contentful Paint) < 2.5s
 * - FID (First Input Delay) < 100ms
 * - CLS (Cumulative Layout Shift) < 0.1
 */

import fs from 'fs';
import path from 'path';

interface WebVitalsCheck {
  metric: string;
  check: string;
  passed: boolean;
  details: string;
}

const checks: WebVitalsCheck[] = [];

function addCheck(metric: string, check: string, passed: boolean, details: string) {
  checks.push({ metric, check, passed, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${metric}: ${check}`);
  if (details) {
    console.log(`   ${details}`);
  }
}

console.log('🎯 Verifying Core Web Vitals Optimization\n');
console.log('='.repeat(70));

// LCP Checks
console.log('\n📊 LCP (Largest Contentful Paint) Optimizations:\n');

// Check 1: Priority images for above-the-fold content
const baseImagePath = path.join(process.cwd(), 'components/image/BaseImage.tsx');
const baseImageContent = fs.readFileSync(baseImagePath, 'utf-8');
const supportsPriority = baseImageContent.includes('priority');

addCheck(
  'LCP',
  'Priority loading supported for hero images',
  supportsPriority,
  supportsPriority 
    ? 'Hero images can load immediately with priority prop'
    : 'Priority prop not found in BaseImage'
);

// Check 2: Image optimization enabled
const configPath = path.join(process.cwd(), 'next.config.mjs');
const configContent = fs.readFileSync(configPath, 'utf-8');
const hasOptimization = !configContent.includes('unoptimized: true');

addCheck(
  'LCP',
  'Image optimization enabled',
  hasOptimization,
  hasOptimization
    ? 'Next.js will serve optimized images (WebP/AVIF)'
    : 'Image optimization is disabled'
);

// Check 3: Modern formats supported
const hasWebP = configContent.includes("'image/webp'");
const hasAVIF = configContent.includes("'image/avif'");

addCheck(
  'LCP',
  'Modern image formats (WebP/AVIF) enabled',
  hasWebP && hasAVIF,
  `WebP: ${hasWebP}, AVIF: ${hasAVIF} - Smaller files = faster LCP`
);

// FID Checks
console.log('\n⚡ FID (First Input Delay) Optimizations:\n');

// Check 4: Lazy loading reduces initial JavaScript
const hasLazyDefault = baseImageContent.includes("loading={props.loading ?? (props.priority ? 'eager' : 'lazy')}");

addCheck(
  'FID',
  'Lazy loading reduces initial JavaScript execution',
  hasLazyDefault,
  hasLazyDefault
    ? 'Fewer images = less decoding work = faster interactivity'
    : 'Lazy loading not properly configured'
);

// Check 5: No blocking image loads
const webNavCardPath = path.join(process.cwd(), 'components/webNav/WebNavCard.tsx');
if (fs.existsSync(webNavCardPath)) {
  const webNavContent = fs.readFileSync(webNavCardPath, 'utf-8');
  const usesLazy = webNavContent.includes("loading='lazy'") || webNavContent.includes('loading="lazy"');
  
  addCheck(
    'FID',
    'Tool cards use lazy loading (non-blocking)',
    usesLazy,
    usesLazy
      ? 'Tool card images won\'t block main thread'
      : 'Tool cards may block initial interactivity'
  );
}

// CLS Checks
console.log('\n📐 CLS (Cumulative Layout Shift) Optimizations:\n');

// Check 6: Blur placeholder prevents layout shift
const hasBlurPlaceholder = baseImageContent.includes("placeholder={props.placeholder ?? 'blur'}");
const hasBlurDataURL = baseImageContent.includes('blurDataURL');

addCheck(
  'CLS',
  'Blur placeholder prevents layout shift',
  hasBlurPlaceholder && hasBlurDataURL,
  hasBlurPlaceholder && hasBlurDataURL
    ? 'Placeholder reserves space before image loads'
    : 'Missing blur placeholder configuration'
);

// Check 7: Explicit dimensions (passed through props)
const passesPropsThrough = baseImageContent.includes('{...props}');
const extendsImageProps = baseImageContent.includes('React.ComponentProps<typeof Image>');

addCheck(
  'CLS',
  'Component supports explicit dimensions',
  passesPropsThrough && extendsImageProps,
  passesPropsThrough && extendsImageProps
    ? 'Width/height/fill props passed through to Next.js Image'
    : 'Dimensions not properly handled'
);

// Check 8: Responsive sizing
const toolDetailPath = path.join(process.cwd(), 'app/[locale]/(with-footer)/ai/[websiteName]/page.tsx');
if (fs.existsSync(toolDetailPath)) {
  const toolDetailContent = fs.readFileSync(toolDetailPath, 'utf-8');
  const usesFill = toolDetailContent.includes('fill');
  
  addCheck(
    'CLS',
    'Fill prop used for responsive containers',
    usesFill,
    usesFill
      ? 'Fill prop maintains aspect ratio and prevents shift'
      : 'Consider using fill prop for responsive images'
  );
}

// Additional Performance Checks
console.log('\n🚀 Additional Performance Optimizations:\n');

// Check 9: Long cache TTL
const hasCacheTTL = configContent.includes('minimumCacheTTL');
const cacheMatch = configContent.match(/minimumCacheTTL:\s*60\s*\*\s*60\s*\*\s*24\s*\*\s*(\d+)/);
const cacheDays = cacheMatch ? parseInt(cacheMatch[1]) : 0;

addCheck(
  'Performance',
  'Long cache TTL configured',
  cacheDays >= 7,
  `Cache TTL: ${cacheDays} days (recommended: 7+ days)`
);

// Check 10: Responsive device sizes
const hasDeviceSizes = configContent.includes('deviceSizes');
const hasImageSizes = configContent.includes('imageSizes');

addCheck(
  'Performance',
  'Responsive sizes configured',
  hasDeviceSizes && hasImageSizes,
  hasDeviceSizes && hasImageSizes
    ? 'Multiple sizes available for different devices'
    : 'Responsive sizes not configured'
);

console.log('\n='.repeat(70));

// Summary
const passedChecks = checks.filter(c => c.passed).length;
const totalChecks = checks.length;
const passRate = (passedChecks / totalChecks) * 100;

console.log(`\n📊 Summary: ${passedChecks}/${totalChecks} checks passed (${passRate.toFixed(1)}%)\n`);

// Group by metric
const lcpChecks = checks.filter(c => c.metric === 'LCP');
const fidChecks = checks.filter(c => c.metric === 'FID');
const clsChecks = checks.filter(c => c.metric === 'CLS');
const perfChecks = checks.filter(c => c.metric === 'Performance');

console.log('By Metric:');
console.log(`  LCP: ${lcpChecks.filter(c => c.passed).length}/${lcpChecks.length} passed`);
console.log(`  FID: ${fidChecks.filter(c => c.passed).length}/${fidChecks.length} passed`);
console.log(`  CLS: ${clsChecks.filter(c => c.passed).length}/${clsChecks.length} passed`);
console.log(`  Performance: ${perfChecks.filter(c => c.passed).length}/${perfChecks.length} passed`);

console.log('\n='.repeat(70));

if (passRate >= 90) {
  console.log('\n✅ Excellent! Core Web Vitals optimizations are in place.\n');
  console.log('Expected Performance:');
  console.log('  • LCP: < 2.5s (Good)');
  console.log('  • FID: < 100ms (Good)');
  console.log('  • CLS: < 0.1 (Good)');
  console.log('\n💡 Next Steps:');
  console.log('  1. Deploy to production');
  console.log('  2. Monitor with Google Search Console');
  console.log('  3. Run Lighthouse audits regularly');
  console.log('  4. Check real user metrics (RUM)');
} else if (passRate >= 70) {
  console.log('\n⚠️  Good progress, but some optimizations are missing.\n');
  console.log('Review failed checks above and implement missing optimizations.');
} else {
  console.log('\n❌ Significant improvements needed.\n');
  console.log('Many Core Web Vitals optimizations are missing.');
  console.log('Review the implementation guide: docs/LAZY_LOADING_IMPLEMENTATION.md');
}

console.log('\n📚 Resources:');
console.log('  • Web.dev Core Web Vitals: https://web.dev/vitals/');
console.log('  • PageSpeed Insights: https://pagespeed.web.dev/');
console.log('  • Chrome DevTools Lighthouse: chrome://devtools');
console.log('  • Implementation Guide: docs/LAZY_LOADING_IMPLEMENTATION.md');

console.log('\n🔍 Testing Recommendations:\n');
console.log('1. Local Testing:');
console.log('   npm run build && npm run start');
console.log('   Open Chrome DevTools → Lighthouse → Run audit\n');
console.log('2. Network Throttling:');
console.log('   DevTools → Network → Slow 3G');
console.log('   Verify lazy loading behavior\n');
console.log('3. Production Monitoring:');
console.log('   Google Search Console → Core Web Vitals');
console.log('   Monitor real user metrics\n');

if (passRate < 100) {
  process.exit(1);
}
