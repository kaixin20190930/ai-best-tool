import type { TopListTopicKey } from '@/lib/data/topLists';

type LocalizedCopy = { cn: string; en: string };

export type TopicDecisionEvidence = {
  level: 'E0';
  claim: LocalizedCopy;
  boundary: LocalizedCopy;
  source: { label: string; url: string };
  checkedAt: `${number}-${number}-${number}`;
};

export type TopicDecisionProfile = {
  title: LocalizedCopy;
  description: LocalizedCopy;
  criteria: Array<{ title: LocalizedCopy; description: LocalizedCopy }>;
  evidence: TopicDecisionEvidence[];
};

const profiles: Partial<Record<TopListTopicKey, TopicDecisionProfile>> = {
  'ai-coding-tools': {
    title: {
      cn: '2026 年最佳 AI 编程助手：按开发流程选择',
      en: 'Best AI Coding Assistants for Your Development Workflow (2026)',
    },
    description: {
      cn: '比较编辑器内补全、Agent、多文件修改、代码审查和团队控制。候选顺序不是性能排名；请按你的仓库、风险和人工复核成本选择。',
      en: 'Compare in-editor completion, agents, multi-file changes, code review, and team controls. Candidate order is not a performance ranking; choose by repository fit, risk, and human review cost.',
    },
    criteria: [
      {
        title: { cn: '工作表面', en: 'Work surface' },
        description: {
          cn: '先判断需要 IDE 补全、终端 Agent、云端任务还是 PR 审查。',
          en: 'Decide whether you need IDE completion, a terminal agent, cloud tasks, or pull-request review.',
        },
      },
      {
        title: { cn: '仓库上下文', en: 'Repository context' },
        description: {
          cn: '核对多文件理解、索引范围、私有仓库和排除规则。',
          en: 'Check multi-file understanding, indexing scope, private repositories, and exclusion controls.',
        },
      },
      {
        title: { cn: '验证成本', en: 'Verification cost' },
        description: {
          cn: '比较生成速度之外的 diff 审查、测试和返工时间。',
          en: 'Compare diff review, testing, and rework time rather than generation speed alone.',
        },
      },
      {
        title: { cn: '团队边界', en: 'Team boundary' },
        description: {
          cn: '团队使用还要检查策略控制、审计、数据使用和席位成本。',
          en: 'For teams, also check policy controls, auditability, data use, and seat costs.',
        },
      },
    ],
    evidence: [
      {
        level: 'E0',
        claim: {
          cn: 'GitHub 明确把 Copilot 代码审查定位为人工审查的补充，并提醒反馈可能不准确。',
          en: 'GitHub describes Copilot code review as a supplement to human review and warns that feedback can be inaccurate.',
        },
        boundary: {
          cn: '因此本页不会把自动生成或审查能力等同于代码正确性。',
          en: 'This is why the page does not treat automated generation or review as proof of code correctness.',
        },
        source: {
          label: 'GitHub Copilot: responsible use of code review',
          url: 'https://docs.github.com/en/copilot/responsible-use/agents',
        },
        checkedAt: '2026-10-26',
      },
    ],
  },
  'free-ai-coding-tools': {
    title: {
      cn: '2026 年免费 AI 编程工具：免费层与限制对比',
      en: 'Best Free AI Coding Tools: Free Tiers and Limits Compared (2026)',
    },
    description: {
      cn: '只收录官方明确提供免费使用入口的编程工具，并把免费额度、缺失能力和升级触发点分开说明。免费不等于无限，也不等于适合团队生产。',
      en: 'This shortlist includes coding tools with an official free access path and separates free allowances, missing capabilities, and upgrade triggers. Free does not mean unlimited or production-ready for every team.',
    },
    criteria: [
      {
        title: { cn: '长期免费还是试用', en: 'Free tier or trial' },
        description: {
          cn: '确认免费入口是否持续存在，而不是到期自动收费的短期试用。',
          en: 'Confirm whether free access persists instead of expiring into a paid trial.',
        },
      },
      {
        title: { cn: '可完成的任务量', en: 'Completed work capacity' },
        description: {
          cn: '额度必须换算成补全、聊天或 Agent 任务，而不是只看“免费”标签。',
          en: 'Translate allowances into completions, chats, or agent tasks instead of relying on a Free label.',
        },
      },
      {
        title: { cn: '免费层缺口', en: 'Free-tier gaps' },
        description: {
          cn: '检查云端 Agent、代码审查、团队策略和高级模型是否被排除。',
          en: 'Check whether cloud agents, code review, team controls, or advanced models are excluded.',
        },
      },
      {
        title: { cn: '数据与仓库边界', en: 'Data and repository boundary' },
        description: {
          cn: '在连接私有代码前核对数据使用、隐私模式和组织策略。',
          en: 'Review data use, privacy modes, and organization policy before connecting private code.',
        },
      },
    ],
    evidence: [
      {
        level: 'E0',
        claim: {
          cn: 'GitHub 官方套餐页提供 $0 的 Copilot Free，并明确其聊天和 Agent 使用量有限。',
          en: 'GitHub’s official plans page offers Copilot Free at $0 and identifies chat and agent usage as limited.',
        },
        boundary: {
          cn: '具体额度和可用模型会变化，选择前应再次查看官方套餐页。',
          en: 'Allowances and available models can change, so check the official plan page before choosing.',
        },
        source: { label: 'GitHub Copilot plans', url: 'https://github.com/features/copilot/plans' },
        checkedAt: '2026-10-26',
      },
      {
        level: 'E0',
        claim: {
          cn: 'Cursor 官方文档列出 $0 的 Free 方案，并明确其 AI 使用量和 Agent、Chat 等能力有限。',
          en: 'Cursor’s official documentation lists a $0 Free plan with limited AI usage, including limited Agent and Chat access.',
        },
        boundary: {
          cn: '免费层不包含所有云端、审查或团队能力，且用量规则可能变化。',
          en: 'The free tier does not include every cloud, review, or team capability, and usage rules can change.',
        },
        source: { label: 'Cursor pricing and plans', url: 'https://cursor.com/help/account-and-billing/pricing' },
        checkedAt: '2026-10-26',
      },
    ],
  },
};

export function getTopicDecisionProfile(key: TopListTopicKey): TopicDecisionProfile | null {
  return profiles[key] || null;
}
