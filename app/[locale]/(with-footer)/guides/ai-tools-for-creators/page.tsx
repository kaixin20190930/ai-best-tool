import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, ExternalLink, PenTool, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import { StructuredDataServer } from '@/components/seo/StructuredData';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.home',
  });

  return {
    title:
      locale === 'cn' || locale === 'tw' ? 'AI 创作者工具推荐 | AI Best Tool' : `AI tools for creators | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向独立创作者、博主和内容工作流的 AI 工具选型指南。'
        : 'A practical guide to AI tools for solo creators, bloggers, and content workflows.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '选型指南' : 'Guides', url: `${siteUrl}/${locale}/guides/how-to-choose-ai-tools` },
    { name: isChinese ? '创作者工具' : 'Creator tools', url: `${siteUrl}/${locale}/guides/ai-tools-for-creators` },
  ]);
  const faqs = [
    {
      question: isChinese ? '创作者最适合用 AI 做什么？' : 'What are creators best using AI for?',
      answer: isChinese
        ? '最适合选题、脚本、标题、封面、剪辑、配图和内容再包装。它更像一个内容加速器，而不是替你做全部创作。'
        : 'They are great for ideation, scripts, titles, thumbnails, editing, visuals, and repurposing content. Think of them as an accelerator, not a full replacement.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它是否能接住你的内容类型，比如短视频、长文、社媒、图文或播客。'
        : 'Start with the content format you actually make: short video, long-form writing, social posts, graphics, or podcasts.',
    },
    {
      question: isChinese ? '免费创作者工具够用吗？' : 'Are free creator tools enough?',
      answer: isChinese
        ? '如果只是试用和轻量产出，很多免费工具够用；但当你需要更一致的输出、批量处理或品牌风格时，很快会碰到限制。'
        : 'Free tiers are often enough for testing and light output. If you need consistent output, batch workflows, or brand control, limits show up quickly.',
    },
    {
      question: isChinese ? '我可以直接从这里找到创作者工具吗？' : 'Can I find creator tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从搜索和分类页开始，再结合评论、截图和更新频率判断。'
        : 'Yes. Start from search and categories, then use comments, screenshots, and update frequency to decide.',
    },
  ];
  const faqSchema = generateFAQSchema(faqs);
  const tips = isChinese
    ? [
        '先分清你的内容类型：短视频、图文、长文、播客或社媒。',
        '看它能不能帮你省掉脚本、封面、剪辑或再包装的时间。',
        '如果你会持续输出，优先看批量、模板、品牌一致性和导出限制。',
      ]
    : [
        'Separate your format first: short video, graphics, long-form writing, podcast, or social posts.',
        'Check whether it saves time on scripts, thumbnails, editing, or repurposing.',
        'If you publish regularly, prioritize batch workflows, templates, brand consistency, and export limits.',
      ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={faqSchema} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <PenTool className='size-4' />
              {isChinese ? '创作者工具推荐' : 'Creator tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Sparkles className='size-4' />
              {isChinese ? '内容效率优先' : 'Content efficiency'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 创作者工具推荐：怎么选更适合你的内容工作流'
              : 'AI tools for creators: how to choose one that fits your content workflow'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '创作者真正需要的不是“功能很多”，而是能稳定帮你把选题、脚本、封面、剪辑和再包装串起来。这个页面会帮你从内容类型和产出效率两个角度判断。'
              : 'Creators need more than "lots of features." The real win is a workflow that reliably connects ideation, scripting, thumbnails, editing, and repurposing. This page helps you judge by content type and output efficiency.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href='/explore?search=creator&sort=popular'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看创作者工具' : 'Browse creator tools'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/guides/how-to-choose-ai-tools'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到选型指南' : 'Back to selection guide'}
            </Link>
            <Link
              href='/guides/ai-writing-tools'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看写作工具' : 'Writing tools'}
            </Link>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看内容类型，再看省时点' : 'Start with content type, then time saved'}
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
              {isChinese ? '创作者工具通常在这些分类里' : 'Creator tools often sit in these categories'}
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
              {isChinese ? '创作者工具看什么' : 'What matters for creator tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能帮你稳定地产出内容' : 'Can it help you ship content consistently?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '创作者最重要的是节奏。你要看它是不是能帮你省掉脚本、封面、剪辑或再包装的时间。'
                  : 'For creators, cadence matters most. Check whether it saves time on scripts, thumbnails, editing, or repurposing.'}
              </p>
              <p>
                {isChinese
                  ? '如果你会持续发布，优先看批量、模板、品牌一致性和导出限制。'
                  : 'If you publish regularly, prioritize batch workflows, templates, brand consistency, and export limits.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '创作者最常见的问题' : 'Common questions about creator tools'}
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
