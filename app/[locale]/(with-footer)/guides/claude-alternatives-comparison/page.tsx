import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Claude 替代方案对比' : 'Claude alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Claude 的 AI 工具，帮你更快判断长上下文、分析、写作和代码理解该选哪一类。'
      : 'Compare AI tools that are commonly used as Claude alternatives so you can choose the right fit for long context, analysis, writing, and code understanding.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    comparisonLabel: { cn: 'Claude 替代方案对比', en: 'Claude alternatives comparison' },
    breadcrumbLabel: { cn: 'Claude 替代方案对比', en: 'Claude alternatives comparison' },
    guideHref: '/guides/ai-chatbot-tools',
    content: { kind: 'unavailable', guideLabel: { cn: '回到聊天机器人指南', en: 'Back to chatbot guide' } },
  });

  return ComparisonPage({ ...data, locale });
}
