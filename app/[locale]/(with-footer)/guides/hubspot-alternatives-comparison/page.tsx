import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'HubSpot 替代方案对比' : 'HubSpot alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 HubSpot 的 AI 工具，帮你更快判断 CRM、营销自动化和流程编排该怎么选。'
      : 'Compare AI tools that are commonly used as HubSpot alternatives so you can choose the right fit for CRM, marketing automation, and workflow orchestration.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'HubSpot 替代方案对比', en: 'HubSpot alternatives comparison' },
    breadcrumbLabel: { cn: 'HubSpot 替代方案对比', en: 'HubSpot alternatives comparison' },
    guideHref: '/guides/ai-tools-for-marketing',
    content: { kind: 'unavailable', guideLabel: { cn: '回到营销指南', en: 'Back to marketing guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
