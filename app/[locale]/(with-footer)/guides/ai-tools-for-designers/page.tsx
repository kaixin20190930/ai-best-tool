import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, ExternalLink, Paintbrush, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import { StructuredDataServer } from '@/components/seo/StructuredData';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return {
    title:
      locale === 'cn' || locale === 'tw'
        ? 'AI 设计师工具推荐 | AI Best Tool'
        : `AI tools for designers | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向设计师、品牌和视觉工作流的 AI 工具选型指南。'
        : 'A practical guide to AI tools for designers, brands, and visual workflows.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '选型指南' : 'Guides', url: `${siteUrl}/${locale}/guides/how-to-choose-ai-tools` },
    { name: isChinese ? '设计工具' : 'Design tools', url: `${siteUrl}/${locale}/guides/ai-tools-for-designers` },
  ]);
  const faqs = [
    {
      question: isChinese ? '设计师最适合用 AI 做什么？' : 'What are designers best using AI for?',
      answer: isChinese
        ? '最适合灵感草图、版式提案、文案辅助、抠图、风格探索和品牌素材的快速变体。'
        : 'They are great for concept sketches, layout ideas, copy help, background removal, style exploration, and quick brand variations.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它是否适合你的输出类型，比如海报、社媒、UI、品牌图或营销视觉。'
        : 'Start with the output type: posters, social assets, UI, brand visuals, or marketing imagery.',
    },
    {
      question: isChinese ? '免费设计工具够用吗？' : 'Are free design tools enough?',
      answer: isChinese
        ? '轻量试用常常够用；但如果你需要分辨率、商用授权、品牌一致性和批量处理，限制会很快出现。'
        : 'Free tiers are often fine for testing. If you need resolution, commercial licensing, brand consistency, and batch workflows, limits appear quickly.',
    },
    {
      question: isChinese ? '我可以直接从这里找到设计工具吗？' : 'Can I find design tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从搜索和分类页开始，再结合评论、截图和更新频率判断。'
        : 'Yes. Start from search and categories, then judge with comments, screenshots, and update frequency.',
    },
  ];
  const faqSchema = generateFAQSchema(faqs);
  const tips = isChinese
    ? [
        '先分清你是在做品牌、营销图、海报、UI 还是社媒素材。',
        '看它能不能稳定输出风格一致的视觉。',
        '如果要商业使用，优先看授权、分辨率和批量能力。',
      ]
    : [
        'Separate the use case first: brand, marketing assets, posters, UI, or social visuals.',
        'Check whether it can keep styles consistent.',
        'If you use it commercially, prioritize licensing, resolution, and batch workflows.',
      ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={faqSchema} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Paintbrush className='size-4' />
              {isChinese ? '设计工具推荐' : 'Design tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Sparkles className='size-4' />
              {isChinese ? '视觉与品牌优先' : 'Visual and brand first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 设计师工具推荐：怎么选更适合你的视觉工作流'
              : 'AI tools for designers: how to choose one that fits your visual workflow'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '设计工作看重的不只是“能出图”，而是能不能保持品牌一致性、输出质量和商业授权。这个页面会帮你从输出类型和视觉控制两个角度判断。'
              : 'Design work is not only about making images. It is about brand consistency, quality, and commercial rights. This page helps you judge by output type and visual control.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href='/explore?search=design&sort=popular'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看设计工具' : 'Browse design tools'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/guides/how-to-choose-ai-tools'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到选型指南' : 'Back to selection guide'}
            </Link>
            <Link
              href='/guides/ai-image-tools'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看图像工具' : 'Image tools'}
            </Link>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看输出类型，再看视觉控制' : 'Start with output type, then visual control'}
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
              {isChinese ? '设计工具通常在这些分类里' : 'Design tools often sit in these categories'}
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
              {isChinese ? '设计工具看什么' : 'What matters for design tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能稳定帮你做出可用视觉' : 'Can it reliably produce usable visuals?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '设计工具最重要的是视觉一致性和可控性。你要看它是否支持你实际要交付的素材类型。'
                  : 'Consistency and control matter most. Check whether it supports the exact assets you need to deliver.'}
              </p>
              <p>
                {isChinese
                  ? '如果你做品牌或商业设计，优先看授权、分辨率和批量能力。'
                  : 'If you work in brand or commercial design, prioritize licensing, resolution, and batch workflows.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '设计工具最常见的问题' : 'Common questions about design tools'}
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
