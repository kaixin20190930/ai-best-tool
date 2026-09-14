import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Grammarly 替代方案对比' : 'Grammarly alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Grammarly 的 AI 工具，帮你更快判断改写、润色和日常写作该怎么选。'
      : 'Compare AI tools that are commonly used as Grammarly alternatives so you can choose the right fit for rewriting, polishing, and everyday writing.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'Grammarly 替代方案对比', en: 'Grammarly alternatives comparison' },
    breadcrumbLabel: { cn: 'Grammarly 替代方案对比', en: 'Grammarly alternatives comparison' },
    guideHref: '/guides/ai-writing-tools',
    content: { kind: 'unavailable', guideLabel: { cn: '回到写作指南', en: 'Back to writing guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
