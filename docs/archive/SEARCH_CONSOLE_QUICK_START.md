# Search Console Quick Start

Use this after a release that adds new pages, changes metadata, or updates the sitemap.

## Before You Start

- Confirm `NEXT_PUBLIC_SITE_URL` points to the production canonical domain.
- Confirm `/sitemap.xml` opens on the production domain.
- Confirm the admin Search Console page is available at `/admin/search-console`.
- Confirm `MONITOR_API_TOKEN` is set if you want monitor endpoints protected.
- If `MONITOR_API_TOKEN` is set, direct browser requests to `/api/monitor` return `401` unless you send `Authorization: Bearer <token>`.

## Step 1: Submit Sitemap

1. Open `/admin/search-console`.
2. Make sure `Property URL` matches your Google Search Console property.
3. Make sure `Site origin` matches your canonical site origin.
4. Leave `Sitemap URL` as `https://your-domain.com/sitemap.xml` unless you intentionally changed it.
5. Click `Submit sitemap`.
6. Check the recent logs table for a `success` row.

## Step 2: Inspect Important URLs

Run inspections for a few representative pages:

- Home page
- One category page
- One guide page
- One tool detail page

Use URLs like:

```text
https://your-domain.com/
https://your-domain.com/categories/productivity
https://your-domain.com/guides/how-to-choose-ai-tools
https://your-domain.com/ai/viggle
```

## Step 3: Verify Search Console

In Google Search Console:

1. Open your property.
2. Go to `Sitemaps`.
3. Confirm the submitted sitemap shows `Success` or `Has been read`.
4. Open `Pages` or `Indexing` to watch coverage over the next 24-48 hours.
5. Inspect any reported URL if Google flags indexing issues.

## Step 4: What to Watch

- No 5xx errors on `/api/health`.
- No auth errors from `/api/monitor`.
- Sitemap returns XML, not HTML.
- Guide and category URLs appear in the sitemap.
- New pages have internal links from home, guides, or category pages.

## Good Release Pattern

After each release:

1. Deploy.
2. Submit sitemap.
3. Inspect 3-4 high value URLs.
4. Watch logs for errors.
5. Check Search Console coverage the next day.

This keeps indexing work small and repeatable.
