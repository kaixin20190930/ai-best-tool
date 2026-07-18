import { Metadata } from 'next';
import { ArrowRight, CheckCircle2, ExternalLink, GraduationCap, NotebookPen } from 'lucide-react';
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
      locale === 'cn' || locale === 'tw' ? 'AI 学生工具推荐 | AI Best Tool' : `AI tools for students | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向学习、写作、总结、笔记和作业协作的 AI 工具选型指南。'
        : 'A practical guide to AI tools for learning, writing, summarizing, notes, and homework collaboration.',
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
    { name: isChinese ? '选型指南' : 'Guides', url: `${siteUrl}/${locale}/guides/how-to-choose-ai-tools` },
    { name: isChinese ? '学生工具' : 'Student tools', url: `${siteUrl}/${locale}/guides/ai-tools-for-students` },
  ]);
  const faqs = [
    {
      question: isChinese ? '学生最适合用 AI 工具做什么？' : 'What are AI tools for students best for?',
      answer: isChinese
        ? '最适合查资料、整理笔记、总结文章、构思提纲、修改写作和做作业辅助。它们能帮你省时间，但最好保留自己的理解和判断。'
        : 'They are best for research, note organization, summarizing articles, outlining, writing help, and homework assistance. They save time, but your own understanding still matters.',
    },
    {
      question: isChinese ? '学生应该先看什么？' : 'What should students check first?',
      answer: isChinese
        ? '先看它是否支持你常用的语言、是否方便做总结和引用、以及是否能和笔记/文档工具配合。'
        : 'Start with language support, summarizing and citation workflow, and whether it works well with your notes/doc tools.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Is the free tier enough?',
      answer: isChinese
        ? '做日常学习和轻量写作很多时候够用；如果你需要更长上下文、批量处理或者更稳定的输出，可能会更快碰到限制。'
        : 'Free tiers are often enough for daily learning and light writing. If you need longer context, bulk processing, or steadier output, you may hit limits sooner.',
    },
    {
      question: isChinese ? '我可以直接找到学生常用工具吗？' : 'Can I find student-friendly tools directly from here?',
      answer: isChinese
        ? '可以。你可以先看搜索结果和分类页，再结合评论与截图判断。'
        : 'Yes. Start from search results and categories, then judge using comments and screenshots.',
    },
  ];
  const faqSchema = generateFAQSchema(faqs);
  const chineseTips = [
    '先分清用途：查资料、做笔记、写作业、做总结、练语言或做项目协作。',
    '看它是否容易和你的笔记、文档、浏览器或者学习平台配合。',
    '如果你每天都会用，优先看稳定性、引用和导出，而不是只看回答速度。',
  ];
  const englishTips = [
    'Separate the use case first: research, notes, homework, summaries, language practice, or project collaboration.',
    'Check whether it fits your notes, docs, browser, or learning platforms.',
    'If you will use it daily, prioritize stability, citations, and export over raw speed.',
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
              <GraduationCap className='size-4' />
              {isChinese ? '学生工具推荐' : 'Student tools recommendations'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <NotebookPen className='size-4' />
              {isChinese ? '学习与写作并重' : 'Learning and writing'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 学生工具推荐：怎么选更适合学习和作业'
              : 'AI tools for students: how to choose one for learning and homework'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '学生场景最需要的不是“最强”，而是“最顺手”。这个页面会帮你从学习、写作、总结和协作几个角度判断哪些工具真正适合学生使用。'
              : 'Students usually need tools that are not just powerful, but easy to use. This page helps you judge which tools fit learning, writing, summarizing, and collaboration.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=study&sort=popular'
              ctaId='students_guide_browse_tools'
              ctaLabel='Students guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看学生常用工具' : 'Browse student tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/how-to-choose-ai-tools'
              ctaId='students_guide_selection'
              ctaLabel='Students guide selection'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到选型指南' : 'Back to selection guide'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-students-comparison'
              ctaId='students_guide_compare'
              ctaLabel='Students guide compare'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看学生工具对比' : 'Compare student tools'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-student-tools'
              ctaId='students_guide_top_list'
              ctaLabel='Students guide top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看学生榜单' : 'Open student ranking'}
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
              ? '如果你已经明确自己是在找学习、作业、总结或笔记工具，就不要停在总览页，直接进入更窄的筛选路径。'
              : 'If learning, homework, summaries, or note workflows are already the job to solve, move straight into narrower selection paths.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-student-tools',
                title: isChinese ? '学生工具榜单' : 'Student ranking',
                desc: isChinese ? '直接看高意图 shortlist。' : 'Go straight to the high-intent shortlist.',
              },
              {
                href: '/guides/ai-tools-for-students-comparison',
                title: isChinese ? '学生工具对比' : 'Student tools comparison',
                desc: isChinese
                  ? '横向看学习、写作和笔记能力。'
                  : 'Compare learning, writing, and note-taking side by side.',
              },
              {
                href: '/guides/ai-note-taking-tools-comparison',
                title: isChinese ? '记笔记工具对比' : 'Note taking comparison',
                desc: isChinese ? '如果重点偏笔记整理和归纳。' : 'Better when note organization is the core need.',
              },
              {
                href: '/guides/ai-writing-tools-comparison',
                title: isChinese ? '写作工具对比' : 'Writing tools comparison',
                desc: isChinese ? '如果重点偏写作和改稿。' : 'Better when drafting and editing matter most.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`students_guide_${item.href.split('/').pop()}`}
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
              href='/best-ai-tools/ai-student-tools'
              ctaId='students_guide_top_list_secondary'
              ctaLabel='Students guide top list secondary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '打开学生榜单' : 'Open student ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/submit'
              ctaId='students_guide_submit'
              ctaLabel='Students guide submit'
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
              {isChinese ? '先看学习场景，再看使用成本' : 'Start with the learning task, then the cost of use'}
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
              {isChinese ? '学生常用工具通常在这些分类里' : 'Student tools often sit in these categories'}
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
              {isChinese ? '学生工具看什么' : 'What matters for student tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能真正帮你学得更轻松' : 'Can it actually make studying easier?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '学生工具最重要的是是否能帮你更快整理资料、做摘要、理解内容，而不是只在某个功能上看起来很强。'
                  : 'What matters most is whether it helps you organize material, summarize, and understand content faster, not just whether one feature looks impressive.'}
              </p>
              <p>
                {isChinese
                  ? '如果你是学生或学习型用户，优先看引用、导出、笔记协作和中文支持。'
                  : 'If you are a student or learning-focused user, prioritize citations, export, note collaboration, and language support.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '学生工具最常见的问题' : 'Common questions about student tools'}
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
              ? '把学生入口接到榜单、比较页和真实条目'
              : 'Move from the student guide into rankings, comparisons, and real listings'}
          </h2>
          <div className='mt-4 grid gap-4 lg:grid-cols-3'>
            <TrackableCtaLink
              href='/best-ai-tools/ai-student-tools'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
              ctaId='students_guide_ranking_next'
              ctaLabel='Students guide ranking next'
              pageType='guide'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '看学生榜单' : 'Open student ranking'}
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
              href='/guides/ai-tools-for-students-comparison'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
              ctaId='students_guide_compare_next'
              ctaLabel='Students guide compare next'
              pageType='guide'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '看学生工具对比' : 'Compare student tools'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '当学习场景已经清楚，就进入横向对比。'
                      : 'Once the study workflow is clear, move into side-by-side comparison.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/categories/productivity?sort=popular'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
              ctaId='students_guide_category'
              ctaLabel='Students guide category'
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

        <GuideEvidencePanel
          locale={locale}
          checkedAt={checkedAt}
          scope={
            isChinese
              ? '这页优先检查页面是否能帮助学生完成真实选择：学习任务、写作辅助、引用/总结、笔记协作和后续进入更细分类的路径。'
              : 'This page prioritizes whether the guide helps students make a real choice: learning tasks, writing help, citations/summaries, note collaboration, and next steps into narrower pages.'
          }
          decisionSteps={[
            isChinese
              ? '先判断你要的是查资料、做笔记、写作业还是整理知识。'
              : 'First decide whether you need research, note taking, homework help, or knowledge organization.',
            isChinese
              ? '如果方向清楚，就先去对应的学生对比页。'
              : 'If the direction is clear, go to the matching student comparison page first.',
            isChinese
              ? '如果要长期用，再回来补真实学习场景和导出案例。'
              : 'If you will use it long term, come back for real study scenarios and export cases.',
          ]}
          items={[
            {
              label: isChinese ? '判断维度' : 'Decision signals',
              value: isChinese ? '学习、写作、总结、协作' : 'Learning, writing, summaries, collaboration',
              note: isChinese
                ? `重点看它是否真的减轻学习和作业负担；当前分类数 ${categoryCount} 个。`
                : `We care about whether it actually reduces learning and homework friction; current category count is ${categoryCount}.`,
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '核心页保留索引' : 'Keep the core page indexable',
              note: isChinese
                ? '尽量减少和写作、笔记、总览页的重复。'
                : 'Minimize overlap with writing, note-taking, and hub pages.',
            },
            {
              label: isChinese ? '下一步补强' : 'Next enrichment',
              value: isChinese ? '补真实学习案例' : 'Add real student cases',
              note: isChinese
                ? '后续优先补学生使用场景、课程/作业样例和真实反馈。'
                : 'Next, priority additions are student scenarios, class assignment examples, and real feedback.',
            },
          ]}
          signalCards={[
            {
              label: isChinese ? '价格信号' : 'Pricing signal',
              value: isChinese
                ? '先看免费版、引用和导出限制'
                : 'Check the free tier, citations, and export limits first',
              note: isChinese
                ? '学生最容易卡在免费额度、导出和引用能力。'
                : 'Students usually hit free quotas, exports, and citation limits first.',
            },
            {
              label: isChinese ? '更新信号' : 'Freshness signal',
              value: isChinese
                ? '看模型、引用和笔记集成是否持续更新'
                : 'Check whether models, citations, and note integrations keep updating',
              note: isChinese
                ? '如果更新停留在回答变长，学习工作流通常不够稳。'
                : 'If updates stop at longer answers, the learning workflow is usually not mature enough.',
            },
            {
              label: isChinese ? '风险信号' : 'Risk signal',
              value: isChinese
                ? '没有引用 / 导出 / 稳定性就先降级'
                : 'Downgrade it without citations, export, or stability',
              note: isChinese
                ? '做学习和作业辅助时，这三项缺一项都要谨慎。'
                : 'For learning and homework help, missing any of those three is a warning sign.',
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
                ? `这页已按真实学生决策路径重新核对，保留学习、写作、总结和笔记入口；当前分类数 ${categoryCount} 个。`
                : `This page has been rechecked against a real student decision path and keeps learning, writing, summary, and note-taking entry points visible; current category count is ${categoryCount}.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '保留索引，补真实学习证据' : 'Keep it indexable and add real student evidence'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? `用课程、作业和引用案例把它和泛办公页区分开，并持续保留 ${checkedAt} 的核对痕迹。`
                : `Use class, homework, and citation examples to differentiate it from generic productivity pages while preserving the ${checkedAt} check trail.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '补真实学习场景和反馈' : 'Add real study scenarios and feedback'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '后续优先补学生使用案例、课程作业样例和真人评论，并持续保留 2026-07-15 的核对痕迹。'
                : 'Next, prioritize student cases, course assignment examples, and real comments while keeping the 2026-07-15 check trail up to date.'}
            </p>
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先用榜单缩小学生 shortlist' : 'Use the ranking to narrow your student shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己更偏学习、写作、总结或笔记整理，榜单页会比泛目录更快进入决策。'
              : 'If the decision is already about learning, writing, summarizing, or note organization, the ranking page gets to a decision faster than a broad directory.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-student-tools',
                title: isChinese ? '学生工具榜单' : 'Student ranking',
                desc: isChinese ? '直接看高意图 shortlist。' : 'Go straight to the high-intent shortlist.',
              },
              {
                href: '/best-ai-tools/ai-writing-tools',
                title: isChinese ? '写作工具榜单' : 'Writing tools ranking',
                desc: isChinese ? '如果你更常用在作业和改稿。' : 'Useful when homework and editing are the main jobs.',
              },
              {
                href: '/guides/ai-tools-for-students-comparison',
                title: isChinese ? '学生工具对比' : 'Student tools comparison',
                desc: isChinese
                  ? '横向看学习、笔记和作业协作。'
                  : 'Compare learning, notes, and homework collaboration side by side.',
              },
              {
                href: '/guides/ai-note-taking-tools-comparison',
                title: isChinese ? '记笔记工具对比' : 'Note taking comparison',
                desc: isChinese
                  ? '如果重点偏整理和归纳。'
                  : 'Better when organization and synthesis are the core need.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`students_guide_${item.href.split('/').pop()}`}
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
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_students' />
      </div>
    </>
  );
}
