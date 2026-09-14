import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 代币研究工具对比' : 'AI token research tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比 AI 代币研究工具，帮助你更快判断项目比较、基本面视角和 token 研究深度。'
      : 'Compare AI token-research tools to judge project comparison, fundamentals framing, and research depth faster.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI 代币研究工具对比', en: 'AI token research tools comparison' },
    breadcrumbLabel: { cn: '代币研究工具对比', en: 'Token research tools comparison' },
    guideHref: '/guides/ai-tools-for-token-research',
    content: { kind: 'unavailable', guideLabel: { cn: '回到代币研究指南', en: 'Back to token research guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
