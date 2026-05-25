import Link from 'next/link';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CheckCircle2, ExternalLink, MessageSquare, Sparkles, Users } from 'lucide-react';

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
      ? 'AI 聊天机器人推荐 | AI Best Tool'
      : `AI chatbot tools recommendations | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向问答、写作、知识检索和工作协作的 AI 聊天机器人选型指南。'
        : 'A practical guide to AI chatbots for Q&A, writing, knowledge retrieval, and collaboration.',
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
    { name: isChinese ? '聊天机器人' : 'Chatbots', url: `${siteUrl}/${locale}/guides/ai-chatbot-tools` },
  ]);
  const faqs = [
    {
      question: isChinese ? 'AI 聊天机器人最适合做什么？' : 'What are AI chatbots best for?',
      answer: isChinese
        ? '最适合问答、写作辅助、知识查询、资料总结和团队协作。它们很适合做日常入口型工具，但回答质量要结合你的实际需求判断。'
        : 'They are great for Q&A, writing assistance, knowledge lookup, summaries, and team collaboration. They make excellent daily-use tools, but answer quality should be judged against your needs.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它是否支持你的语言、是否能接入你的知识库、以及它在你常问的问题上是否稳定。'
        : 'Start with language support, knowledge-base integration, and whether it stays reliable for the questions you ask most.',
    },
    {
      question: isChinese ? '免费聊天机器人够用吗？' : 'Are free chatbots enough?',
      answer: isChinese
        ? '轻量问答和日常写作很多时候够用；如果你要更长上下文、团队协作、知识库和更稳定的输出，通常会更快碰到限制。'
        : 'Free tiers often work for light Q&A and daily writing. If you need longer context, collaboration, knowledge bases, or more consistent output, you may hit limits sooner.',
    },
    {
      question: isChinese ? '我可以直接从这里找到聊天机器人吗？' : 'Can I find chatbots directly from here?',
      answer: isChinese
        ? '可以。你可以先从搜索和分类结果开始，再结合评论和更新频率判断。'
        : 'Yes. Start from search and categories, then judge with comments and freshness.',
    },
  ];
  const faqSchema = generateFAQSchema(faqs);
  const tips = isChinese
    ? [
        '先分清用途：通用问答、写作、知识库、团队协作，重点会不同。',
        '看它是否支持你的语言、上下文长度和知识源接入。',
        '如果是团队使用，优先看权限、协作和知识管理能力。',
      ]
    : [
        'Separate the use case first: general Q&A, writing, knowledge base, or collaboration all require different features.',
        'Check language support, context length, and knowledge-source integration.',
        'For teams, prioritize permissions, collaboration, and knowledge management.',
      ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={faqSchema} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <MessageSquare className='size-4' />
              {isChinese ? '聊天机器人推荐' : 'Chatbot recommendations'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Users className='size-4' />
              {isChinese ? '问答与协作并重' : 'Q&A and collaboration'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese ? 'AI 聊天机器人推荐：怎么选更适合你的日常工作流' : 'AI chatbots: how to choose one that fits your daily workflow'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '聊天机器人是很多人接触 AI 的第一个入口，但真正好用与否，取决于它能不能稳定回答、接入知识库，并且适合你的工作场景。这个页面会帮你理清判断顺序。'
              : 'Chatbots are often the first AI product people use, but whether they are actually good depends on reliable answers, knowledge-base integration, and your workflow. This page helps you sort out what matters first.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href='/explore?search=chatbot&sort=popular'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看聊天机器人' : 'Browse chatbots'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/guides/how-to-choose-ai-tools'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到选型指南' : 'Back to selection guide'}
            </Link>
            <Link
              href='/guides/ai-chatbot-tools-comparison'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看聊天机器人对比' : 'Compare chatbots'}
            </Link>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看用途，再看知识和稳定性' : 'Start with the use case, then knowledge and reliability'}
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
              {isChinese ? '聊天机器人通常在这些分类里' : 'Chatbots often sit in these categories'}
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
              {isChinese ? '聊天机器人看什么' : 'What matters for chatbots'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能稳定回答你的真实问题' : 'Can it reliably answer your real questions?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '聊天机器人最重要的是回答是否稳定、有没有幻觉控制、能不能接入你的知识库。你要特别看它在真实问题上的表现，而不只是演示。'
                  : 'What matters most is answer quality, hallucination control, and knowledge-base integration. Judge it on your real questions, not just the demo.'}
              </p>
              <p>
                {isChinese
                  ? '如果你是个人用户、内容工作者或团队成员，优先看上下文长度、历史记录和协作能力。'
                  : 'If you are an individual user, content worker, or teammate, prioritize context length, history, and collaboration features.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '聊天机器人最常见的问题' : 'Common questions about chatbots'}
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
