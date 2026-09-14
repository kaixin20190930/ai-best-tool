import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Perplexity 替代方案对比' : 'Perplexity alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Perplexity 的 AI 工具，帮你更快判断资料发现、证据核对和研究工作流该怎么选。'
      : 'Compare AI tools that are commonly used as Perplexity alternatives so you can choose the right fit for discovery, evidence-checking, and research workflows.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'Perplexity 替代方案对比', en: 'Perplexity alternatives comparison' },
    breadcrumbLabel: { cn: 'Perplexity 替代方案对比', en: 'Perplexity alternatives comparison' },
    guideHref: '/guides/ai-tools-for-research',
    content: { kind: 'unavailable', guideLabel: { cn: '回到研究工具指南', en: 'Back to research guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
