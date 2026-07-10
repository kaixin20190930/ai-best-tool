import AutomationComparisonPage, {
  generateMetadata as generateAutomationComparisonMetadata,
} from '../ai-tools-for-automation-comparison/page';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateAutomationComparisonMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';

  return (
    <>
      {AutomationComparisonPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          isChinese
            ? '这页先看真实可验证的自动化信号，再继续判断是否需要流程编排、重试和维护能力。'
            : 'This page looks at verifiable automation signals first, then helps you decide whether orchestration, retries, and maintainability are needed.'
        }
        items={[
          {
            label: isChinese ? '流程覆盖' : 'Workflow coverage',
            value: isChinese ? '是否覆盖真实重复任务' : 'Does it cover real repeatable tasks',
            note: isChinese
              ? '自动化的价值主要在重复流程是否真正被解决。'
              : 'Automation matters most when repeatable work is actually solved.',
          },
          {
            label: isChinese ? '失败恢复' : 'Failure recovery',
            value: isChinese ? '重试与异常是否稳定' : 'Are retries and errors stable',
            note: isChinese
              ? '如果失败处理不稳，长期运行会越来越痛苦。'
              : 'Unstable failure handling becomes painful over time.',
          },
          {
            label: isChinese ? '维护成本' : 'Maintenance cost',
            value: isChinese ? '团队能否接手维护' : 'Can a team maintain it',
            note: isChinese
              ? '一个工具能不能长期留着，维护成本很关键。'
              : 'Whether a tool survives long term depends on maintainability.',
          },
        ]}
      />
    </>
  );
}
