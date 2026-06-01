export type GuidePageConfig = {
  href: string;
  priority: number;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  title: {
    cn: string;
    en: string;
  };
  desc: {
    cn: string;
    en: string;
  };
};

export const GUIDE_PAGES: GuidePageConfig[] = [
  {
    href: '/guides/how-to-choose-ai-tools',
    priority: 0.75,
    changeFrequency: 'monthly',
    title: {
      cn: '如何选择 AI 工具',
      en: 'How to choose AI tools',
    },
    desc: {
      cn: '先看场景，再看价格、更新和评论。',
      en: 'Start with use case, then check pricing, freshness, and comments.',
    },
  },
  {
    href: '/guides/free-ai-tools',
    priority: 0.75,
    changeFrequency: 'monthly',
    title: {
      cn: '免费 AI 工具怎么选',
      en: 'Best free AI tools',
    },
    desc: {
      cn: '适合想先试用、再决定是否升级的用户。',
      en: 'Good for people who want to try before paying.',
    },
  },
  {
    href: '/guides/best-free-ai-tools',
    priority: 0.78,
    changeFrequency: 'weekly',
    title: {
      cn: '最佳免费 AI 工具',
      en: 'Best free AI tools ranking',
    },
    desc: {
      cn: '按实际可用性整理的免费工具榜单。',
      en: 'A practical ranking of free tools based on usefulness.',
    },
  },
  {
    href: '/guides/ai-writing-tools',
    priority: 0.74,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 写作工具推荐',
      en: 'AI writing tools',
    },
    desc: {
      cn: '适合内容创作、SEO、营销和日常写作。',
      en: 'For content creation, SEO, marketing, and daily writing.',
    },
  },
  {
    href: '/guides/ai-writing-tools-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 写作工具对比',
      en: 'AI writing tools comparison',
    },
    desc: {
      cn: '把几款常见写作工具放在一起快速对照。',
      en: 'Compare common writing tools side by side.',
    },
  },
  {
    href: '/guides/ai-video-tools',
    priority: 0.74,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 视频工具推荐',
      en: 'AI video tools',
    },
    desc: {
      cn: '适合剪辑、生成、配音和营销视频。',
      en: 'For editing, generation, voiceover, and marketing clips.',
    },
  },
  {
    href: '/guides/ai-video-tools-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 视频工具对比',
      en: 'AI video tools comparison',
    },
    desc: {
      cn: '把几款常见视频工具放在一起快速对照。',
      en: 'Compare common video tools side by side.',
    },
  },
  {
    href: '/guides/ai-image-tools',
    priority: 0.74,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 图像工具推荐',
      en: 'AI image tools',
    },
    desc: {
      cn: '适合生成、修图、设计和创意素材。',
      en: 'For generation, editing, design, and creative assets.',
    },
  },
  {
    href: '/guides/ai-image-tools-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 图像工具对比',
      en: 'AI image tools comparison',
    },
    desc: {
      cn: '把几款常见图像工具放在一起快速对照。',
      en: 'Compare common image tools side by side.',
    },
  },
  {
    href: '/guides/ai-coding-tools',
    priority: 0.74,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 编程工具推荐',
      en: 'AI coding tools',
    },
    desc: {
      cn: '适合代码补全、重构、调试和脚手架。',
      en: 'For completion, refactoring, debugging, and scaffolding.',
    },
  },
  {
    href: '/guides/ai-coding-tools-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 编程工具对比',
      en: 'AI coding tools comparison',
    },
    desc: {
      cn: '把几款常见编程工具放在一起快速对照。',
      en: 'Compare common coding tools side by side.',
    },
  },
  {
    href: '/guides/ai-chatbot-tools',
    priority: 0.74,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 聊天机器人推荐',
      en: 'AI chatbots',
    },
    desc: {
      cn: '适合问答、知识检索、写作和协作。',
      en: 'For Q&A, knowledge retrieval, writing, and collaboration.',
    },
  },
  {
    href: '/guides/ai-chatbot-tools-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 聊天机器人对比',
      en: 'AI chatbot comparison',
    },
    desc: {
      cn: '把几款常见聊天机器人放在一起快速对照。',
      en: 'Compare common chatbots side by side.',
    },
  },
  {
    href: '/guides/ai-productivity-tools',
    priority: 0.72,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 生产力工具推荐',
      en: 'AI productivity tools',
    },
    desc: {
      cn: '适合效率提升、任务管理和知识整理。',
      en: 'For efficiency, task management, and knowledge organization.',
    },
  },
  {
    href: '/guides/ai-tools-for-students',
    priority: 0.72,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 学生工具推荐',
      en: 'AI tools for students',
    },
    desc: {
      cn: '适合学习、作业、总结和笔记协作。',
      en: 'For learning, homework, summaries, and notes collaboration.',
    },
  },
  {
    href: '/guides/ai-tools-for-small-business',
    priority: 0.72,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 小企业工具推荐',
      en: 'AI tools for small business',
    },
    desc: {
      cn: '适合小团队、创业公司和独立商家。',
      en: 'For small teams, startups, and solo businesses.',
    },
  },
  {
    href: '/guides/ai-tools-for-creators',
    priority: 0.73,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 创作者工具推荐',
      en: 'AI tools for creators',
    },
    desc: {
      cn: '适合独立创作者、博主和内容工作流。',
      en: 'For solo creators, bloggers, and content workflows.',
    },
  },
  {
    href: '/guides/ai-tools-for-marketing',
    priority: 0.73,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 营销工具推荐',
      en: 'AI tools for marketing',
    },
    desc: {
      cn: '适合广告、增长、社媒和营销团队。',
      en: 'For ads, growth, social, and marketing teams.',
    },
  },
  {
    href: '/guides/ai-tools-for-agencies',
    priority: 0.73,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 代理与服务团队工具推荐',
      en: 'AI tools for agencies',
    },
    desc: {
      cn: '适合代理商、服务团队和内容工作室。',
      en: 'For agencies, service teams, and content studios.',
    },
  },
  {
    href: '/guides/ai-tools-for-designers',
    priority: 0.73,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 设计师工具推荐',
      en: 'AI tools for designers',
    },
    desc: {
      cn: '适合设计师、品牌和视觉工作流。',
      en: 'For designers, brands, and visual workflows.',
    },
  },
  {
    href: '/guides/ai-tools-for-sales',
    priority: 0.73,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 销售工具推荐',
      en: 'AI tools for sales',
    },
    desc: {
      cn: '适合销售、线索跟进和客户沟通。',
      en: 'For sales, lead follow-up, and customer communication.',
    },
  },
  {
    href: '/guides/ai-tools-for-ecommerce',
    priority: 0.73,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 电商工具推荐',
      en: 'AI tools for ecommerce',
    },
    desc: {
      cn: '适合电商、独立站和商品营销。',
      en: 'For ecommerce, stores, and product marketing.',
    },
  },
  {
    href: '/guides/ai-tools-for-designers-comparison',
    priority: 0.74,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 设计工具对比',
      en: 'AI design tools comparison',
    },
    desc: {
      cn: '把常见设计工具放在一起快速对照。',
      en: 'Compare common design tools side by side.',
    },
  },
  {
    href: '/guides/ai-tools-for-sales-comparison',
    priority: 0.74,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 销售工具对比',
      en: 'AI sales tools comparison',
    },
    desc: {
      cn: '把常见销售工具放在一起快速对照。',
      en: 'Compare common sales tools side by side.',
    },
  },
  {
    href: '/guides/ai-tools-for-ecommerce-comparison',
    priority: 0.74,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 电商工具对比',
      en: 'AI ecommerce tools comparison',
    },
    desc: {
      cn: '把常见电商工具放在一起快速对照。',
      en: 'Compare common ecommerce tools side by side.',
    },
  },
  {
    href: '/guides/ai-tools-for-web3',
    priority: 0.73,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI Web3 工具推荐',
      en: 'AI tools for Web3',
    },
    desc: {
      cn: '适合链上数据、钱包工作流和 Crypto 研究。',
      en: 'For on-chain data, wallet workflows, and crypto research.',
    },
  },
  {
    href: '/guides/ai-tools-for-web3-comparison',
    priority: 0.74,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI Web3 工具对比',
      en: 'AI tools for Web3 comparison',
    },
    desc: {
      cn: '把常见 Web3 工具放在一起快速对照。',
      en: 'Compare common Web3 tools side by side.',
    },
  },
  {
    href: '/guides/ai-tools-for-crypto-research',
    priority: 0.73,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI Crypto 研究工具推荐',
      en: 'AI tools for crypto research',
    },
    desc: {
      cn: '适合代币研究、链上跟踪和市场情报。',
      en: 'For token research, on-chain tracking, and market intelligence.',
    },
  },
  {
    href: '/guides/ai-tools-for-crypto-research-comparison',
    priority: 0.74,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI Crypto 研究工具对比',
      en: 'AI tools for crypto research comparison',
    },
    desc: {
      cn: '把常见 Crypto 研究工具放在一起快速对照。',
      en: 'Compare common crypto research tools side by side.',
    },
  },
  {
    href: '/guides/ai-tools-for-on-chain-analysis',
    priority: 0.73,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 链上分析工具推荐',
      en: 'AI tools for on-chain analysis',
    },
    desc: {
      cn: '适合地址追踪、资金流分析和研究。',
      en: 'For address tracking, fund-flow analysis, and research.',
    },
  },
  {
    href: '/guides/ai-tools-for-on-chain-analysis-comparison',
    priority: 0.74,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 链上分析工具对比',
      en: 'AI tools for on-chain analysis comparison',
    },
    desc: {
      cn: '把常见链上分析工具放在一起快速对照。',
      en: 'Compare common on-chain tools side by side.',
    },
  },
  {
    href: '/guides/ai-tools-for-wallet-monitoring',
    priority: 0.73,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 钱包监控工具推荐',
      en: 'AI tools for wallet monitoring',
    },
    desc: {
      cn: '适合地址提醒、异常观察和风控监控。',
      en: 'For address alerts, anomaly watching, and risk monitoring.',
    },
  },
  {
    href: '/guides/ai-tools-for-wallet-monitoring-comparison',
    priority: 0.74,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 钱包监控工具对比',
      en: 'AI tools for wallet monitoring comparison',
    },
    desc: {
      cn: '把常见钱包监控工具放在一起快速对照。',
      en: 'Compare common wallet tools side by side.',
    },
  },
  {
    href: '/guides/ai-tools-for-defi-analytics',
    priority: 0.73,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI DeFi 分析工具推荐',
      en: 'AI tools for DeFi analytics',
    },
    desc: {
      cn: '适合流动性监测、收益追踪和协议研究。',
      en: 'For liquidity monitoring, yield tracking, and protocol research.',
    },
  },
  {
    href: '/guides/ai-tools-for-defi-analytics-comparison',
    priority: 0.74,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI DeFi 分析工具对比',
      en: 'AI tools for DeFi analytics comparison',
    },
    desc: {
      cn: '把常见 DeFi 分析工具放在一起快速对照。',
      en: 'Compare common DeFi analytics tools side by side.',
    },
  },
  {
    href: '/guides/ai-productivity-tools-comparison',
    priority: 0.74,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 生产力工具对比',
      en: 'AI productivity tools comparison',
    },
    desc: {
      cn: '把常见生产力工具放在一起快速对照。',
      en: 'Compare common productivity tools side by side.',
    },
  },
  {
    href: '/guides/ai-tools-for-students-comparison',
    priority: 0.74,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 学生工具对比',
      en: 'AI tools for students comparison',
    },
    desc: {
      cn: '把常见学生工具放在一起快速对照。',
      en: 'Compare common student tools side by side.',
    },
  },
  {
    href: '/guides/ai-tools-for-small-business-comparison',
    priority: 0.74,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 小企业工具对比',
      en: 'AI tools for small business comparison',
    },
    desc: {
      cn: '把常见小企业工具放在一起快速对照。',
      en: 'Compare common small-business tools side by side.',
    },
  },
];

export const FEATURED_GUIDE_HREFS = [
  '/guides/how-to-choose-ai-tools',
  '/guides/free-ai-tools',
  '/guides/ai-writing-tools',
  '/guides/ai-video-tools',
  '/guides/ai-image-tools',
  '/guides/ai-coding-tools',
  '/guides/ai-chatbot-tools',
  '/guides/ai-tools-for-web3',
  '/guides/ai-tools-for-crypto-research',
  '/guides/ai-tools-for-on-chain-analysis',
  '/guides/ai-tools-for-defi-analytics',
] as const;
