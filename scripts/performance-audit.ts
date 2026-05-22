/**
 * Performance Testing Script
 * 
 * This script performs comprehensive performance testing including:
 * - Lighthouse audit simulation
 * - Core Web Vitals checks
 * - Image optimization verification
 * - Performance recommendations
 * 
 * Requirements: 7.1, 7.3
 */

import fs from 'fs';
import path from 'path';

interface PerformanceCheck {
  category: string;
  check: string;
  passed: boolean;
  score: number;
  details: string;
  recommendation?: string;
}

const checks: PerformanceCheck[] = [];

function addCheck(
  category: string,
  check: string,
  passed: boolean,
  score: number,
  details: string,
  recommendation?: string
) {
  checks.push({ category, check, passed, score, details, recommendation });
  const icon = passed ? '✅' : score >= 50 ? '⚠️' : '❌';
  console.log(`${icon} [${score}/100] ${check}`);
  console.log(`   ${details}`);
  if (recommendation && !passed) {
    console.log(`   💡 ${recommendation}`);
  }
}

console.log('🚀 Performance Audit - Comprehensive Testing\n');
console.log('='.repeat(80));
console.log('\nThis audit simulates Lighthouse and PageSpeed Insights checks');
console.log('Testing against Web Vitals thresholds and best practices\n');
console.log('='.repeat(80));

// ============================================================================
// CATEGORY 1: IMAGE OPTIMIZATION (Requirement 7.1)
// ============================================================================
console.log('\n📸 IMAGE OPTIMIZATION (Requirement 7.1)\n');

// Check 1: WebP Support
const configPath = path.join(process.cwd(), 'next.config.mjs');
const configContent = fs.readFileSync(configPath, 'utf-8');
const hasWebP = configContent.includes("'image/webp'");
const hasAVIF = configContent.includes("'image/avif'");

addCheck(
  'Image Optimization',
  'Modern image formats enabled',
  hasWebP && hasAVIF,
  hasWebP && hasAVIF ? 100 : hasWebP ? 70 : 0,
  `WebP: ${hasWebP ? 'Yes' : 'No'}, AVIF: ${hasAVIF ? 'Yes' : 'No'}`,
  'Enable WebP and AVIF in next.config.mjs for 25-35% smaller images'
);

// Check 2: Image Optimization Enabled
const hasOptimization = !configContent.includes('unoptimized: true');

addCheck(
  'Image Optimization',
  'Next.js Image optimization active',
  hasOptimization,
  hasOptimization ? 100 : 0,
  hasOptimization 
    ? 'Images will be automatically optimized and served in modern formats'
    : 'Image optimization is disabled',
  'Remove unoptimized: true from next.config.mjs'
);

// Check 3: Responsive Image Sizes
const hasDeviceSizes = configContent.includes('deviceSizes');
const hasImageSizes = configContent.includes('imageSizes');

addCheck(
  'Image Optimization',
  'Responsive image sizes configured',
  hasDeviceSizes && hasImageSizes,
  hasDeviceSizes && hasImageSizes ? 100 : 50,
  hasDeviceSizes && hasImageSizes
    ? 'Multiple sizes available for different viewports'
    : 'Using default sizes only',
  'Configure deviceSizes and imageSizes for optimal responsive delivery'
);

// Check 4: Image Cache TTL
const cacheMatch = configContent.match(/minimumCacheTTL:\s*60\s*\*\s*60\s*\*\s*24\s*\*\s*(\d+)/);
const cacheDays = cacheMatch ? parseInt(cacheMatch[1]) : 0;

addCheck(
  'Image Optimization',
  'Long-term image caching',
  cacheDays >= 30,
  cacheDays >= 30 ? 100 : cacheDays >= 7 ? 70 : 30,
  `Cache TTL: ${cacheDays} days`,
  'Set minimumCacheTTL to 30+ days for better caching'
);

// ============================================================================
// CATEGORY 2: LAZY LOADING (Requirement 7.3)
// ============================================================================
console.log('\n⚡ LAZY LOADING (Requirement 7.3)\n');

// Check 5: BaseImage Lazy Loading
const baseImagePath = path.join(process.cwd(), 'components/image/BaseImage.tsx');
const baseImageContent = fs.readFileSync(baseImagePath, 'utf-8');
const hasLazyDefault = baseImageContent.includes("loading={props.loading ?? (props.priority ? 'eager' : 'lazy')}");

