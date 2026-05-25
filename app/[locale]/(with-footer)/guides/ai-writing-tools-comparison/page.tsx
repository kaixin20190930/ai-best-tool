import Link from 'next/link';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ArrowRight, CheckCircle2, Columns3, ExternalLink, Sparkles } from 'lucide-react';

import { StructuredDataServer } from '@/components/seo/StructuredData';
import { generateBreadcrumbSchema, generateFAQSchema, generateItemListSchema } from '@/lib/seo/schema';
import { getAllCategories, getLocalizedField } from '@/lib/services/categories';
import { getTools } from '@/lib/services/tools';
import { toolToListRow } from '@/lib/services/toolPresenter';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: 'Metadata.home',
  });

  return {
    title: locale === 'cn' || locale === 'tw'
      ? 'AI 写作工具对比 | AI Best Tool'
      : `AI writing tools comparison | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '对比几款常见的 AI 写作工具，帮你更快选出适合的一个。'
        : 'Compare common AI writing tools to choose the one that fits you best.',
  };
}

export default async function Page({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${siteUrl}/${locale}` },
    { name: isChinese ? '指南' : 'Guides', url: `${siteUrl}/${locale}/guides` },
    { name: isChinese ? '写作工具对比' : 'Writing tools comparison', url: `${siteUrl}/${locale}/guides/ai-writing-tools-comparison` },
  ]);

  const faqSchema = generateFAQSchema([
    {
      question: isChinese ? '你们比较的依据是什么？' : 'What do you compare?',
      answer: isChinese
        ? '我们主要看免费可用性、评分、更新情况、内容完整度和实际使用感。'
        : 'We compare free usability, ratings, freshness, content completeness, and practical usefulness.',
    },
    {
      question: isChinese ? '为什么只看写作工具？' : 'Why only writing tools?',
      answer: isChinese
        ? '因为写作是最常见、最容易形成明确对比意图的搜索场景之一。'
        : 'Because writing is one of the clearest and most common compare-intent search cases.',
    },
  ]);

  const [toolsResult, categories] = await Promise.all([
    getTools(
      { search: 'writing', status: 'published' },
      { page: 1, pageSize: 4 },
      'popular'
    ),
    getAllCategories(true).catch(() => []),
  ]);

  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const tools = toolsResult.data.map((tool) => {
    const row = toolToListRow(tool, locale);
    return {
      ...row,
      pricing: tool.pricing,
      categoryLabel: tool.categoryId && categoryMap.has(tool.categoryId)
        ? getLocalizedField(categoryMap.get(tool.categoryId)!.name, locale)
        : '',
      averageRating: tool.averageRating,
      ratingCount: tool.ratingCount,
      summary: row.content,
    };
  });

  const itemListSchema = generateItemListSchema(
    tools.map((tool) => ({
      name: tool.title,
      url: `${siteUrl}/${locale}/ai/${tool.name}`,
    })),
    isChinese ? 'AI writing tools comparison' : 'AI writing tools comparison'
  );

  const tips = isChinese
    ? [
        '先看你是写博客、邮件、SEO 还是社媒，不同场景侧重点不一样。',
        '如果你想先试再买，优先看免费版本的限制和输出质量。',
        '更看重长期使用时，关注更新频率、评分和实际评论。',
      ]
    : [
        'Start with your use case: blog, email, SEO, or social all need different things.',
        'If you want to try before paying, focus on free-tier limits and output quality.',
        'For long-term use, pay attention to freshness, ratings, and real comments.',
      ];

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <StructuredDataServer data={faqSchema} />
      <StructuredDataServer data={itemListSchema} />

      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <Columns3 className='size-4' />
              {isChinese ? '写作工具对比' : 'Writing tools comparison'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Sparkles className='size-4' />
              {isChinese ? '快速对照' : 'Quick compare'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese ? 'AI 写作工具对比' : 'AI writing tools comparison'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '如果你已经知道自己是要写内容，这一页会帮你把几款常见的写作工具放在一起看，减少来回切换的成本。'
              : 'If you already know you need a writing tool, this page helps you compare a few common ones side by side and reduce decision fatigue.'}
          </p>

          <div className='mt-6 flex flex-wrap gap-3'>
            <Link
              href='/guides/ai-writing-tools'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800'
            >
              {isChinese ? '回到写作指南' : 'Back to writing guide'}
              <ExternalLink className='size-4' />
            </Link>
            <Link
              href='/explore?search=writing&sort=popular'
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              {isChinese ? '浏览更多写作工具' : 'Browse more writing tools'}
              <ArrowRight className='size-4' />
            </Link>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
              {isChinese ? '比较顺序' : 'How to compare'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '先看场景，再看免费限制' : 'Start with the use case, then the free-tier limits'}
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
              {isChinese ? '可直接进入' : 'Quick links'}
            </p>
            <h2 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? '写作类工具入口' : 'Writing-related entry points'}
            </h2>
            <div className='mt-4 grid gap-2'>
              <Link href='/guides' className='flex items-center justify-between rounded-lg border border-white bg-white px-4 py-3 text-sm text-slate-700 shadow-sm hover:bg-slate-100'>
                <span>{isChinese ? '指南总览' : 'Guides hub'}</span>
                <ArrowRight className='size-4 text-slate-400' />
              </Link>
              <Link href='/guides/best-free-ai-tools' className='flex items-center justify-between rounded-lg border border-white bg-white px-4 py-3 text-sm text-slate-700 shadow-sm hover:bg-slate-100'>
                <span>{isChinese ? '最佳免费 AI 工具' : 'Best free AI tools'}</span>
                <ArrowRight className='size-4 text-slate-400' />
              </Link>
            </div>
          </aside>
        </section>

        <section className='mt-8'>
          <div className='mb-4 flex items-end justify-between gap-3'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
                {isChinese ? '对比列表' : 'Comparison list'}
              </p>
              <h2 className='mt-1 text-2xl font-bold text-slate-950'>
                {isChinese ? '几款常见写作工具的快速对照' : 'A quick side-by-side look at common writing tools'}
              </h2>
            </div>
            <p className='text-sm text-slate-500'>
              {isChinese ? `${tools.length} 个工具` : `${tools.length} tools`}
            </p>
          </div>

          <div className='grid gap-4'>
            {tools.map((tool, index) => (
              <div key={tool.id} className='rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm'>
                <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span className='inline-flex size-8 items-center justify-center rounded-full bg-cyan-50 text-sm font-bold text-cyan-700'>
                        {index + 1}
                      </span>
                      <Link href={`/ai/${tool.name}`} className='text-lg font-semibold text-slate-950 hover:text-cyan-700'>
                        {tool.title}
                      </Link>
                      <span className='rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700'>
                        {tool.pricing === 'free' ? (isChinese ? '免费' : 'Free') : tool.pricing === 'freemium' ? (isChinese ? '免费增值' : 'Freemium') : (isChinese ? '付费' : 'Paid')}
                      </span>
                    </div>
                    <p className='mt-2 text-sm leading-6 text-slate-600'>{tool.summary}</p>
                  </div>

                  <div className='grid gap-3 text-sm text-slate-600 lg:w-[320px] lg:grid-cols-2'>
                    <div className='rounded-xl bg-slate-50 p-3'>
                      <div className='text-xs uppercase tracking-wide text-slate-500'>
                        {isChinese ? '评分' : 'Rating'}
                      </div>
                      <div className='mt-1 font-semibold text-slate-900'>
                        {tool.averageRating ? `${tool.averageRating.toFixed(1)}★` : (isChinese ? '暂无' : 'N/A')}
                      </div>
                    </div>
                    <div className='rounded-xl bg-slate-50 p-3'>
                      <div className='text-xs uppercase tracking-wide text-slate-500'>
                        {isChinese ? '评分数' : 'Reviews'}
                      </div>
                      <div className='mt-1 font-semibold text-slate-900'>
                        {tool.ratingCount || 0}
                      </div>
                    </div>
                    <div className='rounded-xl bg-slate-50 p-3 lg:col-span-2'>
                      <div className='text-xs uppercase tracking-wide text-slate-500'>
                        {isChinese ? '分类' : 'Category'}
                      </div>
                      <div className='mt-1 font-semibold text-slate-900'>
                        {tool.categoryLabel || (isChinese ? '未分类' : 'Uncategorized')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
