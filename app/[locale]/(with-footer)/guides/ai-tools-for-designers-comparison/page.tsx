import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import { generateLocalizedCanonicalUrl } from '@/lib/seo/metadata';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 设计工具对比' : 'AI design tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 AI 设计工具，帮你更快选出适合的一个。'
      : 'Compare common AI design tools to choose the one that fits you best.',
  );

  return {
    ...metadata,
    ...getNoindexMetadata(),
    alternates: {
      canonical: generateLocalizedCanonicalUrl('/guides/ai-tools-for-designers', locale),
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI 设计工具对比', en: 'AI design tools comparison' },
    breadcrumbLabel: { cn: '设计工具对比', en: 'Design tools comparison' },
    guideHref: '/guides/ai-tools-for-designers',
    content: { kind: 'unavailable', guideLabel: { cn: '回到设计指南', en: 'Back to design guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
