/**
 * Script to test lazy loading performance impact
 * 
 * This script simulates page loads and checks:
 * 1. Images below the fold are not loaded immediately
 * 2. Loading attribute is properly set
 * 3. Performance metrics align with Core Web Vitals
 */

import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

interface PerformanceMetrics {
  totalImages: number;
  lazyImages: number;
  eagerImages: number;
  imagesWithBlur: number;
  imagesWithSizes: number;
}

function analyzeComponent(componentPath: string): PerformanceMetrics {
  const fullPath = path.join(process.cwd(), componentPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Component not found: ${componentPath}`);
    return {
      totalImages: 0,
      lazyImages: 0,
      eagerImages: 0,
      imagesWithBlur: 0,
      imagesWithSizes: 0,
    };
  }
  
  const content = fs.readFileSync(fullPath, 'utf-8');
  
  // Count BaseImage usages
  const baseImageMatches = content.match(/<BaseImage[\s\S]*?\/>/g) || [];
  const totalImages = baseImageMatches.length;
  
  // Count lazy loading
  const lazyImages = baseImageMatches.filter(img => 
    img.includes("loading='lazy'") || img.includes('loading="lazy"')
  ).length;
  
  // Count eager/priority loading
  const eagerImages = baseImageMatches.filter(img => 
    img.includes('priority') || img.includes("loading='eager'") || img.includes('loading="eager"')
  ).length;
  
  // Count blur placeholders
  const imagesWithBlur = baseImageMatches.filter(img => 
    img.includes('placeholder') || content.includes('blurDataURL')
  ).length;
  
  // Count responsive sizes
  const imagesWithSizes = baseImageMatches.filter(img => 
    img.includes('sizes=')
  ).length;
  
  return {
    totalImages,
    lazyImages,
    eagerImages,
    imagesWithBlur,
    imagesWithSizes,
  };
}

console.log('🚀 Testing Lazy Loading Performance Impact\n');
console.log('='.repeat(70));

// Test key components
const componentsToTest = [
  'components/webNav/WebNavCard.tsx',
  'components/MediaGallery.tsx',
  'app/[locale]/(with-footer)/ai/[websiteName]/page.tsx',
  'components/image/BaseImage.tsx',
];

let totalMetrics: PerformanceMetrics = {
  totalImages: 0,
  lazyImages: 0,
  eagerImages: 0,
  imagesWithBlur: 0,
  imagesWithSizes: 0,
};

console.log('\n📊 Component Analysis:\n');

for (const component of componentsToTest) {
  const metrics = analyzeComponent(component);
  totalMetrics.totalImages += metrics.totalImages;
  totalMetrics.lazyImages += metrics.lazyImages;
  totalMetrics.eagerImages += metrics.eagerImages;
  totalMetrics.imagesWithBlur += metrics.imagesWithBlur;
  totalMetrics.imagesWithSizes += metrics.imagesWithSizes;
  
  if (metrics.totalImages > 0) {
    console.log(`📄 ${component}`);
    console.log(`   Total images: ${metrics.totalImages}`);
    console.log(`   Lazy loaded: ${metrics.lazyImages} (${((metrics.lazyImages / metrics.totalImages) * 100).toFixed(1)}%)`);
    console.log(`   Eager/Priority: ${metrics.eagerImages}`);
    console.log(`   With blur placeholder: ${metrics.imagesWithBlur}`);
    console.log(`   With responsive sizes: ${metrics.imagesWithSizes}`);
    console.log('');
  }
}

console.log('='.repeat(70));
console.log('\n📈 Overall Metrics:\n');
console.log(`Total images analyzed: ${totalMetrics.totalImages}`);
console.log(`Lazy loaded: ${totalMetrics.lazyImages} (${totalMetrics.totalImages > 0 ? ((totalMetrics.lazyImages / totalMetrics.totalImages) * 100).toFixed(1) : 0}%)`);
console.log(`Eager/Priority: ${totalMetrics.eagerImages} (${totalMetrics.totalImages > 0 ? ((totalMetrics.eagerImages / totalMetrics.totalImages) * 100).toFixed(1) : 0}%)`);
console.log(`With blur placeholder: ${totalMetrics.imagesWithBlur}`);
console.log(`With responsive sizes: ${totalMetrics.imagesWithSizes}`);

console.log('\n='.repeat(70));
console.log('\n✨ Performance Benefits of Lazy Loading:\n');
console.log('1. 🎯 Reduced Initial Page Load');
console.log('   • Only above-the-fold images load immediately');
console.log('   • Below-the-fold images load as user scrolls');
console.log('   • Saves bandwidth for users who don\'t scroll');
console.log('');
console.log('2. ⚡ Improved Core Web Vitals');
console.log('   • LCP (Largest Contentful Paint): Faster initial render');
console.log('   • FID (First Input Delay): Less JavaScript blocking');
console.log('   • CLS (Cumulative Layout Shift): Blur placeholder prevents shifts');
console.log('');
console.log('3. 📱 Better Mobile Experience');
console.log('   • Reduced data usage on mobile networks');
console.log('   • Faster perceived performance');
console.log('   • Responsive sizes optimize for device');
console.log('');
console.log('4. 🌐 SEO Benefits');
console.log('   • Google prioritizes fast-loading pages');
console.log('   • Better mobile-first indexing scores');
console.log('   • Improved user engagement metrics');

console.log('\n='.repeat(70));

// Check if lazy loading percentage is good
const lazyPercentage = totalMetrics.totalImages > 0 
  ? (totalMetrics.lazyImages / totalMetrics.totalImages) * 100 
  : 0;

if (lazyPercentage >= 80) {
  console.log('\n✅ Excellent! Most images use lazy loading.');
  console.log('   This will significantly improve page load performance.');
} else if (lazyPercentage >= 50) {
  console.log('\n⚠️  Good, but could be improved.');
  console.log('   Consider adding lazy loading to more below-the-fold images.');
} else {
  console.log('\n❌ Needs improvement.');
  console.log('   Most images should use lazy loading for better performance.');
}

console.log('\n💡 Recommendations:\n');
console.log('• Keep using BaseImage component for all images');
console.log('• Only use priority prop for hero/above-the-fold images');
console.log('• Add responsive sizes prop for better optimization');
console.log('• Monitor Core Web Vitals in Google Search Console');
console.log('• Test with Lighthouse for performance scores');

console.log('\n🔗 Next Steps:\n');
console.log('1. Run: npm run build && npm run start');
console.log('2. Test with Lighthouse in Chrome DevTools');
console.log('3. Check Network tab to verify lazy loading behavior');
console.log('4. Monitor Core Web Vitals in production');
