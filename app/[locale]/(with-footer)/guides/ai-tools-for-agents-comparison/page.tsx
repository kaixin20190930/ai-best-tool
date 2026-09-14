import type { Metadata } from 'next';

import { generateLocalizedCanonicalUrl } from '@/lib/seo/metadata';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI Agent 工具对比' : 'AI tools for agents comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更接近 Agent 工作流的 AI 工具，帮你更快选出适合任务编排、工具调用和运行治理的一组能力。'
      : 'Compare AI tools that sit closer to agent workflows so you can choose the right stack for orchestration, tool use, and runtime governance.',
  );

  return {
    ...metadata,
    alternates: {
      canonical: generateLocalizedCanonicalUrl('/guides/ai-tools-for-agents', locale),
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI Agent 工具对比', en: 'AI tools for agents comparison' },
    breadcrumbLabel: { cn: 'Agent 工具对比', en: 'Agent tools comparison' },
    guideHref: '/guides/ai-tools-for-agents',
    content: { kind: 'unavailable', guideLabel: { cn: '回到 Agent 工具指南', en: 'Back to agent tools guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
