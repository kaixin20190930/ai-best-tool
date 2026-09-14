import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 研究工具对比' : 'AI tools for research comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 AI 研究工具，先从指南和榜单收窄，再选出适合资料发现、证据核对和分析工作流的一个。'
      : 'Compare common AI research tools, narrowing from guide and ranking first, to choose the one that fits discovery, evidence-checking, and analysis workflows best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI 研究工具对比', en: 'AI tools for research comparison' },
    breadcrumbLabel: { cn: '研究工具对比', en: 'Research tools comparison' },
    guideHref: '/guides/ai-tools-for-research',
    content: { kind: 'unavailable', guideLabel: { cn: '回到研究工具指南', en: 'Back to research guide' } },
  });

  const quickStarts = [
    {
      href: '/best-ai-tools/ai-research-tools',
      title: locale === 'cn' || locale === 'tw' ? '研究榜单' : 'Research ranking',
      desc:
        locale === 'cn' || locale === 'tw'
          ? '先看 shortlist，再回比较页。'
          : 'Start with the shortlist, then come back to compare.',
    },
    {
      href: '/guides/ai-tools-for-research',
      title: locale === 'cn' || locale === 'tw' ? '研究指南' : 'Research guide',
      desc:
        locale === 'cn' || locale === 'tw'
          ? '重新确认是发现、核对还是分析。'
          : 'Re-check whether the job is discovery, verification, or analysis.',
    },
    {
      href: '/ai/perplexity',
      title: 'Perplexity',
      desc:
        locale === 'cn' || locale === 'tw'
          ? '更适合带来源的起点研究。'
          : 'A source-friendly starting point for research.',
    },
    {
      href: '/ai/notebooklm',
      title: 'NotebookLM',
      desc:
        locale === 'cn' || locale === 'tw'
          ? '适合整理已有资料并做问答。'
          : 'Great for organizing existing materials and asking grounded questions.',
    },
  ];

  return ComparisonPage({ ...data, locale });
}
