import { type MetadataRoute } from 'next';
import { locales } from '@/i18n';
import { BASE_URL } from '@/lib/env';
import { GUIDE_PAGES } from '@/lib/content/guides';
import { getTools } from '@/lib/services/tools';
import { getAllCategories } from '@/lib/services/categories';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes with their priorities and change frequencies
  const staticRoutes: Array<{
    url: string;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
  }> = [
    {
      url: '', // home
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: 'explore',
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'startup',
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: 'submit',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'privacy-policy',
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: 'terms-of-service',
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Generate static route entries for all locales
  const guideRoutes = GUIDE_PAGES.map(({ href, priority, changeFrequency }) => ({
    url: href.replace(/^\//, ''),
    priority,
    changeFrequency,
  }));

  const staticSitemapEntries = [...staticRoutes, ...guideRoutes].flatMap((route) =>
    locales.map((locale) => {
      const lang = locale === 'en' ? '' : `/${locale}`;
      const routeUrl = route.url === '' ? '' : `/${route.url}`;
      return {
        url: `${BASE_URL}${lang}${routeUrl}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      };
    }),
  );

  // Fetch all published tools for dynamic routes
  let toolSitemapEntries: MetadataRoute.Sitemap = [];
  try {
    const toolsResult = await getTools(
      { status: 'published' },
      { page: 1, pageSize: 10000 }, // Get all tools
      'latest'
    );

    toolSitemapEntries = toolsResult.data.flatMap((tool) =>
      locales.map((locale) => {
        const lang = locale === 'en' ? '' : `/${locale}`;
        return {
          url: `${BASE_URL}${lang}/ai/${tool.name}`,
          lastModified: tool.updatedAt || tool.createdAt || new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        };
      }),
    );
  } catch (error) {
    console.error('Error fetching tools for sitemap:', error);
  }

  // Fetch all categories for category pages
  let categorySitemapEntries: MetadataRoute.Sitemap = [];
  try {
    const categories = await getAllCategories(false);

    categorySitemapEntries = categories.flatMap((category) =>
      locales.map((locale) => {
        const lang = locale === 'en' ? '' : `/${locale}`;
        return {
          url: `${BASE_URL}${lang}/categories/${category.slug}`,
          lastModified: category.updatedAt || category.createdAt || new Date(),
          changeFrequency: 'daily' as const,
          priority: 0.7,
        };
      }),
    );
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
  }

  // Combine all sitemap entries
  return [...staticSitemapEntries, ...toolSitemapEntries, ...categorySitemapEntries];
}
