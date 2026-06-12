import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI API 可观测工具对比' : 'AI tools for API observability comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 API 可观测工具，帮你更快选出适合日志、成本追踪和质量分析的一款。'
      : 'Compare common API observability tools to choose the one that fits logs, cost tracking, and quality analysis best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: 'API 可观测工具', en: 'API observability tools' },
    comparisonLabel: { cn: 'AI API 可观测工具对比', en: 'AI tools for API observability comparison' },
    description: {
      cn: '如果你已经知道自己要解决请求日志、成本分析、质量追踪或生产调试，这一页会帮你把常见工具放在一起看。',
      en: 'If you already know you need request logs, cost analysis, quality tracking, or production debugging, this page helps you compare common options side by side.',
    },
    searchQuery: 'observability',
    guideHref: '/guides/ai-tools-for-api-observability',
    backGuideLabel: { cn: '回到 API 可观测指南', en: 'Back to API observability guide' },
    altBrowseHref: '/explore?search=observability&sort=popular',
    altBrowseLabel: { cn: '浏览更多可观测工具', en: 'Browse more observability tools' },
    breadcrumbLabel: { cn: 'API 可观测工具对比', en: 'API observability tools comparison' },
    compareTitle: {
      cn: '几款常见 API 可观测工具的快速对照',
      en: 'A quick side-by-side look at common API observability tools',
    },
    compareSubtitle: { cn: 'API observability', en: 'API observability' },
    preferredToolNames: ['langfuse', 'helicone', 'portkey', 'langsmith'],
    decisionCards: [
      {
        title: { cn: '看请求日志与调试', en: 'Request logs and debugging' },
        description: {
          cn: '优先看日志可读性、追踪粒度和是否方便定位真实问题。',
          en: 'Prioritize log readability, tracing depth, and how easily the tool helps locate real issues.',
        },
      },
      {
        title: { cn: '看成本与配额', en: 'Cost and quota visibility' },
        description: {
          cn: '更该看成本分布、调用统计和是否方便做预算治理。',
          en: 'Focus more on cost breakdown, usage stats, and how easy it is to govern spend.',
        },
      },
      {
        title: { cn: '看质量与提示词表现', en: 'Quality and prompt performance' },
        description: {
          cn: '如果你要追踪提示词与输出质量，就要看评估和反馈链路是否清楚。',
          en: 'If prompt and output quality matter, look at how clearly evaluations and feedback loops are handled.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '已经进到生产的 AI 产品团队', en: 'Teams already in production' },
        description: {
          cn: '适合已经在跑真实请求、成本和质量问题的产品团队。',
          en: 'Best for product teams already dealing with real request, cost, and quality issues in production.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '还没开始正式接 API 的人', en: 'People not yet integrating APIs seriously' },
        description: {
          cn: '如果还处在轻量试验期，这类工具可能会显得过早。',
          en: 'If you are still in light experimentation mode, these tools may feel premature.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-model-routing-comparison',
        title: { cn: '转去模型路由工具对比', en: 'Switch to model routing comparison' },
        description: {
          cn: '如果你发现真正的决策点在统一出口和回退策略，这页更贴近目标。',
          en: 'Move there if the real decision is more about unified access and fallback strategy.',
        },
      },
      {
        href: '/guides/ai-tools-for-developers-comparison',
        title: { cn: '回到开发者工具总对比', en: 'Back to developer tools comparison' },
        description: {
          cn: '适合还没完全确定自己在选可观测还是更广的开发工作流工具。',
          en: 'Best if you are not yet fully narrowed into observability versus broader developer tooling.',
        },
      },
      {
        href: '/explore?search=observability&sort=popular',
        title: { cn: '继续看更多可观测候选', en: 'See more observability candidates' },
        description: {
          cn: '当你只需要扩大 shortlist 时，直接回 Explore 最快。',
          en: 'The fastest next step once you only need a wider shortlist.',
        },
      },
    ],
    tips: {
      cn: [
        '先看日志和追踪，再看成本与质量指标。',
        '如果是团队使用，重点看权限、保留周期和告警能力。',
        '比“图表多”更重要的是能不能真正支持调试和治理。',
      ],
      en: [
        'Start with logs and tracing, then move to cost and quality metrics.',
        'For team use, focus on permissions, retention, and alerting.',
        'More important than lots of charts is whether the tool truly supports debugging and governance.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看日志能力、追踪粒度、成本视图、质量追踪和实际接入成本。',
          en: 'We compare logging, tracing depth, cost visibility, quality tracking, and practical integration cost.',
        },
      },
      {
        question: { cn: '为什么单独做 API 可观测对比？', en: 'Why compare API observability tools separately?' },
        answer: {
          cn: '因为这类决策的重点通常不是“能不能调模型”，而是能不能把真实请求和问题看清楚。',
          en: 'Because the decision is usually less about model access and more about whether real requests and issues become clearly visible.',
        },
      },
    ],
  });

  return ComparisonPage({ ...data, locale });
}
