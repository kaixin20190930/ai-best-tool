import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import WritingToolsPage, { generateMetadata as generateWritingToolsMetadata } from '../ai-writing-tools/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateWritingToolsMetadata({ params: { locale } });
  return {
    ...metadata,
    ...getNoindexMetadata(),
    alternates: {
      ...metadata.alternates,
      canonical: `/${locale}/guides/ai-writing-tools`,
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      {WritingToolsPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? '写作工具页要先看起草、改写和内容生产，不要只看文案像不像人写的。'
            : 'Writing tool pages should focus on drafting, rewriting, and content production rather than whether the copy merely sounds human.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? [
                '先确认你要的是起草还是改写。',
                '再看风格控制、批量输出和编辑是否顺手。',
                '最后结合真实案例和反馈判断是否长期使用。',
              ]
            : [
                'First confirm whether you need drafting or rewriting.',
                'Then check style control, bulk output, and editing workflow.',
                'Finally use real cases and feedback to judge long-term use.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '起草与改写' : 'Drafting and rewriting',
            value: locale === 'cn' || locale === 'tw' ? '先看第一版速度' : 'Check first-draft speed',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果首稿就不顺，后面也很难轻松。'
                : 'If the first draft is not smooth, the rest rarely feels easy.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '风格控制' : 'Style control',
            value: locale === 'cn' || locale === 'tw' ? '能否稳定符合语气' : 'Can it hold the tone',
            note:
              locale === 'cn' || locale === 'tw'
                ? '品牌和风格一致性非常关键。'
                : 'Brand and voice consistency matter a lot.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '内容生产' : 'Content production',
            value: locale === 'cn' || locale === 'tw' ? '能否批量出稿' : 'Can it produce at scale',
            note:
              locale === 'cn' || locale === 'tw'
                ? '最终要看它能不能支撑日常产出。'
                : 'Ultimately, it has to support day-to-day production.',
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
              ? '这页已按当前比较页的判断标准重新核对。'
              : 'This page has been rechecked against the current comparison-page decision flow.'}
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
            {locale === 'cn' || locale === 'tw' ? '补真实用例和反馈' : 'Add real use cases and feedback'}
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
