import Link from 'next/link';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CheckCircle2, Code2, ExternalLink, Wrench, Sparkles } from 'lucide-react';

import { StructuredDataServer } from '@/components/seo/StructuredData';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.home',
  });

  return {
    title: locale === 'cn' || locale === 'tw'
      ? 'AI 编程工具推荐 | AI Best Tool'
      : `AI coding tools recommendations | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向代码补全、调试、生成和工作流自动化的 AI 编程工具选型指南。'
        : 'A practical guide to AI tools for code completion, debugging, generation, and workflow automation.',
  };
}

export default async function Page({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '选型指南' : 'Guides', url: `${siteUrl}/${locale}/guides/how-to-choose-ai-tools` },
    { name: isChinese ? '编程工具' : 'Coding tools', url: `${siteUrl}/${locale}/guides/ai-coding-tools` },
  ]);
  const faqs = [
    {
      question: isChinese ? 'AI 编程工具最适合做什么？' : 'What are AI coding tools best for?',
      answer: isChinese
        ? '最适合代码补全、重构、解释代码、生成脚手架、测试辅助和调试。它们能显著提速，但关键逻辑还是要人工把关。'
        : 'They are great for code completion, refactoring, code explanation, scaffolding, test assistance, and debugging. They speed things up a lot, but important logic still needs human review.',
    },
    {
      question: isChinese ? '我应该先看 IDE 插件还是聊天式工具？' : 'Should I start with IDE plugins or chat-style tools?',
      answer: isChinese
        ? '如果你主要在编辑器里写代码，先看 IDE 插件；如果你更常做方案设计、排查问题或生成脚手架，再重点看聊天式工具。'
        : 'If you mainly code in an editor, start with IDE plugins. If you spend more time designing solutions, debugging, or scaffolding, chat-style tools are a better first look.',
    },
    {
      question: isChinese ? '免费编程工具够用吗？' : 'Are free coding tools enough?',
      answer: isChinese
        ? '个人学习和轻量任务通常够用；但如果你要多文件改动、团队协作、私有仓库支持或更高调用量，往往会更快碰到限制。'
        : 'Free tiers can work for learning and lightweight tasks. If you need multi-file changes, team workflows, private repo support, or more usage, you will likely hit limits sooner.',
    },
    {
      question: isChinese ? '我可以直接从这里找到编程类工具吗？' : 'Can I find coding tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从分类和搜索结果开始，再结合评论、截图和更新频率判断。'
        : 'Yes. Start from categories and search results, then use comments, screenshots, and update frequency to decide.',
    },
  ];
  const faqSchema = generateFAQSchema(faqs);
  const tips = isChinese
    ? [
        '先分清你的任务：补全、重构、调试、生成脚手架，需求差异很大。',
        '看它是否支持你的语言、编辑器和仓库工作流。',
        '如果你会长期使用，优先看上下文长度、团队协作和私有仓库支持。',
      ]
    : [
        'Start by separating your task: completion, refactoring, debugging, or scaffolding all need different features.',
        'Check language support, editor support, and repository workflow fit.',
        'If you plan to use it regularly, pay attention to context length, collaboration, and private repository support.',
      ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={faqSchema} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Code2 className='size-4' />
              {isChinese ? '编程工具推荐' : 'Coding tools recommendations'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Wrench className='size-4' />
              {isChinese ? '开发者工作流' : 'Developer workflow'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese ? 'AI 编程工具推荐：怎么选更适合你的开发流程' : 'AI coding tools: how to choose one that fits your development workflow'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '编程工具不只是“会不会补代码”，而是要看它能不能真正融入你的编辑器、仓库和发布流程。这个页面会从任务、语言、上下文和协作四个角度帮你判断。'
              : 'Coding tools are not just about "can it write code?" They need to fit your editor, repository, and release workflow. This page helps you judge by task, language, context, and collaboration.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href='/explore?search=coding&sort=popular'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看编程类工具' : 'Browse coding tools'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/guides/how-to-choose-ai-tools'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到选型指南' : 'Back to selection guide'}
            </Link>
            <Link
              href='/guides/ai-coding-tools-comparison'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看编程工具对比' : 'Compare coding tools'}
            </Link>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看任务，再看工作流适配' : 'Start with the task, then workflow fit'}
            </h2>
            <div className='mt-4 space-y-3'>
              {tips.map((tip) => (
                <div key={tip} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  <div className='flex items-start gap-3'>
                    <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-emerald-600' />
                    <span>{tip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className='rounded-[18px] border border-slate-200 bg-slate-50 p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '先看这些分类' : 'Start here'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '编程类工具通常在这些分类里' : 'Coding tools often sit in these categories'}
            </h2>
            <div className='mt-4 grid gap-2'>
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className='flex items-center justify-between rounded-lg border border-white bg-white px-4 py-3 text-sm text-slate-700 shadow-sm hover:bg-slate-100'
                >
                  <span>{getLocalizedField(category.name, locale)}</span>
                  <span className='text-xs text-slate-500'>
                    {'toolCount' in category && typeof category.toolCount === 'number'
                      ? category.toolCount
                      : ''}
                  </span>
                </Link>
              ))}
            </div>
          </aside>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '编程工具看什么' : 'What matters for coding tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能真正减少你的开发摩擦' : 'Can it actually reduce development friction?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '编程工具最重要的是它是否能稳定地帮你完成日常任务，而不是只在演示里看起来聪明。你要特别看它能否嵌进你的编辑器、仓库和测试流程。'
                  : 'The key is whether it consistently helps with daily work, not only in demos. Check whether it fits your editor, repository, and testing flow.'}
              </p>
              <p>
                {isChinese
                  ? '如果你是个人开发者或团队成员，优先看上下文、隐私、协作和多文件修改能力。'
                  : 'If you are an individual developer or part of a team, focus on context, privacy, collaboration, and multi-file changes.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '编程工具最常见的问题' : 'Common questions about coding tools'}
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
