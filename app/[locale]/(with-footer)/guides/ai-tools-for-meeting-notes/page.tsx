import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, ExternalLink, Mic, Workflow } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
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
        ? 'AI 会议纪要工具推荐 | AI Best Tool'
        : `AI tools for meeting notes | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '适合会议记录、纪要整理和行动项提取的 AI 工具推荐与选型指南。'
        : 'A practical guide to AI tools for meeting notes, transcription, and action-item extraction.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '指南总览' : 'Guides', url: `${siteUrl}/${locale}/guides` },
    {
      name: isChinese ? '会议纪要工具' : 'Meeting notes tools',
      url: `${siteUrl}/${locale}/guides/ai-tools-for-meeting-notes`,
    },
  ]);
  const faqs = [
    {
      question: isChinese ? '会议纪要工具最适合什么任务？' : 'What tasks are meeting notes tools best for?',
      answer: isChinese
        ? '最适合会议转写、纪要整理、行动项提取、待办整理和会议后总结。'
        : 'They are great for transcription, note cleanup, action-item extraction, to-do creation, and post-meeting summaries.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它是否能接入你的会议方式，比如 Zoom、Meet、Teams 或录音文件。'
        : 'Start with the meeting source it can handle, such as Zoom, Meet, Teams, or audio files.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Are free meeting notes tools enough?',
      answer: isChinese
        ? '如果只是偶尔做会议纪要，很多免费工具够用；如果你要持续转写、团队协作和更长历史，通常会更快碰到限制。'
        : 'For occasional notes, free tools are often enough. For ongoing transcription, team collaboration, and longer history, you may hit limits sooner.',
    },
    {
      question: isChinese
        ? '我可以直接从这里找到会议纪要工具吗？'
        : 'Can I find meeting notes tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从会议相关分类和搜索结果开始，再结合评论和截图判断。'
        : 'Yes. Start from meeting-related categories and search results, then use comments and screenshots to decide.',
    },
  ];
  const tips = isChinese
    ? [
        '先确认你要的是转写、纪要整理，还是行动项抽取。',
        '看它是否支持你现在用的会议工具和录音格式。',
        '如果你每天开很多会，优先看协作、导出和历史记录，而不是只看转写速度。',
      ]
    : [
        'Start with the job: transcription, note cleanup, or action-item extraction.',
        'Check whether it supports the meeting tools and audio formats you already use.',
        'If you run many meetings, prioritize collaboration, exports, and history over pure speed.',
      ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={generateFAQSchema(faqs)} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Mic className='size-4' />
              {isChinese ? '会议纪要工具推荐' : 'Meeting notes tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Workflow className='size-4' />
              {isChinese ? '记录与整理优先' : 'Notes and workflow first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 会议纪要工具推荐：从转写到行动项整理，怎么选更合适'
              : 'AI tools for meeting notes: how to choose for transcription and action items'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '会议纪要工具重点不是“能不能转写”，而是能不能稳定接入你的会议流程，并且把记录变成可执行的后续动作。'
              : 'Meeting notes tools are not just about transcription. They need to fit your meeting workflow and turn notes into actionable follow-ups.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href='/explore?search=meeting&sort=popular'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看会议纪要工具' : 'Browse meeting notes tools'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/guides/ai-productivity-tools'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到生产力指南' : 'Back to productivity guide'}
            </Link>
            <Link
              href='/guides/ai-tools-for-meeting-notes-comparison'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看会议对比页' : 'Meeting comparison'}
            </Link>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese
                ? '先看会议场景，再看转写和整理'
                : 'Start with the meeting workflow, then transcription and cleanup'}
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
              {isChinese ? '会议纪要工具通常在这些分类里' : 'Meeting notes tools often sit in these categories'}
            </h2>
            <div className='mt-4 grid gap-2'>
              {categories
                .filter(
                  (category) =>
                    String(category.slug).includes('productivity') ||
                    String(category.slug).includes('writing') ||
                    String(getLocalizedField(category.name, 'en')).toLowerCase().includes('meeting'),
                )
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
              {isChinese ? '会议纪要工具看什么' : 'What matters for meeting notes tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能帮你把会后工作变轻' : 'Can it make follow-up work lighter?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '会议纪要工具最重要的是转写准确性、整理能力和行动项提取。'
                  : 'Transcription quality, note cleanup, and action-item extraction matter most.'}
              </p>
              <p>
                {isChinese
                  ? '如果你要团队使用，优先看协作、导出、权限和历史记录。'
                  : 'For team use, prioritize collaboration, exports, permissions, and history.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '会议纪要工具最常见的问题' : 'Common questions about meeting notes tools'}
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
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_meeting_notes' />
      </div>
    </>
  );
}
