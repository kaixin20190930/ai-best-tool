import { Metadata } from 'next';
import { Bot, Orbit, Workflow } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { BASE_URL } from '@/lib/env';
import { getNoindexMetadata } from '@/lib/seo/indexing';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import GuideActionSection from '@/components/guides/GuideActionSection';
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

  const siteUrl = BASE_URL;
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
                ? '先看一组更贴近这项任务的 Agent shortlist。'
                : 'Start with a higher-intent agent shortlist.',
            },
          ]}
        />

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
      </div>
    </>
  );
}
