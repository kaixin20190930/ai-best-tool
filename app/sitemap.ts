import { type MetadataRoute } from 'next';
import { locales } from '@/i18n';

import { GUIDE_PAGES } from '@/lib/content/guides';
import { BASE_URL } from '@/lib/env';
import { topListTopics } from '@/lib/data/topLists';
import { INDEXABLE_LOCALES } from '@/lib/seo/indexing';
import { getAllCategories, type CategoryWithCount } from '@/lib/services/categories';
import { getToolQuality } from '@/lib/services/toolQuality';
import { getTools } from '@/lib/services/tools';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapLocales = locales.filter((locale) =>
    INDEXABLE_LOCALES.includes(locale as (typeof INDEXABLE_LOCALES)[number]),
  );
  const featuredMainPages = new Set([
    '/guides/how-to-choose-ai-tools',
    '/guides/free-ai-tools',
    '/guides/best-free-ai-tools',
    '/guides/ai-writing-tools',
    '/guides/ai-seo-tools',
    '/guides/ai-video-tools',
    '/guides/ai-image-tools',
    '/guides/ai-coding-tools',
    '/guides/ai-chatbot-tools',
    '/guides/ai-productivity-tools',
    '/guides/ai-tools-for-research',
    '/guides/ai-tools-for-developers',
    '/guides/ai-tools-for-automation',
    '/guides/ai-tools-for-web3',
    '/guides/ai-tools-for-marketing',
    '/guides/ai-tools-for-sales',
    '/guides/ai-tools-for-voice',
    '/guides/ai-note-taking-tools',
    '/best-ai-tools',
  ]);

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
  const guideRoutes = GUIDE_PAGES.filter((page) => !page.href.includes('-comparison'))
    .filter((page) => featuredMainPages.has(page.href))
    .map(({ href, priority, changeFrequency }) => ({
      url: href.replace(/^\//, ''),
      priority,
      changeFrequency,
    }));

  const topListRoutes = topListTopics.map((topic) => ({
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
      'latest',
    );

    const eligibleTools = toolsResult.data.filter((tool) => {
      const quality = getToolQuality({
        category_id: tool.categoryId,
        image_url: tool.imageUrl,
        thumbnail_url: tool.thumbnailUrl,
        content: tool.content,
        detail: tool.detail,
        pricing: tool.pricing,
        tags: tool.tags,
      });

      return quality.score >= 80;
    });

    toolSitemapEntries = eligibleTools.flatMap((tool) =>
      sitemapLocales.map((locale) => {
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
