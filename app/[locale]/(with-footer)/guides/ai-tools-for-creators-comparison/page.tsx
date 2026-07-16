import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
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
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? '先确认创作者工具在真实工作流中的覆盖，再决定要不要继续横向比较。'
            : 'Check whether these tools truly cover creator workflows before comparing horizontally further.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? [
                '先判断你是在做脚本、封面，还是再包装与发布。',
                '如果目标已经明确，先去更聚焦的内容创作或视频工具页看细节。',
                '如果还要给团队留证据，再回到这页补评论、案例和 owner 认领。',
              ]
            : [
                'First decide whether the main job is scripts, thumbnails, or repurposing and publishing.',
                'If the goal is already clear, move to the more focused content-creation or video pages for details.',
                'If you still need team evidence, come back here for comments, cases, and owner claims.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '产出方式' : 'Output mode',
            value:
              locale === 'cn' || locale === 'tw'
                ? '持续产出、再包装、发布'
                : 'Sustained output, repurposing, publishing',
            note:
              locale === 'cn' || locale === 'tw'
                ? '创作者更在意整条流程。'
                : 'Creators care more about the full workflow.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '资产感' : 'Asset quality',
            value: locale === 'cn' || locale === 'tw' ? '一个想法 -> 一组资产' : 'One idea -> a set of assets',
            note:
              locale === 'cn' || locale === 'tw'
                ? '看它能不能把单点输入变成可复用内容。'
                : 'Check whether single inputs become reusable content.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '真人增量' : 'Human signals',
            value: locale === 'cn' || locale === 'tw' ? '评论、案例、owner 认领' : 'Comments, cases, owner claims',
            note:
              locale === 'cn' || locale === 'tw'
                ? '把 AI 描述补成更可信的页面。'
                : 'Use them to make the page feel more credible.',
          },
        ]}
        signalCards={[
          {
            label: locale === 'cn' || locale === 'tw' ? '产出信号' : 'Output signal',
            value:
              locale === 'cn' || locale === 'tw' ? '先看能否持续产出' : 'Check whether it supports sustained output',
            note:
              locale === 'cn' || locale === 'tw'
                ? '创作者最先看的是流程能不能跑起来。'
                : 'Creators first need a workflow that actually runs.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '再包装信号' : 'Repurposing signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '看单点输入能否变资产'
                : 'See whether one idea becomes reusable assets',
            note:
              locale === 'cn' || locale === 'tw'
                ? '再包装决定内容能不能放大。'
                : 'Repurposing is what lets content scale.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '发布信号' : 'Publishing signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '看批量和发布是否顺手'
                : 'Check whether batch and publishing feel smooth',
            note:
              locale === 'cn' || locale === 'tw'
                ? '持续发布靠的是节奏和导出。'
                : 'Publishing cadence depends on batch output and export flow.',
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
              ? '这页已按真实创作者决策路径重新核对，保留持续产出、再包装和发布入口。'
              : 'This page has been rechecked against a real creator decision path and keeps sustained output, repurposing, and publishing entry points visible.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '保留索引，补真实创作证据'
              : 'Keep it indexable and add real creator evidence'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '用内容节奏、复用方式和真人评论把它和泛工具页区分开。'
              : 'Use publishing cadence, repurposing patterns, and real comments to differentiate it from generic tool pages.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw' ? '补真实创作场景和反馈' : 'Add real creator scenarios and feedback'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '后续优先补创作者案例、多渠道复用样例和真人评论。'
              : 'Next, prioritize creator cases, multi-channel repurposing examples, and real comments.'}
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
