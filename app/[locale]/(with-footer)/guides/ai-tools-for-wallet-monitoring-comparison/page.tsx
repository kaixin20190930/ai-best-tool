import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 钱包监控工具对比' : 'AI tools for wallet monitoring comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的钱包监控 AI 工具，帮你更快选出适合提醒和异常观察的一个。'
      : 'Compare common wallet monitoring AI tools to choose the one that fits your alerting and anomaly-watching workflow best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI 钱包监控工具对比', en: 'AI tools for wallet monitoring comparison' },
    breadcrumbLabel: { cn: '钱包监控工具对比', en: 'Wallet monitoring tools comparison' },
    guideHref: '/guides/ai-tools-for-wallet-monitoring',
    content: { kind: 'unavailable', guideLabel: { cn: '回到钱包监控指南', en: 'Back to wallet guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
