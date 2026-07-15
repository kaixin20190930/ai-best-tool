import { getNoindexMetadata } from '@/lib/seo/indexing';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import CodeReviewPage, { generateMetadata as generateCodeReviewMetadata } from '../ai-tools-for-code-review/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...generateCodeReviewMetadata({ params: { locale } }),
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      {CodeReviewPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? '代码审查工具页要先看差异理解、上下文和团队协作，而不是只看“自动 review”这个标签。'
            : 'Code review tool pages should focus on diff understanding, context, and team collaboration rather than just the "auto review" label.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? [
                '先确认你要的是自动审查还是辅助审查。',
                '再看差异、上下文和建议质量是否顺手。',
                '最后结合真实 PR 案例和反馈判断是否长期使用。',
              ]
            : [
                'First confirm whether you need automatic review or assisted review.',
                'Then check diff understanding, context, and suggestion quality.',
                'Finally use real PR cases and feedback to judge long-term use.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '差异理解' : 'Diff understanding',
            value: locale === 'cn' || locale === 'tw' ? '能否看懂改动' : 'Can it understand the change',
            note:
              locale === 'cn' || locale === 'tw'
                ? '审查工具首先要看得懂 diff。'
                : 'A review tool must understand the diff first.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '上下文与建议' : 'Context and suggestions',
            value: locale === 'cn' || locale === 'tw' ? '建议是否有用' : 'Are suggestions useful',
            note:
              locale === 'cn' || locale === 'tw'
                ? '有上下文的建议，比泛泛而谈更重要。'
                : 'Context-rich suggestions matter more than vague comments.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '团队协作' : 'Team collaboration',
            value: locale === 'cn' || locale === 'tw' ? '是否适合 PR 流程' : 'Fits the PR workflow',
            note:
              locale === 'cn' || locale === 'tw'
                ? '最后要看它能不能融进团队的 PR 流程。'
                : 'Ultimately, it has to fit the team PR workflow.',
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
