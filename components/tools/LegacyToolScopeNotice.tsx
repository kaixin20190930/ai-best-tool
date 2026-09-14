import getLegacyToolScopeReview from '@/lib/config/legacyToolScopeReviews';
import { getPublicToolScope } from '@/lib/content/publicToolScope';

export default function LegacyToolScopeNotice({ slug, locale }: { slug: string; locale: string }) {
  const review = getLegacyToolScopeReview(slug, locale);
  const publicScope = getPublicToolScope(slug, locale);
  if (!review || !publicScope) return null;
  const chinese = locale === 'cn' || locale === 'tw';
  return (
    <aside
      data-tool-scope-review={slug}
      aria-label={chinese ? '产品范围与限制' : 'Product scope and limits'}
      className='mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-slate-800'
    >
      <p className='font-semibold text-amber-950'>
        {chinese ? '先确认具体产品，再判断是否适合' : 'Identify the specific product before assessing fit'}
      </p>
      <p className='mt-2'>{publicScope[0]}</p>
      <p className='mt-2'>{publicScope[1]}</p>
      <p className='mt-2 text-xs text-slate-600'>
        {chinese ? '范围资料核对：' : 'Scope sources checked: '}
        {review.checkedAt}
        {chinese
          ? '；此日期适用于以下范围资料，具体价格与使用要求请查看对应产品说明。'
          : '; this date covers the scope sources below. Check the specific product for pricing and usage requirements.'}
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
