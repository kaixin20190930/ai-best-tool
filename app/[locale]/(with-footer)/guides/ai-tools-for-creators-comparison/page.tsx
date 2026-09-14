import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import { generateLocalizedCanonicalUrl } from '@/lib/seo/metadata';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 创作者工具对比' : 'AI tools for creators comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的创作者 AI 工具，帮你更快判断内容产出、再包装和发布节奏能力。'
      : 'Compare common creator AI tools to judge content production, repurposing, and publishing workflow fit faster.',
  );

  return {
    ...metadata,
    ...getNoindexMetadata(),
    alternates: {
      canonical: generateLocalizedCanonicalUrl('/guides/ai-tools-for-creators', locale),
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI 创作者工具对比', en: 'AI tools for creators comparison' },
    breadcrumbLabel: { cn: '创作者工具对比', en: 'Creator tools comparison' },
    guideHref: '/guides/ai-tools-for-creators',
    content: { kind: 'unavailable', guideLabel: { cn: '回到创作者指南', en: 'Back to creator guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
