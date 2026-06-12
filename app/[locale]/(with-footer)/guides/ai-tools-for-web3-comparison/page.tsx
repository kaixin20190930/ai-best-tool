import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI Web3 工具对比' : 'AI tools for Web3 comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 Web3 AI 工具，帮你更快选出适合链上工作流的一个。'
      : 'Compare common Web3 AI tools to choose the one that fits your on-chain workflow best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: 'Web3 工具', en: 'Web3 tools' },
    comparisonLabel: { cn: 'AI Web3 工具对比', en: 'AI tools for Web3 comparison' },
    description: {
      cn: '如果你已经知道自己要做链上分析、钱包工作流或 Crypto 研究，这一页会帮你把几款常见工具放在一起看。',
      en: 'If you already know you need on-chain analysis, wallet workflows, or crypto research, this page helps you compare a few common tools side by side.',
    },
    searchQuery: 'web3',
    guideHref: '/guides/ai-tools-for-web3',
    backGuideLabel: { cn: '回到 Web3 指南', en: 'Back to Web3 guide' },
    altBrowseHref: '/explore?search=web3&sort=popular',
    altBrowseLabel: { cn: '浏览更多 Web3 工具', en: 'Browse more Web3 tools' },
    breadcrumbLabel: { cn: 'Web3 工具对比', en: 'Web3 tools comparison' },
    compareTitle: { cn: '几款常见 Web3 工具的快速对照', en: 'A quick side-by-side look at common Web3 tools' },
    compareSubtitle: { cn: 'Web3', en: 'Web3' },
    preferredToolNames: ['dune', 'messari', 'debank', 'bubblemaps'],
    decisionCards: [
      {
        title: { cn: '做链上研究', en: 'On-chain research' },
        description: {
          cn: '先看链覆盖、查询深度和是否适合把碎片数据变成可复用结论。',
          en: 'Start with chain coverage, query depth, and whether the tool helps turn fragmented data into reusable conclusions.',
        },
      },
      {
        title: { cn: '做钱包与地址监控', en: 'Wallet and address monitoring' },
        description: {
          cn: '更该看通知、可视化、历史轨迹和异常行为判断。',
          en: 'Focus more on alerts, visualization, historical trails, and anomaly detection.',
        },
      },
      {
        title: { cn: '做团队化的数据工作流', en: 'Team data workflows' },
        description: {
          cn: 'API、导出、协作和权限管理会比单次查数据更重要。',
          en: 'API access, exports, collaboration, and permissioning matter more than one-off lookups.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '研究员 / 交易员 / 分析师', en: 'Researchers, traders, and analysts' },
        description: {
          cn: '适合需要长期盯链上数据、协议动态和地址行为的人。',
          en: 'A strong fit for anyone continuously tracking on-chain signals, protocol shifts, or address behavior.',
        },
      },
      {
        title: { cn: '已经明确在做 Web3 垂直工作流的人', en: 'People already inside Web3 workflows' },
        description: {
          cn: '如果你已经知道自己要看链、地址、协议和风险，这类页面会很高效。',
          en: 'These comparison pages work best once you already know your real work is on-chain, wallet, protocol, or risk focused.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想看泛 AI 榜单的人', en: 'People browsing broad AI lists' },
        description: {
          cn: '如果你还没确定自己真的需要 Web3 数据工具，这页会显得太垂直。',
          en: 'If you are still exploring broad AI tooling, this page will likely feel too specialized.',
        },
      },
      {
        title: { cn: '不需要链上数据的人', en: 'People who do not need on-chain data' },
        description: {
          cn: '如果工作重点不在链、协议、地址或资产行为，Web3 工具通常不是最优先入口。',
          en: 'If chains, protocols, wallets, and asset behavior are not central to the job, Web3 tools are probably not the first stop.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-on-chain-analysis-comparison',
        title: { cn: '转去链上分析对比', en: 'Go to on-chain analysis comparison' },
        description: {
          cn: '当核心问题已经明确是地址、流向和链上行为时，这页更贴近高意图搜索。',
          en: 'The better path when the real need is addresses, fund flow, and on-chain behavior.',
        },
      },
      {
        href: '/guides/ai-tools-for-crypto-research-comparison',
        title: { cn: '转去 Crypto 研究对比', en: 'Go to crypto research comparison' },
        description: {
          cn: '如果你更偏项目调研、叙事判断和信息整合，这里更合适。',
          en: 'A better fit when the decision is really about project research, narratives, and information synthesis.',
        },
      },
      {
        href: '/guides/ai-tools-for-wallet-monitoring-comparison',
        title: { cn: '转去钱包监控对比', en: 'Go to wallet monitoring comparison' },
        description: {
          cn: '如果你关心的是大户、地址风险和异动提醒，就继续走这条路。',
          en: 'Continue here if whales, wallet risk, and anomaly alerts are the real priority.',
        },
      },
    ],
    tips: {
      cn: [
        '先看它支持的链和数据源，不同产品的覆盖面会差很多。',
        '如果你要团队使用，关注 API、导出、权限和历史查询能力。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'Start with supported chains and data sources, because coverage varies a lot.',
        'For team use, look at API access, exports, permissions, and historical queries.',
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
        question: { cn: '为什么只看 Web3 工具？', en: 'Why only Web3 tools?' },
        answer: {
          cn: '因为这几款分别覆盖了链上分析、研究情报、钱包可见性和关系可视化，对比维度更完整。',
          en: 'Because together they cover on-chain analysis, research intelligence, wallet visibility, and relationship visualization.',
        },
      },
    ],
  });

  return ComparisonPage({ ...data, locale });
}
