import type { Metadata } from 'next';

import { generateLocalizedCanonicalUrl } from '@/lib/seo/metadata';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 客服工具对比' : 'AI customer support tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 AI 客服工作流工具，帮你更快判断回复、分流和知识库能力。'
      : 'Compare common AI customer support workflow tools to judge replies, triage, and knowledge-base fit faster.',
  );

  return {
    ...metadata,
    alternates: {
      canonical: generateLocalizedCanonicalUrl('/guides/ai-tools-for-customer-support', locale),
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI 客服工具对比', en: 'AI customer support tools comparison' },
    breadcrumbLabel: { cn: '客服工具对比', en: 'Customer support tools comparison' },
    guideHref: '/guides/ai-tools-for-customer-support',
    content: { kind: 'unavailable', guideLabel: { cn: '回到客服指南', en: 'Back to customer support guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
