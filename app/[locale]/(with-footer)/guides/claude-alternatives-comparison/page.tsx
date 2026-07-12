import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Claude 替代方案对比' : 'Claude alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Claude 的 AI 工具，帮你更快判断长上下文、分析、写作和代码理解该选哪一类。'
      : 'Compare AI tools that are commonly used as Claude alternatives so you can choose the right fit for long context, analysis, writing, and code understanding.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '聊天工具', en: 'Chat tools' },
    comparisonLabel: { cn: 'Claude 替代方案对比', en: 'Claude alternatives comparison' },
    description: {
      cn: '如果你已经知道自己在找 Claude 的替代方案，这一页会把更偏长上下文和分析能力的候选放在一起看。',
      en: 'If you already know you are looking for a Claude alternative, this page puts the more long-context and analysis-oriented candidates side by side.',
    },
    searchQuery: 'claude',
    guideHref: '/guides/ai-chatbot-tools',
    rankingHref: '/best-ai-tools/ai-chatbot-tools',
    rankingLabel: { cn: '转去聊天榜单页', en: 'Open the chatbot ranking' },
    backGuideLabel: { cn: '回到聊天机器人指南', en: 'Back to chatbot guide' },
    altBrowseHref: '/explore?search=claude&sort=popular',
    altBrowseLabel: { cn: '浏览更多 Claude 相关工具', en: 'Browse more Claude-related tools' },
    breadcrumbLabel: { cn: 'Claude 替代方案对比', en: 'Claude alternatives comparison' },
    compareTitle: {
      cn: '几款常见 Claude 替代项的快速对照',
      en: 'A quick side-by-side look at common Claude alternatives',
    },
    compareSubtitle: { cn: 'Claude', en: 'Claude' },
    preferredToolNames: ['anthropic', 'chatgpt-mac', 'gemini', 'poe'],
    decisionCards: [
      {
        title: { cn: '先看长上下文和分析感', en: 'Long context and analysis' },
        description: {
          cn: 'Claude 常被选中，是因为它更像一个能认真处理长文本和复杂问题的工作伙伴。',
          en: 'Claude is often chosen because it feels like a partner that can seriously handle long text and complex problems.',
        },
      },
      {
        title: { cn: '再看写作与代码理解', en: 'Writing and code understanding' },
        description: {
          cn: '如果你既要写作又要看代码，替代项的质量差异通常会体现在长回答和解释能力上。',
          en: 'If you need both writing and code understanding, the difference between alternatives often shows up in long-form answers and explanation quality.',
        },
      },
      {
        title: { cn: '最后看是否稳定好用', en: 'Is it stable enough to keep using' },
        description: {
          cn: '真正能替代的工具，不只是一次性回答好，而是长期用起来不别扭。',
          en: 'A true alternative is not just the one that answers well once, but the one that stays comfortable to use over time.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '经常处理长文本的人', en: 'People who often handle long text' },
        description: {
          cn: '适合你经常做总结、分析、改写和多轮推演。',
          en: 'Best if your work often involves summarizing, analyzing, rewriting, and multi-turn reasoning.',
        },
      },
      {
        title: { cn: '需要认真解释问题的人', en: 'People who need careful explanations' },
        description: {
          cn: '如果你更看重解释清楚而不是快速给答案，这种对比更有用。',
          en: 'Useful when you care more about careful explanations than just quick answers.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想轻量聊天的人', en: 'People who only want light chat' },
        description: {
          cn: '如果你只是偶尔问几个问题，没必要上这么重的对比。',
          en: 'If you only ask occasional questions, this comparison is probably heavier than you need.',
        },
      },
      {
        title: { cn: '其实更在意编辑器的人', en: 'People who really care about the editor' },
        description: {
          cn: '如果你的核心场景已经变成在代码编辑器里工作，应该去看 Cursor 或 coding tools 页。',
          en: 'If your main job has shifted into the code editor, you should look at Cursor or coding tools pages instead.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-chatbot-tools',
        title: { cn: '先看聊天榜单', en: 'Start with the chatbot ranking' },
        description: {
          cn: '如果你已经决定在聊天入口里选型，先用榜单收口。',
          en: 'If you are already choosing a chat entry point, use the ranking to narrow things down first.',
        },
      },
      {
        href: '/guides/chatgpt-alternatives-comparison',
        title: { cn: '转去 ChatGPT 替代方案对比', en: 'Go to ChatGPT alternatives comparison' },
        description: {
          cn: '如果你其实是在几个主流聊天入口里权衡，这条路很合适。',
          en: 'Use this when you are really weighing the major chat-entry options.',
        },
      },
      {
        href: '/guides/cursor-alternatives-comparison',
        title: { cn: '转去 Cursor 替代方案对比', en: 'Go to Cursor alternatives comparison' },
        description: {
          cn: '如果你的工作流更偏编辑器和代码协作，去看 Cursor 页。',
          en: 'Move here if your workflow is more editor and code-collaboration focused.',
        },
      },
      {
        href: '/guides/ai-tools-for-research-comparison',
        title: { cn: '转去研究工具对比', en: 'Go to research tools comparison' },
        description: {
          cn: '如果你更看重资料核对而不是纯聊天，也可以继续看研究页。',
          en: 'If evidence-checking matters more than chat, continue into the research tools page.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-chatbot-tools-comparison',
        title: { cn: '转去聊天机器人总对比', en: 'Go to chatbot comparison' },
        description: {
          cn: '如果你想重新把候选范围拉宽，这页更适合。',
          en: 'Use this when you want to broaden the shortlist again.',
        },
      },
      {
        href: '/guides/chatgpt-alternatives-comparison',
        title: { cn: '转去 ChatGPT 替代方案对比', en: 'Go to ChatGPT alternatives comparison' },
        description: {
          cn: '如果你是想在几个主流聊天入口里选一个，继续看这页。',
          en: 'Move here if you are comparing the major chat-entry options.',
        },
      },
      {
        href: '/guides/cursor-alternatives-comparison',
        title: { cn: '转去 Cursor 替代方案对比', en: 'Go to Cursor alternatives comparison' },
        description: {
          cn: '如果你其实更偏代码和编辑器工作流，切换到这条更合适。',
          en: 'Switch here if your real workflow is more code and editor focused.',
        },
      },
    ],
    toolSelectionNotes: {
      anthropic: {
        bestFor: {
          cn: '想要更长上下文、更稳回答和更强分析感的人。',
          en: 'People who want longer context, steadier answers, and a stronger analytical feel.',
        },
        whyPickIt: {
          cn: '它通常更适合处理长内容、复杂解释和更认真一点的思考过程。',
          en: 'It tends to suit long content, complex explanations, and more deliberate reasoning.',
        },
        watchOut: {
          cn: '如果你需要更广的生态入口或更多模型切换，别只看这一项。',
          en: 'If you need broader ecosystem access or more model switching, do not stop at this one choice.',
        },
      },
      'chatgpt-mac': {
        bestFor: {
          cn: '想保留 ChatGPT 使用感，但在桌面工作流里更顺手的人。',
          en: 'People who want the ChatGPT feel but a smoother desktop workflow.',
        },
        whyPickIt: {
          cn: '它能把常用聊天能力放到更接近日常工作的入口里。',
          en: 'It puts familiar chat capabilities into a more workflow-friendly entry point.',
        },
        watchOut: {
          cn: '如果你强调的其实是深分析或长上下文，可能还要看别的候选。',
          en: 'If you care most about deep analysis or long context, compare other candidates too.',
        },
      },
      gemini: {
        bestFor: {
          cn: '已经在 Google 生态里工作、希望顺便接入 AI 的人。',
          en: 'People already working inside Google’s ecosystem who want AI to fit naturally.',
        },
        whyPickIt: {
          cn: '它更适合把日常聊天与现有产品习惯连接起来。',
          en: 'It is handy when you want AI chat to fit your existing product habits.',
        },
        watchOut: {
          cn: '如果你最看重的是深度分析而不是生态整合，别只看它的表面体验。',
          en: 'If deep analysis matters more than ecosystem integration, do not judge only by surface feel.',
        },
      },
      poe: {
        bestFor: {
          cn: '想在多个模型之间快速切换和比较的人。',
          en: 'People who want quick switching and comparison across multiple models.',
        },
        whyPickIt: {
          cn: '它让你更容易感知不同模型在风格和回答方式上的区别。',
          en: 'It makes it easy to feel the differences in style and response behavior across models.',
        },
        watchOut: {
          cn: '如果你要的是一个极稳的单一主入口，它可能显得更像试验场。',
          en: 'If you want a single stable primary entry point, it may feel more like a playground.',
        },
      },
    },
    tips: {
      cn: [
        '先判断你是在选“认真处理长内容的助手”，还是只是聊天入口。',
        '如果你已经在做分析、总结和长写作，长上下文和稳定性要优先看。',
        '别只看谁更会说，真正重要的是谁能长期帮你把复杂事情讲清楚。',
      ],
      en: [
        'Start by deciding whether you want a serious long-form helper or just a chat entry point.',
        'If you are already doing analysis, summaries, and long writing, prioritize long context and stability.',
        'Do not judge only by who sounds smarter; the real question is who helps you keep complex work clear over time.',
      ],
    },
    faqs: [
      {
        question: { cn: '为什么单独做 Claude 替代方案页？', en: 'Why make a separate Claude alternatives page?' },
        answer: {
          cn: '因为很多用户已经很明确是在比较长上下文和分析能力，这个意图比泛聊天更强。',
          en: 'Because many users are specifically comparing long-context and analytical ability, which is a stronger intent than broad chat.',
        },
      },
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看上下文能力、写作与分析体验、更新情况、价格和真实反馈。',
          en: 'We compare context handling, writing and analysis experience, freshness, pricing, and real feedback.',
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
            ? '这页先看真实可验证的 Claude 替代信号，再继续判断是否真的需要长上下文、分析和写作能力。'
            : 'This page looks at verifiable Claude-alternative signals first, then helps you decide whether long context, analysis, and writing abilities are truly needed.'
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '长上下文' : 'Long context',
            value: locale === 'cn' || locale === 'tw' ? '是否真的能处理长文本' : 'Can it handle long text well',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果长文本和复杂推演不是重点，就别只看这个维度。'
                : 'If long text is not the main job, do not over-weight this dimension.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '分析与写作' : 'Analysis and writing',
            value: locale === 'cn' || locale === 'tw' ? '解释是否足够稳' : 'Is the explanation quality steady',
            note:
              locale === 'cn' || locale === 'tw'
                ? '替代 Claude 的关键不是名字，而是解释和总结是否靠谱。'
                : 'A real Claude alternative is about explanation and summary quality, not just branding.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '长期稳定' : 'Long-term stability',
            value: locale === 'cn' || locale === 'tw' ? '是否适合长期使用' : 'Is it comfortable to keep using',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果工作流会持续依赖，它必须稳定、顺手、可复用。'
                : 'If your workflow depends on it over time, it needs to stay stable and reusable.',
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
              ? '先看榜单，再决定是继续看 Claude 替代还是切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing Claude alternatives or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果你已经明确要做长上下文或分析型工作，先收紧 shortlist 往往比继续横向浏览更有效。'
              : 'If long context or analysis is already the goal, narrowing the shortlist first is usually better than continuing to browse horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-chatbot-tools',
                title: locale === 'cn' || locale === 'tw' ? '聊天榜单' : 'Chat ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先收窄到更值得试用的聊天候选。'
                    : 'Narrow to the most trial-worthy chat candidates first.',
              },
              {
                href: '/guides/chatgpt-alternatives-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'ChatGPT 替代方案' : 'ChatGPT alternatives',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你更需要通用助手。'
                    : 'Useful when you need a general-purpose assistant.',
              },
              {
                href: '/guides/cursor-alternatives-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'Cursor 替代方案' : 'Cursor alternatives',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果需求开始偏代码和编辑器工作流。'
                    : 'A better path when coding and editor workflows matter more.',
              },
              {
                href: '/guides/ai-tools-for-research-comparison',
                title: locale === 'cn' || locale === 'tw' ? '研究工具对比' : 'Research tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你要把聊天转成研究和核对。'
                    : 'Useful when chat needs to turn into research and evidence-checking.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`claude_ranking_${item.href.split('/').pop()}`}
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
      <GuideSubmissionPath locale={locale} ctaPrefix='claude_alternatives_comparison' />
    </>
  );
}
