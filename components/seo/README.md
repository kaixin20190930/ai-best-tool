# SEO Components

Reusable SEO components for Next.js 14 App Router with comprehensive metadata support.

## Components

### SEOHead

Generates complete SEO metadata including title, description, canonical URLs, and social media tags.

#### Usage

```typescript
import { generateSEOMetadata, generateSEOMetadataWithLocales } from '@/components/seo';

// In your page.tsx
export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'My Page Title',
    description: 'A comprehensive description of my page that is between 120-160 characters for optimal SEO performance.',
    canonical: '/my-page',
    image: '/images/my-page-og.png',
    locale: 'en',
  });
}

// With automatic alternate locales
export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadataWithLocales(
    {
      title: 'My Page Title',
      description: 'A comprehensive description of my page that is between 120-160 characters for optimal SEO performance.',
      locale: 'en',
    },
    '/my-page' // Current path without locale prefix
  );
}
```

#### Props

- `title` (string, required): Page title
- `description` (string, required): Page description
- `canonical` (string, optional): Canonical URL path
- `image` (string, optional): Social media image path
- `type` ('website' | 'article', optional): Open Graph type
- `locale` (string, optional): Current locale
- `alternateLocales` (array, optional): Array of alternate locale objects
- `noindex` (boolean, optional): Prevent search engine indexing
- `keywords` (string[], optional): SEO keywords

### Hreflang Tags (Internationalization)

Generates proper hreflang tags for multilingual sites, including x-default for the default language.

#### Usage

```typescript
import { generateHreflangMetadata } from '@/components/seo';
import { Metadata } from 'next';

// In your page.tsx
export async function generateMetadata({ 
  params 
}: { 
  params: { locale: string } 
}): Promise<Metadata> {
  const baseMetadata = {
    title: 'My Page',
    description: 'Page description',
    // ... other metadata
  };

  // Add hreflang tags for all locales
  const hreflangMetadata = generateHreflangMetadata(
    params.locale,
    '/explore' // Current path without locale prefix
  );

  return {
    ...baseMetadata,
    ...hreflangMetadata,
  };
}
```

#### What it generates

The `generateHreflangMetadata` function creates:
- Hreflang links for all available locales
- Canonical URL for the current page
- x-default link pointing to the default locale (English)
- Bidirectional relationships between all language versions

Example output in HTML:
```html
<link rel="canonical" href="https://aibesttool.com/en/explore" />
<link rel="alternate" hreflang="en" href="https://aibesttool.com/en/explore" />
<link rel="alternate" hreflang="es" href="https://aibesttool.com/es/explore" />
<link rel="alternate" hreflang="fr" href="https://aibesttool.com/fr/explore" />
<link rel="alternate" hreflang="de" href="https://aibesttool.com/de/explore" />
<link rel="alternate" hreflang="jp" href="https://aibesttool.com/jp/explore" />
<link rel="alternate" hreflang="pt" href="https://aibesttool.com/pt/explore" />
<link rel="alternate" hreflang="ru" href="https://aibesttool.com/ru/explore" />
<link rel="alternate" hreflang="cn" href="https://aibesttool.com/cn/explore" />
<link rel="alternate" hreflang="tw" href="https://aibesttool.com/tw/explore" />
<link rel="alternate" hreflang="x-default" href="https://aibesttool.com/en/explore" />
```

#### Manual hreflang generation

For more control, use the lower-level utility:

```typescript
import { generateHreflangLinks } from '@/lib/seo';

const hreflangLinks = generateHreflangLinks('/explore', 'en');
// Returns: { 
//   'en': 'https://aibesttool.com/en/explore',
//   'es': 'https://aibesttool.com/es/explore',
//   ...
//   'x-default': 'https://aibesttool.com/en/explore'
// }
```

### SocialMeta

Generates Open Graph and Twitter Card metadata for social media sharing.

#### Usage

```typescript
import { generateSocialMetadata, generateToolSocialMetadata } from '@/components/seo';

// Basic social metadata
const metadata = generateSocialMetadata({
  title: 'My Tool',
  description: 'An amazing AI tool',
  image: '/images/tool-og.png',
  url: 'https://aibesttool.com/tool/my-tool',
  type: 'website',
  twitterCard: 'summary_large_image',
});

// Tool-specific metadata with ratings and pricing
const toolMetadata = generateToolSocialMetadata({
  name: 'ChatGPT',
  description: 'Advanced AI chatbot',
  image: '/images/chatgpt.png',
  url: 'https://aibesttool.com/ai/chatgpt',
  category: 'Chatbot',
  rating: { value: 4.8, count: 1250 },
  price: 'Freemium',
});
```

#### Props

- `title` (string, required): Content title
- `description` (string, required): Content description
- `image` (string, optional): Social media image
- `url` (string, optional): Content URL
- `type` (OpenGraphType, optional): Open Graph type
- `twitterCard` (TwitterCardType, optional): Twitter card type
- `twitterCreator` (string, optional): Twitter creator handle
- `twitterSite` (string, optional): Twitter site handle
- `locale` (string, optional): Content locale
- `siteName` (string, optional): Site name
- `article` (object, optional): Article-specific metadata

### StructuredData

Safely injects JSON-LD structured data into pages. Supports multiple schemas.

#### Usage

