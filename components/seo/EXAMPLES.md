# SEO Components Usage Examples

## Example 1: Basic Page with SEO Metadata

```typescript
// app/[locale]/about/page.tsx
import { Metadata } from 'next';
import { generateSEOMetadata } from '@/components/seo';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'About Us - AI Best Tool',
    description: 'Learn about AI Best Tool, your trusted source for discovering and exploring the best AI-powered tools and applications for every need.',
    canonical: '/about',
    locale: params.locale,
  });
}

export default function AboutPage() {
  return (
    <div>
      <h1>About Us</h1>
      <p>Welcome to AI Best Tool...</p>
    </div>
  );
}
```

## Example 2: Tool Detail Page with Structured Data

```typescript
// app/[locale]/ai/[toolName]/page.tsx
import { Metadata } from 'next';
import { generateSEOMetadata, StructuredData } from '@/components/seo';
import { generateSoftwareSchema, generateBreadcrumbSchema } from '@/lib/seo';

interface Props {
  params: { locale: string; toolName: string };
}

// Fetch tool data
async function getToolData(toolName: string) {
  // Your data fetching logic here
  return {
    name: 'ChatGPT',
    description: 'ChatGPT is an advanced AI chatbot that can help you with writing, coding, learning, and more.',
    image: '/images/chatgpt.png',
    category: 'Chatbot',
    tags: ['AI', 'Chatbot', 'NLP'],
    pricing: { type: 'freemium' as const },
    rating: { value: 4.8, count: 1250 },
    url: 'https://aibesttool.com/ai/chatgpt',
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = await getToolData(params.toolName);

  return generateSEOMetadata({
    title: `${tool.name} - ${tool.category} AI Tool`,
    description: tool.description,
    canonical: `/ai/${params.toolName}`,
    image: tool.image,
    locale: params.locale,
    keywords: tool.tags,
  });
}

export default async function ToolPage({ params }: Props) {
  const tool = await getToolData(params.toolName);

  // Generate structured data
  const softwareSchema = generateSoftwareSchema(tool);
  
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://aibesttool.com' },
    { name: 'AI Tools', url: 'https://aibesttool.com/explore' },
    { name: tool.name, url: tool.url },
  ]);

  return (
    <>
      <StructuredData data={[softwareSchema, breadcrumbSchema]} />
      
      <div>
        <h1>{tool.name}</h1>
        <p>{tool.description}</p>
        {/* Rest of your page content */}
      </div>
    </>
  );
}
```

## Example 3: Homepage with Organization Schema

```typescript
// app/[locale]/page.tsx
import { Metadata } from 'next';
import { generateSEOMetadata, StructuredData } from '@/components/seo';
import { generateOrganizationSchema, generateWebSiteSchema } from '@/lib/seo';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'AI Best Tool - Discover the Best AI Tools',
    description: 'Discover and explore the best AI tools for your needs. Browse our curated directory of AI-powered software, applications, and services.',
    canonical: '/',
    locale: params.locale,
  });
}

export default function HomePage() {
  const orgSchema = generateOrganizationSchema({
    name: 'AI Best Tool',
    url: 'https://aibesttool.com',
    logo: 'https://aibesttool.com/images/aibesttool.png',
    description: 'Your trusted source for discovering the best AI tools',
    socialLinks: [
      'https://twitter.com/aibesttool',
      'https://facebook.com/aibesttool',
    ],
  });

  const websiteSchema = generateWebSiteSchema();

  return (
    <>
      <StructuredData data={[orgSchema, websiteSchema]} />
      
      <div>
        <h1>Welcome to AI Best Tool</h1>
        {/* Rest of your homepage content */}
      </div>
    </>
  );
}
```

## Example 4: Explore Page with Custom Social Metadata

```typescript
// app/[locale]/explore/page.tsx
import { Metadata } from 'next';
import { generateSEOMetadata } from '@/components/seo';
import { generateSocialMetadata } from '@/components/seo';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const baseMetadata = generateSEOMetadata({
    title: 'Explore AI Tools',
    description: 'Browse our comprehensive directory of AI tools. Find the perfect AI-powered solution for your productivity, creativity, and business needs.',
    canonical: '/explore',
    locale: params.locale,
  });

  // Add custom social metadata
  const socialMetadata = generateSocialMetadata({
    title: 'Explore 1000+ AI Tools | AI Best Tool',
    description: 'Discover the largest directory of AI tools. From chatbots to image generators, find the perfect AI solution for your needs.',
    image: '/images/explore-og.png',
    url: 'https://aibesttool.com/explore',
    twitterCard: 'summary_large_image',
  });

  return {
    ...baseMetadata,
    ...socialMetadata,
  };
}

export default function ExplorePage() {
  return (
    <div>
      <h1>Explore AI Tools</h1>
      {/* Tool listing */}
    </div>
  );
}
```

