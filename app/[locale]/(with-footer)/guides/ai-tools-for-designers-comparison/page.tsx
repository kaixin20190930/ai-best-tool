import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 设计工具对比' : 'AI design tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 AI 设计工具，帮你更快选出适合的一个。'
      : 'Compare common AI design tools to choose the one that fits you best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '设计工具', en: 'Design tools' },
    comparisonLabel: { cn: 'AI 设计工具对比', en: 'AI design tools comparison' },
    description: {
      cn: '如果你已经知道自己是要做视觉设计，这一页会帮你把几款常见的设计工具放在一起看，减少反复试错。',
      en: 'If you already know you need design tools, this page helps you compare a few common ones side by side and reduce trial-and-error.',
    },
    searchQuery: 'design',
    guideHref: '/guides/ai-tools-for-designers',
    rankingHref: '/best-ai-tools/ai-image-tools',
    rankingLabel: { cn: '转去设计榜单页', en: 'Open the design ranking' },
    backGuideLabel: { cn: '回到设计指南', en: 'Back to design guide' },
    altBrowseHref: '/explore?search=design&sort=popular',
    altBrowseLabel: { cn: '浏览更多设计工具', en: 'Browse more design tools' },
    breadcrumbLabel: { cn: '设计工具对比', en: 'Design tools comparison' },
    compareTitle: { cn: '几款常见设计工具的快速对照', en: 'A quick side-by-side look at common design tools' },
    compareSubtitle: { cn: '设计', en: 'design' },
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-image-tools',
        title: { cn: '先看设计榜单', en: 'Start with the design ranking' },
        description: {
          cn: '如果视觉设计已经是明确目标，先用榜单缩小 shortlist。',
          en: 'If design is clearly the goal, narrow the shortlist with the ranking first.',
        },
      },
      {
        href: '/guides/ai-tools-for-designers',
        title: { cn: '回到设计指南', en: 'Back to the design guide' },
        description: {
          cn: '如果你还想先理清品牌视觉、海报和 UI 需求，可以回到指南页。',
          en: 'Go back if you still need to clarify brand visuals, posters, and UI needs first.',
        },
      },
      {
        href: '/guides/ai-tools-for-image-tools-comparison',
        title: { cn: '转去图像工具对比', en: 'Go to image tools comparison' },
        description: {
          cn: '如果你的工作更偏图像生成和编辑，这页更高意图。',
          en: 'A higher-intent path when image generation and editing are the real task.',
        },
      },
      {
        href: '/guides/ai-tools-for-content-creation-comparison',
        title: { cn: '转去内容创作工具对比', en: 'Go to content creation tools comparison' },
        description: {
          cn: '如果设计其实是内容生产的一部分，这页更顺。',
          en: 'Move there if design is really part of a larger content production workflow.',
        },
      },
    ],
    tips: {
      cn: [
        '先看你是做品牌、海报、社媒素材还是 UI 视觉，不同场景侧重点不一样。',
        '如果你想先试再买，优先看免费版本的限制和输出质量。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'Start with your use case: brand visuals, posters, social assets, or UI all need different things.',
        'If you want to try before paying, focus on free-tier limits and output quality.',
        'For long-term use, pay attention to freshness, ratings, and real comments.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看免费可用性、评分、更新情况、内容完整度和实际使用感。',
          en: 'We compare free usability, ratings, freshness, content completeness, and practical usefulness.',
        },
      },
      {
        question: { cn: '为什么只看设计工具？', en: 'Why only design tools?' },
        answer: {
          cn: '因为设计工具的意图很清晰，通常就是生成、编辑或品牌视觉，对比也更直接。',
          en: 'Because design tools usually map to clear generation, editing, or brand visual needs, making comparison much more direct.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? '设计工具的判断重点通常不是“谁功能最多”，而是品牌一致性、输出可控性、迭代速度和团队交付流程是否匹配。'
            : 'Design tool decisions are usually not about who has the most features, but about brand consistency, output control, iteration speed, and whether the workflow fits how the team ships work.'
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '输出一致性' : 'Output consistency',
            value:
              locale === 'cn' || locale === 'tw' ? '优先看品牌与视觉统一度' : 'Prioritize brand and visual consistency',
            note:
              locale === 'cn' || locale === 'tw'
                ? '比起炫技，更重要的是同一项目里风格能否稳定。'
                : 'Stability across the same project matters more than flashy demos.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '迭代效率' : 'Iteration speed',
            value:
              locale === 'cn' || locale === 'tw'
                ? '看修改和重做是否顺手'
                : 'Check whether edits and redo loops feel fast',
            note:
              locale === 'cn' || locale === 'tw'
                ? '设计工作往往不是一次生成完成，而是来回调。'
                : 'Design work is usually a loop of edits rather than a one-shot output.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '交付贴合' : 'Delivery fit',
            value:
              locale === 'cn' || locale === 'tw'
                ? '看是否适合团队交付链路'
                : 'See whether it fits the team delivery chain',
            note:
              locale === 'cn' || locale === 'tw'
                ? '能否顺手接入素材、审阅和协作流程很关键。'
                : 'How well it plugs into assets, review, and collaboration is key.',
          },
        ]}
        signalCards={[
          {
            label: locale === 'cn' || locale === 'tw' ? '一致性信号' : 'Consistency signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '先看品牌和视觉是否统一'
                : 'Check whether brand and visuals stay consistent',
            note: locale === 'cn' || locale === 'tw' ? '设计最怕风格跑掉。' : 'Design fails when style drifts.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '迭代信号' : 'Iteration signal',
            value:
              locale === 'cn' || locale === 'tw' ? '看修改和重做是否顺手' : 'See whether edits and rework are smooth',
            note:
              locale === 'cn' || locale === 'tw'
                ? '设计工作本质上是不断迭代。'
                : 'Design is fundamentally an iterative loop.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '交付信号' : 'Delivery signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '看是否适合团队交付流程'
                : 'Check whether it fits the team delivery flow',
            note:
              locale === 'cn' || locale === 'tw'
                ? '素材、审阅和协作接得上最重要。'
                : 'Assets, review, and collaboration need to connect cleanly.',
          },
        ]}
      />
      <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '最近验证' : 'Last checked'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-15</p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '这页已按真实设计决策路径重新核对，保留生成、编辑和团队交付入口。'
              : 'This page has been rechecked against a real design decision path and keeps generation, editing, and delivery entry points visible.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '保留索引，补真实设计证据'
              : 'Keep it indexable and add real design evidence'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '用品牌一致性、修改效率和真人评论把它和泛生成页区分开。'
              : 'Use brand consistency, editing speed, and real comments to differentiate it from generic generation pages.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw' ? '补真实设计场景和反馈' : 'Add real design scenarios and feedback'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '后续优先补设计案例、交付链路样例和真人评论。'
              : 'Next, prioritize design cases, delivery workflow examples, and real comments.'}
          </p>
        </div>
      </section>
      <section className='mx-auto mt-8 max-w-6xl px-4 lg:px-6'>
        <div className='rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '先看榜单，再决定是否继续看设计工具或切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing design tools or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果设计已经是明确目标，先收紧 shortlist 往往比继续横向浏览更多页面更有效。'
              : 'If design is already the goal, narrowing the shortlist first is usually better than continuing to browse more pages horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-image-tools',
                title: locale === 'cn' || locale === 'tw' ? '设计榜单' : 'Design ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先收窄到更高相关的候选。'
                    : 'Start with the most relevant candidates first.',
              },
              {
                href: '/guides/ai-tools-for-designers',
                title: locale === 'cn' || locale === 'tw' ? '设计指南' : 'Design guide',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '重新确认是品牌视觉、海报还是 UI。'
                    : 'Re-check whether the job is brand visuals, posters, or UI.',
              },
              {
                href: '/guides/ai-tools-for-image-tools-comparison',
                title: locale === 'cn' || locale === 'tw' ? '图像工具对比' : 'Image tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你的工作更偏图像生成和编辑。'
                    : 'Useful when image generation and editing are the real task.',
              },
              {
                href: '/guides/ai-tools-for-content-creation-comparison',
                title: locale === 'cn' || locale === 'tw' ? '内容创作对比' : 'Content creation comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果设计其实是更大内容生产流程的一部分。'
                    : 'Better when design is part of a larger content production workflow.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`design_ranking_${item.href.split('/').pop()}`}
                ctaLabel={item.title}
                pageType='guide'
                className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
              </TrackableCtaLink>
            ))}
          </div>
        </div>
      </section>
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_designers_comparison' />
    </>
  );
}
