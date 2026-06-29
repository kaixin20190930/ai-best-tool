import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'n8n 替代方案对比' : 'n8n alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 n8n 的 AI 工具，帮你更快判断自动化、可控性和开发者工作流该怎么选。'
      : 'Compare AI tools that are commonly used as n8n alternatives so you can choose the right fit for automation, control, and developer workflows.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '自动化工具', en: 'Automation tools' },
    comparisonLabel: { cn: 'n8n 替代方案对比', en: 'n8n alternatives comparison' },
    description: {
      cn: '如果你已经在比较 n8n 这类更可控、更偏自建的自动化入口，这一页会把常见替代项放在一起看，帮助你判断是要图形化编排、快速连接器，还是更开发者友好的工作流底座。',
      en: 'If you are already comparing n8n-style automation entry points, this page puts the common alternatives side by side so you can decide whether you need visual orchestration, quick connectors, or a more developer-friendly workflow base.',
    },
    searchQuery: 'automation',
    guideHref: '/guides/ai-tools-for-automation',
    rankingHref: '/best-ai-tools/ai-automation-tools',
    rankingLabel: { cn: '转去自动化榜单页', en: 'Open the automation ranking' },
    backGuideLabel: { cn: '回到自动化工具指南', en: 'Back to automation guide' },
    altBrowseHref: '/explore?search=automation&sort=popular',
    altBrowseLabel: { cn: '浏览更多自动化工具', en: 'Browse more automation tools' },
    breadcrumbLabel: { cn: 'n8n 替代方案对比', en: 'n8n alternatives comparison' },
    compareTitle: {
      cn: '几款常见 n8n 替代项的快速对照',
      en: 'A quick side-by-side look at common n8n alternatives',
    },
    compareSubtitle: { cn: 'n8n', en: 'n8n' },
    preferredToolNames: ['n8n', 'make', 'zapier', 'pipedream'],
    decisionCards: [
      {
        title: { cn: '先看是不是可控的工作流底座', en: 'Controlled workflow base first' },
        description: {
          cn: 'n8n 的吸引力通常在于更强的控制感和更接近自建系统；如果你只想快连几个 SaaS，别停在这一层。',
          en: 'n8n usually appeals because it feels more controllable and closer to a self-built system; if you only want to connect a few SaaS tools quickly, keep comparing.',
        },
      },
      {
        title: { cn: '再看是不是要代码级灵活性', en: 'Code-level flexibility' },
        description: {
          cn: '如果流程里要接 API、脚本、分支和更复杂的处理逻辑，开发者可控性会变得更重要。',
          en: 'When workflows need APIs, scripts, branches, and more complex handling, developer control becomes much more important.',
        },
      },
      {
        title: { cn: '最后看是否适合团队长期维护', en: 'Team maintenance over time' },
        description: {
          cn: '长期自动化要看日志、权限、交接和可观测性，不然最后还是会卡在“只有一个人会修”。',
          en: 'Long-running automation needs logs, permissions, handoff, and observability, or it ends up being something only one person can fix.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '想把自动化长期经营起来的人', en: 'People who want automation to be durable' },
        description: {
          cn: '适合希望把流程沉淀成可维护基础设施的个人开发者和团队。',
          en: 'A good fit for indie builders and teams that want workflows to become maintainable infrastructure.',
        },
      },
      {
        title: { cn: '准备接入 API 和内部系统的人', en: 'Teams integrating APIs and internal systems' },
        description: {
          cn: '如果自动化已经不只是模板，而是要真正进入系统层，这类工具会更关键。',
          en: 'These tools matter once automation goes beyond templates and starts living inside real systems.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只做一次性任务的人', en: 'People doing one-off tasks only' },
        description: {
          cn: '如果流程不会重复，自动化工具通常投入太大。',
          en: 'If the task will not repeat, automation tools often feel like too much setup.',
        },
      },
      {
        title: { cn: '只想最快跑通的人', en: 'People who only want the fastest possible setup' },
        description: {
          cn: '如果你更看重立即上手，Zapier 类工具通常更轻。',
          en: 'If immediate onboarding matters most, Zapier-style tools usually feel lighter.',
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
        href: '/guides/make-alternatives-comparison',
        title: { cn: '转去 Make 替代方案对比', en: 'Go to Make alternatives comparison' },
        description: {
          cn: '如果你更在意可视化编排和中等复杂度流程，这条路径更贴近。',
          en: 'A better fit when visual orchestration and medium-complexity workflows are the real need.',
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
          cn: '它更适合把自动化当成自己的系统一部分来经营。',
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
          cn: '它更偏快上手、低门槛和常见场景覆盖。',
          en: 'It leans toward fast onboarding, low friction, and strong common-scenario coverage.',
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
        '先判断你是在买可控的工作流底座，还是在买最快上手的连接器。',
        '如果流程会长期跑，日志、权限和失败恢复要提前看。',
        '当流程开始和 AI、API、销售或运营系统联动时，才是真正比较的开始。',
      ],
      en: [
        'First decide whether you need a controllable workflow base or the fastest possible connector.',
        'If workflows will run long term, check logs, permissions, and failure recovery early.',
        'The real comparison starts when the workflow has to connect AI, APIs, sales, or operations systems.',
      ],
    },
    faqs: [
      {
        question: { cn: '为什么单独做 n8n 替代方案页？', en: 'Why make a separate n8n alternatives page?' },
        answer: {
          cn: '因为很多用户已经明确在找更可控、更偏工作流底座的自动化工具，这类意图很接近转化。',
          en: 'Because many users are explicitly looking for more controllable automation tools with workflow-base behavior, which is close to conversion intent.',
        },
      },
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看控制感、编排复杂度、稳定性、可维护性和真实反馈。',
          en: 'We compare control, orchestration complexity, stability, maintainability, and real feedback.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideSubmissionPath locale={locale} ctaPrefix='n8n_alternatives_comparison' />
    </>
  );
}
