import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI DEX 分析工具对比' : 'AI tools for DEX analytics comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 DEX AI 工具，帮你更快选出适合交易对和流动性工作的一个。'
      : 'Compare common DEX AI tools to choose the one that fits your pair and liquidity workflow best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: 'DEX 工具', en: 'DEX tools' },
    comparisonLabel: { cn: 'AI DEX 分析工具对比', en: 'AI tools for DEX analytics comparison' },
    description: {
      cn: '如果你已经知道自己要做交易对分析、流动性观察或 DEX 研究，这一页会帮你把几款常见工具放在一起看。',
      en: 'If you already know you need pair analysis, liquidity observation, or DEX research, this page helps you compare a few common tools side by side.',
    },
    searchQuery: 'dex',
    guideHref: '/guides/ai-tools-for-dex-analytics',
    backGuideLabel: { cn: '回到 DEX 指南', en: 'Back to DEX guide' },
    altBrowseHref: '/explore?search=dex&sort=popular',
    altBrowseLabel: { cn: '浏览更多 DEX 工具', en: 'Browse more DEX tools' },
    breadcrumbLabel: { cn: 'DEX 工具对比', en: 'DEX tools comparison' },
    compareTitle: { cn: '几款常见 DEX 工具的快速对照', en: 'A quick side-by-side look at common DEX tools' },
    compareSubtitle: { cn: 'DEX', en: 'DEX' },
    tips: {
      cn: [
        '先看交易对和池子覆盖，再看是否支持你常用的链。',
        '如果你要团队使用，关注 API、导出、权限和告警能力。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'Start with pair and pool coverage, then check whether it supports the chains you actually use.',
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
        question: { cn: '为什么只看 DEX 工具？', en: 'Why only DEX tools?' },
        answer: {
          cn: '因为 DEX 工具的意图比较明确，通常围绕交易对、流动性和研究工作流，对比也更直接。',
          en: 'Because DEX tools usually map to clear needs around pairs, liquidity, and research workflows, making comparison more direct.',
        },
      },
    ],
  });

  return ComparisonPage({ ...data, locale });
}
