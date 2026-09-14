import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI API 可观测工具对比' : 'AI tools for API observability comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 API 可观测工具，帮你更快选出适合日志、成本追踪和质量分析的一款。'
      : 'Compare common API observability tools to choose the one that fits logs, cost tracking, and quality analysis best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI API 可观测工具对比', en: 'AI tools for API observability comparison' },
    breadcrumbLabel: { cn: 'API 可观测工具对比', en: 'API observability tools comparison' },
    guideHref: '/guides/ai-tools-for-api-observability',
    content: { kind: 'unavailable', guideLabel: { cn: '回到 API 可观测指南', en: 'Back to API observability guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
