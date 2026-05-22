# SEO Content Checklist

A comprehensive checklist for content creators to ensure all content meets SEO best practices.

## Quick Reference

Use this checklist before publishing any new page or content:

- [ ] Page title is 30-60 characters
- [ ] Meta description is 120-160 characters
- [ ] Canonical URL is set
- [ ] All images have descriptive alt text
- [ ] Structured data is included
- [ ] Internal links are present
- [ ] Content is unique and valuable
- [ ] Keywords are used naturally
- [ ] Mobile-friendly layout
- [ ] Page loads quickly

## Detailed Checklist

### 1. Page Metadata

#### Title Tag
- [ ] Title is between 30-60 characters
- [ ] Primary keyword is near the beginning
- [ ] Brand name is included (usually at the end)
- [ ] Title is unique across the site
- [ ] Title accurately describes page content
- [ ] Title is compelling and click-worthy

**Examples:**
- ✅ "ChatGPT - AI Chatbot Tool | AI Best Tool" (48 chars)
- ✅ "Explore 1000+ AI Tools | AI Best Tool" (38 chars)
- ❌ "AI Tool" (7 chars - too short)
- ❌ "The Ultimate Complete Guide to AI Tools for Business, Personal Use, and Everything In Between" (93 chars - too long)

#### Meta Description
- [ ] Description is between 120-160 characters
- [ ] Includes primary and secondary keywords naturally
- [ ] Contains a call-to-action
- [ ] Accurately summarizes page content
- [ ] Is unique across the site
- [ ] Doesn't duplicate title text

**Examples:**
- ✅ "Discover ChatGPT, the advanced AI chatbot for conversations, writing, and coding. Free and premium plans available. Try it today!" (132 chars)
- ✅ "Browse our curated directory of 1000+ AI tools. Find the perfect AI solution for productivity, creativity, and business needs." (127 chars)
- ❌ "AI tools" (8 chars - too short)
- ❌ "This page contains information about AI tools and you can find AI tools here and learn about AI tools and use AI tools for your needs" (135 chars - repetitive)

#### Canonical URL
- [ ] Canonical URL is set
- [ ] URL uses absolute path format
- [ ] URL matches the actual page URL
- [ ] No trailing slash (except for root)
- [ ] Includes locale in path for multilingual sites

**Examples:**
- ✅ `/explore`
- ✅ `/ai/chatgpt`
- ❌ `/explore/` (trailing slash)
- ❌ `explore` (missing leading slash)

### 2. Internationalization (Multilingual Sites)

#### Hreflang Tags
- [ ] Hreflang tags are present for all language versions
- [ ] x-default tag points to default language (English)
- [ ] All hreflang URLs are absolute
- [ ] Bidirectional relationships exist (if A links to B, B links to A)
- [ ] Each language version has unique translated content

**Verification:**
```javascript
// Run in browser console
document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(link => {
  console.log(`${link.getAttribute('hreflang')}: ${link.href}`);
});
```

### 3. Content Quality

#### Text Content
- [ ] Content is at least 300 words (for main pages)
- [ ] Content is unique (not copied from other sites)
- [ ] Content provides value to users
- [ ] Keywords are used naturally (not stuffed)
- [ ] Content is well-structured with headings
- [ ] Grammar and spelling are correct
- [ ] Content is up-to-date and accurate

#### Headings
- [ ] Page has one H1 tag
- [ ] H1 contains primary keyword
- [ ] Heading hierarchy is logical (H1 → H2 → H3)
- [ ] Headings are descriptive
- [ ] Headings break up content effectively

**Example Structure:**
```html
<h1>ChatGPT - AI Chatbot Tool</h1>
  <h2>What is ChatGPT?</h2>
  <h2>Key Features</h2>
    <h3>Natural Language Processing</h3>
    <h3>Code Generation</h3>
  <h2>Pricing</h2>
  <h2>User Reviews</h2>
```

#### Keywords
- [ ] Primary keyword identified
- [ ] Primary keyword in title
- [ ] Primary keyword in H1
- [ ] Primary keyword in first paragraph
- [ ] Primary keyword in meta description
- [ ] Secondary keywords used naturally
- [ ] Keyword density is 1-2% (not stuffed)

### 4. Images

#### Image Optimization
- [ ] All images have alt text
- [ ] Alt text is descriptive (not just filename)
- [ ] Alt text includes relevant keywords naturally
- [ ] Images are compressed/optimized
- [ ] WebP format used where possible
- [ ] Image dimensions are appropriate
- [ ] Lazy loading enabled for below-fold images

**Alt Text Examples:**
- ✅ "ChatGPT interface showing a conversation about AI tools with code examples"
- ✅ "Midjourney AI-generated image of a futuristic cityscape at sunset"
- ❌ "image1.png"
- ❌ "screenshot"
- ❌ "" (empty)

