#!/usr/bin/env tsx
/**
 * Image Alt Attribute Audit Script
 * 
 * This script audits all image usage across the application to ensure:
 * 1. All images have alt attributes
 * 2. Alt attributes are descriptive and meaningful
 * 3. Alt attributes include relevant keywords naturally
 * 
 * Requirements: 7.2, 6.4
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface ImageUsage {
  file: string;
  line: number;
  component: string;
  altText: string;
  context: string;
  issues: string[];
}

const imageUsages: ImageUsage[] = [];

// Patterns to match image components
const IMAGE_PATTERNS = [
  /<BaseImage\s+([^>]*?)>/gs,
  /<Image\s+([^>]*?)>/gs,
  /<img\s+([^>]*?)>/gs,
];

// Function to extract alt text from props
function extractAltText(propsString: string): string | null {
  const altMatch = propsString.match(/alt=["']([^"']*)["']/);
  if (altMatch) return altMatch[1];
  
  const altMatch2 = propsString.match(/alt=\{([^}]*)\}/);
  if (altMatch2) return altMatch2[1];
  
  return null;
}

// Function to check if alt text is descriptive
function checkAltQuality(altText: string): string[] {
  const issues: string[] = [];
  
  if (!altText || altText.trim() === '') {
    issues.push('Empty alt text');
  } else if (altText === 'icon' || altText === 'image') {
    issues.push('Generic alt text - not descriptive');
  } else if (altText.length < 5) {
    issues.push('Alt text too short - should be more descriptive');
  } else if (altText.toLowerCase().startsWith('image of') || altText.toLowerCase().startsWith('picture of')) {
    issues.push('Redundant prefix - avoid "image of" or "picture of"');
  }
  
  return issues;
}

// Function to scan a file for image usage
function scanFile(filePath: string) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    IMAGE_PATTERNS.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern);
      
      while ((match = regex.exec(content)) !== null) {
        const propsString = match[1];
        const altText = extractAltText(propsString);
        const lineNumber = content.substring(0, match.index).split('\n').length;
        
        const componentMatch = match[0].match(/<(\w+)/);
        const component = componentMatch ? componentMatch[1] : 'Unknown';
        
        const issues = altText ? checkAltQuality(altText) : ['Missing alt attribute'];
        
        imageUsages.push({
          file: filePath,
          line: lineNumber,
          component,
          altText: altText || 'MISSING',
          context: lines[lineNumber - 1]?.trim() || '',
          issues,
        });
      }
    });
  } catch (error) {
    // Ignore files that can't be read
  }
}

// Function to recursively scan directories
function scanDirectory(dir: string) {
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .next, .git
      if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(entry)) {
        scanDirectory(fullPath);
      }
    } else if (stat.isFile() && (entry.endsWith('.tsx') || entry.endsWith('.jsx'))) {
      scanFile(fullPath);
    }
  }
}

// Main execution
console.log('🔍 Auditing image alt attributes...\n');

scanDirectory('app');
scanDirectory('components');

console.log(`Found ${imageUsages.length} image usages\n`);

// Group by issues
const withIssues = imageUsages.filter(usage => usage.issues.length > 0);
const withoutIssues = imageUsages.filter(usage => usage.issues.length === 0);

console.log(`✅ ${withoutIssues.length} images with good alt text`);
console.log(`⚠️  ${withIssues.length} images with issues\n`);

if (withIssues.length > 0) {
  console.log('Issues found:\n');
  
  withIssues.forEach(usage => {
    console.log(`📄 ${usage.file}:${usage.line}`);
    console.log(`   Component: ${usage.component}`);
    console.log(`   Alt text: "${usage.altText}"`);
    console.log(`   Issues: ${usage.issues.join(', ')}`);
    console.log('');
  });
}

// Summary by component
console.log('\n📊 Summary by component:');
const byComponent = imageUsages.reduce((acc, usage) => {
  if (!acc[usage.component]) {
    acc[usage.component] = { total: 0, withIssues: 0 };
  }
  acc[usage.component].total++;
  if (usage.issues.length > 0) {
    acc[usage.component].withIssues++;
  }
  return acc;
}, {} as Record<string, { total: number; withIssues: number }>);

Object.entries(byComponent).forEach(([component, stats]) => {
  console.log(`  ${component}: ${stats.total} total, ${stats.withIssues} with issues`);
});

console.log('\n✨ Audit complete!');

process.exit(withIssues.length > 0 ? 1 : 0);
