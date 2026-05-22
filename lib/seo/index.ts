/**
 * SEO Utilities
 * Central export for all SEO-related functions and constants
 */

// Constants and Types
export {
  SEO_CONFIG,
  SEO_CONSTRAINTS,
  SOCIAL_IMAGE_DIMENSIONS,
  TITLE_SEPARATOR,
  type SEOConfig,
  type ToolMetadata,
  type ToolPricing,
  type ToolRating,
} from './constants';

// Metadata Utilities
export {
  generateTitle,
  generateDescription,
  generateSocialImageUrl,
  generateCanonicalUrl,
  generateToolTitle,
  generateToolDescription,
  generateAlternateLocales,
  generateHreflangLinks,
} from './metadata';

// Schema.org Generators
export {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateSoftwareSchema,
  generateBreadcrumbSchema,
  generateItemListSchema,
  generateFAQSchema,
  generateArticleSchema,
  validateSchema,
  combineSchemas,
  type OrganizationSchemaData,
  type BreadcrumbItem,
} from './schema';
