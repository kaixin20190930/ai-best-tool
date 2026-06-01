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
    tips: {
      cn: [
        '先看你是做代币研究、链上追踪还是市场监控，不同工具的重点差别很大。',
        '如果你要团队使用，关注 API、导出、权限和历史查询能力。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'Start with your use case: token research, on-chain tracking, or market monitoring.',
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
        question: { cn: '为什么只看 Crypto 工具？', en: 'Why only crypto tools?' },
        answer: {
          cn: '因为 Crypto 工具的意图很明确，通常围绕代币、链上和市场研究，对比也更直接。',
          en: 'Because crypto tools usually map to clear needs around tokens, on-chain data, and market research, making comparison more direct.',
        },
      },
    ],
  });

  return ComparisonPage({ ...data, locale });
}
