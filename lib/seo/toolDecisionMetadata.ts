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
      title: 'n8n Pricing & Self-Hosting: Costs, Limits and Alternatives',
      description:
        'Compare n8n Cloud and self-hosting by execution pricing, maintenance, Community Edition limits, licensing, and when Make or Lindy is a better fit.',
      primaryTask: 'Choose n8n Cloud or self-hosting for production automations',
      decisionAngle: 'Self-hosting adds control, but your team owns security, backups, upgrades, and recovery',
    },
    cn: {
      title: 'n8n 价格与自托管：成本、限制和替代方案',
      description: '比较 n8n Cloud 与自托管的 execution 计费、维护责任、Community Edition 限制和许可边界，并判断何时改用 Make 或 Lindy。',
      primaryTask: '为生产自动化选择 n8n Cloud 或自托管',
      decisionAngle: '自托管换来更多控制，但安全、备份、升级和故障恢复都由团队负责',
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
