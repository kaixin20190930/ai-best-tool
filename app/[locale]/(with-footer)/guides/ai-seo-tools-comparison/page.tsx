import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI SEO 工具对比' : 'AI SEO tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 SEO AI 工具，帮你更快选出适合关键词和排名跟踪的一个。'
      : 'Compare common SEO AI tools to choose the one that fits your keyword and rank tracking workflow best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI SEO 工具对比', en: 'AI SEO tools comparison' },
    breadcrumbLabel: { cn: 'SEO 工具对比', en: 'SEO tools comparison' },
    guideHref: '/guides/ai-seo-tools',
    content: { kind: 'unavailable', guideLabel: { cn: '回到 SEO 指南', en: 'Back to SEO guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
