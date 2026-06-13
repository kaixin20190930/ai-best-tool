import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI Prompt 测试工具对比' : 'AI tools for prompt testing comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 prompt 测试工具，帮你更快选出适合评估、A/B 测试和回归验证的一款。'
      : 'Compare common prompt testing tools to choose the one that fits evals, A/B tests, and regression checks best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: 'Prompt 测试工具', en: 'Prompt testing tools' },
    comparisonLabel: { cn: 'AI Prompt 测试工具对比', en: 'AI tools for prompt testing comparison' },
    description: {
      cn: '如果你已经知道自己要解决提示词评估、A/B 对比、回归验证和质量判断，这一页会帮你把常见候选放在一起看。',
      en: 'If you already know you need prompt evaluation, A/B comparison, regression checks, and quality judgment, this page helps you compare common options side by side.',
    },
    searchQuery: 'prompt',
    guideHref: '/guides/ai-tools-for-prompt-testing',
    backGuideLabel: { cn: '回到 Prompt 测试指南', en: 'Back to prompt testing guide' },
    altBrowseHref: '/explore?search=prompt&sort=popular',
    altBrowseLabel: { cn: '浏览更多 prompt 测试工具', en: 'Browse more prompt testing tools' },
    breadcrumbLabel: { cn: 'Prompt 测试工具对比', en: 'Prompt testing tools comparison' },
    compareTitle: {
      cn: '几款常见 prompt 测试工具的快速对照',
      en: 'A quick side-by-side look at common prompt testing tools',
    },
    compareSubtitle: { cn: 'Prompt testing', en: 'Prompt testing' },
    preferredToolNames: ['langfuse', 'langsmith', 'helicone', 'portkey'],
    decisionCards: [
      {
        title: { cn: '看评估方式', en: 'Evaluation style' },
        description: {
          cn: '优先看它是偏单次对比、数据集评估，还是回归验证。',
          en: 'Prioritize whether the tool is strongest at single-run comparison, dataset evals, or regression checks.',
        },
      },
      {
        title: { cn: '看版本管理', en: 'Version management' },
        description: {
          cn: '更该看 prompt、模型和结果能不能连成可复盘的版本链路。',
          en: 'Focus on whether prompts, models, and outputs are tied into a reviewable version history.',
        },
      },
      {
        title: { cn: '看团队协作', en: 'Team collaboration fit' },
        description: {
          cn: '如果是团队使用，要看结果共享、复盘和验收流程是否顺手。',
          en: 'For team use, judge whether result sharing, review, and signoff workflows feel natural.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '经常迭代 prompt 的团队', en: 'Teams that iterate prompts often' },
        description: {
          cn: '适合已经进入反复试验阶段，不想每次都靠感觉判断的人。',
          en: 'Best for teams already iterating heavily and no longer wanting to judge changes by instinct alone.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想看上线后日志的人', en: 'People mainly focused on post-deploy logs' },
        description: {
          cn: '如果重点是请求链路和线上质量观察，可观测页通常更适合。',
          en: 'If the real job is request tracing and production quality visibility, observability pages are usually a better fit.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-api-observability-comparison',
        title: { cn: '转去 API 可观测工具对比', en: 'Switch to API observability comparison' },
        description: {
          cn: '如果你发现真正决策点更偏日志、请求和线上质量，这页更贴近目标。',
          en: 'Move there if the real decision is shifting toward logs, requests, and production quality visibility.',
        },
      },
      {
        href: '/guides/ai-tools-for-model-routing-comparison',
        title: { cn: '转去模型路由工具对比', en: 'Switch to model routing comparison' },
        description: {
          cn: '如果你发现问题在模型切换和成本治理，这页更合适。',
          en: 'More useful if the real decision is about model switching and cost governance.',
        },
      },
      {
        href: '/explore?search=prompt&sort=popular',
        title: { cn: '继续看更多 prompt 候选', en: 'See more prompt candidates' },
        description: {
          cn: '当你只想扩大 shortlist 时，直接回 Explore 最快。',
          en: 'The fastest next step once you only need a wider shortlist.',
        },
      },
    ],
    tips: {
      cn: [
        '先看评估方式，再看 prompt 版本管理。',
        '如果是团队使用，重点看结果复盘和共享能力。',
        '比“能不能跑”更重要的是能不能稳定复现和比较。',
      ],
      en: [
        'Start with evaluation style, then move to prompt versioning.',
        'For team use, focus on review and sharing of results.',
        'More important than whether it can run is whether it can reproduce and compare reliably.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看评估方式、版本管理、结果复盘、团队协作和实际验证流程。',
          en: 'We compare evaluation style, version control, result review, team collaboration, and practical validation flow.',
        },
      },
      {
        question: { cn: '为什么单独做 prompt 测试对比？', en: 'Why compare prompt testing tools separately?' },
        answer: {
          cn: '因为这类决策重点通常不是“能不能调用模型”，而是能不能稳定验证和比较 prompt 质量。',
          en: 'Because the decision is usually less about model access and more about whether prompt quality can be validated and compared reliably.',
        },
      },
    ],
  });

  return ComparisonPage({ ...data, locale });
}
