import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Notta 替代方案对比' : 'Notta alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Notta 的 AI 工具，帮你更快判断会议转写、录音整理和知识归档该怎么选。'
      : 'Compare AI tools that are commonly used as Notta alternatives so you can choose the right fit for meeting transcription, recording cleanup, and knowledge archiving.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'Notta 替代方案对比', en: 'Notta alternatives comparison' },
    breadcrumbLabel: { cn: 'Notta 替代方案对比', en: 'Notta alternatives comparison' },
    guideHref: '/guides/ai-tools-for-meeting-notes',
    content: { kind: 'unavailable', guideLabel: { cn: '回到会议指南', en: 'Back to meeting guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
