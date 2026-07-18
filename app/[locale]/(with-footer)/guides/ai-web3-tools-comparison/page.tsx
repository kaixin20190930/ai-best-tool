import { getNoindexMetadata } from '@/lib/seo/indexing';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import Web3ComparisonPage, {
  generateMetadata as generateWeb3ComparisonMetadata,
} from '../ai-tools-for-web3-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...generateWeb3ComparisonMetadata({ params: { locale } }),
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';
  const checkedAt = '2026-07-18';

  return (
    <>
      {Web3ComparisonPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        checkedAt={checkedAt}
        scope={
          isChinese
            ? '这页先看真实可验证的 Web3 工具信号，再继续判断是否要走更广的 Web3、链上和协议分析入口。'
            : 'This page looks at verifiable Web3-tool signals first, then helps you decide whether to move toward broader Web3, on-chain, and protocol-analysis entry points.'
        }
        decisionSteps={
          isChinese
            ? [
                '先判断你要的是协议、链上，还是钱包层面的研究工具。',
                '如果方向已经清楚，先去更窄的 Web3 榜单或对比页收缩 shortlist。',
                '如果还要和团队确认研究深度，再回到这里看导出、历史和分享。',
              ]
            : [
                'First decide whether you need protocol, on-chain, or wallet-level research tools.',
                'If the direction is already clear, move to a narrower Web3 ranking or comparison page to shrink the shortlist.',
                'If you still need team alignment on depth, come back here for exports, history, and sharing.',
              ]
        }
        items={[
          {
            label: isChinese ? '覆盖层级' : 'Coverage layer',
            value: isChinese ? '协议、链上、钱包是否都够用' : 'Are protocol, chain, and wallet layers covered',
            note: isChinese
              ? '如果覆盖层级错了，后面再看功能细节就没意义。'
              : 'If the layer is wrong, feature details matter less.',
          },
          {
            label: isChinese ? '研究深度' : 'Research depth',
            value: isChinese ? '能否继续往下钻' : 'Can it drill deeper',
            note: isChinese
              ? 'Web3 工具最重要的是不是只能看表层。'
              : 'The key question is whether the tool goes beyond the surface.',
          },
          {
            label: isChinese ? '可复用性' : 'Reusability',
            value: isChinese ? '导出、历史、分享' : 'Exports, history, and sharing',
            note: isChinese
              ? '能否反复复盘和团队协作，决定它是否真有用。'
              : 'Whether you can reuse it and collaborate determines real usefulness.',
          },
        ]}
        signalCards={[
          {
            label: isChinese ? '覆盖信号' : 'Coverage signal',
            value: isChinese ? '协议、链上和钱包是否都够' : 'Are protocol, chain, and wallet layers all covered',
            note: isChinese
              ? '覆盖层级错了，后面细看功能意义不大。'
              : 'If the layer is wrong, feature details matter less.',
          },
          {
            label: isChinese ? '深度信号' : 'Depth signal',
            value: isChinese ? '能否继续往下钻' : 'Can it drill deeper',
            note: isChinese ? '真正有价值的是不只停在表层汇总。' : 'The key value is going beyond the surface summary.',
          },
          {
            label: isChinese ? '复用信号' : 'Reuse signal',
            value: isChinese ? '导出、历史和分享' : 'Exports, history, and sharing',
            note: isChinese
              ? '可复盘、可协作，才算真有用。'
              : 'If it can be reused and collaborated on, it is genuinely useful.',
          },
        ]}
      />
      <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '最近验证' : 'Last checked'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>{checkedAt}</p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {isChinese
              ? `这页已按真实 Web3 工具路径重新核对（${checkedAt}），保留协议、链上和研究入口。`
              : `This page has been rechecked against a real Web3-tool workflow (${checkedAt}) and keeps protocol, on-chain, and research entry points visible.`}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '当前判断' : 'Current judgment'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {isChinese ? '保留索引，补真实 Web3 工具证据' : 'Keep it indexable and add real Web3-tool evidence'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {isChinese
              ? '用覆盖、研究深度和真人评论把它和泛工具页区分开。'
              : 'Use coverage, depth, and real comments to differentiate it from generic tool pages.'}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '下一步' : 'Next step'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>
            {isChinese ? '补真实 Web3 场景和反馈' : 'Add real Web3 scenarios and feedback'}
          </p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {isChinese ? '后续优先补案例、图表和真人评论。' : 'Next, prioritize cases, charts, and real comments.'}
          </p>
        </div>
      </section>
    </>
  );
}
