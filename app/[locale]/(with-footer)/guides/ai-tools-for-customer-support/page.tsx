import { Metadata } from 'next';
import { CheckCircle2, Headset, MessageSquare } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { BASE_URL } from '@/lib/env';
import { getNoindexMetadata } from '@/lib/seo/indexing';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import GuideActionSection from '@/components/guides/GuideActionSection';
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

  const siteUrl = BASE_URL;
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
          ]}
        />
      </div>
    </>
  );
}
