import { notFound } from 'next/navigation';

import ExploreList from '@/app/[locale]/(with-footer)/explore/ExploreList';
import {
  getAllCategories,
  getCategoryBySlug,
  getLocalizedField,
} from '@/lib/services/categories';
import { getAllTags } from '@/lib/services/tags';
import { SortBy } from '@/lib/services/tools';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';

export interface CategoryContentProps {
  params: { locale: string; slug: string };
  pageNum?: string;
  searchParams?: {
    tags?: string;
    pricing?: 'free' | 'freemium' | 'paid';
    search?: string;
    sort?: SortBy;
  };
}

export default async function CategoryContent({
  params,
  pageNum,
  searchParams,
}: CategoryContentProps) {
  const [category, categories, tags] = await Promise.all([
    getCategoryBySlug(params.slug, true),
    getAllCategories(true),
    getAllTags('count'),
  ]);

  if (!category) {
    notFound();
  }

  const categoryName = getLocalizedField(category.name, params.locale);
  const categoryDescription =
    getLocalizedField(category.description, params.locale) ||
    `Browse the latest and most useful ${categoryName} AI tools.`;
  const basePath = `/categories/${category.slug}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${params.locale}` },
    { name: 'Explore', url: `${siteUrl}/${params.locale}/explore` },
    {
      name: categoryName,
      url: `${siteUrl}/${params.locale}/categories/${category.slug}`,
    },
  ]);

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <div className="theme-page container mx-auto px-4 py-8">
        <div className="theme-surface mb-8 rounded-lg border border-slate-200 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
            AI Tools Category
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 lg:text-4xl">
            Best {categoryName} AI Tools
          </h1>
          <p className="mt-3 max-w-3xl text-slate-600">{categoryDescription}</p>
          {'toolCount' in category && (
            <p className="mt-4 text-sm font-medium text-slate-500">
              {category.toolCount} published tools in this category
            </p>
          )}
        </div>

        <ExploreList
          locale={params.locale}
          searchParams={searchParams}
          pageNum={pageNum}
          categories={categories}
          tags={tags}
          forcedCategorySlug={category.slug}
          basePath={basePath}
        />
      </div>
    </>
  );
}
