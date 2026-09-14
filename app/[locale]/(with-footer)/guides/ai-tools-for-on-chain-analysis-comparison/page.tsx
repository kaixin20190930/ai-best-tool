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
    comparisonLabel: { cn: 'AI 链上分析工具对比', en: 'AI tools for on-chain analysis comparison' },
    breadcrumbLabel: { cn: '链上分析工具对比', en: 'On-chain analysis tools comparison' },
    guideHref: '/guides/ai-tools-for-on-chain-analysis',
    content: { kind: 'unavailable', guideLabel: { cn: '回到链上分析指南', en: 'Back to on-chain guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
