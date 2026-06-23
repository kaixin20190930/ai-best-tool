import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, ExternalLink, FileText, Sparkles } from 'lucide-react';
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
      locale === 'cn' || locale === 'tw' ? '如何选择 AI 工具 | AI Best Tool' : `How to choose AI tools | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '一个实用的 AI 工具选型指南：先看场景，再看价格、更新、截图和评论。'
        : 'A practical guide to choosing AI tools: start with use case, then check pricing, freshness, screenshots, and comments.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '选型指南' : 'Guides', url: `${siteUrl}/${locale}/guides/how-to-choose-ai-tools` },
  ]);
  const faqs = [
    {
      question: isChinese ? '选 AI 工具时最先看什么？' : 'What should I check first when choosing an AI tool?',
      answer: isChinese
        ? '先看它是不是解决你的核心场景。能不能帮你省时间、提高质量，通常比功能数量更重要。'
        : 'Start with the core use case. Whether it saves time or improves quality usually matters more than the raw number of features.',
    },
    {
      question: isChinese ? '免费工具够用吗？' : 'Are free AI tools enough?',
      answer: isChinese
        ? '很多场景够用，但如果你很在意稳定性、限制、团队协作或支持，付费工具会更完整。'
        : 'For many tasks, yes. But if you care about stability, limits, team workflows, or support, paid tools often feel more complete.',
    },
    {
      question: isChinese ? '怎么判断工具是不是“新”且值得试？' : 'How do I know if a tool is fresh and worth trying?',
      answer: isChinese
        ? '看最近更新时间、评论、截图和是否还在活跃更新。越能看到真实使用痕迹，越值得试。'
        : 'Check the latest update, comments, screenshots, and whether it still looks actively maintained. Real usage signals are a good sign.',
    },
    {
      question: isChinese ? '我可以直接从这里找到适合我的分类吗？' : 'Can I find the right category from here?',
      answer: isChinese
        ? '可以。你可以先从分类页开始，再结合搜索、筛选和评论做进一步判断。'
        : 'Yes. Start with category pages, then refine with search, filters, and comments.',
    },
  ];
  const faqSchema = generateFAQSchema(faqs);
  const tips = isChinese
    ? [
        '先锁定一个真实场景，不要先看功能清单。',
        '优先看最近更新、截图和评论，而不是只看首页文案。',
        '如果你在比较多个工具，先从分类页和搜索结果缩小范围。',
      ]
    : [
        'Start from a real use case, not a feature checklist.',
        'Prefer fresh updates, screenshots, and comments over homepage claims.',
        'If you are comparing tools, narrow the field with category pages and search.',
      ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={faqSchema} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Sparkles className='size-4' />
              {isChinese ? '选型指南' : 'Selection guide'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <FileText className='size-4' />
              {isChinese ? '更适合先读再选' : 'Read before you choose'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? '如何选择一个真正适合你的 AI 工具'
              : 'How to choose an AI tool that actually fits your workflow'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '别先被功能数量带跑，先确认它是不是能解决你的真实场景。这个指南帮你从场景、价格、更新、截图和评论几个维度做判断。'
              : 'Do not get distracted by feature count first. Start from the real problem you want to solve, then check use case fit, pricing, freshness, screenshots, and comments.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href='/explore'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '去浏览工具' : 'Browse tools'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/guides'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '查看全部指南' : 'See all guides'}
            </Link>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'A simple order'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看场景，再看内容细节' : 'Start with the use case, then check details'}
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
              {isChinese ? '快速筛选' : 'Quick filter'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '适合先看的分类' : 'Categories worth starting with'}
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
              {isChinese ? '免费 vs 付费' : 'Free vs paid'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '不是越贵越好，而是越贴近你的需求越好' : 'Not always about price, but fit'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '免费工具适合先试用、先验证；付费工具适合你已经明确需要稳定性、支持或更高限制。'
                  : 'Free tools are great for trying ideas. Paid tools matter when you need stability, support, or fewer limits.'}
              </p>
              <p>
                {isChinese
                  ? '如果你的目标是团队协作、持续内容输出或商业使用，优先把“支持、权限、更新频率”放在第一位。'
                  : 'If your goal is team workflows, ongoing output, or commercial use, put support, permissions, and update frequency first.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '你可能会问的几个问题' : 'Questions you may ask'}
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
        <GuideSubmissionPath locale={locale} ctaPrefix='how_to_choose_ai_tools' />
      </div>
    </>
  );
}
