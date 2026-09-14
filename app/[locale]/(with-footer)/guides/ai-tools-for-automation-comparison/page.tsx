import type { Metadata } from 'next';

import { generateLocalizedCanonicalUrl } from '@/lib/seo/metadata';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 自动化工具对比' : 'AI tools for automation comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 AI 自动化工具，帮你更快选出适合流程编排、重复任务和跨工具联动的一个。'
      : 'Compare common AI automation tools to choose the one that fits orchestration, repeatable tasks, and cross-tool workflows best.',
  );

  return {
    ...metadata,
    alternates: {
      canonical: generateLocalizedCanonicalUrl('/guides/ai-tools-for-automation', locale),
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI 自动化工具对比', en: 'AI tools for automation comparison' },
    breadcrumbLabel: { cn: '自动化工具对比', en: 'Automation tools comparison' },
    guideHref: '/guides/ai-tools-for-automation',
    content: { kind: 'unavailable', guideLabel: { cn: '回到自动化工具指南', en: 'Back to automation guide' } },
  });

  const quickStarts = [
    {
      href: '/best-ai-tools/ai-automation-tools',
      title: locale === 'cn' || locale === 'tw' ? '自动化榜单' : 'Automation ranking',
      desc:
        locale === 'cn' || locale === 'tw'
          ? '先看 shortlist，再回比较页。'
          : 'Start with the shortlist, then come back to compare.',
    },
    {
      href: '/guides/ai-tools-for-automation',
      title: locale === 'cn' || locale === 'tw' ? '自动化指南' : 'Automation guide',
      desc:
        locale === 'cn' || locale === 'tw'
          ? '重新确认是触发器、编排还是维护。'
          : 'Re-check whether the task is triggers, orchestration, or maintainability.',
    },
    {
      href: '/ai/n8n',
      title: 'n8n',
      desc:
        locale === 'cn' || locale === 'tw' ? '更适合可视化和自托管。' : 'Good for visual and self-hosted automation.',
    },
    {
      href: '/ai/pipedream',
      title: 'Pipedream',
      desc:
        locale === 'cn' || locale === 'tw'
          ? '适合 API 驱动和开发者工作流。'
          : 'Useful for API-driven developer workflows.',
    },
  ];

  return ComparisonPage({ ...data, locale });
}
