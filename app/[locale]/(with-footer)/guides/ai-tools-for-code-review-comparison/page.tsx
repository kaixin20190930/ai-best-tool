import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 代码审查工具对比' : 'AI tools for code review comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的代码审查工具，帮你更快选出适合 PR 审查、风险提示和团队反馈的一款。'
      : 'Compare common code review tools to choose the one that fits PR review, risk checks, and team feedback best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '代码审查工具', en: 'Code review tools' },
    comparisonLabel: { cn: 'AI 代码审查工具对比', en: 'AI tools for code review comparison' },
    description: {
      cn: '如果你已经知道自己要解决 PR 理解、风险提示、review 草稿或变更解释，这一页会帮你把常见候选放在一起看。',
      en: 'If you already know you need PR understanding, risk checks, review drafts, or change explanation, this page helps you compare common options side by side.',
    },
    searchQuery: 'code review',
    guideHref: '/guides/ai-tools-for-code-review',
    backGuideLabel: { cn: '回到代码审查指南', en: 'Back to code review guide' },
    altBrowseHref: '/explore?search=code%20review&sort=popular',
    altBrowseLabel: { cn: '浏览更多代码审查工具', en: 'Browse more code review tools' },
    breadcrumbLabel: { cn: '代码审查工具对比', en: 'Code review tools comparison' },
    compareTitle: {
      cn: '几款常见代码审查工具的快速对照',
      en: 'A quick side-by-side look at common code review tools',
    },
    compareSubtitle: { cn: 'Code review', en: 'Code review' },
    preferredToolNames: ['cursor', 'claude', 'phind', 'chatgpt'],
    decisionCards: [
      {
        title: { cn: '看 diff 理解能力', en: 'Diff understanding' },
        description: {
          cn: '优先看它能不能围绕改动本身给出具体解释，而不是泛泛总结。',
          en: 'Prioritize whether it can explain the actual change instead of offering generic summaries.',
        },
      },
      {
        title: { cn: '看风险与噪音比', en: 'Risk signal vs noise' },
        description: {
          cn: '更该看提示是否真有价值，以及会不会让 review comment 变多但变浅。',
          en: 'Focus on whether the warnings are truly useful instead of producing shallow extra comments.',
        },
      },
      {
        title: { cn: '看团队协作贴合度', en: 'Team collaboration fit' },
        description: {
          cn: '如果是团队使用，要看它是否贴近 PR 流程、评论节奏和协作习惯。',
          en: 'For team use, judge how well it fits PR flow, comment rhythm, and collaboration habits.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '想缩短 PR 周期的团队', en: 'Teams trying to shorten PR cycles' },
        description: {
          cn: '适合已经有稳定提交和 review 流程，但想减少等待与沟通成本的团队。',
          en: 'Best for teams with an existing review process that want to reduce waiting time and communication cost.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只想找写代码助手的人', en: 'People only looking for code generation help' },
        description: {
          cn: '如果重点是实现速度而不是 review 质量，这类比较会显得偏后段。',
          en: 'If implementation speed matters more than review quality, this comparison is not the sharpest first step.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-coding-tools-comparison',
        title: { cn: '转去编程工具对比', en: 'Switch to coding tools comparison' },
        description: {
          cn: '如果你发现真正决策点更偏实现效率，这页更贴近目标。',
          en: 'Move there if the real decision is shifting toward implementation speed.',
        },
      },
      {
        href: '/guides/ai-tools-for-developers-comparison',
        title: { cn: '回到开发者工具总对比', en: 'Back to developer tools comparison' },
        description: {
          cn: '适合还没完全确定自己在选 review 还是更广的开发工作流工具。',
          en: 'Best if you are not yet fully narrowed into review versus broader developer tooling.',
        },
      },
      {
        href: '/explore?search=code%20review&sort=popular',
        title: { cn: '继续看更多代码审查候选', en: 'See more code review candidates' },
        description: {
          cn: '当你只想扩大 shortlist 时，直接回 Explore 最快。',
          en: 'The fastest next step once you only need a wider shortlist.',
        },
      },
    ],
    tips: {
      cn: [
        '先看 diff 理解和风险提示，再看评论质量。',
        '如果是团队使用，重点看噪音控制和协作贴合度。',
        '比“会不会说”更重要的是能不能让 review 更稳更快。',
      ],
      en: [
        'Start with diff understanding and risk checks, then move to comment quality.',
        'For team use, focus on noise control and collaboration fit.',
        'More important than sounding smart is whether the tool makes review steadier and faster.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看 diff 理解、风险提示、反馈可执行性、协作贴合度和真实使用噪音。',
          en: 'We compare diff understanding, risk checks, actionability of feedback, collaboration fit, and real-world noise.',
        },
      },
      {
        question: { cn: '为什么单独做代码审查对比？', en: 'Why compare code review tools separately?' },
        answer: {
          cn: '因为这类决策重点通常不是生成代码，而是能不能减少 review 成本并提升反馈质量。',
          en: 'Because the decision is usually less about generating code and more about reducing review cost while improving feedback quality.',
        },
      },
    ],
  });

  return ComparisonPage({ ...data, locale });
}
