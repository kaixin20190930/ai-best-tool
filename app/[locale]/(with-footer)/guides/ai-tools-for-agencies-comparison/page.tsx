import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import { generateLocalizedCanonicalUrl } from '@/lib/seo/metadata';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 代理与服务团队工具对比' : 'AI tools for agencies comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的代理与服务团队 AI 工具，帮你更快判断交付、协作和客户隔离能力。'
      : 'Compare common AI tools for agencies to judge delivery workflow, collaboration, and client separation faster.',
  );

  return {
    ...metadata,
    ...getNoindexMetadata(),
    alternates: {
      canonical: generateLocalizedCanonicalUrl('/guides/ai-tools-for-agencies', locale),
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI 代理与服务团队工具对比', en: 'AI tools for agencies comparison' },
    breadcrumbLabel: { cn: '代理工具对比', en: 'Agency tools comparison' },
    guideHref: '/guides/ai-tools-for-agencies',
    content: { kind: 'unavailable', guideLabel: { cn: '回到代理指南', en: 'Back to agency guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
