import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 模型路由工具对比' : 'AI tools for model routing comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的模型路由工具，帮你更快选出适合多模型接入、回退策略和成本治理的一款。'
      : 'Compare common model routing tools to choose the one that fits multi-model access, fallback strategy, and cost control best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI 模型路由工具对比', en: 'AI tools for model routing comparison' },
    breadcrumbLabel: { cn: '模型路由工具对比', en: 'Model routing tools comparison' },
    guideHref: '/guides/ai-tools-for-model-routing',
    content: { kind: 'unavailable', guideLabel: { cn: '回到模型路由指南', en: 'Back to model routing guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
