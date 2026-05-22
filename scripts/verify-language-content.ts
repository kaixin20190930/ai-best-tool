#!/usr/bin/env tsx

/**
 * Language-Specific Content Verification Script
 * 
 * This script audits all translated pages to ensure:
 * 1. All translations have unique, human-quality content
 * 2. No machine-translated patterns are detected
 * 3. Language-specific metadata is properly configured
 * 
 * Requirements: 5.3
 */

import fs from 'fs';
import path from 'path';

interface TranslationFile {
  locale: string;
  path: string;
  content: any;
}

interface AuditResult {
  locale: string;
  issues: string[];
  warnings: string[];
  passed: boolean;
}

// Supported locales
const SUPPORTED_LOCALES = ['en', 'cn', 'es', 'fr', 'de', 'jp', 'pt', 'ru', 'tw'];

// Machine translation indicators (common patterns)
const MACHINE_TRANSLATION_PATTERNS = [
  /\[.*?\]/g, // Brackets often indicate untranslated placeholders
  /\{.*?\}/g, // Curly braces for variables should be preserved but excessive use is suspicious
];

/**
 * Load all translation files
 */
function loadTranslations(): TranslationFile[] {
  const translations: TranslationFile[] = [];
  const messagesDir = path.join(process.cwd(), 'messages');

  for (const locale of SUPPORTED_LOCALES) {
    const filePath = path.join(messagesDir, `${locale}.json`);
    
    if (fs.existsSync(filePath)) {
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        translations.push({ locale, path: filePath, content });
      } catch (error) {
        console.error(`Error loading ${locale}.json:`, error);
      }
    }
  }

  return translations;
}

/**
 * Check if content appears to be machine-translated
 */
function detectMachineTranslation(text: string): string[] {
  const issues: string[] = [];

  // Check for common machine translation artifacts
  if (text.includes('[') && text.includes(']')) {
    issues.push('Contains untranslated placeholders in brackets');
  }

  // Check for excessive punctuation issues
  if (text.match(/\s{2,}/g)) {
    issues.push('Contains excessive whitespace (common in machine translation)');
  }

  // Check for mixed language content (basic check)
  const hasEnglish = /[a-zA-Z]{3,}/.test(text);
  const hasChinese = /[\u4e00-\u9fa5]/.test(text);
  const hasJapanese = /[\u3040-\u309f\u30a0-\u30ff]/.test(text);
  
  if ((hasChinese || hasJapanese) && hasEnglish && !text.includes('AI') && !text.includes('GPT')) {
    // Mixed content is suspicious unless it's technical terms
    const englishWords = text.match(/[a-zA-Z]{3,}/g) || [];
    const technicalTerms = ['AI', 'GPT', 'SEO', 'API', 'URL', 'IP', 'DA', 'WebP'];
    const nonTechnicalEnglish = englishWords.filter(word => !technicalTerms.includes(word));
    
    if (nonTechnicalEnglish.length > 3) {
      issues.push('Contains mixed language content (possible incomplete translation)');
    }
  }

  return issues;
}

/**
 * Compare translation completeness
 */
function checkTranslationCompleteness(
  baseContent: any,
  translatedContent: any,
  locale: string,
  path: string = ''
): string[] {
  const issues: string[] = [];

  for (const key in baseContent) {
    const currentPath = path ? `${path}.${key}` : key;

    if (!(key in translatedContent)) {
      issues.push(`Missing translation for key: ${currentPath}`);
      continue;
    }

    if (typeof baseContent[key] === 'object' && baseContent[key] !== null) {
      // Recursively check nested objects
      issues.push(...checkTranslationCompleteness(
        baseContent[key],
        translatedContent[key],
        locale,
        currentPath
      ));
    } else if (typeof baseContent[key] === 'string') {
      // Check if translation is identical to English (suspicious)
      if (locale !== 'en' && baseContent[key] === translatedContent[key]) {
        // Allow identical content for technical terms and URLs
        const isTechnicalOrUrl = 
          baseContent[key].includes('http') ||
          baseContent[key].includes('@') ||
          baseContent[key].match(/^[A-Z]{2,}$/) || // Acronyms
          baseContent[key].length < 5; // Very short strings
        
        if (!isTechnicalOrUrl) {
          issues.push(`Identical to English: ${currentPath} = "${baseContent[key]}"`);
        }
      }

      // Check for machine translation patterns
      const mtIssues = detectMachineTranslation(translatedContent[key]);
      if (mtIssues.length > 0) {
        issues.push(`${currentPath}: ${mtIssues.join(', ')}`);
      }
    }
  }

  return issues;
}

/**
 * Verify metadata translations
 */
