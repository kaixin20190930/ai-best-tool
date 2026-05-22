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
  Rocket,
  Search as SearchIcon,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import Faq from '@/components/Faq';
import Search from '@/components/Search';
import WebNavCardList from '@/components/webNav/WebNavCardList';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import { generateOrganizationSchema } from '@/lib/seo/schema';
import { SEO_CONFIG } from '@/lib/seo/constants';
import { getPopularTools } from '@/lib/services/tools';
import { toolToListRow } from '@/lib/services/toolPresenter';
import {
  getPopularCategories,
  getLocalizedField as getCategoryLocalizedField,
} from '@/lib/services/categories';

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
      locale: locale,
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

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
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

              <h1 className='max-w-4xl text-4xl font-bold leading-tight text-slate-950 lg:text-6xl'>
                {heroTitle}
              </h1>
              <p className='mt-5 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
                {heroSubtitle}
              </p>

              <div className='mt-7 max-w-2xl rounded-lg bg-slate-50 p-2 ring-1 ring-slate-200'>
                <Search
                  placeholder={isChinese ? '搜索 AI 工具、场景或产品名...' : 'Search AI tools, use cases, or product names...'}
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

        <div className='mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 lg:px-6 lg:py-12'>
          {popularCategories.length > 0 && (
            <section>
              <SectionHeader
                title={isChinese ? '按场景快速发现' : 'Browse by use case'}
                description={isChinese ? '从热门分类进入，快速缩小选择范围。' : 'Start from popular categories and narrow the search quickly.'}
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

          <section>
            <div className='mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
              <SectionHeader
                title={t('latestTools')}
                description={t('latestToolsDescription')}
              />
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
                <SectionHeader
                  title={t('popularTools')}
                  description={t('popularToolsDescription')}
                />
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
