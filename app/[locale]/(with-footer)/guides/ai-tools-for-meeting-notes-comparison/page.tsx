import type { Metadata } from 'next';

import { generateLocalizedCanonicalUrl } from '@/lib/seo/metadata';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 会议纪要工具对比' : 'AI tools for meeting notes comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的会议纪要 AI 工具，帮你更快选出适合转写和整理的一个。'
      : 'Compare common meeting notes AI tools to choose the one that fits your transcription and cleanup workflow best.',
  );

  return {
    ...metadata,
    alternates: {
      canonical: generateLocalizedCanonicalUrl('/guides/ai-tools-for-meeting-notes', locale),
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI 会议纪要工具对比', en: 'AI tools for meeting notes comparison' },
    breadcrumbLabel: { cn: '会议纪要工具对比', en: 'Meeting notes tools comparison' },
    guideHref: '/guides/ai-tools-for-meeting-notes',
    content: { kind: 'unavailable', guideLabel: { cn: '回到会议指南', en: 'Back to meeting guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
