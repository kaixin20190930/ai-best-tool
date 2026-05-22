# Caching Strategy

## Overview

This application implements a multi-layer caching strategy to optimize performance and reduce database load. The caching system uses:

1. **Next.js ISR (Incremental Static Regeneration)** - Page-level caching
2. **In-Memory Cache** - Application-level data caching
3. **Database Query Optimization** - Efficient queries and indexes

## Next.js ISR Configuration

### Page Revalidation

Pages are configured with `revalidate` export to enable ISR:

```typescript
// Revalidate every hour (3600 seconds)
export const revalidate = 3600;

// Enable dynamic params for ISR
export const dynamicParams = true;
```

### Revalidation Times by Page Type

| Page Type | Revalidation Time | Reason |
|-----------|------------------|---------|
| Home Page | 1 hour (3600s) | Content changes infrequently |
| Tool Detail | 1 hour (3600s) | Tool info is relatively static |
| Explore/List | 1 hour (3600s) | New tools added periodically |
| User Profile | No cache | User-specific, dynamic content |
| Admin Pages | No cache | Real-time data required |

### Example Configuration

```typescript
// app/[locale]/(with-footer)/(home)/page.tsx
export const revalidate = 3600; // 1 hour

// app/[locale]/(with-footer)/ai/[websiteName]/page.tsx
export const revalidate = 3600; // 1 hour
export const dynamicParams = true; // Generate pages on-demand

// app/[locale]/(with-footer)/explore/ExploreList.tsx
export const revalidate = 3600; // 1 hour
```

## In-Memory Cache

### Cache Implementation

The application uses a custom in-memory cache with TTL (Time To Live) support:

```typescript
import { cached, CacheTTL } from '@/lib/cache';

// Cache a function result
const data = await cached(
  'cache-key',
  async () => {
    // Expensive operation
    return await fetchData();
  },
  CacheTTL.MEDIUM // 5 minutes
);
```

### Cache TTL Constants

```typescript
export const CacheTTL = {
  SHORT: 60 * 1000,        // 1 minute
  MEDIUM: 5 * 60 * 1000,   // 5 minutes
  LONG: 30 * 60 * 1000,    // 30 minutes
  HOUR: 60 * 60 * 1000,    // 1 hour
  DAY: 24 * 60 * 60 * 1000 // 1 day
};
```

### Cached Functions

#### Tools Service

```typescript
// Popular tools - 5 minutes cache
export async function getPopularTools(limit: number = 10): Promise<Tool[]> {
  return cached(
    `popular-tools:${limit}`,
    async () => {
      const result = await getTools(
        { status: 'published' },
        { page: 1, pageSize: limit },
        'popular'
      );
      return result.data;
    },
    CacheTTL.MEDIUM
  );
}

// Latest tools - 1 minute cache (more dynamic)
export async function getLatestTools(limit: number = 10): Promise<Tool[]> {
  return cached(
    `latest-tools:${limit}`,
    async () => {
      const result = await getTools(
        { status: 'published' },
        { page: 1, pageSize: limit },
        'latest'
      );
      return result.data;
    },
    CacheTTL.SHORT
  );
}

// Top rated tools - 30 minutes cache (changes slowly)
export async function getTopRatedTools(limit: number = 10): Promise<Tool[]> {
  return cached(
    `top-rated-tools:${limit}`,
    async () => {
      const result = await getTools(
        { status: 'published' },
        { page: 1, pageSize: limit },
        'rating'
      );
      return result.data;
    },
    CacheTTL.LONG
  );
}

// Tool by name - 1 hour cache
export async function getToolByNameCached(name: string): Promise<Tool | null> {
  return cached(
    `tool:name:${name}`,
    async () => getToolByName(name),
    CacheTTL.HOUR
  );
}
```

#### Categories Service

```typescript
// All categories - 30 minutes cache
export async function getAllCategories(
  includeToolCount: boolean = false
): Promise<Category[] | CategoryWithCount[]> {
  return cached(
    `categories:all:${includeToolCount}`,
    async () => {
      // ... fetch categories
    },
    CacheTTL.LONG
  );
}
```

### Cache Invalidation

When data changes, invalidate related caches:

```typescript
import { invalidateCache, clearCache } from '@/lib/cache';

// Invalidate specific cache
invalidateCache('tool:id:123');

// Invalidate by pattern
invalidateCache('tool:*'); // All tool caches
invalidateCache('popular-tools:*'); // All popular tools caches

// Clear all cache
clearCache();
```

#### When to Invalidate

| Action | Invalidate |
|--------|-----------|
| Tool created | `tool:*`, `popular-tools:*`, `latest-tools:*` |
| Tool updated | `tool:id:{id}`, `tool:name:*` |
| Tool deleted | `tool:*`, `popular-tools:*` |
| Rating added | `top-rated-tools:*`, `tool:id:{id}` |
| Category updated | `categories:*` |

### Example: Update Tool with Cache Invalidation

