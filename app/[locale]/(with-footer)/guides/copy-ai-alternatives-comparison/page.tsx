import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Copy.ai 替代方案对比' : 'Copy.ai alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Copy.ai 的 AI 工具，帮你更快判断快速起稿、营销文案和批量内容该怎么选。'
      : 'Compare AI tools that are commonly used as Copy.ai alternatives so you can choose the right fit for fast drafting, marketing copy, and bulk content.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'Copy.ai 替代方案对比', en: 'Copy.ai alternatives comparison' },
    breadcrumbLabel: { cn: 'Copy.ai 替代方案对比', en: 'Copy.ai alternatives comparison' },
    guideHref: '/guides/ai-tools-for-marketing',
    content: { kind: 'unavailable', guideLabel: { cn: '回到营销指南', en: 'Back to marketing guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
