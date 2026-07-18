import { getNoindexMetadata } from '@/lib/seo/indexing';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import AgentToolsComparisonPage, {
  generateMetadata as generateAgentToolsComparisonMetadata,
} from '../ai-tools-for-agents-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...generateAgentToolsComparisonMetadata({ params: { locale } }),
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';

  return (
    <>
      {AgentToolsComparisonPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          isChinese
            ? '这页先看真实可验证的 Agent 信号，再继续判断是否真的要走编排、执行和治理层。'
            : 'This page looks at verifiable agent signals first, then helps you decide whether orchestration, execution, and governance are truly needed.'
        }
        decisionSteps={
          isChinese
            ? [
                '先判断你要的是单步回答，还是多步骤执行的 Agent。',
                '如果目标已经明确，先去更窄的 Agent 榜单或对比页收缩 shortlist。',
                '如果还要和团队确认生产落地，再回到这里看状态、治理和真实案例。',
              ]
            : [
                'First decide whether you need a single-step answer tool or a multi-step execution agent.',
                'If the goal is already clear, move to a narrower agent ranking or comparison page to shrink the shortlist.',
                'If you still need team validation for production, come back here for state, governance, and real cases.',
              ]
        }
        items={[
          {
            label: isChinese ? '编排' : 'Orchestration',
            value: isChinese ? '多步骤和工具调用' : 'Multi-step and tool use',
            note: isChinese
              ? '真正的 Agent 不是单轮回答，而是能跑完整流程。'
              : 'A real agent runs a full flow, not just a single answer.',
          },
          {
            label: isChinese ? '状态' : 'State',
            value: isChinese ? '能否保留上下文' : 'Can it retain context',
            note: isChinese
              ? '没有状态管理，Agent 很快就会失去价值。'
              : 'Without state management, agent value drops fast.',
          },
          {
            label: isChinese ? '治理' : 'Governance',
            value: isChinese ? '日志、审计、人工接管' : 'Logs, audits, human override',
            note: isChinese
              ? '进入生产后，这些比 demo 观感更重要。'
              : 'In production, these matter more than demo feel.',
          },
        ]}
        signalCards={[
          {
            label: isChinese ? '编排信号' : 'Orchestration signal',
            value: isChinese ? '能否跑完整流程' : 'Can it run a full flow',
            note: isChinese
              ? '真正的 Agent 不是只回答问题，而是能把多步流程走完。'
              : 'A real agent is not just an answer box; it completes multi-step workflows.',
          },
          {
            label: isChinese ? '状态信号' : 'State signal',
            value: isChinese ? '上下文是否能保留' : 'Can context be retained',
            note: isChinese
              ? '没有状态，Agent 很快就会退化成单次调用。'
              : 'Without state, the agent quickly degrades into a one-off call.',
          },
          {
            label: isChinese ? '治理信号' : 'Governance signal',
            value: isChinese ? '日志、审计和接管' : 'Logs, audits, and override',
            note: isChinese
              ? '进入生产后，这些比 demo 观感更关键。'
              : 'In production, these matter more than demo polish.',
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
