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
    href: '/guides/ai-tools-for-content-creation',
    priority: 0.74,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 内容创作工具推荐',
      en: 'AI tools for content creation',
    },
    desc: {
      cn: '适合脚本、封面、改写、批量发布和多渠道内容。',
      en: 'For scripts, thumbnails, rewriting, batch publishing, and multi-channel content.',
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
    href: '/guides/ai-tools-for-content-creation-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 内容创作工具对比',
      en: 'AI content creation tools comparison',
    },
    desc: {
      cn: '把脚本、封面和内容工作流放在一起快速对照。',
      en: 'Compare scripts, covers, and content workflows side by side.',
    },
  },
  {
    href: '/guides/ai-seo-tools',
    priority: 0.74,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI SEO 工具推荐',
      en: 'AI SEO tools',
    },
    desc: {
      cn: '适合关键词研究、内容优化和排名跟踪。',
      en: 'For keyword research, content optimization, and rank tracking.',
    },
  },
  {
    href: '/guides/seo-tools',
    priority: 0.74,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI SEO 工具推荐',
      en: 'AI seo tools',
    },
    desc: {
      cn: '适合关键词研究、内容优化和排名跟踪。',
      en: 'For keyword research, content optimization, and rank tracking.',
    },
  },
  {
    href: '/guides/ai-seo-tools-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI SEO 工具对比',
      en: 'AI SEO tools comparison',
    },
    desc: {
      cn: '把几款常见 SEO 工具放在一起快速对照。',
      en: 'Compare common SEO tools side by side.',
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
    href: '/guides/video-tools',
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
    href: '/guides/image-tools',
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
    href: '/guides/chatbot-tools',
    priority: 0.74,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 聊天机器人推荐',
      en: 'AI chatbot tools',
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
    href: '/guides/productivity-tools',
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
    href: '/guides/ai-tools-for-customer-support',
    priority: 0.73,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 客服工具推荐',
      en: 'AI tools for customer support',
    },
    desc: {
      cn: '适合回复草稿、知识库问答、分流和客服自动化。',
      en: 'For reply drafts, knowledge-base Q&A, triage, and support automation.',
    },
  },
  {
    href: '/guides/ai-tools-for-customer-support-comparison',
    priority: 0.77,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 客服工具对比',
      en: 'AI customer support tools comparison',
    },
    desc: {
      cn: '把常见客服工作流工具放在一起快速对照。',
      en: 'Compare common customer support workflow tools side by side.',
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
    href: '/guides/ai-tools-for-research',
    priority: 0.75,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 研究工具推荐',
      en: 'AI tools for research',
    },
    desc: {
      cn: '适合资料检索、分析、证据核对和研究工作流。',
      en: 'For discovery, analysis, evidence-checking, and research workflows.',
    },
  },
  {
    href: '/guides/ai-research-tools',
    priority: 0.75,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 研究工具推荐',
      en: 'AI research tools',
    },
    desc: {
      cn: '适合资料检索、分析、证据核对和研究工作流。',
      en: 'For discovery, analysis, evidence-checking, and research workflows.',
    },
  },
  {
    href: '/guides/ai-tools-for-research-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 研究工具对比',
      en: 'AI tools for research comparison',
    },
    desc: {
      cn: '把常见研究工具放在一起快速对照。',
      en: 'Compare common research tools side by side.',
    },
  },
  {
    href: '/guides/ai-research-tools-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 研究工具对比',
      en: 'AI research tools comparison',
    },
    desc: {
      cn: '把常见研究工具放在一起快速对照。',
      en: 'Compare common research tools side by side.',
    },
  },
  {
    href: '/guides/ai-tools-for-developers',
    priority: 0.75,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 开发者工具推荐',
      en: 'AI tools for developers',
    },
    desc: {
      cn: '适合编码、模型接入、调试、自动化和开发工作流。',
      en: 'For coding, model access, debugging, automation, and developer workflows.',
    },
  },
  {
    href: '/guides/ai-tools-for-model-routing',
    priority: 0.77,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 模型路由工具推荐',
      en: 'AI tools for model routing',
    },
    desc: {
      cn: '适合多模型接入、成本控制、回退策略和路由工作流。',
      en: 'For multi-model access, cost control, fallbacks, and routing workflows.',
    },
  },
  {
    href: '/guides/ai-model-routing-tools',
    priority: 0.77,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 模型路由工具推荐',
      en: 'AI model routing tools',
    },
    desc: {
      cn: '适合多模型接入、成本控制、回退策略和路由工作流。',
      en: 'For multi-model access, cost control, fallbacks, and routing workflows.',
    },
  },
  {
    href: '/guides/ai-tools-for-model-routing-comparison',
    priority: 0.78,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 模型路由工具对比',
      en: 'AI tools for model routing comparison',
    },
    desc: {
      cn: '把常见模型路由工具放在一起快速对照。',
      en: 'Compare common model routing tools side by side.',
    },
  },
  {
    href: '/guides/ai-model-routing-tools-comparison',
    priority: 0.78,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 模型路由工具对比',
      en: 'AI model routing tools comparison',
    },
    desc: {
      cn: '把常见模型路由工具放在一起快速对照。',
      en: 'Compare common model routing tools side by side.',
    },
  },
  {
    href: '/guides/ai-tools-for-prompt-testing',
    priority: 0.77,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI Prompt 测试工具推荐',
      en: 'AI tools for prompt testing',
    },
    desc: {
      cn: '适合提示词评估、A/B 测试、版本对比和质量验证。',
      en: 'For prompt evaluation, A/B testing, version comparison, and quality validation.',
    },
  },
  {
    href: '/guides/ai-tools-for-prompt-testing-comparison',
    priority: 0.78,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI Prompt 测试工具对比',
      en: 'AI tools for prompt testing comparison',
    },
    desc: {
      cn: '把常见 prompt 测试工具放在一起快速对照。',
      en: 'Compare common prompt testing tools side by side.',
    },
  },
  {
    href: '/guides/ai-tools-for-evals',
    priority: 0.77,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI Evals 工具推荐',
      en: 'AI tools for evals',
    },
    desc: {
      cn: '适合结果评估、输出质量验证、评分体系和验收流程。',
      en: 'For output evaluation, quality validation, scoring systems, and acceptance workflows.',
    },
  },
  {
    href: '/guides/ai-evals-tools',
    priority: 0.77,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI Evals 工具推荐',
      en: 'AI evals tools',
    },
    desc: {
      cn: '适合结果评估、输出质量验证、评分体系和验收流程。',
      en: 'For output evaluation, quality validation, scoring systems, and acceptance workflows.',
    },
  },
  {
    href: '/guides/ai-tools-for-evals-comparison',
    priority: 0.78,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI Evals 工具对比',
      en: 'AI tools for evals comparison',
    },
    desc: {
      cn: '把常见 evals 工具放在一起快速对照。',
      en: 'Compare common evals tools side by side.',
    },
  },
  {
    href: '/guides/ai-evals-tools-comparison',
    priority: 0.78,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI Evals 工具对比',
      en: 'AI evals tools comparison',
    },
    desc: {
      cn: '把常见 evals 工具放在一起快速对照。',
      en: 'Compare common evals tools side by side.',
    },
  },
  {
    href: '/guides/ai-tools-for-api-observability',
    priority: 0.77,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI API 可观测工具推荐',
      en: 'AI tools for API observability',
    },
    desc: {
      cn: '适合日志、调用监控、成本分析和质量追踪。',
      en: 'For logs, request monitoring, cost analysis, and quality tracking.',
    },
  },
  {
    href: '/guides/ai-api-observability-tools',
    priority: 0.77,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI API 可观测工具推荐',
      en: 'AI API observability tools',
    },
    desc: {
      cn: '适合日志、调用监控、成本分析和质量追踪。',
      en: 'For logs, request monitoring, cost analysis, and quality tracking.',
    },
  },
  {
    href: '/guides/ai-tools-for-api-observability-comparison',
    priority: 0.78,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI API 可观测工具对比',
      en: 'AI tools for API observability comparison',
    },
    desc: {
      cn: '把常见 API 可观测工具放在一起快速对照。',
      en: 'Compare common API observability tools side by side.',
    },
  },
  {
    href: '/guides/ai-api-observability-tools-comparison',
    priority: 0.78,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI API 可观测工具对比',
      en: 'AI API observability tools comparison',
    },
    desc: {
      cn: '把常见 API 可观测工具放在一起快速对照。',
      en: 'Compare common API observability tools side by side.',
    },
  },
  {
    href: '/guides/ai-tools-for-code-review',
    priority: 0.77,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 代码审查工具推荐',
      en: 'AI tools for code review',
    },
    desc: {
      cn: '适合 PR 审查、变更解释、风险检查和代码反馈。',
      en: 'For PR review, change explanation, risk checks, and code feedback.',
    },
  },
  {
    href: '/guides/ai-code-review-tools',
    priority: 0.77,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 代码审查工具推荐',
      en: 'AI code review tools',
    },
    desc: {
      cn: '适合 PR 审查、变更解释、风险检查和代码反馈。',
      en: 'For PR review, change explanation, risk checks, and code feedback.',
    },
  },
  {
    href: '/guides/ai-tools-for-code-review-comparison',
    priority: 0.78,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 代码审查工具对比',
      en: 'AI tools for code review comparison',
    },
    desc: {
      cn: '把常见代码审查工具放在一起快速对照。',
      en: 'Compare common code review tools side by side.',
    },
  },
  {
    href: '/guides/ai-code-review-tools-comparison',
    priority: 0.78,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 代码审查工具对比',
      en: 'AI code review tools comparison',
    },
    desc: {
      cn: '把常见代码审查工具放在一起快速对照。',
      en: 'Compare common code review tools side by side.',
    },
  },
  {
    href: '/guides/ai-tools-for-developers-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 开发者工具对比',
      en: 'AI tools for developers comparison',
    },
    desc: {
      cn: '把常见开发者工具放在一起快速对照。',
      en: 'Compare common developer tools side by side.',
    },
  },
  {
    href: '/guides/ai-tools-for-automation',
    priority: 0.75,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 自动化工具推荐',
      en: 'AI tools for automation',
    },
    desc: {
      cn: '适合流程编排、Agent 工作流和重复任务自动化。',
      en: 'For workflow orchestration, agent workflows, and repeatable automation.',
    },
  },
  {
    href: '/guides/ai-automation-tools',
    priority: 0.75,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 自动化工具推荐',
      en: 'AI automation tools',
    },
    desc: {
      cn: '适合流程编排、Agent 工作流和重复任务自动化。',
      en: 'For workflow orchestration, agent workflows, and repeatable automation.',
    },
  },
  {
    href: '/guides/ai-tools-for-automation-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 自动化工具对比',
      en: 'AI tools for automation comparison',
    },
    desc: {
      cn: '把常见自动化工具放在一起快速对照。',
      en: 'Compare common automation tools side by side.',
    },
  },
  {
    href: '/guides/ai-automation-tools-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 自动化工具对比',
      en: 'AI automation tools comparison',
    },
    desc: {
      cn: '把常见自动化工具放在一起快速对照。',
      en: 'Compare common automation tools side by side.',
    },
  },
  {
    href: '/guides/n8n-alternatives-comparison',
    priority: 0.77,
    changeFrequency: 'weekly',
    title: {
      cn: 'n8n 替代方案对比',
      en: 'n8n alternatives comparison',
    },
    desc: {
      cn: '把常见 n8n 替代项放在一起快速对照。',
      en: 'Compare common n8n alternatives side by side.',
    },
  },
  {
    href: '/guides/ai-tools-for-agents',
    priority: 0.77,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI Agent 工具推荐',
      en: 'AI tools for agents',
    },
    desc: {
      cn: '适合 Agent 工作流、任务编排、工具调用和执行治理。',
      en: 'For agent workflows, task orchestration, tool use, and execution governance.',
    },
  },
  {
    href: '/guides/ai-agent-tools',
    priority: 0.77,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI Agent 工具推荐',
      en: 'AI agent tools',
    },
    desc: {
      cn: '适合 Agent 工作流、任务编排、工具调用和执行治理。',
      en: 'For agent workflows, task orchestration, tool use, and execution governance.',
    },
  },
  {
    href: '/guides/ai-tools-for-agents-comparison',
    priority: 0.78,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI Agent 工具对比',
      en: 'AI tools for agents comparison',
    },
    desc: {
      cn: '把常见 Agent 方向工具放在一起快速对照。',
      en: 'Compare common agent-oriented tools side by side.',
    },
  },
  {
    href: '/guides/ai-agent-tools-comparison',
    priority: 0.78,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI Agent 工具对比',
      en: 'AI agent tools comparison',
    },
    desc: {
      cn: '把常见 Agent 方向工具放在一起快速对照。',
      en: 'Compare common agent-oriented tools side by side.',
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
    href: '/guides/ai-marketing-tools',
    priority: 0.73,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 营销工具推荐',
      en: 'AI marketing tools',
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
    href: '/guides/ai-sales-tools',
    priority: 0.73,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 销售工具推荐',
      en: 'AI sales tools',
    },
    desc: {
      cn: '适合销售、线索跟进和客户沟通。',
      en: 'For sales, lead follow-up, and customer communication.',
    },
  },
  {
    href: '/guides/ai-tools-for-lead-generation',
    priority: 0.77,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 获客工具推荐',
      en: 'AI tools for lead generation',
    },
    desc: {
      cn: '适合线索发现、名单整理、补全和初步筛选。',
      en: 'For lead discovery, list building, enrichment, and early qualification.',
    },
  },
  {
    href: '/guides/ai-tools-for-sales-prospecting',
    priority: 0.77,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 销售拓客工具推荐',
      en: 'AI tools for sales prospecting',
    },
    desc: {
      cn: '适合外联准备、个性化触达和 prospecting 工作流。',
      en: 'For outreach prep, personalization, and sales prospecting workflows.',
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
    href: '/guides/ai-tools-for-lead-generation-comparison',
    priority: 0.78,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 获客工具对比',
      en: 'AI lead generation tools comparison',
    },
    desc: {
      cn: '把常见获客工具放在一起快速对照。',
      en: 'Compare common lead-generation tools side by side.',
    },
  },
  {
    href: '/guides/ai-tools-for-sales-prospecting-comparison',
    priority: 0.78,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 销售拓客工具对比',
      en: 'AI sales prospecting tools comparison',
    },
    desc: {
      cn: '把常见销售拓客工具放在一起快速对照。',
      en: 'Compare common sales prospecting tools side by side.',
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
    href: '/guides/ai-web3-tools',
    priority: 0.73,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI Web3 工具推荐',
      en: 'AI web3 tools',
    },
    desc: {
      cn: '适合链上数据、钱包工作流和 Crypto 研究。',
      en: 'For on-chain data, wallet workflows, and crypto research.',
    },
  },
  {
    href: '/guides/ai-tools-for-web3-analysis',
    priority: 0.75,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI Web3 分析工具推荐',
      en: 'AI tools for Web3 analysis',
    },
    desc: {
      cn: '适合链上分析、协议观察、DeFi 研究和钱包监控。',
      en: 'For on-chain analysis, protocol monitoring, DeFi research, and wallet tracking.',
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
    href: '/guides/ai-web3-tools-comparison',
    priority: 0.74,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI Web3 工具对比',
      en: 'AI web3 tools comparison',
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
    href: '/guides/ai-tools-for-token-research',
    priority: 0.78,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 代币研究工具推荐',
      en: 'AI tools for token research',
    },
    desc: {
      cn: '适合代币观察、项目比较、叙事整理和基本面研究。',
      en: 'For token watching, project comparison, narrative synthesis, and fundamentals research.',
    },
  },
  {
    href: '/guides/ai-tools-for-token-research-comparison',
    priority: 0.79,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 代币研究工具对比',
      en: 'AI token research tools comparison',
    },
    desc: {
      cn: '把常见代币研究工具放在一起快速对照。',
      en: 'Compare common token-research tools side by side.',
    },
  },
  {
    href: '/guides/ai-tools-for-wallet-research',
    priority: 0.74,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 钱包研究工具推荐',
      en: 'AI tools for wallet research',
    },
    desc: {
      cn: '适合地址研究、钱包画像、行为判断和链上线索分析。',
      en: 'For address research, wallet profiling, behavior analysis, and on-chain clue discovery.',
    },
  },
  {
    href: '/guides/ai-tools-for-wallet-research-comparison',
    priority: 0.75,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 钱包研究工具对比',
      en: 'AI tools for wallet research comparison',
    },
    desc: {
      cn: '把常见钱包研究工具放在一起快速对照。',
      en: 'Compare common wallet research tools side by side.',
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
    href: '/guides/ai-tools-for-crypto-portfolio-tracking',
    priority: 0.74,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI Crypto 资产追踪工具推荐',
      en: 'AI tools for crypto portfolio tracking',
    },
    desc: {
      cn: '适合资产看板、持仓跟踪、钱包归集和组合观察。',
      en: 'For portfolio dashboards, holdings tracking, wallet rollups, and allocation monitoring.',
    },
  },
  {
    href: '/guides/ai-tools-for-crypto-portfolio-tracking-comparison',
    priority: 0.75,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI Crypto 资产追踪工具对比',
      en: 'AI tools for crypto portfolio tracking comparison',
    },
    desc: {
      cn: '把常见 Crypto 资产追踪工具放在一起快速对照。',
      en: 'Compare common crypto portfolio tracking tools side by side.',
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
    href: '/guides/ai-tools-for-dex-analytics',
    priority: 0.73,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI DEX 分析工具推荐',
      en: 'AI tools for DEX analytics',
    },
    desc: {
      cn: '适合交易对分析、流动性观察和 DEX 研究。',
      en: 'For pair analysis, liquidity observation, and DEX research.',
    },
  },
  {
    href: '/guides/ai-tools-for-dex-analytics-comparison',
    priority: 0.74,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI DEX 分析工具对比',
      en: 'AI tools for DEX analytics comparison',
    },
    desc: {
      cn: '把常见 DEX 分析工具放在一起快速对照。',
      en: 'Compare common DEX analytics tools side by side.',
    },
  },
  {
    href: '/guides/ai-tools-for-protocol-analytics',
    priority: 0.73,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 协议分析工具推荐',
      en: 'AI tools for protocol analytics',
    },
    desc: {
      cn: '适合协议健康观察、使用量分析和研究。',
      en: 'For protocol health monitoring, usage analysis, and research.',
    },
  },
  {
    href: '/guides/ai-tools-for-protocol-analytics-comparison',
    priority: 0.74,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 协议分析工具对比',
      en: 'AI tools for protocol analytics comparison',
    },
    desc: {
      cn: '把常见协议分析工具放在一起快速对照。',
      en: 'Compare common protocol analytics tools side by side.',
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
    href: '/guides/ai-tools-for-meeting-notes',
    priority: 0.74,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 会议纪要工具推荐',
      en: 'AI tools for meeting notes',
    },
    desc: {
      cn: '适合会议记录、纪要整理和行动项提取。',
      en: 'For meeting transcription, note taking, and action-item extraction.',
    },
  },
  {
    href: '/guides/ai-tools-for-meeting-notes-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 会议纪要工具对比',
      en: 'AI tools for meeting notes comparison',
    },
    desc: {
      cn: '把几款常见会议纪要工具放在一起快速对照。',
      en: 'Compare common meeting notes tools side by side.',
    },
  },
  {
    href: '/guides/ai-note-taking-tools',
    priority: 0.74,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 记笔记工具推荐',
      en: 'AI note taking tools',
    },
    desc: {
      cn: '适合记笔记、会议助手和信息整理。',
      en: 'For note taking, meeting assistants, and information organization.',
    },
  },
  {
    href: '/guides/note-taking-tools',
    priority: 0.74,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 记笔记工具推荐',
      en: 'AI note taking tools',
    },
    desc: {
      cn: '适合记笔记、会议助手和信息整理。',
      en: 'For note taking, meeting assistants, and information organization.',
    },
  },
  {
    href: '/guides/ai-note-taking-tools-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 记笔记工具对比',
      en: 'AI note taking tools comparison',
    },
    desc: {
      cn: '把几款常见记笔记工具放在一起快速对照。',
      en: 'Compare common note taking tools side by side.',
    },
  },
  {
    href: '/guides/ai-marketing-tools-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 营销工具对比',
      en: 'AI marketing tools comparison',
    },
    desc: {
      cn: '把几款常见营销工具放在一起快速对照。',
      en: 'Compare common marketing tools side by side.',
    },
  },
  {
    href: '/guides/ai-sales-tools-comparison',
    priority: 0.74,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 销售工具对比',
      en: 'AI sales tools comparison',
    },
    desc: {
      cn: '把几款常见销售工具放在一起快速对照。',
      en: 'Compare common sales tools side by side.',
    },
  },
  {
    href: '/guides/ai-tools-for-voice',
    priority: 0.74,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 语音工具推荐',
      en: 'AI voice tools',
    },
    desc: {
      cn: '适合语音合成、转写、配音和对话助手。',
      en: 'For voice synthesis, transcription, dubbing, and conversational assistants.',
    },
  },
  {
    href: '/guides/ai-tools-for-voice-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 语音工具对比',
      en: 'AI voice tools comparison',
    },
    desc: {
      cn: '把几款常见语音工具放在一起快速对照。',
      en: 'Compare common voice tools side by side.',
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
  {
    href: '/guides/ai-tools-for-agencies-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 代理与服务团队工具对比',
      en: 'AI tools for agencies comparison',
    },
    desc: {
      cn: '把代理交付、客户协作和内容生产工具放在一起快速对照。',
      en: 'Compare agency delivery, client collaboration, and content production tools side by side.',
    },
  },
  {
    href: '/guides/ai-tools-for-creators-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI 创作者工具对比',
      en: 'AI tools for creators comparison',
    },
    desc: {
      cn: '把创作、再包装和发布工具放在一起快速对照。',
      en: 'Compare tools for creation, repurposing, and publishing side by side.',
    },
  },
  {
    href: '/guides/adobe-alternatives-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'Adobe 替代方案对比',
      en: 'Adobe alternatives comparison',
    },
    desc: {
      cn: '把常见 Adobe 替代工具放在一起快速对照。',
      en: 'Compare common Adobe alternatives side by side.',
    },
  },
  {
    href: '/guides/character-ai-alternatives-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'Character AI 替代方案对比',
      en: 'Character AI alternatives comparison',
    },
    desc: {
      cn: '把常见 Character AI 替代工具放在一起快速对照。',
      en: 'Compare common Character AI alternatives side by side.',
    },
  },
  {
    href: '/guides/chatgpt-alternatives-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'ChatGPT 替代方案对比',
      en: 'ChatGPT alternatives comparison',
    },
    desc: {
      cn: '把常见 ChatGPT 替代工具放在一起快速对照。',
      en: 'Compare common ChatGPT alternatives side by side.',
    },
  },
  {
    href: '/guides/claude-alternatives-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'Claude 替代方案对比',
      en: 'Claude alternatives comparison',
    },
    desc: {
      cn: '把常见 Claude 替代工具放在一起快速对照。',
      en: 'Compare common Claude alternatives side by side.',
    },
  },
  {
    href: '/guides/copy-ai-alternatives-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'Copy.ai 替代方案对比',
      en: 'Copy.ai alternatives comparison',
    },
    desc: {
      cn: '把常见 Copy.ai 替代工具放在一起快速对照。',
      en: 'Compare common Copy.ai alternatives side by side.',
    },
  },
  {
    href: '/guides/cursor-alternatives-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'Cursor 替代方案对比',
      en: 'Cursor alternatives comparison',
    },
    desc: {
      cn: '把常见 Cursor 替代工具放在一起快速对照。',
      en: 'Compare common Cursor alternatives side by side.',
    },
  },
  {
    href: '/guides/descript-alternatives-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'Descript 替代方案对比',
      en: 'Descript alternatives comparison',
    },
    desc: {
      cn: '把常见 Descript 替代工具放在一起快速对照。',
      en: 'Compare common Descript alternatives side by side.',
    },
  },
  {
    href: '/guides/elevenlabs-alternatives-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'ElevenLabs 替代方案对比',
      en: 'ElevenLabs alternatives comparison',
    },
    desc: {
      cn: '把常见 ElevenLabs 替代工具放在一起快速对照。',
      en: 'Compare common ElevenLabs alternatives side by side.',
    },
  },
  {
    href: '/guides/gemini-alternatives-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'Gemini 替代方案对比',
      en: 'Gemini alternatives comparison',
    },
    desc: {
      cn: '把常见 Gemini 替代工具放在一起快速对照。',
      en: 'Compare common Gemini alternatives side by side.',
    },
  },
  {
    href: '/guides/grammarly-alternatives-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'Grammarly 替代方案对比',
      en: 'Grammarly alternatives comparison',
    },
    desc: {
      cn: '把常见 Grammarly 替代工具放在一起快速对照。',
      en: 'Compare common Grammarly alternatives side by side.',
    },
  },
  {
    href: '/guides/hubspot-alternatives-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'HubSpot 替代方案对比',
      en: 'HubSpot alternatives comparison',
    },
    desc: {
      cn: '把常见 HubSpot 替代工具放在一起快速对照。',
      en: 'Compare common HubSpot alternatives side by side.',
    },
  },
  {
    href: '/guides/jasper-alternatives-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'Jasper 替代方案对比',
      en: 'Jasper alternatives comparison',
    },
    desc: {
      cn: '把常见 Jasper 替代工具放在一起快速对照。',
      en: 'Compare common Jasper alternatives side by side.',
    },
  },
  {
    href: '/guides/mailchimp-alternatives-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'Mailchimp 替代方案对比',
      en: 'Mailchimp alternatives comparison',
    },
    desc: {
      cn: '把常见 Mailchimp 替代工具放在一起快速对照。',
      en: 'Compare common Mailchimp alternatives side by side.',
    },
  },
  {
    href: '/guides/make-alternatives-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'Make 替代方案对比',
      en: 'Make alternatives comparison',
    },
    desc: {
      cn: '把常见 Make 替代工具放在一起快速对照。',
      en: 'Compare common Make alternatives side by side.',
    },
  },
  {
    href: '/guides/notion-alternatives-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'Notion 替代方案对比',
      en: 'Notion alternatives comparison',
    },
    desc: {
      cn: '把常见 Notion 替代工具放在一起快速对照。',
      en: 'Compare common Notion alternatives side by side.',
    },
  },
  {
    href: '/guides/notta-alternatives-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'Notta 替代方案对比',
      en: 'Notta alternatives comparison',
    },
    desc: {
      cn: '把常见 Notta 替代工具放在一起快速对照。',
      en: 'Compare common Notta alternatives side by side.',
    },
  },
  {
    href: '/guides/perplexity-alternatives-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'Perplexity 替代方案对比',
      en: 'Perplexity alternatives comparison',
    },
    desc: {
      cn: '把常见 Perplexity 替代工具放在一起快速对照。',
      en: 'Compare common Perplexity alternatives side by side.',
    },
  },
  {
    href: '/guides/poe-alternatives-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'Poe 替代方案对比',
      en: 'Poe alternatives comparison',
    },
    desc: {
      cn: '把常见 Poe 替代工具放在一起快速对照。',
      en: 'Compare common Poe alternatives side by side.',
    },
  },
  {
    href: '/guides/salesforce-einstein-alternatives-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'Salesforce Einstein 替代方案对比',
      en: 'Salesforce Einstein alternatives comparison',
    },
    desc: {
      cn: '把常见 Salesforce Einstein 替代工具放在一起快速对照。',
      en: 'Compare common Salesforce Einstein alternatives side by side.',
    },
  },
  {
    href: '/guides/sora-alternatives-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'Sora 替代方案对比',
      en: 'Sora alternatives comparison',
    },
    desc: {
      cn: '把常见 Sora 替代工具放在一起快速对照。',
      en: 'Compare common Sora alternatives side by side.',
    },
  },
  {
    href: '/guides/suno-alternatives-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'Suno 替代方案对比',
      en: 'Suno alternatives comparison',
    },
    desc: {
      cn: '把常见 Suno 替代工具放在一起快速对照。',
      en: 'Compare common Suno alternatives side by side.',
    },
  },
  {
    href: '/guides/zapier-alternatives-comparison',
    priority: 0.76,
    changeFrequency: 'weekly',
    title: {
      cn: 'Zapier 替代方案对比',
      en: 'Zapier alternatives comparison',
    },
    desc: {
      cn: '把常见 Zapier 替代工具放在一起快速对照。',
      en: 'Compare common Zapier alternatives side by side.',
    },
  },
  {
    href: '/guides/writing-tools',
    priority: 0.74,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 写作工具推荐',
      en: 'AI writing tools',
    },
    desc: {
      cn: '适合写作、改写、内容生成和文案工作流。',
      en: 'For writing, rewriting, content generation, and copy workflows.',
    },
  },
  {
    href: '/guides/developer-tools',
    priority: 0.75,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 开发者工具推荐',
      en: 'AI developer tools',
    },
    desc: {
      cn: '适合编码、调试、自动化和开发工作流。',
      en: 'For coding, debugging, automation, and developer workflows.',
    },
  },
  {
    href: '/guides/research-tools',
    priority: 0.75,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 研究工具推荐',
      en: 'AI research tools',
    },
    desc: {
      cn: '适合资料检索、分析、证据核对和研究工作流。',
      en: 'For discovery, analysis, evidence-checking, and research workflows.',
    },
  },
  {
    href: '/guides/marketing-tools',
    priority: 0.73,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 营销工具推荐',
      en: 'AI marketing tools',
    },
    desc: {
      cn: '适合广告、增长、社媒和营销团队。',
      en: 'For ads, growth, social, and marketing teams.',
    },
  },
  {
    href: '/guides/sales-tools',
    priority: 0.73,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 销售工具推荐',
      en: 'AI sales tools',
    },
    desc: {
      cn: '适合销售、线索跟进和客户沟通。',
      en: 'For sales, lead follow-up, and customer communication.',
    },
  },
  {
    href: '/guides/voice-tools',
    priority: 0.74,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 语音工具推荐',
      en: 'AI voice tools',
    },
    desc: {
      cn: '适合语音合成、转写、配音和对话助手。',
      en: 'For voice synthesis, transcription, dubbing, and conversational assistants.',
    },
  },
  {
    href: '/guides/automation-tools',
    priority: 0.75,
    changeFrequency: 'monthly',
    title: {
      cn: 'AI 自动化工具推荐',
      en: 'AI automation tools',
    },
    desc: {
      cn: '适合流程编排、Agent 工作流和重复任务自动化。',
      en: 'For workflow orchestration, agent workflows, and repeatable automation.',
    },
  },
  {
    href: '/guides/agent-tools',
    priority: 0.77,
    changeFrequency: 'weekly',
    title: {
      cn: 'AI Agent 工具推荐',
      en: 'AI agent tools',
    },
    desc: {
      cn: '适合 Agent 工作流、任务编排、工具调用和执行治理。',
      en: 'For agent workflows, task orchestration, tool use, and execution governance.',
    },
  },
];

