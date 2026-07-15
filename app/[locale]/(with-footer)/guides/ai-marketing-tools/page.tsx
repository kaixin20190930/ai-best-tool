import { getNoindexMetadata } from '@/lib/seo/indexing';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import MarketingToolsPage, { generateMetadata as generateMarketingToolsMetadata } from '../ai-tools-for-marketing/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...generateMarketingToolsMetadata({ params: { locale } }),
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      {MarketingToolsPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? '营销工具页要先看你是在做内容生成，还是在做广告、邮件和转化链路，不要只盯着单点功能。'
            : 'Marketing tool pages should first decide whether the job is content generation or ads, email, and conversion workflows instead of focusing on a single feature.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? [
                '先确认你是在买内容生成还是营销系统。',
                '再看自动化、受众和协作是否真正需要。',
                '最后结合真实案例和反馈判断是否值得索引。',
              ]
            : [
                'First confirm whether you are buying content generation or a marketing system.',
                'Then check whether automation, audience handling, and collaboration are actually needed.',
                'Finally use real cases and feedback to decide whether it deserves indexing.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '内容生成' : 'Content generation',
            value: locale === 'cn' || locale === 'tw' ? '轻量起稿与改写' : 'Light drafting and rewriting',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果只是写几句文案，别把系统层能力看太重。'
                : 'If you only need a few lines of copy, do not over-weight system-level features.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '自动化与受众' : 'Automation and audience',
            value: locale === 'cn' || locale === 'tw' ? '分群与触发' : 'Segmentation and triggers',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果你需要持续触达，自动化和受众管理更关键。'
                : 'If you need ongoing outreach, automation and audience management matter more.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '长期营销流程' : 'Long-term marketing flow',
            value:
              locale === 'cn' || locale === 'tw' ? '连接 CRM / 邮件 / 网站' : 'Connect CRM, email, and site actions',
            note:
              locale === 'cn' || locale === 'tw'
                ? '能不能串起来，决定它能不能留下。'
                : 'Whether it connects cleanly decides whether it will stay in use.',
          },
        ]}
        signalCards={[
          {
            label: locale === 'cn' || locale === 'tw' ? '价格信号' : 'Pricing signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '先看席位、发送量和自动化额度'
                : 'Check seats, sending volume, and automation caps first',
            note:
              locale === 'cn' || locale === 'tw'
                ? '营销工具的成本通常藏在发送量和自动化层。'
                : 'Marketing costs are often hidden in sending volume and automation tiers.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '更新信号' : 'Freshness signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '看广告、邮件和受众能力是否持续更新'
                : 'Check whether ads, email, and audience features are still being updated',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果还停在单点起稿，优先级就要降。'
                : 'If it is still stuck at single-purpose drafting, priority should drop.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '风险信号' : 'Risk signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '没有真实转化链路就别只看文案'
                : 'Do not judge by copy alone without a real conversion flow',
            note:
              locale === 'cn' || locale === 'tw'
                ? '最终要看能否连到 CRM、邮件和网站动作。'
                : 'The real question is whether it connects to CRM, email, and site actions.',
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
