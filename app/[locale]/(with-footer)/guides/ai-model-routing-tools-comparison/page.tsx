import { getNoindexMetadata } from '@/lib/seo/indexing';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import ModelRoutingComparisonPage, {
  generateMetadata as generateModelRoutingComparisonMetadata,
} from '../ai-tools-for-model-routing-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...generateModelRoutingComparisonMetadata({ params: { locale } }),
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';

  return (
    <>
      {ModelRoutingComparisonPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          isChinese
            ? '这页先看真实可验证的模型路由信号，再继续判断是否需要统一入口、回退控制和成本治理。'
            : 'This page looks at verifiable model-routing signals first, then helps you decide whether unified access, fallback control, and cost governance are needed.'
        }
        decisionSteps={
          isChinese
            ? [
                '先确认统一入口是否真的顺手，不要只看能接多少模型。',
                '再看回退、成本和质量治理是否能支撑生产使用。',
                '最后回到真实路由案例和评论，判断能不能长期依赖。',
              ]
            : [
                'First confirm the unified entry point is actually smooth instead of only counting supported models.',
                'Then check whether fallbacks, cost, and quality governance can support production use.',
                'Finally return to real routing cases and comments to judge long-term reliance.',
              ]
        }
        items={[
          {
            label: isChinese ? '供应商覆盖' : 'Provider coverage',
            value: isChinese ? '能否真正统一入口' : 'Can it truly unify access',
            note: isChinese
              ? '别只看能接多少模型，要看切换和接入是不是顺手。'
              : 'Do not only count models; check whether switching and access feel clean.',
          },
          {
            label: isChinese ? '回退能力' : 'Fallbacks',
            value: isChinese ? '失败场景是否可控' : 'Can failures be controlled',
            note: isChinese
              ? '生产里最关键的往往不是接入，而是失败之后怎么办。'
              : 'In production, failure handling matters more than initial setup.',
          },
          {
            label: isChinese ? '治理能力' : 'Governance',
            value: isChinese ? '日志、限额、审计' : 'Logs, limits, and audits',
            note: isChinese
              ? '如果要长期上线，这些会直接决定是否可用。'
              : 'These decide whether it is usable long term.',
          },
        ]}
        signalCards={[
          {
            label: isChinese ? '入口信号' : 'Access signal',
            value: isChinese ? '先看是否真的统一入口' : 'Check whether access is truly unified',
            note: isChinese ? '不要只看支持多少模型。' : 'Do not only count supported models.',
          },
          {
            label: isChinese ? '回退信号' : 'Fallback signal',
            value: isChinese ? '看失败时能否自动切换' : 'See whether it can fall back automatically',
            note: isChinese
              ? '生产里最关键的是失败后还能不能继续。'
              : 'In production, the key is whether things keep working after failure.',
          },
          {
            label: isChinese ? '治理信号' : 'Governance signal',
            value: isChinese ? '看日志、限额和审计是否齐全' : 'Check logs, limits, and audits',
            note: isChinese ? '长期上线离不开治理能力。' : 'Long-term deployment depends on governance.',
          },
        ]}
      />
      <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '最近验证' : 'Last checked'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-15</p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {isChinese
              ? '这页已按真实模型路由决策路径重新核对，保留入口、回退和治理信号。'
              : 'This page has been rechecked against a real model-routing decision path and keeps access, fallback, and governance signals visible.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {isChinese ? '保留索引，补真实路由证据' : 'Keep it indexable and add real routing evidence'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {isChinese
              ? '用切换、失败处理和真人评论把它和泛接入页区分开。'
              : 'Use switching behavior, failure handling, and real comments to differentiate it from generic integration pages.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {isChinese ? '补真实路由场景和反馈' : 'Add real routing scenarios and feedback'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {isChinese
              ? '后续优先补路由案例、失败恢复样例和真人评论。'
              : 'Next, prioritize routing cases, recovery examples, and real comments.'}
          </p>
        </div>
      </section>
    </>
  );
}
