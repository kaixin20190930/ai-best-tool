# SEO Guidelines for Adding New Pages

This guide provides step-by-step instructions for developers adding new pages to the site while maintaining optimal SEO.

## Quick Start Checklist

When creating a new page, ensure you:

- [ ] Add proper metadata using `generateMetadata()`
- [ ] Include canonical URL
- [ ] Add hreflang tags for multilingual pages
- [ ] Include appropriate structured data (JSON-LD)
- [ ] Optimize title (30-60 characters)
- [ ] Optimize description (120-160 characters)
- [ ] Add social media metadata (Open Graph & Twitter Cards)
- [ ] Include descriptive alt text for all images
- [ ] Test with validation tools

## Step-by-Step Guide

### 1. Create the Page File

Create your page in the appropriate directory:

```
app/[locale]/your-page/page.tsx
```

### 2. Add Metadata

Every page MUST export a `generateMetadata` function:

```typescript
import { Metadata } from 'next';
import { generateSEOMetadata } from '@/components/seo';

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Your Page Title',
    description: 'A compelling description between 120-160 characters that accurately describes the page content and includes relevant keywords.',
    canonical: '/your-page',
    locale: params.locale,
    image: '/images/your-page-og.png', // Optional but recommended
  });
}
```

### 3. Add Hreflang Tags (for Multilingual Pages)

If your page has translations, add hreflang tags:

```typescript
import { generateSEOMetadataWithLocales } from '@/components/seo';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return generateSEOMetadataWithLocales(
    {
      title: 'Your Page Title',
      description: 'Your page description...',
      locale: params.locale,
    },
    '/your-page' // Path without locale prefix
  );
}
```

This automatically generates:
- Canonical URL for current locale
- Alternate links for all available locales
- x-default link pointing to English version

### 4. Add Structured Data

Include appropriate Schema.org markup based on page type:

#### For Tool/Product Pages

```typescript
import { StructuredData } from '@/components/seo';
import { generateSoftwareSchema, generateBreadcrumbSchema } from '@/lib/seo';

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

#### For Listing Pages

```typescript
import { generateItemListSchema } from '@/lib/seo';

const listSchema = generateItemListSchema(
  tools.map((tool, index) => ({
    position: index + 1,
    name: tool.name,
    url: `https://aibesttool.com/ai/${tool.slug}`,
  })),
  'AI Tools Directory'
);
```

#### For Article/Blog Pages

```typescript
import { generateArticleSchema } from '@/lib/seo';

const articleSchema = generateArticleSchema({
  title: article.title,
  description: article.description,
  url: `https://aibesttool.com/blog/${article.slug}`,
  image: article.image,
  datePublished: article.publishedAt,
  dateModified: article.updatedAt,
  author: article.author,
});
```

### 5. Optimize Images

All images MUST have descriptive alt text:

```typescript
import Image from 'next/image';

<Image
  src="/images/tool-screenshot.png"
  alt="ChatGPT interface showing a conversation about AI tools"
  width={1200}
  height={630}
  loading="lazy" // For below-the-fold images
/>
```

**Image Optimization Guidelines:**
- Use WebP format with fallbacks
- Include descriptive alt text (not just tool name)
- Use lazy loading for below-the-fold images
- Optimize dimensions (1200x630 for OG images)
- Use descriptive filenames

### 6. Internal Linking

Include relevant internal links to improve site structure:

```typescript
import Link from 'next/link';

<Link href="/explore">Explore more AI tools</Link>
<Link href="/ai/chatgpt">Learn about ChatGPT</Link>
```

**Internal Linking Best Practices:**
- Link to related content
- Use descriptive anchor text
- Ensure all pages are reachable within 3 clicks from homepage
- Add related tools/content sections

## Page Type Specific Guidelines

### Homepage

**Required Elements:**
- Organization schema
- WebSite schema with search action
- Comprehensive meta description
- Social media images
- Links to main sections

**Example:**
```typescript
const orgSchema = generateOrganizationSchema({
  name: 'AI Best Tool',
  url: 'https://aibesttool.com',
  logo: 'https://aibesttool.com/images/aibesttool.png',
  socialLinks: [
    'https://twitter.com/aibesttool',
    'https://facebook.com/aibesttool',
  ],
});

