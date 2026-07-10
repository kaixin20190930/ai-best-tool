import { type MetadataRoute } from 'next';

import { BASE_URL } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  const sitemapUrl = `${BASE_URL.replace(/\/$/, '')}/sitemap.xml`;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/admin/',
          '/login',
          '/register',
          '/forgot-password',
          '/verify-email',
          '/profile',
          '/settings',
          '/cn/admin/',
          '/cn/login',
          '/cn/register',
          '/cn/forgot-password',
          '/cn/verify-email',
          '/cn/profile',
          '/cn/settings',
          '/en/admin/',
          '/en/login',
          '/en/register',
          '/en/forgot-password',
          '/en/verify-email',
          '/en/profile',
          '/en/settings',
        ],
      },
    ],
    sitemap: sitemapUrl,
    host: BASE_URL,
  };
}
