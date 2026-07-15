import { Metadata } from 'next';
import { ArrowRight, CheckCircle2, ExternalLink, Timer, Workflow } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

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
        ? 'AI 生产力工具推荐 | AI Best Tool'
        : `AI productivity tools recommendations | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向效率提升、任务管理、写作协作和知识整理的 AI 生产力工具选型指南。'
        : 'A practical guide to AI productivity tools for efficiency, task management, writing collaboration, and knowledge organization.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const checkedAt = '2026-07-15';
  const categoryCount = categories.length;
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
  const chineseTips = [
    '先分清你的任务：待办、会议纪要、文档协作、知识整理、邮件或自动化。',
    '看它是否能接到你已经在用的工作工具。',
    '如果你每天都要用，优先看稳定性、协作和自动化，而不是单次演示效果。',
  ];
  const englishTips = [
    'Separate your task first: to-dos, notes, docs collaboration, knowledge organization, email, or automation.',
    'Check whether it connects to the tools you already use.',
    'If you will use it every day, prioritize stability, collaboration, and automation over demo flair.',
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
              <Workflow className='size-4' />
              {isChinese ? '生产力工具推荐' : 'Productivity tools recommendations'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Timer className='size-4' />
              {isChinese ? '效率优先' : 'Efficiency first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 生产力工具推荐：怎么选才真正省时间'
              : 'AI productivity tools: how to choose one that actually saves time'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '生产力工具的价值不是“能做很多事”，而是“能把日常重复工作变轻”。这个页面会从任务、工作流、协作和自动化几个角度帮你判断。'
              : 'The value of productivity tools is not "it can do a lot." It is whether it makes repetitive daily work lighter. This page helps you judge by task, workflow, collaboration, and automation.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=productivity&sort=popular'
              ctaId='productivity_guide_browse_tools'
              ctaLabel='Productivity guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看生产力工具' : 'Browse productivity tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/how-to-choose-ai-tools'
              ctaId='productivity_guide_selection'
              ctaLabel='Productivity guide selection'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到选型指南' : 'Back to selection guide'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-productivity-tools-comparison'
              ctaId='productivity_guide_compare'
              ctaLabel='Productivity guide compare'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看生产力工具对比' : 'Compare productivity tools'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-productivity-tools'
              ctaId='productivity_guide_top_list'
              ctaLabel='Productivity guide top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看生产力榜单' : 'Open productivity ranking'}
            </TrackableCtaLink>
          </div>
        </section>

        <GuideEvidencePanel
          locale={locale}
          checkedAt={checkedAt}
          scope={
            isChinese
              ? '这页优先判断工具是否真的能让日常工作更轻：能否接入现有流程、是否有稳定协作、是否支持自动化和长期使用，并把榜单和真实条目连起来。'
              : 'This page judges whether a tool truly lightens daily work: integration with existing workflows, collaboration stability, automation support, and long-term usability, while connecting rankings and real listings.'
          }
          items={[
            {
              label: isChinese ? '验证范围' : 'Checked scope',
              value: isChinese
                ? '工作流、协作、自动化、稳定性 + 榜单'
                : 'Workflow, collaboration, automation, stability + rankings',
              note: isChinese
                ? `当前可参考的分类信号有 ${categoryCount} 个，继续把真实日常案例放进去。`
                : `${categoryCount} category signals are available, and the page should keep adding real daily-use cases.`,
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '核心生产力入口保留索引' : 'Core productivity entry kept indexable',
              note: isChinese
                ? '与分类和榜单一起，形成高频搜索入口。'
                : 'Together with categories and rankings, it forms a frequent-search entry path.',
            },
            {
              label: isChinese ? '下一步补强' : 'Next enrichment',
              value: isChinese ? '补真实场景、反馈、最近验证' : 'Add real scenarios, feedback, and recent verification',
              note: isChinese
                ? '后续会继续补评论、收藏、认领和验证日期。'
                : 'Next, comments, saves, claims, and verification dates should be added.',
            },
          ]}
          signalCards={[
            {
              label: isChinese ? '价格信号' : 'Pricing signal',
              value: isChinese
                ? '先看免费层、团队席位和自动化限制'
                : 'Check free tier, team seats, and automation limits first',
              note: isChinese
                ? '生产力工具最容易在协作和自动化上出现付费门槛。'
                : 'Productivity tools often gate collaboration and automation behind paid plans.',
            },
            {
              label: isChinese ? '更新信号' : 'Freshness signal',
              value: isChinese
                ? '看最近是否还在更新任务、笔记和协作功能'
                : 'Check whether tasks, notes, and collaboration features are still being updated',
              note: isChinese
                ? '长期使用的工具必须持续打磨日常工作流。'
                : 'Long-term tools need ongoing refinement of daily workflows.',
            },
            {
              label: isChinese ? '风险信号' : 'Risk signal',
              value: isChinese ? '没有真实工作流就别只看 Demo' : 'Do not judge by demo alone without a real workflow',
              note: isChinese
                ? '如果只是“能做很多事”，通常不代表真正省时。'
                : 'Being able to do a lot does not usually mean it saves time.',
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
                ? `生产力入口已连接榜单、对比页和真实条目，当前可参考分类信号 ${categoryCount} 个。`
                : `The productivity entry now connects ranking, comparison, and real listings, with ${categoryCount} category signals available.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-700'>
              {isChinese
                ? `保留索引，继续补真实场景与反馈，并保持 ${checkedAt} 的核对痕迹。`
                : `Keep indexable and continue adding real scenarios and feedback while preserving the ${checkedAt} check trail.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-700'>
              {isChinese
                ? `补一组日常工作流案例，并持续保留 ${checkedAt} 的核对记录。`
                : `Add one set of daily workflow cases while keeping the ${checkedAt} verification record.`}
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
              ? '如果你已经明确自己是在找能节省日常重复工作的工具，就不要停在总览页，直接进入更窄的筛选路径。'
              : 'If the job is clearly reducing repetitive daily work, move straight into narrower selection paths instead of staying on the overview.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-productivity-tools',
                title: isChinese ? '生产力工具榜单' : 'Productivity ranking',
                desc: isChinese ? '直接看高意图 shortlist。' : 'Go straight to the high-intent shortlist.',
              },
              {
                href: '/guides/ai-productivity-tools-comparison',
                title: isChinese ? '生产力工具对比' : 'Productivity comparison',
                desc: isChinese
                  ? '横向看效率、协作和自动化。'
                  : 'Compare efficiency, collaboration, and automation side by side.',
              },
              {
                href: '/guides/ai-note-taking-tools-comparison',
                title: isChinese ? '记笔记工具对比' : 'Note taking comparison',
                desc: isChinese
                  ? '如果重点偏记录和整理，这里更贴近。'
                  : 'Better when capture and organization matter most.',
              },
              {
                href: '/guides/ai-tools-for-automation-comparison',
                title: isChinese ? '自动化工具对比' : 'Automation tools comparison',
                desc: isChinese
                  ? '如果重点偏流程自动化，这里更贴近。'
                  : 'Better when automation is the main job to solve.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`productivity_guide_${item.href.split('/').pop()}`}
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
              href='/best-ai-tools/ai-productivity-tools'
              ctaId='productivity_guide_top_list_secondary'
              ctaLabel='Productivity guide top list secondary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '打开生产力榜单' : 'Open productivity ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/submit'
              ctaId='productivity_guide_submit'
              ctaLabel='Productivity guide submit'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-50'
            >
              {isChinese ? '提交你的工具' : 'Submit your tool'}
            </TrackableCtaLink>
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '先用榜单缩小 productivity shortlist'
              : 'Use the ranking to narrow your productivity shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经明确是在找能节省日常时间的工具，先看榜单会比只看总览更快进入决策。'
              : 'If the decision is already about tools that save daily time, the ranking gets you to a decision faster than an overview alone.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-productivity-tools',
                title: isChinese ? '生产力榜单' : 'Productivity ranking',
                desc: isChinese ? '先看真正值得试的候选。' : 'Start with the most relevant candidates first.',
              },
              {
                href: '/guides/ai-productivity-tools-comparison',
                title: isChinese ? '生产力对比' : 'Productivity comparison',
                desc: isChinese
                  ? '效率、协作和自动化一起看。'
                  : 'Compare efficiency, collaboration, and automation together.',
              },
              {
                href: '/guides/ai-note-taking-tools-comparison',
                title: isChinese ? '记笔记对比' : 'Note-taking comparison',
                desc: isChinese ? '如果任务偏记录和整理。' : 'Useful when capture and organization matter most.',
              },
              {
                href: '/guides/ai-tools-for-automation-comparison',
                title: isChinese ? '自动化对比' : 'Automation comparison',
                desc: isChinese
                  ? '如果真正要解决的是重复流程。'
                  : 'Best when the real job is repetitive workflow automation.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`productivity_guide_ranking_${item.href.split('/').pop()}`}
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

        <section className='mt-8 rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '下一步怎么走' : 'Next step'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '把生产力入口接到榜单、比较页和真实条目'
              : 'Move from the productivity guide into rankings, comparisons, and real listings'}
          </h2>
          <div className='mt-4 grid gap-4 lg:grid-cols-3'>
            <TrackableCtaLink
              href='/best-ai-tools/ai-productivity-tools'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
              ctaId='productivity_guide_ranking_next'
              ctaLabel='Productivity guide ranking next'
              pageType='guide'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '看生产力榜单' : 'Open productivity ranking'}
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
              href='/guides/ai-productivity-tools-comparison'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
              ctaId='productivity_guide_compare_next'
              ctaLabel='Productivity guide compare next'
              pageType='guide'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '看生产力工具对比' : 'Compare productivity tools'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '当工作流已经清楚，就进入横向对比。'
                      : 'Once the workflow is clear, move into side-by-side comparison.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/categories/productivity?sort=popular'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
              ctaId='productivity_guide_category'
              ctaLabel='Productivity guide category'
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
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_productivity_tools' />
      </div>
    </>
  );
}
