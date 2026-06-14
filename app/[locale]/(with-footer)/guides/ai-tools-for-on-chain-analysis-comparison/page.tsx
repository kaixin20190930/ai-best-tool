import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 链上分析工具对比' : 'AI tools for on-chain analysis comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的链上分析 AI 工具，帮你更快选出适合研究和监控的一个。'
      : 'Compare common on-chain AI tools to choose the one that fits your research and monitoring workflow best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '链上分析工具', en: 'On-chain analysis tools' },
    comparisonLabel: { cn: 'AI 链上分析工具对比', en: 'AI tools for on-chain analysis comparison' },
    description: {
      cn: '如果你已经知道自己要做地址追踪、资金流观察或项目研究，这一页会帮你把几款常见工具放在一起看。',
      en: 'If you already know you need address tracking, fund-flow observation, or project research, this page helps you compare a few common tools side by side.',
    },
    searchQuery: 'on-chain',
    guideHref: '/guides/ai-tools-for-on-chain-analysis',
    backGuideLabel: { cn: '回到链上分析指南', en: 'Back to on-chain guide' },
    altBrowseHref: '/explore?search=on-chain&sort=popular',
    altBrowseLabel: { cn: '浏览更多链上分析工具', en: 'Browse more on-chain tools' },
    breadcrumbLabel: { cn: '链上分析工具对比', en: 'On-chain analysis tools comparison' },
    compareTitle: { cn: '几款常见链上分析工具的快速对照', en: 'A quick side-by-side look at common on-chain tools' },
    compareSubtitle: { cn: '链上分析', en: 'On-chain analysis' },
    preferredToolNames: ['dune', 'nansen', 'defillama', 'arkham'],
    comparisonDimensions: [
      {
        title: { cn: '数据深度', en: 'Data depth' },
        description: {
          cn: '先看它能不能让你继续往下钻，而不是只停留在汇总层。',
          en: 'Check whether it lets you drill down instead of stopping at summary views.',
        },
      },
      {
        title: { cn: '地址与资金流', en: 'Addresses and fund flows' },
        description: {
          cn: '如果你在研究链上行为，地址、路径和资金流是第一层判断。',
          en: 'If you are studying on-chain behavior, addresses, paths, and fund flows are the first layer of judgment.',
        },
      },
      {
        title: { cn: '复用与协作', en: 'Reuse and collaboration' },
        description: {
          cn: '看板复用、导出和历史查询，会决定研究能不能长期跑下去。',
          en: 'Dashboard reuse, exports, and historical queries determine whether research can keep going over time.',
        },
      },
      {
        title: { cn: '从观察到验证', en: 'Observation to validation' },
        description: {
          cn: '如果你想验证自己的判断，就要看它是否支持自定义查询和深入分析。',
          en: 'If you want to validate your own thesis, check whether it supports custom queries and deeper analysis.',
        },
      },
    ],
    decisionCards: [
      {
        title: { cn: '看问题是否需要自定义验证', en: 'Need for custom validation' },
        description: {
          cn: '如果你要验证自己的判断，而不是只看现成结论，就要优先看查询和分析深度。',
          en: 'If the real job is validating your own thesis instead of reading finished summaries, prioritize query and analysis depth.',
        },
      },
      {
        title: { cn: '看偏钱包、协议还是市场层', en: 'Wallet, protocol, or market layer' },
        description: {
          cn: '先分清你是在看钱包行为、协议健康，还是更广的市场扫描，不同工具会直接分流。',
          en: 'First separate whether the work is about wallet behavior, protocol health, or broader market scanning, because the best tool changes fast across those layers.',
        },
      },
      {
        title: { cn: '看团队复用能力', en: 'Team reuse and repeatability' },
        description: {
          cn: '如果这是持续研究流程，就要看看板复用、导出、历史和协作是否顺手。',
          en: 'If this becomes a recurring research workflow, judge how reusable dashboards, exports, history, and collaboration feel.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '做链上研究和判断验证的人', en: 'People doing on-chain research and thesis validation' },
        description: {
          cn: '适合需要把钱包行为、协议数据和资金流线索拼成完整判断的人。',
          en: 'Best for people who need to connect wallet behavior, protocol data, and fund-flow clues into a fuller judgment.',
        },
      },
      {
        title: { cn: '不是只看价格图的人', en: 'People needing more than price charts' },
        description: {
          cn: '当你不满足于行情图，而要看地址、结构和行为变化时，这类对比最有帮助。',
          en: 'These comparisons are most useful when price charts are not enough and the real work is about addresses, structure, and behavior change.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想看持仓汇总的人', en: 'People mainly wanting holdings rollups' },
        description: {
          cn: '如果重点是组合看板和钱包资产归集，资产追踪页通常更直接。',
          en: 'If the real need is portfolio views and wallet rollups, portfolio tracking pages are usually more direct.',
        },
      },
      {
        title: { cn: '只想收提醒的人', en: 'People mainly wanting alerts' },
        description: {
          cn: '如果重点是异动提醒和通知，而不是研究链上结构，钱包监控页通常更适合。',
          en: 'If the real job is alerting and anomaly notifications rather than understanding chain structure, wallet monitoring pages are usually a better fit.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-protocol-analytics-comparison',
        title: { cn: '转去协议分析工具对比', en: 'Switch to protocol analytics comparison' },
        description: {
          cn: '如果你的问题更偏协议表现、健康指标和赛道判断，这页更贴近目标。',
          en: 'A better fit when the real decision is more about protocol performance, health metrics, and sector judgment.',
        },
      },
      {
        href: '/guides/ai-tools-for-wallet-research-comparison',
        title: { cn: '转去钱包研究工具对比', en: 'Switch to wallet research comparison' },
        description: {
          cn: '如果问题开始收窄到地址画像、标签和关系线索，这页会更顺。',
          en: 'Move there when the question narrows into address profiles, labels, and relationship clues.',
        },
      },
      {
        href: '/guides/ai-tools-for-wallet-monitoring-comparison',
        title: { cn: '转去钱包监控工具对比', en: 'Switch to wallet monitoring comparison' },
        description: {
          cn: '如果研究需求开始变成持续提醒和异常观察，这页更适合。',
          en: 'A better path when research needs start turning into ongoing alerting and anomaly observation.',
        },
      },
    ],
    toolSelectionNotes: {
      dune: {
        bestFor: {
          cn: '要做自定义查询、判断验证和研究级链上分析的人。',
          en: 'People doing custom queries, thesis validation, and research-grade on-chain analysis.',
        },
        whyPickIt: {
          cn: '它最适合回答“我自己的问题”，而不是只消费别人已经整理好的结论。',
          en: 'It is strongest when the job is answering your own question instead of only consuming prepackaged conclusions.',
        },
        watchOut: {
          cn: '如果你只是想看更轻量的市场概览或组合状态，它可能比需求更重。',
          en: 'It can feel heavier than necessary if the real need is just lighter market overviews or portfolio checks.',
        },
      },
      nansen: {
        bestFor: {
          cn: '更关注聪明钱、地址行为和资金流信号的研究者。',
          en: 'Researchers who care more about smart-money signals, address behavior, and fund-flow context.',
        },
        whyPickIt: {
          cn: '它很适合把链上分析继续拉向“谁在动、为什么重要、市场可能会怎么理解”。',
          en: 'It works well when on-chain analysis needs to move toward who is acting, why it matters, and what the market may infer.',
        },
        watchOut: {
          cn: '如果你主要是在做协议指标比较或宏观扫描，它未必是第一层。',
          en: 'It may not be the first layer if the work is mostly protocol benchmarking or macro scanning.',
        },
      },
      defillama: {
        bestFor: {
          cn: '想先做赛道扫描、协议比较和 DeFi shortlist 构建的人。',
          en: 'People who want sector scanning, protocol comparison, and early DeFi shortlist building.',
        },
        whyPickIt: {
          cn: '它更擅长把全局市场研究范围先快速收窄下来。',
          en: 'It is stronger at narrowing the broad market research space quickly from the top down.',
        },
        watchOut: {
          cn: '如果你真正要做的是自定义验证或地址层调查，后面通常还会继续缩到更深工具。',
          en: 'You will usually narrow further into deeper tools if the real work becomes custom validation or address-level investigation.',
        },
      },
      arkham: {
        bestFor: {
          cn: '想把链上分析继续收窄到地址归因、身份线索和调查路径的人。',
          en: 'People who want to narrow on-chain analysis further into address attribution, identity clues, and investigation paths.',
        },
        whyPickIt: {
          cn: '它适合把“链上发生了什么”继续推进到“可能是谁在做、和谁相关”。',
          en: 'It is especially useful when the question shifts from what happened on-chain to who might be behind it and what it connects to.',
        },
        watchOut: {
          cn: '如果你只需要协议级别或宏观层判断，它可能会显得过于调查导向。',
          en: 'It can feel too investigation-oriented if the real need stays at the protocol or macro layer.',
        },
      },
    },
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
        question: { cn: '为什么只看链上分析工具？', en: 'Why only on-chain tools?' },
        answer: {
          cn: '因为链上分析工具的意图很明确，通常围绕地址、资金流和研究工作流，对比也更直接。',
          en: 'Because on-chain analysis tools usually map to clear needs around addresses, fund flow, and research workflows, making comparison more direct.',
        },
      },
    ],
  });

  return ComparisonPage({ ...data, locale });
}
