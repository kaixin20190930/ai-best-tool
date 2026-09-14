import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'n8n 替代方案对比' : 'n8n alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 n8n 的 AI 工具，帮你更快判断自动化、可控性和开发者工作流该怎么选。'
      : 'Compare AI tools that are commonly used as n8n alternatives so you can choose the right fit for automation, control, and developer workflows.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'n8n 替代方案对比', en: 'n8n alternatives comparison' },
    breadcrumbLabel: { cn: 'n8n 替代方案对比', en: 'n8n alternatives comparison' },
    guideHref: '/guides/ai-tools-for-automation',
    content: { kind: 'unavailable', guideLabel: { cn: '回到自动化工具指南', en: 'Back to automation guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
