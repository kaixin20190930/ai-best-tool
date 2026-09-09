export type CategoryMetadataProfile = {
  title: string;
  description: string;
};

export const CATEGORY_METADATA_PROFILES: Record<
  string,
  { en: CategoryMetadataProfile; cn: CategoryMetadataProfile }
> = {
  'design-art': {
    en: {
      title: 'AI Design & Art Tools: Images, Video & Creative Workflows',
      description:
        'Compare AI design and art tools for image generation, video, editing, brand assets, and creative workflows, including output control, rights, pricing, and quality limits.',
    },
    cn: {
      title: 'AI 设计与创意工具：图像、视频与创作流程 | AI Best Tool',
      description: '比较 AI 图像生成、视频、编辑、品牌素材与创作流程工具，重点核对输出控制、商业权利、价格和质量限制。',
    },
  },
  'life-assistant': {
    en: {
      title: 'AI Life Assistant Tools: Planning, Habits & Daily Tasks',
      description:
        'Compare AI life assistants for planning, habits, reminders, personal organization, and everyday tasks, including privacy, reliability, integrations, and pricing.',
    },
    cn: {
      title: 'AI 生活助手：规划、习惯与日常任务 | AI Best Tool',
      description: '比较用于规划、习惯、提醒、个人整理和日常任务的 AI 助手，并核对隐私、可靠性、集成和价格边界。',
    },
  },
  other: {
    en: {
      title: 'Specialized AI Tools: Utilities & Emerging Use Cases',
      description:
        'Explore specialized AI utilities and emerging use cases that do not yet fit a stable core category, with task fit, limitations, pricing, and evidence checked before selection.',
    },
    cn: {
      title: '专项 AI 工具：实用工具与新兴场景 | AI Best Tool',
      description: '探索尚未归入稳定核心分类的专项 AI 实用工具和新兴场景，选择前核对任务适配、限制、价格与证据。',
    },
  },
  research: {
    en: {
      title: 'AI Research Tools Directory: Search, Citations & Evidence',
      description:
        'Compare AI research tools for discovery, citations, literature review, and evidence checking, with use cases, limits, pricing, and review signals.',
    },
    cn: {
      title: 'AI 研究工具目录：搜索、引用与证据整理 | AI Best Tool',
      description:
        '比较 AI 研究工具的资料发现、引用追踪、文献整理和证据核对能力，查看适用场景、限制、价格与最近验证信息。',
    },
  },
  productivity: {
    en: {
      title: 'AI Productivity Tools: Meetings, Tasks & Team Workflows',
      description:
        'Compare AI productivity tools for meetings, notes, scheduling, tasks, and team workflows, including pricing, collaboration limits, freshness, and real usage signals.',
    },
    cn: {
      title: 'AI 生产力工具：会议、任务与团队工作流 | AI Best Tool',
      description:
        '比较会议纪要、日程、任务管理和团队协作类 AI 工具，查看价格、席位限制、工作流适配、最近更新和真实使用信号。',
    },
  },
  automation: {
    en: {
      title: 'AI Automation Tools: Triggers, Workflows & Reliability',
      description:
        'Compare AI automation tools by triggers, integrations, branching, retries, logs, permissions, pricing, and long-term workflow reliability.',
    },
    cn: {
      title: 'AI 自动化工具：触发器、工作流与可靠性 | AI Best Tool',
      description:
        '按触发器、集成、条件分支、失败重试、日志、权限和价格比较 AI 自动化工具，判断真实生产工作流是否可靠。',
    },
  },
  web3: {
    en: {
      title: 'Web3 AI Tools: On-Chain Research, Data & Monitoring',
      description:
        'Compare Web3 tools for on-chain research, protocol data, wallet monitoring, dashboards, and developer infrastructure, with coverage, pricing, freshness, and risk signals.',
    },
    cn: {
      title: 'Web3 AI 工具：链上研究、数据与监控 | AI Best Tool',
      description:
        '比较链上研究、协议数据、钱包监控、仪表盘和开发者基础设施工具，查看覆盖范围、价格、数据时效和风险信号。',
    },
  },
  voice: {
    en: {
      title: 'AI Voice Tools: Transcription, Speech & Audio Workflows',
      description:
        'Compare AI voice tools for transcription, speech generation, meetings, podcasts, and audio workflows, including language support, exports, pricing, and quality risks.',
    },
    cn: {
      title: 'AI 语音工具：转录、语音生成与音频工作流 | AI Best Tool',
      description: '比较会议转录、语音生成、播客和音频工作流工具，查看语言支持、导出能力、价格、音质和生产使用风险。',
    },
  },
  'developer-tools': {
    en: {
      title: 'AI Developer Tools: APIs, Coding & Production Workflows',
      description:
        'Compare AI developer tools by APIs, SDKs, coding workflows, observability, permissions, pricing, and production reliability.',
    },
    cn: {
      title: 'AI 开发者工具：API、编码与生产工作流 | AI Best Tool',
      description: '按 API、SDK、编码工作流、可观测性、权限、价格和生产可靠性比较 AI 开发者工具。',
    },
  },
};
