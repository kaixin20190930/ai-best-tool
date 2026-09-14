import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Suno 替代方案对比' : 'Suno alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Suno 的 AI 工具，帮你更快判断音乐生成、歌曲创作和音频工作流该怎么选。'
      : 'Compare AI tools that are commonly used as Suno alternatives so you can choose the right fit for music generation, songwriting, and audio workflows.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'Suno 替代方案对比', en: 'Suno alternatives comparison' },
    breadcrumbLabel: { cn: 'Suno 替代方案对比', en: 'Suno alternatives comparison' },
    guideHref: '/guides/ai-tools-for-creators',
    content: { kind: 'unavailable', guideLabel: { cn: '回到创作者指南', en: 'Back to creator guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
