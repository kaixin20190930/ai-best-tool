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
