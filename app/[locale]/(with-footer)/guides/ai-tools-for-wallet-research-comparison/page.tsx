import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 钱包研究工具对比' : 'AI tools for wallet research comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的钱包研究工具，帮你更快选出适合地址画像、链上线索和行为判断的一款。'
      : 'Compare common wallet research tools to choose the one that fits address profiles, on-chain clues, and behavior analysis best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '钱包研究工具', en: 'Wallet research tools' },
    comparisonLabel: { cn: 'AI 钱包研究工具对比', en: 'AI tools for wallet research comparison' },
    description: {
      cn: '如果你已经知道自己要解决地址研究、钱包画像、行为判断和链上线索分析，这一页会帮你把常见候选放在一起看。',
      en: 'If you already know you need address research, wallet profiling, behavior analysis, and on-chain clue discovery, this page helps you compare common options side by side.',
    },
    searchQuery: 'wallet',
    guideHref: '/guides/ai-tools-for-wallet-research',
    backGuideLabel: { cn: '回到钱包研究指南', en: 'Back to wallet research guide' },
    altBrowseHref: '/explore?search=wallet&sort=popular',
    altBrowseLabel: { cn: '浏览更多钱包研究工具', en: 'Browse more wallet research tools' },
    breadcrumbLabel: { cn: '钱包研究工具对比', en: 'Wallet research tools comparison' },
    compareTitle: {
      cn: '几款常见钱包研究工具的快速对照',
      en: 'A quick side-by-side look at common wallet research tools',
    },
    compareSubtitle: { cn: 'Wallet research', en: 'Wallet research' },
    preferredToolNames: ['arkham', 'nansen', 'debank', 'bubblemaps'],
    decisionCards: [
      {
        title: { cn: '看地址画像能力', en: 'Address profiling strength' },
        description: {
          cn: '优先看它能不能帮你快速判断一个地址的大概角色和行为风格。',
          en: 'Prioritize whether the tool helps you quickly infer the likely role and behavior pattern of an address.',
        },
      },
      {
        title: { cn: '看标签与关系线索', en: 'Labels and relationship clues' },
        description: {
          cn: '更该看地址标签、钱包聚类和相关关系是否清楚。',
          en: 'Focus more on whether labels, wallet clustering, and related-entity clues are clear.',
        },
      },
      {
        title: { cn: '看研究复盘效率', en: 'Research review efficiency' },
        description: {
          cn: '如果你会持续做研究，就要看搜索、历史和线索串联是否顺手。',
          en: 'If you do recurring research, judge how smoothly search, history, and clue-linking work together.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '做地址研究和投研的人', en: 'People doing address and investment research' },
        description: {
          cn: '适合需要把地址行为、叙事和链上关系慢慢拼起来的研究角色。',
          en: 'Best for research roles that need to connect address behavior, narratives, and on-chain relationships over time.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想收提醒的人', en: 'People mainly wanting alerts' },
        description: {
          cn: '如果重点是异动提醒而不是理解地址，钱包监控页通常更适合。',
          en: 'If the real job is anomaly alerts rather than understanding addresses, wallet monitoring pages are usually a better fit.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-wallet-monitoring-comparison',
        title: { cn: '转去钱包监控工具对比', en: 'Switch to wallet monitoring comparison' },
        description: {
          cn: '如果你发现真正决策点更偏提醒和异动，这页更合适。',
          en: 'Move there if the real decision is shifting toward alerts and anomalies.',
        },
      },
      {
        href: '/guides/ai-tools-for-crypto-portfolio-tracking-comparison',
        title: { cn: '转去资产追踪工具对比', en: 'Switch to portfolio tracking comparison' },
        description: {
          cn: '如果你更关心组合视图和持仓归集，这页更贴近目标。',
          en: 'More useful if the real decision is more about portfolio views and holdings rollups.',
        },
      },
      {
        href: '/explore?search=wallet&sort=popular',
        title: { cn: '继续看更多钱包候选', en: 'See more wallet candidates' },
        description: {
          cn: '当你只需要扩大 shortlist 时，直接回 Explore 最快。',
          en: 'The fastest next step once you only need a wider shortlist.',
        },
      },
    ],
    tips: {
      cn: [
        '先看地址画像，再看标签和关系线索。',
        '如果会持续研究，重点看历史和搜索效率。',
        '比“看到交易”更重要的是能不能慢慢形成可靠判断。',
      ],
      en: [
        'Start with address profiles, then move to labels and relationship clues.',
        'If the work is recurring, focus on history depth and search efficiency.',
        'More important than seeing transactions is whether the tool supports reliable interpretation over time.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看地址画像、标签体系、关系线索、历史视图和研究复盘效率。',
          en: 'We compare address profiling, labeling systems, relationship clues, historical views, and research review efficiency.',
        },
      },
      {
        question: { cn: '为什么单独做钱包研究对比？', en: 'Why compare wallet research tools separately?' },
        answer: {
          cn: '因为这类决策重点通常不是提醒，而是能不能更好地理解地址和链上线索。',
          en: 'Because the decision is usually less about alerts and more about whether addresses and on-chain clues become easier to understand.',
        },
      },
    ],
  });

  return ComparisonPage({ ...data, locale });
}
