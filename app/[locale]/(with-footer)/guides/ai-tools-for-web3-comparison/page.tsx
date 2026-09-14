import { web3Comparison, web3ComparisonFaqs } from '@/lib/content/web3Comparison';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI Web3 工具对比' : 'AI tools for Web3 comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 Web3 AI 工具，先从指南和榜单收窄，再选出适合链上工作流的一个。'
      : 'Compare common Web3 AI tools, narrowing from guide and ranking first, to choose the one that fits your on-chain workflow best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI Web3 工具对比', en: 'AI tools for Web3 comparison' },
    breadcrumbLabel: { cn: 'Web3 工具对比', en: 'Web3 tools comparison' },
    guideHref: '/guides/ai-tools-for-web3',
    content: { kind: 'verified', comparison: web3Comparison, faqs: web3ComparisonFaqs },
  });
  return ComparisonPage({ ...data, locale });
}