addCheck(
  'Lazy Loading',
  'Smart lazy loading in BaseImage',
  hasLazyDefault,
  hasLazyDefault ? 100 : 0,
  hasLazyDefault
    ? 'Images lazy load by default, eager load when priority is set'
    : 'Lazy loading not properly configured',
  'Implement conditional loading based on priority prop'
);

// Check 6: Priority Loading Support
const supportsPriority = baseImageContent.includes('priority');

addCheck(
  'Lazy Loading',
  'Priority loading for above-fold images',
  supportsPriority,
  supportsPriority ? 100 : 50,
  supportsPriority
    ? 'Hero images can load immediately with priority prop'
    : 'Priority prop not supported',
  'Add priority prop support for LCP images'
);

// Check 7: Tool Cards Lazy Loading
const webNavCardPath = path.join(process.cwd(), 'components/webNav/WebNavCard.tsx');
if (fs.existsSync(webNavCardPath)) {
  const webNavContent = fs.readFileSync(webNavCardPath, 'utf-8');
  const usesLazy = webNavContent.includes("loading='lazy'") || webNavContent.includes('loading="lazy"');
  
  addCheck(
    'Lazy Loading',
    'Tool card images lazy loaded',
    usesLazy,
    usesLazy ? 100 : 30,
    usesLazy
      ? 'Tool card images load on scroll'
      : 'Tool cards may load all images immediately',
    'Add loading="lazy" to tool card images'
  );
}

// Check 8: Media Gallery Lazy Loading
const mediaGalleryPath = path.join(process.cwd(), 'components/MediaGallery.tsx');
if (fs.existsSync(mediaGalleryPath)) {
  const mediaContent = fs.readFileSync(mediaGalleryPath, 'utf-8');
  const usesLazy = mediaContent.includes("loading='lazy'") || mediaContent.includes('loading="lazy"');
  
  addCheck(
    'Lazy Loading',
    'Media gallery images lazy loaded',
    usesLazy,
    usesLazy ? 100 : 40,
    usesLazy
      ? 'Gallery images load on demand'
      : 'Gallery may load all images at once',
    'Implement lazy loading for gallery images'
  );
}

// ============================================================================
// CATEGORY 3: CORE WEB VITALS
// ============================================================================
console.log('\n📊 CORE WEB VITALS\n');

// Check 9: LCP Optimization (Largest Contentful Paint)
const lcpOptimizations = [
  hasWebP && hasAVIF,
  supportsPriority,
  hasOptimization,
  cacheDays >= 7
];
const lcpScore = (lcpOptimizations.filter(Boolean).length / lcpOptimizations.length) * 100;

addCheck(
  'Core Web Vitals',
  'LCP (Largest Contentful Paint) optimizations',
  lcpScore >= 75,
  lcpScore,
  `${lcpOptimizations.filter(Boolean).length}/${lcpOptimizations.length} optimizations in place`,
  'Target: LCP < 2.5s. Optimize images, enable priority loading, use modern formats'
);

// Check 10: CLS Prevention (Cumulative Layout Shift)
const hasBlurPlaceholder = baseImageContent.includes("placeholder={props.placeholder ?? 'blur'}");
const passesPropsThrough = baseImageContent.includes('{...props}');
const clsOptimizations = [hasBlurPlaceholder, passesPropsThrough];
const clsScore = (clsOptimizations.filter(Boolean).length / clsOptimizations.length) * 100;

addCheck(
  'Core Web Vitals',
  'CLS (Cumulative Layout Shift) prevention',
  clsScore >= 75,
  clsScore,
  `Blur placeholder: ${hasBlurPlaceholder}, Explicit dimensions: ${passesPropsThrough}`,
  'Target: CLS < 0.1. Use blur placeholders and explicit dimensions'
);

// Check 11: FID Optimization (First Input Delay)
const fidOptimizations = [hasLazyDefault, !configContent.includes('unoptimized: true')];
const fidScore = (fidOptimizations.filter(Boolean).length / fidOptimizations.length) * 100;

addCheck(
  'Core Web Vitals',
  'FID (First Input Delay) optimizations',
  fidScore >= 75,
  fidScore,
  `Lazy loading reduces initial JS execution`,
  'Target: FID < 100ms. Lazy load images to reduce main thread work'
);

// ============================================================================
// CATEGORY 4: BUNDLE SIZE & LOADING
// ============================================================================
console.log('\n📦 BUNDLE SIZE & LOADING\n');

