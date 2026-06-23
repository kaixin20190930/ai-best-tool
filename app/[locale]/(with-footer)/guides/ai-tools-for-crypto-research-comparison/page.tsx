import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI Crypto 研究工具对比' : 'AI tools for crypto research comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 Crypto AI 工具，帮你更快选出适合研究和监控的一个。'
      : 'Compare common crypto AI tools to choose the one that fits your research and monitoring workflow best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: 'Crypto 研究工具', en: 'Crypto research tools' },
    comparisonLabel: { cn: 'AI Crypto 研究工具对比', en: 'AI tools for crypto research comparison' },
    description: {
      cn: '如果你已经知道自己要做代币观察、链上跟踪或市场情报，这一页会帮你把几款常见工具放在一起看。',
      en: 'If you already know you need token watching, on-chain tracking, or market intelligence, this page helps you compare a few common tools side by side.',
    },
    searchQuery: 'crypto',
    guideHref: '/guides/ai-tools-for-crypto-research',
    backGuideLabel: { cn: '回到 Crypto 指南', en: 'Back to crypto guide' },
    altBrowseHref: '/explore?search=crypto&sort=popular',
    altBrowseLabel: { cn: '浏览更多 Crypto 工具', en: 'Browse more crypto tools' },
    breadcrumbLabel: { cn: 'Crypto 研究工具对比', en: 'Crypto research tools comparison' },
    compareTitle: { cn: '几款常见 Crypto 工具的快速对照', en: 'A quick side-by-side look at common crypto tools' },
    compareSubtitle: { cn: 'Crypto', en: 'Crypto' },
    preferredToolNames: ['messari', 'defillama', 'dune', 'nansen'],
    comparisonDimensions: [
      {
        title: { cn: '研究框架', en: 'Research framing' },
        description: {
          cn: '先看它能不能把零散资料收拢成一个更清楚的研究起点。',
          en: 'Check whether it can turn scattered sources into a clearer research starting point.',
        },
      },
      {
        title: { cn: '链上与资料并重', en: 'On-chain plus source context' },
        description: {
          cn: '好的 Crypto 工具不只是给数据，还要把项目资料、叙事和链上信号放在一起。',
          en: 'A good crypto tool does more than show data; it brings project materials, narratives, and on-chain signals together.',
        },
      },
      {
        title: { cn: '持续追踪能力', en: 'Long-term tracking' },
        description: {
          cn: '如果你要长期 watchlist，历史维度、导出和回看就很关键。',
          en: 'If you maintain a watchlist over time, history, exports, and reviewability become essential.',
        },
      },
      {
        title: { cn: '研究到决策的距离', en: 'Research-to-decision distance' },
        description: {
          cn: '看它能不能让你从发现到判断的路径更短，而不是只给一堆相关信息。',
          en: 'See whether it shortens the path from discovery to decision instead of only surfacing related information.',
        },
      },
    ],
    decisionCards: [
      {
        title: { cn: '做市场与项目研究', en: 'Market and project research' },
        description: {
          cn: '先看研究框架、主题覆盖和是否方便把零散信息变成可判断的结论。',
          en: 'Start with research framing, topic coverage, and whether fragmented information can be turned into usable conclusions.',
        },
      },
      {
        title: { cn: '做链上追踪与验证', en: 'On-chain tracking and validation' },
        description: {
          cn: '更该看数据深度、地址和协议维度，以及是否能继续往下钻。',
          en: 'Focus more on data depth, address and protocol layers, and whether the tool lets you drill further.',
        },
      },
      {
        title: { cn: '做长期 watchlist', en: 'Long-term watchlist workflows' },
        description: {
          cn: '如果你要持续跟踪项目与赛道，导出、历史维度和复盘效率会更重要。',
          en: 'If you need to track projects and sectors over time, exports, historical depth, and review efficiency matter more.',
        },
      },
    ],
    fitFor: [
      {
        title: {
          cn: '做 Crypto 投研、内容和策略跟踪的人',
          en: 'People doing crypto research, content, and strategy tracking',
        },
        description: {
          cn: '适合需要在链上数据、项目资料和市场叙事之间持续切换的人。',
          en: 'Best for people who move repeatedly between on-chain data, project materials, and market narratives.',
        },
      },
      {
        title: { cn: '已经确定要做 Web3 垂直研究的人', en: 'People already committed to Web3-specific research' },
        description: {
          cn: '当问题已经不是“要不要看 crypto”，而是“怎么更有效研究 crypto”，这类页最有用。',
          en: 'These pages work best when the question is no longer whether to study crypto, but how to research it more effectively.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想看最轻量行情的人', en: 'People who only want lightweight price watching' },
        description: {
          cn: '如果你只是想扫一眼行情，不打算深入研究，这类工具通常会显得偏重。',
          en: 'These tools usually feel too heavy when the job is only quick price checking rather than deeper research.',
        },
      },
      {
        title: { cn: '不需要链上和项目上下文的人', en: 'People who do not need on-chain or project context' },
        description: {
          cn: '如果工作重点不在项目、协议、地址或赛道判断，Crypto 研究工具通常不是第一入口。',
          en: 'Crypto research tools are usually not the first stop when projects, protocols, addresses, and sector judgment are not central to the work.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-token-research-comparison',
        title: { cn: '转去代币研究对比', en: 'Go to token research comparison' },
        description: {
          cn: '当问题已经收窄到具体 token、项目比较和基本面判断时，这页更高意图。',
          en: 'A better high-intent path when the work narrows into token-level project comparison and fundamentals judgment.',
        },
      },
      {
        href: '/guides/ai-tools-for-wallet-research-comparison',
        title: { cn: '转去钱包研究对比', en: 'Go to wallet research comparison' },
        description: {
          cn: '如果你的研究开始转向地址画像、资金路径和钱包行为，这条路更贴近目标。',
          en: 'A better fit when research shifts into address profiles, fund paths, and wallet behavior.',
        },
      },
      {
        href: '/guides/ai-tools-for-protocol-analytics-comparison',
        title: { cn: '转去协议分析对比', en: 'Go to protocol analytics comparison' },
        description: {
          cn: '如果判断点开始偏协议健康、使用量和长期趋势，这页更顺。',
          en: 'The better next step when the decision starts leaning toward protocol health, usage, and longer-term trends.',
        },
      },
      {
        href: '/categories/web3?sort=popular',
        title: { cn: '回到 Web3 分类', en: 'Return to the Web3 category' },
        description: {
          cn: '当你想扩大 shortlist 并回看更多真实条目时，直接回分类页。',
          en: 'Go back to the category when you want a wider shortlist of real listings.',
        },
      },
    ],
    toolSelectionNotes: {
      messari: {
        bestFor: {
          cn: '更偏项目资料、赛道判断和研究输出的人。',
          en: 'People leaning more toward project research, sector framing, and written research output.',
        },
        whyPickIt: {
          cn: '它更适合把 Crypto 研究拉回到“怎么理解项目和叙事”这条线上。',
          en: 'It is strong when crypto research needs to center on how projects and narratives should be interpreted.',
        },
        watchOut: {
          cn: '如果你真正要追的是地址和链上行为，通常还要继续缩到更数据导向的工具。',
          en: 'You will usually narrow further into more data-oriented tooling if the real job is addresses and on-chain behavior.',
        },
      },
      defillama: {
        bestFor: {
          cn: '想快速看协议规模、链上生态和赛道变化的人。',
          en: 'People who want a fast view of protocol scale, ecosystem structure, and sector movement.',
        },
        whyPickIt: {
          cn: '它很适合做“先看全局发生了什么”，帮助你决定值得继续深挖哪里。',
          en: 'It is very good for seeing the big picture first and deciding where deeper investigation is worth the time.',
        },
        watchOut: {
          cn: '如果你需要更强的项目叙事和研究文本支持，它通常不是最完整的一层。',
          en: 'It is usually not the fullest layer when you need stronger narrative research and written project context.',
        },
      },
      dune: {
        bestFor: {
          cn: '想亲自查链上数据、做查询和搭建研究视图的分析者。',
          en: 'Analysts who want to query chain data directly and build their own research views.',
        },
        whyPickIt: {
          cn: '它把研究拉进更深的数据层，适合不满足于现成结论的人。',
          en: 'It brings research closer to the underlying data, which is ideal when ready-made conclusions are not enough.',
        },
        watchOut: {
          cn: '如果你现在只想快速筛项目，不一定需要这么深的查询能力。',
          en: 'You may not need this much query depth if the current job is only quick project screening.',
        },
      },
      nansen: {
        bestFor: {
          cn: '更关心聪明钱、钱包行为和链上资金流信号的人。',
          en: 'People who care more about smart-money behavior, wallet signals, and fund flow.',
        },
        whyPickIt: {
          cn: '它适合把“项目研究”继续拉向“谁在动、钱怎么走”的层面。',
          en: 'It is useful when project research needs to move into who is acting and where money is flowing.',
        },
        watchOut: {
          cn: '如果你的研究更偏项目资料和协议指标，而不是地址层信号，它未必是第一入口。',
          en: 'It may not be the first stop when the work is more about project materials and protocol metrics than address-layer signals.',
        },
      },
    },
    tips: {
      cn: [
        '先看你是做项目研究、链上追踪，还是围绕赛道做长期 watchlist。',
        '如果你要团队使用，关注 API、导出、权限和历史查询能力。',
        '更看重长期使用时，关注更新频率、评分和真实评论，也要看研究框架是否贴合你的风格。',
      ],
      en: [
        'Start with whether the work is project research, on-chain tracking, or building long-term sector watchlists.',
        'For team use, look at API access, exports, permissions, and historical queries.',
        'For long-term use, pay attention to freshness, ratings, real comments, and whether the research framing fits your style.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看数据覆盖、免费可用性、评分、更新情况和实际使用感。',
          en: 'We compare data coverage, free usability, ratings, freshness, and practical usefulness.',
        },
      },
      {
        question: { cn: '为什么只看 Crypto 工具？', en: 'Why only crypto tools?' },
        answer: {
          cn: '因为 Crypto 工具的意图很明确，通常围绕代币、链上和市场研究，对比也更直接。',
          en: 'Because crypto tools usually map to clear needs around tokens, on-chain data, and market research, making comparison more direct.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_crypto_research_comparison' />
    </>
  );
}
