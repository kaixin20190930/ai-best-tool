import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';
import { Link } from '@/app/navigation';

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
    rankingHref: '/best-ai-tools/ai-automation-tools',
    rankingLabel: { cn: '转去自动化榜单页', en: 'Open the automation ranking' },
    backGuideLabel: { cn: '回到自动化工具指南', en: 'Back to automation guide' },
    altBrowseHref: '/explore?search=automation&sort=popular',
    altBrowseLabel: { cn: '浏览更多自动化工具', en: 'Browse more automation tools' },
    breadcrumbLabel: { cn: '自动化工具对比', en: 'Automation tools comparison' },
    compareTitle: { cn: '几款常见自动化工具的快速对照', en: 'A quick side-by-side look at common automation tools' },
    compareSubtitle: { cn: 'Automation', en: 'Automation' },
    preferredToolNames: ['n8n', 'make', 'zapier', 'pipedream'],
    comparisonDimensions: [
      {
        title: { cn: '集成范围', en: 'Integration coverage' },
        description: {
          cn: '先看它能接多少常见 SaaS、表格、消息与内部系统，不要只看表面数量。',
          en: 'Check how well it connects common SaaS tools, spreadsheets, messaging, and internal systems rather than only counting integrations.',
        },
      },
      {
        title: { cn: '流程复杂度', en: 'Workflow complexity' },
        description: {
          cn: '如果流程有分支、循环、重试和异常处理，优先看可读性和维护成本。',
          en: 'When workflows need branches, loops, retries, and failure handling, readability and maintenance cost matter most.',
        },
      },
      {
        title: { cn: '触发与执行稳定性', en: 'Trigger and execution stability' },
        description: {
          cn: '自动化最怕跑不稳，触发准确率和执行成功率要放在前面看。',
          en: 'Automation fails when it does not run reliably, so trigger accuracy and execution success rate should come first.',
        },
      },
      {
        title: { cn: '可维护性', en: 'Maintainability' },
        description: {
          cn: '如果要长期跑给团队用，权限、日志、版本和交接成本很关键。',
          en: 'If a workflow will run long term for a team, permissions, logs, versioning, and handoff cost are critical.',
        },
      },
    ],
    decisionCards: [
      {
        title: { cn: '先做简单触发器', en: 'Simple triggers first' },
        description: {
          cn: '先看模板、集成范围和上手速度，确保能快速把重复动作连起来。',
          en: 'Start with templates, integration coverage, and setup speed so repeatable actions can be connected quickly.',
        },
      },
      {
        title: { cn: '做复杂编排与异常处理', en: 'Complex orchestration and failure handling' },
        description: {
          cn: '更该看条件分支、重试机制、日志和多人维护时的可读性。',
          en: 'Focus more on branching, retries, logs, and readability when multiple people need to maintain the workflow.',
        },
      },
      {
        title: { cn: '做开发导向自动化', en: 'Developer-oriented automation' },
        description: {
          cn: '如果你的自动化已经深入 API、脚本和后台执行层，自定义能力会比模板更重要。',
          en: 'If your automation already runs deep into APIs, scripts, and backend execution, customization matters more than templates.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '有重复流程的个人与团队', en: 'Individuals and teams with recurring workflows' },
        description: {
          cn: '适合需要把跨工具任务串起来、减少手工操作和稳定交接的人。',
          en: 'Best for people who need to connect cross-tool tasks, reduce manual work, and make handoffs more stable.',
        },
      },
      {
        title: { cn: '准备把 AI 接进运营流程的人', en: 'Teams bringing AI into operational workflows' },
        description: {
          cn: '如果你不只是想试一个 prompt，而是要让流程自动跑起来，这类工具会很关键。',
          en: 'These tools become important once the goal is not only prompting, but making operational workflows run automatically.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只做一次性任务的人', en: 'People doing one-off tasks only' },
        description: {
          cn: '如果流程不会重复发生，自动化工具通常会显得投入大于收益。',
          en: 'Automation tools often feel like more setup than value when the task will not repeat.',
        },
      },
      {
        title: { cn: '还没想清楚流程的人', en: 'People who have not clarified the workflow yet' },
        description: {
          cn: '如果连触发条件、输入和输出都还不稳定，先把流程想清楚会比选工具更重要。',
          en: 'If triggers, inputs, and outputs are still unclear, clarifying the workflow matters more than choosing a tool first.',
        },
      },
    ],
    nextPaths: [
      {
        href: '/guides/ai-tools-for-developers-comparison',
        title: { cn: '转去开发者工具对比', en: 'Go to developer tools comparison' },
        description: {
          cn: '如果你的自动化已经深入 API、模型接入和执行层，这条路径更贴近真实实现。',
          en: 'A better fit when your automation already extends into APIs, model access, and execution infrastructure.',
        },
      },
      {
        href: '/guides/ai-tools-for-api-observability-comparison',
        title: { cn: '转去 API 可观测对比', en: 'Go to API observability comparison' },
        description: {
          cn: '当流程开始稳定跑起来后，日志、成本和失败诊断通常会变成下一层决策。',
          en: 'Once workflows are running continuously, logs, cost visibility, and failure diagnosis usually become the next layer of decisions.',
        },
      },
      {
        href: '/guides/ai-tools-for-research-comparison',
        title: { cn: '转去研究工具对比', en: 'Go to research tools comparison' },
        description: {
          cn: '如果你要自动化的是资料发现、线索整理或情报工作流，这一页也很值得连起来看。',
          en: 'This is also worth pairing when the workflow being automated is around discovery, lead collection, or research operations.',
        },
      },
      {
        href: '/categories/automation?sort=popular',
        title: { cn: '回到 Automation 分类', en: 'Return to the automation category' },
        description: {
          cn: '当你想扩大 shortlist 并回看更多真实条目时，直接回分类页。',
          en: 'Go back to the category when you want a wider shortlist of real listings.',
        },
      },
      {
        href: '/guides/zapier-alternatives-comparison',
        title: { cn: '转去 Zapier 替代方案对比', en: 'Go to Zapier alternatives comparison' },
        description: {
          cn: '如果你的重点已经变成连接器和流程编排，这条路径更高意图。',
          en: 'A higher-intent path once connectors and workflow orchestration are the real focus.',
        },
      },
      {
        href: '/guides/make-alternatives-comparison',
        title: { cn: '转去 Make 替代方案对比', en: 'Go to Make alternatives comparison' },
        description: {
          cn: '如果你更在意可视化编排和中等复杂度流程，这条路径更贴近。',
          en: 'A better fit when visual orchestration and medium-complexity workflows are the real need.',
        },
      },
      {
        href: '/guides/n8n-alternatives-comparison',
        title: { cn: '转去 n8n 替代方案对比', en: 'Go to n8n alternatives comparison' },
        description: {
          cn: '如果你的目标更偏可控、可自建和开发者导向，这条路径更高意图。',
          en: 'A higher-intent path when control, self-hosting, and developer-oriented workflows matter most.',
        },
      },
    ],
    toolSelectionNotes: {
      n8n: {
        bestFor: {
          cn: '想做更灵活、更可控、可长期维护流程的个人开发者和团队。',
          en: 'Indie builders and teams that want more flexible, controllable, and maintainable workflows over time.',
        },
        whyPickIt: {
          cn: '它更适合把自动化当成自己的系统一部分来经营，而不只是临时连几个步骤。',
          en: 'It fits teams that want automation to become part of their own system rather than a temporary shortcut.',
        },
        watchOut: {
          cn: '如果你只想最快搭一个轻量流程，上手成本可能会比更模板化的工具高一点。',
          en: 'The setup overhead can be a bit higher than more template-first tools when you only need a lightweight workflow quickly.',
        },
      },
      make: {
        bestFor: {
          cn: '想在可视化编排和中等复杂度流程之间找到平衡的人。',
          en: 'People who want a balance between visual orchestration and medium-complexity workflow control.',
        },
        whyPickIt: {
          cn: '它很适合把多工具流程搭得足够清楚，又不至于马上走进太重的工程化。',
          en: 'It is great for building multi-step flows clearly without immediately moving into a heavier engineering mindset.',
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
          cn: '它更偏快上手、低门槛和常见场景覆盖，适合把“能不能跑通”先验证出来。',
          en: 'It leans toward fast onboarding, low friction, and strong common-scenario coverage, which is ideal for proving a workflow first.',
        },
        watchOut: {
          cn: '如果你后面要做复杂逻辑、细权限或更深的自定义，可能会比较快遇到边界。',
          en: 'You may hit limits relatively quickly once workflows need deeper logic, tighter permissions, or heavier customization.',
        },
      },
      pipedream: {
        bestFor: {
          cn: '既要自动化，又希望保留代码级自定义和 API 灵活性的开发者。',
          en: 'Developers who want automation plus code-level customization and API flexibility.',
        },
        whyPickIt: {
          cn: '它把“工作流编排”和“开发者可编程性”连得比较近，适合技术导向的自动化。',
          en: 'It brings workflow orchestration and developer programmability closer together, which fits more technical automations.',
        },
        watchOut: {
          cn: '如果使用者主要是非技术团队，维护和交接门槛可能会更高。',
          en: 'The maintenance and handoff cost can be higher when the main operators are non-technical teams.',
        },
      },
    },
    tips: {
      cn: [
        '先看你做的是简单触发器、复杂编排，还是带 AI 与 API 的后台流程。',
        '如果流程需要长期跑，优先看失败恢复、日志、权限和团队可维护性。',
        '更看重扩展性时，重点看集成范围、API 能力和自定义空间。',
      ],
      en: [
        'Start with whether you need simple triggers, complex orchestration, or AI-enabled backend workflows.',
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

  const quickStarts = [
    {
      href: '/best-ai-tools/ai-automation-tools',
      title: locale === 'cn' || locale === 'tw' ? '自动化榜单' : 'Automation ranking',
      desc:
        locale === 'cn' || locale === 'tw'
          ? '先看 shortlist，再回比较页。'
          : 'Start with the shortlist, then come back to compare.',
    },
    {
      href: '/guides/ai-tools-for-automation',
      title: locale === 'cn' || locale === 'tw' ? '自动化指南' : 'Automation guide',
      desc:
        locale === 'cn' || locale === 'tw'
          ? '重新确认是触发器、编排还是维护。'
          : 'Re-check whether the task is triggers, orchestration, or maintainability.',
    },
    {
      href: '/ai/n8n',
      title: 'n8n',
      desc:
        locale === 'cn' || locale === 'tw' ? '更适合可视化和自托管。' : 'Good for visual and self-hosted automation.',
    },
    {
      href: '/ai/pipedream',
      title: 'Pipedream',
      desc:
        locale === 'cn' || locale === 'tw'
          ? '适合 API 驱动和开发者工作流。'
          : 'Useful for API-driven developer workflows.',
    },
  ];

  return (
    <>
      <section className='mx-auto mt-8 max-w-6xl rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:px-8 lg:py-8'>
        <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
          {locale === 'cn' || locale === 'tw' ? '先看这些入口' : 'Start here'}
        </p>
        <h2 className='mt-1 text-2xl font-bold text-slate-950'>
          {locale === 'cn' || locale === 'tw'
            ? '从榜单、指南和代表工具开始收窄'
            : 'Narrow from ranking, guide, and representative tools'}
        </h2>
        <div className='mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
          {quickStarts.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className='rounded-xl border border-white bg-white p-4 shadow-sm transition hover:bg-slate-50'
            >
              <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
              <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_automation_comparison' />
    </>
  );
}