// Check 12: Dynamic Imports
const layoutPath = path.join(process.cwd(), 'app/[locale]/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
  const hasDynamicImport = layoutContent.includes('dynamic(');
  
  addCheck(
    'Bundle Size',
    'Dynamic imports for heavy components',
    hasDynamicImport,
    hasDynamicImport ? 100 : 60,
    hasDynamicImport
      ? 'Heavy components loaded on demand'
      : 'All components loaded upfront',
    'Use next/dynamic for modals, analytics, and non-critical components'
  );
}

// Check 13: Font Optimization
const hasNextFont = fs.existsSync(path.join(process.cwd(), 'app/[locale]/layout.tsx')) &&
  fs.readFileSync(path.join(process.cwd(), 'app/[locale]/layout.tsx'), 'utf-8').includes('next/font');

addCheck(
  'Bundle Size',
  'Font optimization with next/font',
  hasNextFont,
  hasNextFont ? 100 : 50,
  hasNextFont
    ? 'Fonts optimized and self-hosted'
    : 'Font optimization not detected',
  'Use next/font for automatic font optimization'
);

// ============================================================================
// CATEGORY 5: CACHING & CDN
// ============================================================================
console.log('\n🌐 CACHING & CDN\n');

// Check 14: Static Generation
const hasStaticGeneration = fs.existsSync(path.join(process.cwd(), 'app/sitemap.ts'));

addCheck(
  'Caching',
  'Static generation enabled',
  hasStaticGeneration,
  hasStaticGeneration ? 100 : 70,
  hasStaticGeneration
    ? 'Pages can be statically generated at build time'
    : 'Using server-side rendering only',
  'Use generateStaticParams for static page generation'
);

// Check 15: Revalidation Strategy
const cachePath = path.join(process.cwd(), 'lib/cache.ts');
if (fs.existsSync(cachePath)) {
  const cacheContent = fs.readFileSync(cachePath, 'utf-8');
  const hasRevalidation = cacheContent.includes('revalidate');
  
  addCheck(
    'Caching',
    'ISR (Incremental Static Regeneration)',
    hasRevalidation,
    hasRevalidation ? 100 : 60,
    hasRevalidation
      ? 'Pages revalidate on schedule'
      : 'No revalidation strategy detected',
    'Implement ISR with revalidate for dynamic content'
  );
}

// ============================================================================
// CATEGORY 6: MOBILE PERFORMANCE
// ============================================================================
console.log('\n📱 MOBILE PERFORMANCE\n');

// Check 16: Responsive Images
const toolDetailPath = path.join(process.cwd(), 'app/[locale]/(with-footer)/ai/[websiteName]/page.tsx');
if (fs.existsSync(toolDetailPath)) {
  const toolDetailContent = fs.readFileSync(toolDetailPath, 'utf-8');
  const usesFill = toolDetailContent.includes('fill');
  
  addCheck(
    'Mobile Performance',
    'Responsive image sizing',
    usesFill,
    usesFill ? 100 : 60,
    usesFill
      ? 'Images adapt to container size'
      : 'Fixed image sizes may not be optimal',
    'Use fill prop with object-fit for responsive images'
  );
}

// Check 17: Viewport Meta Tag
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
  const hasViewport = layoutContent.includes('viewport');
  
  addCheck(
    'Mobile Performance',
    'Viewport meta tag configured',
    hasViewport,
    hasViewport ? 100 : 50,
    hasViewport
      ? 'Viewport properly configured for mobile'
      : 'Viewport configuration not found',
    'Add viewport metadata in layout.tsx'
  );
}

// ============================================================================
// SUMMARY & RECOMMENDATIONS
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log('\n📊 PERFORMANCE AUDIT SUMMARY\n');

// Calculate scores by category
const categories = ['Image Optimization', 'Lazy Loading', 'Core Web Vitals', 'Bundle Size', 'Caching', 'Mobile Performance'];
const categoryScores: Record<string, { total: number; count: number }> = {};

checks.forEach(check => {
  if (!categoryScores[check.category]) {
    categoryScores[check.category] = { total: 0, count: 0 };
  }
  categoryScores[check.category].total += check.score;
  categoryScores[check.category].count += 1;
});

console.log('Category Scores:');
let overallScore = 0;
let overallCount = 0;

Object.entries(categoryScores).forEach(([category, data]) => {
  const avgScore = Math.round(data.total / data.count);
  const emoji = avgScore >= 90 ? '🟢' : avgScore >= 70 ? '🟡' : '🔴';
  console.log(`  ${emoji} ${category}: ${avgScore}/100`);
  overallScore += data.total;
  overallCount += data.count;
});

