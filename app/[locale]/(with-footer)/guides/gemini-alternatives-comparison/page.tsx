import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Gemini 替代方案对比' : 'Gemini alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Gemini 的 AI 工具，帮你更快判断 Google 生态、移动入口和多模型切换该怎么选。'
      : 'Compare AI tools that are commonly used as Gemini alternatives so you can choose the right fit for Google ecosystem workflows, mobile entry points, and multi-model switching.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'Gemini 替代方案对比', en: 'Gemini alternatives comparison' },
    breadcrumbLabel: { cn: 'Gemini 替代方案对比', en: 'Gemini alternatives comparison' },
    guideHref: '/guides/ai-chatbot-tools',
    content: { kind: 'unavailable', guideLabel: { cn: '回到聊天机器人指南', en: 'Back to chatbot guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
