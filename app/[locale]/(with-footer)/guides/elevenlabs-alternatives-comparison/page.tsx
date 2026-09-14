import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'ElevenLabs 替代方案对比' : 'ElevenLabs alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 ElevenLabs 的 AI 工具，帮你更快判断语音合成、声音库和音频工作流该怎么选。'
      : 'Compare AI tools that are commonly used as ElevenLabs alternatives so you can choose the right fit for voice synthesis, voice libraries, and audio workflows.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'ElevenLabs 替代方案对比', en: 'ElevenLabs alternatives comparison' },
    breadcrumbLabel: { cn: 'ElevenLabs 替代方案对比', en: 'ElevenLabs alternatives comparison' },
    guideHref: '/guides/ai-tools-for-voice',
    content: { kind: 'unavailable', guideLabel: { cn: '回到语音指南', en: 'Back to voice guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