const websiteSchema = generateWebSiteSchema();
```

### Tool Detail Pages

**Required Elements:**
- SoftwareApplication schema
- BreadcrumbList schema
- Tool-specific metadata
- Related tools section
- User ratings display
- Pricing information

**Title Format:** `{Tool Name} - {Category} AI Tool | AI Best Tool`

**Description Format:** Include tool name, category, key features, and pricing

### Listing/Category Pages

**Required Elements:**
- ItemList schema
- Category-specific metadata
- Filter/sort options
- Pagination with proper rel="next"/"prev"
- Breadcrumb navigation

**Title Format:** `{Category} AI Tools | AI Best Tool`

### Blog/Article Pages

**Required Elements:**
- Article schema
- Author information
- Published/modified dates
- Related articles
- Social sharing buttons

## Metadata Optimization

### Title Optimization

**Rules:**
- Length: 30-60 characters
- Include primary keyword near the beginning
- Include brand name at the end
- Be descriptive and compelling
- Avoid keyword stuffing

**Good Examples:**
- ✅ "ChatGPT - AI Chatbot Tool | AI Best Tool"
- ✅ "Explore 1000+ AI Tools | AI Best Tool"
- ✅ "Image Generation AI Tools | AI Best Tool"

**Bad Examples:**
- ❌ "AI Tool" (too short, not descriptive)
- ❌ "The Best AI Tools for Chatbots, Image Generation, Writing, Coding, and More" (too long)
- ❌ "AI Tools AI Best AI Software AI Applications" (keyword stuffing)

### Description Optimization

**Rules:**
- Length: 120-160 characters
- Include primary and secondary keywords naturally
- Include a call-to-action
- Be compelling and accurate
- Avoid repetition from title

**Good Examples:**
- ✅ "Discover ChatGPT, the advanced AI chatbot for conversations, writing, and coding. Free and premium plans available. Try it today!"
- ✅ "Browse our curated directory of 1000+ AI tools. Find the perfect AI solution for productivity, creativity, and business needs."

**Bad Examples:**
- ❌ "AI tools" (too short)
- ❌ "This is a page about AI tools where you can find AI tools and learn about AI tools and use AI tools" (repetitive)
- ❌ "Lorem ipsum dolor sit amet..." (not descriptive)

### Canonical URLs

**Rules:**
- Always include canonical URL
- Use absolute URLs
- No trailing slashes (except root)
- Match the actual page URL
- Include locale in path

**Examples:**
```typescript
canonical: '/explore' // ✅ Correct
canonical: '/explore/' // ❌ Trailing slash
canonical: 'explore' // ❌ Missing leading slash
```

## Validation and Testing

### Before Deploying

1. **Check Metadata in Browser DevTools:**
```javascript
// Open console and run:
document.querySelector('title')?.textContent
document.querySelector('meta[name="description"]')?.content
document.querySelector('link[rel="canonical"]')?.href
```

2. **Validate Structured Data:**
- Use Google Rich Results Test: https://search.google.com/test/rich-results
- Paste your page URL or HTML
- Fix any errors or warnings

3. **Test Social Sharing:**
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/

4. **Check Hreflang Tags:**
```javascript
document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(link => {
  console.log(`${link.getAttribute('hreflang')}: ${link.href}`);
});
```

5. **Run SEO Audit Script:**
```bash
npx tsx scripts/seo-audit-quick.ts
```

### After Deploying

1. **Submit to Google Search Console:**
   - Request indexing for new pages
   - Check for crawl errors
   - Verify hreflang implementation

2. **Monitor Performance:**
   - Check Google Search Console for impressions/clicks
   - Monitor Core Web Vitals
   - Track ranking for target keywords

## Common Mistakes to Avoid

### ❌ Missing Metadata
```typescript
// BAD: No metadata
export default function Page() {
  return <div>Content</div>;
}
```

```typescript
// GOOD: Proper metadata
export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({...});
}

export default function Page() {
  return <div>Content</div>;
}
```

### ❌ Duplicate Titles/Descriptions
```typescript
// BAD: Same title for all tools
title: 'AI Tool | AI Best Tool'

// GOOD: Unique title for each tool
title: `${tool.name} - ${tool.category} AI Tool | AI Best Tool`
```

### ❌ Missing Alt Text
```typescript
// BAD
<img src="/tool.png" />

// GOOD
<Image src="/tool.png" alt="ChatGPT interface showing conversation" />
```

### ❌ Incorrect Canonical URLs
```typescript
// BAD: Relative URL
canonical: 'explore'

// GOOD: Absolute path
canonical: '/explore'
```

### ❌ Missing Structured Data
```typescript
// BAD: No structured data on tool page
export default function ToolPage() {
  return <div>{tool.name}</div>;
}

// GOOD: Include appropriate schemas
export default function ToolPage() {
  const schema = generateSoftwareSchema(tool);
  return (
    <>
      <StructuredData data={schema} />
      <div>{tool.name}</div>
    </>
  );
}
```

## Resources

### Documentation
- [SEO Components README](../components/seo/README.md)
- [SEO Components Examples](../components/seo/EXAMPLES.md)
- [SEO Utilities README](../lib/seo/README.md)
- [Hreflang Implementation Guide](./HREFLANG_IMPLEMENTATION.md)
- [Image Optimization Guide](./IMAGE_OPTIMIZATION.md)

### Validation Tools
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Schema.org Validator](https://validator.schema.org/)

### Testing Scripts
- `scripts/seo-audit-quick.ts` - Quick SEO audit
- `scripts/validate-seo-complete.ts` - Comprehensive validation
- `scripts/verify-hreflang.ts` - Hreflang validation
- `scripts/verify-software-schema-rendering.ts` - Schema validation

## Getting Help

If you encounter issues:

1. Check existing documentation in `/docs` and `/components/seo`
2. Review examples in `components/seo/EXAMPLES.md`
3. Run validation scripts to identify specific issues
4. Check Google Search Console for crawl errors
5. Review the SEO audit report at `.kiro/specs/seo-optimization/FINAL_SEO_AUDIT.md`

## Maintenance

### Regular Tasks

**Weekly:**
- Check Google Search Console for errors
- Monitor Core Web Vitals
- Review new page metadata

**Monthly:**
- Run comprehensive SEO audit
- Update outdated content
- Check for broken links
- Review and update structured data

**Quarterly:**
- Analyze search performance
- Update SEO strategy based on data
- Review and optimize underperforming pages
- Update social media images if needed
