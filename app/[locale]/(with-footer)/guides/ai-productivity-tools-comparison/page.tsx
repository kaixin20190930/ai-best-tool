import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 生产力工具对比' : 'AI productivity tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 AI 生产力工具，帮你更快选出适合的一个。'
      : 'Compare common AI productivity tools to choose the one that fits you best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '生产力工具', en: 'Productivity tools' },
    comparisonLabel: { cn: 'AI 生产力工具对比', en: 'AI productivity tools comparison' },
    description: {
      cn: '如果你已经知道自己是要做效率提升，这一页会帮你把几款常见的生产力工具放在一起看，减少反复试错。',
      en: 'If you already know you need productivity tools, this page helps you compare a few common ones side by side and reduce trial-and-error.',
    },
    searchQuery: 'productivity',
    guideHref: '/guides/ai-productivity-tools',
    rankingHref: '/best-ai-tools/ai-productivity-tools',
    rankingLabel: { cn: '转去生产力榜单页', en: 'Open the productivity ranking' },
    backGuideLabel: { cn: '回到生产力指南', en: 'Back to productivity guide' },
    altBrowseHref: '/explore?search=productivity&sort=popular',
    altBrowseLabel: { cn: '浏览更多生产力工具', en: 'Browse more productivity tools' },
    breadcrumbLabel: { cn: '生产力工具对比', en: 'Productivity tools comparison' },
    compareTitle: { cn: '几款常见生产力工具的快速对照', en: 'A quick side-by-side look at common productivity tools' },
    compareSubtitle: { cn: '生产力', en: 'productivity' },
    nextPaths: [
      {
        href: '/best-ai-tools/ai-productivity-tools',
        title: { cn: '先看生产力榜单页', en: 'Start with the productivity ranking' },
        description: {
          cn: '如果你想先拿到更稳的 shortlist，再回来细比，就先走榜单页。',
          en: 'Go through the ranking first if you want a stronger shortlist before returning for the side-by-side comparison.',
        },
      },
      {
        href: '/guides/ai-note-taking-tools-comparison',
        title: { cn: '转去笔记工具对比', en: 'Switch to note-taking comparison' },
        description: {
          cn: '如果你的效率问题更像记录、归档和检索，而不是泛生产力，这页更贴近。',
          en: 'Move there if your productivity bottleneck is really about capture, archive, and retrieval.',
        },
      },
      {
        href: '/guides/ai-writing-tools-comparison',
        title: { cn: '转去写作工具对比', en: 'Switch to writing comparison' },
        description: {
          cn: '如果你现在卡在内容起稿和改写，而不是任务管理，这页会更直接。',
          en: 'Go there if the main friction is drafting and rewriting rather than broad task management.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-productivity-tools',
        title: { cn: '先看生产力榜单', en: 'Start with the productivity ranking' },
        description: {
          cn: '如果你已经确认是效率提升场景，先缩小 shortlist 再细比。',
          en: 'If efficiency is clearly the lane, narrow the shortlist before comparing details.',
        },
      },
      {
        href: '/guides/ai-productivity-tools',
        title: { cn: '回到生产力指南', en: 'Return to the productivity guide' },
        description: {
          cn: '先回到更高层判断，再重新看候选。',
          en: 'Step back to the broader guide, then re-review candidates.',
        },
      },
      {
        href: '/guides/ai-note-taking-tools-comparison',
        title: { cn: '转去笔记工具对比', en: 'Go to note taking comparison' },
        description: {
          cn: '如果你的效率问题其实是记录和归档，这条更高意图。',
          en: 'A better fit if your productivity problem is really about capture and archiving.',
        },
      },
      {
        href: '/guides/ai-tools-for-automation-comparison',
        title: { cn: '转去自动化对比', en: 'Go to automation comparison' },
        description: {
          cn: '如果你要省时间主要靠流程自动化，这页更贴近。',
          en: 'A tighter path when the real time-saver is workflow automation.',
        },
      },
    ],
    tips: {
      cn: [
        '先看你是做任务管理、笔记整理、知识管理还是协作，不同场景侧重点不一样。',
        '如果你想先试再买，优先看免费版本的限制和协作能力。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'Start with your use case: task management, notes, knowledge management, or collaboration all need different things.',
        'If you want to try before paying, focus on free-tier limits and collaboration depth.',
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
        question: { cn: '为什么只看生产力工具？', en: 'Why only productivity tools?' },
        answer: {
          cn: '因为生产力工具的意图很清晰，通常就是效率、协作和信息整理，对比也更直接。',
          en: 'Because productivity tools usually map to clear efficiency, collaboration, and organization needs, making comparison much more direct.',
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
              ? '先看榜单，再决定是否继续看生产力工具或切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing productivity tools or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果生产力已经是明确目标，先收紧 shortlist 往往比继续横向浏览更多页面更有效。'
              : 'If productivity is already the goal, narrowing the shortlist first is usually better than continuing to browse more pages horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-productivity-tools',
                title: locale === 'cn' || locale === 'tw' ? '生产力榜单' : 'Productivity ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先收窄到更高相关的候选。'
                    : 'Start with the most relevant candidates first.',
              },
              {
                href: '/guides/ai-productivity-tools',
                title: locale === 'cn' || locale === 'tw' ? '生产力指南' : 'Productivity guide',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '重新确认是任务、笔记还是协作。'
                    : 'Re-check whether the job is tasks, notes, or collaboration.',
              },
              {
                href: '/guides/ai-note-taking-tools-comparison',
                title: locale === 'cn' || locale === 'tw' ? '记笔记对比' : 'Note taking comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你的效率问题其实是记录和检索。'
                    : 'Useful when capture and retrieval are the real need.',
              },
              {
                href: '/guides/ai-tools-for-automation-comparison',
                title: locale === 'cn' || locale === 'tw' ? '自动化对比' : 'Automation comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你要省时间主要靠流程自动化。'
                    : 'Better when workflow automation is the main time saver.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`productivity_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_productivity_tools_comparison' />
    </>
  );
}
