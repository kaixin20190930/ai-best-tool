import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

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
    rankingHref: '/best-ai-tools/ai-model-routing-tools',
    rankingLabel: { cn: '转去模型路由榜单页', en: 'Open the model routing ranking' },
    backGuideLabel: { cn: '回到模型路由指南', en: 'Back to model routing guide' },
    altBrowseHref: '/explore?search=model&sort=popular',
    altBrowseLabel: { cn: '浏览更多模型路由工具', en: 'Browse more model routing tools' },
    breadcrumbLabel: { cn: '模型路由工具对比', en: 'Model routing tools comparison' },
    compareTitle: {
      cn: '几款常见模型路由工具的快速对照',
      en: 'A quick side-by-side look at common model routing tools',
    },
    compareSubtitle: { cn: 'Model routing', en: 'Model routing' },
    preferredToolNames: ['openrouter', 'portkey', 'together-ai', 'helicone'],
    comparisonDimensions: [
      {
        title: { cn: '供应商覆盖', en: 'Provider coverage' },
        description: {
          cn: '先看能接多少模型供应商，以及切换时会不会把你锁得太死。',
          en: 'Check how many model providers are supported and whether switching creates unnecessary lock-in.',
        },
      },
      {
        title: { cn: '回退与容错', en: 'Fallbacks and resilience' },
        description: {
          cn: '路由工具的价值很大一部分在于它能不能稳住失败场景。',
          en: 'A big part of routing value is whether it stays stable when things fail.',
        },
      },
      {
        title: { cn: '成本与策略治理', en: 'Cost and policy governance' },
        description: {
          cn: '如果模型很多，限额、预算和规则控制就会成为核心能力。',
          en: 'With many models in play, quotas, budgets, and rule control quickly become core capabilities.',
        },
      },
      {
        title: { cn: '团队与生产集成', en: 'Team and production integration' },
        description: {
          cn: '如果它要进生产，权限、日志、审计和交接成本就不能忽略。',
          en: 'If it is going to production, permissions, logs, audits, and handoff cost cannot be ignored.',
        },
      },
    ],
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
        href: '/best-ai-tools/ai-model-routing-tools',
        title: { cn: '先看模型路由榜单页', en: 'Start with the model routing ranking' },
        description: {
          cn: '如果你想先确认这一类最值得看的候选，再回来细比，就先去榜单页。',
          en: 'Go through the ranking first if you want the strongest candidates before doing the detailed comparison.',
        },
      },
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
        href: '/guides/ai-tools-for-evals',
        title: { cn: '转去评估工具指南', en: 'Go to evals tools guide' },
        description: {
          cn: '如果你已经不只是选模型出口，而是开始验证输出质量和策略效果，这页更顺。',
          en: 'A better path when the job now includes validating output quality and strategy performance, not only model access.',
        },
      },
    ],
    toolSelectionNotes: {
      openrouter: {
        bestFor: {
          cn: '想统一接多个模型供应商，并保留切换自由度的独立开发者和产品团队。',
          en: 'Indie hackers and product teams that want one access layer across multiple model providers while keeping switching flexibility.',
        },
        whyPickIt: {
          cn: '它更像统一模型入口，适合先把“接得上、换得动”这件事做好。',
          en: 'It behaves like a unified model access layer, which is great for solving model access and switching first.',
        },
        watchOut: {
          cn: '如果你已经进入企业级治理、限额和审计阶段，通常还会继续补网关层能力。',
          en: 'You will often need a fuller gateway layer later if enterprise-grade governance, limits, and audits become important.',
        },
      },
      portkey: {
        bestFor: {
          cn: '既要做多模型路由，又要做配额、回退、团队权限和出口治理的团队。',
          en: 'Teams that need multi-model routing plus quotas, fallbacks, team permissions, and model-access governance.',
        },
        whyPickIt: {
          cn: '它把网关、路由和治理放在同一层，适合从“能接模型”走向“能管模型”。',
          en: 'It brings gateway, routing, and governance into one layer, which helps teams move from model access toward model control.',
        },
        watchOut: {
          cn: '如果你只是验证一个 MVP，它可能比当前阶段真正需要的更重一些。',
          en: 'It can be heavier than necessary when you are only validating an MVP.',
        },
      },
      'together-ai': {
        bestFor: {
          cn: '更偏开放模型、推理平台和模型选择灵活性的开发团队。',
          en: 'Developer teams leaning toward open models, inference platforms, and broader model choice flexibility.',
        },
        whyPickIt: {
          cn: '它把路由决策拉近到模型平台层，适合把“用哪类模型”也纳入技术决策。',
          en: 'It pulls the routing decision closer to the model-platform layer, which is useful when model family choice itself matters.',
        },
        watchOut: {
          cn: '如果你真正的问题只是统一出口和简单切换，不一定需要平台层这么深。',
          en: 'You may not need this much platform depth if the real need is only unified access and simple switching.',
        },
      },
      helicone: {
        bestFor: {
          cn: '想把路由策略和成本可见性一起看清楚的小团队与早期产品。',
          en: 'Small teams and early products that want routing strategy and cost visibility understood together.',
        },
        whyPickIt: {
          cn: '它能帮助你更快看到不同模型调用的花费与请求表现，方便做早期策略调整。',
          en: 'It helps teams quickly see spend and request behavior across models, which is useful for early routing decisions.',
        },
        watchOut: {
          cn: '如果你要的是更完整的网关治理和策略控制，后面还是可能继续上更重的一层。',
          en: 'You may still add a fuller gateway layer later if governance and routing controls become more demanding.',
        },
      },
    },
    tips: {
      cn: [
        '先分清你是在解决统一接入、回退稳定性，还是企业级限额和治理。',
        '如果你要长期上线，重点看日志、权限、缓存、配额和成本治理。',
        '比“接得快”更重要的是后续是否方便替换、扩供应商和持续维护。',
      ],
      en: [
        'Start by separating unified access, fallback stability, and enterprise governance needs.',
        'If this will run long term, focus on logs, permissions, caching, quotas, and cost governance.',
        'More important than quick setup is whether the system stays replaceable, extensible, and maintainable later.',
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

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_model_routing_comparison' />
    </>
  );
}
