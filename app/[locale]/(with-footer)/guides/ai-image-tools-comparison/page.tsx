import { Metadata } from 'next';
import { ArrowRight, CheckCircle2, Columns3, ExternalLink, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { BASE_URL } from '@/lib/env';
import { getNoindexMetadata } from '@/lib/seo/indexing';
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
        ? 'AI 图像工具对比 | AI Best Tool'
        : `AI image tools comparison | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '对比几款常见的 AI 图像工具，帮你更快选出适合的一个。'
        : 'Compare common AI image tools to choose the one that fits you best.',
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const siteUrl = BASE_URL;
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
    {
      name: isChinese ? '图像工具对比' : 'Image tools comparison',
      url: `${siteUrl}/${locale}/guides/ai-image-tools-comparison`,
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
      question: isChinese ? '为什么只看图像工具？' : 'Why only image tools?',
      answer: isChinese
        ? '因为图像工具的意图很清晰，通常就是生成、编辑或设计，对比也更直接。'
        : 'Because image tools usually map to clear generation, editing, or design intent, making comparison much more direct.',
    },
  ]);

  const [toolsResult, categoriesResult] = await Promise.allSettled([
    getTools({ search: 'image', status: 'published' }, { page: 1, pageSize: 4 }, 'popular'),
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
    isChinese ? 'AI image tools comparison' : 'AI image tools comparison',
  );

  const tips = isChinese
    ? [
        '先看你是做生成、修图、抠图还是海报设计，不同场景侧重点不一样。',
        '如果你想先试再买，优先看免费版本的限制和输出质量。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ]
    : [
        'Start with your use case: generation, editing, background removal, or poster design all need different things.',
        'If you want to try before paying, focus on free-tier limits and output quality.',
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
              {isChinese ? '图像工具对比' : 'Image tools comparison'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Sparkles className='size-4' />
              {isChinese ? '快速对照' : 'Quick compare'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese ? 'AI 图像工具对比' : 'AI image tools comparison'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '如果你已经知道自己要做图，这一页会帮你把几款常见的图像工具放在一起看，减少来回试错。'
              : 'If you already know you need an image tool, this page helps you compare a few common ones side by side and reduce trial-and-error.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/guides/ai-image-tools'
              ctaId='image_comparison_guide'
              ctaLabel='Image comparison guide'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '回到图像指南' : 'Back to image guide'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-image-tools'
              ctaId='image_comparison_ranking'
              ctaLabel='Image comparison ranking'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看图像榜单' : 'Open image ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/explore?search=image&sort=popular'
              ctaId='image_comparison_browse'
              ctaLabel='Image comparison browse'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '浏览更多图像工具' : 'Browse more image tools'}
              <ArrowRight className='size-4' />
            </TrackableCtaLink>
          </div>
        </section>

        <GuideEvidencePanel
          locale={locale}
          scope={
            isChinese
              ? '图像工具比较重点不是“谁更会出图”，而是是否能稳定控制风格、编辑、迭代和团队交付。'
              : 'Image tool comparison is less about who can generate prettier images and more about stable style control, editing, iteration, and delivery workflow.'
          }
          decisionSteps={
            isChinese
              ? [
                  '先确认风格控制是否稳定，不要先被出图效果带偏。',
                  '再看编辑、迭代和团队交付是否顺手。',
                  '最后回到真实图像案例和评论，判断能不能长期用。',
                ]
              : [
                  'First confirm style control is stable instead of getting distracted by the image output.',
                  'Then check editing, iteration, and delivery workflow.',
                  'Finally return to real image cases and comments to judge long-term use.',
                ]
          }
          items={[
            {
              label: isChinese ? '风格控制' : 'Style control',
              value: isChinese ? '优先看一致性' : 'Prioritize consistency',
              note: isChinese
                ? '同一项目里是否能保持统一风格是核心。'
                : 'Whether the same project can stay visually coherent is the core question.',
            },
            {
              label: isChinese ? '编辑效率' : 'Editing speed',
              value: isChinese ? '看修改是否顺手' : 'Check whether edits feel easy',
              note: isChinese ? '很多图像工作都在反复修改里完成。' : 'A lot of image work is really iterative editing.',
            },
            {
              label: isChinese ? '交付链路' : 'Delivery chain',
              value: isChinese ? '看能否接入素材与协作' : 'See whether it fits assets and collaboration',
              note: isChinese
                ? '能否顺手进入设计流程比单次演示更重要。'
                : 'How well it fits into the design process matters more than one-off demos.',
            },
          ]}
          signalCards={[
            {
              label: isChinese ? '视觉一致性' : 'Visual consistency',
              value: isChinese ? '先看系列输出是否统一' : 'Check whether outputs stay consistent',
              note: isChinese
                ? '如果同一项目里风格漂移太大，后面就会增加很多返工。'
                : 'If style drifts too much across one project, you will spend more time reworking.',
            },
            {
              label: isChinese ? '编辑信号' : 'Editing signal',
              value: isChinese ? '看修改是否容易接力' : 'See whether edits are easy to iterate',
              note: isChinese
                ? '图像工具的长期价值，往往体现在反复修改是否顺手。'
                : 'Long-term value often shows up in how easily you can iterate on edits.',
            },
            {
              label: isChinese ? '交付信号' : 'Delivery signal',
              value: isChinese ? '素材和协作要顺' : 'Assets and collaboration should fit',
              note: isChinese
                ? '如果不能顺手接入设计协作链路，工具就很难长期留在流程里。'
                : 'If it does not fit the collaboration chain, it is hard to keep the tool in the workflow.',
            },
          ]}
        />

        <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '最近验证' : 'Last checked'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-18</p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '这页已按真实图像决策路径重新核对，保留风格、编辑和交付入口。'
                : 'This page has been rechecked against a real image-tool decision path and keeps style, editing, and delivery entry points visible.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '保留索引，补真实图像证据' : 'Keep it indexable and add real image evidence'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '用风格一致性、修改记录和真人评论把它和泛生成页区分开。'
                : 'Use style consistency, edit history, and real comments to differentiate it from generic generation pages.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '补真实设计场景和反馈' : 'Add real image scenarios and feedback'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '后续优先补图像案例、编辑样例和真人评论。'
                : 'Next, prioritize image cases, editing examples, and real comments.'}
            </p>
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
              href='/best-ai-tools/ai-image-tools'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? '图像榜单' : 'Image ranking'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '先回到高相关榜单，再决定最终 shortlist。'
                  : 'Return to the highest-fit ranking before deciding on the final shortlist.'}
              </p>
            </Link>
            <Link
              href='/guides/ai-image-tools'
              className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{isChinese ? '图像指南' : 'Image guide'}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '如果你还想重新按场景判断，再回指南页。'
                  : 'If you want to re-check the use case framing, go back to the guide.'}
              </p>
            </Link>
            <Link
              href='/explore?search=image&sort=popular'
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
              {isChinese ? '先看场景，再看输出和授权' : 'Start with the use case, then output and licensing'}
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
              {isChinese ? '图像相关入口' : 'Image-related entry points'}
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
                {isChinese ? '几款常见图像工具的快速对照' : 'A quick side-by-side look at common image tools'}
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
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_image_tools_comparison' />
      </div>
    </>
  );
}
