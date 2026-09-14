import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 写作工具对比' : 'AI writing tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更有代表性的 AI 写作工具，帮你更快选出适合内容工作流的一个。'
      : 'Compare representative AI writing tools to choose the one that fits your content workflow best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI 写作工具对比', en: 'AI writing tools comparison' },
    breadcrumbLabel: { cn: '写作工具对比', en: 'Writing tools comparison' },
    guideHref: '/guides/ai-writing-tools',
    content: { kind: 'unavailable', guideLabel: { cn: '回到写作指南', en: 'Back to writing guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
