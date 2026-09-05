import React from 'react';

import getLegacyToolScopeReview from '@/lib/config/legacyToolScopeReviews';

export default function LegacyToolScopeNotice({ slug, locale }: { slug: string; locale: string }) {
  const review = getLegacyToolScopeReview(slug, locale);
  if (!review) return null;
  const chinese = locale === 'cn' || locale === 'tw';
  return (
    <aside
      data-tool-scope-review={slug}
      aria-label={chinese ? '产品范围待核验' : 'Product scope needs review'}
      className='mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-slate-800'
    >
      <p className='font-semibold text-amber-950'>
        {chinese ? '先确认具体产品，再判断是否适合' : 'Identify the specific product before assessing fit'}
      </p>
      <p className='mt-2'>{review.summary}</p>
      <p className='mt-2'>{review.next}</p>
      <p className='mt-2 text-xs text-slate-600'>
        {chinese ? '范围资料核对：' : 'Scope sources checked: '}
        {review.checkedAt}
        {chinese
          ? '；不是实测、市场验证或收录批准。品牌或产品体系的信息不能替代具体产品核验。'
          : '; not a hands-on test, market validation or admission approval. Brand or product-family information does not replace a specific product review.'}
      </p>
      <ul className='mt-3 flex flex-wrap gap-x-5 gap-y-2'>
        {review.sources.map((source) => (
          <li key={source.url}>
            <a href={source.url} target='_blank' rel='noreferrer' className='underline underline-offset-4'>
              {source.label}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
