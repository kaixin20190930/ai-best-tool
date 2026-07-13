import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

import Web3ComparisonPage, {
  generateMetadata as generateWeb3ComparisonMetadata,
} from '../ai-tools-for-web3-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateWeb3ComparisonMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';

  return (
    <>
      {Web3ComparisonPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          isChinese
            ? '这页先看真实可验证的 Web3 工具信号，再继续判断是否要走更广的 Web3、链上和协议分析入口。'
            : 'This page looks at verifiable Web3-tool signals first, then helps you decide whether to move toward broader Web3, on-chain, and protocol-analysis entry points.'
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
      />
      <section className='mt-6 grid gap-4 rounded-[18px] border border-cyan-200 bg-cyan-50/70 p-6 shadow-sm md:grid-cols-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {isChinese ? '最近验证' : 'Last checked'}
          </p>
          <p className='mt-2 text-lg font-bold text-slate-950'>2026-07-14</p>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {isChinese
              ? '这页已按真实 Web3 工具路径重新核对，保留协议、链上和研究入口。'
              : 'This page has been rechecked against a real Web3-tool workflow and keeps protocol, on-chain, and research entry points visible.'}
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