#### Social Media Images
- [ ] Open Graph image specified (1200x630px)
- [ ] Twitter Card image specified (1200x600px)
- [ ] Images are high quality
- [ ] Images are relevant to content
- [ ] Images include branding if appropriate

### 5. Structured Data

#### Required Schemas
- [ ] Appropriate schema type selected
- [ ] All required fields included
- [ ] Data matches visible page content
- [ ] URLs are absolute
- [ ] Dates use ISO 8601 format
- [ ] Schema validates without errors

#### Schema by Page Type

**Homepage:**
- [ ] Organization schema
- [ ] WebSite schema with search action

**Tool/Product Pages:**
- [ ] SoftwareApplication schema
- [ ] BreadcrumbList schema
- [ ] Ratings included (if available)
- [ ] Pricing information included

**Listing Pages:**
- [ ] ItemList schema
- [ ] BreadcrumbList schema

**Blog Posts:**
- [ ] Article schema
- [ ] Author information
- [ ] Published/modified dates
- [ ] BreadcrumbList schema

**FAQ Pages:**
- [ ] FAQPage schema
- [ ] All Q&A pairs included

### 6. Internal Linking

#### Link Structure
- [ ] At least 2-3 internal links per page
- [ ] Links use descriptive anchor text
- [ ] Links are relevant to content
- [ ] No broken links
- [ ] Important pages linked from multiple locations
- [ ] All pages reachable within 3 clicks from homepage

**Anchor Text Examples:**
- ✅ "Explore our AI chatbot tools"
- ✅ "Learn more about ChatGPT"
- ❌ "Click here"
- ❌ "Read more"
- ❌ "Link"

#### Related Content
- [ ] Related tools/articles section included
- [ ] Breadcrumb navigation present
- [ ] Category/tag links included
- [ ] "See also" or "You might like" sections

### 7. Technical SEO

#### Page Performance
- [ ] Page loads in under 3 seconds
- [ ] Core Web Vitals pass
- [ ] Images are lazy loaded
- [ ] No render-blocking resources
- [ ] Mobile-friendly design

**Check Performance:**
```bash
# Run performance audit
npx tsx scripts/performance-audit.ts

# Check Core Web Vitals
npx tsx scripts/verify-core-web-vitals.ts
```

#### URL Structure
- [ ] URL is descriptive
- [ ] URL uses hyphens (not underscores)
- [ ] URL is lowercase
- [ ] URL is short and readable
- [ ] URL includes keywords

**URL Examples:**
- ✅ `/ai/chatgpt`
- ✅ `/explore/image-generation-tools`
- ❌ `/page?id=123`
- ❌ `/AI_Tools_Page`
- ❌ `/p/a/g/e/with/too/many/levels`

#### Mobile Optimization
- [ ] Responsive design
- [ ] Text is readable without zooming
- [ ] Buttons/links are tap-friendly (min 48x48px)
- [ ] No horizontal scrolling
- [ ] Fast mobile load time

### 8. Social Media

#### Open Graph Tags
- [ ] og:title set
- [ ] og:description set
- [ ] og:image set (1200x630px)
- [ ] og:url set
- [ ] og:type set
- [ ] og:locale set

#### Twitter Cards
- [ ] twitter:card set
- [ ] twitter:title set
- [ ] twitter:description set
- [ ] twitter:image set (1200x600px)

**Test Social Sharing:**
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/

### 9. Content Specific Checklists

#### Tool Detail Pages

- [ ] Tool name in title and H1
- [ ] Comprehensive description (200-300 chars minimum)
- [ ] Category clearly displayed
- [ ] Tags/keywords listed
- [ ] Pricing information shown
- [ ] User ratings displayed (if available)
- [ ] Screenshots/images included
- [ ] Features list included
- [ ] Use cases described
- [ ] Related tools section
- [ ] Call-to-action button
- [ ] SoftwareApplication schema
- [ ] BreadcrumbList schema

#### Category/Listing Pages

- [ ] Category name in title and H1
- [ ] Category description (150+ words)
- [ ] Filter/sort options available
- [ ] Tool count displayed
- [ ] Pagination implemented correctly
- [ ] Each tool has image and description
- [ ] Links to tool detail pages
- [ ] ItemList schema
- [ ] BreadcrumbList schema

#### Blog Posts

- [ ] Engaging title with keyword
- [ ] Author name and bio
- [ ] Published date displayed
- [ ] Last updated date (if modified)
- [ ] Featured image
- [ ] Table of contents (for long posts)
- [ ] Subheadings for structure
- [ ] Internal links to related content
- [ ] Social sharing buttons
- [ ] Article schema
- [ ] BreadcrumbList schema

### 10. Pre-Launch Validation

#### Automated Testing
- [ ] Run SEO audit script
- [ ] Validate structured data
- [ ] Check for broken links
- [ ] Test page load speed
- [ ] Verify mobile responsiveness

