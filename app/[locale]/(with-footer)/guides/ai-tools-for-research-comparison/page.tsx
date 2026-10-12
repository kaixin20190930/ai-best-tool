import researchComparison from '@/lib/content/researchComparison';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 研究工具对比' : 'AI research tools compared',
    locale === 'cn' || locale === 'tw'
      ? '按开放网页发现、学术论文检索、引用语境核对和选定资料综合比较 Perplexity、Consensus、Scite 与 Gemini Notebook；查看限制与官方证据。'
      : 'Compare Perplexity, Consensus, Scite and Gemini Notebook for web discovery, scholarly search, citation context and selected-source synthesis with official evidence.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI 研究工具对比', en: 'AI research tools compared' },
    breadcrumbLabel: researchComparison.title,
    comparisonPath: '/guides/ai-tools-for-research-comparison',
    guideHref: '/guides/ai-tools-for-research',
    content: { kind: 'verified', comparison: researchComparison, faqs: [] },
  });

  return ComparisonPage({ ...data, locale });
}
