import type { Metadata } from 'next';

import { generateLocalizedCanonicalUrl } from '@/lib/seo/metadata';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 电商工具对比' : 'AI ecommerce tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 AI 电商工具，帮你更快选出适合的一个。'
      : 'Compare common AI ecommerce tools to choose the one that fits you best.',
  );

  return {
    ...metadata,
    alternates: {
      canonical: generateLocalizedCanonicalUrl('/guides/ai-tools-for-ecommerce', locale),
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI 电商工具对比', en: 'AI ecommerce tools comparison' },
    breadcrumbLabel: { cn: '电商工具对比', en: 'Ecommerce tools comparison' },
    guideHref: '/guides/ai-tools-for-ecommerce',
    content: { kind: 'unavailable', guideLabel: { cn: '回到电商指南', en: 'Back to ecommerce guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
