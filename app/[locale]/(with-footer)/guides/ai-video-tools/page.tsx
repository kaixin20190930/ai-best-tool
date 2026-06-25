import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, Clapperboard, ExternalLink, Film } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';
import { StructuredDataServer } from '@/components/seo/StructuredData';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.home',
  });

  return {
    title:
      locale === 'cn' || locale === 'tw'
        ? 'AI 视频工具推荐 | AI Best Tool'
        : `AI video tools recommendations | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向剪辑、生成、配音和营销视频的 AI 工具选型指南。'
        : 'A practical guide to AI tools for editing, generation, voiceover, and marketing videos.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '选型指南' : 'Guides', url: `${siteUrl}/${locale}/guides/how-to-choose-ai-tools` },
    { name: isChinese ? '视频工具' : 'Video tools', url: `${siteUrl}/${locale}/guides/ai-video-tools` },
  ]);
  const faqs = [
    {
      question: isChinese ? 'AI 视频工具最适合做什么？' : 'What are AI video tools best for?',
      answer: isChinese
        ? '最适合粗剪、字幕、配音、短视频生成、营销视频和内容再包装。它们能明显省时间，但仍建议保留人工审核。'
        : 'They are best for rough cuts, captions, voiceover, short-form generation, marketing clips, and content repurposing. They save time, but human review is still important.',
    },
    {
      question: isChinese ? '我应该先看剪辑还是生成？' : 'Should I focus on editing or generation first?',
      answer: isChinese
        ? '如果你手里已经有素材，先看剪辑、字幕和配音；如果你更想快速从文本或脚本出片，再重点看生成能力。'
        : 'If you already have footage, start with editing, captions, and voiceover. If you want to turn text or scripts into video quickly, focus on generation.',
    },
    {
      question: isChinese ? '免费的视频工具够用吗？' : 'Are free video tools enough?',
      answer: isChinese
        ? '简单剪辑、字幕和试用通常够用；但如果你要批量出片、导出高质量或团队协作，免费额度通常会比较快见底。'
        : 'Free tiers are often enough for basic edits, captions, and testing. If you need bulk output, higher export quality, or collaboration, you may hit limits quickly.',
    },
    {
      question: isChinese ? '我可以直接从这里找视频类工具吗？' : 'Can I find video tools from here directly?',
      answer: isChinese
        ? '可以。你可以从分类页和搜索结果入手，再结合评论、截图和更新频率判断。'
        : 'Yes. Start from categories and search results, then use comments, screenshots, and freshness to decide.',
    },
  ];
  const faqSchema = generateFAQSchema(faqs);
  const chineseTips = [
    '先分清你的任务：剪辑、字幕、配音、生成视频、营销视频，会影响你看什么功能。',
    '看它是否支持你的素材格式、是否有模板、是否能稳定导出。',
    '如果你要长期用，优先看批量、协作和水印/导出限制，而不只是预览效果。',
  ];
  const englishTips = [
    'Start by separating your task: editing, captions, voiceover, generation, or marketing videos all need different features.',
    'Check supported formats, templates, and whether exports are reliable.',
    'If you will use it regularly, look at bulk workflows, collaboration, and export/watermark limits, not only previews.',
  ];
  const tips = isChinese ? chineseTips : englishTips;

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={faqSchema} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Clapperboard className='size-4' />
              {isChinese ? '视频工具推荐' : 'Video tools recommendations'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Film className='size-4' />
              {isChinese ? '剪辑与生成并重' : 'Editing and generation'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 视频工具推荐：怎么选更适合你的内容流程'
              : 'AI video tools: how to choose one that fits your content workflow'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '视频工具的关键不只是“能不能生成”，而是能不能帮你更快完成剪辑、字幕、配音和导出。这个页面会从任务、素材、限制和协作四个角度帮你判断。'
              : 'Video tools are not just about generation. They should help you finish editing, captions, voiceover, and export faster. This page helps you judge by task, assets, limits, and collaboration.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href='/explore?search=video&sort=popular'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看视频类工具' : 'Browse video tools'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/guides/how-to-choose-ai-tools'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到选型指南' : 'Back to selection guide'}
            </Link>
            <Link
              href='/guides/ai-video-tools-comparison'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看视频工具对比' : 'Compare video tools'}
            </Link>
            <TrackableCtaLink
              href='/best-ai-tools/ai-video-tools'
              ctaId='video_guide_top_list'
              ctaLabel='Video guide top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看视频榜单' : 'Open video ranking'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看任务，再看素材和输出' : 'Start with the task, then the assets and output'}
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
              {isChinese ? '视频类工具通常在这些分类里' : 'Video tools often sit in these categories'}
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
              {isChinese ? '视频工具看什么' : 'What matters for video tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能稳定帮你出片' : 'Can it reliably help you ship videos?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '视频工具最重要的是稳定、导出和流程是否顺手。你要特别看它能否支持你的素材类型、字幕流程和最终输出格式。'
                  : 'The key is stability, export, and workflow fit. Check whether it supports your asset types, captioning flow, and output format.'}
              </p>
              <p>
                {isChinese
                  ? '如果你是做短视频、营销视频或内容复用，优先看模板、批量处理、配音和字幕能力。'
                  : 'If you make short-form videos, marketing clips, or content repurposing assets, focus on templates, batch processing, voiceover, and captions.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '视频工具最常见的问题' : 'Common questions about video tools'}
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
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_video_tools' />
      </div>
    </>
  );
}
