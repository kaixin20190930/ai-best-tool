import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 模型路由工具对比' : 'AI tools for model routing comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的模型路由工具，帮你更快选出适合多模型接入、回退策略和成本治理的一款。'
      : 'Compare common model routing tools to choose the one that fits multi-model access, fallback strategy, and cost control best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '模型路由工具', en: 'Model routing tools' },
    comparisonLabel: { cn: 'AI 模型路由工具对比', en: 'AI tools for model routing comparison' },
    description: {
      cn: '如果你已经知道自己要解决多模型接入、回退、成本控制或统一出口，这一页会帮你把常见工具放在一起看。',
      en: 'If you already know you need multi-model access, fallbacks, cost control, or unified access, this page helps you compare common options side by side.',
    },
    searchQuery: 'model',
    guideHref: '/guides/ai-tools-for-model-routing',
    backGuideLabel: { cn: '回到模型路由指南', en: 'Back to model routing guide' },
    altBrowseHref: '/explore?search=model&sort=popular',
    altBrowseLabel: { cn: '浏览更多模型路由工具', en: 'Browse more model routing tools' },
    breadcrumbLabel: { cn: '模型路由工具对比', en: 'Model routing tools comparison' },
    compareTitle: {
      cn: '几款常见模型路由工具的快速对照',
      en: 'A quick side-by-side look at common model routing tools',
    },
    compareSubtitle: { cn: 'Model routing', en: 'Model routing' },
    preferredToolNames: ['openrouter', 'portkey', 'helicone', 'langfuse'],
    decisionCards: [
      {
        title: { cn: '做统一模型出口', en: 'Unified model access' },
        description: {
          cn: '先看支持的供应商、模型广度和切换成本，而不是只看模型数量。',
          en: 'Start with provider support, model breadth, and switching cost rather than just the raw model count.',
        },
      },
      {
        title: { cn: '做回退与稳定性', en: 'Fallbacks and stability' },
        description: {
          cn: '更该看回退控制、缓存和失败处理是否足够稳。',
          en: 'Focus more on fallback controls, caching, and failure handling stability.',
        },
      },
      {
        title: { cn: '做成本治理', en: 'Cost governance' },
        description: {
          cn: '日志、限额和成本视图会比“接入快”更重要。',
          en: 'Logs, limits, and cost visibility matter more here than quick setup alone.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '多模型产品团队', en: 'Teams shipping multi-model products' },
        description: {
          cn: '适合需要在多个模型、供应商和策略之间持续切换与优化的团队。',
          en: 'Best for teams that need to switch and optimize across multiple models, providers, and strategies.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只调一个模型的人', en: 'People calling only one model' },
        description: {
          cn: '如果你不会做路由、回退或成本治理，这类工具可能会显得过重。',
          en: 'If routing, fallbacks, and cost governance are not real needs, these tools may feel heavier than necessary.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-api-observability-comparison',
        title: { cn: '转去 API 可观测工具对比', en: 'Switch to API observability comparison' },
        description: {
          cn: '如果你发现自己更关心日志、成本和质量追踪，这页更贴近真实决策。',
          en: 'Move there if the real decision is more about logs, cost, and quality tracking.',
        },
      },
      {
        href: '/guides/ai-tools-for-developers-comparison',
        title: { cn: '回到开发者工具总对比', en: 'Back to developer tools comparison' },
        description: {
          cn: '适合还没完全确定自己是在选路由还是更广的开发工作流工具。',
          en: 'Best if you are not yet fully narrowed into routing versus broader developer tooling.',
        },
      },
      {
        href: '/explore?search=model&sort=popular',
        title: { cn: '继续看更多路由候选', en: 'See more routing candidates' },
        description: {
          cn: '当你只需要扩大 shortlist 时，直接回 Explore 最快。',
          en: 'The fastest next step once you only need a wider shortlist.',
        },
      },
    ],
    tips: {
      cn: [
        '先看模型支持和供应商切换，再看回退与缓存。',
        '如果你要长期上线，重点看日志、权限和成本治理。',
        '比“接得快”更重要的是后续是否方便替换与维护。',
      ],
      en: [
        'Start with model and provider support, then fallback and caching controls.',
        'If this will run long term, focus on logs, permissions, and cost governance.',
        'More important than quick setup is whether the system stays replaceable and maintainable later.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看供应商覆盖、回退控制、成本治理、日志能力和实际接入成本。',
          en: 'We compare provider coverage, fallback control, cost governance, logging, and practical integration cost.',
        },
      },
      {
        question: { cn: '为什么单独做模型路由对比？', en: 'Why compare model routing tools separately?' },
        answer: {
          cn: '因为这类决策的重点通常不是“能不能调用模型”，而是能不能长期稳定治理模型出口。',
          en: 'Because the decision is usually less about basic model access and more about stable long-term control of model access.',
        },
      },
    ],
  });

  return ComparisonPage({ ...data, locale });
}
