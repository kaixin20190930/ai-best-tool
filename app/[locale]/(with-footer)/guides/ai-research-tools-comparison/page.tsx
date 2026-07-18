import { getNoindexMetadata } from '@/lib/seo/indexing';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import ResearchComparisonPage, {
  generateMetadata as generateResearchComparisonMetadata,
} from '../ai-tools-for-research-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateResearchComparisonMetadata({ params: { locale } }).then((metadata) => ({
    ...metadata,
    ...getNoindexMetadata(),
  }));
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      {ResearchComparisonPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? '研究工具对比要先区分资料发现、证据核对和研究工作流，再决定哪些工具值得保留。'
            : 'Research tool comparisons should separate discovery, evidence-checking, and workflow fit before deciding what to keep.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? [
                '先确认你是做资料发现还是证据核对。',
                '再看引用、导出和长期追问是否顺手。',
                '最后回到真实研究案例和评论决定是否保留索引。',
              ]
            : [
                'First confirm whether you are doing discovery or evidence-checking.',
                'Then check citations, export, and follow-up workflows.',
                'Finally review real research cases and comments before keeping it indexed.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '资料发现' : 'Discovery',
            value: locale === 'cn' || locale === 'tw' ? '先打开话题' : 'Open the topic first',
            note:
              locale === 'cn' || locale === 'tw'
                ? '先看能不能快速打开话题和找到下一步。'
                : 'Check whether it can quickly open a topic and suggest the next step.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '证据核对' : 'Evidence-checking',
            value: locale === 'cn' || locale === 'tw' ? '确认来源链路' : 'Confirm source chain',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果你更在意来源和引用链路，这一步最关键。'
                : 'If sources and citation chains matter more, this is the key layer.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '研究工作流' : 'Research workflow',
            value: locale === 'cn' || locale === 'tw' ? '导出和复盘' : 'Export and recap',
            note:
              locale === 'cn' || locale === 'tw'
                ? '能不能导出、复盘和持续追问，会决定它能否长期使用。'
                : 'Whether it supports export, recap, and follow-up determines long-term usefulness.',
          },
        ]}
        signalCards={[
          {
            label: locale === 'cn' || locale === 'tw' ? '发现信号' : 'Discovery signal',
            value:
              locale === 'cn' || locale === 'tw' ? '先看能否快速打开话题' : 'Check whether it quickly opens a topic',
            note:
              locale === 'cn' || locale === 'tw'
                ? '研究工具首先要帮你找到下一步。'
                : 'Research tools first need to point you to the next step.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '证据信号' : 'Evidence signal',
            value: locale === 'cn' || locale === 'tw' ? '看来源链路是否清楚' : 'See whether the source chain is clear',
            note:
              locale === 'cn' || locale === 'tw'
                ? '来源不清，研究价值会打折。'
                : 'If sources are unclear, the research value drops quickly.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '复用信号' : 'Reuse signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '看导出、复盘和追问是否顺手'
                : 'Check whether export, recap, and follow-up feel smooth',
            note:
              locale === 'cn' || locale === 'tw'
                ? '能复用和协作，才适合长期留着。'
                : 'Reusability and collaboration are what make it stick.',
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
