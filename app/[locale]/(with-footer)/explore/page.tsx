import { Metadata } from 'next';

import { Link } from '@/app/navigation';
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
    title: 'Browse AI tools | AI Best Tool',
    description:
      'Browse curated AI tools by category, pricing, and use case. Compare tools for writing, coding, design, productivity, and more.',
    ...hreflangMetadata,
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  // Fetch categories and tags for the filter panel
  const categories = await getAllCategories(true);
  const tags = await getAllTags('count');
  const isChinese = params.locale === 'cn' || params.locale === 'tw';

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
        <section className='mb-8 rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '核心入口' : 'Core entry points'}
          </p>
          <h1 className='mt-2 text-3xl font-bold text-slate-950 lg:text-4xl'>
            {isChinese ? '从探索页进入整个目录' : 'Use Explore as the main directory entry'}
          </h1>
          <p className='mt-3 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你还没决定要看哪个方向，先从这里筛选；如果你已经有明确意图，再跳到本周新增、生产力或 Web3 这些更聚焦的核心页。'
              : 'If you are still orienting, start filtering here. If you already know the direction, jump straight to new additions, productivity, or Web3.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            <Link
              href='/new'
              className='rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/60'
            >
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '看本周新增' : 'See what is new this week'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '先看最近补进和最近补厚的页面，更容易找到活跃内容。'
                  : 'Start with recently added and recently improved pages to find the freshest inventory.'}
              </p>
            </Link>
            <Link
              href='/categories/productivity?sort=popular'
              className='rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/60'
            >
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '看生产力分类' : 'Open the productivity category'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '这是目前最厚的分类之一，适合第一次建立判断。'
                  : 'One of the densest categories and a strong starting point for first-time visitors.'}
              </p>
            </Link>
            <Link
              href='/categories/web3?sort=popular'
              className='rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/60'
            >
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '看 Web3 分类' : 'Open the Web3 category'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你关注链上研究、分析和基础设施，这里是最聚焦的入口。'
                  : 'If you care about on-chain research, analytics, or infrastructure, this is the sharpest entry point.'}
              </p>
            </Link>
            <Link
              href='/guides/how-to-choose-ai-tools'
              className='rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/60'
            >
              <p className='text-sm font-semibold text-slate-950'>
                {isChinese ? '先看选型指南' : 'Read the selection guide'}
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你还没想清楚比较维度，先从指南入手会更高效。'
                  : 'If your comparison criteria are still fuzzy, the guide is the fastest way to build context.'}
              </p>
            </Link>
          </div>
        </section>

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
