/**
 * Schema.org Structured Data Generators
 * Functions for generating JSON-LD structured data markup
 */

import { SEO_CONFIG, ToolMetadata } from './constants';

/**
 * Organization Schema Data
 */
export interface OrganizationSchemaData {
  name: string;
  url: string;
  logo: string;
  socialLinks?: string[];
  description?: string;
}

/**
 * Breadcrumb Item
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Generate Organization schema
 * Used for homepage and site-wide organization information
 *
 * @param data - Organization data
 * @returns JSON-LD Organization schema object
 */
export function generateOrganizationSchema(data: OrganizationSchemaData): object {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    url: data.url,
    logo: {
      '@type': 'ImageObject',
      url: data.logo,
    },
  };

  if (data.description) {
    schema.description = data.description;
  }

  if (data.socialLinks && data.socialLinks.length > 0) {
    schema.sameAs = data.socialLinks;
  }

  return schema;
}

/**
 * Generate WebSite schema with search action
 * Used for homepage to enable site search in search results
 *
 * @param siteUrl - Base URL of the website
 * @param siteName - Name of the website
 * @returns JSON-LD WebSite schema object
 */
export function generateWebSiteSchema(
  siteUrl: string = SEO_CONFIG.siteUrl,
  siteName: string = SEO_CONFIG.siteName,
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/explore?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate SoftwareApplication schema
 * Used for tool detail pages
 *
 * @param tool - Tool metadata
 * @returns JSON-LD SoftwareApplication schema object
 */
export function generateSoftwareSchema(tool: ToolMetadata): object {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    url: tool.url,
    applicationCategory: tool.category,
    operatingSystem: 'Web',
    image: tool.image,
    isAccessibleForFree: tool.pricing?.type === 'free' || tool.pricing?.type === 'freemium',
  };

  if (tool.longDescription) {
    schema.abstract = tool.longDescription;
  }

  if (tool.officialUrl) {
    schema.sameAs = [tool.officialUrl];
  }

  if (tool.datePublished) {
    schema.datePublished = tool.datePublished;
  }

  if (tool.dateModified) {
    schema.dateModified = tool.dateModified;
  }

  // Add pricing information
  if (tool.pricing) {
    if (tool.pricing.type === 'free') {
      schema.offers = {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      };
    } else if (tool.pricing.type === 'paid' && tool.pricing.price) {
      schema.offers = {
        '@type': 'Offer',
        price: tool.pricing.price.toString(),
        priceCurrency: tool.pricing.currency || 'USD',
      };
    } else if (tool.pricing.type === 'freemium') {
      schema.offers = {
        '@type': 'AggregateOffer',
        lowPrice: '0',
        priceCurrency: 'USD',
      };
    }
  }

  // Add rating information
  if (tool.rating && tool.rating.count > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: tool.rating.value.toString(),
      ratingCount: tool.rating.count.toString(),
      bestRating: '5',
      worstRating: '1',
    };
  }

  // Add keywords from tags
  if (tool.tags && tool.tags.length > 0) {
    schema.keywords = tool.tags.join(', ');
  }

  return schema;
}

/**
 * Generate BreadcrumbList schema
 * Used for pages with navigation hierarchy
 *
 * @param items - Array of breadcrumb items
 * @returns JSON-LD BreadcrumbList schema object
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate ItemList schema
 * Used for listing pages (explore, category pages)
 *
 * @param items - Array of items with name and url
 * @param listName - Name of the list
 * @returns JSON-LD ItemList schema object
 */
export function generateItemListSchema(
  items: Array<{ name: string; url: string }>,
  listName: string,
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

/**
 * Generate FAQPage schema
 * Used for pages with FAQ sections
 *
 * @param faqs - Array of question-answer pairs
 * @returns JSON-LD FAQPage schema object
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate Article schema
 * Used for blog posts or article pages
 *
 * @param data - Article data
 * @returns JSON-LD Article schema object
 */
export function generateArticleSchema(data: {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
}): object {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.description,
    url: data.url,
    image: data.image,
    datePublished: data.datePublished,
    dateModified: data.dateModified || data.datePublished,
  };

  if (data.author) {
    schema.author = {
      '@type': 'Person',
      name: data.author,
    };
  }

  schema.publisher = {
    '@type': 'Organization',
    name: SEO_CONFIG.siteName,
    logo: {
      '@type': 'ImageObject',
      url: `${SEO_CONFIG.siteUrl}${SEO_CONFIG.defaultImage}`,
    },
  };

  return schema;
}

/**
 * Validate schema object
 * Basic validation to ensure schema has required fields
 *
 * @param schema - Schema object to validate
 * @returns Boolean indicating if schema is valid
 */
export function validateSchema(schema: any): boolean {
  if (!schema || typeof schema !== 'object') {
    return false;
  }

  // Check for required Schema.org fields
  if (!schema['@context'] || !schema['@type']) {
    return false;
  }

  return true;
}

/**
 * Combine multiple schemas into an array
 * Used when a page needs multiple schema types
 *
 * @param schemas - Array of schema objects
 * @returns Array of valid schemas
 */
export function combineSchemas(schemas: object[]): object[] {
  return schemas.filter((schema) => validateSchema(schema));
}
