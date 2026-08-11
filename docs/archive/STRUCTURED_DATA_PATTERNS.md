# Structured Data Patterns

This document provides comprehensive patterns and examples for implementing Schema.org structured data across different page types.

## Overview

Structured data helps search engines understand your content and display rich results in search. We use JSON-LD format for all structured data implementation.

## Available Schema Types

Our implementation supports the following Schema.org types:

1. **Organization** - For company/site information
2. **WebSite** - For the main website with search functionality
3. **SoftwareApplication** - For AI tools and applications
4. **BreadcrumbList** - For navigation hierarchy
5. **ItemList** - For listing pages
6. **Article** - For blog posts and articles
7. **FAQPage** - For FAQ sections

## Pattern 1: Organization Schema

**When to Use:** Homepage and main site pages

**Purpose:** Establishes your organization's identity in search engines

**Required Fields:**
- `@type`: "Organization"
- `name`: Organization name
- `url`: Organization website URL
- `logo`: Organization logo URL

**Optional Fields:**
- `description`: Brief description of the organization
- `sameAs`: Array of social media profile URLs
- `contactPoint`: Contact information

### Implementation

```typescript
import { generateOrganizationSchema } from '@/lib/seo';
import { StructuredData } from '@/components/seo';

export default function HomePage() {
  const orgSchema = generateOrganizationSchema({
    name: 'AI Best Tool',
    url: 'https://aibesttool.com',
    logo: 'https://aibesttool.com/images/aibesttool.png',
    description: 'Your trusted source for discovering the best AI tools',
    socialLinks: [
      'https://twitter.com/aibesttool',
      'https://facebook.com/aibesttool',
      'https://linkedin.com/company/aibesttool',
    ],
  });

  return (
    <>
      <StructuredData data={orgSchema} />
      {/* Page content */}
    </>
  );
}
```

### Generated Output

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "AI Best Tool",
  "url": "https://aibesttool.com",
  "logo": "https://aibesttool.com/images/aibesttool.png",
  "description": "Your trusted source for discovering the best AI tools",
  "sameAs": [
    "https://twitter.com/aibesttool",
    "https://facebook.com/aibesttool",
    "https://linkedin.com/company/aibesttool"
  ]
}
```

## Pattern 2: WebSite Schema

**When to Use:** Homepage

**Purpose:** Enables search box in Google search results

**Required Fields:**
- `@type`: "WebSite"
- `name`: Website name
- `url`: Website URL
- `potentialAction`: Search action configuration

### Implementation

```typescript
import { generateWebSiteSchema } from '@/lib/seo';

export default function HomePage() {
  const websiteSchema = generateWebSiteSchema();

  return (
    <>
      <StructuredData data={websiteSchema} />
      {/* Page content */}
    </>
  );
}
```

### Generated Output

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "AI Best Tool",
  "url": "https://aibesttool.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://aibesttool.com/explore?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

## Pattern 3: SoftwareApplication Schema

**When to Use:** Tool detail pages, product pages

**Purpose:** Displays rich results with ratings, pricing, and categories

**Required Fields:**
- `@type`: "SoftwareApplication"
- `name`: Software name
- `description`: Software description
- `url`: Software page URL
- `applicationCategory`: Category (e.g., "BusinessApplication")

**Optional Fields:**
- `image`: Software logo/screenshot
- `offers`: Pricing information
- `aggregateRating`: User ratings
- `operatingSystem`: Supported platforms

### Implementation

```typescript
import { generateSoftwareSchema } from '@/lib/seo';
import { StructuredData } from '@/components/seo';

