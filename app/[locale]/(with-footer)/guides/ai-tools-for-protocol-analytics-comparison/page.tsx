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
    comparisonLabel: { cn: 'AI 协议分析工具对比', en: 'AI tools for protocol analytics comparison' },
    breadcrumbLabel: { cn: '协议工具对比', en: 'Protocol tools comparison' },
    guideHref: '/guides/ai-tools-for-protocol-analytics',
    content: { kind: 'unavailable', guideLabel: { cn: '回到协议指南', en: 'Back to protocol guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
