import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Make 替代方案对比' : 'Make alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Make 的 AI 工具，帮你更快判断可视化编排、自动化和团队工作流该怎么选。'
      : 'Compare AI tools that are commonly used as Make alternatives so you can choose the right fit for visual orchestration, automation, and team workflows.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '自动化工具', en: 'Automation tools' },
    comparisonLabel: { cn: 'Make 替代方案对比', en: 'Make alternatives comparison' },
    description: {
      cn: '如果你已经在比较 Make 这类可视化编排入口，这一页会把常见替代项放在一起看，帮助你判断是要低门槛连接器、复杂流程，还是更开发者友好的自动化工作流。',
      en: 'If you are already comparing Make-style visual orchestration entry points, this page puts the common alternatives side by side so you can decide whether you need low-friction connectors, complex flows, or a more developer-friendly automation workflow.',
    },
    searchQuery: 'automation',
    guideHref: '/guides/ai-tools-for-automation',
    rankingHref: '/best-ai-tools/ai-automation-tools',
    rankingLabel: { cn: '转去自动化榜单页', en: 'Open the automation ranking' },
    backGuideLabel: { cn: '回到自动化工具指南', en: 'Back to automation guide' },
    altBrowseHref: '/explore?search=automation&sort=popular',
    altBrowseLabel: { cn: '浏览更多自动化工具', en: 'Browse more automation tools' },
    breadcrumbLabel: { cn: 'Make 替代方案对比', en: 'Make alternatives comparison' },
    compareTitle: {
      cn: '几款常见 Make 替代项的快速对照',
      en: 'A quick side-by-side look at common Make alternatives',
    },
    compareSubtitle: { cn: 'Make', en: 'Make' },
    preferredToolNames: ['make', 'zapier', 'n8n', 'pipedream'],
    decisionCards: [
      {
        title: { cn: '先看是不是可视化编排', en: 'Visual orchestration first' },
        description: {
          cn: 'Make 的优势通常在于让多步骤流程一眼看得见；如果你要更深的代码化控制，别停在这一层。',
          en: 'Make usually shines by making multi-step workflows easy to visualize; if you need deeper code-level control, keep comparing.',
        },
      },
      {
        title: { cn: '再看是不是要中等复杂度流程', en: 'Medium-complexity flows' },
        description: {
          cn: '如果有分支、过滤、重试和多个系统交接，工具的可读性和维护成本会很重要。',
          en: 'When workflows involve branching, filtering, retries, and handoffs between systems, readability and maintenance cost matter a lot.',
        },
      },
      {
        title: { cn: '最后看是否适合团队长期维护', en: 'Team maintenance' },
        description: {
          cn: '如果别人也要接手，日志、权限、模板和交接体验会决定它能不能长期用。',
          en: 'If other people need to take over, logs, permissions, templates, and handoff experience decide whether it can last.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '需要视觉化流程的人', en: 'People who need visible workflows' },
        description: {
          cn: '适合想把流程画清楚、看清楚、再交给团队执行的人。',
          en: 'A good fit when you want to make workflows obvious and easy for a team to follow.',
        },
      },
      {
        title: { cn: '中等复杂度自动化团队', en: 'Teams with medium-complexity automation' },
        description: {
          cn: '如果你的流程不只是简单触发，但也没到完全代码化，Make 很常见。',
          en: 'Make is often a sweet spot when workflows are more than simple triggers but not fully code-driven.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只做一次性任务的人', en: 'People doing only one-off tasks' },
        description: {
          cn: '如果流程不重复，自动化工具通常投入太大。',
          en: 'If the task will not repeat, automation tools often feel like too much setup.',
        },
      },
      {
        title: { cn: '完全想靠代码控制的人', en: 'People who want full code control' },
        description: {
          cn: '如果你要的是更强 API 或脚本控制，Pipedream 或更开发者导向的工具会更贴近。',
          en: 'If you want stronger API or script control, Pipedream or more developer-oriented tools may fit better.',
        },
      },
    ],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-automation-tools',
        title: { cn: '先看自动化榜单', en: 'Start with the automation ranking' },
        description: {
          cn: '如果你已经确定是在选自动化工具，先用榜单收窄候选。',
          en: 'If automation is already the target, use the ranking first to narrow the candidates.',
        },
      },
      {
        href: '/guides/ai-tools-for-automation-comparison',
        title: { cn: '转去自动化工具总对比', en: 'Go to automation tools comparison' },
        description: {
          cn: '如果你要把候选范围再拉宽一点，这页更适合。',
          en: 'Use this when you want a broader shortlist.',
        },
      },
      {
        href: '/guides/zapier-alternatives-comparison',
        title: { cn: '转去 Zapier 替代方案对比', en: 'Go to Zapier alternatives comparison' },
        description: {
          cn: '如果你更在意低门槛连接器，这条路径更高意图。',
          en: 'A higher-intent path when low-friction connectors are the real need.',
        },
      },
      {
        href: '/guides/n8n-alternatives-comparison',
        title: { cn: '转去 n8n 替代方案对比', en: 'Go to n8n alternatives comparison' },
        description: {
          cn: '如果你后面会走更复杂或更开发者导向的流程，这条路也更顺。',
          en: 'Move here when the workflow is moving toward deeper or more developer-oriented automation.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-automation-comparison',
        title: { cn: '转去自动化工具总对比', en: 'Go to automation tools comparison' },
        description: {
          cn: '如果你要把候选范围再拉宽一点，这页更适合。',
          en: 'Use this when you want a broader shortlist.',
        },
      },
      {
        href: '/guides/zapier-alternatives-comparison',
        title: { cn: '转去 Zapier 替代方案对比', en: 'Go to Zapier alternatives comparison' },
        description: {
          cn: '如果你更在意低门槛连接器，这条路径更高意图。',
          en: 'A higher-intent path when low-friction connectors are the real need.',
        },
      },
      {
        href: '/guides/n8n-alternatives-comparison',
        title: { cn: '转去 n8n 替代方案对比', en: 'Go to n8n alternatives comparison' },
        description: {
          cn: '如果你后面会走更复杂或更开发者导向的流程，这条路也更顺。',
          en: 'Move here when the workflow is moving toward deeper or more developer-oriented automation.',
        },
      },
    ],
    toolSelectionNotes: {
      make: {
        bestFor: {
          cn: '想在可视化编排和中等复杂度流程之间找到平衡的人。',
          en: 'People who want a balance between visual orchestration and medium-complexity workflow control.',
        },
        whyPickIt: {
          cn: '它很适合把多工具流程搭得足够清楚。',
          en: 'It is great for making multi-step flows easy to understand.',
        },
        watchOut: {
          cn: '如果流程非常深、非常定制，后面可能还是会往更开发导向的方向走。',
          en: 'You may still move toward more developer-oriented tooling later if workflows become very deep or custom.',
        },
      },
      zapier: {
        bestFor: {
          cn: '要快速把常见 SaaS 工具连起来、尽快验证自动化价值的团队。',
          en: 'Teams that want to connect common SaaS tools quickly and validate automation value fast.',
        },
        whyPickIt: {
          cn: '它更偏快上手、低门槛和常见场景覆盖。',
          en: 'It leans toward fast onboarding, low friction, and strong common-scenario coverage.',
        },
        watchOut: {
          cn: '如果你后面要做复杂逻辑、细权限或更深的自定义，可能会比较快遇到边界。',
          en: 'You may hit limits relatively quickly once workflows need deeper logic, tighter permissions, or heavier customization.',
        },
      },
      n8n: {
        bestFor: {
          cn: '想做更灵活、更可控、可长期维护流程的个人开发者和团队。',
          en: 'Indie builders and teams that want more flexible, controllable, and maintainable workflows over time.',
        },
        whyPickIt: {
          cn: '它更适合把自动化当成自己的系统一部分来经营。',
          en: 'It fits teams that want automation to become part of their own system rather than a temporary shortcut.',
        },
        watchOut: {
          cn: '如果你只想最快搭一个轻量流程，上手成本可能会比更模板化的工具高一点。',
          en: 'The setup overhead can be a bit higher than more template-first tools when you only need a lightweight workflow quickly.',
        },
      },
      pipedream: {
        bestFor: {
          cn: '既要自动化，又希望保留代码级自定义和 API 灵活性的开发者。',
          en: 'Developers who want automation plus code-level customization and API flexibility.',
        },
        whyPickIt: {
          cn: '它把“工作流编排”和“开发者可编程性”连得比较近。',
          en: 'It brings workflow orchestration and developer programmability closer together.',
        },
        watchOut: {
          cn: '如果使用者主要是非技术团队，维护和交接门槛可能会更高。',
          en: 'The maintenance and handoff cost can be higher when the main operators are non-technical teams.',
        },
      },
    },
    tips: {
      cn: [
        '先判断你是在买可视化编排，还是在买长期可维护的自动化框架。',
        '如果流程会长期跑，日志、权限和失败恢复要提前看。',
        '当流程开始和 AI、API、销售或运营系统联动时，才是真正比较的开始。',
      ],
      en: [
        'First decide whether you need visual orchestration or a maintainable automation framework.',
        'If workflows will run long term, check logs, permissions, and failure recovery early.',
        'The real comparison starts when the workflow has to connect AI, APIs, sales, or operations systems.',
      ],
    },
    faqs: [
      {
        question: { cn: '为什么单独做 Make 替代方案页？', en: 'Why make a separate Make alternatives page?' },
        answer: {
          cn: '因为很多用户已经明确在找可视化自动化和流程编排工具，这类意图很接近转化。',
          en: 'Because many users are explicitly looking for visual automation and workflow-orchestration tools, which is close to conversion intent.',
        },
      },
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看可视化编排、集成范围、维护性、稳定性和真实反馈。',
          en: 'We compare visual orchestration, integration coverage, maintainability, stability, and real feedback.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='make_alternatives_comparison' />
    </>
  );
}
