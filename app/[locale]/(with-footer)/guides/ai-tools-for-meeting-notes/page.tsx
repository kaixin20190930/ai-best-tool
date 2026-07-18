import { Metadata } from 'next';
import { ArrowRight, CheckCircle2, ExternalLink, Mic, Workflow } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
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
      locale === 'cn' || locale === 'tw'
        ? 'AI 会议纪要工具推荐 | AI Best Tool'
        : `AI tools for meeting notes | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '适合会议记录、纪要整理和行动项提取的 AI 工具推荐与选型指南。'
        : 'A practical guide to AI tools for meeting notes, transcription, and action-item extraction.',
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const checkedAt = '2026-07-18';
  const categoryCount = categories.length;
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
            <TrackableCtaLink
              href='/explore?search=meeting&sort=popular'
              ctaId='meeting_notes_guide_browse_tools'
              ctaLabel='Meeting notes guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看会议纪要工具' : 'Browse meeting notes tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-productivity-tools'
              ctaId='meeting_notes_guide_productivity'
              ctaLabel='Meeting notes guide productivity'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到生产力指南' : 'Back to productivity guide'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-meeting-notes-comparison'
              ctaId='meeting_notes_guide_compare'
              ctaLabel='Meeting notes guide compare'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看会议对比页' : 'Meeting comparison'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-meeting-notes-tools'
              ctaId='meeting_notes_guide_top_list'
              ctaLabel='Meeting notes guide top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看会议纪要榜单' : 'Open meeting notes ranking'}
            </TrackableCtaLink>
          </div>
        </section>

        <GuideEvidencePanel
          locale={locale}
          scope={
            isChinese
              ? '这页优先判断会议纪要工具是否真的能接住转写、整理和行动项，而不是只展示看起来正确的总结。'
              : 'This page checks whether a meeting notes tool truly handles transcription, cleanup, and action items instead of only showing summaries that look correct.'
          }
          checkedAt={checkedAt}
          decisionSteps={[
            isChinese
              ? '先判断你要的是转写、纪要整理，还是行动项提取。'
              : 'First decide whether you need transcription, note cleanup, or action-item extraction.',
            isChinese
              ? '如果方向清楚，就先看对应的会议对比页。'
              : 'If the goal is clear, go to the matching meeting comparison page first.',
            isChinese
              ? '如果要长期用，再回来补真实会议案例和共享协作痕迹。'
              : 'If you will use it long term, come back for real meeting cases and collaboration traces.',
          ]}
          items={[
            {
              label: isChinese ? '验证范围' : 'Checked scope',
              value: isChinese ? '转写、整理、行动项、协作' : 'Transcription, cleanup, action items, collaboration',
              note: isChinese
                ? `先确认它是否稳稳接入你的会议记录流程；当前分类数 ${categoryCount} 个。`
                : `First confirm that it fits your meeting capture workflow; current category count is ${categoryCount}.`,
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '保留索引，配合榜单与对比页' : 'Indexable with ranking and comparison paths',
              note: isChinese
                ? '它会把用户继续引向更窄的高意图路径。'
                : 'It funnels users into narrower high-intent paths.',
            },
            {
              label: isChinese ? '下一步增强' : 'Next enrichment',
              value: isChinese ? '补真实案例、样例纪要和评论' : 'Add real cases, sample notes, and comments',
              note: isChinese
                ? `用真实使用痕迹替代空泛描述，并保持 ${checkedAt} 的核对记录。`
                : `Replace generic copy with real usage evidence while keeping the ${checkedAt} verification record.`,
            },
          ]}
        />

        <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '最近验证' : 'Last checked'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>{checkedAt}</p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? `这页已按真实会议纪要决策重新核对，优先保留转写、行动项和协作入口；当前分类数 ${categoryCount} 个。`
                : `This page has been rechecked against a real meeting-notes decision and keeps transcription, action items, and collaboration entry points visible; current category count is ${categoryCount}.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese
                ? '保留索引，强化纪要工作流证据'
                : 'Keep it indexable and strengthen meeting-workflow evidence'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? `用转写准确率、行动项和共享协作来和笔记页区分，并持续保留 ${checkedAt} 的核对痕迹。`
                : `Use transcription quality, action items, and collaboration handoffs to differentiate it from note-taking pages while preserving the ${checkedAt} check trail.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '补真实会议与行动项案例' : 'Add real meeting and action-item cases'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? `后续优先补真实转写样例、行动项复盘和团队协作记录，并持续保留 ${checkedAt} 的核对痕迹。`
                : `Next, prioritize transcription samples, action-item retros, and team collaboration notes while keeping the ${checkedAt} check trail up to date.`}
            </p>
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
              ? '如果你已经明确自己是在找转写、纪要整理或行动项抽取工具，就不要停在总览页，直接进入更窄的筛选路径。'
              : 'If transcription, cleanup, or action extraction is already the main job to solve, move straight into narrower selection paths.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-meeting-notes-tools',
                title: isChinese ? '会议纪要榜单' : 'Meeting notes ranking',
                desc: isChinese ? '直接看高意图 shortlist。' : 'Go straight to the high-intent shortlist.',
              },
              {
                href: '/guides/ai-tools-for-meeting-notes-comparison',
                title: isChinese ? '会议纪要对比' : 'Meeting notes comparison',
                desc: isChinese
                  ? '横向看转写、整理和行动项。'
                  : 'Compare transcription, cleanup, and action items side by side.',
              },
              {
                href: '/guides/ai-note-taking-tools-comparison',
                title: isChinese ? '记笔记工具对比' : 'Note taking comparison',
                desc: isChinese ? '如果重点偏长期记录与沉淀。' : 'Better when long-term note capture matters more.',
              },
              {
                href: '/guides/ai-productivity-tools-comparison',
                title: isChinese ? '生产力工具对比' : 'Productivity comparison',
                desc: isChinese ? '如果重点偏日常效率和协作。' : 'Better when broader daily productivity matters most.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`meeting_notes_guide_${item.href.split('/').pop()}`}
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
              href='/best-ai-tools/ai-meeting-notes-tools'
              ctaId='meeting_notes_guide_top_list_secondary'
              ctaLabel='Meeting notes guide top list secondary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '打开会议纪要榜单' : 'Open meeting notes ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/submit'
              ctaId='meeting_notes_guide_submit'
              ctaLabel='Meeting notes guide submit'
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

        <section className='mt-8 rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '下一步怎么走' : 'Next step'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '把会议纪要入口接到榜单、比较页和真实条目'
              : 'Move from the meeting notes guide into rankings, comparisons, and real listings'}
          </h2>
          <div className='mt-4 grid gap-4 lg:grid-cols-3'>
            <TrackableCtaLink
              href='/best-ai-tools/ai-meeting-notes-tools'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
              ctaId='meeting_notes_guide_ranking_next'
              ctaLabel='Meeting notes guide ranking next'
              pageType='guide'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '看会议纪要榜单' : 'Open meeting notes ranking'}
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
              href='/guides/ai-tools-for-meeting-notes-comparison'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
              ctaId='meeting_notes_guide_compare_next'
              ctaLabel='Meeting notes guide compare next'
              pageType='guide'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '看会议纪要对比' : 'Compare meeting notes tools'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '当会议场景已经清楚，就进入横向对比。'
                      : 'Once the meeting workflow is clear, move into side-by-side comparison.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/categories/productivity?sort=popular'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
              ctaId='meeting_notes_guide_category'
              ctaLabel='Meeting notes guide category'
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
              ? '先用榜单缩小 meeting notes shortlist'
              : 'Use the ranking to narrow your meeting notes shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经明确是在找转写、纪要整理或行动项抽取工具，先看榜单会比只看总览更快进入决策。'
              : 'If the decision is already about transcription, cleanup, or action extraction, the ranking gets you to a decision faster than an overview alone.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-meeting-notes-tools',
                title: isChinese ? '会议纪要榜单' : 'Meeting notes ranking',
                desc: isChinese ? '先看最值得试的候选。' : 'Start with the most relevant candidates first.',
              },
              {
                href: '/guides/ai-tools-for-meeting-notes-comparison',
                title: isChinese ? '会议纪要对比' : 'Meeting notes comparison',
                desc: isChinese
                  ? '转写、整理和行动项一起看。'
                  : 'Compare transcription, cleanup, and action items together.',
              },
              {
                href: '/guides/ai-note-taking-tools-comparison',
                title: isChinese ? '记笔记对比' : 'Note-taking comparison',
                desc: isChinese ? '如果重点偏长期记录与沉淀。' : 'Useful when long-term note capture matters more.',
              },
              {
                href: '/guides/ai-productivity-tools-comparison',
                title: isChinese ? '生产力对比' : 'Productivity comparison',
                desc: isChinese
                  ? '如果重点偏日常效率和协作。'
                  : 'Useful when daily productivity and collaboration matter more.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`meeting_notes_guide_ranking_${item.href.split('/').pop()}`}
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
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_meeting_notes' />
      </div>
    </>
  );
}
