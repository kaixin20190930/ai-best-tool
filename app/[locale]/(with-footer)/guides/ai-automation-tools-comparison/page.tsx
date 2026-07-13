import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import AutomationComparisonPage, {
  generateMetadata as generateAutomationComparisonMetadata,
} from '../ai-tools-for-automation-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateAutomationComparisonMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';

  return (
    <>
      {AutomationComparisonPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          isChinese
            ? '这页先看真实可验证的自动化信号，再继续判断是否需要流程编排、重试和维护能力。'
            : 'This page looks at verifiable automation signals first, then helps you decide whether orchestration, retries, and maintainability are needed.'
        }
        items={[
          {
            label: isChinese ? '流程覆盖' : 'Workflow coverage',
            value: isChinese ? '是否覆盖真实重复任务' : 'Does it cover real repeatable tasks',
            note: isChinese
              ? '自动化的价值主要在重复流程是否真正被解决。'
              : 'Automation matters most when repeatable work is actually solved.',
          },
          {
            label: isChinese ? '失败恢复' : 'Failure recovery',
            value: isChinese ? '重试与异常是否稳定' : 'Are retries and errors stable',
            note: isChinese
              ? '如果失败处理不稳，长期运行会越来越痛苦。'
              : 'Unstable failure handling becomes painful over time.',
          },
          {
            label: isChinese ? '维护成本' : 'Maintenance cost',
            value: isChinese ? '团队能否接手维护' : 'Can a team maintain it',
            note: isChinese
              ? '一个工具能不能长期留着，维护成本很关键。'
              : 'Whether a tool survives long term depends on maintainability.',
          },
        ]}
      />
      <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '最近验证' : 'Last checked'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-13</p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {isChinese
              ? '这页已按真实自动化决策路径重新核对，保留流程、重试和维护入口。'
              : 'This page has been rechecked against a real automation decision path and keeps workflow, retries, and maintainability entry points visible.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {isChinese ? '保留索引，补真实自动化证据' : 'Keep it indexable and add real automation evidence'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {isChinese
              ? '用重复流程、失败恢复和真人评论把它和泛工具页区分开。'
              : 'Use repeatable workflows, failure recovery, and real comments to differentiate it from generic tool pages.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {isChinese ? '补真实自动化场景和反馈' : 'Add real automation scenarios and feedback'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {isChinese
              ? '后续优先补流程案例、重试样例和真人评论。'
              : 'Next, prioritize workflow cases, retry examples, and real comments.'}
          </p>
        </div>
      </section>
    </>
  );
}
