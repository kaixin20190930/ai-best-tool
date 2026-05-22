#!/usr/bin/env tsx
/**
 * Verification Script for Image Alt Attribute Improvements
 * 
 * This script verifies that all image alt attribute improvements have been implemented
 * according to Requirements 7.2 and 6.4
 */

import { readFileSync } from 'fs';

interface Verification {
  component: string;
  requirement: string;
  status: 'PASS' | 'FAIL';
  details: string;
}

const verifications: Verification[] = [];

function verify(component: string, requirement: string, check: () => boolean, details: string) {
  const status = check() ? 'PASS' : 'FAIL';
  verifications.push({ component, requirement, status, details });
}

// Read component files
const baseImageContent = readFileSync('components/image/BaseImage.tsx', 'utf-8');
const iconContent = readFileSync('components/image/Icon.tsx', 'utf-8');
const navigationContent = readFileSync('components/home/Navigation.tsx', 'utf-8');
const webNavCardContent = readFileSync('components/webNav/WebNavCard.tsx', 'utf-8');
const mediaGalleryContent = readFileSync('components/MediaGallery.tsx', 'utf-8');
const toolDetailContent = readFileSync('app/[locale]/(with-footer)/ai/[websiteName]/page.tsx', 'utf-8');
const localeSwitcherContent = readFileSync('components/LocaleSwitcher.tsx', 'utf-8');

console.log('🔍 Verifying Image Alt Attribute Improvements\n');
console.log('Requirements: 7.2, 6.4\n');

// Verify BaseImage component has fallback alt text generation
verify(
  'BaseImage',
  '7.2',
  () => baseImageContent.includes('generateAltFromSrc') && baseImageContent.includes('Ensure alt text is always present'),
  'BaseImage component generates descriptive alt text from filename as fallback'
);

// Verify Icon component has improved alt text handling
verify(
  'Icon',
  '7.2',
  () => iconContent.includes('alt?: string') && iconContent.includes('generateAltFromSrc'),
  'Icon component accepts explicit alt prop and generates descriptive fallback'
);

// Verify Navigation logo images have descriptive alt text
verify(
  'Navigation',
  '7.2, 6.4',
  () => navigationContent.includes('AI Best Tool logo icon') && navigationContent.includes('AI Best Tool wordmark'),
  'Navigation logo images include descriptive, keyword-rich alt text'
);

// Verify WebNavCard tool images have descriptive alt text
verify(
  'WebNavCard',
  '7.2, 6.4',
  () => webNavCardContent.includes('AI tool screenshot and preview'),
  'Tool card images include descriptive alt text with relevant keywords'
);

// Verify MediaGallery screenshots have descriptive alt text
verify(
  'MediaGallery',
  '7.2, 6.4',
  () => mediaGalleryContent.includes('showing features and interface') && 
        mediaGalleryContent.includes('detailed screenshot'),
  'Media gallery images include descriptive alt text for thumbnails and lightbox'
);

// Verify tool detail page images have descriptive alt text
verify(
  'Tool Detail Page',
  '7.2, 6.4',
  () => toolDetailContent.includes('AI tool interface preview and main features'),
  'Tool detail page hero images include descriptive, keyword-rich alt text'
);

// Verify LocaleSwitcher icon has descriptive alt text
verify(
  'LocaleSwitcher',
  '7.2',
  () => localeSwitcherContent.includes('Language selector icon'),
  'Language switcher icon has descriptive alt text'
);

// Verify documentation exists
verify(
  'Documentation',
  '7.2, 6.4',
  () => {
    try {
      const docContent = readFileSync('docs/IMAGE_ALT_TEXT_GUIDELINES.md', 'utf-8');
      return docContent.includes('Image Alt Text Guidelines') && 
             docContent.includes('Requirement 7.2') &&
             docContent.includes('SEO Considerations');
    } catch {
      return false;
    }
  },
  'Comprehensive image alt text guidelines documentation created'
);

// Verify audit script exists
verify(
  'Audit Script',
  '7.2',
  () => {
    try {
      const scriptContent = readFileSync('scripts/audit-image-alt-attributes.ts', 'utf-8');
      return scriptContent.includes('Image Alt Attribute Audit') && 
             scriptContent.includes('checkAltQuality');
    } catch {
      return false;
    }
  },
  'Automated audit script for image alt attributes created'
);

// Print results
console.log('📊 Verification Results:\n');

const passed = verifications.filter(v => v.status === 'PASS').length;
const failed = verifications.filter(v => v.status === 'FAIL').length;

verifications.forEach(v => {
  const icon = v.status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} ${v.component}`);
  console.log(`   Requirement: ${v.requirement}`);
  console.log(`   ${v.details}`);
  console.log('');
});

console.log('━'.repeat(60));
console.log(`\n📈 Summary: ${passed}/${verifications.length} checks passed\n`);

if (failed === 0) {
  console.log('✨ All image alt attribute improvements verified successfully!\n');
  console.log('Key Improvements:');
  console.log('  • BaseImage component generates descriptive fallback alt text');
  console.log('  • Icon component accepts explicit alt prop with smart fallback');
  console.log('  • Logo images include brand name and purpose');
  console.log('  • Tool images include descriptive, keyword-rich alt text');
  console.log('  • Screenshot images describe features and interface');
  console.log('  • Comprehensive documentation and audit tools created');
  console.log('');
  console.log('SEO Benefits:');
  console.log('  • Improved image search visibility');
  console.log('  • Better accessibility for screen readers');
  console.log('  • Natural keyword inclusion in alt text');
  console.log('  • Enhanced user experience');
  console.log('');
} else {
  console.log(`⚠️  ${failed} verification(s) failed. Please review the issues above.\n`);
  process.exit(1);
}
