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
    preferredToolNames: ['dune', 'nansen', 'arkham', 'bubblemaps'],
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
