import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI Web3 分析工具对比' : 'AI tools for Web3 analysis comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比常见的 Web3 分析工具，帮你更快选出更适合链上研究、协议监控和钱包追踪的一个。'
      : 'Compare common Web3 analysis tools to choose the one that fits on-chain research, protocol monitoring, and wallet tracking best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: 'Web3 分析工具', en: 'Web3 analysis tools' },
    comparisonLabel: { cn: 'AI Web3 分析工具对比', en: 'AI tools for Web3 analysis comparison' },
    description: {
      cn: '如果你已经知道自己更偏链上研究、协议监控、DeFi 观察或钱包追踪，这一页会帮你把常见工具放在一起对照。',
      en: 'If you already know you need on-chain research, protocol monitoring, DeFi observation, or wallet tracking, this page helps you compare common tools side by side.',
    },
    searchQuery: 'web3',
    guideHref: '/guides/ai-tools-for-web3-analysis',
    rankingHref: '/best-ai-tools/ai-web3-tools',
    rankingLabel: { cn: '转去 Web3 榜单页', en: 'Open the Web3 ranking' },
    backGuideLabel: { cn: '回到 Web3 分析指南', en: 'Back to Web3 analysis guide' },
    altBrowseHref: '/explore?search=web3&sort=popular',
    altBrowseLabel: { cn: '浏览更多 Web3 工具', en: 'Browse more Web3 tools' },
    breadcrumbLabel: { cn: 'Web3 分析工具对比', en: 'Web3 analysis tools comparison' },
    compareTitle: {
      cn: '常见 Web3 分析工具的快速对照',
      en: 'A quick side-by-side look at common Web3 analysis tools',
    },
    compareSubtitle: { cn: 'Web3 分析', en: 'Web3 analysis' },
    preferredToolNames: ['dune', 'nansen', 'debank', 'bubblemaps'],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-web3-tools',
        title: { cn: '先看 Web3 榜单', en: 'Start with the Web3 ranking' },
        description: {
          cn: '如果你已经明确要做 Web3 分析，先用榜单缩小 shortlist。',
          en: 'If Web3 analysis is clearly the goal, narrow the shortlist with the ranking first.',
        },
      },
      {
        href: '/guides/ai-tools-for-web3-analysis',
        title: { cn: '回到 Web3 分析指南', en: 'Back to the Web3 analysis guide' },
        description: {
          cn: '如果你还想先理清协议、钱包和资金流分析，可以回到指南页。',
          en: 'Go back if you still need to clarify protocol, wallet, and fund-flow analysis first.',
        },
      },
      {
        href: '/guides/ai-tools-for-on-chain-analysis-comparison',
        title: { cn: '转去链上分析对比', en: 'Go to on-chain analysis comparison' },
        description: {
          cn: '如果你的决策已经转向链上研究本身，这页更高意图。',
          en: 'A higher-intent path once the decision moves directly into on-chain research.',
        },
      },
      {
        href: '/guides/ai-tools-for-wallet-research-comparison',
        title: { cn: '转去钱包研究对比', en: 'Go to wallet research comparison' },
        description: {
          cn: '如果你更关心地址画像和行为判断，这页更贴近。',
          en: 'Move there if address profiling and behavior analysis are the real focus.',
        },
      },
    ],
    tips: {
      cn: [
        '先分清你更关心协议、钱包、资金流还是可视化研究。',
        '如果你需要团队协作，优先看导出、分享、告警和历史查询。',
        '长期使用时，把更新频率和真实反馈也一起纳入判断。',
      ],
      en: [
        'Start by separating protocol, wallet, fund-flow, and visual research needs.',
        'If you need team collaboration, prioritize exports, sharing, alerts, and historical queries.',
        'For long-term use, include freshness and real feedback in the decision.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的重点是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看覆盖范围、历史深度、监控能力、导出与分享，以及实际使用体验。',
          en: 'We compare coverage, historical depth, monitoring capabilities, exports and sharing, and practical usability.',
        },
      },
      {
        question: { cn: '为什么这页比总 Web3 页更窄？', en: 'Why is this narrower than the main Web3 page?' },
        answer: {
          cn: '因为当你已经知道自己是在做 Web3 分析时，直接对照常见工具会比泛 Web3 列表更快。',
          en: 'Once you already know Web3 analysis is the lane, comparing common tools directly is faster than a broad Web3 list.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_web3_analysis_comparison' />
    </>
  );
}
