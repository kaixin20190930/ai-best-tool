import { getNoindexMetadata } from '@/lib/seo/indexing';
import { getAllCategories } from '@/lib/services/categories';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import ResearchToolsPage, { generateMetadata as generateResearchToolsMetadata } from '../ai-tools-for-research/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...generateResearchToolsMetadata({ params: { locale } }),
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const categories = await getAllCategories(true).catch(() => []);
  return (
    <>
      {ResearchToolsPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? `研究工具页要先看有没有真实资料发现、证据核对和导出复盘信号，目前可参考分类信号 ${categories.length} 个。`
            : `Research tool pages should show discovery, evidence-checking, and export/recap signals, with ${categories.length} category signals currently available.`
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? [
                '先确认你是做资料发现还是证据核对。',
                '再看导出、引用和复盘是否顺手。',
                '最后用真实案例和评论决定是否保留。',
              ]
            : [
                'First confirm whether you need discovery or evidence-checking.',
                'Then check exports, citations, and recap workflows.',
                'Finally use real cases and comments to decide whether to keep it.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '资料发现' : 'Discovery',
            value: locale === 'cn' || locale === 'tw' ? '快速打开话题' : 'Open the topic quickly',
            note:
              locale === 'cn' || locale === 'tw'
                ? '最重要的是能不能迅速找到下一步。'
                : 'The key question is whether it quickly suggests the next step.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '证据核对' : 'Evidence-checking',
            value: locale === 'cn' || locale === 'tw' ? '来源与引用链路' : 'Sources and citation chain',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果你在意结论是否可靠，这一层最关键。'
                : 'If you care whether the conclusion is trustworthy, this layer is critical.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '复盘与导出' : 'Recap and export',
            value: locale === 'cn' || locale === 'tw' ? '适合长期研究流程' : 'Fits long-term research workflows',
            note:
              locale === 'cn' || locale === 'tw'
                ? '能不能复盘，决定它能不能在团队里长期用。'
                : 'Whether it supports recap decides whether it can live in a team workflow.',
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
              ? `这页已按当前比较页的判断标准重新核对，当前可参考分类信号 ${categories.length} 个。`
              : `This page has been rechecked against the current comparison-page decision flow, with ${categories.length} category signals available.`}
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
            {locale === 'cn' || locale === 'tw'
              ? '补真实用例、来源说明、最近验证'
              : 'Add real use cases, source notes, and recent verification'}
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
