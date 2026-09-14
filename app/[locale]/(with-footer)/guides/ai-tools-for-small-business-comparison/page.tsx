import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import { generateLocalizedCanonicalUrl } from '@/lib/seo/metadata';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata: Metadata = await buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 小企业工具对比' : 'AI tools for small business comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 AI 小企业工具，帮你更快选出适合的一个。'
      : 'Compare common AI small-business tools to choose the one that fits you best.',
  );
  return {
    ...metadata,
    ...getNoindexMetadata(),
    alternates: {
      ...metadata.alternates,
      canonical: generateLocalizedCanonicalUrl('/guides/ai-tools-for-small-business', locale),
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI 小企业工具对比', en: 'AI tools for small business comparison' },
    breadcrumbLabel: { cn: '小企业工具对比', en: 'Small business tools comparison' },
    guideHref: '/guides/ai-tools-for-small-business',
    content: { kind: 'unavailable', guideLabel: { cn: '回到小企业指南', en: 'Back to small-business guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
