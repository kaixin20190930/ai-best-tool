import { Metadata } from 'next';
import { ArrowRight, CheckCircle2, Columns3, ExternalLink, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema, generateItemListSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import { toolToListRow } from '@/lib/services/toolPresenter';
import { getTools } from '@/lib/services/tools';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import { Link } from '@/app/navigation';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.home',
  });

  return {
    title:
      locale === 'cn' || locale === 'tw'
        ? 'AI 编程工具对比 | AI Best Tool'
        : `AI coding tools comparison | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '对比几款常见的 AI 编程工具，帮你更快选出适合的一个。'
        : 'Compare common AI coding tools to choose the one that fits you best.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
    {
      name: isChinese ? '编程工具对比' : 'Coding tools comparison',
      url: `${siteUrl}/${locale}/guides/ai-coding-tools-comparison`,
    },
  ]);

  const faqSchema = generateFAQSchema([
    {
      question: isChinese ? '你们比较的依据是什么？' : 'What do you compare?',
      answer: isChinese
        ? '我们主要看免费可用性、评分、更新情况、内容完整度和实际使用感。'
        : 'We compare free usability, ratings, freshness, content completeness, and practical usefulness.',
    },
    {
      question: isChinese ? '为什么只看编程工具？' : 'Why only coding tools?',
      answer: isChinese
        ? '因为编程场景对比意图很强，且用户通常会认真比较上下文、编辑器支持和仓库工作流。'
        : 'Because coding has very strong compare intent and users often care deeply about context, editor support, and repo workflows.',
    },
  ]);

  const [toolsResult, categoriesResult] = await Promise.allSettled([
    getTools({ search: 'code', status: 'published' }, { page: 1, pageSize: 4 }, 'popular'),
    getAllCategories(true),
  ]);

  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const tools = toolsResult.status === 'fulfilled' ? toolsResult.value.data : [];
  const toolRows = tools.map((tool, index) => {
    const row = toolToListRow(tool, locale);
    return {
      ...row,
      rank: index + 1,
      pricing: tool.pricing,
      categoryLabel:
        tool.categoryId && categoryMap.has(tool.categoryId)
          ? getLocalizedField(categoryMap.get(tool.categoryId)!.name, locale)
          : '',
      averageRating: tool.averageRating,
      ratingCount: tool.ratingCount,
      summary: row.content,
    };
  });

  const itemListSchema = generateItemListSchema(
    toolRows.map((tool) => ({
      name: tool.title,
      url: `${siteUrl}/${locale}/ai/${tool.name}`,
    })),
    isChinese ? 'AI coding tools comparison' : 'AI coding tools comparison',
  );

  const tips = isChinese
    ? [
        '先看你是代码补全、调试、重构还是脚手架，不同场景侧重点不一样。',
        '如果你想先试再买，优先看免费版本的限制和上下文长度。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ]
    : [
        'Start with your use case: completion, debugging, refactoring, or scaffolding all need different things.',
        'If you want to try before paying, focus on free-tier limits and context length.',
        'For long-term use, pay attention to freshness, ratings, and real comments.',
      ];
  const quickStarts = [
    {
      href: '/best-ai-tools/ai-coding-tools',
      title: isChinese ? '编程榜单' : 'Coding ranking',
      desc: isChinese ? '先看 shortlist，再回比较页。' : 'Start with the shortlist, then come back to compare.',
    },
    {
      href: '/guides/ai-coding-tools',
      title: isChinese ? '编程指南' : 'Coding guide',
      desc: isChinese
        ? '重新确认是补全、调试还是脚手架。'
        : 'Re-check whether the task is completion, debugging, or scaffolding.',
    },
    {
      href: '/ai/cursor',
      title: 'Cursor',
      desc: isChinese ? '适合编辑器内编码和重构。' : 'Great for editor-based coding and refactoring.',
    },
    {
      href: '/ai/github-copilot',
      title: 'GitHub Copilot',
      desc: isChinese ? '适合补全、解释和日常编码。' : 'Useful for completion, explanation, and daily coding.',
    },
  ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={faqSchema} />
      <StructuredDataServer data={itemListSchema} />

      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '先看这些入口' : 'Start here'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '从榜单、指南和代表工具开始收窄' : 'Narrow from ranking, guide, and representative tools'}
          </h2>
          <div className='mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {quickStarts.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='rounded-xl border border-white bg-white p-4 shadow-sm transition hover:bg-slate-50'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Columns3 className='size-4' />
              {isChinese ? '编程工具对比' : 'Coding tools comparison'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Sparkles className='size-4' />
              {isChinese ? '快速对照' : 'Quick compare'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese ? 'AI 编程工具对比' : 'AI coding tools comparison'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '如果你已经知道自己要用编程工具，这一页会帮你把几款常见产品放在一起看，减少来回试错。'
              : 'If you already know you need a coding tool, this page helps you compare a few common products side by side and reduce trial-and-error.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/guides/ai-coding-tools'
              ctaId='coding_comparison_guide'
              ctaLabel='Coding comparison guide'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '回到编程指南' : 'Back to coding guide'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-coding-tools'
              ctaId='coding_comparison_ranking'
              ctaLabel='Coding comparison ranking'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看编程榜单' : 'Open coding ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/explore?search=coding&sort=popular'
              ctaId='coding_comparison_browse'
              ctaLabel='Coding comparison browse'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '浏览更多编程工具' : 'Browse more coding tools'}
              <ArrowRight className='size-4' />
            </TrackableCtaLink>
          </div>
        </section>

        <GuideEvidencePanel
          locale={locale}
          scope={
            isChinese
              ? '编程工具的判断重点通常不是“写得更像”，而是上下文理解、编辑器联动、调试效率和团队工作流是否真的更顺。'
              : 'Coding tool decisions are usually not about sounding smarter, but about context understanding, editor integration, debugging speed, and whether the team workflow actually feels smoother.'
          }
          items={[
            {
              label: isChinese ? '上下文理解' : 'Context understanding',
              value: isChinese ? '优先看是否真懂仓库和 diff' : 'Check whether it truly understands the repo and diff',
              note: isChinese
                ? '代码建议要能跟当前上下文对上，而不是只给通用答案。'
                : 'Code suggestions need to match the current context instead of giving generic answers.',
            },
            {
              label: isChinese ? '编辑器联动' : 'Editor integration',
              value: isChinese ? '看是否顺手融入日常编码' : 'See whether it fits daily coding naturally',
              note: isChinese
                ? '真正有用的工具通常不是多一个按钮，而是少一次切换。'
                : 'Useful tools often remove a context switch rather than add another button.',
            },
            {
              label: isChinese ? '调试与重构' : 'Debugging and refactoring',
              value: isChinese ? '看它能不能帮你继续往下走' : 'Check whether it helps you move forward',
              note: isChinese
                ? '调试、解释和重构比单纯补全更能体现真实价值。'
                : 'Debugging, explanation, and refactoring show more real value than autocomplete alone.',
            },
          ]}
        />

        <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '最近验证' : 'Last checked'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-13</p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '这页已按真实编码决策路径重新核对，保留上下文、编辑器和调试入口。'
                : 'This page has been rechecked against a real coding decision path and keeps context, editor, and debugging entry points visible.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '保留索引，补真实编码证据' : 'Keep it indexable and add real coding evidence'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '用仓库上下文、调试记录和真人评论把它和泛开发页区分开。'
                : 'Use repo context, debugging notes, and real comments to differentiate it from generic dev pages.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '补真实编码场景和反馈' : 'Add real coding scenarios and feedback'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '后续优先补仓库案例、编辑器联动样例和真人评论。'
                : 'Next, prioritize repo cases, editor integration examples, and real comments.'}
            </p>
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图入口' : 'High-intent path'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '对比之后，回到榜单和真实候选继续收窄'
              : 'After the comparison, narrow down through the ranking and real candidates'}
          </h2>
          <div className='mt-4 grid gap-3 md:grid-cols-3'>
            <Link
              href='/best-ai-tools/ai-coding-tools'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? '编程榜单' : 'Coding ranking'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '先回到高相关榜单，再决定最终 shortlist。'
                  : 'Return to the highest-fit ranking before deciding on the final shortlist.'}
              </p>
            </Link>
            <Link
              href='/guides/ai-coding-tools'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? '编程指南' : 'Coding guide'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你还想重新按场景判断，再回指南页。'
                  : 'If you want to re-check the use case framing, go back to the guide.'}
              </p>
            </Link>
            <Link
              href='/explore?search=coding&sort=popular'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? '更多候选' : 'More candidates'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果榜单还不够，就继续在 Explore 里扩候选。'
                  : 'If the ranking is still too narrow, widen the shortlist in Explore.'}
              </p>
            </Link>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '比较顺序' : 'How to compare'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看任务，再看上下文和工作流' : 'Start with the task, then context and workflow'}
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
              {isChinese ? '可直接进入' : 'Quick links'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '编程相关入口' : 'Coding-related entry points'}
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
                href='/guides/best-free-ai-tools'
                className='flex items-center justify-between rounded-lg border border-white bg-white px-4 py-3 text-sm text-slate-700 shadow-sm hover:bg-slate-100'
              >
                <span>{isChinese ? '最佳免费 AI 工具' : 'Best free AI tools'}</span>
                <ArrowRight className='size-4 text-slate-400' />
              </Link>
            </div>
          </aside>
        </section>

        <section className='mt-8'>
          <div className='mb-4 flex items-end justify-between gap-3'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
                {isChinese ? '对比列表' : 'Comparison list'}
              </p>
              <h2 className='mt-1 text-2xl font-bold text-slate-950'>
                {isChinese ? '几款常见编程工具的快速对照' : 'A quick side-by-side look at common coding tools'}
              </h2>
            </div>
            <p className='text-sm text-slate-500'>{isChinese ? `${tools.length} 个工具` : `${tools.length} tools`}</p>
          </div>

          <div className='grid gap-4'>
            {toolRows.map((tool, index) => {
              let pricingLabel = isChinese ? '付费' : 'Paid';
              if (tool.pricing === 'free') {
                pricingLabel = isChinese ? '免费' : 'Free';
              } else if (tool.pricing === 'freemium') {
                pricingLabel = isChinese ? '免费增值' : 'Freemium';
              }
              let ratingLabel = 'N/A';
              if (isChinese) {
                ratingLabel = '暂无';
              }
              if (tool.averageRating) {
                ratingLabel = `${tool.averageRating.toFixed(1)}★`;
              }
              return (
                <div key={tool.id} className='rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm'>
                  <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <span className='inline-flex size-8 items-center justify-center rounded-full bg-cyan-50 text-sm font-bold text-cyan-700'>
                          {index + 1}
                        </span>
                        <Link
                          href={`/ai/${tool.name}`}
                          className='text-lg font-semibold text-slate-950 hover:text-cyan-700'
                        >
                          {tool.title}
                        </Link>
                        <span className='rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700'>
                          {pricingLabel}
                        </span>
                      </div>
                      <p className='mt-2 text-sm leading-6 text-slate-600'>{tool.summary}</p>
                    </div>

                    <div className='grid gap-3 text-sm text-slate-600 lg:w-[320px] lg:grid-cols-2'>
                      <div className='rounded-xl bg-slate-50 p-3'>
                        <div className='text-xs uppercase tracking-wide text-slate-500'>
                          {isChinese ? '评分' : 'Rating'}
                        </div>
                        <div className='mt-1 font-semibold text-slate-900'>{ratingLabel}</div>
                      </div>
                      <div className='rounded-xl bg-slate-50 p-3'>
                        <div className='text-xs uppercase tracking-wide text-slate-500'>
                          {isChinese ? '评分数' : 'Reviews'}
                        </div>
                        <div className='mt-1 font-semibold text-slate-900'>{tool.ratingCount || 0}</div>
                      </div>
                      <div className='rounded-xl bg-slate-50 p-3 lg:col-span-2'>
                        <div className='text-xs uppercase tracking-wide text-slate-500'>
                          {isChinese ? '分类' : 'Category'}
                        </div>
                        <div className='mt-1 font-semibold text-slate-900'>
                          {tool.categoryLabel || (isChinese ? '未分类' : 'Uncategorized')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_coding_tools_comparison' />
      </div>
    </>
  );
}