export default async function ToolPage({ params }: Props) {
  const tool = await getToolData(params.toolName);

  const softwareSchema = generateSoftwareSchema({
    name: tool.name,
    description: tool.description,
    url: `https://aibesttool.com/ai/${params.toolName}`,
    image: `https://aibesttool.com${tool.image}`,
    category: tool.category,
    tags: tool.tags,
    pricing: {
      type: 'freemium',
      price: 20,
      currency: 'USD',
    },
    rating: {
      value: 4.8,
      count: 1250,
    },
  });

  return (
    <>
      <StructuredData data={softwareSchema} />
      {/* Page content */}
    </>
  );
}
```

### Generated Output

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ChatGPT",
  "description": "Advanced AI chatbot for conversations, writing, and coding",
  "url": "https://aibesttool.com/ai/chatgpt",
  "image": "https://aibesttool.com/images/chatgpt.png",
  "applicationCategory": "BusinessApplication",
  "keywords": "AI, Chatbot, NLP, Writing Assistant",
  "offers": {
    "@type": "Offer",
    "price": "20",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "1250",
    "bestRating": "5",
    "worstRating": "1"
  }
}
```

### Pricing Variations

**Free Software:**
```typescript
pricing: {
  type: 'free',
}
```

**Paid Software:**
```typescript
pricing: {
  type: 'paid',
  price: 29.99,
  currency: 'USD',
}
```

**Freemium Software:**
```typescript
pricing: {
  type: 'freemium',
  price: 19.99,
  currency: 'USD',
}
```

## Pattern 4: BreadcrumbList Schema

**When to Use:** All pages with navigation hierarchy (except homepage)

**Purpose:** Displays breadcrumb navigation in search results

**Required Fields:**
- `@type`: "BreadcrumbList"
- `itemListElement`: Array of breadcrumb items with position, name, and URL

### Implementation

```typescript
import { generateBreadcrumbSchema } from '@/lib/seo';

export default function ToolPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://aibesttool.com' },
    { name: 'AI Tools', url: 'https://aibesttool.com/explore' },
    { name: 'Chatbots', url: 'https://aibesttool.com/explore?category=chatbot' },
    { name: 'ChatGPT', url: 'https://aibesttool.com/ai/chatgpt' },
  ]);

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      {/* Page content */}
    </>
  );
}
```

### Generated Output

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://aibesttool.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "AI Tools",
      "item": "https://aibesttool.com/explore"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Chatbots",
      "item": "https://aibesttool.com/explore?category=chatbot"
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "ChatGPT",
      "item": "https://aibesttool.com/ai/chatgpt"
    }
  ]
}
```

## Pattern 5: ItemList Schema

**When to Use:** Listing pages, category pages, search results

**Purpose:** Helps search engines understand list structure and items

**Required Fields:**
- `@type`: "ItemList"
- `itemListElement`: Array of list items with position, name, and URL
- `name`: List name/title

### Implementation

```typescript
import { generateItemListSchema } from '@/lib/seo';

export default async function ExplorePage() {
  const tools = await getTools();

  const listSchema = generateItemListSchema(
    tools.map((tool, index) => ({
      position: index + 1,
      name: tool.name,
      url: `https://aibesttool.com/ai/${tool.slug}`,
      image: tool.image,
    })),
    'AI Tools Directory'
  );

  return (
    <>
      <StructuredData data={listSchema} />
      {/* Page content */}
    </>
  );
}
```

### Generated Output

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "AI Tools Directory",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "ChatGPT",
      "url": "https://aibesttool.com/ai/chatgpt"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Midjourney",
      "url": "https://aibesttool.com/ai/midjourney"
    }
  ]
}
```

## Pattern 6: Article Schema

**When to Use:** Blog posts, articles, news content

**Purpose:** Enables article rich results with author, date, and image

**Required Fields:**
- `@type`: "Article"
- `headline`: Article title
- `description`: Article description
- `url`: Article URL
- `datePublished`: Publication date
- `author`: Author information

**Optional Fields:**
- `dateModified`: Last modification date
- `image`: Article image
- `publisher`: Publisher information

### Implementation

