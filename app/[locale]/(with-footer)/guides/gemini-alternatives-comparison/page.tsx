import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Gemini 替代方案对比' : 'Gemini alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Gemini 的 AI 工具，帮你更快判断 Google 生态、移动入口和多模型切换该怎么选。'
      : 'Compare AI tools that are commonly used as Gemini alternatives so you can choose the right fit for Google ecosystem workflows, mobile entry points, and multi-model switching.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '聊天工具', en: 'Chat tools' },
    comparisonLabel: { cn: 'Gemini 替代方案对比', en: 'Gemini alternatives comparison' },
    description: {
      cn: '如果你已经在比较 Gemini 这类入口，这一页会把几个更常见的替代项放在一起看，帮助你更快判断自己要的是生态整合、移动入口，还是更通用的聊天体验。',
      en: 'If you are already comparing Gemini-style entry points, this page puts the common alternatives side by side so you can decide whether you need ecosystem integration, mobile access, or a more general chat experience.',
    },
    searchQuery: 'gemini',
    guideHref: '/guides/ai-chatbot-tools',
    rankingHref: '/best-ai-tools/ai-chatbot-tools',
    rankingLabel: { cn: '转去聊天榜单页', en: 'Open the chatbot ranking' },
    backGuideLabel: { cn: '回到聊天机器人指南', en: 'Back to chatbot guide' },
    altBrowseHref: '/explore?search=gemini&sort=popular',
    altBrowseLabel: { cn: '浏览更多 Gemini 相关工具', en: 'Browse more Gemini-related tools' },
    breadcrumbLabel: { cn: 'Gemini 替代方案对比', en: 'Gemini alternatives comparison' },
    compareTitle: {
      cn: '几款常见 Gemini 替代项的快速对照',
      en: 'A quick side-by-side look at common Gemini alternatives',
    },
    compareSubtitle: { cn: 'Gemini', en: 'Gemini' },
    preferredToolNames: ['gemini', 'poe', 'chatgpt-mac', 'anthropic'],
    decisionCards: [
      {
        title: { cn: '先看生态整合还是通用性', en: 'Ecosystem integration or general-purpose' },
        description: {
          cn: '如果你已经深度使用 Google 生态，Gemini 的价值会不一样；如果你更看重通用入口，其他工具可能更合适。',
          en: 'If you are already deep in Google’s ecosystem, Gemini’s value changes; if you want a more general entry point, other tools may fit better.',
        },
      },
      {
        title: { cn: '再看移动端和跨设备体验', en: 'Mobile and cross-device experience' },
        description: {
          cn: '很多人选择 Gemini，不只是因为模型，而是它在手机和多设备上的入口感。',
          en: 'Many people choose Gemini not only for the model, but for how natural the mobile and multi-device entry feels.',
        },
      },
      {
        title: { cn: '最后看是否适合长期使用', en: 'Is it good enough for daily use' },
        description: {
          cn: '如果要长期用，稳定性、价格、切换成本和真实反馈会比宣传页更重要。',
          en: 'For daily use, stability, pricing, switching cost, and real feedback matter more than marketing pages.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: 'Google 生态用户', en: 'Google ecosystem users' },
        description: {
          cn: '适合你本来就常用 Google 相关产品，想让 AI 更自然融入。',
          en: 'Best if you already live in Google’s products and want AI to fit naturally into that workflow.',
        },
      },
      {
        title: { cn: '移动端优先的人', en: 'Mobile-first users' },
        description: {
          cn: '如果手机是你的主要入口，这类比较会更有用。',
          en: 'If your phone is the main entry point, this comparison becomes especially useful.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想固定一个桌面入口的人', en: 'People who want one fixed desktop entry' },
        description: {
          cn: '如果你更像是在找一个稳定的桌面主入口，先看 Cursor、Claude 或 ChatGPT 替代页。',
          en: 'If you want a stable desktop primary entry, start with Cursor, Claude, or ChatGPT alternatives instead.',
        },
      },
      {
        title: { cn: '还没决定用途的人', en: 'People still undecided on the use case' },
        description: {
          cn: '如果你还不知道自己更需要聊天、写作、研究还是代码理解，先回聊天机器人指南。',
          en: 'If you are still unsure whether the job is chat, writing, research, or code understanding, go back to the chatbot guide.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-chatbot-tools',
        title: { cn: '先看聊天榜单', en: 'Start with the chatbot ranking' },
        description: {
          cn: '如果你已经确定在聊天入口里选型，先用榜单收口。',
          en: 'If you are already choosing a chat entry point, use the ranking to narrow things down first.',
        },
      },
      {
        href: '/guides/chatgpt-alternatives-comparison',
        title: { cn: '转去 ChatGPT 替代方案对比', en: 'Go to ChatGPT alternatives comparison' },
        description: {
          cn: '如果你更关心通用聊天入口，这条路径更合适。',
          en: 'Use this when you care more about general-purpose chat entry points.',
        },
      },
      {
        href: '/guides/claude-alternatives-comparison',
        title: { cn: '转去 Claude 替代方案对比', en: 'Go to Claude alternatives comparison' },
        description: {
          cn: '如果你更在意长上下文和分析，这页更高意图。',
          en: 'A higher-intent path when long context and analysis matter more.',
        },
      },
      {
        href: '/guides/ai-chatbot-tools-comparison',
        title: { cn: '转去聊天机器人总对比', en: 'Go to chatbot comparison' },
        description: {
          cn: '如果你想重新拉宽候选范围，再从总对比里筛。',
          en: 'Broaden the shortlist again through the wider chatbot comparison.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/chatgpt-alternatives-comparison',
        title: { cn: '转去 ChatGPT 替代方案对比', en: 'Go to ChatGPT alternatives comparison' },
        description: {
          cn: '如果你要比较更通用的聊天入口，这页更接近。',
          en: 'Use this if you want to compare more general-purpose chat entry points.',
        },
      },
      {
        href: '/guides/claude-alternatives-comparison',
        title: { cn: '转去 Claude 替代方案对比', en: 'Go to Claude alternatives comparison' },
        description: {
          cn: '如果你更在意长上下文和分析，这条路径更合适。',
          en: 'Switch here if long context and analysis matter more.',
        },
      },
      {
        href: '/guides/ai-chatbot-tools-comparison',
        title: { cn: '转去聊天机器人总对比', en: 'Go to chatbot comparison' },
        description: {
          cn: '如果你想重新拉宽候选范围，再从总对比里筛。',
          en: 'Broaden the shortlist again through the wider chatbot comparison.',
        },
      },
    ],
    toolSelectionNotes: {
      gemini: {
        bestFor: {
          cn: '已经在 Google 生态里工作、并且经常用手机或多设备切换的人。',
          en: 'People already working in Google’s ecosystem who often switch between phone and desktop.',
        },
        whyPickIt: {
          cn: '它在 Google 体系里很自然，适合把 AI 作为日常入口的一部分。',
          en: 'It feels natural inside Google’s ecosystem, making AI part of a daily entry point.',
        },
        watchOut: {
          cn: '如果你更需要的是一个跨平台稳定主入口，还是要拿别的工具对比一下。',
          en: 'If you want a more platform-neutral stable primary entry point, compare other tools too.',
        },
      },
      poe: {
        bestFor: {
          cn: '想同时试多个模型、顺手切换回答风格的人。',
          en: 'People who want to test multiple models and switch response styles quickly.',
        },
        whyPickIt: {
          cn: '它适合在一个地方快速比较不同模型的反馈。',
          en: 'It is useful for quickly comparing multiple models in one place.',
        },
        watchOut: {
          cn: '如果你只想要一个稳定主入口，Poe 可能更像辅助平台。',
          en: 'If you only want one stable main entry point, Poe may feel more like a companion platform.',
        },
      },
      'chatgpt-mac': {
        bestFor: {
          cn: '想在桌面工作流里保留 ChatGPT 使用感的人。',
          en: 'People who want to keep the ChatGPT feel inside a desktop workflow.',
        },
        whyPickIt: {
          cn: '它更像把聊天能力直接拉进你日常工作的桌面入口。',
          en: 'It feels like bringing chat capabilities straight into your everyday desktop workflow.',
        },
        watchOut: {
          cn: '如果你更重视生态整合而不是聊天体验本身，Gemini 也许不是唯一选项。',
          en: 'If ecosystem integration matters more than the chat experience itself, Gemini is not the only option.',
        },
      },
      anthropic: {
        bestFor: {
          cn: '更看重稳输出、长内容和深一点分析的人。',
          en: 'People who value steady output, long content, and deeper analysis.',
        },
        whyPickIt: {
          cn: '它适合把复杂问题讲得更清楚，尤其是在长文本任务里。',
          en: 'It tends to explain complex issues clearly, especially in long-text tasks.',
        },
        watchOut: {
          cn: '如果你的核心诉求是 Google 生态和移动入口，Claude 不是同一类起点。',
          en: 'If your core need is Google ecosystem fit and mobile access, Claude is a different kind of starting point.',
        },
      },
    },
    tips: {
      cn: [
        '先区分你要的是生态入口，还是更通用的聊天入口。',
        '如果手机和多设备切换很重要，把移动端体验放前面看。',
        '不要只看模型名字，入口习惯和长期使用成本同样重要。',
      ],
      en: [
        'First decide whether you want an ecosystem entry or a more general chat entry.',
        'If mobile and multi-device switching matter, prioritize the mobile experience.',
        'Do not judge by model name alone; entry habit and long-term switching cost matter too.',
      ],
    },
    faqs: [
      {
        question: { cn: '为什么单独做 Gemini 替代方案页？', en: 'Why make a separate Gemini alternatives page?' },
        answer: {
          cn: '因为 Gemini 的决策常常不只是模型，而是 Google 生态、移动入口和多设备体验。',
          en: 'Because the decision around Gemini is often not just about the model, but also Google ecosystem fit, mobile entry, and multi-device experience.',
        },
      },
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看生态整合、入口体验、模型切换、稳定性、价格和真实反馈。',
          en: 'We compare ecosystem fit, entry experience, model switching, stability, pricing, and real feedback.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='gemini_alternatives_comparison' />
    </>
  );
}
