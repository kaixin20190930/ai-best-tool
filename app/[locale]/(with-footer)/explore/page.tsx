import { Metadata } from 'next';

import { BASE_URL } from '@/lib/env';
import { getEditorialReviewRecord } from '@/lib/seo/contentReviewDates';
import { hasActiveExploreFilters } from '@/lib/seo/exploreIndexing';
import { buildLocalizedPageMetadata } from '@/lib/seo/metadata';
import { getAllCategories } from '@/lib/services/categories';
import { getAllTags } from '@/lib/services/tags';
import { SortBy } from '@/lib/services/tools';
import FilterPanel from '@/components/FilterPanel';
import Search from '@/components/Search';
import SeoBreadcrumbs from '@/components/seo/SeoBreadcrumbs';
import { Link } from '@/app/navigation';

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

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const isChinese = params.locale === 'cn' || params.locale === 'tw';

  return buildLocalizedPageMetadata({
    locale: params.locale,
    path: '/explore',
    title: isChinese
      ? '探索 AI 工具目录：按场景、价格和分类筛选'
      : 'Explore AI Tools Directory by Use Case, Pricing & Category',
    description: isChinese
      ? '浏览和筛选精选 AI 工具目录，按任务、分类、价格、标签和最近更新缩小范围，再进入详情页比较功能、限制与真实信号。'
      : 'Browse and filter a curated AI tools directory by task, category, pricing, tags, and freshness, then compare features, limits, and real signals on detail pages.',
    indexable: !hasActiveExploreFilters(searchParams),
    baseUrl: BASE_URL,
  });
}

export default async function Page({ params, searchParams }: PageProps) {
  // Fetch categories and tags for the filter panel
  const [categoriesResult, tagsResult] = await Promise.allSettled([getAllCategories(true), getAllTags('count')]);
  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
  const tags = tagsResult.status === 'fulfilled' ? tagsResult.value : [];
  const isChinese = params.locale === 'cn' || params.locale === 'tw';
  const checkedAt = getEditorialReviewRecord('explore').reviewedAt;
  const taskFirstEntryPoints = [
    {
      href: '/guides/ai-writing-tools',
      title: isChinese ? '写内容' : 'Write content',
      description: isChinese
        ? '先看写作工具的场景、价格和输出质量。'
        : 'Start with writing use cases, pricing, and output quality.',
    },
    {
      href: '/guides/ai-coding-tools',
      title: isChinese ? '做开发' : 'Build or code',
      description: isChinese ? '先看 IDE、补全和 Agent 类工具。' : 'Start with IDE, completion, and agent-style tools.',
    },
    {
      href: '/guides/ai-tools-for-research',
      title: isChinese ? '做研究' : 'Do research',
      description: isChinese
        ? '先看资料发现、引用和证据整理。'
        : 'Start with discovery, citations, and evidence gathering.',
    },
    {
      href: '/guides/how-to-choose-ai-tools',
      title: isChinese ? '还没决定' : 'Still deciding',
      description: isChinese
        ? '先看选型方法，再回到 Explore 做筛选。'
        : 'Read the selection guide first, then come back to Explore.',
    },
  ];

  return (
    <div className='container mx-auto px-4 py-8'>
      <SeoBreadcrumbs
        locale={params.locale}
        items={[
          { name: isChinese ? '首页' : 'Home', path: '/' },
          { name: isChinese ? '探索工具' : 'Explore', path: '/explore' },
        ]}
        className='mb-5'
      />
      <section className='mb-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6'>
        <h1 className='text-3xl font-bold text-slate-950 lg:text-4xl'>
          {isChinese
            ? '按任务、价格和分类探索 AI 工具目录'
            : 'Explore the AI tools directory by task, pricing, and category'}
        </h1>
        <p className='mt-3 max-w-3xl text-sm leading-6 text-slate-600'>
          {isChinese
            ? '搜索产品或任务，再用分类、价格与排序缩小范围。进入详情页核对限制、来源和真实反馈。'
            : 'Search for a product or task, then narrow results by category, pricing, and sort order. Open a detail page for limits, sources, and real feedback.'}
        </p>
        <Search
          placeholder={isChinese ? '搜索工具、场景或产品名...' : 'Search tools, use cases, or product names...'}
          showSuggestions
          taskHint={isChinese ? '先按任务找' : 'Search by task'}
          taskSuggestions={taskFirstEntryPoints.map((item) => ({ label: item.title, href: item.href }))}
          className='mt-4 p-0 sm:p-0'
        />
        <p className='mt-3 text-xs text-slate-500'>
          {isChinese ? '筛选与导航核查于' : 'Filters and navigation checked'} {checkedAt}
        </p>
      </section>
      <div className='flex flex-col gap-6 lg:flex-row'>
        {/* Filter Panel - Sidebar on desktop, collapsible on mobile */}
        <aside className='shrink-0 lg:w-72'>
          <FilterPanel categories={categories} tags={tags} locale={params.locale} />
        </aside>

        {/* Main Content */}
        <main className='min-w-0 flex-1'>
          <ExploreList locale={params.locale} searchParams={searchParams} categories={categories} tags={tags} />
        </main>
      </div>
      <nav
        className='mt-8 flex flex-wrap gap-4 text-sm font-semibold text-cyan-800'
        aria-label={isChinese ? '按任务继续选择' : 'Continue by task'}
      >
        {taskFirstEntryPoints.map((item) => (
          <Link key={item.href} href={item.href} className='underline'>
            {item.title}
          </Link>
        ))}
        <Link href='/new' className='underline'>
          {isChinese ? '最近新增' : 'New additions'}
        </Link>
      </nav>
    </div>
  );
}