```typescript
import { generateArticleSchema } from '@/lib/seo';

export default async function BlogPost({ params }: Props) {
  const article = await getArticle(params.slug);

  const articleSchema = generateArticleSchema({
    title: article.title,
    description: article.description,
    url: `https://aibesttool.com/blog/${params.slug}`,
    image: `https://aibesttool.com${article.image}`,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: article.author,
  });

  return (
    <>
      <StructuredData data={articleSchema} />
      {/* Article content */}
    </>
  );
}
```

### Generated Output

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Choose the Right AI Tool",
  "description": "A comprehensive guide to selecting the perfect AI tool",
  "url": "https://aibesttool.com/blog/choose-ai-tool",
  "image": "https://aibesttool.com/images/blog/ai-tools-guide.png",
  "datePublished": "2024-01-15T10:00:00Z",
  "dateModified": "2024-01-20T15:30:00Z",
  "author": {
    "@type": "Person",
    "name": "John Doe"
  },
  "publisher": {
    "@type": "Organization",
    "name": "AI Best Tool",
    "logo": {
      "@type": "ImageObject",
      "url": "https://aibesttool.com/images/aibesttool.png"
    }
  }
}
```

## Pattern 7: FAQPage Schema

**When to Use:** FAQ pages, pages with Q&A sections

**Purpose:** Displays FAQ rich results in search

**Required Fields:**
- `@type`: "FAQPage"
- `mainEntity`: Array of Question objects with acceptedAnswer

### Implementation

```typescript
import { generateFAQSchema } from '@/lib/seo';

export default function FAQPage() {
  const faqSchema = generateFAQSchema([
    {
      question: 'What is AI Best Tool?',
      answer: 'AI Best Tool is a comprehensive directory of AI-powered tools and applications. We help users discover and compare the best AI solutions for their needs.',
    },
    {
      question: 'How do I submit a tool?',
      answer: 'You can submit a tool by visiting our submission page and filling out the form with your tool information. Our team will review and add it to the directory.',
    },
    {
      question: 'Is AI Best Tool free to use?',
      answer: 'Yes, AI Best Tool is completely free to use. You can browse, search, and discover AI tools without any cost.',
    },
  ]);

  return (
    <>
      <StructuredData data={faqSchema} />
      {/* FAQ content */}
    </>
  );
}
```

### Generated Output

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is AI Best Tool?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AI Best Tool is a comprehensive directory of AI-powered tools and applications. We help users discover and compare the best AI solutions for their needs."
      }
    },
    {
      "@type": "Question",
      "name": "How do I submit a tool?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can submit a tool by visiting our submission page and filling out the form with your tool information. Our team will review and add it to the directory."
      }
    }
  ]
}
```

## Combining Multiple Schemas

You can include multiple schemas on a single page:

```typescript
import { StructuredData } from '@/components/seo';

export default function ToolPage() {
  const softwareSchema = generateSoftwareSchema({...});
  const breadcrumbSchema = generateBreadcrumbSchema([...]);
  const faqSchema = generateFAQSchema([...]);

  return (
    <>
      <StructuredData data={[softwareSchema, breadcrumbSchema, faqSchema]} />
      {/* Page content */}
    </>
  );
}
```

## Best Practices

### 1. Always Include Required Fields

Missing required fields will cause validation errors:

```typescript
// ❌ BAD: Missing required fields
const schema = generateSoftwareSchema({
  name: 'ChatGPT',
  // Missing description, url, category
});

// ✅ GOOD: All required fields present
const schema = generateSoftwareSchema({
  name: 'ChatGPT',
  description: 'AI chatbot',
  url: 'https://aibesttool.com/ai/chatgpt',
  category: 'AI Assistant',
});
```

### 2. Use Absolute URLs

Always use absolute URLs in structured data:

```typescript
// ❌ BAD: Relative URL
url: '/ai/chatgpt'

// ✅ GOOD: Absolute URL
url: 'https://aibesttool.com/ai/chatgpt'
```

### 3. Validate Before Deploying

Always validate structured data before deploying:

```bash
# Run validation script
npx tsx scripts/verify-software-schema-rendering.ts

