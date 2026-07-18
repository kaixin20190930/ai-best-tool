# Google Search Console Integration

This project now includes a reusable Google Search Console integration for:

- submitting a sitemap to Search Console
- inspecting a URL with the URL Inspection API
- logging each request in the admin database

## Important limitation

Google does **not** expose a public API for general "request indexing" of arbitrary pages.
This integration automates the supported Search Console actions instead:

- sitemap submission
- URL inspection

Use this as part of a broader SEO workflow, not as a direct replacement for the manual "Request indexing" button.

## Environment variables

Set these in your project:

```bash
GSC_PROPERTY_URL=sc-domain:example.com
GSC_SITE_ORIGIN=https://example.com
GSC_DEFAULT_SITEMAP_URL=https://example.com/sitemap.xml
GSC_CLIENT_ID=your-google-oauth-client-id
GSC_CLIENT_SECRET=your-google-oauth-client-secret
GSC_REFRESH_TOKEN=your-google-oauth-refresh-token
```

Optional fallback:

- `NEXT_PUBLIC_SITE_URL` as the canonical production domain

## Reusable library

Import the client from:

```ts
import {
  createGoogleSearchConsoleClient,
  createRefreshTokenAccessTokenProvider,
} from '@/lib/integrations/google-search-console';
```

Example:

```ts
const client = createGoogleSearchConsoleClient({
  propertyUrl: 'sc-domain:example.com',
  siteOrigin: 'https://example.com',
  accessTokenProvider: createRefreshTokenAccessTokenProvider({
    clientId: process.env.GSC_CLIENT_ID!,
    clientSecret: process.env.GSC_CLIENT_SECRET!,
    refreshToken: process.env.GSC_REFRESH_TOKEN!,
  }),
});

await client.submitSitemap('https://example.com/sitemap.xml');
await client.inspectUrl('https://example.com/guides/how-to-choose-ai-tools');
```

## Admin page

Open:

- `/admin/search-console`

It includes:

- sitemap submission
- URL inspection
- recent logs

## Monitor API

You can trigger the same actions programmatically:

```bash
GET /api/monitor/google-search-console?action=submit-sitemap&sitemapUrl=https://example.com/sitemap.xml
GET /api/monitor/google-search-console?action=inspect-url&inspectionUrl=https://example.com/page
```

If `MONITOR_API_TOKEN` is set, pass it as:

```bash
Authorization: Bearer $MONITOR_API_TOKEN
```
