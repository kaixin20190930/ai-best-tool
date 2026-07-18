import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import VideoToolsPage, { generateMetadata as generateVideoToolsMetadata } from '../ai-video-tools/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateVideoToolsMetadata({ params: { locale } });
  return {
    ...metadata,
    ...getNoindexMetadata(),
    alternates: {
      ...metadata.alternates,
      canonical: `/${locale}/guides/ai-video-tools`,
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      {VideoToolsPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? '视频工具页要先看生成、剪辑和真实发布流程，不要只看演示视频。'
            : 'Video tool pages should focus on generation, editing, and real publishing workflows instead of demo videos.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? [
                '先确认你要生成、剪辑还是做发布流程。',
                '再看节奏控制、可编辑性和迭代成本。',
                '最后回到真实项目和反馈，判断是否长期使用。',
              ]
            : [
                'First confirm whether you need generation, editing, or publishing workflows.',
                'Then check pacing control, editability, and iteration cost.',
                'Finally review real projects and feedback before long-term use.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '生成与剪辑' : 'Generation and editing',
            value: locale === 'cn' || locale === 'tw' ? '先看首轮可用性' : 'Check first-pass usability',
            note:
              locale === 'cn' || locale === 'tw'
                ? '视频工具最先要看能不能产出可用初稿。'
                : 'The first question is whether it can produce a usable draft.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '节奏与可控性' : 'Pacing and control',
            value: locale === 'cn' || locale === 'tw' ? '能否持续调整' : 'Can it be tuned repeatedly',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果节奏和细节控制不好，长期工作流会受影响。'
                : 'If pacing and detail control are weak, the workflow suffers.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '真实发布' : 'Real publishing',
            value: locale === 'cn' || locale === 'tw' ? '看能否进生产' : 'Can it ship to production',
            note:
              locale === 'cn' || locale === 'tw'
                ? '最后要看是否真的能进入项目交付。'
                : 'The real question is whether it can make it into production deliverables.',
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
