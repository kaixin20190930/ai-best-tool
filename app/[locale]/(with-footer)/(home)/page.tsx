import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { getWebNavigationList } from '@/network/webNavigation';
import { ArrowRight, BadgeCheck, Clock3, Compass, FolderOpen, Search as SearchIcon, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { FEATURED_GUIDE_HREFS, GUIDE_PAGES } from '@/lib/content/guides';
import { topListTopics } from '@/lib/data/topLists';
import { BASE_URL } from '@/lib/env';
import { SEO_CONFIG } from '@/lib/seo/constants';
import { buildLocalizedPageMetadata } from '@/lib/seo/metadata';
import { generateOrganizationSchema, generateWebSiteSchema } from '@/lib/seo/schema';
import { getLocalizedField as getCategoryLocalizedField, getPopularCategories } from '@/lib/services/categories';
import { getCommunityHighlights, getRecentDiscussions, getRisingTools } from '@/lib/services/community';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import Faq from '@/components/Faq';
import CommunityPulse from '@/components/home/CommunityPulse';
import Search from '@/components/Search';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import WebNavCardList from '@/components/webNav/WebNavCardList';
import { Link } from '@/app/navigation';

const ScrollToTop = dynamic(() => import('@/components/page/ScrollToTop'), { ssr: false });

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.home',
  });

  const isChinese = locale === 'cn' || locale === 'tw';
  const title = isChinese
    ? 'AI 工具目录：按场景比较精选 AI 工具 | AI Best Tool'
    : 'AI Tools Directory: Compare Curated AI Tools | AI Best Tool';
  const description = isChinese
    ? '按写作、研究、开发、自动化和 Web3 等真实场景浏览 AI 工具，通过来源、价格、限制、核查日期与变化记录判断哪款更适合。'
    : 'Browse an AI tools directory by real use case, then compare sources, pricing, limits, review dates, and material changes before choosing.';
  return buildLocalizedPageMetadata({
    locale,
    path: '/',
    title,
    description,
    keywords: t('keywords'),
    image: '/images/aibesttool.png',
    baseUrl: BASE_URL,
  });
}

