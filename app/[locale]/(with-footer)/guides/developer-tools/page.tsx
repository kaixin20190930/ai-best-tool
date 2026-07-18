import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import DeveloperToolsPage, {
  generateMetadata as generateDeveloperToolsMetadata,
} from '../ai-tools-for-developers/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateDeveloperToolsMetadata({ params: { locale } });
  return {
    ...metadata,
    ...getNoindexMetadata(),
    alternates: {
      ...metadata.alternates,
      canonical: `/${locale}/guides/ai-tools-for-developers`,
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      {DeveloperToolsPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? '开发者工具页要先看工作流贴合度、协作和可维护性，而不是只看“面向开发者”这个标签。'
            : 'Developer tool pages should focus on workflow fit, collaboration, and maintainability rather than just the "for developers" label.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? [
                '先确认它是不是你日常开发流程的一部分。',
                '再看协作、上下文和可维护性是否足够。',
                '最后用真实案例和反馈判断是否保留索引。',
              ]
            : [
                'First confirm whether it belongs in your daily dev workflow.',
                'Then check collaboration, context, and maintainability.',
                'Finally use real cases and feedback to decide whether to keep it indexed.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '工作流贴合' : 'Workflow fit',
            value: locale === 'cn' || locale === 'tw' ? '能否融进日常开发' : 'Fits day-to-day development',
            note:
              locale === 'cn' || locale === 'tw'
                ? '真正有用的工具会直接融入开发节奏。'
                : 'Useful tools fit directly into the dev cadence.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '协作与上下文' : 'Collaboration and context',
            value: locale === 'cn' || locale === 'tw' ? '是否支持团队协作' : 'Supports team collaboration',
            note:
              locale === 'cn' || locale === 'tw'
                ? '团队开发里，上下文和协作很关键。'
                : 'Context and collaboration are critical in team development.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '可维护性' : 'Maintainability',
            value: locale === 'cn' || locale === 'tw' ? '长期能不能用' : 'Can it hold up over time',
            note:
              locale === 'cn' || locale === 'tw'
                ? '最后要看它能不能长期留在工作流里。'
                : 'Ultimately, it has to stay usable over time.',
          },
        ]}
        signalCards={[
          {
            label: locale === 'cn' || locale === 'tw' ? '价格信号' : 'Pricing signal',
            value:
              locale === 'cn' || locale === 'tw' ? '先看团队席位和可扩展性' : 'Check team seats and scalability first',
            note:
              locale === 'cn' || locale === 'tw'
                ? '开发者工具通常要看多人协作和可持续成本。'
                : 'Developer tools often hinge on collaboration and sustainable cost.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '更新信号' : 'Freshness signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '看 API、集成和可维护性是否更新'
                : 'Check whether APIs, integrations, and maintainability are updated',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果更新只停留在界面层，长期用起来会很快失真。'
                : 'If updates only touch the UI layer, the long-term workflow tends to drift quickly.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '风险信号' : 'Risk signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '没有协作 / 上下文 / 维护就先降级'
                : 'Downgrade it without collaboration, context, or maintainability',
            note:
              locale === 'cn' || locale === 'tw'
                ? '这三项不稳，工具就很难真正融入开发流程。'
                : 'Without those three, the tool rarely fits into the dev workflow for long.',
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
