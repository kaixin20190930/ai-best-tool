import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 开发者工具对比' : 'AI tools for developers comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 AI 开发者工具，帮你更快选出适合编码、模型接入、调试和工作流集成的一个。'
      : 'Compare common AI developer tools to choose the one that fits coding, model access, debugging, and workflow integration best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI 开发者工具对比', en: 'AI tools for developers comparison' },
    breadcrumbLabel: { cn: '开发者工具对比', en: 'Developer tools comparison' },
    guideHref: '/guides/ai-tools-for-developers',
    content: { kind: 'unavailable', guideLabel: { cn: '回到开发者工具指南', en: 'Back to developer tools guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
