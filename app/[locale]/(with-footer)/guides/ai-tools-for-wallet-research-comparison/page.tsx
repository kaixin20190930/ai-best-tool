import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 钱包研究工具对比' : 'AI tools for wallet research comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的钱包研究工具，帮你更快选出适合地址画像、链上线索和行为判断的一款。'
      : 'Compare common wallet research tools to choose the one that fits address profiles, on-chain clues, and behavior analysis best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI 钱包研究工具对比', en: 'AI tools for wallet research comparison' },
    breadcrumbLabel: { cn: '钱包研究工具对比', en: 'Wallet research tools comparison' },
    guideHref: '/guides/ai-tools-for-wallet-research',
    content: { kind: 'unavailable', guideLabel: { cn: '回到钱包研究指南', en: 'Back to wallet research guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
