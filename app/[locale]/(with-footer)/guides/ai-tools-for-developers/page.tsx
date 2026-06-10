import { Metadata } from 'next';
import Link from 'next/link';
import { Code2, ExternalLink, Layers3, Workflow } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import GuideActionSection from '@/components/guides/GuideActionSection';
import { StructuredDataServer } from '@/components/seo/StructuredData';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return {
    title:
      locale === 'cn' || locale === 'tw'
        ? 'AI 开发者工具推荐 | AI Best Tool'
        : `AI tools for developers | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向编码、模型接入、API 工作流、调试和自动化的 AI 开发者工具指南。'
        : 'A practical guide to AI tools for developers, including coding, model access, APIs, debugging, and automation.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
    { name: isChinese ? '开发者工具' : 'Developer tools', url: `${siteUrl}/${locale}/guides/ai-tools-for-developers` },
  ]);
  const faqs = [
    {
      question: isChinese ? 'AI 开发者工具最适合做什么？' : 'What are AI tools for developers best for?',
      answer: isChinese
        ? '最适合编码辅助、模型接入、调试、API 工作流、提示词实验和把 AI 接进真实产品。'
        : 'They are best for coding support, model access, debugging, API workflows, prompt experimentation, and integrating AI into real products.',
    },
    {
      question: isChinese ? '它和单纯的编程工具有什么区别？' : 'How is this different from just coding tools?',
      answer: isChinese
        ? '开发者工具不只包含 IDE 辅助，也包括模型访问层、数据基础设施、自动化编排和开发侧工作流。'
        : 'Developer tools go beyond IDE assistance and also include model access, infrastructure, workflow orchestration, and developer-facing operations.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看你的工作发生在编辑器里、API 层、自动化层还是数据层，再比较上下文、集成方式和团队使用成本。'
        : 'Start by deciding whether your work happens in the editor, API layer, automation layer, or data layer, then compare context, integrations, and team cost.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Is a free tier enough?',
      answer: isChinese
        ? '试用通常够用，但当你进入多成员、多项目、私有仓库或生产接入时，通常会更快碰到限制。'
        : 'Free tiers can be enough for trials, but private repositories, production use, and team access usually hit plan limits faster.',
    },
  ];
  const tips = isChinese
    ? [
        '先分清你是在找编码辅助、模型接入，还是自动化和基础设施能力。',
        '优先看是否适配现有编辑器、仓库、API 和部署方式。',
        '如果是团队长期使用，重点看权限、可观测性和集成维护成本。',
      ]
    : [
        'Separate coding, model access, automation, and infrastructure needs before comparing tools.',
        'Check fit with your editor, repository, API surface, and deployment path.',
        'For team use, focus on permissions, observability, and integration maintenance cost.',
      ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={generateFAQSchema(faqs)} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Code2 className='size-4' />
              {isChinese ? '开发者工具推荐' : 'Developer tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Layers3 className='size-4' />
              {isChinese ? '代码 + API + 工作流' : 'Code + API + workflow'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 开发者工具推荐：怎么选更适合你的构建工作流'
              : 'AI tools for developers: how to choose for your build workflow'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '开发者工具不只是“能写代码”，而是要看它能不能接进你的编辑器、API、自动化和发布流程。这个页面帮你按工作位置而不是按热度来判断。'
              : 'Developer tools are not only about writing code. The real question is whether they fit your editor, APIs, automation, and release path. This page helps you judge by workflow position, not by hype.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href='/explore?search=developer&sort=popular'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看开发者工具' : 'Browse developer tools'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/guides/ai-coding-tools'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看编程工具' : 'Coding tools'}
            </Link>
            <Link
              href='/guides/ai-tools-for-automation'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看自动化工具' : 'Automation tools'}
            </Link>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看工作发生在哪一层' : 'Start with where the work actually happens'}
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
              {isChinese ? '开发者工具通常在这些分类里' : 'Developer tools often sit in these categories'}
            </h2>
            <div className='mt-4 grid gap-2'>
              {categories
                .filter((category) => ['developer-tools', 'automation', 'research'].includes(String(category.slug)))
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
          title={isChinese ? '更贴近开发者工作流的真实入口' : 'Real entry points for developer workflows'}
          description={
            isChinese
              ? '如果你要的是编码、模型接入、调试或 API 组合，这几款工具会比泛搜索更快把范围收窄。'
              : 'If your need is coding, model access, debugging, or API composition, these tools narrow the space much faster than broad search.'
          }
          toolNames={['cursor', 'openrouter', 'langfuse', 'portkey']}
          compareEyebrow={isChinese ? '继续比较' : 'Compare next'}
          compareTitle={isChinese ? '再往下的决策入口' : 'Next decision paths'}
          compareDescription={
            isChinese
              ? '开发者通常不是只选一个工具，而是先明确主要工作位置，再进入相应的对比页。'
              : 'Developers rarely choose by brand alone. It works better to pick the main workflow layer, then compare inside it.'
          }
          compareLinks={[
            {
              href: '/guides/ai-tools-for-developers-comparison',
              title: isChinese ? '开发者工具总对比' : 'Developer tools comparison',
              description: isChinese
                ? '适合先横向看编码、模型接入和 API 工具。'
                : 'A broad side-by-side look across coding, model access, and API tools.',
            },
            {
              href: '/guides/ai-coding-tools-comparison',
              title: isChinese ? '编程工具对比' : 'Coding tools comparison',
              description: isChinese
                ? '更适合编辑器内补全、重构和调试。'
                : 'Best for editor-native completion, refactoring, and debugging.',
            },
            {
              href: '/guides/ai-chatbot-tools-comparison',
              title: isChinese ? '聊天工具对比' : 'Chatbot tools comparison',
              description: isChinese
                ? '更适合方案设计、解释和长上下文问答。'
                : 'Better for planning, explanation, and long-context reasoning.',
            },
          ]}
        />

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '开发者工具看什么' : 'What matters for developer tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能真正接进你的产品与流程' : 'Can it actually plug into your product and workflow?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '开发者工具真正的价值，不是“单点能力看起来很强”，而是它是否减少上下文切换、缩短接入时间，并且能长期维护。'
                  : 'The real value is not whether a single feature looks impressive, but whether it reduces context switching, shortens integration time, and stays maintainable.'}
              </p>
              <p>
                {isChinese
                  ? '如果你做的是长期产品或团队工作流，优先看模型可选性、权限、日志、可观测性和稳定接入方式。'
                  : 'For long-term products and team workflows, prioritize model optionality, permissions, logs, observability, and stable integration paths.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '开发者工具最常见的问题' : 'Common questions about developer tools'}
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
