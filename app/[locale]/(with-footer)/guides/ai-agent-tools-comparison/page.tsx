import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import AgentToolsComparisonPage, {
  generateMetadata as generateAgentToolsComparisonMetadata,
} from '../ai-tools-for-agents-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateAgentToolsComparisonMetadata({ params: { locale } });
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
      />
      <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '最近验证' : 'Last checked'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-13</p>
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
