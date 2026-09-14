import Link from 'next/link';

import { getLegacyToolScopeContent } from '@/lib/config/legacyToolScopeReviews';
import { buildLoginHref } from '@/lib/navigation/localizedPaths';
import { generateLocalizedPath } from '@/lib/seo/metadata';
import SeoBreadcrumbs from '@/components/seo/SeoBreadcrumbs';
import LegacyToolScopeNotice from '@/components/tools/LegacyToolScopeNotice';

export default function LegacyToolScopePage({ slug, title, locale }: { slug: string; title: string; locale: string }) {
  const copy = getLegacyToolScopeContent(slug, locale);
  if (!copy) return null;
  const chinese = locale === 'cn' || locale === 'tw';
  return (
    <div className='bg-slate-50' data-legacy-scope-page={slug}>
      <div className='mx-auto max-w-4xl space-y-6 px-4 py-10'>
        <SeoBreadcrumbs
          locale={locale}
          items={[
            { name: chinese ? '首页' : 'Home', path: '/' },
            { name: chinese ? '探索工具' : 'Explore', path: '/explore' },
            { name: title, path: `/ai/${slug}` },
          ]}
        />
        <h1 className='text-4xl font-bold text-slate-950'>{title}</h1>
        <LegacyToolScopeNotice slug={slug} locale={locale} />
        <div className='flex flex-wrap gap-4 text-sm font-semibold text-cyan-800'>
          <Link href={generateLocalizedPath('/explore', locale)}>{chinese ? '继续查找工具' : 'Explore tools'}</Link>
          <Link href={generateLocalizedPath(buildLoginHref(`/ai/${slug}`, locale), locale)}>
            {chinese ? '登录' : 'Log in'}
          </Link>
        </div>
        <details data-tool-owner-actions className='rounded-lg border border-slate-200 p-4 text-sm'>
          <summary className='cursor-pointer font-semibold text-slate-700'>
            {chinese ? '如果这是你的产品' : 'If this is your product'}
          </summary>
          <div className='mt-3 font-semibold text-cyan-800'>
            {' '}
            <Link href={generateLocalizedPath('/developer/listing?intent=claim', locale)}>
              {chinese ? '认领并提供具体产品资料' : 'Claim and clarify the product'}
            </Link>
          </div>
        </details>
      </div>
    </div>
  );
}