```typescript
import { StructuredData } from '@/components/seo';
import { generateOrganizationSchema, generateSoftwareSchema } from '@/lib/seo';

// In your page component
export default function Page() {
  const orgSchema = generateOrganizationSchema({
    name: 'AI Best Tool',
    url: 'https://aibesttool.com',
    logo: 'https://aibesttool.com/images/logo.png',
    socialLinks: [
      'https://twitter.com/aibesttool',
      'https://facebook.com/aibesttool',
    ],
  });

  const toolSchema = generateSoftwareSchema({
    name: 'ChatGPT',
    description: 'Advanced AI chatbot',
    url: 'https://aibesttool.com/ai/chatgpt',
    image: 'https://aibesttool.com/images/chatgpt.png',
    category: 'Chatbot',
    pricing: { type: 'freemium' },
    rating: { value: 4.8, count: 1250 },
  });

  return (
    <>
      <StructuredData data={[orgSchema, toolSchema]} />
      {/* Your page content */}
    </>
  );
}
```

#### Server Component Usage

For server components, use `StructuredDataServer`:

```typescript
import { StructuredDataServer } from '@/components/seo';

export default function ServerPage() {
  const schema = generateOrganizationSchema({...});
  
  return (
    <>
      <StructuredDataServer data={schema} />
      {/* Your page content */}
    </>
  );
}
```

#### Multiple Schemas

```typescript
import { MultipleStructuredData } from '@/components/seo';

<MultipleStructuredData schemas={[schema1, schema2, schema3]} />
```

## Complete Example

Here's a complete example for a tool detail page:

```typescript
// app/[locale]/ai/[toolName]/page.tsx
import { Metadata } from 'next';
import { generateSEOMetadata } from '@/components/seo';
import { StructuredData } from '@/components/seo';
import {
  generateSoftwareSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo';

interface Props {
  params: { locale: string; toolName: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = await getToolData(params.toolName);

  return generateSEOMetadata({
    title: tool.name,
    description: tool.description,
    canonical: `/ai/${params.toolName}`,
    image: tool.image,
    locale: params.locale,
  });
}

export default async function ToolPage({ params }: Props) {
  const tool = await getToolData(params.toolName);

  const softwareSchema = generateSoftwareSchema({
    name: tool.name,
    description: tool.description,
    url: `https://aibesttool.com/ai/${params.toolName}`,
    image: tool.image,
    category: tool.category,
    pricing: tool.pricing,
    rating: tool.rating,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://aibesttool.com' },
    { name: 'AI Tools', url: 'https://aibesttool.com/explore' },
    { name: tool.name, url: `https://aibesttool.com/ai/${params.toolName}` },
  ]);

  return (
    <>
      <StructuredData data={[softwareSchema, breadcrumbSchema]} />
      {/* Your page content */}
    </>
  );
}
```

## Validation

Use the validation hook to debug structured data:

```typescript
import { useStructuredDataValidation } from '@/components/seo';

const schema = generateOrganizationSchema({...});
const { isValid, errors } = useStructuredDataValidation(schema);

if (!isValid) {
  console.error('Schema validation errors:', errors);
}
```

## Best Practices

1. **Always provide descriptions between 120-160 characters** for optimal search result display
2. **Use canonical URLs** to prevent duplicate content issues
3. **Include social images** with proper dimensions (1200x630 for OG, 1200x600 for Twitter)
4. **Validate structured data** using Google Rich Results Test
5. **Use specific schema types** (SoftwareApplication for tools, Article for blog posts)
6. **Include hreflang tags** for all multilingual pages to help search engines serve the correct language
7. **Always include x-default** hreflang tag pointing to your default language
8. **Ensure bidirectional hreflang relationships** - if page A links to page B, page B must link back to page A
9. **Test social sharing** with Facebook Sharing Debugger and Twitter Card Validator
10. **Verify hreflang implementation** with Google Search Console

## Additional Documentation

For comprehensive guides and best practices, see:

- **[SEO Documentation Index](../../docs/SEO_DOCUMENTATION_INDEX.md)** - Complete documentation overview
- **[SEO Guidelines](../../docs/SEO_GUIDELINES.md)** - Step-by-step guide for adding new pages
- **[Structured Data Patterns](../../docs/STRUCTURED_DATA_PATTERNS.md)** - Schema.org implementation patterns
- **[SEO Content Checklist](../../docs/SEO_CONTENT_CHECKLIST.md)** - Pre-launch checklist for content creators
- **[SEO Components Examples](./EXAMPLES.md)** - Real-world code examples
- **[SEO Utilities README](../../lib/seo/README.md)** - Utility functions documentation

## Requirements Validation

These components satisfy the following requirements:

- **Requirement 8.1**: Reusable SEO component accepting title, description, and image props ✓
- **Requirement 8.2**: Utility functions for generating JSON-LD markup ✓
- **Requirement 8.3**: Automatic generation of Open Graph and Twitter Card tags ✓
- **Requirement 8.4**: Easy inclusion of SEO metadata through component composition ✓
- **Requirement 2.1**: Open Graph metadata for social sharing ✓
- **Requirement 2.2**: Twitter Card metadata ✓
- **Requirement 3.4**: Safe injection of structured data ✓
- **Requirement 5.1**: Hreflang tags for all pages with translations ✓
- **Requirement 5.2**: x-default hreflang tag for default language ✓
- **Requirement 5.4**: Consistent URL patterns across language versions ✓
