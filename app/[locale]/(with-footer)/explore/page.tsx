import { Metadata } from 'next';

import { generateBreadcrumbSchema } from '@/lib/seo/schema';
import { getAllCategories } from '@/lib/services/categories';
import { getAllTags } from '@/lib/services/tags';
import { SortBy } from '@/lib/services/tools';
import FilterPanel from '@/components/FilterPanel';
import { generateHreflangMetadata } from '@/components/seo';
import { StructuredDataServer } from '@/components/seo/StructuredData';

import ExploreList from './ExploreList';

export const revalidate = 3600;

interface PageProps {
  params: { locale: string };
  searchParams?: {
    category?: string;
    tags?: string;
    pricing?: 'free' | 'freemium' | 'paid';
    search?: string;
    sort?: SortBy;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Generate hreflang tags for all locales
  const hreflangMetadata = generateHreflangMetadata(params.locale, '/explore');

  return {
    title: 'Explore AI Tools | AI Best Tool',
    description:
      'Browse curated AI tools by category, pricing, and use case. Discover and compare the best tools for writing, coding, design, productivity, and more.',
    ...hreflangMetadata,
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  // Fetch categories and tags for the filter panel
  const categories = await getAllCategories(true);
  const tags = await getAllTags('count');

  // Generate BreadcrumbList schema for navigation hierarchy
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: baseUrl },
    { name: 'Explore', url: `${baseUrl}/explore` },
  ]);

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <div className='container mx-auto px-4 py-8'>
        <div className='flex flex-col gap-6 lg:flex-row'>
          {/* Filter Panel - Sidebar on desktop, collapsible on mobile */}
          <aside className='shrink-0 lg:w-72'>
            <FilterPanel categories={categories} tags={tags} locale={params.locale} />
          </aside>

          {/* Main Content */}
          <main className='flex-1'>
            <ExploreList locale={params.locale} searchParams={searchParams} categories={categories} tags={tags} />
          </main>
        </div>
      </div>
    </>
  );
}
