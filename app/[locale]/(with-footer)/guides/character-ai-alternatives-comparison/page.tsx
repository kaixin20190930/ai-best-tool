import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Character AI 替代方案对比' : 'Character AI alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Character AI 的 AI 工具，帮你更快判断角色对话、沉浸式互动和通用聊天该怎么选。'
      : 'Compare AI tools that are commonly used as Character AI alternatives so you can choose the right fit for character chat, immersive interaction, and general-purpose conversation.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'Character AI 替代方案对比', en: 'Character AI alternatives comparison' },
    breadcrumbLabel: { cn: 'Character AI 替代方案对比', en: 'Character AI alternatives comparison' },
    guideHref: '/guides/ai-chatbot-tools',
    content: { kind: 'unavailable', guideLabel: { cn: '回到聊天机器人指南', en: 'Back to chatbot guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
