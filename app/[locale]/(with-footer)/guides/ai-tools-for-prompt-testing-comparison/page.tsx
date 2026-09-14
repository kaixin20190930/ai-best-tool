import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI Prompt 测试工具对比' : 'AI tools for prompt testing comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 prompt 测试工具，帮你更快选出适合评估、A/B 测试和回归验证的一款。'
      : 'Compare common prompt testing tools to choose the one that fits evals, A/B tests, and regression checks best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI Prompt 测试工具对比', en: 'AI tools for prompt testing comparison' },
    breadcrumbLabel: { cn: 'Prompt 测试工具对比', en: 'Prompt testing tools comparison' },
    guideHref: '/guides/ai-tools-for-prompt-testing',
    content: { kind: 'unavailable', guideLabel: { cn: '回到 Prompt 测试指南', en: 'Back to prompt testing guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
