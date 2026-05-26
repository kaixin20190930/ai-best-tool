import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, ExternalLink, Layers3, Workflow } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import { StructuredDataServer } from '@/components/seo/StructuredData';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.home',
  });

  return {
    title:
      locale === 'cn' || locale === 'tw'
        ? 'AI 代理与服务团队工具推荐 | AI Best Tool'
        : `AI tools for agencies | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向代理商、服务团队和内容工作室的 AI 工具选型指南。'
        : 'A practical guide to AI tools for agencies, service teams, and content studios.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '选型指南' : 'Guides', url: `${siteUrl}/${locale}/guides/how-to-choose-ai-tools` },
    { name: isChinese ? '代理与服务团队' : 'Agency tools', url: `${siteUrl}/${locale}/guides/ai-tools-for-agencies` },
  ]);
  const faqs = [
    {
      question: isChinese ? '代理团队最适合用 AI 做什么？' : 'What are agencies best using AI for?',
      answer: isChinese
        ? '最适合提案、研究、文案、批量内容、客户汇报和内部协作。代理团队通常最在意的是交付效率和流程一致性。'
        : 'They are great for proposals, research, copywriting, bulk content, reporting, and internal collaboration. Agencies usually care most about delivery efficiency and process consistency.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它是否适合多人协作、权限管理、客户隔离和项目交付。'
        : 'Start with collaboration, permissions, client separation, and delivery workflows.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Is the free tier enough?',
      answer: isChinese
        ? '个人试用可能够用，但服务团队通常会更快遇到权限、数量、导出和协作限制。'
        : 'A free tier may work for testing, but service teams usually hit limits faster on permissions, volume, exports, and collaboration.',
    },
    {
      question: isChinese ? '我可以直接从这里找到代理工具吗？' : 'Can I find agency tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从搜索和分类页开始，再结合评论、截图和更新频率判断。'
        : 'Yes. Start from search and categories, then judge with comments, screenshots, and update frequency.',
    },
  ];
  const faqSchema = generateFAQSchema(faqs);
  const tips = isChinese
    ? [
        '先分清你是代理商、服务团队、内容工作室还是顾问。',
        '看它能不能支持项目分工、客户隔离、批量交付和版本控制。',
        '如果你多人协作，优先看权限、共享、审计和导出能力。',
      ]
    : [
        'Separate the operating model first: agency, service team, content studio, or consultancy.',
        'Check whether it supports project breakdown, client separation, bulk delivery, and versioning.',
        'If multiple people collaborate, prioritize permissions, sharing, auditability, and export flows.',
      ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={faqSchema} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Layers3 className='size-4' />
              {isChinese ? '代理与服务团队工具推荐' : 'Agency tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Workflow className='size-4' />
              {isChinese ? '交付与协作优先' : 'Delivery and collaboration'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 代理与服务团队工具推荐：怎么选更适合交付流程'
              : 'AI tools for agencies: how to choose one that fits delivery workflows'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '代理商和服务团队真正关心的不是“能不能生成”，而是能不能帮你更稳定地交付项目、分工、客户隔离和批量输出。这个页面会帮你从协作和交付效率两个角度判断。'
              : 'Agencies and service teams care less about whether a tool can generate something and more about whether it helps you deliver projects consistently, split work, separate clients, and produce in volume. This page helps you judge by collaboration and delivery efficiency.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href='/explore?search=agency&sort=popular'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看代理工具' : 'Browse agency tools'}
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
              {isChinese ? '先看交付方式，再看功能范围' : 'Start with delivery model, then feature scope'}
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
              {isChinese ? '代理工具通常在这些分类里' : 'Agency tools often sit in these categories'}
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
              {isChinese ? '代理工具看什么' : 'What matters for agency tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能稳定支撑你的项目交付' : 'Can it reliably support your delivery pipeline?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '代理和服务团队最重要的是流程与协作。你要看它能不能支持项目分工、客户隔离、版本管理和批量输出。'
                  : 'For agencies, process and collaboration matter most. Check whether it supports project splitting, client separation, versioning, and bulk output.'}
              </p>
              <p>
                {isChinese
                  ? '如果你需要多人交付，优先看权限、共享、审计和导出能力。'
                  : 'If multiple people deliver work together, prioritize permissions, sharing, auditability, and export workflows.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '代理与服务团队最常见的问题' : 'Common questions about agency tools'}
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
