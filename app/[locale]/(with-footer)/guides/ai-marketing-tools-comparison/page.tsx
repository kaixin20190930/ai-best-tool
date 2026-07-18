import { getNoindexMetadata } from '@/lib/seo/indexing';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import MarketingComparisonPage, {
  generateMetadata as generateMarketingComparisonMetadata,
} from '../ai-tools-for-marketing-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...generateMarketingComparisonMetadata({ params: { locale } }),
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      {MarketingComparisonPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? '营销工具对比要先判断你是在买内容生成，还是在买 CRM、自动化和流程协同。'
            : 'Marketing tool comparisons should begin by deciding whether you need content generation or CRM, automation, and workflow coordination.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? [
                '先确认你要的是内容生成还是营销系统。',
                '再看受众管理、自动化和团队协作是否顺手。',
                '最后回到真实案例和反馈，判断是否值得长期索引。',
              ]
            : [
                'First confirm whether you need content generation or a marketing system.',
                'Then check audience management, automation, and team collaboration.',
                'Finally review real cases and feedback to judge long-term value.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '内容生成' : 'Content generation',
            value: locale === 'cn' || locale === 'tw' ? '轻量起稿与改写' : 'Light drafting and rewriting',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果只是起稿和改写，优先看更轻的写作工具。'
                : 'If your job is drafting and rewriting, start with lighter writing tools.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '自动化与协作' : 'Automation and collaboration',
            value: locale === 'cn' || locale === 'tw' ? '系统级能力' : 'System-level capability',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果要串起多人协作和触发流程，就要看系统级能力。'
                : 'If you need team coordination and triggers, look at system-level capabilities.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '长期营销流程' : 'Long-term marketing flow',
            value: locale === 'cn' || locale === 'tw' ? '看能否接 CRM / 邮件' : 'Check CRM and email links',
            note:
              locale === 'cn' || locale === 'tw'
                ? '能否和 CRM、邮件和站内动作连接起来，决定它能不能长期留下。'
                : 'Whether it connects with CRM, email, and site actions decides if it will stay in use.',
          },
        ]}
        signalCards={[
          {
            label: locale === 'cn' || locale === 'tw' ? '渠道信号' : 'Channel signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '先看是不是覆盖你真正要用的渠道'
                : 'Check whether it covers the channels you actually use',
            note:
              locale === 'cn' || locale === 'tw'
                ? '营销工具最先看渠道适配。'
                : 'Marketing tools start with channel fit.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '协作信号' : 'Collaboration signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '看团队协作和权限是否顺手'
                : 'See whether team collaboration and permissions are smooth',
            note:
              locale === 'cn' || locale === 'tw'
                ? '多人协作越多，权限和流程越关键。'
                : 'The more people involved, the more permissions and workflow matter.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '长期信号' : 'Long-term signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '看能否接 CRM、邮件和站内动作'
                : 'Check whether it links with CRM, email, and site actions',
            note:
              locale === 'cn' || locale === 'tw'
                ? '能接到后续流程，才会长期保留。'
                : 'It only stays useful if it plugs into downstream flow.',
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