## Example 5: Using with Internationalization (Hreflang Tags)

```typescript
// app/[locale]/tools/[category]/page.tsx
import { Metadata } from 'next';
import { generateSEOMetadataWithLocales, generateHreflangMetadata } from '@/components/seo';

interface Props {
  params: { locale: string; category: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categoryName = params.category.replace('-', ' ');
  
  // Method 1: Automatically generates alternate locale links
  return generateSEOMetadataWithLocales(
    {
      title: `${categoryName} AI Tools`,
      description: `Discover the best ${categoryName} AI tools. Compare features, pricing, and reviews to find the perfect solution.`,
      locale: params.locale,
    },
    `/tools/${params.category}` // Path without locale prefix
  );
}

export default function CategoryPage({ params }: Props) {
  return (
    <div>
      <h1>{params.category} AI Tools</h1>
      {/* Category content */}
    </div>
  );
}
```

## Example 5b: Hreflang Tags with Manual Metadata

```typescript
// app/[locale]/explore/page.tsx
import { Metadata } from 'next';
import { generateHreflangMetadata } from '@/components/seo';

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Generate base metadata
  const baseMetadata: Metadata = {
    title: 'Explore AI Tools | AI Best Tool',
    description: 'Browse our comprehensive directory of AI tools. Find the perfect AI-powered solution for your needs.',
    openGraph: {
      title: 'Explore AI Tools',
      description: 'Discover 1000+ AI tools in our directory',
      images: ['/images/explore-og.png'],
    },
  };

  // Add hreflang tags for all locales
  const hreflangMetadata = generateHreflangMetadata(
    params.locale,
    '/explore' // Path without locale prefix
  );

  return {
    ...baseMetadata,
    ...hreflangMetadata,
  };
}

export default function ExplorePage() {
  return (
    <div>
      <h1>Explore AI Tools</h1>
      {/* Tool listing */}
    </div>
  );
}
```

This generates the following hreflang tags:
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

## Example 6: Server Component with Structured Data

```typescript
// app/[locale]/blog/[slug]/page.tsx
import { Metadata } from 'next';
import { generateSEOMetadata, StructuredDataServer } from '@/components/seo';
import { generateArticleSchema } from '@/lib/seo';

interface Props {
  params: { locale: string; slug: string };
}

async function getArticle(slug: string) {
  return {
    title: 'How to Choose the Right AI Tool',
    description: 'A comprehensive guide to selecting the perfect AI tool for your needs.',
    image: '/images/blog/ai-tools-guide.png',
    publishedTime: '2024-01-15T10:00:00Z',
    modifiedTime: '2024-01-20T15:30:00Z',
    author: 'John Doe',
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(params.slug);

  return generateSEOMetadata({
    title: article.title,
    description: article.description,
    canonical: `/blog/${params.slug}`,
    image: article.image,
    type: 'article',
    locale: params.locale,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const article = await getArticle(params.slug);

  const articleSchema = generateArticleSchema({
    title: article.title,
    description: article.description,
    url: `https://aibesttool.com/blog/${params.slug}`,
    image: `https://aibesttool.com${article.image}`,
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime,
    author: article.author,
  });

  return (
    <>
      <StructuredDataServer data={articleSchema} />
      
      <article>
        <h1>{article.title}</h1>
        <p>{article.description}</p>
        {/* Article content */}
      </article>
    </>
  );
}
```

## Testing Your Implementation

### 1. Validate Structured Data
Use Google's Rich Results Test:
```
https://search.google.com/test/rich-results
```

### 2. Test Social Sharing
- **Facebook**: https://developers.facebook.com/tools/debug/
- **Twitter**: https://cards-dev.twitter.com/validator
- **LinkedIn**: https://www.linkedin.com/post-inspector/

### 3. Check Metadata in Browser
```javascript
// Open browser console and run:
document.querySelector('meta[property="og:title"]')?.content
document.querySelector('meta[name="description"]')?.content
document.querySelector('script[type="application/ld+json"]')?.textContent
```

### 4. Verify Canonical URLs
```javascript
document.querySelector('link[rel="canonical"]')?.href
```

### 5. Verify Hreflang Tags
```javascript
// Check all hreflang tags
document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(link => {
  console.log(`${link.getAttribute('hreflang')}: ${link.href}`);
});

// Verify x-default exists
const xDefault = document.querySelector('link[rel="alternate"][hreflang="x-default"]');
console.log('x-default:', xDefault?.href);
```

### 6. Test with Google Search Console
After deploying:
1. Go to Google Search Console
2. Navigate to "International Targeting" → "Language"
3. Verify hreflang tags are detected correctly
4. Check for any hreflang errors
