import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 内容创作工具对比' : 'AI content creation tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 AI 内容创作工具，帮你更快判断脚本、封面、改写和发布节奏该怎么选。'
      : 'Compare common AI content creation tools to choose the right fit for scripts, thumbnails, rewriting, and publishing cadence.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI 内容创作工具对比', en: 'AI content creation tools comparison' },
    breadcrumbLabel: { cn: '内容创作工具对比', en: 'Content creation tools comparison' },
    guideHref: '/guides/ai-tools-for-content-creation',
    content: { kind: 'unavailable', guideLabel: { cn: '回到内容创作指南', en: 'Back to content creation guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
