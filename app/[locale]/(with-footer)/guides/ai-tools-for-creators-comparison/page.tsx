import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 创作者工具对比' : 'AI tools for creators comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的创作者 AI 工具，帮你更快判断内容产出、再包装和发布节奏能力。'
      : 'Compare common creator AI tools to judge content production, repurposing, and publishing workflow fit faster.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '创作者工具', en: 'Creator tools' },
    comparisonLabel: { cn: 'AI 创作者工具对比', en: 'AI tools for creators comparison' },
    description: {
      cn: '如果你已经知道自己是在做内容创作、再包装或多渠道发布，这一页会帮你把常见候选放在一起看，减少反复试错。',
      en: 'If you already know the work is content creation, repurposing, or multi-channel publishing, this page helps you compare common options side by side and reduce trial-and-error.',
    },
    searchQuery: 'creator',
    guideHref: '/guides/ai-tools-for-creators',
    rankingHref: '/best-ai-tools/ai-creator-tools',
    rankingLabel: { cn: '转去创作者榜单页', en: 'Open the creator ranking' },
    backGuideLabel: { cn: '回到创作者指南', en: 'Back to creator guide' },
    altBrowseHref: '/explore?search=creator&sort=popular',
    altBrowseLabel: { cn: '浏览更多创作者工具', en: 'Browse more creator tools' },
    breadcrumbLabel: { cn: '创作者工具对比', en: 'Creator tools comparison' },
    compareTitle: { cn: '几款常见创作者工具的快速对照', en: 'A quick side-by-side look at common creator tools' },
    compareSubtitle: { cn: '创作者', en: 'Creator' },
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-creator-tools',
        title: { cn: '先看创作者榜单', en: 'Start with the creator ranking' },
        description: {
          cn: '如果创作者工具已经是明确目标，先用榜单缩小 shortlist。',
          en: 'If creator tools are clearly the target, narrow the shortlist with the ranking first.',
        },
      },
      {
        href: '/guides/ai-tools-for-content-creation-comparison',
        title: { cn: '转去内容创作工具对比', en: 'Go to content creation tools comparison' },
        description: {
          cn: '如果你更在意脚本、封面和批量生产，这页更贴近。',
          en: 'A better fit when scripts, thumbnails, and batch production are the real priorities.',
        },
      },
      {
        href: '/guides/ai-video-tools-comparison',
        title: { cn: '转去视频工具对比', en: 'Go to video tools comparison' },
        description: {
          cn: '如果视频脚本、剪辑和成片是主要工作流，这页更直接。',
          en: 'Move there if video scripting, editing, and final output are the main workflow.',
        },
      },
      {
        href: '/guides/ai-writing-tools-comparison',
        title: { cn: '转去写作工具对比', en: 'Go to writing tools comparison' },
        description: {
          cn: '如果你更偏文案、长文和改写，这页更直接。',
          en: 'Go there if the workflow is more about copy, long-form writing, and rewriting.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/best-ai-tools/ai-creator-tools',
        title: { cn: '先看创作者榜单页', en: 'Start with the creator ranking' },
        description: {
          cn: '如果你想先收紧 shortlist，再回来细看工作流，就先去榜单页。',
          en: 'Open the ranking first if you want a tighter shortlist before comparing workflows.',
        },
      },
      {
        href: '/guides/ai-tools-for-content-creation-comparison',
        title: { cn: '转去内容创作工具对比', en: 'Switch to content creation tools comparison' },
        description: {
          cn: '如果你更在意脚本、封面和批量内容生产，这页更贴近。',
          en: 'Move there if scripts, thumbnails, and batch content production are the real priorities.',
        },
      },
      {
        href: '/guides/ai-video-tools-comparison',
        title: { cn: '转去视频工具对比', en: 'Switch to video tools comparison' },
        description: {
          cn: '如果你的重点是视频脚本、剪辑和成片，这页更贴近真实工作流。',
          en: 'Move there if scripting, editing, and final video output are the real bottlenecks.',
        },
      },
      {
        href: '/guides/ai-writing-tools-comparison',
        title: { cn: '转去写作工具对比', en: 'Switch to writing tools comparison' },
        description: {
          cn: '如果你更偏文案、长文和改写，这页会更直接。',
          en: 'Go there if the workflow is more about copy, long-form writing, and rewriting.',
        },
      },
    ],
    tips: {
      cn: [
        '先看你的内容类型：短视频、长文、播客、社媒或图文。',
        '优先比较脚本、封面、剪辑和再包装能省下多少时间。',
        '如果持续发布，模板、批量和导出限制通常很关键。',
      ],
      en: [
        'Start with your content type: short video, long-form writing, podcast, social, or graphics.',
        'Prioritize how much time it saves on scripting, thumbnails, editing, and repurposing.',
        'If you publish regularly, templates, batch workflows, and export limits matter a lot.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们主要比较什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要比较内容工作流覆盖、再包装效率、批量能力、导出与实际使用感。',
          en: 'We mainly compare workflow coverage, repurposing speed, batch capability, export support, and practical usefulness.',
        },
      },
      {
        question: { cn: '为什么单独看创作者工具？', en: 'Why compare creator tools separately?' },
        answer: {
          cn: '因为创作者更关心持续产出、内容节奏和多渠道复用，这和普通办公或写作工具并不完全一样。',
          en: 'Because creators care more about publishing cadence, repurposing, and multi-channel output than a normal office or writing workflow.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <section className='mx-auto mt-8 max-w-6xl px-4 lg:px-6'>
        <div className='rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '先看榜单，再决定是创作者套件还是单点工具'
              : 'Start with the ranking, then decide whether you need a creator suite or point tools'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果你已经确认是在找创作者工具，先看榜单会比直接翻分类更快收窄 shortlist。'
              : 'If creator tools are already the goal, the ranking gets you to a shorter shortlist faster than browsing categories first.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-creator-tools',
                title: locale === 'cn' || locale === 'tw' ? '创作者工具榜单' : 'Creator tools ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先收窄到更高相关候选。'
                    : 'Start with the most relevant candidates first.',
              },
              {
                href: '/guides/ai-tools-for-content-creation-comparison',
                title: locale === 'cn' || locale === 'tw' ? '内容创作对比' : 'Content creation comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '脚本、封面和批量生产一起看。'
                    : 'Compare scripts, thumbnails, and batch production together.',
              },
              {
                href: '/guides/ai-video-tools-comparison',
                title: locale === 'cn' || locale === 'tw' ? '视频工具对比' : 'Video tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你的工作流会走向视频。'
                    : 'Useful when the workflow is moving toward video.',
              },
              {
                href: '/guides/ai-writing-tools-comparison',
                title: locale === 'cn' || locale === 'tw' ? '写作工具对比' : 'Writing tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果重点偏文案和长文。'
                    : 'Better when the main need is copy and long-form writing.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`creator_tools_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_creators_comparison' />
    </>
  );
}
