import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, ExternalLink, Megaphone, TrendingUp } from 'lucide-react';
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
      locale === 'cn' || locale === 'tw' ? 'AI 营销工具推荐 | AI Best Tool' : `AI tools for marketing | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '面向广告、增长、社媒和营销团队的 AI 工具选型指南。'
        : 'A practical guide to AI tools for ads, growth, social, and marketing teams.',
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const categories = await getAllCategories(true).catch(() => []);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '选型指南' : 'Guides', url: `${siteUrl}/${locale}/guides/how-to-choose-ai-tools` },
    { name: isChinese ? '营销工具' : 'Marketing tools', url: `${siteUrl}/${locale}/guides/ai-tools-for-marketing` },
  ]);
  const faqs = [
    {
      question: isChinese ? '营销团队最适合用 AI 做什么？' : 'What are marketing teams best using AI for?',
      answer: isChinese
        ? '最适合广告文案、邮件、社媒内容、活动素材、A/B 测试文案和营销报告整理。它更像增长和执行助手。'
        : 'They are great for ad copy, email, social content, campaign assets, A/B testing copy, and reporting. Think of them as growth and execution helpers.',
    },
    {
      question: isChinese ? '我应该先看什么？' : 'What should I check first?',
      answer: isChinese
        ? '先看它是否支持你的渠道，比如广告、邮件、社媒、落地页和 CRM。'
        : 'Start with channel fit: ads, email, social, landing pages, and CRM matter most.',
    },
    {
      question: isChinese ? '免费营销工具够吗？' : 'Are free marketing tools enough?',
      answer: isChinese
        ? '轻量内容和测试通常够用；如果你需要协作、批量生产、品牌控制和更稳定的导出，通常会更快碰到限制。'
        : 'Free tiers can work for light content and testing. If you need collaboration, bulk production, brand control, and more reliable exports, limits show up quickly.',
    },
    {
      question: isChinese ? '我可以直接从这里找到营销工具吗？' : 'Can I find marketing tools directly from here?',
      answer: isChinese
        ? '可以。你可以先从搜索和分类页开始，再结合评论、截图和更新频率判断。'
        : 'Yes. Start from search and categories, then judge with comments, screenshots, and update frequency.',
    },
  ];
  const faqSchema = generateFAQSchema(faqs);
  const tips = isChinese
    ? [
        '先分清你做的是投放、增长、社媒、邮件还是内容营销。',
        '看它是否能接到你已有的广告、邮件和 CRM 工具。',
        '如果你要持续迭代，优先看模板、批量、权限和品牌一致性。',
      ]
    : [
        'Separate the work first: ads, growth, social, email, or content marketing all need different tools.',
        'Check whether it plugs into your ad, email, and CRM stack.',
        'If you will iterate often, prioritize templates, batch workflows, permissions, and brand consistency.',
      ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={faqSchema} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Megaphone className='size-4' />
              {isChinese ? '营销工具推荐' : 'Marketing tools'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <TrendingUp className='size-4' />
              {isChinese ? '增长和转化优先' : 'Growth and conversion'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese
              ? 'AI 营销工具推荐：怎么选更适合你的增长工作流'
              : 'AI tools for marketing: how to choose one that fits your growth workflow'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '营销团队需要的不只是“能写文案”，而是能把广告、邮件、社媒、落地页和报告串起来。这个页面会帮你从渠道和产出效率两个角度判断。'
              : 'Marketing teams need more than "it can write copy." The real value is connecting ads, email, social, landing pages, and reporting. This page helps you judge by channel and output efficiency.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href='/explore?search=marketing&sort=popular'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '看营销工具' : 'Browse marketing tools'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/guides/how-to-choose-ai-tools'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '回到选型指南' : 'Back to selection guide'}
            </Link>
            <Link
              href='/guides/ai-writing-tools'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '看写作工具' : 'Writing tools'}
            </Link>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '判断顺序' : 'How to judge'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看渠道，再看节省的时间' : 'Start with the channel, then time saved'}
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
              {isChinese ? '营销工具通常在这些分类里' : 'Marketing tools often sit in these categories'}
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
              {isChinese ? '营销工具看什么' : 'What matters for marketing tools'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '能不能稳定支持你的渠道和产出' : 'Can it reliably support your channels and output?'}
            </h2>
            <div className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              <p>
                {isChinese
                  ? '营销工具最重要的是渠道适配。你要看它是否能覆盖你正在做的广告、邮件、社媒、落地页和报告。'
                  : 'Channel fit is the key. Check whether it covers the ads, email, social, landing pages, and reports you actually work on.'}
              </p>
              <p>
                {isChinese
                  ? '如果你是增长、内容或投放团队，优先看批量、模板、协作和品牌一致性。'
                  : 'If you work in growth, content, or performance marketing, prioritize batch workflows, templates, collaboration, and brand consistency.'}
              </p>
            </div>
          </div>

          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '常见问题' : 'FAQ'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '营销工具最常见的问题' : 'Common questions about marketing tools'}
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
