# Hreflang Implementation Guide

This guide explains how hreflang tags are implemented in the AI Best Tool application for proper internationalization SEO.

## What are Hreflang Tags?

Hreflang tags tell search engines which language and regional versions of a page are available. They help:
- Serve the correct language version to users
- Prevent duplicate content issues across language versions
- Improve international SEO performance

## Implementation Overview

The hreflang implementation consists of:

1. **Utility Functions** (`lib/seo/metadata.ts`)
   - `generateHreflangLinks()` - Generates hreflang URLs for all locales
   - `generateAlternateLocales()` - Generates alternate locale objects

2. **Component Helper** (`components/seo/SEOHead.tsx`)
   - `generateHreflangMetadata()` - Generates complete Next.js Metadata with hreflang

3. **Configuration** (`lib/seo/constants.ts`)
   - `SEO_CONFIG.locales` - List of all supported locales
   - `SEO_CONFIG.defaultLocale` - Default language (English)

## Key Features

### ✅ Complete Locale Coverage
All 9 supported locales are included:
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Japanese (jp)
- Portuguese (pt)
- Russian (ru)
- Simplified Chinese (zh-CN)
- Traditional Chinese (zh-TW)

### ✅ X-Default Tag
Every page includes an `x-default` hreflang tag pointing to the English version, which serves as the fallback for users whose language isn't explicitly supported.

### ✅ Bidirectional Relationships
All hreflang relationships are bidirectional - if page A links to page B, page B links back to page A.

### ✅ Canonical URLs
Each page includes a canonical URL pointing to itself, preventing duplicate content issues.

## Usage

### Basic Implementation

Add hreflang tags to any page by using `generateHreflangMetadata()`:

```typescript
// app/[locale]/your-page/page.tsx
import { Metadata } from 'next';
import { generateHreflangMetadata } from '@/components/seo';

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Your base metadata
  const baseMetadata: Metadata = {
    title: 'Your Page Title',
    description: 'Your page description',
  };

  // Add hreflang tags
  const hreflangMetadata = generateHreflangMetadata(
    params.locale,
    '/your-page' // Path WITHOUT locale prefix
  );

  return {
    ...baseMetadata,
    ...hreflangMetadata,
  };
}
```

### Important Notes

1. **Path Format**: Always provide the path WITHOUT the locale prefix
   - ✅ Correct: `/explore`
   - ❌ Wrong: `/en/explore`

2. **Root Path**: For the homepage, use `/`
   ```typescript
   generateHreflangMetadata(params.locale, '/')
   ```

3. **Dynamic Routes**: Include the full path with parameters
   ```typescript
   generateHreflangMetadata(params.locale, `/ai/${params.toolName}`)
   ```

## Examples

### Example 1: Static Page

```typescript
// app/[locale]/about/page.tsx
import { Metadata } from 'next';
import { generateHreflangMetadata } from '@/components/seo';

export async function generateMetadata({ 
  params 
}: { 
  params: { locale: string } 
}): Promise<Metadata> {
  return {
    title: 'About Us',
    description: 'Learn about AI Best Tool',
    ...generateHreflangMetadata(params.locale, '/about'),
  };
}
```

### Example 2: Dynamic Route

```typescript
// app/[locale]/ai/[toolName]/page.tsx
import { Metadata } from 'next';
import { generateHreflangMetadata } from '@/components/seo';

interface Props {
  params: { locale: string; toolName: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `${params.toolName} - AI Tool`,
    description: 'Tool description',
    ...generateHreflangMetadata(params.locale, `/ai/${params.toolName}`),
  };
}
```

### Example 3: Paginated Page

```typescript
// app/[locale]/explore/page/[pageNum]/page.tsx
import { Metadata } from 'next';
import { generateHreflangMetadata } from '@/components/seo';

interface Props {
  params: { locale: string; pageNum: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Explore AI Tools - Page ${params.pageNum}`,
    description: 'Browse AI tools',
    ...generateHreflangMetadata(params.locale, `/explore/page/${params.pageNum}`),
  };
}
```

## Generated HTML Output

The implementation generates the following HTML tags:

```html
<!-- Canonical URL -->
<link rel="canonical" href="https://aibesttool.com/en/explore" />

