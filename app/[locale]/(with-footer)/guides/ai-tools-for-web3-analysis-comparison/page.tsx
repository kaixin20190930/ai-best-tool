import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI Web3 分析工具对比' : 'AI tools for Web3 analysis comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比常见的 Web3 分析工具，帮你更快选出更适合链上研究、协议监控和钱包追踪的一个。'
      : 'Compare common Web3 analysis tools to choose the one that fits on-chain research, protocol monitoring, and wallet tracking best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI Web3 分析工具对比', en: 'AI tools for Web3 analysis comparison' },
    breadcrumbLabel: { cn: 'Web3 分析工具对比', en: 'Web3 analysis tools comparison' },
    guideHref: '/guides/ai-tools-for-web3-analysis',
    content: { kind: 'unavailable', guideLabel: { cn: '回到 Web3 分析指南', en: 'Back to Web3 analysis guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
