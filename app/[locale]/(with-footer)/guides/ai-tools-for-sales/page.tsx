import { Metadata } from 'next';
import { BadgeDollarSign, CheckCircle2, ExternalLink, Target } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import TrackableCtaLink from '@/components/analytics/TrackableCtaLink';
import GuideActionSection from '@/components/guides/GuideActionSection';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';
import { StructuredDataServer } from '@/components/seo/StructuredData';
import { Link } from '@/app/navigation';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata.home' });

  return {
    title: locale === 'cn' || locale === 'tw' ? 'AI 销售工具推荐 | AI Best Tool' : `AI tools for sales | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向销售、线索跟进和客户沟通的 AI 工具选型指南。'
        : 'A practical guide to AI tools for sales, lead follow-up, and customer communication.',
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
    { name: isChinese ? '销售工具' : 'Sales tools', url: `${siteUrl}/${locale}/guides/ai-tools-for-sales` },
  ]);
  const faqs = [
    {
      question: isChinese ? '销售团队最适合用 AI 做什么？' : 'What are sales teams best using AI for?',
      answer: isChinese
        ? '最适合线索整理、邮件草稿、跟进摘要、通话记录总结和 CRM 辅助。'
        : 'They are great for lead organization, email drafts, follow-up summaries, call notes, and CRM assistance.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它是否适合你的销售流程，比如邮件、CRM、通话、分配和跟进。'
        : 'Start with your sales process: email, CRM, calls, assignment, and follow-up workflows matter most.',
    },
    {
      question: isChinese ? '免费销售工具够用吗？' : 'Are free sales tools enough?',
      answer: isChinese
        ? '轻量试用通常够用；如果你要多人协作、历史记录和更稳的整合，限制会更快出现。'
        : 'Free tiers are fine for testing. If you need team collaboration, history, and tighter integrations, limits show up faster.',
    },
    {
      question: isChinese ? '我可以直接从这里找到销售工具吗？' : 'Can I find sales tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从搜索和分类页开始，再结合评论、截图和更新频率判断。'
        : 'Yes. Start from search and categories, then judge with comments, screenshots, and update frequency.',
    },
  ];
  const faqSchema = generateFAQSchema(faqs);
  const tips = isChinese
    ? [
        '先分清你是做线索、跟进、成交还是客户维系。',
        '看它是否能接入 CRM、邮箱、通话或表单流程。',
        '如果是团队使用，优先看权限、记录和分工能力。',
      ]
    : [
        'Separate the job first: leads, follow-up, closing, or account management.',
        'Check whether it plugs into CRM, email, calls, or forms.',
        'For teams, prioritize permissions, history, and assignment workflows.',
      ];
  const highIntentPaths = [
    {
      href: '/best-ai-tools/ai-sales-tools',
      title: isChinese ? '先看销售榜单' : 'Start with sales ranking',
      desc: isChinese ? '先用 shortlist 缩小范围。' : 'Use the shortlist to narrow the field first.',
    },
    {
      href: '/guides/ai-tools-for-sales-comparison',
      title: isChinese ? '销售工具对比' : 'Sales tools comparison',
      desc: isChinese ? '线索、跟进、协作一起看。' : 'Compare leads, follow-up, and collaboration together.',
    },
    {
      href: '/guides/ai-tools-for-lead-generation-comparison',
      title: isChinese ? '获客工具对比' : 'Lead generation comparison',
      desc: isChinese ? '如果重点是找线索和补全名单。' : 'Best when the job is finding and enriching leads.',
    },
    {
      href: '/guides/ai-tools-for-sales-prospecting-comparison',
      title: isChinese ? '销售拓客对比' : 'Sales prospecting comparison',
      desc: isChinese ? '如果你要更聚焦外联和拓展。' : 'Use this for outreach-heavy prospecting workflows.',
    },
  ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={faqSchema} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <BadgeDollarSign className='size-4' />
              {isChinese ? '销售工具推荐' : 'Sales tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Target className='size-4' />
              {isChinese ? '线索与转化优先' : 'Leads and conversion'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 销售工具推荐：怎么选更适合你的跟进流程'
              : 'AI tools for sales: how to choose one that fits your follow-up workflow'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '销售工作需要的不是花哨生成，而是能把线索、跟进、沟通记录和 CRM 串起来。这个页面会帮你从流程和效率两个角度判断。'
              : 'Sales work needs more than flashy generation. It needs tools that connect leads, follow-up, communication history, and CRM. This page helps you judge by workflow and efficiency.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=sales&sort=popular'
              ctaId='sales_guide_browse_tools'
              ctaLabel='Sales guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看销售工具' : 'Browse sales tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/how-to-choose-ai-tools'
              ctaId='sales_guide_choose'
              ctaLabel='Sales guide choose'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到选型指南' : 'Back to selection guide'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-productivity-tools'
              ctaId='sales_guide_productivity'
              ctaLabel='Sales guide productivity'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看生产力工具' : 'Productivity tools'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-lead-generation-tools'
              ctaId='sales_guide_rankings_entry'
              ctaLabel='Sales guide rankings entry'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看销售相关榜单' : 'Open sales rankings'}
            </TrackableCtaLink>
          </div>
        </section>

        <GuideEvidencePanel
          locale={locale}
          checkedAt={checkedAt}
          scope={
            isChinese
              ? '这页优先判断销售工具是否真的能串起线索、跟进、沟通和 CRM，而不是只会生成漂亮文案。'
              : 'This page checks whether sales tools truly connect leads, follow-up, communication, and CRM instead of only generating polished copy.'
          }
          items={[
            {
              label: isChinese ? '验证范围' : 'Checked scope',
              value: isChinese ? '线索、跟进、沟通、CRM' : 'Leads, follow-up, communication, CRM',
              note: isChinese
                ? `当前可参考分类信号有 ${categoryCount} 个，先看它是否贴合你的销售流程。`
                : `${categoryCount} category signals are available, and the first check is whether it fits your sales workflow.`,
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '保留索引，接榜单与对比页' : 'Indexable with ranking and comparison paths',
              note: isChinese ? '把销售意图导向更窄的路径。' : 'Route sales intent into narrower paths.',
            },
            {
              label: isChinese ? '下一步增强' : 'Next enrichment',
              value: isChinese ? '补真实销售流程、整合和案例' : 'Add real sales workflows, integrations, and cases',
              note: isChinese
                ? `这页已于 ${checkedAt} 重新核对，让页面更像真实运营文档。`
                : `This page was rechecked on ${checkedAt}, making it feel closer to real ops notes.`,
            },
          ]}
          signalCards={[
            {
              label: isChinese ? '价格信号' : 'Pricing signal',
              value: isChinese
                ? '先看免费线索额度、席位和导出限制'
                : 'Check free lead limits, seats, and export caps first',
              note: isChinese
                ? '销售工具常把关键价值放在团队席位、CRM 同步和导出上。'
                : 'Sales tools often hide their real value in seats, CRM sync, and export limits.',
            },
            {
              label: isChinese ? '更新信号' : 'Freshness signal',
              value: isChinese
                ? '看最近是否还在补流程、集成和案例'
                : 'Check whether workflows, integrations, and cases are still being updated',
              note: isChinese
                ? '如果更新停在演示截图层，优先级就要降。'
                : 'If updates stop at demo screenshots, the priority should drop.',
            },
            {
              label: isChinese ? '风险信号' : 'Risk signal',
              value: isChinese
                ? '没有真实销售流程就先别放在前排'
                : 'If there is no real sales workflow, keep it out of the front row',
              note: isChinese
                ? '能不能接 CRM、通话和跟进，决定它是不是可长期用。'
                : 'CRM, call, and follow-up fit determine whether it is actually usable long term.',
            },
          ]}
          decisionSteps={[
            isChinese
              ? '先判断你要管的是线索、跟进还是 CRM。'
              : 'First decide whether you are managing leads, follow-up, or CRM.',
            isChinese
              ? '如果方向清楚，就先看对应销售对比页。'
              : 'If the direction is clear, go to the matching sales comparison page first.',
            isChinese
              ? '如果要团队长期用，再回来补真实流程和整合案例。'
              : 'If the team will use it long term, come back for real workflows and integration cases.',
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
                ? `销售入口已和榜单、对比页、真实条目连在一起，当前可参考分类信号 ${categoryCount} 个。`
                : `The sales entry now connects ranking, comparison, and real listings, with ${categoryCount} category signals available.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '保留索引，继续补真实销售证据' : 'Keep it indexable and keep adding real sales evidence'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '用线索、跟进和 CRM 案例把它从泛销售页里拉出来。'
                : 'Use lead, follow-up, and CRM cases to separate it from generic sales pages.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese
                ? `补真实线索到成交路径，并持续保留 ${checkedAt} 的核对记录。`
                : `Add a real path from lead to close while keeping the ${checkedAt} verification record.`}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese ? '先补邮件、通话和 CRM 的三段式案例。' : 'Start with email, call, and CRM cases.'}
            </p>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese
                ? '先看销售流程，再看自动化和协作'
                : 'Start with the sales process, then automation and collaboration'}
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
              {isChinese ? '销售工具通常在这些分类里' : 'Sales tools often sit in these categories'}
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

        <section className='mt-8 rounded-[18px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图路径' : 'High-intent path'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先看榜单和对比，再回到销售页' : 'Compare first, then come back to sales pages'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己在找线索、外联或跟进工具，就直接去更窄的榜单和对比页。'
              : 'If you already know you are looking for leads, outreach, or follow-up tools, go straight to the narrower ranking and comparison pages.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {highIntentPaths.map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`sales_guide_${item.href.split('/').pop()}`}
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

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '销售工具看什么' : 'What matters for sales tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能帮你更稳地跟进和转化' : 'Can it help you follow up and convert more reliably?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '销售工具最重要的是流程顺滑。你要看它是否能接到 CRM、邮箱和通话记录。'
                  : 'Sales tools need smooth workflows. Check whether it connects to CRM, email, and call history.'}
              </p>
              <p>
                {isChinese
                  ? '如果你是团队销售，优先看分工、记录和自动化提醒。'
                  : 'If you work in a team, prioritize assignment, record keeping, and automated reminders.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '销售工具最常见的问题' : 'Common questions about sales tools'}
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

        <GuideActionSection
          locale={locale}
          eyebrow={isChinese ? '先看这些候选' : 'Recommended candidates'}
          title={isChinese ? '当前更贴近销售工作流的真实条目' : 'Current listings closer to real sales workflows'}
          description={
            isChinese
              ? '如果你要判断的是线索、跟进、外联和流程衔接，这几款会比泛聊天工具更接近真实销售工作。'
              : 'If the decision is really about leads, follow-up, outreach, and workflow fit, these listings sit closer to real sales work than broad assistant tools.'
          }
          toolNames={['apollo-io', 'clay', 'outreach', 'lemlist']}
          compareEyebrow={isChinese ? '继续缩小范围' : 'Narrow next'}
          compareTitle={isChinese ? '按更具体任务进入' : 'Move into narrower task-specific paths'}
          compareDescription={
            isChinese
              ? '当你已经知道自己偏获客、拓客还是泛销售管理，继续进入更窄的 comparison 页会更省时间。'
              : 'Once you know the job leans more toward lead generation, prospecting, or broader sales process, narrower comparison pages save time.'
          }
          compareLinks={[
            {
              href: '/guides/ai-tools-for-lead-generation-comparison',
              title: isChinese ? '获客工具对比' : 'Lead generation comparison',
              description: isChinese
                ? '更适合名单发现、补全和早期筛选。'
                : 'Best for list discovery, enrichment, and early qualification.',
            },
            {
              href: '/guides/ai-tools-for-sales-prospecting-comparison',
              title: isChinese ? '销售拓客工具对比' : 'Sales prospecting comparison',
              description: isChinese
                ? '更适合个性化外联、触达准备和回应率提升。'
                : 'Best for personalized outreach, contact prep, and response quality.',
            },
            {
              href: '/guides/ai-tools-for-sales-comparison',
              title: isChinese ? '销售工具对比' : 'Sales tools comparison',
              description: isChinese
                ? '如果你要整体横向看销售候选，这里最直接。'
                : 'The most direct path if you want a broad side-by-side sales shortlist.',
            },
          ]}
        />

        <div className='mx-auto mt-8 max-w-6xl px-4 lg:px-6'>
          <section className='rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '高意图榜单' : 'High-intent rankings'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese
                ? '方向明确时，直接进更窄的销售榜单页'
                : 'When the lane is clear, jump straight into the narrower sales ranking pages'}
            </h2>
            <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
              {isChinese
                ? '如果你已经知道自己在比名单来源、外联准备或销售流程衔接，榜单页会比泛销售目录更快进入决策。'
                : 'If the decision is already about list sourcing, outreach prep, or sales workflow fit, the ranking pages get to a decision faster than a broad sales directory.'}
            </p>
            <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
              {[
                {
                  href: '/best-ai-tools/ai-lead-generation-tools',
                  title: isChinese ? '获客榜单' : 'Lead-gen ranking',
                  desc: isChinese
                    ? '名单发现、信息补全和线索初筛。'
                    : 'List discovery, enrichment, and early qualification.',
                },
                {
                  href: '/best-ai-tools/ai-sales-prospecting-tools',
                  title: isChinese ? '销售拓客榜单' : 'Prospecting ranking',
                  desc: isChinese
                    ? '个性化外联、触达准备和联系策略。'
                    : 'Personalized outreach, contact prep, and outbound strategy.',
                },
              ].map((item) => (
                <TrackableCtaLink
                  key={item.href}
                  href={item.href}
                  ctaId={`sales_guide_ranking_${item.href.split('/').pop()}`}
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
                href='/guides/ai-tools-for-sales-comparison'
                ctaId='sales_guide_rankings_comparison'
                ctaLabel='Sales guide rankings comparison'
                pageType='guide'
                className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
              >
                {isChinese ? '继续看销售对比页' : 'Continue to sales comparison'}
              </TrackableCtaLink>
              <TrackableCtaLink
                href='/best-ai-tools'
                ctaId='sales_guide_rankings_hub'
                ctaLabel='Sales guide rankings hub'
                pageType='guide'
                className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-50'
              >
                {isChinese ? '打开榜单总页' : 'Open rankings hub'}
              </TrackableCtaLink>
            </div>
          </section>
        </div>

        <div className='mx-auto mt-8 max-w-6xl px-4 lg:px-6'>
          <section className='rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '高意图路径' : 'High-intent path'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese
                ? '如果这是你的工具，下一步就去提交或认领'
                : 'If this is your tool, the next step is submission or claiming'}
            </h2>
            <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
              {isChinese
                ? '已经比较到这一步，说明你大概率是在认真筛选或准备上架。把工具提交进来，或者先认领条目，后面再决定是否加速审核。'
                : 'If you are this far into comparison, you are likely filtering seriously or preparing a listing. Submit your tool, or claim the listing first and decide later whether faster review is needed.'}
            </p>
            <div className='mt-5 flex flex-wrap gap-3'>
              <TrackableCtaLink
                href='/submit'
                ctaId='sales_guide_submit'
                ctaLabel='Sales guide submit'
                pageType='guide'
                className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
              >
                {isChinese ? '提交你的工具' : 'Submit your tool'}
              </TrackableCtaLink>
              <TrackableCtaLink
                href='/developer/listing'
                ctaId='sales_guide_claim'
                ctaLabel='Sales guide claim'
                pageType='guide'
                className='inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50'
              >
                {isChinese ? '认领条目' : 'Claim listing'}
              </TrackableCtaLink>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
