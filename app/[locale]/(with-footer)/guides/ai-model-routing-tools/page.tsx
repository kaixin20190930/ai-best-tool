import { getNoindexMetadata } from '@/lib/seo/indexing';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import ModelRoutingPage, { generateMetadata as generateModelRoutingMetadata } from '../ai-tools-for-model-routing/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...generateModelRoutingMetadata({ params: { locale } }),
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      {ModelRoutingPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? '模型路由工具页要先看选择、切换和稳定性，不要只看支持多少模型。'
            : 'Model routing tool pages should focus on selection, switching, and stability rather than the number of supported models.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? [
                '先确认你要的是路由还是单模型入口。',
                '再看切换、稳定性和成本是否顺手。',
                '最后结合真实使用和反馈判断是否长期使用。',
              ]
            : [
                'First confirm whether you need routing or a single-model entry.',
                'Then check switching, stability, and cost.',
                'Finally use real usage and feedback to judge long-term use.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '模型选择' : 'Model selection',
            value: locale === 'cn' || locale === 'tw' ? '是否更合适' : 'Can it pick better',
            note:
              locale === 'cn' || locale === 'tw'
                ? '选择正确比模型数量更重要。'
                : 'Choosing well matters more than model count.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '切换与稳定性' : 'Switching and stability',
            value: locale === 'cn' || locale === 'tw' ? '是否稳定切换' : 'Stable switching',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果切换不稳，路由价值会下降。'
                : 'If switching is unstable, routing value drops fast.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '成本与反馈' : 'Cost and feedback',
            value: locale === 'cn' || locale === 'tw' ? '长期是否划算' : 'Worth it long term',
            note:
              locale === 'cn' || locale === 'tw'
                ? '最后要看它到底值不值。'
                : 'Ultimately, it has to be worth the cost.',
          },
        ]}
        signalCards={[
          {
            label: locale === 'cn' || locale === 'tw' ? '价格信号' : 'Pricing signal',
            value: locale === 'cn' || locale === 'tw' ? '先看路由量和席位' : 'Check routing volume and seats first',
            note:
              locale === 'cn' || locale === 'tw'
                ? '路由工具通常按调用量、团队席位或上层能力收费。'
                : 'Routing tools usually price by calls, team seats, or higher-tier features.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '更新信号' : 'Freshness signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '看模型列表和路由规则是否更新'
                : 'Check whether model lists and routing rules keep updating',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果路由规则不再维护，稳定性会慢慢下降。'
                : 'If routing rules stop being maintained, stability slowly erodes.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '风险信号' : 'Risk signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '没有切换 / 稳定 / 成本就先降级'
                : 'Downgrade it without switching, stability, or cost clarity',
            note:
              locale === 'cn' || locale === 'tw'
                ? '这三项不清楚，路由价值很难成立。'
                : 'Without those three, routing value is hard to justify.',
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
