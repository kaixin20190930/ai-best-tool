import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 营销工具对比' : 'AI marketing tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的营销 AI 工具，帮你更快选出适合广告、邮件、社媒和增长流程的一个。'
      : 'Compare common marketing AI tools to choose the one that fits ads, email, social, and growth workflows best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI 营销工具对比', en: 'AI marketing tools comparison' },
    breadcrumbLabel: { cn: '营销工具对比', en: 'Marketing tools comparison' },
    guideHref: '/guides/ai-tools-for-marketing',
    content: { kind: 'unavailable', guideLabel: { cn: '回到营销指南', en: 'Back to marketing guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
