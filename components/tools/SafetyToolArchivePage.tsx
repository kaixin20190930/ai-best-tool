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
              ? chinese
                ? '安全与合规归档'
                : 'Safety and compliance archive'
              : chinese
                ? '产品范围说明'
                : 'Product scope notice'}
          </p>
          <h1 className='mt-3 text-3xl font-bold text-slate-950'>{review.title}</h1>
          <p className='mt-4 text-base leading-7 text-slate-700'>{review.content}</p>
        </div>
        <section className='rounded-xl bg-white p-5 ring-1 ring-slate-200'>
          <h2 className='font-semibold text-slate-950'>{chinese ? '选择前须知' : 'Before choosing'}</h2>
          <p className='mt-2 text-sm leading-6 text-slate-700'>
            {slug === 'undressing_ai'
              ? review.reason
              : archived
                ? chinese
                  ? '请勿上传个人照片或敏感资料。当前服务状态、安全措施和年龄限制无法可靠确认。'
                  : 'Avoid uploading personal photographs or sensitive data. The current service, safeguards, and age controls cannot be reliably confirmed.'
                : chinese
                  ? '使用前请核对商业使用权、上传内容留存、套餐限制和内容安全措施，并用非敏感内容检查结果。'
                  : 'Before use, check commercial rights, upload retention, plan limits, and content safeguards, and evaluate results with non-sensitive content.'}
          </p>
        </section>
        <p className='text-xs leading-5 text-slate-500'>
          {chinese ? '最近核对：' : 'Last checked: '}
          {review.checkedAt}
          {review.sources.length > 0 ? (chinese ? '。参考资料：' : '. Reference: ') : ''}
          {review.sources.map((source, index) => (
            <span key={source.url}>
              {index > 0 ? ', ' : ''}
              <a href={source.url} target='_blank' rel='noreferrer' className='underline underline-offset-4'>
                {source.label}
              </a>
            </span>
          ))}
        </p>
        <Link
          className='inline-flex font-semibold text-cyan-800 underline underline-offset-4'
          href={generateLocalizedPath('/explore', locale)}
        >
          {chinese ? '查找已核验的 AI 工具' : 'Explore verified AI tools'}
        </Link>
      </div>
    </main>
  );
}
