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
    comparisonLabel: { cn: 'AI DEX 分析工具对比', en: 'AI tools for DEX analytics comparison' },
    breadcrumbLabel: { cn: 'DEX 工具对比', en: 'DEX tools comparison' },
    guideHref: '/guides/ai-tools-for-dex-analytics',
    content: { kind: 'unavailable', guideLabel: { cn: '回到 DEX 指南', en: 'Back to DEX guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
