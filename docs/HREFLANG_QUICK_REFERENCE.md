# Hreflang Quick Reference

## Quick Start

Add hreflang tags to any page in 3 lines:

```typescript
import { generateHreflangMetadata } from '@/components/seo';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  return {
    title: 'Your Title',
    description: 'Your description',
    ...generateHreflangMetadata(params.locale, '/your-path'), // ← Add this line
  };
}
```

## Path Format Rules

| Page Type | Path Format | Example |
|-----------|-------------|---------|
| Homepage | `/` | `generateHreflangMetadata(locale, '/')` |
| Static page | `/page-name` | `generateHreflangMetadata(locale, '/about')` |
| Dynamic route | `/path/[param]` | `generateHreflangMetadata(locale, `/ai/${toolName}`)` |
| Paginated | `/path/page/[num]` | `generateHreflangMetadata(locale, `/explore/page/${pageNum}`)` |

⚠️ **Important**: Always provide path WITHOUT locale prefix
- ✅ Correct: `/explore`
- ❌ Wrong: `/en/explore`

## What It Generates

For each page, you get:
- ✅ Canonical URL
- ✅ Hreflang links for all 9 locales
- ✅ X-default fallback (points to English)
- ✅ Bidirectional relationships

## Testing

```bash
# Run tests
npx tsx scripts/verify-hreflang.ts
npx tsx scripts/test-hreflang-rendering.ts

# Check in browser
curl -s https://aibesttool.com/en/explore | grep hreflang
```

## Supported Locales

en, es, fr, de, jp, pt, ru, zh-CN, zh-TW

## Full Documentation

See `docs/HREFLANG_IMPLEMENTATION.md` for complete guide.
