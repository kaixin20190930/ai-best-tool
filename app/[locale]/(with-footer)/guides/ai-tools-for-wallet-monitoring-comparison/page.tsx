import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 钱包监控工具对比' : 'AI tools for wallet monitoring comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的钱包监控 AI 工具，帮你更快选出适合提醒和异常观察的一个。'
      : 'Compare common wallet monitoring AI tools to choose the one that fits your alerting and anomaly-watching workflow best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '钱包监控工具', en: 'Wallet monitoring tools' },
    comparisonLabel: { cn: 'AI 钱包监控工具对比', en: 'AI tools for wallet monitoring comparison' },
    description: {
      cn: '如果你已经知道自己要做地址提醒、异常观察或风控监控，这一页会帮你把几款常见工具放在一起看。',
      en: 'If you already know you need address alerts, anomaly watching, or risk monitoring, this page helps you compare a few common tools side by side.',
    },
    searchQuery: 'wallet',
    guideHref: '/guides/ai-tools-for-wallet-monitoring',
    backGuideLabel: { cn: '回到钱包监控指南', en: 'Back to wallet guide' },
    altBrowseHref: '/explore?search=wallet&sort=popular',
    altBrowseLabel: { cn: '浏览更多钱包工具', en: 'Browse more wallet tools' },
    breadcrumbLabel: { cn: '钱包监控工具对比', en: 'Wallet monitoring tools comparison' },
    compareTitle: { cn: '几款常见钱包监控工具的快速对照', en: 'A quick side-by-side look at common wallet tools' },
    compareSubtitle: { cn: '钱包监控', en: 'Wallet monitoring' },
    tips: {
      cn: [
        '先看提醒速度和通知渠道，不同工具差异会很大。',
        '如果你要团队使用，关注多地址、标签、导出和权限控制。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ],
      en: [
        'Start with alert speed and notification channels because tools differ a lot.',
        'For team use, look at multi-address support, tags, exports, and permission controls.',
        'For long-term use, pay attention to freshness, ratings, and real comments.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看提醒速度、覆盖链、免费可用性、评分和实际使用感。',
          en: 'We compare alert speed, chain coverage, free usability, ratings, and practical usefulness.',
        },
      },
      {
        question: { cn: '为什么只看钱包监控工具？', en: 'Why only wallet tools?' },
        answer: {
          cn: '因为钱包监控工具的意图很明确，通常围绕提醒、异常和风控，对比也更直接。',
          en: 'Because wallet tools usually map to clear needs around alerts, anomalies, and risk controls, making comparison more direct.',
        },
      },
    ],
  });

  return ComparisonPage({ ...data, locale });
}
