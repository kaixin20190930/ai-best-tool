import Link from 'next/link';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CheckCircle2, ExternalLink, Sparkles, Timer, Workflow } from 'lucide-react';

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
      ? 'AI 生产力工具推荐 | AI Best Tool'
      : `AI productivity tools recommendations | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向效率提升、任务管理、写作协作和知识整理的 AI 生产力工具选型指南。'
        : 'A practical guide to AI productivity tools for efficiency, task management, writing collaboration, and knowledge organization.',
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
    { name: isChinese ? '生产力工具' : 'Productivity tools', url: `${siteUrl}/${locale}/guides/ai-productivity-tools` },
  ]);
  const faqs = [
    {
      question: isChinese ? 'AI 生产力工具最适合做什么？' : 'What are AI productivity tools best for?',
      answer: isChinese
        ? '最适合待办整理、会议纪要、写作辅助、知识整理、邮件处理和工作流自动化。它们适合日常高频任务，而不是一次性的炫技。'
        : 'They are best for to-do organization, meeting notes, writing assistance, knowledge management, email handling, and workflow automation. They shine in daily repetitive work, not one-off demos.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它能不能接入你现在的工作流，比如日历、文档、笔记、邮箱和协作工具。'
        : 'Start with workflow fit: calendar, docs, notes, email, and collaboration integrations matter most.',
    },
    {
      question: isChinese ? '免费生产力工具够用吗？' : 'Are free productivity tools enough?',
      answer: isChinese
        ? '如果只是做轻量任务和个人整理，很多免费工具够用；如果你要团队协作、自动化和更稳定的上限，通常会更快碰到限制。'
        : 'For light personal use, free tools are often enough. If you need collaboration, automation, or more reliable limits, you may hit caps sooner.',
    },
    {
      question: isChinese ? '我可以直接从这里找到生产力工具吗？' : 'Can I find productivity tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从搜索和分类页开始，再结合评论、截图和更新频率判断。'
        : 'Yes. Start from search and categories, then use comments, screenshots, and update frequency to judge.',
    },
  ];
  const faqSchema = generateFAQSchema(faqs);
  const tips = isChinese
    ? [
        '先分清你的任务：待办、会议纪要、文档协作、知识整理、邮件或自动化。',
        '看它是否能接到你已经在用的工作工具。',
        '如果你每天都要用，优先看稳定性、协作和自动化，而不是单次演示效果。',
      ]
    : [
        'Separate your task first: to-dos, notes, docs collaboration, knowledge organization, email, or automation.',
        'Check whether it connects to the tools you already use.',
        'If you will use it every day, prioritize stability, collaboration, and automation over demo flair.',
      ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={faqSchema} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Workflow className='size-4' />
              {isChinese ? '生产力工具推荐' : 'Productivity tools recommendations'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Timer className='size-4' />
              {isChinese ? '效率优先' : 'Efficiency first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese ? 'AI 生产力工具推荐：怎么选才真正省时间' : 'AI productivity tools: how to choose one that actually saves time'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '生产力工具的价值不是“能做很多事”，而是“能把日常重复工作变轻”。这个页面会从任务、工作流、协作和自动化几个角度帮你判断。'
              : 'The value of productivity tools is not "it can do a lot." It is whether it makes repetitive daily work lighter. This page helps you judge by task, workflow, collaboration, and automation.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href='/explore?search=productivity&sort=popular'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看生产力工具' : 'Browse productivity tools'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/guides/how-to-choose-ai-tools'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到选型指南' : 'Back to selection guide'}
            </Link>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看工作流，再看功能范围' : 'Start with workflow fit, then feature scope'}
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
              {isChinese ? '生产力工具通常在这些分类里' : 'Productivity tools often sit in these categories'}
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
              {isChinese ? '生产力工具看什么' : 'What matters for productivity tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能真正替你省下重复劳动' : 'Can it actually save you repetitive work?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '生产力工具最重要的是流程接得顺不顺。你要看它能不能融入你正在用的文档、日历、笔记、邮件和团队协作工具。'
                  : 'The key is workflow fit. Check whether it plugs into the docs, calendar, notes, email, and collaboration tools you already use.'}
              </p>
              <p>
                {isChinese
                  ? '如果你是个人用户、运营、内容或项目管理场景，优先看自动化、历史记录和共享能力。'
                  : 'If you are an individual user, operations, content, or project management user, prioritize automation, history, and sharing.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '生产力工具最常见的问题' : 'Common questions about productivity tools'}
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
