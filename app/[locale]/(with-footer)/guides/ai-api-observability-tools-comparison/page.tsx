import ApiObservabilityComparisonPage, {
  generateMetadata as generateApiObservabilityComparisonMetadata,
} from '../ai-tools-for-api-observability-comparison/page';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

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
    </>
  );
}
