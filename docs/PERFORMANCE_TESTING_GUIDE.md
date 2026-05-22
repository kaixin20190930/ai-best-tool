# Performance Testing Guide

Quick reference for running performance tests and interpreting results.

## Quick Start

### Run Automated Tests

```bash
# Comprehensive performance audit
npm run perf:audit

# Core Web Vitals check
npm run perf:vitals
```

## Test Scripts

### 1. Performance Audit (`npm run perf:audit`)

**What it tests:**
- Image optimization (WebP, AVIF, caching)
- Lazy loading implementation
- Core Web Vitals (LCP, FID, CLS)
- Bundle size optimization
- Caching strategies
- Mobile performance

**Output:**
- Overall performance score (0-100)
- Category scores
- Detailed recommendations
- Manual testing instructions

**When to run:**
- Before production deployments
- After major code changes
- Weekly performance checks
- When investigating performance issues

### 2. Core Web Vitals Check (`npm run perf:vitals`)

**What it tests:**
- LCP (Largest Contentful Paint) optimizations
- FID (First Input Delay) optimizations
- CLS (Cumulative Layout Shift) prevention
- Additional performance optimizations

**Output:**
- Pass/fail for each check
- Summary by metric
- Expected performance targets

**When to run:**
- After image optimization changes
- After lazy loading updates
- Daily CI/CD checks
- Quick performance verification

## Manual Testing

### Google PageSpeed Insights

1. Visit: https://pagespeed.web.dev/
2. Enter your production URL
3. Click "Analyze"
4. Review both Mobile and Desktop scores

**Target:** 90+ for both Mobile and Desktop

### Chrome DevTools Lighthouse

```bash
# Build and start production server
npm run build
npm run start
```

1. Open your site in Chrome
2. Open DevTools (F12)
3. Go to Lighthouse tab
4. Select all categories
5. Click "Analyze page load"

**Target Scores:**
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

### Core Web Vitals Testing

1. Open Chrome DevTools → Performance
2. Enable "Web Vitals" in settings
3. Click record button
4. Reload page
5. Stop recording after load

**Target Metrics:**
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1

### Network Throttling Test

1. Open DevTools → Network tab
2. Select "Slow 3G" from dropdown
3. Reload page
4. Scroll down slowly

**Verify:**
- Hero image loads immediately
- Below-fold images load on scroll
- No layout shifts
- Smooth scrolling

## Understanding Results

### Performance Score Grades

| Score | Grade | Status |
|-------|-------|--------|
| 90-100 | A | 🌟 Excellent |
| 80-89 | B | ✅ Good |
| 70-79 | C | ⚠️ Fair |
| 60-69 | D | ⚠️ Poor |
| 0-59 | F | ❌ Needs Work |

### Core Web Vitals Thresholds

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | < 2.5s | 2.5s - 4.0s | > 4.0s |
| FID | < 100ms | 100ms - 300ms | > 300ms |
| CLS | < 0.1 | 0.1 - 0.25 | > 0.25 |

### Category Scores

**Image Optimization (Requirement 7.1)**
- Modern formats (WebP/AVIF)
- Next.js optimization
- Responsive sizes
- Long-term caching

**Lazy Loading (Requirement 7.3)**
- Smart lazy loading
- Priority loading
- Tool card images
- Media gallery images

**Core Web Vitals**
- LCP optimizations
- FID optimizations
- CLS prevention

**Bundle Size**
- Dynamic imports
- Font optimization

**Caching**
- Static generation
- ISR (Incremental Static Regeneration)

**Mobile Performance**
- Responsive images
- Viewport configuration

## Common Issues & Solutions

### Low Image Optimization Score

**Symptoms:**
- WebP/AVIF not enabled
- Image optimization disabled
- Short cache TTL

**Solutions:**
```javascript
// next.config.mjs
images: {
  formats: ['image/avif', 'image/webp'],
  minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
}
```

### Low Lazy Loading Score

**Symptoms:**
- All images load immediately
- No priority loading
- Tool cards not lazy

**Solutions:**
```typescript
// Use BaseImage with smart defaults
<BaseImage
  src="/image.jpg"
  alt="Description"
  priority={isAboveFold} // true for hero images
  loading={isAboveFold ? 'eager' : 'lazy'}
/>
```

### Poor Core Web Vitals

**LCP Issues:**
- Enable priority loading for hero images
- Use modern image formats
- Optimize image sizes
- Implement caching

**FID Issues:**
- Lazy load below-fold images
- Use dynamic imports for heavy components
- Reduce JavaScript execution

**CLS Issues:**
- Add blur placeholders
- Specify image dimensions
- Use fill prop for responsive images

### Low Bundle Size Score

**Symptoms:**
- All components loaded upfront
- No dynamic imports
- Fonts not optimized

**Solutions:**
```typescript
// Dynamic imports
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Loading />,
  ssr: false, // if not needed on server
});

// Font optimization
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
```

## Production Monitoring

### Google Search Console

1. Go to Google Search Console
2. Navigate to Core Web Vitals report
3. Monitor URL performance
4. Review issues and warnings

**Target:** 90%+ URLs in "Good" category

### Real User Monitoring (RUM)

Consider implementing:
- web-vitals library
- Custom analytics
- Performance dashboards

## CI/CD Integration

Add to your CI/CD pipeline:

```yaml
# .github/workflows/performance.yml
- name: Run Performance Audit
  run: npm run perf:audit

- name: Check Core Web Vitals
  run: npm run perf:vitals
```

## Resources

### Documentation
- [Performance Audit Script](../scripts/performance-audit.ts)
- [Core Web Vitals Script](../scripts/verify-core-web-vitals.ts)
- [WebP Optimization Guide](./WEBP_IMAGE_OPTIMIZATION.md)
- [Lazy Loading Guide](./LAZY_LOADING_IMPLEMENTATION.md)
- [Mobile Optimization](./MOBILE_OPTIMIZATION.md)

### External Resources
- [Web.dev Core Web Vitals](https://web.dev/vitals/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Chrome DevTools Lighthouse](https://developer.chrome.com/docs/lighthouse/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)

## Troubleshooting

### Script Errors

If scripts fail to run:

```bash
# Install dependencies
npm install

# Run with tsx directly
npx tsx scripts/performance-audit.ts
npx tsx scripts/verify-core-web-vitals.ts
```

### False Positives

Some checks may show warnings that don't apply:
- Review the specific recommendation
- Check if it's relevant to your use case
- Document exceptions if needed

### Performance Regression

If scores drop:
1. Run both audit scripts
2. Compare with previous results
3. Check recent code changes
4. Review failed checks
5. Implement recommendations
6. Re-test

## Best Practices

1. **Test Regularly**
   - Run automated tests weekly
   - Run Lighthouse monthly
   - Monitor Search Console continuously

2. **Test Before Deploy**
   - Always run performance audit
   - Check Core Web Vitals
   - Review recommendations

3. **Monitor Production**
   - Set up Google Search Console
   - Track real user metrics
   - Set up performance alerts

4. **Optimize Continuously**
   - Address failing checks
   - Implement recommendations
   - Keep dependencies updated

5. **Document Changes**
   - Track performance scores
   - Document optimizations
   - Share learnings with team

---

**Last Updated:** December 10, 2025
**Current Score:** 92/100 (Grade A)
**Status:** ✅ Production Ready
