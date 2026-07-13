import { getNoindexMetadata } from '@/lib/seo/indexing';
import { getAllCategories } from '@/lib/services/categories';

import ResearchToolsPage, { generateMetadata as generateResearchToolsMetadata } from '../ai-tools-for-research/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...getNoindexMetadata(),
    ...generateResearchToolsMetadata({ params: { locale } }),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const categories = await getAllCategories(true).catch(() => []);
  return (
    <>
      {ResearchToolsPage({ params: { locale } })}

      <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '最近验证' : 'Last checked'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-14</p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? `这页已按当前比较页的判断标准重新核对，当前可参考分类信号 ${categories.length} 个。`
              : `This page has been rechecked against the current comparison-page decision flow, with ${categories.length} category signals available.`}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw' ? '保留索引，补真实证据' : 'Keep it indexable and add real evidence'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '用评论、案例和 owner 认领把它和泛工具页区分开。'
              : 'Use comments, cases, and owner claims to distinguish it from generic tool pages.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {locale === 'cn' || locale === 'tw'
              ? '补真实用例、来源说明、最近验证'
              : 'Add real use cases, source notes, and recent verification'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {locale === 'cn' || locale === 'tw'
              ? '后续优先补案例、反馈和认领信息。'
              : 'Next, prioritize cases, feedback, and claim information.'}
          </p>
        </div>
      </section>
    </>
  );
}
