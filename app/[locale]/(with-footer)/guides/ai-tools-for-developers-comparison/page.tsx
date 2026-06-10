import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 开发者工具对比' : 'AI tools for developers comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 AI 开发者工具，帮你更快选出适合编码、模型接入、调试和工作流集成的一个。'
      : 'Compare common AI developer tools to choose the one that fits coding, model access, debugging, and workflow integration best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '开发者工具', en: 'Developer tools' },
    comparisonLabel: { cn: 'AI 开发者工具对比', en: 'AI tools for developers comparison' },
    description: {
      cn: '如果你已经明确自己要的是编码辅助、模型路由、API 工作流或调试支持，这一页会帮你更快把候选工具放在一起看。',
      en: 'If you already know you need coding assistance, model routing, API workflows, or debugging support, this page helps you compare likely candidates side by side.',
    },
    searchQuery: 'developer',
    guideHref: '/guides/ai-tools-for-developers',
    backGuideLabel: { cn: '回到开发者工具指南', en: 'Back to developer tools guide' },
    altBrowseHref: '/explore?search=developer&sort=popular',
    altBrowseLabel: { cn: '浏览更多开发者工具', en: 'Browse more developer tools' },
    breadcrumbLabel: { cn: '开发者工具对比', en: 'Developer tools comparison' },
    compareTitle: { cn: '几款常见开发者工具的快速对照', en: 'A quick side-by-side look at common developer tools' },
    compareSubtitle: { cn: 'Developer', en: 'Developer' },
    tips: {
      cn: [
        '先分清你的主要工作发生在编辑器、API 层还是自动化层。',
        '如果你要团队使用，优先看权限、日志、私有仓库支持和接入维护成本。',
        '如果你会长期依赖它，重点看上下文能力、模型选择和稳定性。',
      ],
      en: [
        'Start with whether your work happens mainly in the editor, the API layer, or the orchestration layer.',
        'For team use, prioritize permissions, logs, private repo support, and maintenance cost.',
        'If you will rely on it long term, focus on context depth, model choice, and stability.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看工作流适配、免费可用性、评分、更新情况和对真实开发流程的帮助程度。',
          en: 'We compare workflow fit, free usability, ratings, freshness, and usefulness in real development work.',
        },
      },
      {
        question: { cn: '为什么单独做开发者工具对比？', en: 'Why compare developer tools separately?' },
        answer: {
          cn: '因为开发者工具的决策重点通常不是“会不会回答”，而是能不能稳定接进编辑器、仓库和产品流程。',
          en: 'Because developer-tool decisions are usually less about answers and more about stable integration into editors, repos, and product workflows.',
        },
      },
    ],
  });

  return ComparisonPage({ ...data, locale });
}
