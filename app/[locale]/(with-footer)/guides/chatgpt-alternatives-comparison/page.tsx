import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'ChatGPT 替代方案对比' : 'ChatGPT alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 ChatGPT 的 AI 工具，帮你更快判断聊天、写作、研究和多模型切换该怎么选。'
      : 'Compare AI tools that are commonly used as ChatGPT alternatives so you can choose the right fit for chat, writing, research, and multi-model workflows.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '聊天工具', en: 'Chat tools' },
    comparisonLabel: { cn: 'ChatGPT 替代方案对比', en: 'ChatGPT alternatives comparison' },
    description: {
      cn: '如果你已经知道自己在找 ChatGPT 替代方案，这一页会把几款更常被拿来比较的候选放在一起看，帮助你更快缩小 shortlist。',
      en: 'If you already know you are looking for a ChatGPT alternative, this page puts the most commonly compared candidates side by side to help you narrow the shortlist faster.',
    },
    searchQuery: 'chatgpt',
    guideHref: '/guides/ai-chatbot-tools',
    rankingHref: '/best-ai-tools/ai-chatbot-tools',
    rankingLabel: { cn: '转去聊天榜单页', en: 'Open the chatbot ranking' },
    backGuideLabel: { cn: '回到聊天机器人指南', en: 'Back to chatbot guide' },
    altBrowseHref: '/explore?search=chatgpt&sort=popular',
    altBrowseLabel: { cn: '浏览更多 ChatGPT 相关工具', en: 'Browse more ChatGPT-related tools' },
    breadcrumbLabel: { cn: 'ChatGPT 替代方案对比', en: 'ChatGPT alternatives comparison' },
    compareTitle: {
      cn: '几款常见 ChatGPT 替代项的快速对照',
      en: 'A quick side-by-side look at common ChatGPT alternatives',
    },
    compareSubtitle: { cn: 'ChatGPT', en: 'ChatGPT' },
    preferredToolNames: ['chatgpt-mac', 'gemini', 'poe', 'anthropic'],
    decisionCards: [
      {
        title: { cn: '先看你是要聊天还是要工作流', en: 'Chatting or working' },
        description: {
          cn: '如果你只是聊天问答，几乎任何替代项都可能够用；如果你要把它纳入日常工作流，差异就会很明显。',
          en: 'If you only need chat Q&A, many alternatives can work; if it becomes part of your daily workflow, the differences matter a lot more.',
        },
      },
      {
        title: { cn: '再看多模型和生态', en: 'Multi-model and ecosystem fit' },
        description: {
          cn: '有些工具更适合单一体验，有些则更适合在多个模型和入口之间切换。',
          en: 'Some tools are built for a single clean experience, while others are better when you want to switch between models and entry points.',
        },
      },
      {
        title: { cn: '最后看你要不要长期使用', en: 'Is this a long-term tool' },
        description: {
          cn: '如果打算长期用，更新频率、稳定性、价格和真实反馈会比一次性功能更重要。',
          en: 'If this is a long-term choice, freshness, stability, pricing, and real feedback matter more than one-off features.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '已经在找替代 ChatGPT 的人', en: 'People actively looking to replace ChatGPT' },
        description: {
          cn: '适合你已经明确想换掉默认入口，开始比较体验、模型和使用场景。',
          en: 'Best when you are already past the default choice and comparing experience, models, and use cases.',
        },
      },
      {
        title: { cn: '需要多模型入口的人', en: 'People who need multiple model entry points' },
        description: {
          cn: '如果你的使用场景经常变化，这类对比页会更快帮你判断哪种入口更顺手。',
          en: 'Useful when your use case changes often and you need to know which entry point feels most natural.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '还没想清楚用途的人', en: 'People who are still fuzzy on the use case' },
        description: {
          cn: '如果你还不知道是聊天、写作、研究还是代码，先回更宽的聊天指南会更高效。',
          en: 'If you are still unsure whether the job is chat, writing, research, or coding, start from the broader chatbot guide.',
        },
      },
      {
        title: { cn: '只想看某个单点功能的人', en: 'People only chasing one feature' },
        description: {
          cn: '如果你只在找图片、语音或代码功能，专门的功能页会比 ChatGPT 替代页更准。',
          en: 'If you only care about image, voice, or coding features, a dedicated feature page will be more precise.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-chatbot-tools-comparison',
        title: { cn: '转去聊天机器人总对比', en: 'Go to chatbot comparison' },
        description: {
          cn: '如果你要把候选范围再拉宽一点，这页更适合继续筛选。',
          en: 'Use this when you want to broaden the shortlist one more step.',
        },
      },
      {
        href: '/guides/ai-writing-tools-comparison',
        title: { cn: '转去写作工具对比', en: 'Go to writing tools comparison' },
        description: {
          cn: '如果你其实更常用在写作和内容生成，这条路径更贴近任务。',
          en: 'Move here if the real job is more about writing and content generation.',
        },
      },
      {
        href: '/guides/ai-tools-for-research-comparison',
        title: { cn: '转去研究工具对比', en: 'Go to research tools comparison' },
        description: {
          cn: '如果你在意的是资料核对和检索，而不只是聊天，继续看研究页。',
          en: 'If evidence gathering matters more than chatting, continue into the research tools page.',
        },
      },
    ],
    toolSelectionNotes: {
      'chatgpt-mac': {
        bestFor: {
          cn: '想保留 ChatGPT 熟悉感，但更希望在本地或桌面工作流里使用的人。',
          en: 'People who want the familiar ChatGPT feel but prefer using it inside a local or desktop workflow.',
        },
        whyPickIt: {
          cn: '它更像把 ChatGPT 放到一个更贴近日常工作的入口里，切换成本低。',
          en: 'It feels like putting ChatGPT into a more workflow-friendly entry point with low switching friction.',
        },
        watchOut: {
          cn: '如果你需要更强的多模型控制或更广的比较面，可能还要看别的入口。',
          en: 'If you need stronger multi-model control or a broader comparison surface, compare other options too.',
        },
      },
      gemini: {
        bestFor: {
          cn: '已经在 Google 生态里工作，想要更自然集成的人。',
          en: 'People already in the Google ecosystem who want a more natural integration point.',
        },
        whyPickIt: {
          cn: '它适合把聊天、模型能力和现有 Google 使用习惯连起来。',
          en: 'It is useful when you want chat and model capability to fit into existing Google habits.',
        },
        watchOut: {
          cn: '如果你更看重跨平台一致体验，先确认它是不是你最常用的入口。',
          en: 'If you care most about cross-platform consistency, check whether it is really your daily entry point.',
        },
      },
      poe: {
        bestFor: {
          cn: '喜欢在多个模型之间切换、对比不同回答风格的人。',
          en: 'People who like switching between models and comparing different answer styles.',
        },
        whyPickIt: {
          cn: '它更适合把不同模型放在一个地方看，快速形成直觉判断。',
          en: 'It works well when you want multiple models in one place and need a quick intuition check.',
        },
        watchOut: {
          cn: '如果你要的是某个单一工作流的深度集成，它可能显得更偏广而不是深。',
          en: 'If you want deep integration into one specific workflow, it may feel broader than deeper.',
        },
      },
      anthropic: {
        bestFor: {
          cn: '想要更长上下文、更认真讨论和更稳输出的人。',
          en: 'People who want longer context, deeper discussion, and steadier output.',
        },
        whyPickIt: {
          cn: '它更像一款适合认真分析和长内容处理的替代项。',
          en: 'It feels like a stronger alternative when the job involves careful analysis and long-form work.',
        },
        watchOut: {
          cn: '如果你需要非常通用的“什么都能做一点”，它未必是最轻松的入口。',
          en: 'If you need a very general-purpose do-everything feel, it may not be the lightest choice.',
        },
      },
    },
    tips: {
      cn: [
        '先判断你是在选“聊天工具”，还是选“长期工作入口”。',
        '如果你想频繁切换模型，就把多模型能力和入口体验放在前面看。',
        '替代方案页的目标不是替你站队，而是帮你把 shortlist 快速收窄。',
      ],
      en: [
        'Start by deciding whether you are choosing a chat tool or a long-term work entry point.',
        'If you want to switch models often, put multi-model capability and entry experience first.',
        'The goal of an alternatives page is not to pick for you, but to narrow the shortlist quickly.',
      ],
    },
    faqs: [
      {
        question: { cn: '为什么单独做 ChatGPT 替代方案页？', en: 'Why make a separate ChatGPT alternatives page?' },
        answer: {
          cn: '因为很多用户已经有非常明确的替代意图，这比泛泛的聊天机器人对比更接近转化。',
          en: 'Because many users already have a very specific replacement intent, which is closer to conversion than a broad chatbot comparison.',
        },
      },
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看工作流贴合度、模型/入口体验、更新情况、价格和真实反馈。',
          en: 'We compare workflow fit, model and entry experience, freshness, pricing, and real feedback.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='chatgpt_alternatives_comparison' />
    </>
  );
}
