import Link from 'next/link';

import { getLegacyToolScopeContent } from '@/lib/config/legacyToolScopeReviews';
import { buildLoginHref } from '@/lib/navigation/localizedPaths';
import { generateLocalizedPath } from '@/lib/seo/metadata';
import MarkdownProse from '@/components/MarkdownProse';
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
        <div className='rounded-xl bg-white p-6 ring-1 ring-slate-200'>
          <MarkdownProse markdown={copy.detail} className='text-base leading-7 text-slate-700 prose-a:text-cyan-800' />
        </div>
        <p className='text-sm text-slate-600'>
          {chinese
            ? '范围核对期间暂不展示通用评分、适用建议和比较卡。原有账户记录未删除。'
            : 'Generic ratings, fit suggestions and comparison cards are withheld during scope review. Existing account records have not been deleted.'}
        </p>
        <div className='flex flex-wrap gap-4 text-sm font-semibold text-cyan-800'>
          <Link href={generateLocalizedPath('/developer/listing?intent=claim', locale)}>
            {chinese ? '认领并提供具体产品资料' : 'Claim and clarify the product'}
          </Link>
          <Link href={generateLocalizedPath('/explore', locale)}>{chinese ? '继续查找工具' : 'Explore tools'}</Link>
          <Link href={generateLocalizedPath(buildLoginHref(`/ai/${slug}`, locale), locale)}>
            {chinese ? '登录' : 'Log in'}
          </Link>
        </div>
      </div>
    </div>
  );
}
