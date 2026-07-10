import { Metadata } from 'next';

import { generateBreadcrumbSchema } from '@/lib/seo/schema';
import { getAllCategories } from '@/lib/services/categories';
import { getAllTags } from '@/lib/services/tags';
import { SortBy } from '@/lib/services/tools';
import FilterPanel from '@/components/FilterPanel';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import { generateHreflangMetadata } from '@/components/seo';
import { StructuredDataServer } from '@/components/seo/StructuredData';
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

        <GuideEvidencePanel
          locale={params.locale}
          scope={
            isChinese
              ? '探索页要同时交代筛选逻辑、真实更新和下一步去哪里，而不是只给一张搜索表。'
              : 'The explore page should explain filtering logic, freshness, and the next step instead of acting like a plain search table.'
          }
          items={[
            {
              label: isChinese ? '验证范围' : 'Checked scope',
              value: isChinese ? '筛选、更新、下一步' : 'Filtering, freshness, next step',
              note: isChinese
                ? '先让用户知道怎样更快筛。'
                : 'Help users understand how to narrow down faster.',
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '探索页保留索引' : 'Explore page kept indexable',
              note: isChinese
                ? '承接大盘流量和内部导航。'
                : 'Capture broad traffic and internal navigation.',
            },
            {
              label: isChinese ? '下一步增强' : 'Next enrichment',
              value: isChinese ? '补热门筛选、真实讨论和更新说明' : 'Add popular filters, real discussions, and update notes',
              note: isChinese
                ? '让探索页更像决策中枢。'
                : 'Make explore feel more like a decision hub.',
            },
          ]}
        />

        <section className='mb-8 rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '更细的分类入口' : 'Focused category entry points'}
          </p>
          <h2 className='mt-2 text-2xl font-bold text-slate-950'>
            {isChinese ? '如果方向已经清楚，就直接去细分类' : 'When the direction is clear, jump to focused categories'}
          </h2>
          <p className='mt-3 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? 'Research、Voice、Automation 和 Developer Tools 这些分类更适合高意图筛选，不必先在大类里绕一圈。'
              : 'Research, Voice, Automation, and Developer Tools are stronger for high-intent browsing, so you do not need to stay in the broad buckets first.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/categories/research?sort=popular',
                title: isChinese ? '看研究分类' : 'Open research',
                description: isChinese
                  ? '适合模型发现、资料检索和研究型工作流。'
                  : 'A better fit for model discovery, source gathering, and research workflows.',
              },
              {
                href: '/categories/voice?sort=popular',
                title: isChinese ? '看语音分类' : 'Open voice',
                description: isChinese
                  ? '适合转录、播客、配音和音频优先场景。'
                  : 'A better fit for transcription, podcasting, dubbing, and audio-first workflows.',
              },
              {
                href: '/categories/automation?sort=popular',
                title: isChinese ? '看自动化分类' : 'Open automation',
                description: isChinese
                  ? '适合工作流编排、Agent 和重复任务自动执行。'
                  : 'A better fit for orchestration, agents, and repeatable task automation.',
              },
              {
                href: '/categories/developer-tools?sort=popular',
                title: isChinese ? '看开发者工具分类' : 'Open developer tools',
                description: isChinese
                  ? '适合 API、模型基础设施和开发型工作流。'
                  : 'A better fit for APIs, model infrastructure, and developer workflows.',
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/60'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.description}</p>
              </Link>
            ))}
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
