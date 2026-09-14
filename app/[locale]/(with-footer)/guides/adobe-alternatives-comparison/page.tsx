import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Adobe 替代方案对比' : 'Adobe alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Adobe 的 AI 工具，帮你更快判断创作套件、视觉资产和内容生产流程该怎么选。'
      : 'Compare AI tools that are commonly used as Adobe alternatives so you can choose the right fit for creative suites, visual assets, and content-production workflows.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'Adobe 替代方案对比', en: 'Adobe alternatives comparison' },
    breadcrumbLabel: { cn: 'Adobe 替代方案对比', en: 'Adobe alternatives comparison' },
    guideHref: '/guides/ai-tools-for-creators',
    content: { kind: 'unavailable', guideLabel: { cn: '回到创作者指南', en: 'Back to creators guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
