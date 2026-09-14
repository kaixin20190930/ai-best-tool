import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 销售工具对比' : 'AI sales tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 AI 销售工具，帮你更快选出适合的一个。'
      : 'Compare common AI sales tools to choose the one that fits you best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI 销售工具对比', en: 'AI sales tools comparison' },
    breadcrumbLabel: { cn: '销售工具对比', en: 'Sales tools comparison' },
    guideHref: '/guides/ai-tools-for-sales',
    content: { kind: 'unavailable', guideLabel: { cn: '回到销售指南', en: 'Back to sales guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