function verifyMetadata(translations: TranslationFile[]): AuditResult[] {
  const results: AuditResult[] = [];
  const baseTranslation = translations.find(t => t.locale === 'en');

  if (!baseTranslation) {
    console.error('English translation file not found!');
    return results;
  }

  for (const translation of translations) {
    if (translation.locale === 'en') continue;

    const issues: string[] = [];
    const warnings: string[] = [];

    // Check metadata section exists
    if (!translation.content.Metadata) {
      issues.push('Missing Metadata section');
    } else {
      // Check metadata completeness
      const metadataIssues = checkTranslationCompleteness(
        baseTranslation.content.Metadata,
        translation.content.Metadata,
        translation.locale,
        'Metadata'
      );
      issues.push(...metadataIssues);

      // Check metadata quality
      if (translation.content.Metadata.home) {
        const homeTitle = translation.content.Metadata.home.title;
        const homeDesc = translation.content.Metadata.home.description;

        // Title should be 30-60 characters
        if (homeTitle && (homeTitle.length < 30 || homeTitle.length > 60)) {
          warnings.push(`Home title length (${homeTitle.length}) outside optimal range (30-60)`);
        }

        // Description should be 120-160 characters
        if (homeDesc && (homeDesc.length < 120 || homeDesc.length > 160)) {
          warnings.push(`Home description length (${homeDesc.length}) outside optimal range (120-160)`);
        }
      }
    }

    // Check all content for completeness
    const contentIssues = checkTranslationCompleteness(
      baseTranslation.content,
      translation.content,
      translation.locale
    );
    issues.push(...contentIssues);

    results.push({
      locale: translation.locale,
      issues,
      warnings,
      passed: issues.length === 0
    });
  }

  return results;
}

/**
 * Check for content uniqueness across languages
 */
function checkContentUniqueness(translations: TranslationFile[]): void {
  console.log('\n📊 Content Uniqueness Analysis\n');

  const contentMap = new Map<string, string[]>();

  for (const translation of translations) {
    const flattenContent = (obj: any, prefix = ''): void => {
      for (const key in obj) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'string') {
          const content = obj[key];
          if (!contentMap.has(content)) {
            contentMap.set(content, []);
          }
          contentMap.get(content)!.push(`${translation.locale}:${path}`);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          flattenContent(obj[key], path);
        }
      }
    };

    flattenContent(translation.content);
  }

  // Find duplicate content across different locales
  let duplicateCount = 0;
  for (const [content, locations] of contentMap.entries()) {
    if (locations.length > 1) {
      const locales = new Set(locations.map(loc => loc.split(':')[0]));
      if (locales.size > 1 && content.length > 10) {
        // Only report if it's not a technical term
        const isTechnical = 
          content.includes('http') ||
          content.includes('@') ||
          content.match(/^[A-Z]{2,}$/) ||
          content.includes('AI') ||
          content.includes('GPT');
        
        if (!isTechnical) {
          console.log(`⚠️  Duplicate content across locales: "${content}"`);
          console.log(`   Found in: ${locations.join(', ')}`);
          duplicateCount++;
        }
      }
    }
  }

  if (duplicateCount === 0) {
    console.log('✅ No suspicious duplicate content found across locales');
  } else {
    console.log(`\n⚠️  Found ${duplicateCount} instances of duplicate content`);
  }
}

/**
 * Main audit function
 */
function auditLanguageContent(): void {
  console.log('🔍 Language-Specific Content Audit\n');
  console.log('='.repeat(60));

  const translations = loadTranslations();
  console.log(`\n📁 Loaded ${translations.length} translation files`);
  console.log(`   Locales: ${translations.map(t => t.locale).join(', ')}\n`);

  // Verify metadata and content
  const results = verifyMetadata(translations);

  // Print results
  console.log('📋 Audit Results\n');
  
  let totalIssues = 0;
  let totalWarnings = 0;

  for (const result of results) {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.locale.toUpperCase()}`);

    if (result.issues.length > 0) {
      console.log(`   Issues (${result.issues.length}):`);
      result.issues.slice(0, 5).forEach(issue => {
        console.log(`   - ${issue}`);
      });
      if (result.issues.length > 5) {
        console.log(`   ... and ${result.issues.length - 5} more issues`);
      }
      totalIssues += result.issues.length;
    }

    if (result.warnings.length > 0) {
      console.log(`   Warnings (${result.warnings.length}):`);
      result.warnings.forEach(warning => {
        console.log(`   ⚠️  ${warning}`);
      });
      totalWarnings += result.warnings.length;
    }

    console.log('');
  }

  // Check content uniqueness
  checkContentUniqueness(translations);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary\n');
  console.log(`Total locales audited: ${results.length}`);
  console.log(`Passed: ${results.filter(r => r.passed).length}`);
  console.log(`Failed: ${results.filter(r => !r.passed).length}`);
  console.log(`Total issues: ${totalIssues}`);
  console.log(`Total warnings: ${totalWarnings}`);

  if (totalIssues === 0 && totalWarnings === 0) {
    console.log('\n✅ All language-specific content is properly translated and unique!');
  } else {
    console.log('\n⚠️  Some issues or warnings were found. Please review above.');
  }
}

// Run the audit
auditLanguageContent();
