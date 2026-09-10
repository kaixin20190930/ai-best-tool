import { type MetadataRoute } from 'next';
import { locales } from '@/i18n';

import { getCanonicalToolSlug } from '@/lib/config/toolRouteAliases';
import { INDEXABLE_GUIDE_PAGES } from '@/lib/content/guides';
import { topListTopics } from '@/lib/data/topLists';
import { BASE_URL } from '@/lib/env';
import { INDEXABLE_LOCALES } from '@/lib/seo/indexing';
import { getStaticPageLastModified } from '@/lib/seo/staticPageDates';
import { getToolIndexDecision } from '@/lib/seo/toolIndexing';
import { getAllCategories, type CategoryWithCount } from '@/lib/services/categories';
import { getTopicCatalog } from '@/lib/services/topicTools';

// Topic eligibility is data-dependent, just like its page metadata. A build
// snapshot can keep advertising a topic after its last candidate is removed.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapLocales = locales.filter((locale) =>
    INDEXABLE_LOCALES.includes(locale as (typeof INDEXABLE_LOCALES)[number]),
  );
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
      url: 'guides',
      changeFrequency: 'weekly',
      priority: 0.82,
    },
    {
      url: 'best-ai-tools',
      changeFrequency: 'weekly',
      priority: 0.78,
    },
  ];

  // Generate static route entries for all locales
  const guideRoutes = INDEXABLE_GUIDE_PAGES.map(({ href, priority, changeFrequency }) => ({
    url: href.replace(/^\//, ''),
    priority,
    changeFrequency,
  }));

  const catalog = await getTopicCatalog();
  const topListRoutes = topListTopics
    .filter((topic) => catalog.topics.get(topic.key)?.indexable)
    .map((topic) => ({
      url: `best-ai-tools/${topic.key}`,
      priority: 0.8,
      changeFrequency: 'weekly' as const,
    }));

  const staticSitemapEntries = [...staticRoutes, ...guideRoutes, ...topListRoutes].flatMap((route) =>
    sitemapLocales.map((locale) => {
      const lang = locale === 'en' ? '' : `/${locale}`;
      const routeUrl = route.url === '' ? '' : `/${route.url}`;
      return {
        url: `${BASE_URL}${lang}${routeUrl}`,
        lastModified: getStaticPageLastModified(route.url ? `/${route.url}` : '/'),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      };
    }),
  );

  // Fetch all published tools for dynamic routes
  let toolSitemapEntries: MetadataRoute.Sitemap = [];
  try {
    const eligibleTools = catalog.tools.filter((tool) => getToolIndexDecision(tool).indexable);

    toolSitemapEntries = eligibleTools.flatMap((tool) =>
      sitemapLocales.map((locale) => {
        const lang = locale === 'en' ? '' : `/${locale}`;
        return {
          url: `${BASE_URL}${lang}/ai/${getCanonicalToolSlug(tool.name)}`,
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
    const categories = (await getAllCategories(true)) as CategoryWithCount[];
    const eligibleCategories = categories.filter((category) => category.toolCount >= 3);

    categorySitemapEntries = eligibleCategories.flatMap((category) =>
      sitemapLocales.map((locale) => {
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
