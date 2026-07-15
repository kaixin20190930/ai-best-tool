import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import SeoToolsPage, { generateMetadata as generateSeoToolsMetadata } from '../ai-seo-tools/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateSeoToolsMetadata({ params: { locale } });
  return {
    ...metadata,
    ...getNoindexMetadata(),
    alternates: {
      ...metadata.alternates,
      canonical: `/${locale}/guides/ai-seo-tools`,
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      {SeoToolsPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          locale === 'cn' || locale === 'tw'
            ? 'SEO 工具页要先看诊断、内容优化和技术校验，而不是只看关键词数量。'
            : 'SEO tool pages should focus on diagnostics, content optimization, and technical checks instead of just keyword counts.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? [
                '先确认你要诊断、优化还是校验。',
                '再看报告、抓取和落地建议是否顺手。',
                '最后用真实案例和反馈判断是否保留索引。',
              ]
            : [
                'First confirm whether you need diagnostics, optimization, or validation.',
                'Then check reports, crawling, and actionable suggestions.',
                'Finally use real cases and feedback to decide whether to keep it indexed.',
              ]
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '诊断' : 'Diagnostics',
            value: locale === 'cn' || locale === 'tw' ? '先找问题' : 'Find issues first',
            note:
              locale === 'cn' || locale === 'tw'
                ? '好的 SEO 工具首先要帮你看出哪里出了问题。'
                : 'A good SEO tool should first help you see what is wrong.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '内容优化' : 'Content optimization',
            value: locale === 'cn' || locale === 'tw' ? '能否给出动作建议' : 'Actionable recommendations',
            note:
              locale === 'cn' || locale === 'tw'
                ? '如果没有建议，只是报表就不够。'
                : 'Without recommendations, it is just a report.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '技术校验' : 'Technical validation',
            value: locale === 'cn' || locale === 'tw' ? '抓取和索引信号' : 'Crawl and index signals',
            note:
              locale === 'cn' || locale === 'tw'
                ? '技术层问题不先查清，内容层再好也难见效。'
                : 'If technical issues are not checked first, content improvements may not help.',
          },
        ]}
        signalCards={[
          {
            label: locale === 'cn' || locale === 'tw' ? '价格信号' : 'Pricing signal',
            value:
              locale === 'cn' || locale === 'tw' ? '先看站点规模和项目数' : 'Check site size and project limits first',
            note:
              locale === 'cn' || locale === 'tw'
                ? 'SEO 工具常按项目、爬取量或站点数量计费。'
                : 'SEO tools often charge by projects, crawl volume, or site count.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '更新信号' : 'Freshness signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '看抓取、日志和建议是否持续更新'
                : 'Check whether crawling, logs, and recommendations keep updating',
            note:
              locale === 'cn' || locale === 'tw'
                ? 'SEO 变化快，旧报告很快失去参考价值。'
                : 'SEO changes fast, and stale reports lose value quickly.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '风险信号' : 'Risk signal',
            value:
              locale === 'cn' || locale === 'tw'
                ? '没有动作建议就先降级'
                : 'Downgrade it without actionable recommendations',
            note:
              locale === 'cn' || locale === 'tw'
                ? '只有报表没有建议，通常不足以支撑优化。'
                : 'Reports without recommendations usually are not enough to drive optimization.',
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