export const FEATURED_GUIDE_HREFS = [
  '/guides/how-to-choose-ai-tools',
  '/guides/free-ai-tools',
  '/guides/ai-writing-tools',
  '/guides/ai-tools-for-content-creation',
  '/guides/ai-tools-for-content-creation-comparison',
  '/guides/chatgpt-alternatives-comparison',
  '/guides/claude-alternatives-comparison',
  '/guides/cursor-alternatives-comparison',
  '/guides/gemini-alternatives-comparison',
  '/guides/perplexity-alternatives-comparison',
  '/guides/poe-alternatives-comparison',
  '/guides/adobe-alternatives-comparison',
  '/guides/notion-alternatives-comparison',
  '/guides/grammarly-alternatives-comparison',
  '/guides/jasper-alternatives-comparison',
  '/guides/mailchimp-alternatives-comparison',
  '/guides/hubspot-alternatives-comparison',
  '/guides/copy-ai-alternatives-comparison',
  '/guides/descript-alternatives-comparison',
  '/guides/elevenlabs-alternatives-comparison',
  '/guides/sora-alternatives-comparison',
  '/guides/suno-alternatives-comparison',
  '/guides/zapier-alternatives-comparison',
  '/guides/make-alternatives-comparison',
  '/guides/n8n-alternatives-comparison',
  '/guides/ai-tools-for-research',
  '/guides/ai-tools-for-developers',
  '/guides/ai-tools-for-agents',
  '/guides/ai-agent-tools',
  '/guides/ai-tools-for-automation',
  '/guides/ai-automation-tools',
  '/guides/ai-tools-for-agents-comparison',
  '/guides/ai-agent-tools-comparison',
  '/guides/ai-tools-for-automation-comparison',
  '/guides/ai-automation-tools-comparison',
  '/guides/ai-tools-for-sales',
  '/guides/ai-sales-tools',
  '/guides/ai-tools-for-lead-generation',
  '/guides/ai-tools-for-sales-comparison',
  '/guides/ai-sales-tools-comparison',
  '/guides/ai-tools-for-lead-generation-comparison',
  '/guides/ai-tools-for-customer-support',
  '/guides/ai-tools-for-customer-support-comparison',
  '/guides/ai-tools-for-code-review',
  '/guides/ai-tools-for-prompt-testing',
  '/guides/ai-tools-for-evals',
  '/guides/ai-tools-for-prompt-testing-comparison',
  '/guides/ai-tools-for-evals-comparison',
  '/guides/ai-video-tools',
  '/guides/ai-image-tools',
  '/guides/ai-coding-tools',
  '/guides/ai-chatbot-tools',
  '/guides/ai-seo-tools',
  '/guides/ai-tools-for-meeting-notes',
  '/guides/ai-tools-for-marketing',
  '/guides/ai-marketing-tools',
  '/guides/ai-tools-for-marketing-comparison',
  '/guides/ai-marketing-tools-comparison',
  '/guides/ai-tools-for-voice',
  '/guides/ai-note-taking-tools',
  '/guides/ai-tools-for-voice-comparison',
  '/guides/ai-tools-for-web3',
  '/guides/ai-tools-for-web3-analysis',
  '/guides/ai-tools-for-crypto-research',
  '/guides/ai-tools-for-token-research',
  '/guides/ai-tools-for-wallet-research',
  '/guides/ai-tools-for-crypto-portfolio-tracking',
  '/guides/ai-tools-for-on-chain-analysis',
  '/guides/ai-tools-for-defi-analytics',
  '/guides/chatgpt-alternatives-comparison',
  '/guides/claude-alternatives-comparison',
  '/guides/cursor-alternatives-comparison',
] as const;
