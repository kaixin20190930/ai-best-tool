import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 记笔记工具对比' : 'AI note taking tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的记笔记 AI 工具，帮你更快选出适合会议和知识整理的一个。'
      : 'Compare common note taking AI tools to choose the one that fits your meetings and knowledge workflow best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI 记笔记工具对比', en: 'AI note taking tools comparison' },
    breadcrumbLabel: { cn: '记笔记工具对比', en: 'Note taking tools comparison' },
    guideHref: '/guides/ai-note-taking-tools',
    content: { kind: 'unavailable', guideLabel: { cn: '回到记笔记指南', en: 'Back to note taking guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
