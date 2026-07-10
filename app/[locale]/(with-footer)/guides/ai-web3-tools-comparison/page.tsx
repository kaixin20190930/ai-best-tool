import Web3ComparisonPage, {
  generateMetadata as generateWeb3ComparisonMetadata,
} from '../ai-tools-for-web3-comparison/page';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

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
    </>
  );
}
