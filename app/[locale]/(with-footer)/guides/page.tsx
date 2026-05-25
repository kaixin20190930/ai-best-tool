import Link from 'next/link';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ArrowRight, BookOpen, CheckCircle2, Sparkles } from 'lucide-react';

import { StructuredDataServer } from '@/components/seo/StructuredData';
import { GUIDE_PAGES } from '@/lib/content/guides';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';

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
      ? 'AI 指南总览 | AI Best Tool'
      : `AI guides hub | ${t('title')}`,
    description:
      locale === 'cn' || locale === 'tw'
        ? '汇总 AI 工具选型、免费工具和各类场景指南。'
        : 'A hub for AI tool selection, free tools, and use-case guides.',
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
    { name: isChinese ? '指南总览' : 'Guides', url: `${siteUrl}/${locale}/guides` },
  ]);

  return (
    <>
      <StructuredDataServer data={breadcrumbSchema} />
      <div className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700'>
              <BookOpen className='size-4' />
              {isChinese ? '指南总览' : 'Guides hub'}
            </span>
            <span className='inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              <Sparkles className='size-4' />
              {isChinese ? '先看再选' : 'Read before you choose'}
            </span>
          </div>

          <h1 className='mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl'>
            {isChinese ? 'AI 指南总览' : 'AI guides hub'}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-slate-600 lg:text-lg'>
            {isChinese
              ? '把选型、免费工具和各类场景指南收在一起，先帮助用户理清思路，再进入具体工具和分类。'
              : 'A single place for selection tips, free tools, and use-case guides so people can sort out their needs before diving into tools and categories.'}
          </p>
        </section>

        <section className='mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {GUIDE_PAGES.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className='group rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'
            >
              <div className='flex items-center justify-between gap-3'>
                <div>
                  <h2 className='text-lg font-semibold text-slate-950'>
                    {item.title[isChinese ? 'cn' : 'en']}
                  </h2>
                  <p className='mt-2 text-sm leading-6 text-slate-600'>
                    {item.desc[isChinese ? 'cn' : 'en']}
                  </p>
                </div>
                <ArrowRight className='size-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700' />
              </div>
            </Link>
          ))}
        </section>

        <section className='mt-8 rounded-[18px] border border-slate-200 bg-slate-50 p-6 shadow-sm lg:p-8'>
          <div className='flex items-start gap-3'>
            <CheckCircle2 className='mt-1 size-5 shrink-0 text-emerald-600' />
            <div>
              <h2 className='text-xl font-semibold text-slate-950'>
                {isChinese ? '建议的阅读顺序' : 'Suggested reading order'}
              </h2>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {isChinese
                  ? '先看总选型指南，再看免费工具和具体场景页，最后回到搜索和分类页做进一步筛选。'
                  : 'Start with the selection guide, then free tools and specific use-case pages, and finish by using search and categories to narrow down.'}
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
