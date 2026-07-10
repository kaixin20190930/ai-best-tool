import ModelRoutingComparisonPage, {
  generateMetadata as generateModelRoutingComparisonMetadata,
} from '../ai-tools-for-model-routing-comparison/page';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateModelRoutingComparisonMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';

  return (
    <>
      {ModelRoutingComparisonPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          isChinese
            ? '这页先看真实可验证的模型路由信号，再继续判断是否需要统一入口、回退控制和成本治理。'
            : 'This page looks at verifiable model-routing signals first, then helps you decide whether unified access, fallback control, and cost governance are needed.'
        }
        items={[
          {
            label: isChinese ? '供应商覆盖' : 'Provider coverage',
            value: isChinese ? '能否真正统一入口' : 'Can it truly unify access',
            note: isChinese
              ? '别只看能接多少模型，要看切换和接入是不是顺手。'
              : 'Do not only count models; check whether switching and access feel clean.',
          },
          {
            label: isChinese ? '回退能力' : 'Fallbacks',
            value: isChinese ? '失败场景是否可控' : 'Can failures be controlled',
            note: isChinese
              ? '生产里最关键的往往不是接入，而是失败之后怎么办。'
              : 'In production, failure handling matters more than initial setup.',
          },
          {
            label: isChinese ? '治理能力' : 'Governance',
            value: isChinese ? '日志、限额、审计' : 'Logs, limits, and audits',
            note: isChinese
              ? '如果要长期上线，这些会直接决定是否可用。'
              : 'These decide whether it is usable long term.',
          },
        ]}
      />
    </>
  );
}
