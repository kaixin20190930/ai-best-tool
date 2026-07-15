import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import AgentToolsPage, { generateMetadata as generateAgentToolsMetadata } from '../ai-tools-for-agents/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateAgentToolsMetadata({ params: { locale } });
  return {
    ...metadata,
    ...getNoindexMetadata(),
    alternates: {
      ...metadata.alternates,
      canonical: `/${locale}/guides/ai-tools-for-agents`,
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      {AgentToolsPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? 'Agent 工具页要先看自动执行、协作和落地性，而不是只看“agent”这个标签。'
            : 'Agent tool pages should focus on automation, collaboration, and deliverability instead of just the word "agent".'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? [
                '先确认你要的是自动执行还是协作入口。',
                '再看上下文、任务分发和落地流程是否顺手。',
                '最后用真实案例和评论判断是否长期使用。',
              ]
            : [
                'First confirm whether you need automation or a collaboration entry point.',
                'Then check context, task routing, and delivery flow.',
                'Finally use real cases and comments to judge long-term use.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '自动执行' : 'Automation',
            value: locale === 'cn' || locale === 'tw' ? '能否真正代办' : 'Can it actually do work',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果只是包装概念，没有落地动作就没意义。'
                : 'If it is just a concept wrapper without actions, it is not useful.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '协作与上下文' : 'Collaboration and context',
            value: locale === 'cn' || locale === 'tw' ? '是否能接住任务' : 'Can it carry the task forward',
            note:
              locale === 'cn' || locale === 'tw'
                ? '真正可用的 agent 要能接住上下文和任务。'
                : 'A usable agent needs to carry context and tasks forward.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '真实落地' : 'Real delivery',
            value: locale === 'cn' || locale === 'tw' ? '看案例和反馈' : 'Check cases and feedback',
            note:
              locale === 'cn' || locale === 'tw'
                ? '最后要看它是不是真能在项目里跑起来。'
                : 'Ultimately, it must work in real projects.',
          },
        ]}
        signalCards={[
          {
            label: locale === 'cn' || locale === 'tw' ? '价格信号' : 'Pricing signal',
            value:
              locale === 'cn' || locale === 'tw' ? '先看团队席位和任务量' : 'Check team seats and task volume first',
            note:
              locale === 'cn' || locale === 'tw'
                ? 'Agent 工具常按席位、任务和执行次数计费。'
                : 'Agent tools often charge by seats, tasks, and execution counts.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '更新信号' : 'Freshness signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '看任务路由和执行能力是否更新'
                : 'Check whether task routing and execution keep improving',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果只是换了皮，长期落地价值会很弱。'
                : 'If it is only a new wrapper, long-term value is weak.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '风险信号' : 'Risk signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '没有上下文 / 协作 / 落地就先降级'
                : 'Downgrade it without context, collaboration, or delivery',
            note:
              locale === 'cn' || locale === 'tw'
                ? '这三项缺一项，就很难称得上可用 agent。'
                : 'Without those three, it is hard to call the product a usable agent.',
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
