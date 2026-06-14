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
    comparisonDimensions: [
      {
        title: { cn: '日志可读性', en: 'Log readability' },
        description: {
          cn: '先看能不能快速找到一次调用为什么失败，而不是只看有没有日志。',
          en: 'Check whether you can quickly tell why a request failed, not just whether logs exist.',
        },
      },
      {
        title: { cn: '成本可见性', en: 'Cost visibility' },
        description: {
          cn: '调用量、模型使用和费用分布越清楚，团队越容易做预算治理。',
          en: 'The clearer usage, model mix, and spend distribution are, the easier it is to control budget.',
        },
      },
      {
        title: { cn: '评估与反馈闭环', en: 'Evaluation and feedback loops' },
        description: {
          cn: '如果你要持续优化提示词和输出，评估、评分和回放能力会变得很重要。',
          en: 'If you want to continuously improve prompts and outputs, evaluation, scoring, and replay become important.',
        },
      },
      {
        title: { cn: '生产接入深度', en: 'Production integration depth' },
        description: {
          cn: '一旦要进真实生产，权限、保留周期、导出和告警就是硬指标。',
          en: 'Once it enters production, permissions, retention, exports, and alerting are hard requirements.',
        },
      },
    ],
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
        href: '/guides/ai-tools-for-automation-comparison',
        title: { cn: '转去自动化工具对比', en: 'Go to automation tools comparison' },
        description: {
          cn: '如果你的问题已经不只是日志，而是告警、执行和故障处理链路，这页更合适。',
          en: 'Move there if the real problem is no longer just logs, but alerting, execution, and failure handling.',
        },
      },
    ],
    toolSelectionNotes: {
      langfuse: {
        bestFor: {
          cn: '已经上线 AI 请求、开始关心提示词质量、追踪链路和评估闭环的产品团队。',
          en: 'Product teams already shipping AI requests and now caring about prompt quality, traces, and evaluation loops.',
        },
        whyPickIt: {
          cn: '它更像一套围绕生产日志与质量迭代的工作台，适合把“模型表现”真正运营起来。',
          en: 'It works like a production-focused workspace for logs and quality iteration, which helps teams actually operate model performance.',
        },
        watchOut: {
          cn: '如果你现在只想先看成本，不打算做评估或提示词治理，它可能会比你当前需求更深。',
          en: 'It may be deeper than needed if you mainly want cost visibility and are not ready for evaluation or prompt governance yet.',
        },
      },
      helicone: {
        bestFor: {
          cn: '想先把请求日志、使用量和成本分布看清楚的开发者与小团队。',
          en: 'Developers and small teams that first want clearer request logs, usage visibility, and cost breakdowns.',
        },
        whyPickIt: {
          cn: '它更偏轻量接入和成本可见性，适合先把真实流量与花费跑明白。',
          en: 'It leans toward lighter integration and cost visibility, which is great for making real traffic and spend understandable first.',
        },
        watchOut: {
          cn: '如果你要的是更重的评估、实验和团队工作流，后面多半还会继续扩工具栈。',
          en: 'You may still need more tooling later if evaluation, experimentation, and team workflow become first-class needs.',
        },
      },
      portkey: {
        bestFor: {
          cn: '把可观测和网关治理放在一起看，需要路由、限额与追踪一体化的团队。',
          en: 'Teams that want observability and gateway governance together, with routing, limits, and traces in one layer.',
        },
        whyPickIt: {
          cn: '它不是单纯看日志，而是把模型出口控制和观测结合起来，适合更接近平台层的决策。',
          en: 'It is not only about logs; it combines model-access control and observability, which fits more platform-level decisions.',
        },
        watchOut: {
          cn: '如果你只想补一个简单日志层，它可能会显得比当前阶段更重。',
          en: 'It can feel heavier than necessary when all you want is a simple logging layer.',
        },
      },
      langsmith: {
        bestFor: {
          cn: '已经把重点放在链路调试、评估集和复杂应用行为分析上的团队。',
          en: 'Teams already focused on trace debugging, evaluation sets, and analyzing complex application behavior.',
        },
        whyPickIt: {
          cn: '它更适合把“应用是怎么一步步走到这个结果”的问题追清楚。',
          en: 'It is especially strong when the key question is how the application arrived at a result step by step.',
        },
        watchOut: {
          cn: '如果你的系统还很轻，或者并不需要复杂链路分析，使用门槛会显得偏高。',
          en: 'If the system is still lightweight or does not need deep trace analysis, the overhead may feel high.',
        },
      },
    },
    tips: {
      cn: [
        '先分清你是在补日志排障、成本治理，还是提示词质量与评估闭环。',
        '如果是团队使用，重点看权限、保留周期、导出方式和告警能力。',
        '比“图表多”更重要的是它能不能真实支持调试、治理和复盘。',
      ],
      en: [
        'Start by separating logging and debugging needs from cost governance and prompt-quality evaluation loops.',
        'For team use, focus on permissions, retention, export options, and alerting.',
        'More important than lots of charts is whether the tool truly supports debugging, governance, and review.',
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
