import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw'
      ? 'AI Crypto 资产追踪工具对比'
      : 'AI tools for crypto portfolio tracking comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 Crypto 资产追踪工具，帮你更快选出适合持仓看板、钱包归集和组合观察的一款。'
      : 'Compare common crypto portfolio tracking tools to choose the one that fits dashboards, wallet rollups, and allocation monitoring best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: {
      cn: 'AI Crypto 资产追踪工具对比',
      en: 'AI tools for crypto portfolio tracking comparison',
    },
    breadcrumbLabel: { cn: 'Crypto 资产追踪工具对比', en: 'Crypto portfolio tracking tools comparison' },
    guideHref: '/guides/ai-tools-for-crypto-portfolio-tracking',
    content: { kind: 'unavailable', guideLabel: { cn: '回到资产追踪指南', en: 'Back to portfolio tracking guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
