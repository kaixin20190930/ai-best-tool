import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 记笔记工具对比' : 'AI note taking tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的记笔记 AI 工具，帮你更快选出适合会议和知识整理的一个。'
      : 'Compare common note taking AI tools to choose the one that fits your meetings and knowledge workflow best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '记笔记工具', en: 'Note taking tools' },
    comparisonLabel: { cn: 'AI 记笔记工具对比', en: 'AI note taking tools comparison' },
    description: {
      cn: '如果你已经知道自己要做会议、灵感记录或知识整理，这一页会帮你把几款常见工具放在一起看。',
      en: 'If you already know you need meeting capture, idea logging, or knowledge organization, this page helps you compare a few common tools side by side.',
    },
    searchQuery: 'note',
    guideHref: '/guides/ai-note-taking-tools',
    rankingHref: '/best-ai-tools/ai-note-taking-tools',
    rankingLabel: { cn: '转去笔记榜单页', en: 'Open the note-taking ranking' },
    backGuideLabel: { cn: '回到记笔记指南', en: 'Back to note taking guide' },
    altBrowseHref: '/explore?search=note&sort=popular',
    altBrowseLabel: { cn: '浏览更多记笔记工具', en: 'Browse more note taking tools' },
    breadcrumbLabel: { cn: '记笔记工具对比', en: 'Note taking tools comparison' },
    compareTitle: { cn: '几款常见记笔记工具的快速对照', en: 'A quick side-by-side look at common note taking tools' },
    compareSubtitle: { cn: 'Note taking', en: 'Note taking' },
    decisionCards: [
      {
        title: { cn: '会议记录和回放', en: 'Meeting capture and replay' },
        description: {
          cn: '先看转写准确度、录音稳定性、说话人识别，以及回看笔记是否方便。',
          en: 'Prioritize transcription quality, capture reliability, speaker recognition, and how easy it is to revisit the notes later.',
        },
      },
      {
        title: { cn: '灵感和个人笔记', en: 'Ideas and personal notes' },
        description: {
          cn: '更该看输入速度、碎片整理和搜索体验，而不是只看会议功能。',
          en: 'Speed of capture, fragmentation handling, and search matter more than meeting-specific features here.',
        },
      },
      {
        title: { cn: '团队知识整理', en: 'Team knowledge organization' },
        description: {
          cn: '如果要共享给团队，协作、权限和归档结构会直接影响能不能长期用。',
          en: 'If notes need to be shared with a team, collaboration, permissions, and archive structure determine long-term usability.',
        },
      },
    ],
    comparisonDimensions: [
      {
        title: { cn: '转写与摘要', en: 'Transcription and summaries' },
        description: {
          cn: '先看记录是否稳定，再看摘要是否真的能帮你少做整理。',
          en: 'Start with reliable capture, then check whether summaries actually reduce cleanup work.',
        },
      },
      {
        title: { cn: '整理与搜索', en: 'Organization and search' },
        description: {
          cn: '好的记笔记工具不只是记录，还要能在之后快速找回关键内容。',
          en: 'Good note-taking tools do more than capture; they make it easy to find the right detail later.',
        },
      },
      {
        title: { cn: '共享与协作', en: 'Sharing and collaboration' },
        description: {
          cn: '如果你要把记录交给团队，协作、权限和导出就会变成关键项。',
          en: 'When notes need to move across a team, collaboration, permissions, and export options matter a lot.',
        },
      },
      {
        title: { cn: '输入速度', en: 'Capture speed' },
        description: {
          cn: '会议结束后你会不会真的继续记下去，很大程度上取决于输入是不是顺手。',
          en: 'Whether you keep using the tool after meetings depends a lot on how frictionless capture feels.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '经常开会的人', en: 'Frequent meeting participants' },
        description: {
          cn: '适合需要稳定记录会议、行动项和回看要点的人。',
          en: 'Best for people who need to reliably capture meetings, action items, and follow-ups.',
        },
      },
      {
        title: { cn: '需要把零散信息整理成知识的人', en: 'People organizing scattered information' },
        description: {
          cn: '适合把想法、语音、笔记和会议内容统一进一个工作流的人。',
          en: 'A good fit when you want ideas, voice notes, and meetings in one organization flow.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想做简单待办的人', en: 'People who only need simple to-dos' },
        description: {
          cn: '如果你只是记录几条待办，完整的笔记工具可能太重。',
          en: 'If you only need a few reminders, a full note-taking stack can feel like too much.',
        },
      },
      {
        title: { cn: '没有持续记录习惯的人', en: 'People without a note habit' },
        description: {
          cn: '如果不会持续往里放内容，再强的工具也很难产生价值。',
          en: 'If you do not keep feeding the system, even the best tool will struggle to create value.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/best-ai-tools/ai-note-taking-tools',
        title: { cn: '先看笔记榜单页', en: 'Start with the note-taking ranking' },
        description: {
          cn: '如果你想先确认这一类里最值得看的候选，再回来细比，就先去榜单页。',
          en: 'Open the ranking page first if you want the strongest candidates before returning to compare details.',
        },
      },
      {
        href: '/guides/ai-tools-for-meeting-notes',
        title: { cn: '回到会议助手指南', en: 'Back to meeting notes guide' },
        description: {
          cn: '如果你还在找会议记录的具体工作流，这页更适合先读。',
          en: 'Return here if you want the broader meeting-capture workflow first.',
        },
      },
      {
        href: '/guides/ai-writing-tools-comparison',
        title: { cn: '转去写作工具对比', en: 'Switch to writing tools comparison' },
        description: {
          cn: '如果你的需求更偏内容写作而不是会议整理，可以直接跳过去。',
          en: 'Move there if your real need is content drafting rather than note capture.',
        },
      },
      {
        href: '/guides/ai-tools-for-research-comparison',
        title: { cn: '转去研究工具对比', en: 'Switch to research tools comparison' },
        description: {
          cn: '如果你主要是在整理资料和知识，而不是记录会议，这页更贴近。',
          en: 'Go there if your main job is research and synthesis rather than meeting capture.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-note-taking-tools',
        title: { cn: '先看记笔记榜单', en: 'Start with the note-taking ranking' },
        description: {
          cn: '如果你已经确认是记录和整理场景，先缩小 shortlist。',
          en: 'If capture and organization are clearly the lane, narrow the shortlist first.',
        },
      },
      {
        href: '/guides/ai-note-taking-tools',
        title: { cn: '回到记笔记指南', en: 'Return to the note taking guide' },
        description: {
          cn: '先回到更高层判断，再重新看候选。',
          en: 'Step back to the broader guide, then re-review candidates.',
        },
      },
      {
        href: '/guides/ai-productivity-tools-comparison',
        title: { cn: '转去生产力对比', en: 'Go to productivity comparison' },
        description: {
          cn: '如果你的问题更大其实是效率工具，这条更自然。',
          en: 'A better fit if the broader need is productivity tooling.',
        },
      },
      {
        href: '/guides/ai-tools-for-meeting-notes',
        title: { cn: '转去会议纪要指南', en: 'Go to meeting notes guide' },
        description: {
          cn: '如果核心是会议记录和回看，这页更贴近。',
          en: 'A tighter path when the real need is meeting capture and review.',
        },
      },
    ],
    toolSelectionNotes: {
      fireflies: {
        bestFor: {
          cn: '经常开会、需要稳定记录和回看行动项的人。',
          en: 'People who attend lots of meetings and need reliable capture plus follow-up review.',
        },
        whyPickIt: {
          cn: '它更偏会议记录和团队复盘，适合组织里反复发生的记录动作。',
          en: 'It is strong for meeting records and team recaps, which fits repeatable organizational workflows.',
        },
        watchOut: {
          cn: '如果你主要是做个人灵感整理，它可能比你需要的更偏会议。',
          en: 'It can be more meeting-centric than necessary if you mainly need personal idea capture.',
        },
      },
      granola: {
        bestFor: {
          cn: '更在意现场记忆、个人整理和轻量会议笔记的人。',
          en: 'People who value live recall, personal organization, and lightweight meeting notes.',
        },
        whyPickIt: {
          cn: '它的体验更偏个人协作和即时整理，适合把会议内容顺手收进笔记流里。',
          en: 'It feels more personal and immediate, making it a good fit for folding meeting output into your own note flow.',
        },
        watchOut: {
          cn: '如果你需要重度团队协作和复杂权限，可能还要继续比较。',
          en: 'You may want to keep comparing if deep team collaboration or permissions are essential.',
        },
      },
      tldv: {
        bestFor: {
          cn: '需要回看视频片段、整理会议要点和给团队分享摘要的人。',
          en: 'People who need video snippets, meeting highlights, and easy summary sharing.',
        },
        whyPickIt: {
          cn: '它在会议回放和分享上比较顺手，适合协作型团队。',
          en: 'It is convenient for replay and sharing, which suits collaborative teams well.',
        },
        watchOut: {
          cn: '如果你更偏个人知识库，而不是会议片段管理，它可能不是最轻的入口。',
          en: 'It may not be the lightest option if your priority is a personal knowledge base rather than meeting clips.',
        },
      },
      notta: {
        bestFor: {
          cn: '需要跨设备记录、转写和快速回看会议内容的人。',
          en: 'People who want cross-device capture, transcription, and quick meeting review.',
        },
        whyPickIt: {
          cn: '它更像实用型记录层，适合把说过的话快速变成可检索内容。',
          en: 'It acts like a practical capture layer that quickly turns spoken words into searchable notes.',
        },
        watchOut: {
          cn: '如果你期待更强的知识管理或更复杂的协作流程，可能还要加比。',
          en: 'You may still want to compare more if knowledge management or deeper collaboration is the bigger need.',
        },
      },
    },
    tips: {
      cn: [
        '先看记录入口和整理能力，再看搜索与导出。',
        '如果你要团队使用，关注协作、权限和历史记录。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'Start with capture and organization, then check search and exports.',
        'For team use, look at collaboration, permissions, and history.',
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
        question: { cn: '为什么只看记笔记工具？', en: 'Why only note taking tools?' },
        answer: {
          cn: '因为记笔记和会议记录的意图很明确，通常就是记录、整理和检索，对比更直接。',
          en: 'Because note taking and meeting capture have clear intent around recording, organizing, and retrieval, making comparison more direct.',
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
            ? '先确认记笔记工具在会议记录、灵感捕捉和知识整理里的真实覆盖，再继续看对比。'
            : 'Check whether these tools really cover meeting capture, idea logging, and knowledge organization before continuing.'
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '记录方式' : 'Capture mode',
            value: locale === 'cn' || locale === 'tw' ? '会议、灵感、知识' : 'Meetings, ideas, knowledge',
            note:
              locale === 'cn' || locale === 'tw'
                ? '先看它是不是你真实会用的输入口。'
                : 'Check whether this matches the way you actually capture information.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '整理和搜索' : 'Organization',
            value: locale === 'cn' || locale === 'tw' ? '整理、检索、归档' : 'Organize, search, archive',
            note:
              locale === 'cn' || locale === 'tw'
                ? '能不能把内容真正找回来很关键。'
                : 'Being able to find things later is crucial.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '真实增量' : 'Real increments',
            value: locale === 'cn' || locale === 'tw' ? '评论、案例、认领' : 'Comments, cases, claims',
            note:
              locale === 'cn' || locale === 'tw'
                ? '用这些信号补强页面可信度。'
                : 'Use these signals to strengthen credibility.',
          },
        ]}
      />
      <section className='mx-auto mt-8 max-w-6xl px-4 lg:px-6'>
        <div className='rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '先看榜单，再决定是继续看记笔记工具还是切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing note-taking tools or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果你已经明确要做会议记录、知识整理或信息回收，先收紧 shortlist 往往比继续横向浏览更有效。'
              : 'If meeting capture, knowledge organization, or information retrieval is already the goal, narrowing the shortlist first is usually better than continuing to browse horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-note-taking-tools',
                title: locale === 'cn' || locale === 'tw' ? '记笔记榜单' : 'Note-taking ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先收窄到更适合记录和整理的候选。'
                    : 'Narrow to the tools best suited for capture and organization first.',
              },
              {
                href: '/guides/ai-tools-for-meeting-notes-comparison',
                title: locale === 'cn' || locale === 'tw' ? '会议纪要对比' : 'Meeting notes comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你的场景更偏会议录音和纪要。'
                    : 'Useful when the real need is meeting recording and summarization.',
              },
              {
                href: '/guides/ai-tools-for-research-comparison',
                title: locale === 'cn' || locale === 'tw' ? '研究工具对比' : 'Research tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果整理完笔记后还要继续做资料核对。'
                    : 'A better path when notes need to turn into deeper research and checking.',
              },
              {
                href: '/guides/notion-alternatives-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'Notion 替代方案' : 'Notion alternatives',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你要把记录纳入更大的知识工作流。'
                    : 'Useful when note-taking needs to fit into a broader knowledge workflow.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`note_taking_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_note_taking_tools_comparison' />
    </>
  );
}
