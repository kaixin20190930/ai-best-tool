import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 语音工具对比' : 'AI voice tools comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的语音 AI 工具，帮你更快选出适合配音、转写或对话的一个。'
      : 'Compare common voice AI tools to choose the one that fits dubbing, transcription, or conversational use best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'AI 语音工具对比', en: 'AI voice tools comparison' },
    breadcrumbLabel: { cn: '语音工具对比', en: 'Voice tools comparison' },
    guideHref: '/guides/ai-tools-for-voice',
    content: { kind: 'unavailable', guideLabel: { cn: '回到语音指南', en: 'Back to voice guide' } },
  });

  const isChinese = locale === 'cn' || locale === 'tw';

  return ComparisonPage({ ...data, locale });
}
