import { Metadata } from 'next';
import { ArrowRight, CheckCircle2, ExternalLink, Star } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/app/navigation';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import { toolToListRow } from '@/lib/services/toolPresenter';
import { getTools } from '@/lib/services/tools';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';
import { StructuredDataServer } from '@/components/seo/StructuredData';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.home',
  });

  return {
    title:
      locale === 'cn' || locale === 'tw' ? '最佳免费 AI 工具 | AI Best Tool' : `Best free AI tools | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '一份按实际可用性整理的免费 AI 工具榜单。'
        : 'A practical ranking of free AI tools based on real usefulness.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
    {
      name: isChinese ? '最佳免费 AI 工具' : 'Best free AI tools',
      url: `${siteUrl}/${locale}/guides/best-free-ai-tools`,
    },
  ]);
  const faqSchema = generateFAQSchema([
    {
      question: isChinese ? '你们如何判断“最好”？' : 'How do you decide what is "best"?',
      answer: isChinese
        ? '我们优先看真实可用性、更新情况、评分和实际内容完整度，而不是只看营销文案。'
        : 'We prioritize practical usefulness, freshness, ratings, and content completeness, not marketing copy.',
    },
    {
      question: isChinese ? '为什么只列免费工具？' : 'Why only free tools?',
      answer: isChinese
        ? '因为很多用户会先从免费方案开始试用，这份榜单就是为了帮你更快筛掉不值得试的工具。'
        : 'Because many people start with free tiers, and this list is meant to help you filter faster.',
    },
    {
      question: isChinese ? '免费工具会不会很快失效？' : 'Do free tools become obsolete quickly?',
      answer: isChinese
        ? '会有一部分变化，所以我们更看重近期更新和真实使用痕迹。'
        : 'Some will change quickly, so freshness and real usage signals matter a lot.',
    },
  ]);

  const [result, categories] = await Promise.all([
    getTools({ pricing: 'free', status: 'published' }, { page: 1, pageSize: 8 }, 'popular'),
    getAllCategories(true).catch(() => []),
  ]);

  const categoryMap = new Map(categories.map((category) => [category.id, category]));

  const rankedTools = result.data.map((tool, index) => ({
    ...toolToListRow(tool, locale),
    rank: index + 1,
    pricing: tool.pricing,
    categoryLabel:
      tool.categoryId && categoryMap.has(tool.categoryId)
        ? getLocalizedField(categoryMap.get(tool.categoryId)!.name, locale)
        : '',
    averageRating: tool.averageRating,
    ratingCount: tool.ratingCount,
    viewCount: tool.viewCount,
  }));

  const chineseTips = [
    '先看是不是免费可长期用，而不只是试用。',
    '优先看最近是否更新、是否有截图、是否能直接上手。',
    '如果有同类工具，先对比更新和评分，再决定试用顺序。',
  ];
  const englishTips = [
    'Check whether it is truly free to use, not just a temporary trial.',
    'Prefer recent updates, screenshots, and low-friction onboarding.',
    'If similar tools exist, compare freshness and ratings before trying.',
  ];
  const tips = isChinese ? chineseTips : englishTips;

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={faqSchema} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Star className='size-4' />
              {isChinese ? '最佳免费 AI 工具' : 'Best free AI tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <CheckCircle2 className='size-4' />
              {isChinese ? '先试用再决定' : 'Try before paying'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese ? '最佳免费 AI 工具' : 'Best free AI tools'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '这份榜单只看免费版本的实际可用性，不看花哨宣传。你可以先从这里开始，再进入分类和详情页做进一步判断。'
              : 'This ranking focuses on the actual usefulness of free tiers, not hype. Start here, then use categories and detail pages to decide what to try next.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/guides/free-ai-tools'
              ctaId='best_free_tools_guide_intro'
              ctaLabel='Best free tools guide intro'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看免费工具指南' : 'Read the free tools guide'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/explore?pricing=free&sort=popular'
              ctaId='best_free_tools_browse'
              ctaLabel='Best free tools browse'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '浏览免费工具' : 'Browse free tools'}
              <ArrowRight className='size-4' />
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图入口' : 'High-intent path'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '从免费榜单走向真实候选的下一步' : 'The next step after the free ranking'}
          </h2>
          <div className='mt-4 grid gap-3 md:grid-cols-3'>
            <Link
              href='/explore?pricing=free&sort=popular'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? '免费筛选页' : 'Free filter'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '当榜单不够细时，继续用免费过滤后的 Explore 扩大候选。'
                  : 'If the ranking is still too broad, widen the shortlist in Explore with the free filter applied.'}
              </p>
            </Link>
            <Link
              href='/guides/free-ai-tools'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? '免费指南' : 'Free tools guide'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '回到判断页，再看限制、更新和评论这些筛选标准。'
                  : 'Return to the judging guide for limits, freshness, and review-based filtering criteria.'}
              </p>
            </Link>
            <Link
              href='/categories/productivity?sort=popular'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? '常见类目' : 'Popular category'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你已经知道场景，直接进入最贴近的类目更快。'
                  : 'If the use case is already clear, jumping into the closest category is faster.'}
              </p>
            </Link>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '评估顺序' : 'How we judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看免费是不是能真用，再看体验' : 'First check whether it is truly usable for free'}
            </h2>
            <div className='mt-4 space-y-3'>
              {tips.map((tip) => (
                <div key={tip} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  <div className='flex items-start gap-3'>
                    <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-emerald-600' />
                    <span>{tip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className='rounded-[18px] border border-slate-200 bg-slate-50 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '你可以先看' : 'Start with'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先从这些入口开始筛选' : 'These entry points help you narrow down fast'}
            </h2>
            <div className='mt-4 grid gap-2'>
              <Link
                href='/guides'
                className='flex items-center justify-between rounded-lg border border-white bg-white px-4 py-3 text-sm text-slate-700 shadow-sm hover:bg-slate-100'
              >
                <span>{isChinese ? '指南总览' : 'Guides hub'}</span>
                <ArrowRight className='size-4 text-slate-400' />
              </Link>
              <Link
                href='/categories/productivity'
                className='flex items-center justify-between rounded-lg border border-white bg-white px-4 py-3 text-sm text-slate-700 shadow-sm hover:bg-slate-100'
              >
                <span>{isChinese ? '生产力类示例' : 'Productivity example'}</span>
                <ArrowRight className='size-4 text-slate-400' />
              </Link>
            </div>
          </aside>
        </section>

        <section className='mt-8'>
          <div className='mb-4 flex items-end justify-between gap-3'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
                {isChinese ? '免费榜单' : 'Free ranking'}
              </p>
              <h2 className='mt-1 text-2xl font-bold text-slate-950'>
                {isChinese ? '当前值得先试的免费工具' : 'Free tools worth trying first'}
              </h2>
            </div>
            <p className='text-sm text-slate-500'>
              {isChinese ? `共 ${result.total} 个免费工具` : `${result.total} free tools`}
            </p>
          </div>

          <div className='grid gap-4 lg:grid-cols-2'>
            {rankedTools.map((tool) => {
              let ratingLabel = isChinese ? '暂无评分' : 'No rating yet';
              if (tool.averageRating) {
                ratingLabel = `${tool.averageRating.toFixed(1)}★`;
              }

              return (
                <Link
                  key={tool.id}
                  href={`/ai/${tool.name}`}
                  className='group rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'
                >
                  <div className='flex items-start gap-4'>
                    <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700'>
                      <span className='text-sm font-bold'>#{tool.rank}</span>
                    </div>
                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <h3 className='text-lg font-semibold text-slate-950'>{tool.title}</h3>
                        <span className='rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700'>
                          {isChinese ? '免费' : 'Free'}
                        </span>
                      </div>
                      <p className='mt-2 line-clamp-2 text-sm leading-6 text-slate-600'>{tool.content}</p>
                      <div className='mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500'>
                        <span>{ratingLabel}</span>
                        <span>{tool.ratingCount ? `${tool.ratingCount} ${isChinese ? '条评分' : 'ratings'}` : ''}</span>
                        <span>{tool.categoryLabel}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
        <GuideSubmissionPath locale={locale} ctaPrefix='best_free_ai_tools' />
      </div>
    </>
  );
}
