import type { Metadata } from 'next';

import { generateLocalizedCanonicalUrl } from '@/lib/seo/metadata';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 代码审查工具对比' : 'AI tools for code review comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的代码审查工具，帮你更快选出适合 PR 审查、风险提示和团队反馈的一款。'
      : 'Compare common code review tools to choose the one that fits PR review, risk checks, and team feedback best.',
  );

  return {
    ...metadata,
    alternates: {
      canonical: generateLocalizedCanonicalUrl('/guides/ai-tools-for-code-review', locale),
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI 代码审查工具对比', en: 'AI tools for code review comparison' },
    breadcrumbLabel: { cn: '代码审查工具对比', en: 'Code review tools comparison' },
    guideHref: '/guides/ai-tools-for-code-review',
    content: { kind: 'unavailable', guideLabel: { cn: '回到代码审查指南', en: 'Back to code review guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
