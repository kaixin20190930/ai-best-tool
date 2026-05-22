/**
 * SEOHead Component Tests
 * Validates that SEO metadata generation works correctly
 */

import { generateSEOMetadata, generateSEOMetadataWithLocales } from '../SEOHead';
import { SEO_CONFIG } from '@/lib/seo';

describe('SEOHead Component', () => {
  describe('generateSEOMetadata', () => {
    it('should generate basic metadata with title and description', () => {
      const metadata = generateSEOMetadata({
        title: 'Test Page',
        description: 'This is a test page description that is long enough to meet SEO requirements and provide good context for search engines.',
      });

      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
      expect(metadata.description).toContain('test page description');
    });

    it('should include canonical URL when provided', () => {
      const metadata = generateSEOMetadata({
        title: 'Test Page',
        description: 'This is a test page description that is long enough to meet SEO requirements and provide good context for search engines.',
        canonical: '/test-page',
      });

      expect(metadata.alternates?.canonical).toBeDefined();
      expect(metadata.alternates?.canonical).toContain('/test-page');
    });

    it('should generate Open Graph metadata', () => {
      const metadata = generateSEOMetadata({
        title: 'Test Page',
        description: 'This is a test page description that is long enough to meet SEO requirements and provide good context for search engines.',
        image: '/test-image.png',
      });

      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.title).toBeDefined();
      expect(metadata.openGraph?.description).toBeDefined();
      expect(metadata.openGraph?.images).toBeDefined();
    });

    it('should generate Twitter Card metadata', () => {
      const metadata = generateSEOMetadata({
        title: 'Test Page',
        description: 'This is a test page description that is long enough to meet SEO requirements and provide good context for search engines.',
      });

      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter?.card).toBe('summary_large_image');
      expect(metadata.twitter?.title).toBeDefined();
      expect(metadata.twitter?.description).toBeDefined();
    });

    it('should support locale configuration', () => {
      const metadata = generateSEOMetadata({
        title: 'Test Page',
        description: 'This is a test page description that is long enough to meet SEO requirements and provide good context for search engines.',
        locale: 'es',
      });

      expect(metadata.openGraph?.locale).toBe('es');
    });

    it('should support alternate locales', () => {
      const alternateLocales = [
        { locale: 'es', url: 'https://aibesttool.com/es/test' },
        { locale: 'fr', url: 'https://aibesttool.com/fr/test' },
      ];

      const metadata = generateSEOMetadata({
        title: 'Test Page',
        description: 'This is a test page description that is long enough to meet SEO requirements and provide good context for search engines.',
        canonical: '/test',
        alternateLocales,
      });

      expect(metadata.openGraph?.alternateLocale).toEqual(['es', 'fr']);
      expect(metadata.alternates?.languages).toBeDefined();
      expect(metadata.alternates?.languages?.es).toBe('https://aibesttool.com/es/test');
    });

    it('should support noindex option', () => {
      const metadata = generateSEOMetadata({
        title: 'Test Page',
        description: 'This is a test page description that is long enough to meet SEO requirements and provide good context for search engines.',
        noindex: true,
      });

      expect(metadata.robots).toBeDefined();
      expect(metadata.robots?.index).toBe(false);
      expect(metadata.robots?.follow).toBe(true);
    });

    it('should support keywords', () => {
      const metadata = generateSEOMetadata({
        title: 'Test Page',
        description: 'This is a test page description that is long enough to meet SEO requirements and provide good context for search engines.',
        keywords: ['AI', 'tools', 'testing'],
      });

      expect(metadata.keywords).toEqual(['AI', 'tools', 'testing']);
    });

    it('should use default image when none provided', () => {
      const metadata = generateSEOMetadata({
        title: 'Test Page',
        description: 'This is a test page description that is long enough to meet SEO requirements and provide good context for search engines.',
      });

      expect(metadata.openGraph?.images).toBeDefined();
      expect(metadata.twitter?.images).toBeDefined();
    });

    it('should support article type', () => {
      const metadata = generateSEOMetadata({
        title: 'Test Article',
        description: 'This is a test article description that is long enough to meet SEO requirements and provide good context for search engines.',
        type: 'article',
      });

      expect(metadata.openGraph?.type).toBe('article');
    });
  });

  describe('generateSEOMetadataWithLocales', () => {
    it('should automatically generate alternate locales', () => {
      const metadata = generateSEOMetadataWithLocales(
        {
          title: 'Test Page',
          description: 'This is a test page description that is long enough to meet SEO requirements and provide good context for search engines.',
          locale: 'en',
        },
        '/test-page',
      );

      expect(metadata.openGraph?.alternateLocale).toBeDefined();
      expect(metadata.alternates?.languages).toBeDefined();
      
      // Should have alternate locales for all configured locales except current
      const alternateLocales = metadata.openGraph?.alternateLocale || [];
      expect(alternateLocales.length).toBeGreaterThan(0);
      expect(alternateLocales).not.toContain('en'); // Current locale should not be in alternates
    });

    it('should use default locale when none provided', () => {
      const metadata = generateSEOMetadataWithLocales(
        {
          title: 'Test Page',
          description: 'This is a test page description that is long enough to meet SEO requirements and provide good context for search engines.',
        },
        '/test-page',
      );

      expect(metadata.openGraph?.locale).toBe(SEO_CONFIG.defaultLocale);
    });
  });
});
