import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import VoiceToolsPage, { generateMetadata as generateVoiceToolsMetadata } from '../ai-tools-for-voice/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateVoiceToolsMetadata({ params: { locale } });
  return {
    ...metadata,
    ...getNoindexMetadata(),
    alternates: {
      ...metadata.alternates,
      canonical: `/${locale}/guides/ai-tools-for-voice`,
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      {VoiceToolsPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? '语音工具页要先看识别、生成和真实场景，不要只看声音像不像人。'
            : 'Voice tool pages should focus on recognition, generation, and real scenarios instead of only how human the voice sounds.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? ['先确认你要识别还是生成。', '再看稳定性、延迟和可控性。', '最后回到真实案例和反馈判断是否长期用。']
            : [
                'First confirm whether you need recognition or generation.',
                'Then check stability, latency, and control.',
                'Finally review real cases and feedback for long-term use.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '识别能力' : 'Recognition',
            value: locale === 'cn' || locale === 'tw' ? '先看准确率' : 'Start with accuracy',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果识别不稳，后面流程都会受影响。'
                : 'If recognition is unstable, everything downstream suffers.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '生成与控制' : 'Generation and control',
            value: locale === 'cn' || locale === 'tw' ? '能否按需调整' : 'Can it be controlled on demand',
            note:
              locale === 'cn' || locale === 'tw'
                ? '语音生成是否可控，决定它能不能进生产。'
                : 'How controllable it is decides whether it can go into production.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '真实场景' : 'Real scenarios',
            value: locale === 'cn' || locale === 'tw' ? '看落地案例' : 'Look at deployment cases',
            note:
              locale === 'cn' || locale === 'tw'
                ? '最后还是要看在真实工作流里的表现。'
                : 'Ultimately, real workflow performance matters most.',
          },
        ]}
      />

      <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '最近验证' : 'Last checked'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-15</p>
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
