import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI Evals 工具对比' : 'AI tools for evals comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 evals 工具，帮你更快选出适合输出质量验证、评分体系和验收流程的一款。'
      : 'Compare common evals tools to choose the one that fits output validation, scoring systems, and acceptance workflows best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: 'Evals 工具', en: 'Evals tools' },
    comparisonLabel: { cn: 'AI Evals 工具对比', en: 'AI tools for evals comparison' },
    description: {
      cn: '如果你已经知道自己要解决输出质量验证、评分逻辑、验收标准和版本对比，这一页会帮你把常见候选放在一起看。',
      en: 'If you already know you need output validation, scoring logic, acceptance standards, and version comparison, this page helps you compare common options side by side.',
    },
    searchQuery: 'eval',
    guideHref: '/guides/ai-tools-for-evals',
    rankingHref: '/best-ai-tools/ai-evals-tools',
    rankingLabel: { cn: '转去 Evals 榜单页', en: 'Open the evals ranking' },
    backGuideLabel: { cn: '回到 Evals 指南', en: 'Back to evals guide' },
    altBrowseHref: '/explore?search=eval&sort=popular',
    altBrowseLabel: { cn: '浏览更多 evals 工具', en: 'Browse more evals tools' },
    breadcrumbLabel: { cn: 'Evals 工具对比', en: 'Evals tools comparison' },
    compareTitle: {
      cn: '几款常见 evals 工具的快速对照',
      en: 'A quick side-by-side look at common evals tools',
    },
    compareSubtitle: { cn: 'Evals', en: 'Evals' },
    preferredToolNames: ['langfuse', 'langsmith', 'helicone', 'portkey'],
    decisionCards: [
      {
        title: { cn: '看评分逻辑', en: 'Scoring logic' },
        description: {
          cn: '优先看它是否支持你真正需要的质量判断方式，而不是只有表面指标。',
          en: 'Prioritize whether it supports the quality judgments you actually need instead of only shallow metrics.',
        },
      },
      {
        title: { cn: '看数据集与样本管理', en: 'Dataset and sample management' },
        description: {
          cn: '更该看样本、结果和规则能不能放在一起稳定复盘。',
          en: 'Focus more on whether samples, outputs, and rules can be reviewed together in a stable way.',
        },
      },
      {
        title: { cn: '看验收流程贴合度', en: 'Acceptance workflow fit' },
        description: {
          cn: '如果会进入团队流程，就要看分享、签收和回归检查是否顺手。',
          en: 'If the tool feeds team process, judge whether sharing, signoff, and regression checks feel natural.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '需要稳定验收 AI 输出的团队', en: 'Teams needing stable acceptance for AI output' },
        description: {
          cn: '适合已经把 AI 功能放进产品里，希望上线更稳的团队。',
          en: 'Best for teams that already ship AI features and want a steadier release process.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想看 prompt 单次结果的人', en: 'People only checking one-off prompt outputs' },
        description: {
          cn: '如果重点只是临时对比几个 prompt，这类对比会显得更重。',
          en: 'If the job is only to compare a few prompts casually, this comparison may feel heavier than needed.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/best-ai-tools/ai-evals-tools',
        title: { cn: '先看 Evals 榜单页', en: 'Start with the evals ranking' },
        description: {
          cn: '如果你想先确认值得进 shortlist 的候选，再回来细比评分逻辑，就先走榜单页。',
          en: 'Start with the ranking if you want the most likely shortlist candidates before comparing scoring logic in detail.',
        },
      },
      {
        href: '/guides/ai-tools-for-prompt-testing-comparison',
        title: { cn: '转去 Prompt 测试工具对比', en: 'Switch to prompt testing comparison' },
        description: {
          cn: '如果你发现真正决策点更偏提示词版本和 A/B 对比，这页更合适。',
          en: 'Move there if the real decision is shifting toward prompt versions and A/B comparisons.',
        },
      },
      {
        href: '/guides/ai-tools-for-api-observability-comparison',
        title: { cn: '转去 API 可观测工具对比', en: 'Switch to API observability comparison' },
        description: {
          cn: '如果你更关心上线后请求与质量观察，这页更贴近目标。',
          en: 'More useful if the real job is post-deploy requests and quality visibility.',
        },
      },
      {
        href: '/explore?search=eval&sort=popular',
        title: { cn: '继续看更多 evals 候选', en: 'See more evals candidates' },
        description: {
          cn: '当你只需要扩大 shortlist 时，直接回 Explore 最快。',
          en: 'The fastest next step once you only need a wider shortlist.',
        },
      },
    ],
    tips: {
      cn: [
        '先看评分逻辑，再看样本和数据集管理。',
        '如果会进入团队流程，重点看分享、签收和回归检查。',
        '比“能不能跑分”更重要的是能不能让发布判断更稳。',
      ],
      en: [
        'Start with scoring logic, then move to sample and dataset management.',
        'If the tool feeds team process, focus on sharing, signoff, and regression checks.',
        'More important than generating a score is whether release decisions become steadier.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看评分逻辑、数据集支持、结果复盘、验收流程和团队协作。',
          en: 'We compare scoring logic, dataset support, result review, acceptance workflows, and team collaboration.',
        },
      },
      {
        question: { cn: '为什么单独做 evals 对比？', en: 'Why compare evals tools separately?' },
        answer: {
          cn: '因为这类决策重点通常不是“能不能调模型”，而是能不能稳定判断输出质量与上线风险。',
          en: 'Because the decision is usually less about model access and more about whether output quality and release risk can be judged reliably.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_evals_comparison' />
    </>
  );
}