# Or use Google's Rich Results Test
# https://search.google.com/test/rich-results
```

### 4. Keep Data Accurate

Ensure structured data matches visible page content:

```typescript
// ❌ BAD: Structured data doesn't match page
const schema = generateSoftwareSchema({
  name: 'ChatGPT',
  rating: { value: 5.0, count: 10000 }, // Inflated rating
});

// ✅ GOOD: Accurate data
const schema = generateSoftwareSchema({
  name: 'ChatGPT',
  rating: { value: 4.8, count: 1250 }, // Actual rating from database
});
```

### 5. Use Specific Schema Types

Use the most specific schema type available:

```typescript
// ❌ BAD: Generic Product schema for software
const schema = generateProductSchema({...});

// ✅ GOOD: Specific SoftwareApplication schema
const schema = generateSoftwareSchema({...});
```

## Common Patterns by Page Type

### Homepage
```typescript
- Organization schema (required)
- WebSite schema with search action (required)
```

### Tool Detail Page
```typescript
- SoftwareApplication schema (required)
- BreadcrumbList schema (recommended)
- FAQPage schema (if FAQ section exists)
```

### Category/Listing Page
```typescript
- ItemList schema (required)
- BreadcrumbList schema (recommended)
```

### Blog Post
```typescript
- Article schema (required)
- BreadcrumbList schema (recommended)
```

### FAQ Page
```typescript
- FAQPage schema (required)
- BreadcrumbList schema (recommended)
```

## Validation and Testing

### 1. Google Rich Results Test

Test individual pages:
```
https://search.google.com/test/rich-results
```

### 2. Schema.org Validator

Validate JSON-LD syntax:
```
https://validator.schema.org/
```

### 3. Automated Testing

Run our validation scripts:

```bash
# Verify organization schema
npx tsx scripts/verify-organization-schema.ts

# Verify software schema
npx tsx scripts/verify-software-schema-rendering.ts

# Verify breadcrumb schema
npx tsx scripts/verify-breadcrumb-schema.ts

# Complete SEO validation
npx tsx scripts/validate-seo-complete.ts
```

### 4. Browser Console Testing

Check structured data in browser:

```javascript
// Get all JSON-LD scripts
const scripts = document.querySelectorAll('script[type="application/ld+json"]');
scripts.forEach((script, index) => {
  console.log(`Schema ${index + 1}:`, JSON.parse(script.textContent));
});
```

## Troubleshooting

### Schema Not Appearing in Search Results

**Possible Causes:**
1. Page not indexed yet (wait 1-2 weeks)
2. Validation errors in structured data
3. Content doesn't match structured data
4. Page blocked by robots.txt

**Solutions:**
1. Submit URL to Google Search Console
2. Run validation tests
3. Ensure data accuracy
4. Check robots.txt configuration

### Validation Errors

**Common Errors:**

1. **Missing Required Field**
   ```
   Error: Missing required field "description"
   Solution: Add all required fields to schema
   ```

2. **Invalid URL Format**
   ```
   Error: Invalid URL format
   Solution: Use absolute URLs (https://...)
   ```

3. **Invalid Date Format**
   ```
   Error: Invalid date format
   Solution: Use ISO 8601 format (2024-01-15T10:00:00Z)
   ```

4. **Invalid Rating Value**
   ```
   Error: Rating value must be between 1 and 5
   Solution: Ensure rating is within valid range
   ```

## Resources

### Documentation
- [Schema.org Documentation](https://schema.org/)
- [Google Search Central - Structured Data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [SEO Components README](../components/seo/README.md)
- [SEO Utilities README](../lib/seo/README.md)

### Validation Tools
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

### Internal Scripts
- `scripts/verify-organization-schema.ts`
- `scripts/verify-software-schema-rendering.ts`
- `scripts/verify-breadcrumb-schema.ts`
- `scripts/validate-seo-complete.ts`
