import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import ApiObservabilityComparisonPage, {
  generateMetadata as generateApiObservabilityComparisonMetadata,
} from '../ai-tools-for-api-observability-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateApiObservabilityComparisonMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';

  return (
    <>
      {ApiObservabilityComparisonPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          isChinese
            ? '这页先看真实可验证的 API 可观测信号，再继续判断是否需要日志、成本和质量追踪。'
            : 'This page looks at verifiable API observability signals first, then helps you decide whether logs, cost, and quality tracking are needed.'
        }
        items={[
          {
            label: isChinese ? '日志可见性' : 'Log visibility',
            value: isChinese ? '请求与失败是否清楚' : 'Are requests and failures clear',
            note: isChinese
              ? '如果看不清失败原因，就很难把它当成生产层工具。'
              : 'If failures are opaque, it is hard to trust it in production.',
          },
          {
            label: isChinese ? '成本追踪' : 'Cost tracking',
            value: isChinese ? '能否看清消耗' : 'Can spend be seen clearly',
            note: isChinese
              ? '把成本和表现放在一起看，才更容易做路由决策。'
              : 'Cost and performance need to be visible together for routing decisions.',
          },
          {
            label: isChinese ? '质量追踪' : 'Quality tracking',
            value: isChinese ? '输出质量是否能复盘' : 'Can output quality be reviewed',
            note: isChinese
              ? '这类页的价值不只是监控，而是帮你做更稳的判断。'
              : 'The point is not only monitoring, but making better decisions.',
          },
        ]}
      />
      <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {locale === 'cn' || locale === 'tw' ? '最近验证' : 'Last checked'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-14</p>
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
