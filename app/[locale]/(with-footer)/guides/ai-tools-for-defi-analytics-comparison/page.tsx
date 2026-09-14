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
    comparisonLabel: { cn: 'AI DeFi 分析工具对比', en: 'AI tools for DeFi analytics comparison' },
    breadcrumbLabel: { cn: 'DeFi 工具对比', en: 'DeFi tools comparison' },
    guideHref: '/guides/ai-tools-for-defi-analytics',
    content: { kind: 'unavailable', guideLabel: { cn: '回到 DeFi 指南', en: 'Back to DeFi guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
