import { Metadata } from 'next';
import { Bot, RefreshCw, Workflow } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { BASE_URL } from '@/lib/env';
import { buildLocalizedPageMetadata } from '@/lib/seo/metadata';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import GuideDecisionPath from '@/components/guides/GuideDecisionPath';
import GuideTaskChecks from '@/components/guides/GuideTaskChecks';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import { Link } from '@/app/navigation';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return buildLocalizedPageMetadata({
    locale,
    path: '/guides/ai-tools-for-automation',
    title:
      locale === 'cn' || locale === 'tw'
        ? 'AI 自动化工具推荐 | AI Best Tool'
        : `AI tools for automation | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向工作流编排、Agent 任务、重复流程和跨工具自动化的 AI 工具指南，先看榜单再进对比页。'
        : 'A practical guide to AI tools for workflow orchestration, agent tasks, repeatable processes, and cross-tool automation, with a path from guide to ranking and comparison.',
    baseUrl: BASE_URL,
  });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);

  const siteUrl = BASE_URL;
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

        <GuideDecisionPath
          locale={locale}
          guideId='automation_guide'
          title={isChinese ? '从工作流任务进入具体工具判断' : 'Move from workflow task to a concrete tool decision'}
          description={
            isChinese
              ? '先区分自托管、API 编排和低代码协作，再核验运行额度、错误恢复和长期维护成本。'
              : 'Separate self-hosting, API orchestration, and low-code collaboration, then verify run limits, recovery, and maintenance cost.'
          }
          tasks={[
            {
              task: isChinese ? '可视化编排与自托管' : 'Visual orchestration and self-hosting',
              toolName: 'n8n',
              toolLabel: 'n8n',
              bestFor: isChinese
                ? '需要流程控制、可部署性和较强技术灵活性的团队。'
                : 'Teams needing flow control, deployability, and technical flexibility.',
              verifyFirst: isChinese
                ? '运维责任、执行额度和复杂流程调试成本。'
                : 'Operational ownership, run limits, and complex-flow debugging cost.',
            },
            {
              task: isChinese ? 'API 驱动的开发者工作流' : 'API-driven developer workflows',
              toolName: 'pipedream',
              toolLabel: 'Pipedream',
              bestFor: isChinese
                ? '需要快速连接 API、事件和代码步骤。'
                : 'Fast API, event, and code-step integrations.',
              verifyFirst: isChinese
                ? '计费单位、日志保留和生产错误恢复。'
                : 'Billing units, log retention, and production recovery.',
            },
            {
              task: isChinese ? '业务团队低代码自动化' : 'Low-code automation for business teams',
              toolName: 'zapier',
              toolLabel: 'Zapier',
              bestFor: isChinese
                ? '常见 SaaS 连接和非技术成员快速上手。'
                : 'Common SaaS integrations and fast non-technical adoption.',
              verifyFirst: isChinese
                ? '高频任务成本、复杂分支和权限治理。'
                : 'High-volume cost, complex branching, and permission governance.',
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

        <GuideTaskChecks slug='ai-tools-for-automation' locale={locale} />
      </div>
    </>
  );
}
