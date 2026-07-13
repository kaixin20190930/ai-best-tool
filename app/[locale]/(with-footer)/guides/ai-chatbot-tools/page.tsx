import { Metadata } from 'next';
import { ArrowRight, CheckCircle2, ExternalLink, MessageSquare, Users } from 'lucide-react';
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
        ? 'AI 聊天机器人推荐 | AI Best Tool'
        : `AI chatbot tools recommendations | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向问答、写作、知识检索和工作协作的 AI 聊天机器人选型指南，先看榜单再看对比。'
        : 'A practical guide to AI chatbots for Q&A, writing, knowledge retrieval, and collaboration, with a path from guide to ranking and comparison.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '选型指南' : 'Guides', url: `${siteUrl}/${locale}/guides/how-to-choose-ai-tools` },
    { name: isChinese ? '聊天机器人' : 'Chatbots', url: `${siteUrl}/${locale}/guides/ai-chatbot-tools` },
  ]);
  const faqs = [
    {
      question: isChinese ? 'AI 聊天机器人最适合做什么？' : 'What are AI chatbots best for?',
      answer: isChinese
        ? '最适合问答、写作辅助、知识查询、资料总结和团队协作。它们很适合做日常入口型工具，但回答质量要结合你的实际需求判断。'
        : 'They are great for Q&A, writing assistance, knowledge lookup, summaries, and team collaboration. They make excellent daily-use tools, but answer quality should be judged against your needs.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它是否支持你的语言、是否能接入你的知识库、以及它在你常问的问题上是否稳定。'
        : 'Start with language support, knowledge-base integration, and whether it stays reliable for the questions you ask most.',
    },
    {
      question: isChinese ? '免费聊天机器人够用吗？' : 'Are free chatbots enough?',
      answer: isChinese
        ? '轻量问答和日常写作很多时候够用；如果你要更长上下文、团队协作、知识库和更稳定的输出，通常会更快碰到限制。'
        : 'Free tiers often work for light Q&A and daily writing. If you need longer context, collaboration, knowledge bases, or more consistent output, you may hit limits sooner.',
    },
    {
      question: isChinese ? '我可以直接从这里找到聊天机器人吗？' : 'Can I find chatbots directly from here?',
      answer: isChinese
        ? '可以。你可以先从搜索和分类结果开始，再结合评论和更新频率判断。'
        : 'Yes. Start from search and categories, then judge with comments and freshness.',
    },
  ];
  const faqSchema = generateFAQSchema(faqs);
  const chineseTips = [
    '先分清用途：通用问答、写作、知识库、团队协作，重点会不同。',
    '看它是否支持你的语言、上下文长度和知识源接入。',
    '如果是团队使用，优先看权限、协作和知识管理能力。',
  ];
  const englishTips = [
    'Separate the use case first: general Q&A, writing, knowledge base, or collaboration all require different features.',
    'Check language support, context length, and knowledge-source integration.',
    'For teams, prioritize permissions, collaboration, and knowledge management.',
  ];
  const tips = isChinese ? chineseTips : englishTips;
  const quickStarts = [
    {
      href: '/best-ai-tools/ai-chatbot-tools',
      title: isChinese ? '聊天机器人榜单' : 'Chatbot ranking',
      desc: isChinese ? '先看 shortlist，再看具体产品。' : 'Start with the shortlist before product pages.',
    },
    {
      href: '/guides/ai-chatbot-tools-comparison',
      title: isChinese ? '聊天机器人对比页' : 'Chatbot comparison',
      desc: isChinese ? '先比回答、知识和协作。' : 'Compare answers, knowledge, and collaboration.',
    },
    {
      href: '/ai/chatgpt',
      title: 'ChatGPT',
      desc: isChinese ? '通用问答和写作入口。' : 'General Q&A and writing entry point.',
    },
    {
      href: '/ai/claude',
      title: 'Claude',
      desc: isChinese ? '更适合长文档和协作写作。' : 'Good for long documents and collaborative writing.',
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
              <MessageSquare className='size-4' />
              {isChinese ? '聊天机器人推荐' : 'Chatbot recommendations'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Users className='size-4' />
              {isChinese ? '问答与协作并重' : 'Q&A and collaboration'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 聊天机器人推荐：怎么选更适合你的日常工作流'
              : 'AI chatbots: how to choose one that fits your daily workflow'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '聊天机器人是很多人接触 AI 的第一个入口，但真正好用与否，取决于它能不能稳定回答、接入知识库，并且适合你的工作场景。这个页面会帮你理清判断顺序。'
              : 'Chatbots are often the first AI product people use, but whether they are actually good depends on reliable answers, knowledge-base integration, and your workflow. This page helps you sort out what matters first.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <TrackableCtaLink
              href='/explore?search=chatbot&sort=popular'
              ctaId='chatbot_guide_browse_tools'
              ctaLabel='Chatbot guide browse tools'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看聊天机器人' : 'Browse chatbots'}
              <ExternalLink className='size-4' />
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/how-to-choose-ai-tools'
              ctaId='chatbot_guide_selection'
              ctaLabel='Chatbot guide selection'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到选型指南' : 'Back to selection guide'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/guides/ai-chatbot-tools-comparison'
              ctaId='chatbot_guide_compare'
              ctaLabel='Chatbot guide compare'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看聊天机器人对比' : 'Compare chatbots'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/best-ai-tools/ai-chatbot-tools'
              ctaId='chatbot_guide_top_list'
              ctaLabel='Chatbot guide top list'
              pageType='guide'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-100'
            >
              {isChinese ? '看聊天机器人榜单' : 'Open chatbot ranking'}
            </TrackableCtaLink>
          </div>
        </section>

        <GuideEvidencePanel
          locale={locale}
          scope={
            isChinese
              ? '这页优先判断聊天机器人是否真的能稳定回答、接知识库和适配日常工作流，而不是只看生成内容是否看起来聪明。'
              : 'This page checks whether a chatbot truly answers reliably, connects to a knowledge base, and fits daily workflows instead of merely sounding smart.'
          }
          items={[
            {
              label: isChinese ? '验证范围' : 'Checked scope',
              value: isChinese ? '问答、知识库、协作、稳定性' : 'Q&A, knowledge base, collaboration, reliability',
              note: isChinese
                ? '先确认它是否能解决你最常问的问题。'
                : 'First confirm that it solves the questions you ask most often.',
            },
            {
              label: isChinese ? '索引策略' : 'Indexing strategy',
              value: isChinese ? '保留索引，连接榜单与对比页' : 'Indexable with ranking and comparison paths',
              note: isChinese ? '把用户带向更窄的高意图路径。' : 'Move users into narrower high-intent paths.',
            },
            {
              label: isChinese ? '下一步增强' : 'Next enrichment',
              value: isChinese ? '补真实问答场景、评论和限制说明' : 'Add real question scenarios, comments, and limits',
              note: isChinese ? '用真实使用痕迹代替泛泛描述。' : 'Replace generic copy with real usage evidence.',
            },
          ]}
        />

        <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '最近验证' : 'Last checked'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-13</p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '这页已按真实聊天机器人决策重新核对，优先保留知识库、上下文和工作流入口。'
                : 'This page has been rechecked against a real chatbot decision and keeps knowledge-base, context, and workflow entry points visible.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '当前判断' : 'Current judgment'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '保留索引，补真实接入证据' : 'Keep it indexable and add real integration evidence'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '用知识库、角色控制和接手案例区分它和泛聊天页。'
                : 'Use knowledge bases, persona controls, and handoff examples to differentiate it from generic chat pages.'}
            </p>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '下一步' : 'Next step'}
            </p>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {isChinese ? '补真实对话与接手记录' : 'Add real dialogue and handoff notes'}
            </p>
            <p className='mt-2 text-sm leading-6 text-slate-600'>
              {isChinese
                ? '后续优先补真实对话样例、知识库接入和人工接手流程。'
                : 'Next, prioritize real conversations, knowledge-base integration, and human handoff workflows.'}
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
              ? '如果你已经知道自己主要在用聊天机器人做问答、写作或知识检索，就别停在总览页，直接进入更窄的筛选路径。'
              : 'If chat is already the main way you handle Q&A, writing, or knowledge retrieval, move straight into narrower selection paths.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-chatbot-tools',
                title: isChinese ? '聊天机器人榜单' : 'Chatbot ranking',
                desc: isChinese ? '直接看高意图 shortlist。' : 'Go straight to the high-intent shortlist.',
              },
              {
                href: '/guides/ai-chatbot-tools-comparison',
                title: isChinese ? '聊天机器人对比' : 'Chatbot comparison',
                desc: isChinese
                  ? '横向看回答、知识和协作。'
                  : 'Compare answers, knowledge, and collaboration side by side.',
              },
              {
                href: '/guides/ai-writing-tools-comparison',
                title: isChinese ? '写作工具对比' : 'Writing tools comparison',
                desc: isChinese
                  ? '如果重点偏写作产出，这里更贴近。'
                  : 'Better if the real job is drafting and content output.',
              },
              {
                href: '/guides/ai-tools-for-research-comparison',
                title: isChinese ? '研究工具对比' : 'Research tools comparison',
                desc: isChinese
                  ? '如果重点偏资料检索和核对，这里更贴近。'
                  : 'Better for discovery, retrieval, and validation workflows.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`chatbot_guide_${item.href.split('/').pop()}`}
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
              href='/best-ai-tools/ai-chatbot-tools'
              ctaId='chatbot_guide_top_list_secondary'
              ctaLabel='Chatbot guide top list secondary'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '打开聊天机器人榜单' : 'Open chatbot ranking'}
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/submit'
              ctaId='chatbot_guide_submit'
              ctaLabel='Chatbot guide submit'
              pageType='guide'
              className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-50'
            >
              {isChinese ? '提交你的工具' : 'Submit your tool'}
            </TrackableCtaLink>
          </div>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {quickStarts.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='rounded-xl border border-white bg-white p-4 shadow-sm transition hover:bg-slate-50'
              >
                <p className='text-sm font-semibold text-slate-950'>{item.title}</p>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看用途，再看知识和稳定性' : 'Start with the use case, then knowledge and reliability'}
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
              {isChinese ? '聊天机器人通常在这些分类里' : 'Chatbots often sit in these categories'}
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
              {isChinese ? '聊天机器人看什么' : 'What matters for chatbots'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能稳定回答你的真实问题' : 'Can it reliably answer your real questions?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '聊天机器人最重要的是回答是否稳定、有没有幻觉控制、能不能接入你的知识库。你要特别看它在真实问题上的表现，而不只是演示。'
                  : 'What matters most is answer quality, hallucination control, and knowledge-base integration. Judge it on your real questions, not just the demo.'}
              </p>
              <p>
                {isChinese
                  ? '如果你是个人用户、内容工作者或团队成员，优先看上下文长度、历史记录和协作能力。'
                  : 'If you are an individual user, content worker, or teammate, prioritize context length, history, and collaboration features.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '聊天机器人最常见的问题' : 'Common questions about chatbots'}
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

        <section className='mt-8 rounded-[20px] border border-cyan-200 bg-cyan-50/60 p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '高意图榜单' : 'High-intent ranking'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese ? '先用榜单缩小聊天机器人 shortlist' : 'Use the ranking to narrow your chatbot shortlist first'}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>
            {isChinese
              ? '如果你已经知道自己更偏问答、写作、知识检索或团队协作，榜单页会比泛目录更快进入决策。'
              : 'If the decision is already about Q&A, writing, knowledge retrieval, or team collaboration, the ranking page gets to a decision faster than a broad directory.'}
          </p>
          <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
            {[
              {
                href: '/best-ai-tools/ai-chatbot-tools',
                title: isChinese ? '聊天机器人榜单' : 'Chatbot ranking',
                desc: isChinese ? '直接看高意图 shortlist。' : 'Go straight to the high-intent shortlist.',
              },
              {
                href: '/best-ai-tools/ai-writing-tools',
                title: isChinese ? '写作工具榜单' : 'Writing tools ranking',
                desc: isChinese ? '如果你的核心场景偏写作。' : 'Best when drafting and writing are the main task.',
              },
              {
                href: '/guides/ai-chatbot-tools-comparison',
                title: isChinese ? '聊天机器人对比' : 'Chatbot comparison',
                desc: isChinese
                  ? '横向看回答、知识和协作。'
                  : 'Compare answers, knowledge, and collaboration side by side.',
              },
              {
                href: '/guides/ai-tools-for-research-comparison',
                title: isChinese ? '研究工具对比' : 'Research tools comparison',
                desc: isChinese
                  ? '如果重点偏资料检索和核对。'
                  : 'Better for discovery, retrieval, and validation workflows.',
              },
            ].map((item) => (
              <TrackableCtaLink
                key={item.href}
                href={item.href}
                ctaId={`chatbot_guide_${item.href.split('/').pop()}`}
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

        <section className='mt-8 rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '下一步怎么走' : 'Next step'}
          </p>
          <h2 className='mt-1 text-2xl font-bold text-slate-950'>
            {isChinese
              ? '把聊天入口接到榜单、比较页和真实条目'
              : 'Move from the chatbot guide into rankings, comparisons, and real listings'}
          </h2>
          <div className='mt-4 grid gap-4 lg:grid-cols-3'>
            <TrackableCtaLink
              href='/best-ai-tools/ai-chatbot-tools'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
              ctaId='chatbot_guide_ranking_next'
              ctaLabel='Chatbot guide ranking next'
              pageType='guide'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '看聊天机器人榜单' : 'Open chatbot ranking'}
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
              href='/guides/ai-chatbot-tools-comparison'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
              ctaId='chatbot_guide_compare_next'
              ctaLabel='Chatbot guide compare next'
              pageType='guide'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '看聊天机器人对比' : 'Compare chatbots'}
                  </p>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {isChinese
                      ? '当用途已经清楚，就进入横向对比。'
                      : 'Once the use case is clear, move into side-by-side comparison.'}
                  </p>
                </div>
                <ArrowRight className='mt-1 size-4 shrink-0 text-slate-400 group-hover:text-cyan-700' />
              </div>
            </TrackableCtaLink>
            <TrackableCtaLink
              href='/categories/chatbot?sort=popular'
              className='group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-sm'
              ctaId='chatbot_guide_category'
              ctaLabel='Chatbot guide category'
              pageType='guide'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-base font-semibold text-slate-950 group-hover:text-cyan-700'>
                    {isChinese ? '进入 Chatbot 分类' : 'Open the chatbot category'}
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
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_chatbot_tools' />
      </div>
    </>
  );
}
