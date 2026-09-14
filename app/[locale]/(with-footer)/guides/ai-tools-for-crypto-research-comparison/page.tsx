import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI Crypto 研究工具对比' : 'AI tools for crypto research comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 Crypto AI 工具，帮你更快选出适合研究和监控的一个。'
      : 'Compare common crypto AI tools to choose the one that fits your research and monitoring workflow best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI Crypto 研究工具对比', en: 'AI tools for crypto research comparison' },
    breadcrumbLabel: { cn: 'Crypto 研究工具对比', en: 'Crypto research tools comparison' },
    guideHref: '/guides/ai-tools-for-crypto-research',
    content: { kind: 'unavailable', guideLabel: { cn: '回到 Crypto 指南', en: 'Back to crypto guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
