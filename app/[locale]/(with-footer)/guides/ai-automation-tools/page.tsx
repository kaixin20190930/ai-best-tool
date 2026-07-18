import { getNoindexMetadata } from '@/lib/seo/indexing';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import AutomationToolsPage, {
  generateMetadata as generateAutomationToolsMetadata,
} from '../ai-tools-for-automation/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...generateAutomationToolsMetadata({ params: { locale } }),
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      {AutomationToolsPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? '自动化工具页要先看流程编排、触发和真实交接，而不是只看自动化数量。'
            : 'Automation tool pages should focus on workflow orchestration, triggers, and real handoffs instead of the number of automations.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? [
                '先确认你要的是单点自动化还是流程编排。',
                '再看触发、条件分支和交接是否稳定。',
                '最后结合真实流程案例判断是否长期保留。',
              ]
            : [
                'First confirm whether you need a single automation or workflow orchestration.',
                'Then check triggers, branching, and handoffs for stability.',
                'Finally use real workflow cases to decide whether to keep it.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '流程编排' : 'Workflow orchestration',
            value: locale === 'cn' || locale === 'tw' ? '多步骤能否连起来' : 'Can multi-step flows connect',
            note:
              locale === 'cn' || locale === 'tw'
                ? '真正的价值在于把动作串成流程。'
                : 'The real value is chaining actions into a workflow.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '触发与条件' : 'Triggers and conditions',
            value: locale === 'cn' || locale === 'tw' ? '逻辑是否稳定' : 'Is the logic stable',
            note:
              locale === 'cn' || locale === 'tw'
                ? '复杂自动化的稳定性靠触发和条件。'
                : 'Complex automation stability depends on triggers and conditions.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '真实交接' : 'Real handoffs',
            value: locale === 'cn' || locale === 'tw' ? '能不能在团队落地' : 'Can it land in a team',
            note:
              locale === 'cn' || locale === 'tw'
                ? '最后要看能否在团队里真的跑起来。'
                : 'Ultimately, it has to run in a real team workflow.',
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
