import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI DeFi 分析工具对比' : 'AI tools for DeFi analytics comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 DeFi AI 工具，帮你更快选出适合流动性和收益工作的一个。'
      : 'Compare common DeFi AI tools to choose the one that fits your liquidity and yield workflow best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: 'DeFi 工具', en: 'DeFi tools' },
    comparisonLabel: { cn: 'AI DeFi 分析工具对比', en: 'AI tools for DeFi analytics comparison' },
    description: {
      cn: '如果你已经知道自己要做流动性监测、收益追踪或协议研究，这一页会帮你把几款常见工具放在一起看。',
      en: 'If you already know you need liquidity monitoring, yield tracking, or protocol research, this page helps you compare a few common tools side by side.',
    },
    searchQuery: 'defi',
    guideHref: '/guides/ai-tools-for-defi-analytics',
    rankingHref: '/best-ai-tools/ai-web3-tools',
    rankingLabel: { cn: '转去 Web3 榜单页', en: 'Open the Web3 ranking' },
    backGuideLabel: { cn: '回到 DeFi 指南', en: 'Back to DeFi guide' },
    altBrowseHref: '/explore?search=defi&sort=popular',
    altBrowseLabel: { cn: '浏览更多 DeFi 工具', en: 'Browse more DeFi tools' },
    breadcrumbLabel: { cn: 'DeFi 工具对比', en: 'DeFi tools comparison' },
    compareTitle: { cn: '几款常见 DeFi 工具的快速对照', en: 'A quick side-by-side look at common DeFi tools' },
    compareSubtitle: { cn: 'DeFi', en: 'DeFi' },
    preferredToolNames: ['defillama', 'dune', 'token-terminal', 'nansen'],
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
        question: { cn: '为什么只看 DeFi 工具？', en: 'Why only DeFi tools?' },
        answer: {
          cn: '因为 DeFi 工具的意图比较明确，通常围绕流动性、收益和协议研究，对比也更直接。',
          en: 'Because DeFi tools usually map to clear needs around liquidity, yield, and protocol research, making comparison more direct.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_defi_analytics_comparison' />
    </>
  );
}
