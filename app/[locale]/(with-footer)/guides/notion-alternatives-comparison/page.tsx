import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Notion 替代方案对比' : 'Notion alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Notion 的 AI 工具，帮你更快判断知识库、文档协作和个人/团队工作流该怎么选。'
      : 'Compare AI tools that are commonly used as Notion alternatives so you can choose the right fit for knowledge bases, document collaboration, and personal or team workflows.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'Notion 替代方案对比', en: 'Notion alternatives comparison' },
    breadcrumbLabel: { cn: 'Notion 替代方案对比', en: 'Notion alternatives comparison' },
    guideHref: '/guides/ai-productivity-tools',
    content: { kind: 'unavailable', guideLabel: { cn: '回到生产力指南', en: 'Back to productivity guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
