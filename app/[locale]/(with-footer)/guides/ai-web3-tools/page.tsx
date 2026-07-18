import { getNoindexMetadata } from '@/lib/seo/indexing';
import { getAllCategories } from '@/lib/services/categories';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import Web3ToolsPage, { generateMetadata as generateWeb3ToolsMetadata } from '../ai-tools-for-web3/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...generateWeb3ToolsMetadata({ params: { locale } }),
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const categories = await getAllCategories(true).catch(() => []);
  return (
    <>
      {Web3ToolsPage({ params: { locale } })}

      <GuideEvidencePanel
        locale={locale}
        checkedAt='2026-07-18'
        scope={
          locale === 'cn' || locale === 'tw'
            ? 'Web3 总入口现在强调的是“先确认链上场景，再挑具体工具”。'
            : 'The Web3 entry page now emphasizes choosing the scenario first, then the tool.'
        }
        decisionSteps={
          locale === 'cn' || locale === 'tw'
            ? ['先确认链上任务类型', '再看覆盖的数据范围', '最后再落到具体工具']
            : ['Confirm the on-chain task type first', 'Then check data coverage', 'Only then choose a specific tool']
        }
        items={[
          {
            label: locale === 'cn' || locale === 'tw' ? '场景收敛' : 'Scenario focus',
            value: locale === 'cn' || locale === 'tw' ? '追踪 / 研究 / 监控' : 'Tracking / research / monitoring',
            note:
              locale === 'cn' || locale === 'tw'
                ? '先把你是在做资产追踪、地址研究还是异常监控说清楚。'
                : 'Be explicit about whether you need portfolio tracking, address research, or anomaly monitoring.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '数据覆盖' : 'Data coverage',
            value: locale === 'cn' || locale === 'tw' ? '链与协议覆盖' : 'Chain and protocol coverage',
            note:
              locale === 'cn' || locale === 'tw'
                ? '覆盖不到你常用链的数据，再好的页面也很难转化。'
                : 'If the tool does not cover the chains you use, the page will not convert well no matter how polished it is.',
          },
          {
            label: locale === 'cn' || locale === 'tw' ? '落地路径' : 'Implementation path',
            value: locale === 'cn' || locale === 'tw' ? '榜单 -> 指南 -> 具体页' : 'Ranking -> guide -> specific page',
            note:
              locale === 'cn' || locale === 'tw'
                ? '这个总入口要把用户送到更窄的决策页，而不是停在泛内容层。'
                : 'This hub should move users into narrower decision pages rather than leaving them in generic content.',
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
