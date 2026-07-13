import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';

import { buildComparisonMetadata, buildComparisonPageData, ComparisonPage } from '../comparison-template';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return buildComparisonMetadata(
    locale,
    locale === 'cn' || locale === 'tw' ? 'Zapier 替代方案对比' : 'Zapier alternatives comparison',
    locale === 'cn' || locale === 'tw'
      ? '对比几款更常被拿来替代 Zapier 的 AI 工具，帮你更快判断自动化、连接器和工作流编排该怎么选。'
      : 'Compare AI tools that are commonly used as Zapier alternatives so you can choose the right fit for automation, connectors, and workflow orchestration.',
  );
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const data = await buildComparisonPageData(locale, {
    categoryLabel: { cn: '自动化工具', en: 'Automation tools' },
    comparisonLabel: { cn: 'Zapier 替代方案对比', en: 'Zapier alternatives comparison' },
    description: {
      cn: '如果你已经在比较 Zapier 这类自动化入口，这一页会把常见替代项放在一起看，帮助你判断是要简单连接器、复杂编排，还是更开发者友好的自动化工作流。',
      en: 'If you are already comparing Zapier-style automation entry points, this page puts the common alternatives side by side so you can decide whether you need simple connectors, complex orchestration, or a more developer-friendly automation workflow.',
    },
    searchQuery: 'automation',
    guideHref: '/guides/ai-tools-for-automation',
    rankingHref: '/best-ai-tools/ai-automation-tools',
    rankingLabel: { cn: '转去自动化榜单页', en: 'Open the automation ranking' },
    backGuideLabel: { cn: '回到自动化工具指南', en: 'Back to automation guide' },
    altBrowseHref: '/explore?search=automation&sort=popular',
    altBrowseLabel: { cn: '浏览更多自动化工具', en: 'Browse more automation tools' },
    breadcrumbLabel: { cn: 'Zapier 替代方案对比', en: 'Zapier alternatives comparison' },
    compareTitle: {
      cn: '几款常见 Zapier 替代项的快速对照',
      en: 'A quick side-by-side look at common Zapier alternatives',
    },
    compareSubtitle: { cn: 'Zapier', en: 'Zapier' },
    preferredToolNames: ['zapier', 'make', 'n8n', 'pipedream'],
    highIntentPaths: [
      {
        href: '/best-ai-tools/ai-automation-tools',
        title: { cn: '先看自动化榜单', en: 'Start with the automation ranking' },
        description: {
          cn: '如果你已经确定要做自动化选型，先用榜单收口。',
          en: 'If automation selection is already the goal, use the ranking to narrow things down first.',
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
        href: '/guides/n8n-alternatives-comparison',
        title: { cn: '转去 n8n 替代方案对比', en: 'Go to n8n alternatives comparison' },
        description: {
          cn: '如果你更在意控制感和长期维护，这条路径更高意图。',
          en: 'A higher-intent path when control and long-term maintenance matter more.',
        },
      },
      {
        href: '/guides/make-alternatives-comparison',
        title: { cn: '转去 Make 替代方案对比', en: 'Go to Make alternatives comparison' },
        description: {
          cn: '如果你更想看可视化编排和中等复杂度流程，这页更贴近。',
          en: 'Move here if visual orchestration and medium-complexity workflows are the real need.',
        },
      },
    ],
    decisionCards: [
      {
        title: { cn: '先看是不是简单连接器', en: 'Simple connectors first' },
        description: {
          cn: 'Zapier 的吸引力通常在于简单、快和覆盖面广；如果你要的是更深的逻辑，可能要再比较。',
          en: 'Zapier usually wins on simplicity, speed, and broad coverage; if you need deeper logic, keep comparing.',
        },
      },
      {
        title: { cn: '再看是不是要复杂编排', en: 'Complex orchestration' },
        description: {
          cn: '如果流程里有分支、重试、异常处理和多步骤协调，维护性会比模板数量更重要。',
          en: 'When workflows need branching, retries, failure handling, and coordination, maintainability matters more than template count.',
        },
      },
      {
        title: { cn: '最后看是否适合长期跑团队流程', en: 'Team workflow durability' },
        description: {
          cn: '长期自动化要看日志、权限、交接和可观测性，不然很快就会变成“只有一个人会修”。',
          en: 'Long-running automation needs logs, permissions, handoff, and observability, or it quickly becomes something only one person can fix.',
        },
      },
    ],
    fitFor: [
      {
        title: { cn: '需要尽快跑通流程的人', en: 'People who need to get workflows running fast' },
        description: {
          cn: '适合先验证“能不能连起来”，再去考虑更复杂的维护问题。',
          en: 'A good fit when the first question is whether the workflow can run at all, before worrying about deeper maintenance.',
        },
      },
      {
        title: { cn: '准备把 AI 接进运营的人', en: 'Teams bringing AI into operations' },
        description: {
          cn: '如果你的流程已经开始触及后端、表格、消息或销售系统，这页会很实用。',
          en: 'Useful when workflows reach backend systems, spreadsheets, messaging, or sales tools.',
        },
      },
    ],
    notFor: [
      {
        title: { cn: '只做一次性小任务的人', en: 'People doing only one-off small tasks' },
        description: {
          cn: '如果流程不会重复，自动化工具通常投入会偏大。',
          en: 'If the task will not repeat, automation tools often feel too expensive in setup time.',
        },
      },
      {
        title: { cn: '还没定流程的人', en: 'People who have not defined the workflow yet' },
        description: {
          cn: '如果触发条件和输入输出还不稳定，先把流程想清楚更重要。',
          en: 'If triggers and inputs/outputs are still unclear, clarifying the workflow comes first.',
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
        href: '/guides/ai-tools-for-developers-comparison',
        title: { cn: '转去开发者工具对比', en: 'Go to developer tools comparison' },
        description: {
          cn: '如果你已经在考虑 API、自定义和代码化工作流，这条路径更贴近。',
          en: 'Move here if APIs, customization, and code-like workflows are the real focus.',
        },
      },
      {
        href: '/guides/ai-tools-for-sales-comparison',
        title: { cn: '转去销售工具对比', en: 'Go to sales tools comparison' },
        description: {
          cn: '如果自动化的终点是销售跟进和 CRM，这页也很顺。',
          en: 'A good next stop if automation is really feeding sales follow-up and CRM.',
        },
      },
      {
        href: '/guides/n8n-alternatives-comparison',
        title: { cn: '转去 n8n 替代方案对比', en: 'Go to n8n alternatives comparison' },
        description: {
          cn: '如果你发现自己要的是更可控、更偏底座的工作流，这页更贴近。',
          en: 'Move here when the workflow is becoming more controllable and infrastructure-like.',
        },
      },
    ],
    toolSelectionNotes: {
      zapier: {
        bestFor: {
          cn: '想快速把常见 SaaS 工具连起来、尽快验证自动化价值的团队。',
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
        '先判断你是在买连接器，还是在买可维护的工作流引擎。',
        '如果流程会长期跑，日志、权限和失败恢复要提前看。',
        '当流程开始和 AI、API、销售或运营系统联动时，才是真正比较的开始。',
      ],
      en: [
        'First decide whether you need connectors or a maintainable workflow engine.',
        'If workflows will run long term, check logs, permissions, and failure recovery early.',
        'The real comparison starts when the workflow has to connect AI, APIs, sales, or operations systems.',
      ],
    },
    faqs: [
      {
        question: { cn: '为什么单独做 Zapier 替代方案页？', en: 'Why make a separate Zapier alternatives page?' },
        answer: {
          cn: '因为很多用户已经明确在找自动化和工作流编排工具，这类意图很接近转化。',
          en: 'Because many users are explicitly looking for automation and workflow-orchestration tools, which is close to conversion intent.',
        },
      },
      {
        question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
        answer: {
          cn: '我们主要看集成范围、编排复杂度、稳定性、可维护性和真实反馈。',
          en: 'We compare integration coverage, orchestration complexity, stability, maintainability, and real feedback.',
        },
      },
    ],
  });

  return (
    <>
      {ComparisonPage({ ...data, locale })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? '这页先看真实可验证的 Zapier 替代信号，再继续判断是否需要连接器、编排和长期维护。'
            : 'This page looks at verifiable Zapier-alternative signals first, then helps you decide whether connectors, orchestration, and long-term maintenance are needed.'
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '连接器覆盖' : 'Connector coverage',
            value:
              locale === 'cn' || locale === 'tw' ? '常见 SaaS 是否够用' : 'Are common SaaS integrations sufficient',
            note:
              locale === 'cn' || locale === 'tw'
                ? 'Zapier 的核心是“快连起来”，先看覆盖面够不够。'
                : 'Zapier-like value starts with whether the integration coverage is enough.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '编排复杂度' : 'Orchestration complexity',
            value: locale === 'cn' || locale === 'tw' ? '分支和重试是否稳' : 'Are branches and retries stable',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果流程有复杂逻辑，维护性会比模板更重要。'
                : 'If the workflow gets complex, maintainability matters more than templates.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '长期维护' : 'Long-term maintenance',
            value: locale === 'cn' || locale === 'tw' ? '团队能否接手' : 'Can a team maintain it',
            note:
              locale === 'cn' || locale === 'tw'
                ? '长期自动化不是搭出来就完，后续维护才是关键。'
                : 'Long-term automation is about maintainability after setup, not just launch.',
          },
        ]}
      />
      <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '最近验证' : 'Last checked'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-14</p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '这页已按真实 Zapier 替代路径重新核对，保留连接器、编排和维护入口。'
              : 'This page has been rechecked against a real Zapier-alternative workflow and keeps connectors, orchestration, and maintenance entry points visible.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '保留索引，补真实替代证据'
              : 'Keep it indexable and add real alternative evidence'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '用连接器、编排和真人评论把它和泛自动化页区分开。'
              : 'Use connectors, orchestration, and real comments to differentiate it from generic automation pages.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '补真实替代场景和反馈'
              : 'Add real alternative scenarios and feedback'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '后续优先补案例、编排样例和真人评论。'
              : 'Next, prioritize cases, orchestration examples, and real comments.'}
          </p>
        </div>
      </section>
      <section className='mx-auto mt-8 max-w-6xl px-4 lg:px-6'>
        <div className='rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '先看榜单，再决定是继续看 Zapier 替代还是切到相邻入口'
              : 'Start with the ranking, then decide whether to keep comparing Zapier alternatives or switch to an adjacent path'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '如果你已经明确要做自动化和工作流编排，先收紧 shortlist 往往比继续横向浏览更有效。'
              : 'If automation and workflow orchestration are already the goal, narrowing the shortlist first is usually better than continuing to browse horizontally.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-automation-tools',
                title: locale === 'cn' || locale === 'tw' ? '自动化榜单' : 'Automation ranking',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '先收窄到更值得试用的自动化候选。'
                    : 'Narrow to the most trial-worthy automation candidates first.',
              },
              {
                href: '/guides/ai-tools-for-automation-comparison',
                title: locale === 'cn' || locale === 'tw' ? '自动化工具对比' : 'Automation tools comparison',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你想把触发器、编排和维护一起看。'
                    : 'Useful when triggers, orchestration, and maintenance should be compared together.',
              },
              {
                href: '/guides/make-alternatives-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'Make 替代方案' : 'Make alternatives',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你更偏可视化编排。'
                    : 'A better path when visual orchestration is the real need.',
              },
              {
                href: '/guides/n8n-alternatives-comparison',
                title: locale === 'cn' || locale === 'tw' ? 'n8n 替代方案' : 'n8n alternatives',
                desc:
                  locale === 'cn' || locale === 'tw'
                    ? '如果你更需要灵活和可扩展的工作流。'
                    : 'Useful when you need more flexible and extensible workflows.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`zapier_ranking_${item.href.split('/').pop()}`}
                ctaLabel={item.title}
                pageType='guide'
                className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
              </TrackableCtaLink>
            ))}
          </div>
        </div>
      </section>
      <GuideSubmissionPath locale={locale} ctaPrefix='zapier_alternatives_comparison' />
    </>
  );
}
