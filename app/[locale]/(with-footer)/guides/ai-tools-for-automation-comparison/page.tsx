import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'AI 自动化工具对比' : 'AI tools for automation comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款常见的 AI 自动化工具，帮你更快选出适合流程编排、重复任务和跨工具联动的一个。'
      : 'Compare common AI automation tools to choose the one that fits orchestration, repeatable tasks, and cross-tool workflows best.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '自动化工具', en: 'Automation tools' },
    comparisonLabel: { cn: 'AI 自动化工具对比', en: 'AI tools for automation comparison' },
    description: {
      cn: '如果你已经知道自己要做流程编排、后台任务或跨工具自动化，这一页会帮你把几款常见工具放在一起看。',
      en: 'If you already know you need orchestration, back-office tasks, or cross-tool automation, this page helps you compare a few common tools side by side.',
    },
    searchQuery: 'automation',
    guideHref: '/guides/ai-tools-for-automation',
    backGuideLabel: { cn: '回到自动化工具指南', en: 'Back to automation guide' },
    altBrowseHref: '/explore?search=automation&sort=popular',
    altBrowseLabel: { cn: '浏览更多自动化工具', en: 'Browse more automation tools' },
    breadcrumbLabel: { cn: '自动化工具对比', en: 'Automation tools comparison' },
    compareTitle: { cn: '几款常见自动化工具的快速对照', en: 'A quick side-by-side look at common automation tools' },
    compareSubtitle: { cn: 'Automation', en: 'Automation' },
    preferredToolNames: ['n8n', 'make', 'zapier', 'pipedream'],
    tips: {
      cn: [
        '先看你做的是简单触发器、复杂编排还是持续运行的后台流程。',
        '如果流程需要长期跑，优先看失败恢复、日志、权限和团队可维护性。',
        '更看重扩展性时，重点看集成范围、API 能力和自定义空间。',
      ],
      en: [
        'Start with whether you need simple triggers, complex orchestration, or long-running back-office flows.',
        'If workflows need to run continuously, prioritize retries, logs, permissions, and maintainability.',
        'For extensibility, focus on integrations, API support, and room for customization.',
      ],
    },
    faqs: [
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看流程适配、免费可用性、评分、更新情况和对真实自动化场景的帮助程度。',
          en: 'We compare workflow fit, free usability, ratings, freshness, and usefulness in real automation scenarios.',
        },
      },
      {
        question: { cn: '为什么自动化工具要单独比较？', en: 'Why compare automation tools separately?' },
        answer: {
          cn: '因为自动化工具更看重稳定运行、可维护性和流程透明度，而不只是单步结果是否聪明。',
          en: 'Because automation tools are judged more by reliability, maintainability, and workflow visibility than by a single clever output.',
        },
      },
    ],
  });

  return ComparisonPage({ ...data, locale });
}
