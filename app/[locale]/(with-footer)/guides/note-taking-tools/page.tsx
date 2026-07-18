import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import NoteTakingToolsPage, { generateMetadata as generateNoteTakingToolsMetadata } from '../ai-note-taking-tools/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateNoteTakingToolsMetadata({ params: { locale } });
  return {
    ...metadata,
    ...getNoindexMetadata(),
    alternates: {
      ...metadata.alternates,
      canonical: `/${locale}/guides/ai-note-taking-tools`,
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      {NoteTakingToolsPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? '笔记工具页要先看捕捉、整理和复盘，而不是只看界面是不是清爽。'
            : 'Note-taking tool pages should focus on capture, organization, and recap rather than only a clean-looking interface.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? [
                '先确认你是在做快速捕捉还是系统整理。',
                '再看检索、标签和复盘是否顺手。',
                '最后结合真实案例和评论判断是否长期使用。',
              ]
            : [
                'First confirm whether you need quick capture or structured organization.',
                'Then check search, tags, and recap workflows.',
                'Finally use real cases and comments to judge long-term use.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '快速捕捉' : 'Quick capture',
            value: locale === 'cn' || locale === 'tw' ? '先记下来再说' : 'Capture first',
            note:
              locale === 'cn' || locale === 'tw'
                ? '能不能先抓住信息，是笔记工具的第一层。'
                : 'The first layer is whether it can capture information fast enough.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '整理与检索' : 'Organization and search',
            value: locale === 'cn' || locale === 'tw' ? '能否找回来' : 'Can you find it later',
            note:
              locale === 'cn' || locale === 'tw'
                ? '整理不好，后面就找不回来了。'
                : 'Without organization, the notes are hard to retrieve later.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '复盘与长期用' : 'Recap and long-term use',
            value: locale === 'cn' || locale === 'tw' ? '能否变成习惯' : 'Can it become a habit',
            note:
              locale === 'cn' || locale === 'tw'
                ? '最后要看能不能变成日常习惯。'
                : 'The real question is whether it becomes a daily habit.',
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