export const revalidate = 3600;

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className='mb-5 flex flex-col gap-2 lg:mb-6'>
      <h2 className='text-2xl font-bold text-slate-950 lg:text-3xl'>{title}</h2>
      <p className='max-w-2xl text-sm leading-6 text-slate-600'>{description}</p>
    </div>
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations('Home');
  const isChinese = locale === 'cn' || locale === 'tw';
  const [latestToolsResult, popularCategoriesResult] = await Promise.allSettled([
    getWebNavigationList({ locale, pageNum: 1, pageSize: 12 }),
    getPopularCategories(8),
  ]);
  const latestTools =
    latestToolsResult.status === 'fulfilled'
      ? latestToolsResult.value
      : { code: 200, msg: 'success', rows: [], total: 0 };
  const popularCategories = popularCategoriesResult.status === 'fulfilled' ? popularCategoriesResult.value : [];
  const communityHighlights = await getCommunityHighlights(3).catch(() => []);
  const recentDiscussions = await getRecentDiscussions(3).catch(() => []);
  const risingTools = await getRisingTools(3).catch(() => []);
  const totalVisibleTools = latestTools.total || latestTools.rows.length;
  const heroTitle = isChinese
    ? '用证据、限制和真实变化比较 AI 工具'
    : 'Compare AI tools with evidence, limits, and real changes';
  const heroSubtitle = isChinese
    ? '先确认要解决的任务，再查看官方来源、适用边界、最后核查和下一步比较。这里不替所有人选唯一第一名，而是帮助你排除不合适的选择。'
    : 'Start with the task, then inspect official sources, fit boundaries, last-checked dates, and what to compare next. We help you rule out poor fits rather than name one winner for everyone.';
  const stats = [
    {
      label: isChinese ? '公开工具' : 'Published tools',
      value: `${totalVisibleTools}`,
      icon: Compass,
    },
    {
      label: isChinese ? '决策信号' : 'Decision signals',
      value: isChinese ? '来源 + 限制' : 'Sources + limits',
      icon: BadgeCheck,
    },
    {
      label: isChinese ? '变化记录' : 'Change history',
      value: isChinese ? '查看来源与日期' : 'Sources + dates',
      icon: Clock3,
    },
  ];

  const quickFilters = [
    {
      label: isChinese ? '免费工具' : 'Free tools',
      href: '/explore?pricing=free&sort=popular',
    },
    {
      label: isChinese ? '免费试用' : 'Freemium',
      href: '/explore?pricing=freemium&sort=popular',
    },
    {
      label: isChinese ? '热门优先' : 'Most popular',
      href: '/explore?sort=popular',
    },
    {
      label: isChinese ? '最近更新' : 'Latest updates',
      href: '/new',
    },
  ];
  const taskFirstEntryPoints = [
    {
      href: '/guides/ai-writing-tools',
      title: isChinese ? '我要写内容' : 'I need to write content',
      description: isChinese
        ? '先看写作场景、价格和输出质量，再决定具体工具。'
        : 'Start with writing use cases, pricing, and output quality before picking tools.',
    },
    {
      href: '/guides/ai-coding-tools',
      title: isChinese ? '我要做开发' : 'I need coding tools',
      description: isChinese
        ? '先看 IDE、补全、Agent 和工作流集成，再去比较具体产品。'
        : 'Start with IDE, completion, agent, and workflow fit before comparing products.',
    },
    {
      href: '/guides/ai-tools-for-research',
      title: isChinese ? '我要做研究' : 'I need research tools',
      description: isChinese
        ? '先看资料发现、引用和证据整理，再决定要不要深入某个工具。'
        : 'Start with discovery, citations, and evidence gathering before diving into tools.',
    },
    {
      href: '/guides/how-to-choose-ai-tools',
      title: isChinese ? '我还没想好' : 'I am still deciding',
      description: isChinese
        ? '先看选型方法，弄清楚该比哪些维度。'
        : 'Start with the selection guide to clarify which dimensions matter.',
    },
  ];
  const featuredGuidePages = FEATURED_GUIDE_HREFS.map((href) => GUIDE_PAGES.find((page) => page.href === href)).filter(
    (page): page is (typeof GUIDE_PAGES)[number] => Boolean(page),
  );

  const priorityTopListKeys = [
    'ai-coding-tools',
    'ai-agent-tools',
    'ai-chatbot-tools',
    'ai-image-tools',
    'ai-research-tools',
    'ai-video-tools',
    'ai-writing-tools',
    'ai-content-creation-tools',
  ] as const;
  const priorityTopListTopics = priorityTopListKeys
    .map((key) => topListTopics.find((topic) => topic.key === key))
    .filter((topic): topic is (typeof topListTopics)[number] => Boolean(topic));

  // Generate Organization schema for homepage
  const organizationSchema = generateOrganizationSchema({
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.siteUrl,
    logo: `${SEO_CONFIG.siteUrl}/images/aibesttool.png`,
    description: SEO_CONFIG.defaultDescription,
    socialLinks: [
      // Add social media links here when available
      // Example: 'https://twitter.com/aibesttool',
      // 'https://facebook.com/aibesttool',
      // 'https://linkedin.com/company/aibesttool'
    ],
  });
  const webSiteSchema = locale === 'en' ? generateWebSiteSchema(BASE_URL, SEO_CONFIG.siteName) : null;

  return (
    <>
      <StructuredDataServer data={organizationSchema} />
      {webSiteSchema ? <StructuredDataServer data={webSiteSchema} /> : null}
      <div className='relative w-full bg-slate-50'>
        <section className='border-b border-slate-200 bg-white'>
          <div className='mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-6 lg:py-16'>
            <div className='flex flex-col justify-center'>
              <div className='mb-4 flex flex-wrap gap-2'>
                <span className='inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700'>
                  <Sparkles className='size-4' />
                  {isChinese ? 'AI 工具目录' : 'AI tools directory'}
                </span>
                <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
                  <BadgeCheck className='size-4' />
                  {isChinese ? '证据提取 + 编辑复核' : 'Evidence extracted, editorially reviewed'}
                </span>
              </div>

              <h1 className='max-w-4xl text-4xl font-bold leading-tight text-slate-950 lg:text-6xl'>{heroTitle}</h1>
              <p className='mt-5 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>{heroSubtitle}</p>

              <div className='mt-7 max-w-2xl rounded-lg bg-slate-50 p-2 ring-1 ring-slate-200'>
                <Search
                  placeholder={
                    isChinese ? '搜索 AI 工具、场景或产品名...' : 'Search AI tools, use cases, or product names...'
                  }
                  taskHint={isChinese ? '按任务搜索' : 'Search by task'}
                  taskDescription={
                    isChinese
                      ? '先说出你要解决的问题，再筛价格、限制、核查状态和真实反馈。'
                      : 'Start with the problem, then filter by pricing, limits, review status, and real feedback.'
                  }
                  taskSuggestions={taskFirstEntryPoints.map((item) => ({
                    label: item.title,
                    href: item.href,
                  }))}
                  className='p-0 sm:p-0'
                />
              </div>

              <div className='mt-3 flex flex-wrap items-center gap-2'>
                <span className='text-sm font-medium text-slate-500'>
                  {isChinese ? '快捷筛选：' : 'Quick filters:'}
                </span>
                {quickFilters.map((filter) => (
                  <Link
                    key={filter.href}
                    href={filter.href}
                    className='rounded-full bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-700 ring-1 ring-cyan-100 hover:bg-cyan-100'
                  >
                    {filter.label}
                  </Link>
                ))}
              </div>

              <div className='mt-7 flex flex-col gap-3 sm:flex-row'>
                <Link
                  href='/find-tools'
                  className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
                >
                  {isChinese ? '按需求帮我选' : 'Find tools for my task'}
                </Link>
                <Link
                  href='/explore'
                  className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
                >
                  {isChinese ? '探索全部工具' : 'Explore all tools'}
                  <ArrowRight className='size-4' />
                </Link>
              </div>
            </div>

            <aside className='grid content-start gap-3'>
              {stats.map((stat) => (
                <div key={stat.label} className='rounded-lg bg-slate-950 p-5 text-white shadow-sm'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-slate-300'>{stat.label}</p>
                      <p className='mt-2 text-3xl font-bold'>{stat.value}</p>
                    </div>
                    <stat.icon className='size-8 text-emerald-300' />
                  </div>
                </div>
              ))}
            </aside>
          </div>
        </section>
        <div className='mx-auto max-w-7xl px-4 py-8 lg:px-6'>
          <section>
            <div className='mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
              <SectionHeader title={t('latestTools')} description={t('latestToolsDescription')} />
              <Link
                href='/new'
                className='inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950'
              >
                {isChinese ? '查看本周新增' : 'View new this week'}
                <Clock3 className='size-4' />
              </Link>
            </div>
            <WebNavCardList locale={locale} dataList={latestTools.rows.slice(0, 6)} contextLabel='latest' />
          </section>
        </div>

        <section className='mx-auto my-8 max-w-7xl rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
          <div className='flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
                {isChinese ? '按任务看榜单' : 'Lists by task'}
              </p>
              <h2 className='mt-1 text-2xl font-bold text-slate-950'>
                {isChinese ? '先看最容易做决定的榜单' : 'Start with the lists that make the decision easier'}
              </h2>
            </div>
            <p className='max-w-3xl text-sm leading-6 text-slate-600'>
              {isChinese
                ? '按编程、Agent、研究、视频或写作等任务，查看相关候选的适用场景与限制。'
                : 'Choose a task such as coding, agents, research, video, or writing to compare relevant candidates and their limits.'}
            </p>
          </div>

          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
            {priorityTopListTopics.slice(0, 4).map((topic) => (
              <TrackableCtaLink
                key={topic.key}
                href={`/${locale}/best-ai-tools/${topic.key}`}
                ctaId={`home_top_list_${topic.key}`}
                ctaLabel={topic.title}
                pageType='home'
                className='group rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50/60'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-sm font-semibold text-slate-950'>{topic.title}</p>
                    <p className='mt-2 text-sm leading-6 text-slate-600'>{topic.summary}</p>
                  </div>
                  <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700' />
                </div>
              </TrackableCtaLink>
            ))}
          </div>
        </section>

        <CommunityPulse
          locale={locale}
          highlights={communityHighlights}
          discussions={recentDiscussions}
          risingTools={risingTools}
          isChinese={isChinese}
        />

        <div className='mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 lg:px-6 lg:py-12'>
          {popularCategories.length > 0 && (
            <section>
              <SectionHeader
                title={isChinese ? '按场景快速发现' : 'Browse by use case'}
                description={
                  isChinese
                    ? '从热门分类进入，快速缩小选择范围。'
                    : 'Start from popular categories and narrow the search quickly.'
                }
              />
              <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                {popularCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className='group rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md'
                  >
                    <div className='mb-4 inline-flex rounded-lg bg-cyan-50 p-2 text-cyan-700'>
                      <FolderOpen className='size-5' />
                    </div>
                    <div className='flex items-start justify-between gap-3'>
                      <div>
                        <h3 className='font-semibold text-slate-950'>
                          {getCategoryLocalizedField(category.name, locale)}
                        </h3>
                        <p className='mt-1 text-sm text-slate-500'>
                          {category.toolCount} {isChinese ? '个工具' : 'tools'}
                        </p>
                      </div>
                      <ArrowRight className='mt-1 size-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700' />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm lg:flex lg:items-center lg:gap-8 lg:p-8'>
            <div className='min-w-0 lg:flex-1'>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
                {isChinese ? '选型指南' : 'Selection guide'}
              </p>
              <h2 className='mt-1 text-2xl font-bold text-slate-950'>
                {isChinese ? '先学会怎么选，再去看工具' : 'Learn how to choose before browsing tools'}
              </h2>
              <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你还不确定该看哪些维度，这个指南会先帮你理清场景、价格、更新和反馈。'
                  : 'If you are unsure what to compare, this guide helps you sort out use case, pricing, freshness, and feedback first.'}
              </p>
            </div>
            <div className='mt-6 grid gap-3 sm:grid-cols-2 lg:mt-0 lg:flex-[1.1] xl:grid-cols-3'>
              <Link
                href='/guides/how-to-choose-ai-tools'
                className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
              >
                {isChinese ? '打开选型指南' : 'Open guide'}
                <ArrowRight className='size-4' />
              </Link>
              {featuredGuidePages.slice(1, 3).map((guide) => (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className='inline-flex min-w-0 items-center justify-between gap-2 rounded-lg bg-white px-5 py-3 text-left text-sm font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-100'
                >
                  <span className='min-w-0 break-words'>{guide.title[isChinese ? 'cn' : 'en']}</span>
                  <ArrowRight className='size-4' />
                </Link>
              ))}
            </div>
          </section>

          <Link
            href='/explore'
            className='mx-auto flex w-fit items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
          >
            {t('exploreMore')}
            <SearchIcon className='size-4' />
          </Link>

          <Faq />
          <ScrollToTop />
        </div>
      </div>
    </>
  );
}
