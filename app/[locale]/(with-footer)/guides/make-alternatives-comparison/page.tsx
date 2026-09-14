import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Make 替代方案对比' : 'Make alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Make 的 AI 工具，帮你更快判断可视化编排、自动化和团队工作流该怎么选。'
      : 'Compare AI tools that are commonly used as Make alternatives so you can choose the right fit for visual orchestration, automation, and team workflows.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'Make 替代方案对比', en: 'Make alternatives comparison' },
    breadcrumbLabel: { cn: 'Make 替代方案对比', en: 'Make alternatives comparison' },
    guideHref: '/guides/ai-tools-for-automation',
    content: { kind: 'unavailable', guideLabel: { cn: '回到自动化工具指南', en: 'Back to automation guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
