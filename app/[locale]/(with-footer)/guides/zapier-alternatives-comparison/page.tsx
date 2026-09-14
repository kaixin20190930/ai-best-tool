import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Zapier 替代方案对比' : 'Zapier alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Zapier 的 AI 工具，帮你更快判断自动化、连接器和工作流编排该怎么选。'
      : 'Compare AI tools that are commonly used as Zapier alternatives so you can choose the right fit for automation, connectors, and workflow orchestration.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'Zapier 替代方案对比', en: 'Zapier alternatives comparison' },
    breadcrumbLabel: { cn: 'Zapier 替代方案对比', en: 'Zapier alternatives comparison' },
    guideHref: '/guides/ai-tools-for-automation',
    content: { kind: 'unavailable', guideLabel: { cn: '回到自动化工具指南', en: 'Back to automation guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
