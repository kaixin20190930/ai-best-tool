import { getNoindexMetadata } from '@/lib/seo/indexing';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import AgentToolsPage, { generateMetadata as generateAgentToolsMetadata } from '../ai-tools-for-agents/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...generateAgentToolsMetadata({ params: { locale } }),
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      {AgentToolsPage({ params: { locale } })}

      <GuideEvidencePanel
        locale={locale}
        checkedAt='2026-07-18'
        scope={
          locale === 'cn' || locale === 'tw'
            ? 'Agent 工具页的意图已经从“看热闹”收束到“找能执行多步骤任务的工具”。'
            : 'This agent-tools page now focuses on tools that can actually execute multi-step tasks.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? ['先看是否支持真实工作流', '再看是否能接入现有工具链', '最后看是否有团队协作和复盘能力']
            : [
                'Check whether it supports real workflows first',
                'Then verify it fits your existing toolchain',
                'Finally review collaboration and follow-up support',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '工作流执行' : 'Workflow execution',
            value: locale === 'cn' || locale === 'tw' ? '多步骤任务优先' : 'Multi-step tasks first',
            note:
              locale === 'cn' || locale === 'tw'
                ? '能不能真的把“拆解、调用、跟进”串起来，是这页最重要的判断。'
                : 'Whether the tool can actually chain planning, actions, and follow-up is the key check here.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '工具链衔接' : 'Toolchain fit',
            value: locale === 'cn' || locale === 'tw' ? '接入现有系统' : 'Fits existing systems',
            note:
              locale === 'cn' || locale === 'tw'
                ? '更看重是否能顺手接到你现在的 API、数据库和自动化步骤里。'
                : 'We care more about how easily it plugs into your current APIs, databases, and automations.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '团队落地' : 'Team adoption',
            value: locale === 'cn' || locale === 'tw' ? '可复盘可协作' : 'Reviewable and collaborative',
            note:
              locale === 'cn' || locale === 'tw'
                ? '只有能被团队复盘和接力，才算适合长期使用。'
                : 'A tool only works long term if the team can review and hand it off cleanly.',
          },
        ]}
        signalCards={[
          {
            label: locale === 'cn' || locale === 'tw' ? '自动化深度' : 'Automation depth',
            value:
              locale === 'cn' || locale === 'tw' ? '先看能否串起完整链路' : 'Check whether it connects the full chain',
            note:
              locale === 'cn' || locale === 'tw'
                ? '真正有价值的 agent 工具，应该能把计划、执行、回传结果串成闭环。'
                : 'A useful agent tool should connect planning, execution, and result handoff into one loop.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '集成信号' : 'Integration signal',
            value: locale === 'cn' || locale === 'tw' ? '优先接现有系统' : 'Fit existing systems first',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果接入 API、数据库、消息和任务系统很别扭，落地成本会迅速上升。'
                : 'If API, database, message, and task integrations are awkward, the real rollout cost rises fast.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '协作信号' : 'Collaboration signal',
            value: locale === 'cn' || locale === 'tw' ? '可复盘可交接' : 'Reviewable and handoff-ready',
            note:
              locale === 'cn' || locale === 'tw'
                ? '能不能给团队看懂、接手、复盘，比单次演示更重要。'
                : 'Whether the team can understand, take over, and review it matters more than a one-off demo.',
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
