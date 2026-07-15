import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import SalesToolsPage, { generateMetadata as generateSalesToolsMetadata } from '../ai-tools-for-sales/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateSalesToolsMetadata({ params: { locale } });
  return {
    ...metadata,
    ...getNoindexMetadata(),
    alternates: {
      ...metadata.alternates,
      canonical: `/${locale}/guides/ai-tools-for-sales`,
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      {SalesToolsPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? '销售工具页要先看线索、跟进和协作，而不是只看生成一句话快不快。'
            : 'Sales tool pages should focus on leads, follow-up, and collaboration instead of only how quickly something can be generated.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? [
                '先确认你是在做线索管理还是跟进流程。',
                '再看分配、提醒和协作是否顺手。',
                '最后结合真实案例和反馈判断是否长期使用。',
              ]
            : [
                'First confirm whether you need lead management or follow-up workflows.',
                'Then check assignment, reminders, and collaboration.',
                'Finally use real cases and feedback to judge long-term use.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '线索管理' : 'Lead management',
            value: locale === 'cn' || locale === 'tw' ? '追踪机会和阶段' : 'Track opportunities and stages',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果线索都看不住，工具价值会大打折扣。'
                : 'If you cannot keep track of leads, the tool loses value fast.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '跟进流程' : 'Follow-up flow',
            value: locale === 'cn' || locale === 'tw' ? '节奏是否能坚持' : 'Can the cadence be sustained',
            note:
              locale === 'cn' || locale === 'tw'
                ? '销售工具的价值往往在持续跟进里体现。'
                : 'Sales tools often show their value in persistent follow-up.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '团队协作' : 'Team collaboration',
            value: locale === 'cn' || locale === 'tw' ? '多人一起跑销售' : 'Running sales as a team',
            note:
              locale === 'cn' || locale === 'tw'
                ? '多人协作时，权限和共享视图很关键。'
                : 'When multiple people are involved, permissions and shared views matter a lot.',
          },
        ]}
        signalCards={[
          {
            label: locale === 'cn' || locale === 'tw' ? '价格信号' : 'Pricing signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '先看席位和自动化门槛'
                : 'Check seats and automation thresholds first',
            note:
              locale === 'cn' || locale === 'tw'
                ? '销售团队常常先在协作席位和自动化上触顶。'
                : 'Sales teams often hit collaboration seats and automation caps first.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '更新信号' : 'Freshness signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '看提醒、集成和共享视图是否在更新'
                : 'Check whether reminders, integrations, and shared views keep improving',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果流程更新停了，后续跟进就容易散。'
                : 'If workflow updates stall, follow-up discipline usually slips.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '风险信号' : 'Risk signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '没有跟进 / 协作 / 可见性就先降级'
                : 'Downgrade it without follow-up, collaboration, or visibility',
            note:
              locale === 'cn' || locale === 'tw'
                ? '销售工具缺这三项，通常很难真正帮团队推进机会。'
                : 'Without those three, sales tools rarely help teams move opportunities forward.',
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
