import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Sora 替代方案对比' : 'Sora alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Sora 的 AI 工具，帮你更快判断视频生成、角色运动和多模态能力该怎么选。'
      : 'Compare AI tools that are commonly used as Sora alternatives so you can choose the right fit for video generation, character motion, and multimodal capability.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'Sora 替代方案对比', en: 'Sora alternatives comparison' },
    breadcrumbLabel: { cn: 'Sora 替代方案对比', en: 'Sora alternatives comparison' },
    guideHref: '/guides/ai-video-tools',
    content: { kind: 'unavailable', guideLabel: { cn: '回到视频工具指南', en: 'Back to video guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
