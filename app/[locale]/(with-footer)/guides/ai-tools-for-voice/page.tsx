import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, AudioLines, ExternalLink, Mic, MicVocal } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import { StructuredDataServer } from '@/components/seo/StructuredData';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return {
    title: locale === 'cn' || locale === 'tw' ? 'AI 语音工具推荐 | AI Best Tool' : `AI voice tools | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '适合语音合成、转写、配音和对话助手的 AI 工具推荐与选型指南。'
        : 'A practical guide to AI voice tools for voice synthesis, transcription, dubbing, and conversational assistants.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '指南总览' : 'Guides', url: `${siteUrl}/${locale}/guides` },
    { name: isChinese ? '语音工具' : 'Voice tools', url: `${siteUrl}/${locale}/guides/ai-tools-for-voice` },
  ]);
  const faqs = [
    {
      question: isChinese ? '语音工具通常用来做什么？' : 'What are voice tools used for?',
      answer: isChinese
        ? '最常见的是语音合成、转写、配音、会议记录和语音对话助手。'
        : 'Common uses include voice synthesis, transcription, dubbing, meeting capture, and conversational assistants.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看音质、转写准确度、语言覆盖、延迟和是否适合你的工作流。'
        : 'Start with voice quality, transcription accuracy, language coverage, latency, and workflow fit.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Is a free tier enough?',
      answer: isChinese
        ? '试用通常够用；但如果你要批量生成、商用导出或团队协作，通常很快会遇到限制。'
        : 'Free tiers are often enough to test, but bulk generation, commercial use, and collaboration usually hit limits quickly.',
    },
    {
      question: isChinese ? '我可以直接从这里找到语音工具吗？' : 'Can I find voice tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从语音分类页、对比页和真实工具页一起看。'
        : 'Yes. Start from the voice category, the comparison page, and real tool pages together.',
    },
  ];
  const tips = isChinese
    ? [
        '先分清你是在做配音、转写、会议记录，还是语音对话。',
        '看它支持哪些语言、声音风格和导出格式。',
        '如果要长期使用，重点看延迟、准确度和批量能力，而不只是试听效果。',
      ]
    : [
        'Separate dubbing, transcription, meeting capture, and conversational voice use cases first.',
        'Check language support, voice styles, and export formats.',
        'For long-term use, prioritize latency, accuracy, and bulk workflows over demo polish.',
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
              {isChinese ? '语音工具推荐' : 'Voice tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <AudioLines className='size-4' />
              {isChinese ? '合成 + 转写 + 对话' : 'Synthesis + transcription + conversation'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 语音工具推荐：从转写到配音，怎么选更适合你的工作流'
              : 'AI voice tools: how to choose for transcription, dubbing, and assistants'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '语音工具真正重要的不是“声音好不好听”，而是能不能稳定适配你的内容、会议和对话工作流。这个页面会从音质、准确度、延迟和批量能力几个方向帮你判断。'
              : 'Voice tools are not just about sounding good. They need to fit your content, meeting, and conversational workflows reliably. This page helps you judge by quality, accuracy, latency, and bulk use.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href='/explore?search=voice&sort=popular'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看语音类工具' : 'Browse voice tools'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/guides/ai-tools-for-meeting-notes'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到会议纪要指南' : 'Back to meeting notes'}
            </Link>
            <Link
              href='/guides/ai-tools-for-voice-comparison'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看语音工具对比' : 'Compare voice tools'}
            </Link>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看使用场景，再看声音和流程' : 'Start with the use case, then the voice and workflow'}
            </h2>
            <div className='mt-4 space-y-3'>
              {tips.map((tip) => (
                <div key={tip} className='rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700'>
                  <div className='flex items-start gap-3'>
                    <MicVocal className='mt-0.5 size-4 shrink-0 text-emerald-600' />
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
              {isChinese ? '语音工具通常在这些分类里' : 'Voice tools often sit in these categories'}
            </h2>
            <div className='mt-4 grid gap-2'>
              {categories
                .filter(
                  (category) =>
                    String(category.slug).includes('voice') ||
                    String(category.slug).includes('meeting') ||
                    String(getLocalizedField(category.name, 'en')).toLowerCase().includes('voice'),
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

        <section className='mt-8 rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '下一步怎么走' : 'Next step'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '把语音入口接到比较页和真实条目'
              : 'Move from the voice guide into comparisons and real listings'}
          </h2>
          <div className='mt-4 grid gap-4 lg:grid-cols-3'>
            <Link
              href='/guides/ai-tools-for-voice-comparison'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '看语音工具对比' : 'Compare voice tools'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '如果你已经知道自己在做转写、配音或对话，就直接横向比较。'
                      : 'If transcription, dubbing, or conversation is already clear, move straight into comparison.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </Link>
            <Link
              href='/categories/voice?sort=popular'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '进入 Voice 分类' : 'Open the voice category'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '先看真实条目，再回来收敛到更窄的候选。'
                      : 'Browse real listings first, then come back to narrow the shortlist.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </Link>
            <Link
              href='/explore?search=voice&sort=popular'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '搜索更多语音工具' : 'Search more voice tools'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '如果你想扩大候选范围，可以回到探索页继续筛。'
                      : 'Use Explore to widen the shortlist a little further.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </Link>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '语音工具看什么' : 'What matters for voice tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能稳定融入你的声音工作流' : 'Can it fit into your voice workflow reliably?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '语音工具最重要的是音质、准确度和延迟。不同工具在这些维度上的差异，会直接影响你最后能不能真的持续使用。'
                  : 'The key dimensions are quality, accuracy, and latency. Differences here decide whether the tool actually becomes part of your workflow.'}
              </p>
              <p>
                {isChinese
                  ? '如果你是做播客、配音或对话助手，优先看语言覆盖、批量生成和导出格式。'
                  : 'For podcasts, dubbing, or conversational assistants, prioritize language coverage, bulk generation, and export formats.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '语音工具最常见的问题' : 'Common questions about voice tools'}
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
