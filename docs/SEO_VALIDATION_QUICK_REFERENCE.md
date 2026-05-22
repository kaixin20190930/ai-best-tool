# SEO Validation Quick Reference

## Automated Testing

```bash
# Start dev server
pnpm dev

# Run validation
tsx scripts/validate-seo-complete.ts
```

## Manual Testing URLs

| Tool | URL | Purpose |
|------|-----|---------|
| **Google Rich Results Test** | https://search.google.com/test/rich-results | Validate structured data |
| **Facebook Sharing Debugger** | https://developers.facebook.com/tools/debug/ | Test Open Graph tags |
| **Twitter Card Validator** | https://cards-dev.twitter.com/validator | Test Twitter Cards |
| **Google Search Console** | https://search.google.com/search-console | Monitor SEO health |

## What to Test

### Homepage
- ✅ Organization schema
- ✅ Open Graph tags
- ✅ Twitter Card
- ✅ Title (30-60 chars)
- ✅ Description (120-160 chars)

### Listing Pages (Explore, Startup)
- ✅ BreadcrumbList schema
- ✅ Open Graph tags
- ✅ Twitter Card
- ✅ Optimized metadata

### Tool Pages
- ✅ SoftwareApplication schema (if in DB)
- ✅ BreadcrumbList schema
- ✅ Open Graph tags
- ✅ Twitter Card
- ✅ Dynamic metadata

### Site-Wide
- ✅ robots.txt (correct sitemap URL)
- ✅ sitemap.xml (valid XML, all pages)
- ✅ Canonical URLs
- ✅ Image alt attributes

## Quick Checks

### robots.txt
```bash
curl https://aibesttool.com/robots.txt
```
Should contain: `Sitemap: https://aibesttool.com/sitemap.xml`

### sitemap.xml
```bash
curl https://aibesttool.com/sitemap.xml | head -20
```
Should be valid XML with `<urlset>` and `<url>` elements

### Page Metadata
```bash
curl -s https://aibesttool.com | grep -E "(og:|twitter:)"
```
Should show Open Graph and Twitter Card tags

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| No structured data detected | Check JSON-LD in page source |
| Social preview not showing | Verify absolute image URLs |
| Sitemap not processing | Check XML validity and accessibility |
| Pages not indexed | Verify robots.txt and canonical URLs |

## Requirements Coverage

| Requirement | Test Method | Status |
|-------------|-------------|--------|
| 1.1 - robots.txt | Automated + Manual | ✅ |
| 1.3 - sitemap.xml | Automated + Manual | ✅ |
| 2.1 - Open Graph | Automated + Facebook | ✅ |
| 2.2 - Twitter Cards | Automated + Twitter | ✅ |
| 3.4 - Structured Data | Automated + Google | ✅ |

## Next Steps

1. ✅ Run automated validation
2. ✅ Test with Google Rich Results
3. ✅ Test with Facebook Debugger
4. ✅ Test with Twitter Validator
5. ⏭️ Deploy to production
6. ⏭️ Submit sitemap to Search Console
7. ⏭️ Monitor ongoing performance

---

**Full Guide:** See `docs/SEO_VALIDATION_GUIDE.md` for detailed instructions.