<!-- Hreflang tags for all locales -->
<link rel="alternate" hreflang="en" href="https://aibesttool.com/en/explore" />
<link rel="alternate" hreflang="es" href="https://aibesttool.com/es/explore" />
<link rel="alternate" hreflang="fr" href="https://aibesttool.com/fr/explore" />
<link rel="alternate" hreflang="de" href="https://aibesttool.com/de/explore" />
<link rel="alternate" hreflang="jp" href="https://aibesttool.com/jp/explore" />
<link rel="alternate" hreflang="pt" href="https://aibesttool.com/pt/explore" />
<link rel="alternate" hreflang="ru" href="https://aibesttool.com/ru/explore" />
<link rel="alternate" hreflang="zh-CN" href="https://aibesttool.com/cn/explore" />
<link rel="alternate" hreflang="zh-TW" href="https://aibesttool.com/tw/explore" />

<!-- X-default fallback -->
<link rel="alternate" hreflang="x-default" href="https://aibesttool.com/en/explore" />
```

## Testing

### Automated Tests

Run the verification scripts to test the implementation:

```bash
# Test hreflang link generation
npx tsx scripts/verify-hreflang.ts

# Test metadata rendering
npx tsx scripts/test-hreflang-rendering.ts
```

### Manual Testing

1. **View Page Source**
   ```bash
   curl -s https://aibesttool.com/en/explore | grep hreflang
   ```

2. **Browser DevTools**
   ```javascript
   // In browser console
   document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(link => {
     console.log(`${link.getAttribute('hreflang')}: ${link.href}`);
   });
   ```

3. **Google Search Console**
   - Go to "International Targeting" → "Language"
   - Verify hreflang tags are detected
   - Check for errors

### Validation Tools

- **Google Search Console**: Monitor hreflang implementation
- **Hreflang Tags Testing Tool**: https://www.aleydasolis.com/english/international-seo-tools/hreflang-tags-generator/
- **Screaming Frog SEO Spider**: Crawl site and check hreflang tags

## Troubleshooting

### Common Issues

1. **Missing x-default**
   - Ensure you're using `generateHreflangMetadata()` which automatically includes x-default
   - Verify `SEO_CONFIG.defaultLocale` is set correctly

2. **Wrong URLs**
   - Check that you're passing the path WITHOUT locale prefix
   - Verify `SEO_CONFIG.siteUrl` is correct

3. **Missing Locales**
   - Ensure all locales are listed in `SEO_CONFIG.locales`
   - Check that the locale mapping in `i18n.ts` matches

4. **Bidirectional Issues**
   - The implementation automatically ensures bidirectional relationships
   - If issues occur, verify all pages use the same path format

## Best Practices

1. **Always Include Hreflang**: Add hreflang tags to ALL pages with translations
2. **Use Consistent Paths**: Keep URL structure consistent across locales
3. **Include X-Default**: Always include x-default pointing to your primary language
4. **Monitor Regularly**: Check Google Search Console for hreflang errors
5. **Test After Changes**: Run verification scripts after modifying SEO code

## Requirements Satisfied

This implementation satisfies the following requirements:

- ✅ **Requirement 5.1**: Hreflang tags for all pages with translations
- ✅ **Requirement 5.2**: X-default for default language version
- ✅ **Requirement 5.4**: Consistent URL patterns across language versions

## Additional Resources

- [Google Hreflang Documentation](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Hreflang Best Practices](https://moz.com/learn/seo/hreflang-tag)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)

## Support

For issues or questions about the hreflang implementation:
1. Check this documentation
2. Run the verification scripts
3. Review the test results
4. Check Google Search Console for errors
