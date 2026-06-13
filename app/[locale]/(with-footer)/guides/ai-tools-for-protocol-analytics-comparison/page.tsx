import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 协议分析工具对比' : 'AI tools for protocol analytics comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的协议 AI 工具，帮你更快选出适合协议健康和趋势观察的一个。'
      : 'Compare common protocol AI tools to choose the one that fits your health and trend workflow best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '协议工具', en: 'Protocol tools' },
    comparisonLabel: { cn: 'AI 协议分析工具对比', en: 'AI tools for protocol analytics comparison' },
    description: {
      cn: '如果你已经知道自己要做协议健康观察、使用量分析或研究，这一页会帮你把几款常见工具放在一起看。',
      en: 'If you already know you need protocol health monitoring, usage analysis, or research, this page helps you compare a few common tools side by side.',
    },
    searchQuery: 'protocol',
    guideHref: '/guides/ai-tools-for-protocol-analytics',
    backGuideLabel: { cn: '回到协议指南', en: 'Back to protocol guide' },
    altBrowseHref: '/explore?search=protocol&sort=popular',
    altBrowseLabel: { cn: '浏览更多协议工具', en: 'Browse more protocol tools' },
    breadcrumbLabel: { cn: '协议工具对比', en: 'Protocol tools comparison' },
    compareTitle: { cn: '几款常见协议工具的快速对照', en: 'A quick side-by-side look at common protocol tools' },
    compareSubtitle: { cn: 'Protocol', en: 'Protocol' },
    preferredToolNames: ['messari', 'token-terminal', 'dune', 'defillama'],
    decisionCards: [
      {
        title: { cn: '看协议覆盖', en: 'Protocol coverage' },
        description: {
          cn: '优先看它是否覆盖你真正研究的协议和生态，而不是只看数量。',
          en: 'Prioritize whether it covers the protocols and ecosystems you actually study rather than only counting how many it lists.',
        },
      },
      {
        title: { cn: '看历史和趋势', en: 'History and trends' },
        description: {
          cn: '更该看历史深度、趋势视图和长期观察是否稳定。',
          en: 'Focus more on history depth, trend views, and whether long-term observation feels stable.',
        },
      },
      {
        title: { cn: '看研究输出能力', en: 'Research output fit' },
        description: {
          cn: '如果要给团队或客户使用，就要看 API、导出和复盘效率。',
          en: 'If the work feeds a team or clients, look at API access, exports, and how efficient the review workflow is.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '持续做协议研究的人', en: 'People doing ongoing protocol research' },
        description: {
          cn: '适合需要持续跟踪协议健康、使用量和趋势变化的研究或运营角色。',
          en: 'Best for research or operations roles that need to track protocol health, usage, and trend changes over time.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想看单个钱包异动的人', en: 'People mostly tracking single-wallet anomalies' },
        description: {
          cn: '如果重点是提醒和地址异动，钱包监控页通常更适合。',
          en: 'If the real job is alerts and wallet anomalies, wallet monitoring pages are usually a better fit.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-defi-analytics-comparison',
        title: { cn: '转去 DeFi 分析工具对比', en: 'Switch to DeFi analytics comparison' },
        description: {
          cn: '如果你发现真正决策点更偏 DeFi 协议与流动性，这页更合适。',
          en: 'Move there if the real decision is shifting toward DeFi protocol and liquidity analysis.',
        },
      },
      {
        href: '/guides/ai-tools-for-web3-comparison',
        title: { cn: '回到 Web3 工具总对比', en: 'Back to Web3 tools comparison' },
        description: {
          cn: '适合还没完全确定自己在选协议、钱包还是研究工具。',
          en: 'Best if you are not yet fully narrowed into protocol, wallet, or research tooling.',
        },
      },
      {
        href: '/explore?search=protocol&sort=popular',
        title: { cn: '继续看更多协议候选', en: 'See more protocol candidates' },
        description: {
          cn: '当你只需要扩大 shortlist 时，直接回 Explore 最快。',
          en: 'The fastest next step once you only need a wider shortlist.',
        },
      },
    ],
    tips: {
      cn: [
        '先看协议覆盖和历史深度，再看是否支持你常用的链。',
        '如果你要团队使用，关注 API、导出、权限和告警能力。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'Start with protocol coverage and historical depth, then check whether it supports the chains you actually use.',
        'For team use, look at API access, exports, permissions, and alerting.',
        'For long-term use, pay attention to freshness, ratings, and real comments.',
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
        question: { cn: '为什么只看协议工具？', en: 'Why only protocol tools?' },
        answer: {
          cn: '因为协议工具的意图比较明确，通常围绕协议健康、使用量和趋势研究，对比也更直接。',
          en: 'Because protocol tools usually map to clear needs around health, usage, and trend research, making comparison more direct.',
        },
      },
    ],
  });

  return ComparisonPage({ ...data, locale });
}
