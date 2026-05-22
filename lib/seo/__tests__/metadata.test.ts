/**
 * Tests for SEO Metadata Utilities
 */

import {
  generateTitle,
  generateDescription,
  generateSocialImageUrl,
  generateCanonicalUrl,
  generateToolTitle,
  generateToolDescription,
  generateAlternateLocales,
} from '../metadata';
import { SEO_CONFIG, SEO_CONSTRAINTS } from '../constants';

describe('SEO Metadata Utilities', () => {
  describe('generateTitle', () => {
    it('should generate title with site name', () => {
      const title = generateTitle('Test Page');
      expect(title).toContain('Test Page');
      expect(title).toContain(SEO_CONFIG.siteName);
    });

    it('should return default title for empty input', () => {
      const title = generateTitle('');
      expect(title).toBe(SEO_CONFIG.defaultTitle);
    });

    it('should respect max length constraint', () => {
      const longTitle = 'A'.repeat(100);
      const title = generateTitle(longTitle);
      expect(title.length).toBeLessThanOrEqual(SEO_CONSTRAINTS.TITLE_MAX_LENGTH);
    });

    it('should use custom separator', () => {
      const title = generateTitle('Test', 'Site', '-');
      expect(title).toContain('-');
    });
  });

  describe('generateDescription', () => {
    it('should return description as-is if within optimal range', () => {
      const desc = 'A'.repeat(140);
      const result = generateDescription(desc);
      expect(result).toBe(desc);
    });

    it('should return default description for empty input', () => {
      const desc = generateDescription('');
      expect(desc).toBe(SEO_CONFIG.defaultDescription);
    });

    it('should truncate long descriptions', () => {
      const longDesc = 'A'.repeat(300);
      const result = generateDescription(longDesc);
      expect(result.length).toBeLessThanOrEqual(SEO_CONSTRAINTS.DESCRIPTION_MAX_LENGTH);
      expect(result).toContain('...');
    });

    it('should clean whitespace', () => {
      const desc = 'Test   with   extra   spaces';
      const result = generateDescription(desc);
      expect(result).toBe('Test with extra spaces');
    });
  });

  describe('generateSocialImageUrl', () => {
    it('should generate absolute URL from relative path', () => {
      const url = generateSocialImageUrl('/images/test.png');
      expect(url).toMatch(/^https?:\/\//);
      expect(url).toContain('/images/test.png');
    });

    it('should return absolute URL as-is', () => {
      const absoluteUrl = 'https://example.com/image.png';
      const url = generateSocialImageUrl(absoluteUrl);
      expect(url).toBe(absoluteUrl);
    });

    it('should return default image for empty input', () => {
      const url = generateSocialImageUrl('');
      expect(url).toContain(SEO_CONFIG.defaultImage);
    });
  });

  describe('generateCanonicalUrl', () => {
    it('should generate absolute URL from path', () => {
      const url = generateCanonicalUrl('/test-page');
      expect(url).toMatch(/^https?:\/\//);
      expect(url).toContain('/test-page');
    });

    it('should remove trailing slashes', () => {
      const url = generateCanonicalUrl('/test-page/');
      expect(url).not.toMatch(/\/$/);
    });

    it('should handle root path', () => {
      const url = generateCanonicalUrl('/');
      expect(url).toMatch(/^https?:\/\/[^/]+\/$/);
    });
  });

  describe('generateToolTitle', () => {
    it('should generate title with tool name', () => {
      const title = generateToolTitle('ChatGPT');
      expect(title).toContain('ChatGPT');
      expect(title).toContain('AI Tool');
    });

    it('should include category when provided', () => {
      const title = generateToolTitle('ChatGPT', 'Chatbot');
      expect(title).toContain('ChatGPT');
      expect(title).toContain('Chatbot');
    });

    it('should return default for empty tool name', () => {
      const title = generateToolTitle('');
      expect(title).toBe(SEO_CONFIG.defaultTitle);
    });
  });

  describe('generateToolDescription', () => {
    it('should use provided description if adequate length', () => {
      const desc = 'A'.repeat(150);
      const result = generateToolDescription('Tool', desc);
      expect(result).toContain(desc.substring(0, 100));
    });

    it('should enhance short descriptions', () => {
      const shortDesc = 'A great tool';
      const result = generateToolDescription('TestTool', shortDesc);
      expect(result).toContain('TestTool');
      expect(result.length).toBeGreaterThan(shortDesc.length);
    });

    it('should include category in enhancement', () => {
      const result = generateToolDescription('Tool', 'Short', 'AI');
      expect(result).toContain('AI');
    });
  });

  describe('generateAlternateLocales', () => {
    it('should generate alternate locales excluding current', () => {
      const alternates = generateAlternateLocales('/test', 'en');
      expect(alternates.length).toBeGreaterThan(0);
      expect(alternates.every((alt) => alt.locale !== 'en')).toBe(true);
    });

    it('should generate proper URLs for each locale', () => {
      const alternates = generateAlternateLocales('/test', 'en');
      alternates.forEach((alt) => {
        expect(alt.url).toMatch(/^https?:\/\//);
        expect(alt.url).toContain(`/${alt.locale}/test`);
      });
    });
  });
});
