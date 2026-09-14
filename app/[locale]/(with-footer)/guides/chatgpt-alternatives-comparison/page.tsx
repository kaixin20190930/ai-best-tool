import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'ChatGPT 替代方案对比' : 'ChatGPT alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 ChatGPT 的 AI 工具，帮你更快判断聊天、写作、研究和多模型切换该怎么选。'
      : 'Compare AI tools that are commonly used as ChatGPT alternatives so you can choose the right fit for chat, writing, research, and multi-model workflows.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'ChatGPT 替代方案对比', en: 'ChatGPT alternatives comparison' },
    breadcrumbLabel: { cn: 'ChatGPT 替代方案对比', en: 'ChatGPT alternatives comparison' },
    guideHref: '/guides/ai-chatbot-tools',
    content: { kind: 'unavailable', guideLabel: { cn: '回到聊天机器人指南', en: 'Back to chatbot guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
