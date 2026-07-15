import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import ResearchToolsPage, { generateMetadata as generateResearchToolsMetadata } from '../ai-tools-for-research/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateResearchToolsMetadata({ params: { locale } });
  return {
    ...metadata,
    ...getNoindexMetadata(),
    alternates: {
      ...metadata.alternates,
      canonical: `/${locale}/guides/ai-tools-for-research`,
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      {ResearchToolsPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? '研究工具页要先看资料发现、证据核对和复盘，不要只看搜索结果多不多。'
            : 'Research tool pages should focus on discovery, evidence-checking, and recap rather than just how many results show up.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? [
                '先确认你是做资料发现还是证据核对。',
                '再看导出、引用和追问是否顺手。',
                '最后结合真实案例和反馈判断是否长期使用。',
              ]
            : [
                'First confirm whether you need discovery or evidence-checking.',
                'Then check exports, citations, and follow-up workflows.',
                'Finally use real cases and feedback to judge long-term use.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '资料发现' : 'Discovery',
            value: locale === 'cn' || locale === 'tw' ? '先打开话题' : 'Open the topic first',
            note:
              locale === 'cn' || locale === 'tw'
                ? '能不能快速打开范围，是第一层。'
                : 'The first layer is whether it can quickly open the topic.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '证据核对' : 'Evidence-checking',
            value: locale === 'cn' || locale === 'tw' ? '来源和引用链路' : 'Sources and citation chain',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果来源不稳，研究就不稳。'
                : 'If sources are weak, the research is weak.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '复盘与导出' : 'Recap and export',
            value: locale === 'cn' || locale === 'tw' ? '是否便于整理' : 'Easy to organize later',
            note:
              locale === 'cn' || locale === 'tw'
                ? '能不能复盘，决定它能否长期用。'
                : 'Whether it supports recap decides long-term use.',
          },
        ]}
        signalCards={[
          {
            label: locale === 'cn' || locale === 'tw' ? '价格信号' : 'Pricing signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '先看免费能否覆盖日常研究'
                : 'Check whether free use covers daily research',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果基础查询都开始收费，研究流程很容易被打断。'
                : 'If basic queries already cost money, the research workflow gets interrupted quickly.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '更新信号' : 'Freshness signal',
            value:
              locale === 'cn' || locale === 'tw' ? '来源和证据要保持新鲜' : 'Sources and evidence need to stay fresh',
            note:
              locale === 'cn' || locale === 'tw'
                ? '研究工具一旦失去追溯性，可信度会掉得很快。'
                : 'Once traceability weakens, trust drops very quickly in research tools.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '风险信号' : 'Risk signal',
            value: locale === 'cn' || locale === 'tw' ? '别被“看起来正确”骗到' : 'Do not trust "looks right" alone',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果无法回到来源链，先当作高风险。'
                : 'If you cannot trace back to the source chain, treat it as high risk first.',
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
