import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw'
      ? 'AI Crypto 资产追踪工具对比'
      : 'AI tools for crypto portfolio tracking comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 Crypto 资产追踪工具，帮你更快选出适合持仓看板、钱包归集和组合观察的一款。'
      : 'Compare common crypto portfolio tracking tools to choose the one that fits dashboards, wallet rollups, and allocation monitoring best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: 'Crypto 资产追踪工具', en: 'Crypto portfolio tracking tools' },
    comparisonLabel: {
      cn: 'AI Crypto 资产追踪工具对比',
      en: 'AI tools for crypto portfolio tracking comparison',
    },
    description: {
      cn: '如果你已经知道自己要解决组合看板、多钱包归集、资产分布或持仓观察，这一页会帮你把常见候选放在一起看。',
      en: 'If you already know you need portfolio dashboards, multi-wallet rollups, allocation views, or holdings tracking, this page helps you compare common options side by side.',
    },
    searchQuery: 'portfolio',
    guideHref: '/guides/ai-tools-for-crypto-portfolio-tracking',
    backGuideLabel: { cn: '回到资产追踪指南', en: 'Back to portfolio tracking guide' },
    altBrowseHref: '/explore?search=portfolio&sort=popular',
    altBrowseLabel: { cn: '浏览更多资产追踪工具', en: 'Browse more portfolio tools' },
    breadcrumbLabel: { cn: 'Crypto 资产追踪工具对比', en: 'Crypto portfolio tracking tools comparison' },
    compareTitle: {
      cn: '几款常见资产追踪工具的快速对照',
      en: 'A quick side-by-side look at common portfolio tracking tools',
    },
    compareSubtitle: { cn: 'Portfolio tracking', en: 'Portfolio tracking' },
    preferredToolNames: ['debank', 'zerion', 'zapper', 'nansen'],
    decisionCards: [
      {
        title: { cn: '看多钱包和多链支持', en: 'Wallet and chain coverage' },
        description: {
          cn: '优先看它能不能覆盖你真实使用的钱包结构和链。',
          en: 'Prioritize whether the tool actually covers the wallet structure and chains you use.',
        },
      },
      {
        title: { cn: '看组合视图清晰度', en: 'Portfolio view clarity' },
        description: {
          cn: '更该看资产归类、分配视图和历史变化是否清楚。',
          en: 'Focus more on asset grouping, allocation views, and how clear historical changes are.',
        },
      },
      {
        title: { cn: '看长期观察能力', en: 'Long-term tracking fit' },
        description: {
          cn: '如果你要长期跟踪持仓，就要看刷新频率、历史和导出能力。',
          en: 'If long-term tracking matters, look at refresh cadence, history depth, and export support.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '需要稳定看组合的用户', en: 'People who need a stable portfolio view' },
        description: {
          cn: '适合多钱包、多链或希望长期观察持仓变化的人。',
          en: 'Best for people with multiple wallets, multiple chains, or an ongoing need to track holdings over time.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想看预警的人', en: 'People who mainly need alerts' },
        description: {
          cn: '如果重点是异动提醒而不是组合看板，钱包监控页通常更适合。',
          en: 'If the real job is anomaly alerts rather than portfolio views, wallet monitoring pages are usually a better fit.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-wallet-monitoring-comparison',
        title: { cn: '转去钱包监控工具对比', en: 'Switch to wallet monitoring comparison' },
        description: {
          cn: '如果你发现真正决策点更偏提醒和异动，这页更贴近目标。',
          en: 'Move there if the real decision is shifting toward alerts and anomalies.',
        },
      },
      {
        href: '/guides/ai-tools-for-web3-comparison',
        title: { cn: '回到 Web3 工具总对比', en: 'Back to Web3 tools comparison' },
        description: {
          cn: '适合还没完全确定自己在选追踪、监控还是研究工具。',
          en: 'Best if you are not yet fully narrowed into tracking, monitoring, or research.',
        },
      },
      {
        href: '/explore?search=portfolio&sort=popular',
        title: { cn: '继续看更多资产候选', en: 'See more portfolio candidates' },
        description: {
          cn: '当你只需要扩大 shortlist 时，直接回 Explore 最快。',
          en: 'The fastest next step once you only need a wider shortlist.',
        },
      },
    ],
    toolSelectionNotes: {
      debank: {
        bestFor: {
          cn: '想快速看清钱包持仓、协议暴露和日常组合状态的人。',
          en: 'People who want a fast read on wallet holdings, protocol exposure, and day-to-day portfolio state.',
        },
        whyPickIt: {
          cn: '它更像组合可见性的起点层，适合把“我现在到底持有什么”先整理清楚。',
          en: 'It behaves like a starting layer for portfolio visibility, which helps answer what you actually hold right now.',
        },
        watchOut: {
          cn: '如果你真正要的是更深的地址关系或聪明钱研究，它通常只是第一站。',
          en: 'It is usually the first stop rather than the deepest layer if you need smart-money or address-relationship research.',
        },
      },
      zerion: {
        bestFor: {
          cn: '更在意跨链仓位、资产分配和组合界面清晰度的活跃持仓用户。',
          en: 'Active holders who care about cross-chain positions, allocations, and a cleaner portfolio interface.',
        },
        whyPickIt: {
          cn: '它在钱包优先和组合清晰度上很直接，适合长期盯仓位变化的人。',
          en: 'It is especially direct on wallet-first portfolio clarity, which suits people tracking positions over time.',
        },
        watchOut: {
          cn: '如果你更在意协议研究或深度链上分析，它会显得不够厚。',
          en: 'It can feel too light if the real work is protocol research or deeper on-chain analysis.',
        },
      },
      zapper: {
        bestFor: {
          cn: '希望从钱包视角快速看资产、协议和动作概览的人。',
          en: 'People who want a quick wallet-first overview of assets, protocols, and activity.',
        },
        whyPickIt: {
          cn: '它适合用作组合和地址工作的中间层，介于轻量可见性和更深研究之间。',
          en: 'It works well as a middle layer between lightweight portfolio visibility and deeper Web3 research.',
        },
        watchOut: {
          cn: '如果你主要要做预警、实体归因或重研究输出，仍值得继续比下去。',
          en: 'You may still want to compare further if alerting, entity attribution, or heavier research output matters more.',
        },
      },
      nansen: {
        bestFor: {
          cn: '不仅看持仓，还要结合行为、资金流和聪明钱信号一起判断的人。',
          en: 'People who want holdings views plus behavior, fund-flow context, and smart-money signals.',
        },
        whyPickIt: {
          cn: '它把组合观察往研究和信号判断那一侧拉得更深。',
          en: 'It pushes portfolio tracking further toward signal interpretation and research depth.',
        },
        watchOut: {
          cn: '如果你只是想看自己的钱包和资产分布，它可能比需求更重。',
          en: 'It can feel heavier than necessary if you mostly want a clean view of your own wallets and allocations.',
        },
      },
    },
    tips: {
      cn: [
        '先看支持的钱包和链，再看资产归类和历史视图。',
        '如果你会长期使用，重点看刷新频率、导出和稳定性。',
        '比“显示很多代币”更重要的是能不能把组合看清楚。',
      ],
      en: [
        'Start with wallet and chain coverage, then move to asset grouping and historical views.',
        'For long-term use, focus on refresh cadence, export support, and stability.',
        'More important than showing many tokens is whether the portfolio becomes easier to understand.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看钱包与链支持、资产归类、组合视图、历史能力和长期观察体验。',
          en: 'We compare wallet and chain coverage, asset grouping, portfolio views, historical depth, and long-term tracking experience.',
        },
      },
      {
        question: { cn: '为什么单独做资产追踪对比？', en: 'Why compare portfolio tracking tools separately?' },
        answer: {
          cn: '因为这类决策重点通常不是提醒，而是能不能稳定整理和观察你的真实持仓结构。',
          en: 'Because the decision is usually less about alerts and more about whether the tool can reliably organize and present your real holdings structure.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_crypto_portfolio_tracking_comparison' />
    </>
  );
}
