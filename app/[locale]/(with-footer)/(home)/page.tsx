import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getWebNavigationList } from '@/network/webNavigation';
import {
  ArrowRight,
  BadgeCheck,
  CircleChevronRight,
  Clock3,
  Compass,
  FolderOpen,
  Heart,
  MessageSquare,
  Rocket,
  Search as SearchIcon,
  Share2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { listingConfig } from '@/lib/config/listing';
import { FEATURED_GUIDE_HREFS, GUIDE_PAGES } from '@/lib/content/guides';
import { SEO_CONFIG } from '@/lib/seo/constants';
import { generateOrganizationSchema } from '@/lib/seo/schema';
import { getLocalizedField as getCategoryLocalizedField, getPopularCategories } from '@/lib/services/categories';
import { getCommunityHighlights, getRecentDiscussions, getRisingTools } from '@/lib/services/community';
import { toolToListRow } from '@/lib/services/toolPresenter';
import { getPopularTools } from '@/lib/services/tools';
import Faq from '@/components/Faq';
import CommunityPulse from '@/components/home/CommunityPulse';
import Search from '@/components/Search';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import WebNavCardList from '@/components/webNav/WebNavCardList';

const ScrollToTop = dynamic(() => import('@/components/page/ScrollToTop'), { ssr: false });

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.home',
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aibesttool.com';
  const title = t('title');
  const description = t('description');
  const imageUrl = `${siteUrl}/images/aibesttool.png`;

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords: t('keywords'),
    alternates: {
      canonical: './',
    },
    openGraph: {
      type: 'website',
      locale,
      url: siteUrl,
      siteName: 'AI Best Tool',
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: 'AI Best Tool - Discover the Best AI Tools',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@aibesttool',
      creator: '@aibesttool',
      title,
      description,
      images: [imageUrl],
    },
  };
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
  const [latestTools, popularTools, popularCategories] = await Promise.all([
    getWebNavigationList({ locale, pageNum: 1, pageSize: 12 }),
    getPopularTools(6)
      .then((tools) => tools.map((tool) => toolToListRow(tool, locale)))
      .catch(() => []),
    getPopularCategories(8).catch(() => []),
  ]);
  const communityHighlights = await getCommunityHighlights(3).catch(() => []);
  const recentDiscussions = await getRecentDiscussions(3).catch(() => []);
  const risingTools = await getRisingTools(3).catch(() => []);
  const totalVisibleTools = latestTools.total || latestTools.rows.length;
  const heroTitle = isChinese
    ? '发现最新、好用、真实可访问的 AI 工具'
    : 'Discover fresh, useful, and accessible AI tools';
  const heroSubtitle = isChinese
    ? 'AI Best Tool 持续收录市面上的 AI 产品，帮你按场景、热度和更新时间快速找到值得尝试的工具。'
    : 'AI Best Tool tracks AI products across the market so you can find tools by use case, popularity, and freshness.';
  const stats = [
    {
      label: isChinese ? '已收录工具' : 'Indexed tools',
      value: `${totalVisibleTools}+`,
      icon: Compass,
    },
    {
      label: isChinese ? '持续更新' : 'Fresh updates',
      value: isChinese ? '每日' : 'Daily',
      icon: Clock3,
    },
    {
      label: isChinese ? '开发者可提交' : 'Developer submissions',
      value: isChinese ? '开放' : 'Open',
      icon: Rocket,
    },
  ];
  const quickSearches = ['video', 'writing', 'image', 'coding', 'chatbot'];
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
      href: '/explore?sort=latest',
    },
  ];
  const featuredGuidePages = FEATURED_GUIDE_HREFS.map((href) => GUIDE_PAGES.find((page) => page.href === href)).filter(
    (page): page is (typeof GUIDE_PAGES)[number] => Boolean(page),
  );

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

  return (
    <>
      <StructuredDataServer data={organizationSchema} />
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
                  {isChinese ? '人工审核 + 自动采集' : 'Reviewed and collected'}
                </span>
              </div>

              <h1 className='max-w-4xl text-4xl font-bold leading-tight text-slate-950 lg:text-6xl'>{heroTitle}</h1>
              <p className='mt-5 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>{heroSubtitle}</p>

              <div className='mt-7 max-w-2xl rounded-lg bg-slate-50 p-2 ring-1 ring-slate-200'>
                <Search
                  placeholder={
                    isChinese ? '搜索 AI 工具、场景或产品名...' : 'Search AI tools, use cases, or product names...'
                  }
                  className='p-0 sm:p-0'
                />
              </div>

              <div className='mt-4 flex flex-wrap items-center gap-2'>
                <span className='text-sm font-medium text-slate-500'>
                  {isChinese ? '快速搜索：' : 'Popular searches:'}
                </span>
                {quickSearches.map((query) => (
                  <Link
                    key={query}
                    href={`/explore?search=${query}`}
                    className='rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'
                  >
                    {query}
                  </Link>
                ))}
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
                  href='/explore'
                  className='inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800'
                >
                  {isChinese ? '探索全部工具' : 'Explore all tools'}
                  <ArrowRight className='size-4' />
                </Link>
                <Link
                  href='/submit'
                  className='inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-100'
                >
                  {isChinese ? '提交/入驻工具' : 'Submit a tool'}
                  <Rocket className='size-4' />
                </Link>
                <Link
                  href='/developer/listing'
                  className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800'
                >
                  {isChinese ? '开发者入驻' : 'Developer listing'}
                  <BadgeCheck className='size-4' />
                </Link>
              </div>

              <div className='mt-6 rounded-lg border border-cyan-100 bg-cyan-50 p-4'>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                  <div className='min-w-0'>
                    <p className='text-sm font-semibold text-cyan-900'>
                      {isChinese
                        ? '如果你需要更快的节奏或更明显的曝光'
                        : 'If you need faster timing or a bit more visibility'}
                    </p>
                    <p className='mt-1 text-sm leading-6 text-cyan-900/80'>
                      {isChinese
                        ? `${listingConfig.plans.standard_paid.label}：可以作为可选路径，适合发布期和活动期。`
                        : `${listingConfig.plans.standard_paid.summary} ${listingConfig.plans.standard_paid.reviewWindow}.`}
                    </p>
                  </div>
                  <Link
                    href='/developer/listing'
                    className='inline-flex shrink-0 items-center justify-center rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-800'
                  >
                    {isChinese ? '查看可选方案' : 'View optional plan'}
                  </Link>
                </div>
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

        <section className='mx-auto grid w-full max-w-7xl gap-3 px-4 py-0 lg:grid-cols-3 lg:px-6'>
          <Link
            href='/profile/favorites'
            className='rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md'
          >
            <div className='flex items-start gap-3'>
              <span className='inline-flex rounded-lg bg-rose-50 p-2 text-rose-600'>
                <Heart className='size-5' />
              </span>
              <div>
                <p className='text-sm font-semibold text-slate-950'>
                  {isChinese ? '收藏你喜欢的工具' : 'Save the tools you like'}
                </p>
                <p className='mt-1 text-sm leading-6 text-slate-600'>
                  {isChinese
                    ? '登录后即可收藏、回看和管理清单。'
                    : 'Log in to save, revisit, and manage your shortlist.'}
                </p>
              </div>
            </div>
          </Link>
          <Link
            href='/explore?sort=popular'
            className='rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md'
          >
            <div className='flex items-start gap-3'>
              <span className='inline-flex rounded-lg bg-cyan-50 p-2 text-cyan-700'>
                <Share2 className='size-5' />
              </span>
              <div>
                <p className='text-sm font-semibold text-slate-950'>
                  {isChinese ? '分享给团队或朋友' : 'Share with your team'}
                </p>
                <p className='mt-1 text-sm leading-6 text-slate-600'>
                  {isChinese ? '每个详情页都支持一键分享。' : 'Every tool detail page supports quick sharing.'}
                </p>
              </div>
            </div>
          </Link>
          <Link
            href='/developer/listing'
            className='rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md'
          >
            <div className='flex items-start gap-3'>
              <span className='inline-flex rounded-lg bg-emerald-50 p-2 text-emerald-700'>
                <MessageSquare className='size-5' />
              </span>
              <div>
                <p className='text-sm font-semibold text-slate-950'>
                  {isChinese ? '加入讨论和入驻' : 'Join the discussion and listing'}
                </p>
                <p className='mt-1 text-sm leading-6 text-slate-600'>
                  {isChinese
                    ? '先看说明，再提交和沟通付费入驻。'
                    : 'Read the plan, then submit or contact us for paid listing.'}
                </p>
              </div>
            </div>
          </Link>
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
                  ? '如果你还不确定该看哪些维度，这个指南会帮你先理清场景、价格、更新和评论。'
                  : 'If you are unsure what to compare, this guide helps you sort out use case, pricing, freshness, and comments first.'}
              </p>
            </div>
            <div className='mt-6 grid gap-3 sm:grid-cols-2 lg:mt-0 lg:flex-[1.1] xl:grid-cols-3'>
              <Link
                href='/guides/how-to-choose-ai-tools'
                className='inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800'
              >
                {isChinese ? '打开选型指南' : 'Open guide'}
                <ArrowRight className='size-4' />
              </Link>
              {featuredGuidePages.slice(1).map((guide) => (
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

          <section>
            <div className='mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
              <SectionHeader title={t('latestTools')} description={t('latestToolsDescription')} />
              <Link
                href='/explore?sort=latest'
                className='inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950'
              >
                {isChinese ? '查看最新' : 'View latest'}
                <Clock3 className='size-4' />
              </Link>
            </div>
            <WebNavCardList dataList={latestTools.rows} contextLabel='latest' />
          </section>

          {popularTools.length > 0 && (
            <section>
              <div className='mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
                <SectionHeader title={t('popularTools')} description={t('popularToolsDescription')} />
                <Link
                  href='/explore?sort=popular'
                  className='inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950'
                >
                  {isChinese ? '查看热门' : 'View popular'}
                  <TrendingUp className='size-4' />
                </Link>
              </div>
              <WebNavCardList dataList={popularTools} contextLabel='popular' />
            </section>
          )}

          <section className='grid gap-4 rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:p-8'>
            <div>
              <h2 className='text-2xl font-bold text-slate-950'>
                {isChinese ? '开发者想让产品被更多人发现？' : 'Want your AI product discovered?'}
              </h2>
              <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '提交你的 AI 工具进入审核队列。后续可以扩展为付费入驻、推荐位和分类页曝光。'
                  : 'Submit your AI tool for review. This can grow into paid listings, featured placements, and category exposure.'}
              </p>
            </div>
            <Link
              href='/submit'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700'
            >
              {isChinese ? '提交工具' : 'Submit tool'}
              <CircleChevronRight className='size-4' />
            </Link>
          </section>

          <Link
            href='/explore'
            className='mx-auto flex w-fit items-center justify-center gap-3 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800'
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
