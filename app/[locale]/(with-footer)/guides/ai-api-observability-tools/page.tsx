import { getNoindexMetadata } from '@/lib/seo/indexing';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import ApiObservabilityPage, {
  generateMetadata as generateApiObservabilityMetadata,
} from '../ai-tools-for-api-observability/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...generateApiObservabilityMetadata({ params: { locale } }),
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      {ApiObservabilityPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? 'API 可观测工具页要先看请求、告警和调试，而不是只看仪表盘有多少图。'
            : 'API observability tool pages should focus on requests, alerts, and debugging rather than how many charts the dashboard has.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? [
                '先确认你要监控的是请求、错误还是延迟。',
                '再看告警、追踪和排障是否顺手。',
                '最后结合真实事故和反馈判断是否长期使用。',
              ]
            : [
                'First confirm whether you need request, error, or latency monitoring.',
                'Then check alerts, tracing, and debugging workflows.',
                'Finally use real incidents and feedback to judge long-term use.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '请求与错误' : 'Requests and errors',
            value: locale === 'cn' || locale === 'tw' ? '能否快速定位' : 'Can it pinpoint issues fast',
            note:
              locale === 'cn' || locale === 'tw'
                ? '请求和错误看不清，排障就会慢。'
                : 'If requests and errors are unclear, debugging slows down.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '告警与追踪' : 'Alerts and tracing',
            value: locale === 'cn' || locale === 'tw' ? '是否及时可追' : 'Are alerts timely and traceable',
            note:
              locale === 'cn' || locale === 'tw'
                ? '好工具应该让问题能被及时追到。'
                : 'A good tool makes issues traceable in time.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '真实事故' : 'Real incidents',
            value: locale === 'cn' || locale === 'tw' ? '能否复盘' : 'Can it support postmortems',
            note:
              locale === 'cn' || locale === 'tw'
                ? '最后还是要看它能不能帮助复盘和修复。'
                : 'Ultimately, it has to help with incident recap and fixes.',
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
