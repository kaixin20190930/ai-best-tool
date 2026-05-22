# SEO Utilities

Comprehensive SEO utilities for generating metadata, structured data, and optimizing content for search engines.

## Overview

This module provides three main categories of utilities:

1. **Constants** - Configuration and type definitions
2. **Metadata** - Functions for generating titles, descriptions, and URLs
3. **Schema** - Schema.org structured data generators

## Installation

```typescript
import {
  // Constants
  SEO_CONFIG,
  SEO_CONSTRAINTS,
  
  // Metadata utilities
  generateTitle,
  generateDescription,
  generateCanonicalUrl,
  
  // Schema generators
  generateOrganizationSchema,
  generateSoftwareSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo';
```

## Usage Examples

### Generating Page Titles

```typescript
import { generateTitle, generateToolTitle } from '@/lib/seo';

// Basic page title
const title = generateTitle('Explore AI Tools');
// Output: "Explore AI Tools | AI Best Tool"

// Tool-specific title
const toolTitle = generateToolTitle('ChatGPT', 'Chatbot');
// Output: "ChatGPT - Chatbot AI Tool | AI Best Tool"
```

### Generating Meta Descriptions

```typescript
import { generateDescription, generateToolDescription } from '@/lib/seo';

// Basic description
const desc = generateDescription(
  'Your long description text here that might be too long...'
);
// Output: Truncated to 120-160 characters

// Tool-specific description
const toolDesc = generateToolDescription(
  'ChatGPT',
  'An AI chatbot for conversations',
  'AI Assistant'
);
// Output: Enhanced description with context
```

### Generating URLs

```typescript
import { generateCanonicalUrl, generateSocialImageUrl } from '@/lib/seo';

// Canonical URL
const canonical = generateCanonicalUrl('/explore/ai-tools');
// Output: "https://aibesttool.com/explore/ai-tools"

// Social image URL
const imageUrl = generateSocialImageUrl('/images/tool.png');
// Output: "https://aibesttool.com/images/tool.png"
```

### Generating Structured Data

```typescript
import {
  generateOrganizationSchema,
  generateSoftwareSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo';

// Organization schema (for homepage)
const orgSchema = generateOrganizationSchema({
  name: 'AI Best Tool',
  url: 'https://aibesttool.com',
  logo: 'https://aibesttool.com/logo.png',
  socialLinks: ['https://twitter.com/aibesttool'],
});

// Software schema (for tool pages)
const softwareSchema = generateSoftwareSchema({
  name: 'ChatGPT',
  description: 'AI chatbot',
  category: 'AI Assistant',
  tags: ['ai', 'chatbot'],
  pricing: { type: 'freemium' },
  rating: { value: 4.8, count: 1500 },
  image: 'https://example.com/chatgpt.png',
  url: 'https://example.com/tools/chatgpt',
});

// Breadcrumb schema
const breadcrumbSchema = generateBreadcrumbSchema([
  { name: 'Home', url: 'https://aibesttool.com/' },
  { name: 'Explore', url: 'https://aibesttool.com/explore' },
  { name: 'AI Tools', url: 'https://aibesttool.com/explore/ai-tools' },
]);
```

### Using in Next.js Metadata API

```typescript
import { Metadata } from 'next';
import { generateTitle, generateDescription, generateCanonicalUrl } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: generateTitle('Explore AI Tools'),
    description: generateDescription('Browse our directory of AI tools...'),
    alternates: {
      canonical: generateCanonicalUrl('/explore'),
    },
  };
}
```

## Constants

### SEO_CONFIG

Main configuration object containing:
- `siteName`: Site name
- `siteUrl`: Base URL
- `defaultTitle`: Default page title
- `defaultDescription`: Default meta description
- `defaultImage`: Default social image
- `twitterHandle`: Twitter handle
- `locales`: Supported locales
- `defaultLocale`: Default locale

### SEO_CONSTRAINTS

Length constraints for SEO optimization:
- `TITLE_MIN_LENGTH`: 30 characters
- `TITLE_MAX_LENGTH`: 60 characters
- `DESCRIPTION_MIN_LENGTH`: 120 characters
- `DESCRIPTION_MAX_LENGTH`: 160 characters
- `TOOL_DESCRIPTION_MIN_LENGTH`: 200 characters
- `TOOL_DESCRIPTION_MAX_LENGTH`: 300 characters

## API Reference

### Metadata Functions

#### `generateTitle(pageTitle, siteName?, separator?)`
Generates an optimized page title within SEO constraints.

#### `generateDescription(content, maxLength?)`
Generates an optimized meta description within SEO constraints.

#### `generateSocialImageUrl(imagePath, baseUrl?)`
Converts relative image paths to absolute URLs.

#### `generateCanonicalUrl(path, baseUrl?)`
Generates canonical URLs for pages.

#### `generateToolTitle(toolName, category?)`
Generates optimized titles for tool pages.

#### `generateToolDescription(toolName, description, category?)`
Generates optimized descriptions for tool pages.

#### `generateAlternateLocales(path, currentLocale, baseUrl?)`
Generates alternate locale URLs for hreflang tags.

### Schema Functions

#### `generateOrganizationSchema(data)`
Generates Organization schema for the site.

#### `generateWebSiteSchema(siteUrl?, siteName?)`
Generates WebSite schema with search action.

#### `generateSoftwareSchema(tool)`
Generates SoftwareApplication schema for tools.

#### `generateBreadcrumbSchema(items)`
Generates BreadcrumbList schema for navigation.

#### `generateItemListSchema(items, listName)`
Generates ItemList schema for listing pages.

#### `generateFAQSchema(faqs)`
Generates FAQPage schema for FAQ sections.

#### `generateArticleSchema(data)`
Generates Article schema for blog posts.

#### `validateSchema(schema)`
Validates a schema object has required fields.

#### `combineSchemas(schemas)`
Combines multiple schemas, filtering invalid ones.

## Testing

Run the verification script:

```bash
npx tsx lib/seo/__tests__/verify-seo-utils.ts
```

## Requirements Validation

This implementation satisfies:
- **Requirement 8.1**: Reusable SEO component accepting title, description, and image props
- **Requirement 8.2**: Utility functions for generating JSON-LD markup
- **Requirement 8.3**: Automatic generation of Open Graph and Twitter Card tags from page data
- **Requirement 8.4**: Easy inclusion of proper SEO metadata through component composition

## Additional Documentation

For comprehensive guides and best practices, see:

- **[SEO Documentation Index](../../docs/SEO_DOCUMENTATION_INDEX.md)** - Complete documentation overview
- **[SEO Guidelines](../../docs/SEO_GUIDELINES.md)** - Step-by-step guide for adding new pages
- **[Structured Data Patterns](../../docs/STRUCTURED_DATA_PATTERNS.md)** - Schema.org implementation patterns
- **[SEO Content Checklist](../../docs/SEO_CONTENT_CHECKLIST.md)** - Pre-launch checklist for content creators
- **[SEO Components README](../../components/seo/README.md)** - Component usage documentation
- **[SEO Components Examples](../../components/seo/EXAMPLES.md)** - Real-world code examples

## Notes

- All title generation respects the 30-60 character constraint
- All description generation respects the 120-160 character constraint
- Image URLs are automatically converted to absolute URLs
- Canonical URLs never have trailing slashes (except root)
- All schemas are validated before use
- Supports multiple locales with hreflang generation
