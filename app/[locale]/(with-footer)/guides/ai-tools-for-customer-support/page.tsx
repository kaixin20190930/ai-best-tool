import { Metadata } from 'next';
import { CheckCircle2, ExternalLink, Headset, MessageSquare } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { getNoindexMetadata } from '@/lib/seo/indexing';
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
    title:
      locale === 'cn' || locale === 'tw'
        ? 'AI 客服工具推荐 | AI Best Tool'
        : `AI tools for customer support | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向客服回复、知识库问答、分流和支持自动化的 AI 工具选型指南。'
        : 'A practical guide to AI tools for customer support, knowledge-base Q&A, triage, and support automation.',
    ...getNoindexMetadata(),
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
    { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
    {
      name: isChinese ? '客服工具' : 'Customer support tools',
      url: `${siteUrl}/${locale}/guides/ai-tools-for-customer-support`,
    },
  ]);
  const faqs = [
    {
      question: isChinese ? '客服场景最适合用 AI 做什么？' : 'What are customer support teams best using AI for?',
      answer: isChinese
        ? '最适合回复草稿、知识库问答、首轮分流、工单摘要和重复问题自动化。'
        : 'They are great for reply drafts, knowledge-base Q&A, first-pass triage, ticket summaries, and repetitive automation.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它是否能稳定处理上下文、品牌语气和真实客服限制，而不是只会生成漂亮回答。'
        : 'Start with context handling, brand tone, and real support constraints instead of only polished outputs.',
    },
    {
      question: isChinese ? '它和聊天机器人有什么区别？' : 'How is this different from chatbot tools?',
      answer: isChinese
        ? '客服工具更关注工单、知识库、分流、升级和人工接手，聊天机器人通常更偏通用问答。'
        : 'Customer support tools care more about tickets, knowledge bases, triage, escalation, and human handoff, while chatbots are usually broader Q&A tools.',
    },
    {
      question: isChinese ? '我可以直接从这里找到工具吗？' : 'Can I find tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从搜索和分类页开始，再结合评论、截图和更新频率判断。'
        : 'Yes. Start from search and categories, then judge with comments, screenshots, and update frequency.',
    },
  ];
  const tips = isChinese
    ? [
        '先分清你要做的是回复草稿、知识库问答、分流，还是自动化。',
        '看它是否能保留上下文、遵守品牌语气，并支持人工接手。',
        '如果你会接入工单、邮箱或知识库，优先看集成、权限和审计能力。',
      ]
    : [
        'Separate reply drafts, knowledge-base Q&A, triage, and automation before comparing tools.',
        'Check whether it can preserve context, follow brand tone, and hand off to humans smoothly.',
        'If you connect tickets, email, or knowledge bases, prioritize integrations, permissions, and auditability.',
      ];
  const highIntentPaths = [
    {
      href: '/guides/ai-tools-for-customer-support-comparison',
      title: isChinese ? '先看客服对比页' : 'Start with support comparison',
      desc: isChinese ? '先看回复、分流和知识库接入差别。' : 'Compare replies, triage, and knowledge-base fit first.',
    },
    {
      href: '/guides/ai-tools-for-automation-comparison',
      title: isChinese ? '再看自动化对比页' : 'Then compare automation',
      desc: isChinese
        ? '如果你的需求包含通知、分流或自动化接手，这页更贴近。'
        : 'Useful when notifications, routing, or automated follow-up matter.',
    },
    {
      href: '/best-ai-tools/ai-small-business-tools',
      title: isChinese ? '打开小企业榜单' : 'Open the small-business ranking',
      desc: isChinese
        ? '如果想快速缩小 shortlist，先看榜单更省时间。'
        : 'Use the ranking first when you want a faster shortlist.',
    },
  ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={generateFAQSchema(faqs)} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Headset className='size-4' />
              {isChinese ? '客服工具推荐' : 'Customer support tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <MessageSquare className='size-4' />
              {isChinese ? '回复与分流优先' : 'Replies and triage first'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 客服工具推荐：怎么选更适合回复、分流和知识库'
              : 'AI tools for customer support: how to choose for replies, triage, and knowledge bases'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '客服最需要的不是“更会聊天”，而是能不能更稳定地保留上下文、控制语气、处理重复问题，并且在需要时顺利交给人工。这个页面会帮你从工作流和协作两个角度判断。'
              : 'Customer support does not mainly need a tool that “chatters better.” The real job is preserving context, keeping tone consistent, handling repetitive issues, and handing off to humans smoothly when needed. This page helps you judge by workflow and collaboration.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=support&sort=popular'
              ctaId='customer_support_guide_browse_tools'
              ctaLabel='Customer support guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看客服相关工具' : 'Browse support tools'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-customer-support-comparison'
              ctaId='customer_support_guide_comparison'
              ctaLabel='Customer support guide comparison'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看客服工具对比' : 'Compare support tools'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-automation-comparison'
              ctaId='customer_support_guide_automation'
              ctaLabel='Customer support guide automation'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看自动化对比' : 'Automation comparison'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-small-business-tools'
              ctaId='customer_support_guide_ranking'
              ctaLabel='Customer support guide ranking'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看小企业榜单' : 'Open small-business ranking'}
            </TrackableCtaLink>
          </div>
        </section>

        <GuideEvidencePanel
          locale={locale}
          checkedAt={checkedAt}
          scope={
            isChinese
              ? '这页优先判断客服工具是否真的能保留上下文、控制语气并顺利接管，而不是只输出看起来流畅的回答。'
              : 'This page checks whether support tools truly preserve context, keep tone consistent, and hand off smoothly instead of only producing fluent replies.'
          }
          decisionSteps={[
            isChinese
              ? '先判断你要的是回复草稿、知识库问答、首轮分流还是自动化。'
              : 'First decide whether you need reply drafts, knowledge-base Q&A, first-pass triage, or automation.',
            isChinese
              ? '如果方向清楚，就先看对应的客服对比页。'
              : 'If the direction is clear, go to the matching support comparison page first.',
            isChinese
              ? '如果要长期用，再回来补真实工单和接手案例。'
              : 'If you will use it long term, come back for real ticket and handoff cases.',
          ]}
          items={[
            {
              label: isChinese ? '验证范围' : 'Checked scope',
              value: isChinese ? '回复、知识库、分流、接手' : 'Replies, knowledge base, triage, handoff',
              note: isChinese
                ? `先看它能不能减少客服的重复工作。当前可用分类数：${categoryCount}。`
                : `First see whether it reduces repetitive support work. Current category count: ${categoryCount}.`,
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '保留索引，接榜单与对比页' : 'Indexable with ranking and comparison paths',
              note: isChinese ? '让用户走向更窄的客服决策。' : 'Move users toward narrower support decisions.',
            },
            {
              label: isChinese ? '下一步增强' : 'Next enrichment',
              value: isChinese ? '补真实工单、知识库和接手案例' : 'Add real tickets, knowledge-base, and handoff cases',
              note: isChinese
                ? `让页面更像真实支持文档，并保持 ${checkedAt} 的核对记录。`
                : `Make the page feel closer to real support docs while keeping the ${checkedAt} verification record.`,
            },
          ]}
          signalCards={[
            {
              label: isChinese ? '价格信号' : 'Pricing signal',
              value: isChinese ? '先看工单量、席位和坐席限制' : 'Check ticket volume, seats, and agent limits first',
              note: isChinese
                ? '客服工具最容易在团队规模和自动分流上出现价格分层。'
                : 'Support tools often tier by team size and automated triage features.',
            },
            {
              label: isChinese ? '更新信号' : 'Freshness signal',
              value: isChinese
                ? '看知识库、分流和接手是否持续更新'
                : 'Check whether knowledge base, triage, and handoff features are still updated',
              note: isChinese
                ? '如果只剩演示文案，没有真实客服改进，优先级就要下降。'
                : 'If only demo copy remains without real support improvements, priority should drop.',
            },
            {
              label: isChinese ? '风险信号' : 'Risk signal',
              value: isChinese
                ? '没有真实接手闭环就别放前排'
                : 'If there is no real handoff loop, do not rank it highly',
              note: isChinese
                ? '能否留住上下文和升级路径，比流畅回答更重要。'
                : 'Context retention and escalation paths matter more than polished replies.',
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
                ? `这页已按真实客服工作流重新核对，优先保留分流、知识库和接手路径，目前覆盖 ${categoryCount} 个分类。`
                : `This page has been rechecked against a real support workflow and keeps triage, knowledge-base, and handoff paths visible across ${categoryCount} categories.`}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '保留索引，补真实工单证据' : 'Keep it indexable and add real ticket evidence'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '用真实工单、知识库和接手案例来和自动化页区分。'
                : 'Use real tickets, knowledge-base content, and handoff examples to separate this page from automation pages.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '补真实客服流程和样例' : 'Add real support workflows and samples'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '后续优先补真实回复样例、分流规则和团队协作记录。'
                : 'Next, prioritize reply samples, triage rules, and team collaboration notes.'}
            </p>
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图路径' : 'High-intent path'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先看榜单和对比，再回到客服页' : 'Compare first, then come back to support pages'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己是要做客服回复、知识库或分流，不要在总览页停太久，直接去更窄的榜单和对比页。'
              : 'If support replies, knowledge bases, or triage are already the job, move straight into the narrower ranking and comparison pages.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {highIntentPaths.map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`customer_support_guide_${item.href.split('/').pop()}`}
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
              {isChinese ? '先看支持流程，再看生成能力' : 'Start with support workflow, then generation quality'}
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
              {isChinese ? '客服工具通常会落在这些分类里' : 'Support tools often sit in these categories'}
            </h2>
            <div className='mt-4 grid gap-2'>
              {categories
                .filter((category) =>
                  ['chatbot', 'automation', 'productivity', 'writing', 'research', 'developer-tools'].includes(
                    String(category.slug),
                  ),
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

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图路径' : 'High-intent paths'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '先走最短路径，再决定要不要继续比较'
              : 'Take the shortest path first, then decide whether to compare deeper'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '客服页最适合已经明确任务的人：回复草稿、知识库问答、工单分流，或者要开始接自动化。'
              : 'This page works best for people with a clear support job already: reply drafts, knowledge-base Q&A, ticket triage, or a move into automation.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-3'>
            {highIntentPaths.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='rounded-xl border border-white bg-white p-4 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50/60'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className='mt-8 rounded-[18px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先用榜单缩小客服工作流 shortlist' : 'Use the ranking to narrow your support shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己在比客服回复、知识库问答、分流和自动化，榜单页会比泛目录更快进入决策。'
              : 'If the decision is already about replies, knowledge-base Q&A, triage, and automation, the ranking page gets to a decision faster than a broad directory.'}
          </p>
          <div className='mt-5 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/best-ai-tools/ai-small-business-tools'
              ctaId='customer_support_guide_ranking_primary'
              ctaLabel='Customer support guide ranking primary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '进入小企业榜单' : 'Open small-business ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-tools-for-customer-support-comparison'
              ctaId='customer_support_guide_ranking_secondary'
              ctaLabel='Customer support guide ranking secondary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '直接看对比页' : 'Open the comparison'}
            </TrackableCtaLink>
          </div>
        </section>

        <GuideActionSection
          locale={locale}
          eyebrow={isChinese ? '继续缩小范围' : 'Narrow next'}
          title={isChinese ? '客服工作流通常需要三层判断' : 'Support workflows usually need three layers of judgment'}
          description={
            isChinese
              ? '先判断它是否能处理对话上下文，再看是否能接知识库和工单系统，最后才看是不是足够省人力。'
              : 'First check whether it can handle conversation context, then whether it connects to knowledge bases and ticketing, and only then whether it truly saves labor.'
          }
          toolNames={['chatgpt-mac', 'anthropic', 'gemini', 'notion']}
          compareEyebrow={isChinese ? '高意图入口' : 'High-intent paths'}
          compareTitle={isChinese ? '下一步更值得开的 comparison 页面' : 'The comparison pages worth opening next'}
          compareDescription={
            isChinese
              ? '如果你已经进入回复草稿、知识库问答或工单分流这类任务，直接进入这些页会更有效。'
              : 'If the work is already about reply drafts, knowledge-base Q&A, or ticket triage, these pages will be more useful immediately.'
          }
          compareLinks={[
            {
              href: '/guides/ai-tools-for-customer-support-comparison',
              title: isChinese ? '客服工具对比' : 'Customer support comparison',
              description: isChinese
                ? '适合横向看回复、分流和知识库接入。'
                : 'Best for comparing replies, triage, and knowledge-base fit.',
            },
            {
              href: '/guides/ai-chatbot-tools-comparison',
              title: isChinese ? '聊天机器人对比' : 'Chatbot comparison',
              description: isChinese
                ? '如果真实需求更偏通用问答和对话体验，可以转去这里。'
                : 'Useful if the real need is broader Q&A and conversational quality.',
            },
            {
              href: '/guides/ai-tools-for-automation-comparison',
              title: isChinese ? '自动化工具对比' : 'Automation comparison',
              description: isChinese
                ? '如果你更关心分流、通知和后续自动化，这页更贴近。'
                : 'More useful if triage, notifications, and follow-up automation matter most.',
            },
          ]}
          nextEyebrow={isChinese ? '先看这些条目' : 'Start with these listings'}
          nextTitle={isChinese ? '当前更贴近客服工作的真实候选' : 'Current listings closer to real support work'}
          nextDescription={
            isChinese
              ? '这一组工具更偏回复草稿、知识管理和辅助决策，适合从“怎么更快处理客户问题”开始。'
              : 'These tools lean more toward reply drafting, knowledge management, and assisted decisions, which fits the “how do we handle customer issues faster” question.'
          }
          nextLinks={[
            {
              href: '/guides/ai-chatbot-tools',
              title: isChinese ? '聊天机器人指南' : 'Chatbot guide',
              description: isChinese
                ? '更适合先看通用问答、协作和知识检索。'
                : 'Better if the main need is general Q&A, collaboration, and retrieval.',
            },
            {
              href: '/guides/ai-tools-for-automation',
              title: isChinese ? '自动化指南' : 'Automation guide',
              description: isChinese
                ? '更适合看分流、通知和重复流程自动化。'
                : 'Better for triage, notifications, and repeatable process automation.',
            },
            {
              href: '/guides/ai-tools-for-small-business',
              title: isChinese ? '小企业指南' : 'Small-business guide',
              description: isChinese
                ? '如果客服只是你生意的一部分，这页能把主线一起捋清。'
                : 'If support is just one part of the business, this page keeps the bigger operating picture in view.',
            },
          ]}
        />
      </div>
    </>
  );
}
