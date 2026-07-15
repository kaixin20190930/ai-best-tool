import { getNoindexMetadata } from '@/lib/seo/indexing';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import SalesComparisonPage, {
  generateMetadata as generateSalesComparisonMetadata,
} from '../ai-tools-for-sales-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...generateSalesComparisonMetadata({ params: { locale } }),
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      {SalesComparisonPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? '销售工具对比要先看线索、跟进和协作，而不是只看生成一句话快不快。'
            : 'Sales tool comparisons should focus on leads, follow-up, and collaboration instead of only how quickly something can be generated.'
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
            label: locale === 'cn' || locale === 'tw' ? '线索信号' : 'Lead signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '先看能否追踪机会和阶段'
                : 'Check whether opportunities and stages are trackable',
            note:
              locale === 'cn' || locale === 'tw'
                ? '销售工具首先要让线索看得住。'
                : 'Sales tools first need to keep leads visible.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '跟进信号' : 'Follow-up signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '看节奏和提醒是否顺手'
                : 'See whether cadence and reminders feel smooth',
            note:
              locale === 'cn' || locale === 'tw'
                ? '持续跟进是销售工具真正的价值点。'
                : 'Persistent follow-up is where sales tools matter most.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '协作信号' : 'Collaboration signal',
            value:
              locale === 'cn' || locale === 'tw' ? '看多人一起跑销售是否方便' : 'Check whether team selling is easy',
            note:
              locale === 'cn' || locale === 'tw'
                ? '共享视图和权限决定能不能长期用。'
                : 'Shared views and permissions decide long-term adoption.',
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
