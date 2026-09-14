import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import { generateLocalizedCanonicalUrl } from '@/lib/seo/metadata';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata: Metadata = await buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 获客工具对比' : 'AI lead generation tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比 AI 获客工具，帮助你更快判断名单来源、筛选方式和线索质量。'
      : 'Compare AI lead-generation tools to judge list sources, filtering logic, and lead quality faster.',
  );
  return {
    ...metadata,
    ...getNoindexMetadata(),
    alternates: {
      ...metadata.alternates,
      canonical: generateLocalizedCanonicalUrl('/guides/ai-tools-for-lead-generation', locale),
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI 获客工具对比', en: 'AI lead generation tools comparison' },
    breadcrumbLabel: { cn: '获客工具对比', en: 'Lead generation tools comparison' },
    guideHref: '/guides/ai-tools-for-lead-generation',
    content: { kind: 'unavailable', guideLabel: { cn: '回到获客指南', en: 'Back to lead-gen guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
