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
