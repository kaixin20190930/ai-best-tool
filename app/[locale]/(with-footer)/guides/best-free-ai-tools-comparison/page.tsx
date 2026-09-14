import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? '最佳免费 AI 工具对比' : 'Best free AI tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的免费 AI 工具，帮你更快找出真正值得长期试用的选项。'
      : 'Compare common free AI tools to find the ones worth keeping in your workflow longer.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: '最佳免费 AI 工具对比', en: 'Best free AI tools comparison' },
    breadcrumbLabel: { cn: '最佳免费 AI 工具对比', en: 'Best free AI tools comparison' },
    guideHref: '/guides/best-free-ai-tools',
    content: { kind: 'unavailable', guideLabel: { cn: '回到免费指南', en: 'Back to the free tools guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
