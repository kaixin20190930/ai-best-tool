import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 会议纪要工具对比' : 'AI tools for meeting notes comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的会议纪要 AI 工具，帮你更快选出适合转写和整理的一个。'
      : 'Compare common meeting notes AI tools to choose the one that fits your transcription and cleanup workflow best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '会议纪要工具', en: 'Meeting notes tools' },
    comparisonLabel: { cn: 'AI 会议纪要工具对比', en: 'AI tools for meeting notes comparison' },
    description: {
      cn: '如果你已经知道自己要做会议记录、纪要整理或行动项提取，这一页会帮你把几款常见工具放在一起看。',
      en: 'If you already know you need meeting transcription, note cleanup, or action-item extraction, this page helps you compare a few common tools side by side.',
    },
    searchQuery: 'meeting',
    guideHref: '/guides/ai-tools-for-meeting-notes',
    rankingHref: '/best-ai-tools/ai-meeting-notes-tools',
    rankingLabel: { cn: '转去会议纪要榜单页', en: 'Open the meeting notes ranking' },
    backGuideLabel: { cn: '回到会议指南', en: 'Back to meeting guide' },
    altBrowseHref: '/explore?search=meeting&sort=popular',
    altBrowseLabel: { cn: '浏览更多会议纪要工具', en: 'Browse more meeting notes tools' },
    breadcrumbLabel: { cn: '会议纪要工具对比', en: 'Meeting notes tools comparison' },
    compareTitle: {
      cn: '几款常见会议纪要工具的快速对照',
      en: 'A quick side-by-side look at common meeting notes tools',
    },
    compareSubtitle: { cn: 'Meeting notes', en: 'Meeting notes' },
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-meeting-notes-tools',
        title: { cn: '先看会议纪要榜单', en: 'Start with the meeting notes ranking' },
        description: {
          cn: '如果会议纪要已经是明确目标，先用榜单缩小 shortlist。',
          en: 'If meeting notes are clearly the goal, narrow the shortlist with the ranking first.',
        },
      },
      {
        href: '/guides/ai-tools-for-meeting-notes',
        title: { cn: '回到会议指南', en: 'Back to the meeting guide' },
        description: {
          cn: '如果你还想先理清转写、整理和行动项提取，可以回到指南页。',
          en: 'Go back if you still need to clarify transcription, cleanup, and action-item extraction first.',
        },
      },
      {
        href: '/guides/ai-note-taking-tools-comparison',
        title: { cn: '转去记笔记工具对比', en: 'Go to note taking comparison' },
        description: {
          cn: '如果你更关注记录、归档和知识整理，这页更高意图。',
          en: 'A higher-intent path when capture, archiving, and knowledge organization matter more.',
        },
      },
      {
        href: '/guides/ai-tools-for-voice-comparison',
        title: { cn: '转去语音工具对比', en: 'Go to voice tools comparison' },
        description: {
          cn: '如果你现在更关心转写或语音输入，这页也更贴近。',
          en: 'Move there if transcription or voice input is the real priority.',
        },
      },
    ],
    comparisonDimensions: [
      {
        title: { cn: '转写准确度', en: 'Transcription accuracy' },
        description: {
          cn: '先看能不能稳定听清多人发言、口音和噪音环境下的内容。',
          en: 'Check whether the tool can reliably handle multiple speakers, accents, and noisy environments.',
        },
      },
      {
        title: { cn: '纪要整理速度', en: 'Cleanup speed' },
        description: {
          cn: '真正省时间的，不只是转写，而是能不能快速整理出可发给团队的纪要。',
          en: 'The real time saver is not just transcription, but whether it can quickly turn notes into something shareable.',
        },
      },
      {
        title: { cn: '行动项提取', en: 'Action item extraction' },
        description: {
          cn: '如果你要把会议转成执行结果，行动项、负责人和截止时间就非常关键。',
          en: 'If meetings need to turn into execution, action items, owners, and due dates become critical.',
        },
      },
      {
        title: { cn: '团队协作与导出', en: 'Collaboration and exports' },
        description: {
          cn: '多人一起用的时候，分享、权限、搜索和导出往往决定能不能长期用。',
          en: 'For team use, sharing, permissions, search, and exports often determine whether the tool sticks.',
        },
      },
    ],
    tips: {
      cn: [
        '先看支持的会议平台和录音格式，再看转写准确度。',
        '如果你要团队使用，关注导出、协作、权限和历史记录。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'Start with supported meeting platforms and audio formats, then check transcription quality.',
        'For team use, look at exports, collaboration, permissions, and history.',
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
        question: { cn: '为什么只看会议纪要工具？', en: 'Why only meeting notes tools?' },
        answer: {
          cn: '因为会议记录是最容易形成明确对比意图的场景之一，对比也更直接。',
          en: 'Because meeting notes are one of the clearest compare-intent scenarios, making comparison more direct.',
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
            ? '这页先看真实可验证的会议纪要信号，再继续判断是转写、整理还是行动项提取更值得投入。'
            : 'This page looks at verifiable meeting-notes signals first, then helps you decide whether transcription, cleanup, or action-item extraction deserves more focus.'
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '转写质量' : 'Transcription quality',
            value:
              locale === 'cn' || locale === 'tw'
                ? '多人和噪音环境下是否稳定'
                : 'Stable with multiple speakers and noise',
            note:
              locale === 'cn' || locale === 'tw'
                ? '先确认它能不能把会议说清楚，再比其他功能。'
                : 'Confirm it can actually capture the meeting before comparing extras.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '整理效率' : 'Cleanup speed',
            value:
              locale === 'cn' || locale === 'tw' ? '能否快速生成可分享纪要' : 'Can it produce shareable notes quickly',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果整理步骤还很重，真实节省时间就有限。'
                : 'If cleanup is still heavy, the time savings will be limited.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '协作导出' : 'Collaboration and export',
            value:
              locale === 'cn' || locale === 'tw' ? '分享、权限、导出是否顺手' : 'Sharing, permissions, and exports',
            note:
              locale === 'cn' || locale === 'tw'
                ? '团队长期用时，这些比表面功能更重要。'
                : 'For long-term team use, these matter more than surface features.',
          },
        ]}
      />
      <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '最近验证' : 'Last checked'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-13</p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '这页已按真实会议纪要路径重新核对，保留转写、整理和协作入口。'
              : 'This page has been rechecked against a real meeting-notes workflow and keeps transcription, cleanup, and collaboration entry points visible.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '保留索引，补真实会议证据'
              : 'Keep it indexable and add real meeting evidence'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '用转写、协作和真人评论把它和泛笔记页区分开。'
              : 'Use transcription, collaboration, and real comments to differentiate it from generic notes pages.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw' ? '补真实会议场景和反馈' : 'Add real meeting scenarios and feedback'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '后续优先补会议案例、协作样例和真人评论。'
              : 'Next, prioritize meeting cases, collaboration examples, and real comments.'}
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
              ? '先看榜单，再决定是否继续看会议纪要工具或切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing meeting notes tools or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果会议记录已经是明确目标，先收紧 shortlist 往往比继续横向浏览更多页面更有效。'
              : 'If meeting notes are already the goal, narrowing the shortlist first is usually better than continuing to browse more pages horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-meeting-notes-tools',
                title: locale === 'cn' || locale === 'tw' ? '会议纪要榜单' : 'Meeting notes ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先收窄到更高相关的候选。'
                    : 'Start with the most relevant candidates first.',
              },
              {
                href: '/guides/ai-tools-for-meeting-notes',
                title: locale === 'cn' || locale === 'tw' ? '会议指南' : 'Meeting guide',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '重新确认是转写、整理还是行动项提取。'
                    : 'Re-check whether the job is transcription, cleanup, or action-item extraction.',
              },
              {
                href: '/guides/ai-note-taking-tools-comparison',
                title: locale === 'cn' || locale === 'tw' ? '记笔记对比' : 'Note taking comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你的真实需求更偏记录和归档。'
                    : 'Useful when capture and archiving are the real need.',
              },
              {
                href: '/guides/ai-tools-for-voice-comparison',
                title: locale === 'cn' || locale === 'tw' ? '语音工具对比' : 'Voice tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你更关心录音和转写输入。'
                    : 'Better when recording and transcription input are the real focus.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`meeting_notes_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_meeting_notes_comparison' />
    </>
  );
}