```typescript
export async function updateToolWithCache(
  id: string,
  toolData: Partial<Tool>
): Promise<Tool | null> {
  // Update in database
  const updatedTool = await updateTool(id, toolData);
  
  if (updatedTool) {
    // Invalidate caches
    clearToolCache(id);
  }
  
  return updatedTool;
}
```

## Redis Cache (Optional)

For production environments with multiple server instances, consider using Redis:

### Setup with Vercel KV

```bash
# Install Vercel KV
npm install @vercel/kv
```

```typescript
// lib/redis-cache.ts
import { kv } from '@vercel/kv';

export async function getCached<T>(key: string): Promise<T | null> {
  return await kv.get<T>(key);
}

export async function setCached<T>(
  key: string,
  value: T,
  ttl: number
): Promise<void> {
  await kv.set(key, value, { ex: Math.floor(ttl / 1000) });
}

export async function deleteCached(key: string): Promise<void> {
  await kv.del(key);
}
```

### Environment Variables

```env
# .env.local
KV_URL=your_kv_url
KV_REST_API_URL=your_rest_api_url
KV_REST_API_TOKEN=your_token
KV_REST_API_READ_ONLY_TOKEN=your_read_only_token
```

## Database Query Optimization

### Indexes

Ensure proper indexes are created for frequently queried columns:

```sql
-- Tools table indexes
CREATE INDEX idx_tools_category ON tools(category_id);
CREATE INDEX idx_tools_status ON tools(status);
CREATE INDEX idx_tools_search ON tools USING GIN(search_vector);
CREATE INDEX idx_tools_created_at ON tools(created_at DESC);
CREATE INDEX idx_tools_view_count ON tools(view_count DESC);
CREATE INDEX idx_tools_rating ON tools(average_rating DESC, rating_count DESC);

-- Favorites table indexes
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_tool ON favorites(tool_id);

-- Ratings table indexes
CREATE INDEX idx_ratings_tool ON ratings(tool_id);

-- Comments table indexes
CREATE INDEX idx_comments_tool ON comments(tool_id);
CREATE INDEX idx_comments_user ON comments(user_id);

-- Analytics table indexes
CREATE INDEX idx_analytics_event ON analytics(event_type);
CREATE INDEX idx_analytics_tool ON analytics(tool_id);
CREATE INDEX idx_analytics_timestamp ON analytics(timestamp);
```

### Query Optimization Tips

1. **Use SELECT specific columns** instead of `SELECT *`
2. **Limit result sets** with LIMIT and OFFSET
3. **Use prepared statements** to prevent SQL injection and improve performance
4. **Batch queries** when possible using JOINs
5. **Use COUNT(*) efficiently** with proper WHERE clauses

## Performance Monitoring

### Cache Hit Rate

Monitor cache effectiveness:

```typescript
import { getCacheStats } from '@/lib/cache';

const stats = getCacheStats();
console.log(`Cache size: ${stats.size}/${stats.maxSize}`);
```

### Next.js Analytics

Use Vercel Analytics to monitor:

- Page load times
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)

### Database Performance

Monitor query performance:

```sql
-- Enable query logging in PostgreSQL
ALTER DATABASE your_database SET log_statement = 'all';
ALTER DATABASE your_database SET log_duration = on;

-- Find slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## Best Practices

### 1. Cache Appropriately

- **Static content**: Long cache (1 hour - 1 day)
- **Dynamic content**: Short cache (1-5 minutes)
- **User-specific**: No cache or session-based cache
- **Real-time data**: No cache

### 2. Cache Key Naming

Use consistent, descriptive cache keys:

```typescript
// Good
`tool:id:${toolId}`
`popular-tools:${limit}`
`categories:all:${includeCount}`

// Bad
`t${toolId}`
`pop${limit}`
`cats`
```

### 3. Handle Cache Misses Gracefully

Always have a fallback when cache fails:

```typescript
try {
  const cached = await getCached(key);
  if (cached) return cached;
} catch (error) {
  console.error('Cache error:', error);
}

// Fallback to database
return await fetchFromDatabase();
```

### 4. Monitor Cache Size

Prevent memory issues by limiting cache size:

```typescript
const cache = new Cache(1000); // Max 1000 entries
```

### 5. Clean Expired Entries

Regularly clean expired cache entries:

```typescript
// Clean every 5 minutes
setInterval(() => {
  cache.cleanExpired();
}, 5 * 60 * 1000);
```

## Troubleshooting

### Cache Not Working

1. Check if cache is enabled in environment
2. Verify cache keys are consistent
3. Check TTL values are appropriate
4. Monitor cache hit/miss rates

### Stale Data

1. Reduce TTL for frequently changing data
2. Implement cache invalidation on updates
3. Use on-demand revalidation for critical updates

### Memory Issues

1. Reduce cache size limit
2. Decrease TTL values
3. Implement LRU eviction
4. Consider moving to Redis

### ISR Not Regenerating

1. Check `revalidate` value is set
2. Verify `dynamicParams` is enabled for dynamic routes
3. Check Vercel deployment settings
4. Use on-demand revalidation API

## Resources

- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [Vercel KV](https://vercel.com/docs/storage/vercel-kv)
- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance-tips.html)
