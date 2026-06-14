import { Metadata } from 'next';
import Link from 'next/link';
import { BadgeDollarSign, CheckCircle2, ExternalLink, Target } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import GuideActionSection from '@/components/guides/GuideActionSection';
import { StructuredDataServer } from '@/components/seo/StructuredData';

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
            <Link
              href='/explore?search=sales&sort=popular'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看销售工具' : 'Browse sales tools'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/guides/how-to-choose-ai-tools'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到选型指南' : 'Back to selection guide'}
            </Link>
            <Link
              href='/guides/ai-productivity-tools'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看生产力工具' : 'Productivity tools'}
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
      </div>
    </>
  );
}
