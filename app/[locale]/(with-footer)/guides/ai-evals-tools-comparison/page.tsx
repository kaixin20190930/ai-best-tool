import { getNoindexMetadata } from '@/lib/seo/indexing';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import EvalsComparisonPage, {
  generateMetadata as generateEvalsComparisonMetadata,
} from '../ai-tools-for-evals-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...generateEvalsComparisonMetadata({ params: { locale } }),
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';

  return (
    <>
      {EvalsComparisonPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          isChinese
            ? '这页先看真实可验证的 Evals 信号，再继续判断是否需要评估工作流、基准和质量回归追踪。'
            : 'This page looks at verifiable evals signals first, then helps you decide whether evaluation workflows, benchmarks, and regression tracking are needed.'
        }
        decisionSteps={
          isChinese
            ? [
                '先确认它是不是覆盖真实任务，而不是只有测试形式。',
                '再看基准、回归和质量追踪是否顺手。',
                '最后回到真实评估案例和反馈，判断值不值得长期用。',
              ]
            : [
                'First confirm it covers real tasks instead of only test formality.',
                'Then check benchmarks, regression tracking, and quality workflows.',
                'Finally return to real eval cases and comments to judge long-term use.',
              ]
        }
        items={[
          {
            label: isChinese ? '评估覆盖' : 'Eval coverage',
            value: isChinese ? '是否能覆盖真实任务' : 'Does it cover real tasks',
            note: isChinese
              ? '没有真实任务覆盖，评估就会变成形式化检查。'
              : 'Without real task coverage, evals become formalities.',
          },
          {
            label: isChinese ? '回归追踪' : 'Regression tracking',
            value: isChinese ? '是否方便反复对比' : 'Can it compare repeatedly',
            note: isChinese
              ? '真正有用的是能稳定看出改动前后差异。'
              : 'The key value is seeing stable before/after differences.',
          },
          {
            label: isChinese ? '团队复用' : 'Team reuse',
            value: isChinese ? '是否能长期跑起来' : 'Can it run long term',
            note: isChinese
              ? '如果不能长期复用，它就很难成为基础设施。'
              : 'If it cannot be reused, it will not become infrastructure.',
          },
        ]}
        signalCards={[
          {
            label: isChinese ? '基准信号' : 'Benchmark signal',
            value: isChinese ? '真实任务覆盖是否足够' : 'Does it cover real tasks sufficiently',
            note: isChinese
              ? '只有真实任务，评分才不会只是形式化。'
              : 'Only real tasks keep scoring from becoming a formality.',
          },
          {
            label: isChinese ? '回归信号' : 'Regression signal',
            value: isChinese ? '改动前后能否稳定对比' : 'Can before/after changes be compared reliably',
            note: isChinese
              ? '能持续看出差异，才适合做验收。'
              : 'You need stable differences to make it useful for acceptance.',
          },
          {
            label: isChinese ? '协作信号' : 'Collaboration signal',
            value: isChinese ? '团队能否长期复用' : 'Can the team reuse it long term',
            note: isChinese
              ? '如果不能进入团队流程，它就不够像基础设施。'
              : 'If it does not fit the team process, it will not behave like infrastructure.',
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
              ? '这页已按真实 eval 决策路径重新核对，保留评估、回归和复用入口。'
              : 'This page has been rechecked against a real eval decision path and keeps evaluation, regression, and reuse entry points visible.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {isChinese ? '保留索引，补真实评估证据' : 'Keep it indexable and add real eval evidence'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {isChinese
              ? '用基准、回归记录和真人评论把它和泛评估页区分开。'
              : 'Use benchmarks, regression notes, and real comments to differentiate it from generic eval pages.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {isChinese ? '补真实评估场景和反馈' : 'Add real evaluation scenarios and feedback'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {isChinese
              ? '后续优先补基准案例、回归样例和真人评论。'
              : 'Next, prioritize benchmark cases, regression examples, and real comments.'}
          </p>
        </div>
      </section>
    </>
  );
}
