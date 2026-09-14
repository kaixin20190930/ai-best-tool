import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Descript 替代方案对比' : 'Descript alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Descript 的 AI 工具，帮你更快判断音频编辑、转写和播客工作流该怎么选。'
      : 'Compare AI tools that are commonly used as Descript alternatives so you can choose the right fit for audio editing, transcription, and podcast workflows.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'Descript 替代方案对比', en: 'Descript alternatives comparison' },
    breadcrumbLabel: { cn: 'Descript 替代方案对比', en: 'Descript alternatives comparison' },
    guideHref: '/guides/ai-tools-for-voice',
    content: { kind: 'unavailable', guideLabel: { cn: '回到语音指南', en: 'Back to voice guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