**Run Tests:**
```bash
# Quick SEO audit
npx tsx scripts/seo-audit-quick.ts

# Complete validation
npx tsx scripts/validate-seo-complete.ts

# Verify structured data
npx tsx scripts/verify-software-schema-rendering.ts

# Check hreflang
npx tsx scripts/verify-hreflang.ts
```

#### Manual Testing
- [ ] Preview in Google Rich Results Test
- [ ] Test social sharing on Facebook
- [ ] Test social sharing on Twitter
- [ ] Check page in mobile view
- [ ] Verify all links work
- [ ] Check images load correctly
- [ ] Review content for errors

#### Browser Console Checks
```javascript
// Check title
document.title

// Check meta description
document.querySelector('meta[name="description"]')?.content

// Check canonical URL
document.querySelector('link[rel="canonical"]')?.href

// Check structured data
document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
  console.log(JSON.parse(s.textContent));
});

// Check Open Graph tags
document.querySelector('meta[property="og:title"]')?.content
document.querySelector('meta[property="og:description"]')?.content
document.querySelector('meta[property="og:image"]')?.content

// Check hreflang tags
document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(link => {
  console.log(`${link.getAttribute('hreflang')}: ${link.href}`);
});
```

### 11. Post-Launch Tasks

#### Immediate (Day 1)
- [ ] Submit URL to Google Search Console
- [ ] Request indexing
- [ ] Share on social media
- [ ] Monitor for errors in Search Console

#### Short-term (Week 1)
- [ ] Check for crawl errors
- [ ] Verify page is indexed
- [ ] Monitor Core Web Vitals
- [ ] Check social sharing previews

#### Long-term (Monthly)
- [ ] Review search performance
- [ ] Update content if needed
- [ ] Check for broken links
- [ ] Monitor rankings
- [ ] Update structured data if needed

## Common Mistakes to Avoid

### ❌ Duplicate Content
- Don't copy content from other sites
- Don't use same title/description across pages
- Don't create multiple pages with same content

### ❌ Keyword Stuffing
```
❌ BAD: "AI tools, best AI tools, top AI tools, AI tools directory, 
         find AI tools, AI tools list, AI tools website"

✅ GOOD: "Discover the best AI tools for your needs. Browse our 
         comprehensive directory of AI-powered solutions."
```

### ❌ Missing Alt Text
```html
❌ BAD: <img src="/tool.png" />
✅ GOOD: <img src="/tool.png" alt="ChatGPT interface showing conversation" />
```

### ❌ Poor Title Tags
```
❌ BAD: "Home" (too short, not descriptive)
❌ BAD: "Welcome to Our Website About AI Tools" (not optimized)
✅ GOOD: "AI Best Tool - Discover the Best AI Tools"
```

### ❌ Thin Content
```
❌ BAD: "ChatGPT is an AI tool. It's good. Try it."
✅ GOOD: "ChatGPT is an advanced AI chatbot developed by OpenAI that 
         uses natural language processing to engage in human-like 
         conversations. It can assist with writing, coding, learning, 
         and creative tasks. Available in free and premium tiers."
```

### ❌ Broken Internal Links
- Always verify links before publishing
- Use relative paths for internal links
- Test all navigation elements

### ❌ Slow Page Load
- Optimize images
- Enable lazy loading
- Minimize JavaScript
- Use caching

## Resources

### Documentation
- [SEO Guidelines](./SEO_GUIDELINES.md)
- [Structured Data Patterns](./STRUCTURED_DATA_PATTERNS.md)
- [SEO Components README](../components/seo/README.md)
- [Image Optimization Guide](./IMAGE_OPTIMIZATION.md)
- [Hreflang Implementation](./HREFLANG_IMPLEMENTATION.md)

### Validation Tools
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Schema.org Validator](https://validator.schema.org/)

### Testing Scripts
```bash
# Quick SEO audit
npx tsx scripts/seo-audit-quick.ts

# Complete validation
npx tsx scripts/validate-seo-complete.ts

# Performance audit
npx tsx scripts/performance-audit.ts

# Verify structured data
npx tsx scripts/verify-software-schema-rendering.ts

# Check hreflang
npx tsx scripts/verify-hreflang.ts

# Verify images
npx tsx scripts/verify-image-alt-improvements.ts
```

## Getting Help

If you're unsure about any SEO aspect:

1. Review the documentation in `/docs`
2. Check examples in `components/seo/EXAMPLES.md`
3. Run validation scripts to identify issues
4. Consult the SEO audit report
5. Ask the development team

## Printable Checklist

Print this quick reference for your desk:

```
□ Title: 30-60 chars, keyword at start
□ Description: 120-160 chars, includes CTA
□ Canonical URL set
□ All images have alt text
□ Structured data included
□ 2-3 internal links
□ Content is unique and valuable
□ Mobile-friendly
□ Tested with validation tools
□ Submitted to Search Console
```

---

**Remember:** Good SEO is about creating valuable content for users, not just optimizing for search engines. Focus on quality, relevance, and user experience first, then optimize the technical aspects.
