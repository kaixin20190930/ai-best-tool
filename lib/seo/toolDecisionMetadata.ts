export type ToolDecisionMetadata = {
  title: string;
  description: string;
  primaryTask: string;
  decisionAngle: string;
};

type LocalizedToolDecisionMetadata = {
  en: ToolDecisionMetadata;
  cn: ToolDecisionMetadata;
};

// CTR pilots are deliberately allowlisted. Expanding this registry requires
// verified page evidence and a recorded snippet experiment.
const TOOL_DECISION_METADATA_PILOTS: Record<string, LocalizedToolDecisionMetadata> = {
  n8n: {
    en: {
      title: 'n8n for AI Workflow Automation: Costs & Limits',
      description:
        'Assess n8n for visual AI and API workflows. Compare cloud versus self-hosting, execution costs, governance, license limits, and maintenance trade-offs.',
      primaryTask: 'Build maintainable AI and API automations',
      decisionAngle: 'Cloud convenience versus self-hosting control and maintenance',
    },
    cn: {
      title: 'n8n AI 工作流自动化：成本、自托管与限制',
      description: '判断 n8n 是否适合可视化 AI 与 API 工作流，比较云端和自托管、执行成本、治理、许可证边界与维护责任。',
      primaryTask: '构建可维护的 AI 与 API 自动化流程',
      decisionAngle: '比较云端便利性与自托管控制、维护成本',
    },
  },
  openrouter: {
    en: {
      title: 'OpenRouter for Multi-Model APIs: Cost, Privacy & Limits',
      description:
        'Assess OpenRouter for one API across model providers. Compare routing, fallbacks, total cost, privacy boundaries, endpoint support, and gateway dependency.',
      primaryTask: 'Route requests across multiple AI model providers',
      decisionAngle: 'Provider flexibility versus privacy and gateway dependency',
    },
    cn: {
      title: 'OpenRouter 多模型 API：成本、隐私与限制',
      description:
        '判断 OpenRouter 是否适合统一接入多个模型供应商，比较路由、fallback、总成本、隐私边界、endpoint 支持和网关依赖。',
      primaryTask: '通过统一 API 路由多个 AI 模型供应商',
      decisionAngle: '比较供应商灵活性与隐私、网关依赖',
    },
  },
  poe: {
    en: {
      title: 'Poe for Multi-Bot AI: Points, Privacy & Limits',
      description:
        'Assess Poe for using multiple AI bots in one app. Compare useful output per compute point, bot-specific privacy controls, subscriptions, and usage limits.',
      primaryTask: 'Use and compare multiple AI bots in one interface',
      decisionAngle: 'Bot variety versus compute points and bot-specific privacy',
    },
    cn: {
      title: 'Poe 多 Bot AI 平台：算力点、隐私与限制',
      description:
        '判断 Poe 是否适合在一个应用中使用多个 AI Bot，比较每点算力的有效输出、各 Bot 隐私设置、订阅管理和用量限制。',
      primaryTask: '在一个界面使用和比较多个 AI Bot',
      decisionAngle: '比较 Bot 丰富度与算力点、各 Bot 隐私边界',
    },
  },
  gemini: {
    en: {
      title: 'Google Gemini for Daily AI Work: Plans, Data & Limits',
      description:
        'Assess Gemini for writing, learning, and planning across web and mobile. Compare account eligibility, real task quality, usage limits, and data settings.',
      primaryTask: 'Handle writing, learning, and planning across Google surfaces',
      decisionAngle: 'Integrated access versus plan limits and data settings',
    },
    cn: {
      title: 'Google Gemini 日常 AI 助手：套餐、数据与限制',
      description: '判断 Gemini 是否适合网页与移动端写作、学习和规划，比较账号资格、真实任务表现、用量限制和数据设置。',
      primaryTask: '在 Google 生态中完成写作、学习和规划',
      decisionAngle: '比较集成便利性与套餐限制、数据设置',
    },
  },
};

export function getToolDecisionMetadataPilot(slug: string, locale: string): ToolDecisionMetadata | null {
  const pilot = TOOL_DECISION_METADATA_PILOTS[slug];
  if (!pilot) return null;
  return locale === 'cn' || locale === 'tw' ? pilot.cn : pilot.en;
}

export const TOOL_DECISION_METADATA_PILOT_SLUGS = Object.freeze(Object.keys(TOOL_DECISION_METADATA_PILOTS));
