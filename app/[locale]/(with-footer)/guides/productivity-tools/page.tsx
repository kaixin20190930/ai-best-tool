import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import ProductivityToolsPage, {
  generateMetadata as generateProductivityToolsMetadata,
} from '../ai-productivity-tools/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateProductivityToolsMetadata({ params: { locale } });
  return {
    ...metadata,
    ...getNoindexMetadata(),
    alternates: {
      ...metadata.alternates,
      canonical: `/${locale}/guides/ai-productivity-tools`,
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      {ProductivityToolsPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? '生产力工具页要先看任务、记录和复用，不要只看界面是否清爽。'
            : 'Productivity tool pages should focus on tasks, capture, and reusability rather than just a clean interface.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? [
                '先确认你是在做任务管理、记录还是复用。',
                '再看搜索、协作和习惯养成是否顺手。',
                '最后结合真实案例和反馈判断是否长期使用。',
              ]
            : [
                'First confirm whether you need task management, capture, or reuse.',
                'Then check search, collaboration, and habit fit.',
                'Finally use real cases and feedback to judge long-term use.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '任务与记录' : 'Tasks and capture',
            value: locale === 'cn' || locale === 'tw' ? '能不能先记住再整理' : 'Capture first, organize later',
            note:
              locale === 'cn' || locale === 'tw'
                ? '生产力工具先要抓住信息和动作。'
                : 'Productivity tools need to capture information and actions first.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '搜索与复用' : 'Search and reuse',
            value: locale === 'cn' || locale === 'tw' ? '以后能不能找回来' : 'Can you find it again later',
            note:
              locale === 'cn' || locale === 'tw'
                ? '找不回来，就很难长期用。'
                : 'If you cannot find it later, long-term use breaks down.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '习惯养成' : 'Habit fit',
            value: locale === 'cn' || locale === 'tw' ? '能不能融入日常' : 'Fits daily routine',
            note:
              locale === 'cn' || locale === 'tw'
                ? '真正能留下来的工具会融进日常节奏。'
                : 'The tools that stick are the ones that fit daily cadence.',
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
