import React from 'react';
import Link from 'next/link';

import { getSafetyToolReview } from '@/lib/config/safetyToolReviews';
import { generateLocalizedPath } from '@/lib/seo/metadata';
import SeoBreadcrumbs from '@/components/seo/SeoBreadcrumbs';

export default function SafetyToolArchivePage({ slug, locale }: { slug: string; locale: string }) {
  const review = getSafetyToolReview(slug, locale);
  if (!review) return null;
  const chinese = locale === 'cn' || locale === 'tw';
  const archived = review.disposition === 'archive';

  return (
    <main className='min-h-[70vh] bg-slate-50' data-safety-tool-page={slug}>
      <div className='mx-auto max-w-4xl space-y-6 px-4 py-10'>
        <SeoBreadcrumbs
          locale={locale}
          items={[
            { name: chinese ? '首页' : 'Home', path: '/' },
            { name: chinese ? '探索工具' : 'Explore', path: '/explore' },
            { name: review.title, path: `/ai/${slug}` },
          ]}
        />
        <div className='rounded-2xl border border-rose-200 bg-white p-6 shadow-sm'>
          <p className='text-xs font-semibold uppercase tracking-[0.16em] text-rose-700'>
            {archived
              ? chinese ? '安全与合规归档' : 'Safety and compliance archive'
              : chinese ? '范围核验中' : 'Scope review in progress'}
          </p>
          <h1 className='mt-3 text-3xl font-bold text-slate-950'>{review.title}</h1>
          <p className='mt-4 text-base leading-7 text-slate-700'>{review.content}</p>
        </div>
        <section className='grid gap-4 md:grid-cols-2'>
          <div className='rounded-xl bg-white p-5 ring-1 ring-slate-200'>
            <h2 className='font-semibold text-slate-950'>{chinese ? '处置原因' : 'Why this record is restricted'}</h2>
            <p className='mt-2 text-sm leading-6 text-slate-700'>{review.reason}</p>
          </div>
          <div className='rounded-xl bg-white p-5 ring-1 ring-slate-200'>
            <h2 className='font-semibold text-slate-950'>{chinese ? '后续处理' : 'What happens next'}</h2>
            <p className='mt-2 text-sm leading-6 text-slate-700'>{review.next}</p>
          </div>
        </section>
        <p className='text-xs leading-5 text-slate-500'>
          {chinese ? '最近核对：' : 'Last checked: '}{review.checkedAt}
          {review.sources.length > 0 ? chinese ? '。参考资料：' : '. Reference: ' : ''}
          {review.sources.map((source, index) => (
            <span key={source.url}>
              {index > 0 ? ', ' : ''}
              <a href={source.url} target='_blank' rel='noreferrer' className='underline underline-offset-4'>
                {source.label}
              </a>
            </span>
          ))}
        </p>
        <Link className='inline-flex font-semibold text-cyan-800 underline underline-offset-4' href={generateLocalizedPath('/explore', locale)}>
          {chinese ? '查找已核验的 AI 工具' : 'Explore verified AI tools'}
        </Link>
      </div>
    </main>
  );
}
