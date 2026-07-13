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
        ? 'AI 视频工具对比 | AI Best Tool'
        : `AI video tools comparison | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '对比几款常见的 AI 视频工具，帮你更快选出适合的一个。'
        : 'Compare common AI video tools to choose the one that fits you best.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
    {
      name: isChinese ? '视频工具对比' : 'Video tools comparison',
      url: `${siteUrl}/${locale}/guides/ai-video-tools-comparison`,
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
      question: isChinese ? '为什么只看视频工具？' : 'Why only video tools?',
      answer: isChinese
        ? '因为视频工具通常有很明确的剪辑、生成或配音需求，对比意图也更清晰。'
        : 'Because video tools usually map to clear editing, generation, or voiceover needs, which makes compare intent very clear.',
    },
  ]);

  const [toolsResult, categoriesResult] = await Promise.allSettled([
    getTools({ search: 'video', status: 'published' }, { page: 1, pageSize: 4 }, 'popular'),
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
    isChinese ? 'AI video tools comparison' : 'AI video tools comparison',
  );

  const tips = isChinese
    ? [
        '先看你是剪辑、生成、配音还是短视频营销，不同场景侧重点不一样。',
        '如果你想先试再买，优先看免费版本的限制和导出质量。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ]
    : [
        'Start with your use case: editing, generation, voiceover, or short-form marketing need different things.',
        'If you want to try before paying, focus on free-tier limits and export quality.',
        'For long-term use, pay attention to freshness, ratings, and real comments.',
      ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={faqSchema} />
      <StructuredDataServer data={itemListSchema} />

      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Columns3 className='size-4' />
              {isChinese ? '视频工具对比' : 'Video tools comparison'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Sparkles className='size-4' />
              {isChinese ? '快速对照' : 'Quick compare'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese ? 'AI 视频工具对比' : 'AI video tools comparison'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '如果你已经知道自己要做视频，这一页会帮你把几款常见的视频工具放在一起看，减少来回试错。'
              : 'If you already know you need a video tool, this page helps you compare a few common ones side by side and reduce trial-and-error.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/guides/ai-video-tools'
              ctaId='video_comparison_guide'
              ctaLabel='Video comparison guide'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '回到视频指南' : 'Back to video guide'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-video-tools'
              ctaId='video_comparison_ranking'
              ctaLabel='Video comparison ranking'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看视频榜单' : 'Open video ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/explore?search=video&sort=popular'
              ctaId='video_comparison_browse'
              ctaLabel='Video comparison browse'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '浏览更多视频工具' : 'Browse more video tools'}
              <ArrowRight className='size-4' />
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图入口' : 'High-intent path'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '对比之后，回到榜单和真实候选继续缩小范围'
              : 'After comparing, keep narrowing through the ranking and real candidates'}
          </h2>
          <div className='mt-4 grid gap-3 md:grid-cols-3'>
            <Link
              href='/best-ai-tools/ai-video-tools'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? '视频榜单' : 'Video ranking'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '先回到高相关榜单，再决定最终 shortlist。'
                  : 'Return to the highest-fit ranking before deciding on the final shortlist.'}
              </p>
            </Link>
            <Link
              href='/guides/ai-video-tools'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? '视频指南' : 'Video guide'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你还想重新按场景判断，再回指南页。'
                  : 'If you want to re-check the use case framing, go back to the guide.'}
              </p>
            </Link>
            <Link
              href='/explore?search=video&sort=popular'
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

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '先看榜单，再决定是继续看视频工具还是切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing video tools or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果视频工具已经是明确目标，先收紧 shortlist 往往比继续横向浏览更多页面更有效。'
              : 'If video tools are already the goal, narrowing the shortlist first is usually better than continuing to browse more pages horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-video-tools',
                title: isChinese ? '视频榜单' : 'Video ranking',
                desc: isChinese ? '先收窄到更高相关的候选。' : 'Start with the most relevant candidates first.',
              },
              {
                href: '/guides/ai-video-tools',
                title: isChinese ? '视频工具指南' : 'Video tools guide',
                desc: isChinese
                  ? '重新确认是剪辑、生成还是配音。'
                  : 'Re-check whether you need editing, generation, or voiceover.',
              },
              {
                href: '/guides/ai-tools-for-designers-comparison',
                title: isChinese ? '设计工具对比' : 'Design tools comparison',
                desc: isChinese
                  ? '如果视频流程也包含视觉设计。'
                  : 'Useful when the workflow also includes visual design.',
              },
              {
                href: '/guides/ai-image-tools-comparison',
                title: isChinese ? '图像工具对比' : 'Image tools comparison',
                desc: isChinese
                  ? '如果你其实也在比静态视觉资产。'
                  : 'Better when static visual assets are part of the decision.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`video_comparison_ranking_${item.href.split('/').pop()}`}
                ctaLabel={item.title}
                pageType='guide'
                className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
              </TrackableCtaLink>
            ))}
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '比较顺序' : 'How to compare'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看场景，再看导出和限制' : 'Start with the use case, then export and limits'}
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
              {isChinese ? '视频相关入口' : 'Video-related entry points'}
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
        <GuideEvidencePanel
          locale={locale}
          scope={
            isChinese
              ? '先确认视频工具在剪辑、生成、配音和短视频营销里的真实覆盖，再继续看对比。'
              : 'Check whether these tools actually cover editing, generation, voiceover, and short-form marketing before continuing.'
          }
          items={[
            {
              label: isChinese ? '工作流' : 'Workflow',
              value: isChinese ? '剪辑、生成、配音' : 'Editing, generation, voiceover',
              note: isChinese ? '先看它能不能接住你的主流程。' : 'Check whether it fits the main workflow first.',
            },
            {
              label: isChinese ? '长期使用' : 'Long-term',
              value: isChinese ? '导出、更新、评论' : 'Export, freshness, comments',
              note: isChinese
                ? '持续做视频时这些比标题更重要。'
                : 'These matter more than labels for ongoing video work.',
            },
            {
              label: isChinese ? '真实增量' : 'Real increments',
              value: isChinese ? '案例、场景、owner 认领' : 'Cases, use cases, owner claims',
              note: isChinese ? '把 AI 内容补成更可信的页面。' : 'Use them to make the page more credible.',
            },
          ]}
        />

        <section className='mt-8'>
          <div className='mb-4 flex items-end justify-between gap-3'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
                {isChinese ? '对比列表' : 'Comparison list'}
              </p>
              <h2 className='mt-1 text-2xl font-bold text-slate-950'>
                {isChinese ? '几款常见视频工具的快速对照' : 'A quick side-by-side look at common video tools'}
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
        <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '最近验证' : 'Last checked'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-13</p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '这页已按真实视频工作流重新核对，保留剪辑、生成和配音入口。'
                : 'This page has been rechecked against a real video workflow and keeps editing, generation, and voiceover entry points visible.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '保留索引，补真实视频证据' : 'Keep it indexable and add real video evidence'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '用导出、更新和真人评论把它和泛多媒体页区分开。'
                : 'Use exports, freshness, and real comments to differentiate it from generic multimedia pages.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '补真实视频场景和反馈' : 'Add real video scenarios and feedback'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese ? '后续优先补案例、样例和真人评论。' : 'Next, prioritize cases, samples, and real comments.'}
            </p>
          </div>
        </section>
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_video_tools_comparison' />
      </div>
    </>
  );
}
