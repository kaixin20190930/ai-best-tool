import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 研究工具对比' : 'AI tools for research comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 AI 研究工具，帮你更快选出适合资料发现、证据核对和分析工作流的一个。'
      : 'Compare common AI research tools to choose the one that fits discovery, evidence-checking, and analysis workflows best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '研究工具', en: 'Research tools' },
    comparisonLabel: { cn: 'AI 研究工具对比', en: 'AI tools for research comparison' },
    description: {
      cn: '如果你已经知道自己要做资料发现、信息核对或竞品研究，这一页会帮你把几款常见工具放在一起看。',
      en: 'If you already know you need discovery, evidence-checking, or competitor research, this page helps you compare a few common tools side by side.',
    },
    searchQuery: 'research',
    guideHref: '/guides/ai-tools-for-research',
    backGuideLabel: { cn: '回到研究工具指南', en: 'Back to research guide' },
    altBrowseHref: '/explore?search=research&sort=popular',
    altBrowseLabel: { cn: '浏览更多研究工具', en: 'Browse more research tools' },
    breadcrumbLabel: { cn: '研究工具对比', en: 'Research tools comparison' },
    compareTitle: { cn: '几款常见研究工具的快速对照', en: 'A quick side-by-side look at common research tools' },
    compareSubtitle: { cn: 'Research', en: 'Research' },
    tips: {
      cn: [
        '先确认你做的是资料发现、证据核对还是深度分析，不同工具的重点不同。',
        '如果你重视可信度，优先看来源透明度、回溯能力和历史记录。',
        '更看重长期使用时，关注导出、收藏、上下文管理和协作能力。',
      ],
      en: [
        'Start with whether you need discovery, evidence-checking, or deeper analysis.',
        'If trust matters, prioritize source transparency, traceability, and history.',
        'For long-term use, focus on exports, saved context, and collaboration support.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看来源可追溯性、免费可用性、评分、更新情况和实际研究适配度。',
          en: 'We compare source traceability, free usability, ratings, freshness, and fit for real research workflows.',
        },
      },
      {
        question: { cn: '为什么把研究工具单独拿出来？', en: 'Why compare research tools separately?' },
        answer: {
          cn: '因为研究型需求更关注信息来源、覆盖范围和分析深度，而不只是生成结果。',
          en: 'Because research-heavy use cases care more about sources, coverage, and analytical depth than pure generation.',
        },
      },
    ],
  });

  return ComparisonPage({ ...data, locale });
}
