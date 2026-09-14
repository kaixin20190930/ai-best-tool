import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI Evals 工具对比' : 'AI tools for evals comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 evals 工具，帮你更快选出适合输出质量验证、评分体系和验收流程的一款。'
      : 'Compare common evals tools to choose the one that fits output validation, scoring systems, and acceptance workflows best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI Evals 工具对比', en: 'AI tools for evals comparison' },
    breadcrumbLabel: { cn: 'Evals 工具对比', en: 'Evals tools comparison' },
    guideHref: '/guides/ai-tools-for-evals',
    content: { kind: 'unavailable', guideLabel: { cn: '回到 Evals 指南', en: 'Back to evals guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
