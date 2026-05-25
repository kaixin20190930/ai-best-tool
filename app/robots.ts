import { type MetadataRoute } from 'next';

import { BASE_URL } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  const sitemapUrl = `${BASE_URL.replace(/\/$/, '')}/sitemap.xml`;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: sitemapUrl,
    host: BASE_URL,
  };
}
