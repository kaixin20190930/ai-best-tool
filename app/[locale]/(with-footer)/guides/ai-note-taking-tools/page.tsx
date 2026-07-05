import { Metadata } from 'next';
import { ArrowRight, CheckCircle2, ExternalLink, NotebookPen, Workflow } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import { Link } from '@/app/navigation';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.home',
  });

  return {
    title:
      locale === 'cn' || locale === 'tw' ? 'AI 记笔记工具推荐 | AI Best Tool' : `AI note taking tools | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '适合记笔记、会议助手和信息整理的 AI 工具推荐与选型指南。'
        : 'A practical guide to AI note taking tools for note taking, meeting assistance, and information organization.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '指南总览' : 'Guides', url: `${siteUrl}/${locale}/guides` },
    { name: isChinese ? '记笔记工具' : 'Note taking tools', url: `${siteUrl}/${locale}/guides/ai-note-taking-tools` },
  ]);
  const faqs = [
    {
      question: isChinese ? '记笔记工具最适合什么任务？' : 'What tasks are note taking tools best for?',
      answer: isChinese
        ? '最适合会议记录、灵感记录、知识整理、行动项提取和日常信息收集。'
        : 'They are great for meeting notes, idea capture, knowledge organization, action items, and everyday information collection.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它能不能接入你的笔记和会议工作流，比如文档、会议、录音或浏览器剪藏。'
        : 'Start with workflow fit: docs, meetings, audio, or web clipping integrations matter most.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Are free note taking tools enough?',
      answer: isChinese
        ? '如果只是个人整理，很多免费工具够用；如果你要团队协作、导出和更长历史，通常会更快碰到限制。'
        : 'For personal organization, free tools are often enough. If you need team collaboration, exports, and longer history, you may hit caps sooner.',
    },
    {
      question: isChinese ? '我可以直接从这里找到记笔记工具吗？' : 'Can I find note taking tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从相关分类和搜索结果开始，再结合评论和截图判断。'
        : 'Yes. Start from related categories and search results, then use comments and screenshots to decide.',
    },
  ];
  const tips = isChinese
    ? [
        '先确认你是要记会议、记灵感，还是整理知识。',
        '看它是否能接到你现在用的文档、会议或剪藏工具。',
        '如果你每天都会用，优先看协作、导出和搜索，而不是只看界面好不好看。',
      ]
    : [
        'Start with the job: meetings, ideas, or knowledge organization.',
        'Check whether it connects to the docs, meeting, or clipping tools you already use.',
        'If you will use it every day, prioritize collaboration, exports, and search over surface polish.',
      ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={generateFAQSchema(faqs)} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <NotebookPen className='size-4' />
              {isChinese ? '记笔记工具推荐' : 'Note taking tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Workflow className='size-4' />
              {isChinese ? '记录与整理优先' : 'Capture and organize first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 记笔记工具推荐：从会议到灵感记录，怎么选更合适'
              : 'AI note taking tools: how to choose for meetings and idea capture'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '记笔记工具重点不是“能不能写”，而是能不能稳定接入你的记录习惯，并且把信息变成后续可复用的知识。'
              : 'Note taking tools are not just about writing. They need to fit your capture habits and turn information into reusable knowledge.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=note&sort=popular'
              ctaId='note_taking_guide_browse_tools'
              ctaLabel='Note taking guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看记笔记工具' : 'Browse note taking tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-meeting-notes'
              ctaId='note_taking_guide_meeting_notes'
              ctaLabel='Note taking guide meeting notes'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到会议纪要指南' : 'Back to meeting notes guide'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-note-taking-tools-comparison'
              ctaId='note_taking_guide_compare'
              ctaLabel='Note taking guide compare'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看记笔记对比页' : 'Note taking comparison'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-note-taking-tools'
              ctaId='note_taking_guide_top_list'
              ctaLabel='Note taking guide top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看记笔记榜单' : 'Open note taking ranking'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图路径' : 'High-intent path'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '先看榜单，再进入对比页和真实条目'
              : 'Start with the ranking, then move into comparison and real listings'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经明确自己要解决的是会议记录、灵感整理或知识归档，就不要停在总览页，直接进入更窄的筛选路径。'
              : 'If meetings, idea capture, or knowledge organization are already the job to solve, move quickly into narrower selection paths.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-note-taking-tools',
                title: isChinese ? '记笔记榜单' : 'Note taking ranking',
                desc: isChinese ? '直接看高意图 shortlist。' : 'Go straight to the high-intent shortlist.',
              },
              {
                href: '/guides/ai-note-taking-tools-comparison',
                title: isChinese ? '记笔记工具对比' : 'Note taking comparison',
                desc: isChinese
                  ? '横向看记录、整理和搜索。'
                  : 'Compare capture, organization, and search side by side.',
              },
              {
                href: '/guides/ai-tools-for-meeting-notes-comparison',
                title: isChinese ? '会议纪要对比' : 'Meeting notes comparison',
                desc: isChinese ? '更偏会议记录与回看。' : 'Better for meeting capture and follow-up.',
              },
              {
                href: '/guides/ai-tools-for-research-comparison',
                title: isChinese ? '研究工具对比' : 'Research tools comparison',
                desc: isChinese ? '更偏资料整理和知识沉淀。' : 'Better for research and knowledge synthesis.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`note_taking_guide_${item.href.split('/').pop()}`}
                ctaLabel={item.title}
                pageType='guide'
                className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
              </TrackableCtaLink>
            ))}
          </div>
          <div className='mt-5 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/best-ai-tools/ai-note-taking-tools'
              ctaId='note_taking_guide_top_list_secondary'
              ctaLabel='Note taking guide top list secondary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '打开记笔记榜单' : 'Open note taking ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/submit'
              ctaId='note_taking_guide_submit'
              ctaLabel='Note taking guide submit'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-50'
            >
              {isChinese ? '提交你的工具' : 'Submit your tool'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看记录场景，再看整理和搜索' : 'Start with capture, then organization and search'}
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
              {isChinese ? '记笔记工具通常在这些分类里' : 'Note taking tools often sit in these categories'}
            </h2>
            <div className='mt-4 grid gap-2'>
              {categories
                .filter(
                  (category) =>
                    String(category.slug).includes('productivity') ||
                    String(category.slug).includes('writing') ||
                    String(getLocalizedField(category.name, 'en')).toLowerCase().includes('note'),
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
              {isChinese ? '记笔记工具看什么' : 'What matters for note taking tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能把零散信息变成可复用内容' : 'Can it turn loose information into reusable knowledge?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '记笔记工具最重要的是记录速度、整理能力和搜索能力。'
                  : 'Capture speed, organization, and searchability matter most.'}
              </p>
              <p>
                {isChinese
                  ? '如果你要团队使用，优先看协作、导出、权限和长期归档。'
                  : 'For team use, prioritize collaboration, exports, permissions, and long-term archiving.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '记笔记工具最常见的问题' : 'Common questions about note taking tools'}
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

        <section className='mt-8 rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '下一步怎么走' : 'Next step'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '把记笔记入口接到榜单、比较页和真实条目'
              : 'Move from the note taking guide into rankings, comparisons, and real listings'}
          </h2>
          <div className='mt-4 grid gap-4 lg:grid-cols-3'>
            <TrackableCtaLink
              href='/best-ai-tools/ai-note-taking-tools'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
              ctaId='note_taking_guide_ranking_next'
              ctaLabel='Note taking guide ranking next'
              pageType='guide'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '看记笔记榜单' : 'Open note taking ranking'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '如果你已经是高意图筛选，直接看 shortlist 会更快。'
                      : 'If intent is already high, the shortlist is the fastest next step.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-note-taking-tools-comparison'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
              ctaId='note_taking_guide_compare_next'
              ctaLabel='Note taking guide compare next'
              pageType='guide'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '看记笔记工具对比' : 'Compare note taking tools'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '当记录场景已经清楚，就进入横向对比。'
                      : 'Once the capture workflow is clear, move into side-by-side comparison.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/categories/productivity?sort=popular'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
              ctaId='note_taking_guide_category'
              ctaLabel='Note taking guide category'
              pageType='guide'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '进入 Productivity 分类' : 'Open the productivity category'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '先看真实条目，再回来缩窄候选。'
                      : 'Browse real listings first, then come back to narrow the shortlist.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '先用榜单缩小 note taking shortlist'
              : 'Use the ranking to narrow your note taking shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经明确是在找记笔记、信息整理或知识沉淀工具，先看榜单会比只看总览更快进入决策。'
              : 'If the decision is already about note taking, information organization, or knowledge capture, the ranking gets you to a decision faster than an overview alone.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-note-taking-tools',
                title: isChinese ? '记笔记榜单' : 'Note taking ranking',
                desc: isChinese ? '先看最值得试的候选。' : 'Start with the most relevant candidates first.',
              },
              {
                href: '/guides/ai-note-taking-tools-comparison',
                title: isChinese ? '记笔记对比' : 'Note taking comparison',
                desc: isChinese ? '记录、整理和搜索一起看。' : 'Compare capture, organization, and search together.',
              },
              {
                href: '/guides/ai-tools-for-meeting-notes-comparison',
                title: isChinese ? '会议纪要对比' : 'Meeting notes comparison',
                desc: isChinese
                  ? '如果重点偏会议记录和回看。'
                  : 'Useful when meetings and follow-up are the real focus.',
              },
              {
                href: '/guides/ai-tools-for-research-comparison',
                title: isChinese ? '研究工具对比' : 'Research tools comparison',
                desc: isChinese
                  ? '如果重点偏资料整理和知识沉淀。'
                  : 'Useful when research and knowledge synthesis matter more.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`note_taking_guide_ranking_${item.href.split('/').pop()}`}
                ctaLabel={item.title}
                pageType='guide'
                className='rounded-xl border border-white bg-white p-4 shadow-sm hover:bg-slate-50'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
              </TrackableCtaLink>
            ))}
          </div>
        </section>

        <GuideSubmissionPath locale={locale} ctaPrefix='ai_note_taking_tools' />
      </div>
    </>
  );
}
