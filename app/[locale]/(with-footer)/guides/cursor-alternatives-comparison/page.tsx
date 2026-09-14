import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Cursor 替代方案对比' : 'Cursor alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更接近 Cursor 工作流的 AI 工具，帮你更快判断编辑器内补全、重构、调试和上下文协作该选哪一类。'
      : 'Compare AI tools that feel closer to the Cursor workflow so you can choose the right fit for editor-first completion, refactoring, debugging, and context-aware coding.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'Cursor 替代方案对比', en: 'Cursor alternatives comparison' },
    breadcrumbLabel: { cn: 'Cursor 替代方案对比', en: 'Cursor alternatives comparison' },
    guideHref: '/guides/ai-coding-tools',
    content: { kind: 'unavailable', guideLabel: { cn: '回到编程工具指南', en: 'Back to coding guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
