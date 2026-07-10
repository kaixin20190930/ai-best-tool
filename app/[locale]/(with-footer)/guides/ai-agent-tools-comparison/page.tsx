import AgentToolsComparisonPage, {
  generateMetadata as generateAgentToolsComparisonMetadata,
} from '../ai-tools-for-agents-comparison/page';
import GuideEvidencePanel from '@/components/guides/GuideEvidencePanel';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateAgentToolsComparisonMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';

  return (
    <>
      {AgentToolsComparisonPage({ params: { locale } })}
      <GuideEvidencePanel
        locale={locale}
        scope={
          isChinese
            ? '这页先看真实可验证的 Agent 信号，再继续判断是否真的要走编排、执行和治理层。'
            : 'This page looks at verifiable agent signals first, then helps you decide whether orchestration, execution, and governance are truly needed.'
        }
        items={[
          {
            label: isChinese ? '编排' : 'Orchestration',
            value: isChinese ? '多步骤和工具调用' : 'Multi-step and tool use',
            note: isChinese
              ? '真正的 Agent 不是单轮回答，而是能跑完整流程。'
              : 'A real agent runs a full flow, not just a single answer.',
          },
          {
            label: isChinese ? '状态' : 'State',
            value: isChinese ? '能否保留上下文' : 'Can it retain context',
            note: isChinese
              ? '没有状态管理，Agent 很快就会失去价值。'
              : 'Without state management, agent value drops fast.',
          },
          {
            label: isChinese ? '治理' : 'Governance',
            value: isChinese ? '日志、审计、人工接管' : 'Logs, audits, human override',
            note: isChinese
              ? '进入生产后，这些比 demo 观感更重要。'
              : 'In production, these matter more than demo feel.',
          },
        ]}
      />
    </>
  );
}
