import { Metadata } from 'next';
import Link from 'next/link';
import { Bot, ExternalLink, RefreshCw, Workflow } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import { StructuredDataServer } from '@/components/seo/StructuredData';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return {
    title:
      locale === 'cn' || locale === 'tw'
        ? 'AI 自动化工具推荐 | AI Best Tool'
        : `AI tools for automation | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向工作流编排、Agent 任务、重复流程和跨工具自动化的 AI 工具指南。'
        : 'A practical guide to AI tools for workflow orchestration, agent tasks, repeatable processes, and cross-tool automation.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
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
            <Link
              href='/explore?search=automation&sort=popular'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看自动化工具' : 'Browse automation tools'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/guides/ai-tools-for-developers'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看开发者工具' : 'Developer tools'}
            </Link>
            <Link
              href='/guides/ai-coding-tools'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看编程工具' : 'Coding tools'}
            </Link>
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
      </div>
    </>
  );
}
