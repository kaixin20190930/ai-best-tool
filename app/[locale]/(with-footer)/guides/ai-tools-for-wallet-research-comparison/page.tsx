import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

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
      {
        title: { cn: '重视链上线索解释的人', en: 'People who need interpretable on-chain clues' },
        description: {
          cn: '当你不满足于“这个钱包动了”，而是要判断它是谁、在做什么、和谁有关时，这类对比最有帮助。',
          en: 'These pages are most useful when you need more than “this wallet moved” and want to judge who it is, what it is doing, and how it connects to others.',
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
      {
        title: { cn: '只看持仓汇总的人', en: 'People only wanting holdings rollups' },
        description: {
          cn: '如果你主要关心资产归集和组合视图，资产追踪工具通常会更直接。',
          en: 'Portfolio tracking tools are usually more direct when the real need is holdings rollups and portfolio views.',
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
        href: '/guides/ai-tools-for-on-chain-analysis-comparison',
        title: { cn: '转去链上分析对比', en: 'Go to on-chain analysis comparison' },
        description: {
          cn: '如果你的问题开始延伸到资金路径、地址关联和更广的链上行为，这页更顺。',
          en: 'A better path when the question extends into fund paths, address relations, and broader on-chain behavior.',
        },
      },
    ],
    toolSelectionNotes: {
      arkham: {
        bestFor: {
          cn: '想快速建立地址画像、识别可能身份和追线索的研究者。',
          en: 'Researchers who want to build quick address profiles, infer likely identities, and follow clues fast.',
        },
        whyPickIt: {
          cn: '它很适合把钱包研究拉近到“这个地址可能是谁、为什么值得关注”。',
          en: 'It is useful when wallet research needs to get closer to who an address might be and why it matters.',
        },
        watchOut: {
          cn: '如果你主要想做更系统的持仓视图或轻量监控，它不一定是最直接的一层。',
          en: 'It may not be the most direct layer if the real need is more systematic portfolio views or lightweight monitoring.',
        },
      },
      nansen: {
        bestFor: {
          cn: '更关心聪明钱、资金流向和地址行为信号的人。',
          en: 'People more focused on smart-money signals, fund flow, and behavior at the address layer.',
        },
        whyPickIt: {
          cn: '它适合把钱包研究继续拉向“谁在动、资金怎么走、市场可能怎么看”。',
          en: 'It is strong when wallet research moves toward who is acting, where funds are moving, and what the market may infer.',
        },
        watchOut: {
          cn: '如果你只需要静态地址说明或轻量持仓查看，它可能会比需要的更重。',
          en: 'It can feel heavier than necessary if the job is only static address explanation or lightweight holdings checks.',
        },
      },
      debank: {
        bestFor: {
          cn: '想快速看钱包持仓、协议暴露和基础行为轮廓的人。',
          en: 'People who want a fast view of wallet holdings, protocol exposure, and baseline behavior patterns.',
        },
        whyPickIt: {
          cn: '它让“先看清钱包大概在干什么”这一步变得很直接。',
          en: 'It makes the first step of understanding what a wallet is broadly doing very direct.',
        },
        watchOut: {
          cn: '如果你要更强的地址关系、标签解释和研究上下文，后面通常还会继续缩到更研究导向的工具。',
          en: 'You will often narrow further into more research-oriented tools if relationship mapping, labeling, and deeper context become important.',
        },
      },
      bubblemaps: {
        bestFor: {
          cn: '想通过可视化关系快速看代币持有人结构和地址连接的人。',
          en: 'People who want visual relationship mapping for token holder structure and address connections.',
        },
        whyPickIt: {
          cn: '它适合把“地址和地址之间的关系”变得更直观，尤其适合线索发现。',
          en: 'It is especially useful for making address-to-address relationships more intuitive, particularly during clue discovery.',
        },
        watchOut: {
          cn: '如果你需要更完整的钱包研究工作台，而不只是可视化关系，它通常不是全部答案。',
          en: 'It is usually not the whole answer when you need a fuller wallet-research workspace rather than relationship visualization alone.',
        },
      },
    },
    tips: {
      cn: [
        '先看地址画像，再看标签、关系线索和研究上下文。',
        '如果会持续研究，重点看历史、搜索效率和线索串联能力。',
        '比“看到交易”更重要的是能不能逐步形成可靠判断。',
      ],
      en: [
        'Start with address profiles, then move into labels, relationship clues, and research context.',
        'If the work is recurring, focus on history depth, search efficiency, and how well clues link together.',
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

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_wallet_research_comparison' />
    </>
  );
}
