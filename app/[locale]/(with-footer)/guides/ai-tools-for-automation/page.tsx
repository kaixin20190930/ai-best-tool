import { Metadata } from 'next';
import { Bot, ExternalLink, RefreshCw, Workflow } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideActionSection from '@/components/guides/GuideActionSection';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import { Link } from '@/app/navigation';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return {
    title:
      locale === 'cn' || locale === 'tw'
        ? 'AI 自动化工具推荐 | AI Best Tool'
        : `AI tools for automation | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向工作流编排、Agent 任务、重复流程和跨工具自动化的 AI 工具指南，先看榜单再进对比页。'
        : 'A practical guide to AI tools for workflow orchestration, agent tasks, repeatable processes, and cross-tool automation, with a path from guide to ranking and comparison.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const checkedAt = '2026-07-15';
  const categoryCount = categories.length;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
    { name: isChinese ? '自动化工具' : 'Automation tools', url: `${siteUrl}/${locale}/guides/ai-tools-for-automation` },
  ]);
  const faqs = [
    {
      question: isChinese ? 'AI 自动化工具最适合做什么？' : 'What are AI automation tools best for?',
      answer: isChinese
        ? '最适合做重复流程、跨工具同步、后台任务、线索流转、Agent 编排和团队运营自动化。'
        : 'They are best for repeatable workflows, cross-tool sync, back-office tasks, lead routing, agent orchestration, and operational automation.',
    },
    {
      question: isChinese
        ? '自动化工具和开发者工具有什么区别？'
        : 'How are automation tools different from developer tools?',
      answer: isChinese
        ? '自动化工具更强调流程串联、触发条件和任务落地；开发者工具更强调模型接入、代码和基础设施。'
        : 'Automation tools focus on chaining workflows, triggers, and execution, while developer tools focus more on code, model access, and infrastructure.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看你的流程是不是会重复发生，再看集成范围、触发逻辑、异常处理和团队可维护性。'
        : 'Start with whether the workflow repeats, then check integrations, trigger logic, error handling, and team maintainability.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Is a free tier enough?',
      answer: isChinese
        ? '适合试流程，但如果涉及高频运行、多人协作或生产流程，通常会较快碰到执行次数和权限限制。'
        : 'Free tiers can be fine for testing, but high-frequency runs, team use, and production workflows usually hit execution and permission limits quickly.',
    },
  ];
  const tips = isChinese
    ? [
        '先分清你是在做简单触发器、复杂编排，还是 Agent 式后台流程。',
        '重点看集成范围、触发条件、失败重试和日志能力。',
        '如果团队会长期维护，优先看可读性、权限和流程可交接性。',
      ]
    : [
        'Separate simple triggers, complex orchestration, and agent-style back-office flows before comparing tools.',
        'Focus on integrations, trigger logic, retries, and logging.',
        'For long-term team use, prioritize readability, permissions, and handoff-friendly workflows.',
      ];
  const quickStarts = [
    {
      href: '/best-ai-tools/ai-automation-tools',
      title: isChinese ? '自动化榜单' : 'Automation ranking',
      desc: isChinese ? '先看 shortlist，再进更细对比。' : 'Start with the shortlist before deeper comparison.',
    },
    {
      href: '/guides/ai-tools-for-automation-comparison',
      title: isChinese ? '自动化对比页' : 'Automation comparison',
      desc: isChinese ? '触发器、编排和长期维护。' : 'Triggers, orchestration, and long-term maintenance.',
    },
    {
      href: '/ai/n8n',
      title: 'n8n',
      desc: isChinese ? '更适合可视化和自托管。' : 'Good for visual and self-hosted automation.',
    },
    {
      href: '/ai/pipedream',
      title: 'Pipedream',
      desc: isChinese ? '适合 API 驱动和开发者工作流。' : 'Useful for API-driven developer workflows.',
    },
  ];
  const highIntentPaths = [
    {
      href: '/best-ai-tools/ai-automation-tools',
      title: isChinese ? '先看自动化榜单' : 'Start with automation ranking',
      desc: isChinese ? '先用 shortlist 缩小范围。' : 'Use the shortlist to narrow the field first.',
    },
    {
      href: '/guides/ai-tools-for-automation-comparison',
      title: isChinese ? '自动化工具对比' : 'Automation tools comparison',
      desc: isChinese ? '触发器、编排和维护一起看。' : 'Compare triggers, orchestration, and maintenance together.',
    },
    {
      href: '/guides/ai-tools-for-developers-comparison',
      title: isChinese ? '开发者工具对比' : 'Developer tools comparison',
      desc: isChinese ? '如果要把自动化和开发流程放一起看。' : 'Use this when automation and development overlap.',
    },
    {
      href: '/guides/ai-tools-for-api-observability-comparison',
      title: isChinese ? 'API 可观测对比' : 'API observability comparison',
      desc: isChinese ? '日志、成本和异常处理。' : 'Logs, cost, and exception handling.',
    },
  ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={generateFAQSchema(faqs)} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Workflow className='size-4' />
              {isChinese ? '自动化工具推荐' : 'Automation tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Bot className='size-4' />
              {isChinese ? '工作流优先' : 'Workflow-first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 自动化工具推荐：怎么选更适合你的重复流程'
              : 'AI tools for automation: how to choose for repeatable workflows'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '自动化工具的重点，不只是“能不能连起来”，而是能不能稳定跑、方便维护，并且在流程出错时可观察、可修复。'
              : 'Automation tools are not only about whether they connect steps. The real question is whether they run reliably, stay maintainable, and remain observable when something breaks.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=automation&sort=popular'
              ctaId='automation_guide_browse_tools'
              ctaLabel='Automation guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看自动化工具' : 'Browse automation tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-developers'
              ctaId='automation_guide_developers'
              ctaLabel='Automation guide developers'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看开发者工具' : 'Developer tools'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-coding-tools'
              ctaId='automation_guide_coding'
              ctaLabel='Automation guide coding'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看编程工具' : 'Coding tools'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-automation-tools'
              ctaId='automation_guide_top_list'
              ctaLabel='Automation guide top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看自动化榜单' : 'Open automation ranking'}
            </TrackableCtaLink>
          </div>
        </section>

        <GuideEvidencePanel
          locale={locale}
          checkedAt={checkedAt}
          scope={
            isChinese
              ? '这页优先判断自动化工具是否真的能稳定跑流程、可追踪、可维护，而不是只会把步骤串起来。'
              : 'This page checks whether an automation tool can truly run workflows reliably, stay traceable, and remain maintainable rather than merely chaining steps together.'
          }
          signalCards={[
            {
              label: isChinese ? '价格信号' : 'Pricing signal',
              value: isChinese ? '先看执行额度和席位' : 'Check execution limits and seats',
              note: isChinese
                ? '自动化工具很容易在任务次数、席位和连接器上分层。'
                : 'Automation tools often tier by run count, seats, and connectors.',
            },
            {
              label: isChinese ? '更新信号' : 'Freshness signal',
              value: isChinese ? '看连接器和模板是否还在更新' : 'See whether connectors and templates still update',
              note: isChinese
                ? '如果模板不动了，自动化很快会落后业务变化。'
                : 'If templates stop evolving, automation quickly lags behind business changes.',
            },
            {
              label: isChinese ? '风险信号' : 'Risk signal',
              value: isChinese ? '只串步骤不等于可维护' : 'Chaining steps is not the same as maintainable',
              note: isChinese
                ? '如果没有重试、日志和交接案例，先不要把它当主流程。'
                : 'If there are no retries, logs, or handoff cases, do not make it your main flow yet.',
            },
          ]}
          items={[
            {
              label: isChinese ? '验证范围' : 'Checked scope',
              value: isChinese ? '触发器、编排、重试、日志' : 'Triggers, orchestration, retries, logging',
              note: isChinese
                ? `重点不是能不能连，而是能不能长期跑。当前可用分类数：${categoryCount}。`
                : `The question is not only whether it connects, but whether it can run long term. Current category count: ${categoryCount}.`,
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '保留索引，接榜单和对比页' : 'Indexable with ranking and comparison paths',
              note: isChinese
                ? '它会把用户继续引到更窄的自动化入口。'
                : 'It routes users into narrower automation entry points.',
            },
            {
              label: isChinese ? '下一步增强' : 'Next enrichment',
              value: isChinese
                ? '补流程案例、失败模式和真实配置'
                : 'Add workflow examples, failure modes, and real configs',
              note: isChinese
                ? `把抽象流程变成可验证的内容，并在 ${checkedAt} 之后继续补真实配置。`
                : `Turn abstract workflows into verifiable content and keep adding real configs after ${checkedAt}.`,
            },
          ]}
          decisionSteps={[
            isChinese
              ? '先判断你要的是简单连线还是长期可维护流程。'
              : 'First decide whether you need a simple link or a maintainable long-term flow.',
            isChinese
              ? '如果已经是流程问题，就先去对应自动化对比页。'
              : 'If it is already a workflow problem, go to the matching automation comparison page first.',
            isChinese
              ? '如果要团队跑起来，再回来补重试、日志和交接配置。'
              : 'If the team needs to operate it, come back for retries, logs, and handoff configuration.',
          ]}
        />

        <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '最近验证' : 'Last checked'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>{checkedAt}</p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? `自动化入口已与榜单、对比页和真实条目收口，目前覆盖 ${categoryCount} 个分类。`
                : `The automation entry now aligns with ranking, comparison, and real listings across ${categoryCount} categories.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-700'>
              {isChinese
                ? '保留索引，继续补真实流程、失败模式和配置样例。'
                : 'Keep indexable and continue adding real workflows, failure modes, and config examples.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-700'>
              {isChinese
                ? `补一个真实自动化配置案例，并持续保留 ${checkedAt} 的核对记录。`
                : `Add one real automation configuration case while keeping the ${checkedAt} verification record.`}
            </p>
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图路径' : 'High-intent path'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '先看榜单，再进入对比页和真实条目'
              : 'Start with the ranking, then move into comparison and real listings'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经明确自己要解决的是重复流程、触发器或后台任务，就不要停在总览页，直接进入更窄的筛选路径。'
              : 'If the job is clearly repeatable workflows, triggers, or back-office runs, move straight into narrower selection paths.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-automation-tools',
                title: isChinese ? '自动化工具榜单' : 'Automation ranking',
                desc: isChinese ? '直接看高意图 shortlist。' : 'Go straight to the high-intent shortlist.',
              },
              {
                href: '/guides/ai-tools-for-automation-comparison',
                title: isChinese ? '自动化工具对比' : 'Automation comparison',
                desc: isChinese
                  ? '横向看触发、编排和维护。'
                  : 'Compare triggers, orchestration, and maintainability side by side.',
              },
              {
                href: '/guides/ai-tools-for-developers-comparison',
                title: isChinese ? '开发者工具对比' : 'Developer tools comparison',
                desc: isChinese
                  ? '如果流程已深入 API 和工程层。'
                  : 'Better when workflows reach APIs and engineering layers.',
              },
              {
                href: '/guides/ai-tools-for-api-observability-comparison',
                title: isChinese ? 'API 可观测对比' : 'API observability comparison',
                desc: isChinese
                  ? '如果重点是日志、失败和成本可见性。'
                  : 'Better for logs, failures, and cost visibility.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`automation_guide_${item.href.split('/').pop()}`}
                ctaLabel={item.title}
                pageType='guide'
                className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
              </TrackableCtaLink>
            ))}
          </div>
          <div className='mt-5 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/best-ai-tools/ai-automation-tools'
              ctaId='automation_guide_top_list_secondary'
              ctaLabel='Automation guide top list secondary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '打开自动化榜单' : 'Open automation ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/submit'
              ctaId='automation_guide_submit'
              ctaLabel='Automation guide submit'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-50'
            >
              {isChinese ? '提交你的工具' : 'Submit your tool'}
            </TrackableCtaLink>
          </div>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
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

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先用榜单缩小自动化 shortlist' : 'Use the ranking to narrow your automation shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经明确是在比工作流编排、Agent 任务和后台自动化，先看榜单会比泛目录更快进入决策。'
              : 'If the decision is already about workflow orchestration, agent tasks, and back-office automation, the ranking gets you to a decision faster than a broad directory.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-automation-tools',
                title: isChinese ? '自动化工具榜单' : 'Automation tools ranking',
                desc: isChinese
                  ? '先收窄到更高相关的自动化候选。'
                  : 'Start with the highest-fit automation candidates first.',
              },
              {
                href: '/guides/ai-tools-for-automation-comparison',
                title: isChinese ? '自动化工具对比' : 'Automation tools comparison',
                desc: isChinese
                  ? '触发器、编排和维护一起看。'
                  : 'Compare triggers, orchestration, and maintenance together.',
              },
              {
                href: '/guides/ai-tools-for-developers-comparison',
                title: isChinese ? '开发者工具对比' : 'Developer tools comparison',
                desc: isChinese
                  ? '如果流程已深入 API 和工程层。'
                  : 'Useful when workflows reach APIs and engineering layers.',
              },
              {
                href: '/guides/ai-tools-for-api-observability-comparison',
                title: isChinese ? 'API 可观测对比' : 'API observability comparison',
                desc: isChinese
                  ? '如果重点是日志、失败和成本可见性。'
                  : 'Best for logs, failures, and cost visibility.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`automation_guide_ranking_${item.href.split('/').pop()}`}
                ctaLabel={item.title}
                pageType='guide'
                className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
              </TrackableCtaLink>
            ))}
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看流程能不能重复，再看编排方式' : 'Start with repeatability, then orchestration'}
            </h2>
            <div className='mt-4 space-y-3'>
              {tips.map((tip) => (
                <div key={tip} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  <div className='flex items-start gap-3'>
                    <RefreshCw className='mt-0.5 size-4 shrink-0 text-emerald-600' />
                    <span>{tip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className='rounded-[18px] border border-slate-200 bg-slate-50 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '相关分类' : 'Start here'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '自动化工具通常在这些分类里' : 'Automation tools often sit in these categories'}
            </h2>
            <div className='mt-4 grid gap-2'>
              {categories
                .filter((category) => ['automation', 'developer-tools', 'productivity'].includes(String(category.slug)))
                .slice(0, 6)
                .map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className='flex items-center justify-between rounded-lg border border-white bg-white px-4 py-3 text-sm text-slate-700 shadow-sm hover:bg-slate-100'
                  >
                    <span>{getLocalizedField(category.name, locale)}</span>
                    <span className='text-xs text-slate-500'>
                      {'toolCount' in category && typeof category.toolCount === 'number' ? category.toolCount : ''}
                    </span>
                  </Link>
                ))}
            </div>
          </aside>
        </section>

        <section className='mt-8 rounded-[18px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图路径' : 'High-intent path'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先看榜单和对比，再回到自动化页' : 'Compare first, then come back to automation pages'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己在找工作流编排、Agent 任务或后台自动化，不要在这里停太久，直接去更窄的入口。'
              : 'If you already know you are looking for workflow orchestration, agent tasks, or back-office automation, move quickly into the narrower entry points.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {highIntentPaths.map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`automation_guide_${item.href.split('/').pop()}`}
                ctaLabel={item.title}
                pageType='guide'
                className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
              </TrackableCtaLink>
            ))}
          </div>
        </section>

        <GuideActionSection
          locale={locale}
          eyebrow={isChinese ? '先看这些工具' : 'Recommended tools'}
          title={isChinese ? '更适合自动化和编排的工具入口' : 'Tool entry points that fit automation and orchestration'}
          description={
            isChinese
              ? '如果你的核心问题是重复流程、跨工具同步或后台任务编排，先看这些工具会更接近真实使用场景。'
              : 'If your real problem is repeatable processes, cross-tool sync, or back-office orchestration, these tools are the most practical place to start.'
          }
          toolNames={['n8n', 'make', 'zapier', 'pipedream']}
          compareEyebrow={isChinese ? '继续比较' : 'Compare next'}
          compareTitle={isChinese ? '继续缩小选择范围' : 'Narrow the choice further'}
          compareDescription={
            isChinese
              ? '自动化往往要和开发、研究、内容生成一起看，所以接下来的入口也要围绕工作流而不是单点能力。'
              : 'Automation usually intersects with development, research, and content work, so the next steps should stay workflow-first.'
          }
          compareLinks={[
            {
              href: '/best-ai-tools/ai-automation-tools',
              title: isChinese ? '自动化榜单' : 'Automation ranking',
              description: isChinese
                ? '先看高意图 shortlist，再决定要不要细比。'
                : 'Start with the high-intent shortlist before deciding whether to compare deeper.',
            },
            {
              href: '/guides/ai-tools-for-automation-comparison',
              title: isChinese ? '自动化工具总对比' : 'Automation tools comparison',
              description: isChinese
                ? '适合先快速横向看几款常见自动化工具。'
                : 'A fast side-by-side entry for common automation tools.',
            },
            {
              href: '/guides/ai-tools-for-developers',
              title: isChinese ? '开发者工具入口' : 'Developer tools guide',
              description: isChinese
                ? '适合需要 API、模型接入和工程配合的自动化团队。'
                : 'Useful when automation depends on APIs, model routing, and engineering workflows.',
            },
            {
              href: '/guides/ai-coding-tools-comparison',
              title: isChinese ? '编程工具对比' : 'Coding tools comparison',
              description: isChinese
                ? '如果你的自动化重心在脚本和代码层，这里更有参考价值。'
                : 'Helpful when your automations are still mostly code and script driven.',
            },
          ]}
          nextEyebrow={isChinese ? '下一步入口' : 'Where to go next'}
          nextTitle={
            isChinese ? '自动化方向确认后，下一步看这里' : 'Where to go once automation is clearly the direction'
          }
          nextDescription={
            isChinese
              ? '如果你已经确认自己在看自动化和编排，下一步就去榜单、分类页和搜索页看真实条目。'
              : 'Once automation and orchestration are clearly the right lane, move into the ranking, category pages, and search results.'
          }
          nextLinks={[
            {
              href: '/best-ai-tools/ai-automation-tools',
              title: isChinese ? '打开自动化榜单' : 'Open automation ranking',
              description: isChinese
                ? '先看 shortlist，再回到分类或对比页收敛。'
                : 'Start with the shortlist, then return to category or comparison pages to narrow further.',
            },
            {
              href: '/categories/automation?sort=popular',
              title: isChinese ? '进入 Automation 分类' : 'Open the automation category',
              description: isChinese
                ? '直接看自动化类目录里的真实工具和筛选结果。'
                : 'Go straight into the automation category to compare real listings.',
            },
            {
              href: '/explore?search=automation&sort=popular',
              title: isChinese ? '搜索自动化工具' : 'Search automation tools',
              description: isChinese
                ? '回到 Explore，用自动化关键词继续扩大候选。'
                : 'Return to Explore and widen the shortlist with an automation-focused search.',
            },
          ]}
        />

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '自动化工具看什么' : 'What matters for automation tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能稳定替你跑完整个流程' : 'Can it reliably run the whole workflow for you?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '自动化工具的价值在于把重复工作从人手里拿走，而不是只做“看起来很聪明”的单步操作。'
                  : 'The value of automation tools is taking repetitive work off people, not only performing one clever-looking step.'}
              </p>
              <p>
                {isChinese
                  ? '如果流程要长期跑，优先看失败恢复、日志、权限和责任归属。'
                  : 'If a workflow will run for a long time, prioritize retries, logs, permissions, and ownership clarity.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '自动化工具最常见的问题' : 'Common questions about automation tools'}
            </h2>
            <div className='mt-4 space-y-4'>
              {faqs.map((faq) => (
                <div key={faq.question} className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
                  <p className='text-sm font-semibold text-slate-900'>{faq.question}</p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_automation' />
      </div>
    </>
  );
}
