import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import CodeReviewComparisonPage, {
  generateMetadata as generateCodeReviewComparisonMetadata,
} from '../ai-tools-for-code-review-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateCodeReviewComparisonMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';

  return (
    <>
      {CodeReviewComparisonPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          isChinese
            ? '这页先看真实可验证的 code review 信号，再继续判断是否需要审查、质量门禁和团队工作流。'
            : 'This page looks at verifiable code review signals first, then helps you decide whether review, quality gates, and team workflow support are needed.'
        }
        items={[
          {
            label: isChinese ? '审查深度' : 'Review depth',
            value: isChinese ? '是否能看出真实问题' : 'Can it surface real issues',
            note: isChinese
              ? '代码审查不只是找风格问题，更要看是否抓得住风险。'
              : 'Code review is about more than style; it must catch real risk.',
          },
          {
            label: isChinese ? '工作流适配' : 'Workflow fit',
            value: isChinese ? '团队流程是否顺手' : 'Does it fit team flow',
            note: isChinese
              ? '如果不能融入 PR 流程，再聪明的功能也会闲置。'
              : 'If it does not fit the PR flow, even smart features go unused.',
          },
          {
            label: isChinese ? '长期门禁' : 'Long-term gating',
            value: isChinese ? '是否能做质量门槛' : 'Can it act as a quality gate',
            note: isChinese
              ? '真正能留下来的工具，往往是团队长期愿意依赖的门槛。'
              : 'The tools that stick become the quality gate teams rely on.',
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
              ? '这页已按真实 code review 决策路径重新核对，保留审查、工作流和门禁入口。'
              : 'This page has been rechecked against a real code review decision path and keeps review, workflow, and gate entry points visible.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {isChinese ? '保留索引，补真实审查证据' : 'Keep it indexable and add real review evidence'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {isChinese
              ? '用 PR 记录、风险判断和真人评论把它和泛开发页区分开。'
              : 'Use PR records, risk judgment, and real comments to differentiate it from generic dev pages.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {isChinese ? '补真实审查场景和反馈' : 'Add real review scenarios and feedback'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {isChinese
              ? '后续优先补审查案例、质量门禁样例和真人评论。'
              : 'Next, prioritize review cases, quality gate examples, and real comments.'}
          </p>
        </div>
      </section>
    </>
  );
}
