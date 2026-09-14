import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 生产力工具对比' : 'AI productivity tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 AI 生产力工具，帮你更快选出适合的一个。'
      : 'Compare common AI productivity tools to choose the one that fits you best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI 生产力工具对比', en: 'AI productivity tools comparison' },
    breadcrumbLabel: { cn: '生产力工具对比', en: 'Productivity tools comparison' },
    guideHref: '/guides/ai-productivity-tools',
    content: { kind: 'unavailable', guideLabel: { cn: '回到生产力指南', en: 'Back to productivity guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
