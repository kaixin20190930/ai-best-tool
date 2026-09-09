import { Metadata } from 'next';

import { BASE_URL } from '@/lib/env';
import { CATEGORY_METADATA_PROFILES } from '@/lib/seo/categoryMetadataProfiles';
import { buildLocalizedPageMetadata } from '@/lib/seo/metadata';
import { getCategoryBySlug, getLocalizedField } from '@/lib/services/categories';
import { SortBy } from '@/lib/services/tools';

import CategoryContent from './CategoryContent';

export const revalidate = 3600;

interface CategoryPageProps {
  params: { locale: string; slug: string };
  searchParams?: {
    tags?: string;
    pricing?: 'free' | 'freemium' | 'paid';
    search?: string;
    sort?: SortBy;
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug, true);
  const isChinese = params.locale === 'cn' || params.locale === 'tw';
  const profile = CATEGORY_METADATA_PROFILES[params.slug]?.[isChinese ? 'cn' : 'en'];

  if (!category) {
    return buildLocalizedPageMetadata({
      locale: params.locale,
      path: `/categories/${params.slug}`,
      title: profile?.title || 'AI Tools Category | AI Best Tool',
      description: profile?.description || 'Browse AI tools in this category.',
      indexable: false,
      baseUrl: BASE_URL,
    });
  }

  const name = getLocalizedField(category.name, params.locale);
  const description =
    getLocalizedField(category.description, params.locale) ||
    `Discover the best ${name} AI tools. Browse latest, popular, and top-rated tools in the AI Best Tool directory.`;
  const title = profile?.title || `Best ${name} AI Tools | AI Best Tool`;
  const metadataDescription = profile?.description || description;
  const toolCount = 'toolCount' in category ? Number(category.toolCount || 0) : 0;

  return buildLocalizedPageMetadata({
    locale: params.locale,
    path: `/categories/${category.slug}`,
    title,
    description: metadataDescription,
    indexable: toolCount >= 3,
    baseUrl: BASE_URL,
  });
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  return <CategoryContent params={params} searchParams={searchParams} />;
}
