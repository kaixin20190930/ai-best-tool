import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import { getAllCategories } from '@/lib/services/categories';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import MarketingToolsPage, { generateMetadata as generateMarketingToolsMetadata } from '../ai-tools-for-marketing/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateMarketingToolsMetadata({ params: { locale } });
  return {
    ...metadata,
    ...getNoindexMetadata(),
    alternates: {
      ...metadata.alternates,
      canonical: `/${locale}/guides/ai-tools-for-marketing`,
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const categories = await getAllCategories(true).catch(() => []);
  return (
    <>
      {MarketingToolsPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? `营销工具页要先看内容生成、自动化和流程协同，而不是只看分类信号 ${categories.length} 个。`
            : `Marketing tool pages should focus on content generation, automation, and workflow coordination instead of only ${categories.length} category signals.`
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? [
                '先确认你要的是内容生成还是营销系统。',
                '再看自动化、受众和团队协作是否真的需要。',
                '最后结合真实案例和反馈判断是否保留索引。',
              ]
            : [
                'First confirm whether you need content generation or a marketing system.',
                'Then check automation, audience handling, and collaboration.',
                'Finally use real cases and feedback to decide whether to keep it indexed.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '内容生成' : 'Content generation',
            value: locale === 'cn' || locale === 'tw' ? '轻量起稿' : 'Light drafting',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果你只是起稿，别把系统层看太重。'
                : 'If you only need drafting, do not over-weight system features.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '自动化与受众' : 'Automation and audience',
            value: locale === 'cn' || locale === 'tw' ? '分群和触发' : 'Segmentation and triggers',
            note:
              locale === 'cn' || locale === 'tw'
                ? '持续触达时，这层最关键。'
                : 'This layer matters most for ongoing outreach.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '团队协作' : 'Team collaboration',
            value: locale === 'cn' || locale === 'tw' ? '是否能共用流程' : 'Can workflows be shared',
            note:
              locale === 'cn' || locale === 'tw'
                ? '团队协作和流程复用决定能不能长期留下。'
                : 'Collaboration and workflow reuse decide whether it sticks.',
          },
        ]}
      />

      <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '最近验证' : 'Last checked'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-18</p>
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
