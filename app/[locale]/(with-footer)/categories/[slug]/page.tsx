import { Metadata } from 'next';

import { getCategoryBySlug, getLocalizedField } from '@/lib/services/categories';
import { BASE_URL } from '@/lib/env';
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

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug, true);

  if (!category) {
    return {
      title: 'AI Tools Category | AI Best Tool',
      alternates: {
        canonical: `${BASE_URL}/${params.locale}/categories/${params.slug}`,
      },
    };
  }

  const name = getLocalizedField(category.name, params.locale);
  const description =
    getLocalizedField(category.description, params.locale) ||
    `Discover the best ${name} AI tools. Browse latest, popular, and top-rated tools in the AI Best Tool directory.`;

  return {
    title: `Best ${name} AI Tools | AI Best Tool`,
    description,
    alternates: {
      canonical: `${BASE_URL}/${params.locale}/categories/${category.slug}`,
    },
  };
}

export default async function CategoryPage(props: CategoryPageProps) {
  return <CategoryContent {...props} />;
}
