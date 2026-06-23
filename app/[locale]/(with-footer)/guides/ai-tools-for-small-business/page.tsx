import { Metadata } from 'next';
import Link from 'next/link';
import { BriefcaseBusiness, CheckCircle2, ExternalLink, TrendingUp } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import GuideSubmissionPath from '@/components/guides/GuideSubmissionPath';
import { StructuredDataServer } from '@/components/seo/StructuredData';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.home',
  });

  return {
    title:
      locale === 'cn' || locale === 'tw'
        ? 'AI 小企业工具推荐 | AI Best Tool'
        : `AI tools for small business | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向小团队、创业公司和独立商家的 AI 工具选型指南。'
        : 'A practical guide to AI tools for small teams, startups, and solo businesses.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '选型指南' : 'Guides', url: `${siteUrl}/${locale}/guides/how-to-choose-ai-tools` },
    {
      name: isChinese ? '小企业工具' : 'Small business tools',
      url: `${siteUrl}/${locale}/guides/ai-tools-for-small-business`,
    },
  ]);
  const faqs = [
    {
      question: isChinese ? '小企业最适合用 AI 工具做什么？' : 'What are AI tools best for in a small business?',
      answer: isChinese
        ? '最适合写营销文案、回复邮件、做客服草稿、整理资料、生成图片和视频素材，以及提高日常流程效率。'
        : 'They are best for marketing copy, email replies, customer support drafts, document organization, image/video assets, and everyday efficiency.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它能不能接入你现在正在用的邮箱、表单、文档、CRM 或协作工具。'
        : 'Start with workflow fit: email, forms, docs, CRM, and collaboration tools matter most.',
    },
    {
      question: isChinese ? '免费版够用吗？' : 'Is the free tier enough?',
      answer: isChinese
        ? '个人试用和轻量任务常常够用；如果你需要团队权限、自动化和更稳定的支持，通常会更快碰到限制。'
        : 'Free tiers can be enough for testing and light work. If you need team permissions, automation, or support, you may hit limits sooner.',
    },
    {
      question: isChinese
        ? '我可以直接从这里找到适合小企业的工具吗？'
        : 'Can I find small-business-friendly tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从搜索和分类开始，再结合评论、截图和更新频率判断。'
        : 'Yes. Start from search and categories, then judge with comments, screenshots, and update frequency.',
    },
  ];
  const faqSchema = generateFAQSchema(faqs);
  const chineseTips = [
    '先分清场景：营销、客服、内容、运营、设计、自动化。',
    '看它是否能接入你现在已经在用的工具。',
    '如果你会多人协作，优先看权限、共享和后台管理能力。',
  ];
  const englishTips = [
    'Separate the use case first: marketing, support, content, operations, design, or automation.',
    'Check whether it connects to the tools you already use.',
    'If multiple people will use it, prioritize permissions, sharing, and admin features.',
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
              <BriefcaseBusiness className='size-4' />
              {isChinese ? '小企业工具推荐' : 'Small business tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <TrendingUp className='size-4' />
              {isChinese ? '效率与增长并重' : 'Efficiency and growth'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 小企业工具推荐：怎么选更适合团队和生意'
              : 'AI tools for small business: how to choose one for your team and business'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '小企业最需要的是能帮你节省时间、降低人工成本，并且适合团队协作的工具。这个页面会帮你从工作流、协作和自动化几个角度判断。'
              : 'Small businesses need tools that save time, reduce manual work, and fit team collaboration. This page helps you judge by workflow, collaboration, and automation.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href='/explore?search=business&sort=popular'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看小企业相关工具' : 'Browse business tools'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/guides/how-to-choose-ai-tools'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到选型指南' : 'Back to selection guide'}
            </Link>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看工作流，再看团队协作' : 'Start with workflow fit, then team collaboration'}
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
              {isChinese ? '小企业工具通常在这些分类里' : 'Small business tools often sit in these categories'}
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
              {isChinese ? '小企业工具看什么' : 'What matters for small business tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能真正帮你少雇一点重复劳动' : 'Can it actually reduce repetitive labor?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '小企业工具最重要的是省时间、省沟通成本、能协作。你要特别看它是否能接到邮箱、表单、文档、CRM 或客服流程。'
                  : 'The key is saving time, reducing communication overhead, and enabling collaboration. Check whether it fits email, forms, docs, CRM, or support workflows.'}
              </p>
              <p>
                {isChinese
                  ? '如果你是创业者、独立商家或小团队，优先看自动化、权限和支持。'
                  : 'If you are a founder, solo operator, or small team, prioritize automation, permissions, and support.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '小企业工具最常见的问题' : 'Common questions about small business tools'}
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
        <GuideSubmissionPath locale={locale} ctaPrefix='ai_tools_for_small_business' />
      </div>
    </>
  );
}
