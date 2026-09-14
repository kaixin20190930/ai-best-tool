import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import { generateLocalizedCanonicalUrl } from '@/lib/seo/metadata';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata: Metadata = await buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 销售拓客工具对比' : 'AI sales prospecting tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比 AI 销售拓客工具，帮助你更快判断个性化触达、外联准备和 prospecting 适配度。'
      : 'Compare AI sales-prospecting tools to judge outreach personalization, contact prep, and prospecting fit faster.',
  );
  return {
    ...metadata,
    ...getNoindexMetadata(),
    alternates: {
      ...metadata.alternates,
      canonical: generateLocalizedCanonicalUrl('/guides/ai-tools-for-sales-prospecting', locale),
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI 销售拓客工具对比', en: 'AI sales prospecting tools comparison' },
    breadcrumbLabel: { cn: '销售拓客工具对比', en: 'Sales prospecting tools comparison' },
    guideHref: '/guides/ai-tools-for-sales-prospecting',
    content: { kind: 'unavailable', guideLabel: { cn: '回到销售拓客指南', en: 'Back to sales prospecting guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