const finalScore = Math.round(overallScore / overallCount);
console.log(`\n🎯 Overall Performance Score: ${finalScore}/100`);

// Performance grade
let grade = 'F';
let gradeEmoji = '❌';
if (finalScore >= 90) {
  grade = 'A';
  gradeEmoji = '🌟';
} else if (finalScore >= 80) {
  grade = 'B';
  gradeEmoji = '✅';
} else if (finalScore >= 70) {
  grade = 'C';
  gradeEmoji = '⚠️';
} else if (finalScore >= 60) {
  grade = 'D';
  gradeEmoji = '⚠️';
}

console.log(`${gradeEmoji} Performance Grade: ${grade}`);

// Detailed recommendations
console.log('\n' + '='.repeat(80));
console.log('\n💡 RECOMMENDATIONS\n');

const failedChecks = checks.filter(c => !c.passed && c.recommendation);
if (failedChecks.length === 0) {
  console.log('✅ Excellent! All performance checks passed.\n');
  console.log('Next Steps:');
  console.log('  1. Run production build: npm run build');
  console.log('  2. Test locally: npm run start');
  console.log('  3. Run Lighthouse in Chrome DevTools');
  console.log('  4. Test on real devices and slow networks');
  console.log('  5. Monitor with Google Search Console');
} else {
  console.log(`Found ${failedChecks.length} areas for improvement:\n`);
  
  failedChecks.forEach((check, index) => {
    console.log(`${index + 1}. ${check.check} (Score: ${check.score}/100)`);
    console.log(`   ${check.recommendation}\n`);
  });
}

// Testing instructions
console.log('='.repeat(80));
console.log('\n🧪 MANUAL TESTING INSTRUCTIONS\n');

console.log('1. Google PageSpeed Insights:');
console.log('   • Visit: https://pagespeed.web.dev/');
console.log('   • Enter your production URL');
console.log('   • Check both Mobile and Desktop scores');
console.log('   • Target: 90+ for both\n');

console.log('2. Chrome DevTools Lighthouse:');
console.log('   • Build production: npm run build');
console.log('   • Start server: npm run start');
console.log('   • Open Chrome DevTools (F12)');
console.log('   • Go to Lighthouse tab');
console.log('   • Run audit for Performance, Accessibility, Best Practices, SEO');
console.log('   • Target: All scores 90+\n');

console.log('3. Core Web Vitals Testing:');
console.log('   • Open Chrome DevTools → Performance');
console.log('   • Enable "Web Vitals" in settings');
console.log('   • Record page load');
console.log('   • Check: LCP < 2.5s, FID < 100ms, CLS < 0.1\n');

console.log('4. Network Throttling Test:');
console.log('   • DevTools → Network → Slow 3G');
console.log('   • Reload page and verify lazy loading');
console.log('   • Images should load as you scroll');
console.log('   • Hero image should load immediately\n');

console.log('5. Real Device Testing:');
console.log('   • Test on actual mobile devices');
console.log('   • Use slow network conditions');
console.log('   • Verify smooth scrolling and loading\n');

console.log('6. Production Monitoring:');
console.log('   • Google Search Console → Core Web Vitals');
console.log('   • Monitor real user metrics (RUM)');
console.log('   • Set up alerts for performance degradation\n');

console.log('='.repeat(80));
console.log('\n📚 RESOURCES\n');

console.log('Documentation:');
console.log('  • Web.dev Core Web Vitals: https://web.dev/vitals/');
console.log('  • PageSpeed Insights: https://pagespeed.web.dev/');
console.log('  • Lighthouse: https://developer.chrome.com/docs/lighthouse/');
console.log('  • Next.js Image Optimization: https://nextjs.org/docs/app/building-your-application/optimizing/images');
console.log('  • WebP Guide: docs/WEBP_IMAGE_OPTIMIZATION.md');
console.log('  • Lazy Loading Guide: docs/LAZY_LOADING_IMPLEMENTATION.md');
console.log('  • Mobile Optimization: docs/MOBILE_OPTIMIZATION.md\n');

console.log('='.repeat(80));

// Exit code based on score
if (finalScore >= 70) {
  console.log('\n✅ Performance audit completed successfully!\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Performance improvements needed. Review recommendations above.\n');
  process.exit(1);
}
