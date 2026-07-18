import { Metadata } from 'next';
import { Bot, ExternalLink, Orbit, Workflow } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { getNoindexMetadata } from '@/lib/seo/indexing';
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
      locale === 'cn' || locale === 'tw' ? 'AI Agent 工具推荐 | AI Best Tool' : `AI tools for agents | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向 Agent 工作流、任务编排、模型调用、状态追踪和执行闭环的 AI 工具指南。'
        : 'A practical guide to AI tools for agent workflows, task orchestration, model calls, state tracking, and execution loops.',
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const checkedAt = '2026-07-18';
  const categoryCount = categories.length;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
    { name: isChinese ? 'Agent 工具' : 'Agent tools', url: `${siteUrl}/${locale}/guides/ai-tools-for-agents` },
  ]);
  const faqs = [
    {
      question: isChinese ? 'AI Agent 工具最适合做什么？' : 'What are AI agent tools best for?',
      answer: isChinese
        ? '最适合做多步骤任务、工具调用、状态流转、任务交接，以及需要“判断后执行”的工作流。'
        : 'They are best for multi-step tasks, tool use, state transitions, task handoffs, and workflows that need execution after reasoning.',
    },
    {
      question: isChinese ? '它和自动化工具有什么区别？' : 'How are agent tools different from automation tools?',
      answer: isChinese
        ? '自动化工具更偏固定流程和触发器；Agent 工具更强调推理、上下文、工具选择和任务循环。'
        : 'Automation tools are more about fixed triggers and repeatable flows, while agent tools emphasize reasoning, context, tool choice, and iterative task loops.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看任务是不是多步骤、是否需要工具调用，再看状态管理、失败恢复、日志和人机接管能力。'
        : 'Start with whether the task is multi-step and tool-using, then check state management, failure recovery, logs, and human handoff.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Is a free tier enough?',
      answer: isChinese
        ? '试原型通常够用，但一旦进入持续运行、多人维护或生产接入，很快会碰到额度、日志和权限限制。'
        : 'It is often enough for prototyping, but continuous runs, team maintenance, and production use hit quota, logging, and permission limits quickly.',
    },
  ];
  const tips = isChinese
    ? [
        '先判断你要的是固定自动化，还是需要自主决策和多轮执行的 Agent。',
        '如果 Agent 会长期运行，优先看状态、日志、失败恢复和人工接管能力。',
        '不要只看模型效果，更要看工具调用、上下文保持和执行闭环是否稳定。',
      ]
    : [
        'Start by separating fixed automation from agent-style execution that needs reasoning and iteration.',
        'If the agent will run continuously, prioritize state, logs, failure recovery, and human override.',
        'Do not judge only on model output. Tool use, context persistence, and execution reliability matter more.',
      ];
  const highIntentPaths = [
    {
      href: '/best-ai-tools/ai-agent-tools',
      title: isChinese ? '先看 Agent 榜单' : 'Start with the agent ranking',
      desc: isChinese ? '先用 shortlist 缩小范围。' : 'Use the shortlist to narrow the field first.',
    },
    {
      href: '/guides/ai-tools-for-agents-comparison',
      title: isChinese ? 'Agent 工具对比' : 'Agent tools comparison',
      desc: isChinese ? '多步骤执行和工具调用一起看。' : 'Compare execution loops and tool use together.',
    },
    {
      href: '/guides/ai-tools-for-automation-comparison',
      title: isChinese ? '自动化工具对比' : 'Automation tools comparison',
      desc: isChinese ? '如果流程更固定、触发器更重要。' : 'Useful when triggers and fixed flows matter more.',
    },
    {
      href: '/guides/ai-tools-for-model-routing-comparison',
      title: isChinese ? '模型路由对比' : 'Model routing comparison',
      desc: isChinese
        ? '如果 Agent 需要多模型切换和回退。'
        : 'Use this when agents need multi-model switching and fallback control.',
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
              <Bot className='size-4' />
              {isChinese ? 'Agent 工具推荐' : 'Agent tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Orbit className='size-4' />
              {isChinese ? '推理 + 执行 + 状态' : 'Reasoning + execution + state'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI Agent 工具推荐：怎么选更适合你的多步骤执行工作流'
              : 'AI tools for agents: how to choose for multi-step execution workflows'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? 'Agent 工具的重点不是“会不会回答”，而是能不能在多轮任务里保持上下文、正确调用工具，并在失败时仍然可观察、可接管。'
              : 'Agent tooling is not mainly about whether it can answer once. The real question is whether it can hold context across multi-step tasks, call the right tools, and stay observable when things fail.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=agent&sort=popular'
              ctaId='agent_guide_browse_tools'
              ctaLabel='Agent guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看 Agent 工具' : 'Browse agent tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-automation'
              ctaId='agent_guide_automation'
              ctaLabel='Agent guide automation'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看自动化工具' : 'Automation tools'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-developers'
              ctaId='agent_guide_developers'
              ctaLabel='Agent guide developers'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看开发者工具' : 'Developer tools'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-agent-tools'
              ctaId='agent_guide_top_list'
              ctaLabel='Agent guide top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看 Agent 榜单' : 'Open agent ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/submit'
              ctaId='agent_guide_submit'
              ctaLabel='Agent guide submit'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '提交你的工具' : 'Submit your tool'}
            </TrackableCtaLink>
          </div>
        </section>

        <GuideEvidencePanel
          locale={locale}
          checkedAt={checkedAt}
          scope={
            isChinese
              ? '这页优先判断 Agent 工具是否真的能保持上下文、调用工具和处理执行闭环，而不是只看单轮回答的表面效果。'
              : 'This page checks whether agent tools truly keep context, call tools, and close the execution loop rather than only producing a good single-turn answer.'
          }
          signalCards={[
            {
              label: isChinese ? '价格信号' : 'Pricing signal',
              value: isChinese ? '先看试用和执行额度' : 'Check trial and execution limits',
              note: isChinese
                ? 'Agent 很容易在执行次数、席位和高级能力上分层。'
                : 'Agent tools often split value across executions, seats, and advanced capabilities.',
            },
            {
              label: isChinese ? '更新信号' : 'Freshness signal',
              value: isChinese ? '看是否还在持续迭代' : 'See whether it is still iterating',
              note: isChinese
                ? '如果发布和支持都停了，长期执行就更危险。'
                : 'If releases and support have stalled, long-term execution gets riskier.',
            },
            {
              label: isChinese ? '风险信号' : 'Risk signal',
              value: isChinese ? '没有真实执行回路要谨慎' : 'Be cautious without a real execution loop',
              note: isChinese
                ? '如果没有失败恢复、日志或接管案例，先别把它当主力。'
                : 'If there are no recovery, logging, or handoff cases, do not treat it as the main choice yet.',
            },
          ]}
          items={[
            {
              label: isChinese ? '验证范围' : 'Checked scope',
              value: isChinese ? '多步骤、工具调用、状态、接管' : 'Multi-step tasks, tool use, state, handoff',
              note: isChinese
                ? `先看它是否适合长期执行。当前可用分类数：${categoryCount}。`
                : `First check whether it fits long-running execution. Current category count: ${categoryCount}.`,
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '保留索引，接榜单与对比页' : 'Indexable with ranking and comparison paths',
              note: isChinese
                ? '把高意图访问导向更窄的 Agent 路径。'
                : 'Guide high-intent visitors into narrower agent paths.',
            },
            {
              label: isChinese ? '下一步增强' : 'Next enrichment',
              value: isChinese
                ? '补真实工作流、失败恢复和日志样例'
                : 'Add real workflows, recovery cases, and log samples',
              note: isChinese
                ? `让页面出现真实执行信号，并保持 ${checkedAt} 的核对记录。`
                : `Make the page reflect real execution signals while keeping the ${checkedAt} verification record.`,
            },
          ]}
          decisionSteps={[
            isChinese
              ? '先判断你要的是单步回答还是多步骤执行。'
              : 'First decide whether you need a single answer or multi-step execution.',
            isChinese
              ? '如果要长流程，就先看对应的 Agent 对比页。'
              : 'If it is a long workflow, go to the matching agent comparison page first.',
            isChinese
              ? '如果要团队落地，再回来补日志、恢复和接管证据。'
              : 'If it is for team rollout, come back for logs, recovery, and handoff evidence.',
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
                ? `Agent 入口已和榜单、对比页和提交路径收口，目前覆盖 ${categoryCount} 个分类。`
                : `The agent entry now aligns with ranking, comparison, and submission paths across ${categoryCount} categories.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-700'>
              {isChinese
                ? '保留索引，继续补真实多步骤执行和治理案例。'
                : 'Keep indexable and continue adding real multi-step execution and governance cases.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-700'>
              {isChinese ? '补一个真实 Agent 执行回路。' : 'Add one real agent execution loop.'}
            </p>
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先用榜单缩小 Agent shortlist' : 'Use the ranking to narrow your agent shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经明确是在比多步骤执行、工具调用和状态治理，先看榜单会比泛目录更快进入决策。'
              : 'If the decision is already about multi-step execution, tool use, and state governance, the ranking gets you to a decision faster than a broad directory.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-agent-tools',
                title: isChinese ? 'Agent 工具榜单' : 'Agent tools ranking',
                desc: isChinese
                  ? '先收窄到更高相关的 Agent 候选。'
                  : 'Start with the highest-fit agent candidates first.',
              },
              {
                href: '/guides/ai-tools-for-agents-comparison',
                title: isChinese ? 'Agent 工具对比' : 'Agent tools comparison',
                desc: isChinese ? '多步骤执行与工具调用一起看。' : 'Compare execution loops and tool use together.',
              },
              {
                href: '/guides/ai-tools-for-automation-comparison',
                title: isChinese ? '自动化工具对比' : 'Automation tools comparison',
                desc: isChinese
                  ? '如果流程更固定、触发器更重要。'
                  : 'Useful when triggers and fixed flows matter more.',
              },
              {
                href: '/guides/ai-tools-for-model-routing-comparison',
                title: isChinese ? '模型路由对比' : 'Model routing comparison',
                desc: isChinese
                  ? '如果 Agent 需要多模型切换和回退。'
                  : 'Use this when agents need multi-model switching and fallback control.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`agent_guide_ranking_${item.href.split('/').pop()}`}
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

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图路径' : 'High-intent path'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '先看 Agent 对比，再落到条目与提交'
              : 'Compare agent paths first, then move into listings and submission'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己在找 Agent 编排、执行层和治理层，不要停在泛指南页，直接去更窄的对比页。'
              : 'If you already know the need sits in agent orchestration, execution, and governance, do not stay in broad overviews. Move straight into narrower comparisons.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/guides/ai-tools-for-agents-comparison',
                title: isChinese ? 'Agent 工具对比' : 'Agent tools comparison',
                desc: isChinese ? '多步骤执行与工具调用。' : 'Multi-step execution and tool use.',
              },
              {
                href: '/guides/ai-tools-for-automation-comparison',
                title: isChinese ? '自动化工具对比' : 'Automation tools comparison',
                desc: isChinese ? '固定流程与触发器优先。' : 'Fixed flows and triggers first.',
              },
              {
                href: '/guides/ai-tools-for-model-routing-comparison',
                title: isChinese ? '模型路由对比' : 'Model routing comparison',
                desc: isChinese ? '多模型接入和回退治理。' : 'Multi-model access and fallback control.',
              },
              {
                href: '/guides/ai-tools-for-api-observability-comparison',
                title: isChinese ? 'API 可观测对比' : 'API observability comparison',
                desc: isChinese ? '日志、追踪和质量治理。' : 'Logs, traces, and quality governance.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`agent_guide_${item.href.split('/').pop()}`}
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
              href='/submit'
              ctaId='agent_guide_submit_secondary'
              ctaLabel='Agent guide submit secondary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '提交你的工具' : 'Submit your tool'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/developer/listing'
              ctaId='agent_guide_claim'
              ctaLabel='Agent guide claim'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50'
            >
              {isChinese ? '认领条目' : 'Claim listing'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese
                ? '先看是否真的需要“决策后执行”'
                : 'Start with whether you really need reason-then-execute loops'}
            </h2>
            <div className='mt-4 space-y-3'>
              {tips.map((tip) => (
                <div key={tip} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  <div className='flex items-start gap-3'>
                    <Workflow className='mt-0.5 size-4 shrink-0 text-emerald-600' />
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
              {isChinese ? 'Agent 工具通常落在这些分类里' : 'Agent tooling usually sits in these categories'}
            </h2>
            <div className='mt-4 grid gap-2'>
              {categories
                .filter((category) => ['automation', 'developer-tools', 'research'].includes(String(category.slug)))
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

        <GuideActionSection
          locale={locale}
          eyebrow={isChinese ? '先看这些工具' : 'Recommended tools'}
          title={isChinese ? '更接近 Agent 工作流的一组入口' : 'Tool entry points that sit closer to agent workflows'}
          description={
            isChinese
              ? '如果你的核心问题是任务编排、工具调用、多模型执行或运行治理，这些条目会比泛聊天工具更接近真实场景。'
              : 'If the real problem is task orchestration, tool use, multi-model execution, or runtime governance, these listings are closer to reality than broad chatbot pages.'
          }
          toolNames={['n8n', 'openrouter', 'langfuse', 'portkey']}
          compareEyebrow={isChinese ? '继续比较' : 'Compare next'}
          compareTitle={isChinese ? '继续缩小 Agent 工具选择范围' : 'Narrow the agent tooling choice further'}
          compareDescription={
            isChinese
              ? 'Agent 方向通常会同时碰到自动化、模型路由和可观测问题，下一步最好继续沿着执行层比较。'
              : 'Agent work usually intersects with automation, model routing, and observability, so the next step should keep following the execution layer.'
          }
          compareLinks={[
            {
              href: '/guides/ai-tools-for-agents-comparison',
              title: isChinese ? 'Agent 工具总对比' : 'Agent tools comparison',
              description: isChinese
                ? '先快速横向看一组更贴近 Agent 的工具。'
                : 'A fast side-by-side look at tools closer to agent workflows.',
            },
            {
              href: '/best-ai-tools/ai-agent-tools',
              title: isChinese ? 'Agent 榜单入口' : 'Agent ranking list',
              description: isChinese
                ? '适合已经确认方向，只想快速缩小 shortlist 的用户。'
                : 'Useful when the direction is already clear and the goal is to narrow the shortlist quickly.',
            },
            {
              href: '/guides/ai-tools-for-automation-comparison',
              title: isChinese ? '自动化工具对比' : 'Automation tools comparison',
              description: isChinese
                ? '适合判断你要的是固定编排，还是更自主的执行流。'
                : 'Useful for deciding between fixed orchestration and more adaptive execution.',
            },
            {
              href: '/guides/ai-tools-for-api-observability-comparison',
              title: isChinese ? 'API 可观测对比' : 'API observability comparison',
              description: isChinese
                ? '当 Agent 开始持续运行后，日志和治理通常会变成下一层问题。'
                : 'Once agents run continuously, logs and governance usually become the next decision layer.',
            },
          ]}
          nextEyebrow={isChinese ? '下一步入口' : 'Where to go next'}
          nextTitle={
            isChinese
              ? '确认是 Agent 方向后，下一步看这里'
              : 'Where to go once agent workflows are clearly the direction'
          }
          nextDescription={
            isChinese
              ? '如果你已经确认自己在看 Agent 工作流，下一步就去分类页、搜索页和本周新增里看真实条目。'
              : 'Once agent workflows are clearly the right lane, move into category pages, search results, and recent additions to inspect real listings.'
          }
          nextLinks={[
            {
              href: '/categories/automation?sort=popular',
              title: isChinese ? '进入 Automation 分类' : 'Open the automation category',
              description: isChinese
                ? '看更接近执行和编排层的真实工具。'
                : 'See real listings closer to execution and orchestration.',
            },
            {
              href: '/best-ai-tools/ai-agent-tools',
              title: isChinese ? '进入 Agent 榜单' : 'Open the agent ranking',
              description: isChinese
                ? '先看一组更高意图的 Agent shortlist。'
                : 'Start with a higher-intent agent shortlist.',
            },
            {
              href: '/explore?search=agent&sort=popular',
              title: isChinese ? '搜索 Agent 工具' : 'Search agent tools',
              description: isChinese
                ? '回到 Explore，用 Agent 关键词继续扩大候选。'
                : 'Return to Explore and widen the shortlist with an agent-focused search.',
            },
            {
              href: '/new',
              title: isChinese ? '看本周新增' : 'Check new this week',
              description: isChinese
                ? '看看最近是否补进了更贴近 Agent 的条目。'
                : 'See whether recent additions introduced listings closer to agent use cases.',
            },
          ]}
        />

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图路径' : 'High-intent path'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先看榜单和对比，再回到 Agent 页' : 'Compare first, then come back to agent pages'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己要找的是 Agent，而不是纯自动化，就别在总览页停太久，直接进入更窄的榜单和对比页。'
              : 'If the real need is agents rather than plain automation, move quickly into the narrower ranking and comparison pages.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {highIntentPaths.map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`agent_guide_${item.href.split('/').pop()}`}
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

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? 'Agent 工具看什么' : 'What matters for agent tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '它能不能跑完任务，而不是只回答一步' : 'Can it finish the job, not only answer one step?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? 'Agent 工具真正拉开差距的地方，是状态保持、工具调用、异常恢复和人工接管，而不是单次输出看起来多聪明。'
                  : 'The real difference in agent tooling is state persistence, tool calling, failure recovery, and human override, not only how clever a single answer looks.'}
              </p>
              <p>
                {isChinese
                  ? '如果流程要进入生产，优先看日志、权限边界、成本控制和责任归属。'
                  : 'If the workflow is heading into production, prioritize logs, permission boundaries, cost control, and ownership clarity.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? 'Agent 工具最常见的问题' : 'Common questions about agent tools'}
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
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_agents' />
      </div>
    </>
  );
}
