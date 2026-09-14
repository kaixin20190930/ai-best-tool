import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Poe 替代方案对比' : 'Poe alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Poe 的 AI 工具，帮你更快判断多模型切换、统一入口和对话体验该怎么选。'
      : 'Compare AI tools that are commonly used as Poe alternatives so you can choose the right fit for multi-model switching, unified entry points, and conversational experience.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'Poe 替代方案对比', en: 'Poe alternatives comparison' },
    breadcrumbLabel: { cn: 'Poe 替代方案对比', en: 'Poe alternatives comparison' },
    guideHref: '/guides/ai-chatbot-tools',
    content: { kind: 'unavailable', guideLabel: { cn: '回到聊天机器人指南', en: 'Back to chatbot guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
