import { getNoindexMetadata } from '@/lib/seo/indexing';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import EvalsPage, { generateMetadata as generateEvalsMetadata } from '../ai-tools-for-evals/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...generateEvalsMetadata({ params: { locale } }),
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      {EvalsPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? 'Evals 工具页要先看基准、对比、复盘和团队使用，而不是只看评测分数。'
            : 'Evals tool pages should focus on benchmarks, comparisons, recaps, and team usage rather than only raw scores.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? [
                '先确认你要的是基准测试还是日常评测。',
                '再看复盘、对比和报告是否顺手。',
                '最后结合真实案例和评论判断是否保留索引。',
              ]
            : [
                'First confirm whether you need benchmarks or day-to-day evaluations.',
                'Then check recap, comparison, and reporting workflows.',
                'Finally use real cases and comments to decide whether to keep it indexed.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '基准测试' : 'Benchmarks',
            value: locale === 'cn' || locale === 'tw' ? '看稳定性和对比性' : 'Check stability and comparability',
            note:
              locale === 'cn' || locale === 'tw'
                ? '评测页如果没有基准，就很难长期被信任。'
                : 'Without a benchmark, an eval page is hard to trust long term.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '复盘与报告' : 'Recap and reporting',
            value: locale === 'cn' || locale === 'tw' ? '把结果转成结论' : 'Turn results into conclusions',
            note:
              locale === 'cn' || locale === 'tw'
                ? '真正有用的是能把结果变成可行动的结论。'
                : 'The useful part is turning results into actionable conclusions.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '团队评测' : 'Team evaluation',
            value: locale === 'cn' || locale === 'tw' ? '多人协作的工作流' : 'Multi-person workflow',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果团队要一起做评测，协作和版本记录会更重要。'
                : 'If a team evaluates together, collaboration and versioning matter more.',
          },
        ]}
        signalCards={[
          {
            label: locale === 'cn' || locale === 'tw' ? '稳定性信号' : 'Stability signal',
            value:
              locale === 'cn' || locale === 'tw' ? '看基准是否可复现' : 'Check whether benchmarks are reproducible',
            note:
              locale === 'cn' || locale === 'tw'
                ? '评测如果不能重复，最后很难做成团队共识。'
                : 'If evals cannot be repeated, they rarely become team consensus.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '报告信号' : 'Reporting signal',
            value: locale === 'cn' || locale === 'tw' ? '把结果变成结论' : 'Turn results into conclusions',
            note:
              locale === 'cn' || locale === 'tw'
                ? '输出的不是分数本身，而是能不能直接指导下一步动作。'
                : 'The useful output is not the score itself but the next action it suggests.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '协作信号' : 'Collaboration signal',
            value: locale === 'cn' || locale === 'tw' ? '多人评测要顺手' : 'Team evals should be easy',
            note:
              locale === 'cn' || locale === 'tw'
                ? '团队一起评测时，版本记录和评论会比单次结果更重要。'
                : 'For team evals, version history and comments matter more than one-off output.',
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
