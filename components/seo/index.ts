/**
 * SEO Components
 * Central export for all SEO-related components
 */

// SEOHead Component
export {
  generateSEOMetadata,
  generateSEOMetadataWithLocales,
  generateHreflangMetadata,
  type SEOHeadProps,
} from './SEOHead';

// SocialMeta Component
export {
  generateSocialMetadata,
  generateToolSocialMetadata,
  generateArticleSocialMetadata,
  generateProfileSocialMetadata,
  type SocialMetaProps,
  type TwitterCardType,
  type OpenGraphType,
} from './SocialMeta';

// StructuredData Component
export {
  StructuredData,
  StructuredDataServer,
  MultipleStructuredData,
  useStructuredDataValidation,
  safeStringifyJsonLd,
  type StructuredDataProps,
} from './StructuredData';

// SeoScript Component (existing)
export { default as SeoScript } from './SeoScript';
