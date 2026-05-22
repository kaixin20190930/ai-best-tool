/**
 * Tests for Schema.org Generators
 */

import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateSoftwareSchema,
  generateBreadcrumbSchema,
  generateItemListSchema,
  generateFAQSchema,
  validateSchema,
  combineSchemas,
} from '../schema';
import { ToolMetadata } from '../constants';

describe('Schema.org Generators', () => {
  describe('generateOrganizationSchema', () => {
    it('should generate valid Organization schema', () => {
      const schema = generateOrganizationSchema({
        name: 'Test Org',
        url: 'https://example.com',
        logo: 'https://example.com/logo.png',
      });

      expect(schema).toHaveProperty('@context', 'https://schema.org');
      expect(schema).toHaveProperty('@type', 'Organization');
      expect(schema).toHaveProperty('name', 'Test Org');
      expect(validateSchema(schema)).toBe(true);
    });

    it('should include social links when provided', () => {
      const schema: any = generateOrganizationSchema({
        name: 'Test Org',
        url: 'https://example.com',
        logo: 'https://example.com/logo.png',
        socialLinks: ['https://twitter.com/test', 'https://facebook.com/test'],
      });

      expect(schema.sameAs).toHaveLength(2);
    });
  });

  describe('generateWebSiteSchema', () => {
    it('should generate valid WebSite schema with search action', () => {
      const schema: any = generateWebSiteSchema();

      expect(schema).toHaveProperty('@type', 'WebSite');
      expect(schema).toHaveProperty('potentialAction');
      expect(schema.potentialAction['@type']).toBe('SearchAction');
      expect(validateSchema(schema)).toBe(true);
    });
  });

  describe('generateSoftwareSchema', () => {
    it('should generate valid SoftwareApplication schema', () => {
      const tool: ToolMetadata = {
        name: 'Test Tool',
        description: 'A test tool',
        category: 'AI',
        tags: ['ai', 'test'],
        pricing: { type: 'free' },
        image: 'https://example.com/tool.png',
        url: 'https://example.com/tool',
      };

      const schema: any = generateSoftwareSchema(tool);

      expect(schema).toHaveProperty('@type', 'SoftwareApplication');
      expect(schema).toHaveProperty('name', 'Test Tool');
      expect(schema).toHaveProperty('offers');
      expect(validateSchema(schema)).toBe(true);
    });

    it('should include rating when provided', () => {
      const tool: ToolMetadata = {
        name: 'Test Tool',
        description: 'A test tool',
        category: 'AI',
        tags: [],
        pricing: { type: 'free' },
        rating: { value: 4.5, count: 100 },
        image: 'https://example.com/tool.png',
        url: 'https://example.com/tool',
      };

      const schema: any = generateSoftwareSchema(tool);

      expect(schema).toHaveProperty('aggregateRating');
      expect(schema.aggregateRating.ratingValue).toBe('4.5');
    });

    it('should handle paid pricing', () => {
      const tool: ToolMetadata = {
        name: 'Test Tool',
        description: 'A test tool',
        category: 'AI',
        tags: [],
        pricing: { type: 'paid', price: 29.99, currency: 'USD' },
        image: 'https://example.com/tool.png',
        url: 'https://example.com/tool',
      };

      const schema: any = generateSoftwareSchema(tool);

      expect(schema.offers.price).toBe('29.99');
      expect(schema.offers.priceCurrency).toBe('USD');
    });
  });

  describe('generateBreadcrumbSchema', () => {
    it('should generate valid BreadcrumbList schema', () => {
      const items = [
        { name: 'Home', url: 'https://example.com' },
        { name: 'Category', url: 'https://example.com/category' },
        { name: 'Page', url: 'https://example.com/category/page' },
      ];

      const schema: any = generateBreadcrumbSchema(items);

      expect(schema).toHaveProperty('@type', 'BreadcrumbList');
      expect(schema.itemListElement).toHaveLength(3);
      expect(schema.itemListElement[0].position).toBe(1);
      expect(validateSchema(schema)).toBe(true);
    });
  });

  describe('generateItemListSchema', () => {
    it('should generate valid ItemList schema', () => {
      const items = [
        { name: 'Item 1', url: 'https://example.com/1' },
        { name: 'Item 2', url: 'https://example.com/2' },
      ];

      const schema: any = generateItemListSchema(items, 'Test List');

      expect(schema).toHaveProperty('@type', 'ItemList');
      expect(schema.numberOfItems).toBe(2);
      expect(validateSchema(schema)).toBe(true);
    });
  });

  describe('generateFAQSchema', () => {
    it('should generate valid FAQPage schema', () => {
      const faqs = [
        { question: 'What is this?', answer: 'This is a test' },
        { question: 'How does it work?', answer: 'It works great' },
      ];

      const schema: any = generateFAQSchema(faqs);

      expect(schema).toHaveProperty('@type', 'FAQPage');
      expect(schema.mainEntity).toHaveLength(2);
      expect(schema.mainEntity[0]['@type']).toBe('Question');
      expect(validateSchema(schema)).toBe(true);
    });
  });

  describe('validateSchema', () => {
    it('should validate correct schema', () => {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Thing',
      };

      expect(validateSchema(schema)).toBe(true);
    });

    it('should reject invalid schema', () => {
      expect(validateSchema(null)).toBe(false);
      expect(validateSchema({})).toBe(false);
      expect(validateSchema({ '@context': 'test' })).toBe(false);
    });
  });

  describe('combineSchemas', () => {
    it('should combine valid schemas', () => {
      const schemas = [
        { '@context': 'https://schema.org', '@type': 'Organization' },
        { '@context': 'https://schema.org', '@type': 'WebSite' },
      ];

      const combined = combineSchemas(schemas);

      expect(combined).toHaveLength(2);
    });

    it('should filter out invalid schemas', () => {
      const schemas = [
        { '@context': 'https://schema.org', '@type': 'Organization' },
        {},
        { '@context': 'https://schema.org', '@type': 'WebSite' },
      ];

      const combined = combineSchemas(schemas);

      expect(combined).toHaveLength(2);
    });
  });
});
