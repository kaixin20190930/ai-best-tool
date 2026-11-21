export type ReviewedToolRelationshipType = 'alternative' | 'complements' | 'overlaps' | 'replaces';

export interface ReviewedToolRelationshipDefinition {
  rationale: { cn: string; en: string };
  relatedToolSlug: string;
  relationshipType: ReviewedToolRelationshipType;
  reviewedAt: string;
  reviewDueAt: string;
}

const REVIEWED_AT = '2026-09-02';
const REVIEW_DUE_AT = '2026-12-01';

function relationship(
  relatedToolSlug: string,
  relationshipType: ReviewedToolRelationshipType,
  rationale: ReviewedToolRelationshipDefinition['rationale'],
): ReviewedToolRelationshipDefinition {
  return {
    rationale,
    relatedToolSlug,
    relationshipType,
    reviewedAt: REVIEWED_AT,
    reviewDueAt: REVIEW_DUE_AT,
  };
}

// This is an editorial allowlist, not an algorithmic recommendation feed.
// Additions require a directional rationale and a scheduled review.
export const REVIEWED_TOOL_RELATIONSHIPS: Record<string, ReviewedToolRelationshipDefinition[]> = {
  // Decision paths for the published Bardeen page; no new Tool or index release.
  // Sources and scope: BARDEEN_CONDITIONAL_COMPARISON_2026-11-17_CN.md.
  bardeen: [
    {
      relatedToolSlug: 'make',
      relationshipType: 'overlaps',
      reviewedAt: '2026-11-17',
      reviewDueAt: '2026-11-19',
      rationale: {
        cn: '线索研究后还需在可视化 scenario 中编排跨应用步骤、追查执行历史时比较 Make；重点是网页线索采集、AI 筛选和信息补全导出时继续评估 Bardeen。两者都有 AI，先用同一任务核对连接器动作、数据访问权限、失败处理和实际用量；未实测成本、可靠性或关闭浏览器后的执行。',
        en: 'Compare Make when lead research must continue through visual cross-app scenarios and execution history; evaluate Bardeen when web lead sourcing, AI qualification, and enriched exports are the focus. Both offer AI. Pilot the same task to check connector actions, data access, failure handling, and actual usage; cost, reliability, and execution with the browser closed have not been tested.',
      },
    },
    {
      relatedToolSlug: 'gumloop',
      relationshipType: 'overlaps',
      reviewedAt: '2026-11-17',
      reviewDueAt: '2026-11-19',
      rationale: {
        cn: '研究及后续操作跨越多个应用、需要让 Agent 选择连接器工具并配置逐工具审批时比较 Gumloop；重点是网页线索采集、筛选和补全导出时继续评估 Bardeen。两者都有 AI 和 Agent 能力，先核对数据来源权限、连接账号、写入审批和实际用量；没有实测准确率或无人值守可靠性。',
        en: 'Compare Gumloop when research and follow-up span apps and you need an agent to choose connector tools with per-tool approval settings; evaluate Bardeen for web lead sourcing, qualification, and enriched exports. Both offer AI and agent capabilities. Check source permissions, connected accounts, write approvals, and actual usage on the same task; accuracy and unattended reliability have not been tested.',
      },
    },
  ],
  // Decision paths for the published Zapier page; no new Tool or index release.
  // Sources and scope: ZAPIER_CONDITIONAL_COMPARISON_2026-11-14_CN.md.
  zapier: [
    {
      relatedToolSlug: 'make',
      relationshipType: 'overlaps',
      reviewedAt: '2026-11-21',
      reviewDueAt: '2026-11-27',
      rationale: {
        cn: '重视 scenario 画布及流程和 AI Agent 的运行级积分历史时比较 Make。Zapier 也有分支、AI 和运行记录；其 Next Gen 计费指南说明逐运行任务数尚不可查，平台外 SDK 只有账号总量、没有逐脚本明细，不能把 Classic 的用量可见性直接套用。先确认版本及 12 月 1 日计费转换，再用同一流程核对连接器、失败恢复和实际费用；未实测成本或可靠性。',
        en: 'Compare Make when a scenario canvas and run-level credit history for scenarios and AI agents matter. Zapier also offers branching, AI, and run records; its Next Gen billing guide says per-run task counts are not yet available, while external SDK usage has an account total rather than a per-script breakdown. Do not assume Classic usage visibility carries over. Confirm the version and December 1 billing transition, then pilot the same workflow to check connectors, failure recovery, and actual charges; cost and reliability have not been tested.',
      },
    },
    {
      relatedToolSlug: 'activepieces',
      relationshipType: 'overlaps',
      reviewedAt: '2026-11-21',
      reviewDueAt: '2026-11-27',
      rationale: {
        cn: '必须在自己的基础设施运行工作流时比较 Activepieces，先核对版本、许可及数据库、队列、升级和备份责任；不愿自管时可继续评估托管 Zapier，Activepieces 也有托管云。两者都有流程与 AI/Agent，自托管核心不代表全部付费功能免费；免费积分刷新和 API/MCP 资格的官方表述仍有冲突，不按未确认权益选型。用同一任务核对连接器权限、人工审核及平台和模型费用，未实测运维或可靠性。',
        en: 'Compare Activepieces when workflows must run on your infrastructure, checking edition, license, and ownership of databases, queues, upgrades, and backups. Evaluate managed Zapier if you do not want to operate it; Activepieces also offers managed cloud. Both have workflows and AI/agents, and a self-hosted core does not include every paid feature. Official Free-credit reset and API/MCP eligibility descriptions still conflict, so do not select it on unconfirmed entitlements. Pilot the same task to check connector permissions, human review, and platform and model charges; operations and reliability have not been tested.',
      },
    },
  ],
  // Directional comparisons for the existing public Activepieces page; no index release.
  // Original scope: AUTOMATION_CONDITIONAL_COMPARISON_2026-11-12_CN.md.
  // Due review: AUTOMATION_DUE_REVIEW_2026-11-19_CN.md; shared AI/agent capabilities are not exclusive.
  activepieces: [
    {
      relatedToolSlug: 'make',
      relationshipType: 'overlaps',
      reviewedAt: '2026-11-19',
      reviewDueAt: '2026-11-26',
      rationale: {
        cn: '偏好 Make 的托管 scenario 画布与运行级用量历史时比较 Make；必须自行托管时，先核对 Activepieces 的版本范围和运维责任。两者都有流程、AI/Agent 与执行记录，不能把这些当成独有优势。用同一流程核对连接器、人工审核、平台积分及模型费用；未实测成本或可靠性。',
        en: 'Compare Make if you prefer its managed scenario canvas and run-level usage history. If self-hosting is required, check the Activepieces edition and operations ownership first. Both offer workflows, AI/agents, and execution records; these are not exclusive advantages. Pilot the same workflow to check connectors, human review, platform credits, and model charges. Cost and reliability have not been tested.',
      },
    },
    {
      relatedToolSlug: 'gumloop',
      relationshipType: 'overlaps',
      reviewedAt: '2026-11-19',
      reviewDueAt: '2026-11-26',
      rationale: {
        cn: '需要按连接器区分读取与写入/删除、配置逐工具允许/询问/拒绝规则时比较 Gumloop；偏好先明确触发、分支、循环及关键审批点时评估 Activepieces 流程。两者都有 Agent 与人工审批，不是能力二选一。用同一任务核对连接账号、审批预设及平台和模型用量；配置审批不等于无人监督保证。',
        en: 'Compare Gumloop when you need connector read versus write/delete approval presets and per-tool allow/ask/deny rules; evaluate Activepieces flows when you prefer explicit triggers, branches, loops, and key approval points. Both offer agents and human approvals, not mutually exclusive capabilities. Pilot the same task to check connected accounts, approval presets, and platform and model usage; configured approval does not guarantee safe unattended work.',
      },
    },
  ],
  // Due directional review Nov19: GUMLOOP_CONDITIONAL_COMPARISON_2026-11-12_CN.md.
  gumloop: [
    {
      relatedToolSlug: 'make',
      relationshipType: 'overlaps',
      reviewedAt: '2026-11-19',
      reviewDueAt: '2026-11-26',
      rationale: {
        cn: '偏好用 scenario 模块画布检查跨应用步骤和运行级用量历史时比较 Make；需要按连接器配置读取与写入/删除审批预设、逐工具允许/询问/拒绝规则时评估 Gumloop。两者都有流程与 AI/Agent，不是固定流程和 Agent 的二选一。用同一任务核对连接账号、写入审批、失败恢复及平台和模型用量；未实测成本或可靠性。',
        en: 'Compare Make if you prefer a scenario module canvas for cross-app steps and run-level usage history; evaluate Gumloop for connector read versus write/delete approval presets and per-tool allow/ask/deny rules. Both offer workflows and AI/agents, not a choice between fixed flows and agents. Pilot the same task to check connected accounts, write approvals, failure recovery, and platform and model usage; cost and reliability have not been tested.',
      },
    },
    {
      relatedToolSlug: 'lindy',
      relationshipType: 'overlaps',
      reviewedAt: '2026-11-19',
      reviewDueAt: '2026-11-26',
      rationale: {
        cn: '希望在团队频道或私聊委派研究、跟进和定时例行任务时比较 Lindy；偏好明确设置连接器账号及逐工具允许/询问/拒绝规则时评估 Gumloop。两者都有 Agent 和审批，配置粒度及工作入口是比较维度，不是独有能力。用同一任务核对外部写入审批、活跃付费席位、共享 credits 和重任务暂停；试用及审批设置不等于长期免费、固定成本或无人监督保证。',
        en: 'Compare Lindy for research, follow-up, and scheduled routines delegated in team channels or DMs; evaluate Gumloop if explicit connector accounts and per-tool allow/ask/deny rules are your preference. Both offer agents and approvals; control granularity and the work entry point are comparison dimensions, not exclusive capabilities. Pilot the same task to check external-write approvals, active paid seats, pooled credits, and heavy-task pauses; a trial or approval configuration does not guarantee ongoing free use, fixed cost, or safe unattended work.',
      },
    },
  ],
  // Automation support pages can advance during the main n8n/comparison cooldown.
  // Official sources and rationale are recorded in PRODUCT_GROWTH_OPERATIONS_ACCEPTANCE_2026-11-12_CN.md.
  lindy: [
    {
      relatedToolSlug: 'n8n',
      relationshipType: 'overlaps',
      reviewedAt: '2026-11-12',
      reviewDueAt: '2026-11-26',
      rationale: {
        cn: '需要自行托管并维护工作流时比较 n8n；偏向委派团队任务时再评估 Lindy。先用相同任务核对集成、人工审核和运行成本。',
        en: 'Compare n8n when you need to host and maintain workflows yourself; evaluate Lindy for delegated team tasks. Pilot the same task to check integrations, human review, and running cost.',
      },
    },
    {
      relatedToolSlug: 'make',
      relationshipType: 'overlaps',
      reviewedAt: '2026-11-12',
      reviewDueAt: '2026-11-26',
      rationale: {
        cn: '需要在可视化画布定义步骤和查看执行历史时比较 Make；需要委派团队任务时再评估 Lindy。两者都有 AI 能力，先核对控制方式和实际用量。',
        en: 'Compare Make for defining steps on a visual canvas and inspecting execution history; evaluate Lindy for delegated team tasks. Both offer AI capabilities, so check control and actual usage on one task.',
      },
    },
  ],
  make: [
    {
      relatedToolSlug: 'n8n',
      relationshipType: 'overlaps',
      reviewedAt: '2026-11-12',
      reviewDueAt: '2026-11-26',
      rationale: {
        cn: '需要自行托管时比较 n8n，并计入部署和维护责任；留在 Make 时核对可视化流程、执行历史及所需集成。不要只按标价选择。',
        en: 'Compare n8n when self-hosting is required, including deployment and maintenance work; for Make, check visual workflows, execution history, and required integrations. Do not choose on list price alone.',
      },
    },
    {
      relatedToolSlug: 'lindy',
      relationshipType: 'overlaps',
      reviewedAt: '2026-11-12',
      reviewDueAt: '2026-11-26',
      rationale: {
        cn: '偏向委派团队任务时比较 Lindy；需要在画布定义流程和查看执行历史时评估 Make。先核对人工审核、连接权限和同一任务的用量。',
        en: 'Compare Lindy for delegated team tasks; evaluate Make for defining workflows on a canvas and inspecting run history. Check human review, connection permissions, and usage on the same task.',
      },
    },
  ],
  claude: [
    relationship('gemini', 'alternative', {
      cn: '两者都覆盖通用知识工作；优先比较生态集成、上下文工作流和数据边界。',
      en: 'Both cover general knowledge work; compare ecosystem integration, context workflow, and data boundaries.',
    }),
    relationship('gpt_4o', 'alternative', {
      cn: '两者都可处理多步骤文本与多模态任务；重点比较模型访问方式、额度和工具调用。',
      en: 'Both support multi-step text and multimodal work; compare model access, usage limits, and tool calling.',
    }),
    relationship('poe', 'overlaps', {
      cn: 'Poe 提供多模型入口而 Claude 是直接产品体验；适合比较模型选择自由度与原生功能。',
      en: 'Poe offers a multi-model gateway while Claude is a direct product experience; compare model choice with native features.',
    }),
  ],
  gemini: [
    relationship('claude', 'alternative', {
      cn: '两者都适合研究、写作和复杂问答；重点比较 Google 生态、长上下文和数据设置。',
      en: 'Both fit research, writing, and complex questions; compare Google integration, long context, and data controls.',
    }),
    relationship('gpt_4o', 'alternative', {
      cn: '两者都覆盖多模态助手场景；应比较输入类型、应用生态、额度与实际响应质量。',
      en: 'Both cover multimodal assistant workflows; compare input modes, app ecosystem, limits, and real response quality.',
    }),
    relationship('chatgpt-mac', 'overlaps', {
      cn: '两者都能承担桌面知识助手任务，但系统集成和工作流入口不同。',
      en: 'Both can serve as desktop knowledge assistants, but their system integration and workflow entry points differ.',
    }),
  ],
  gpt_4o: [
    relationship('claude', 'alternative', {
      cn: '两者都可完成通用推理与内容任务；重点核验上下文、工具、额度和隐私条件。',
      en: 'Both handle general reasoning and content work; verify context, tools, limits, and privacy conditions.',
    }),
    relationship('gemini', 'alternative', {
      cn: '两者都具备多模态能力；选择取决于生态集成、输入方式和实际任务质量。',
      en: 'Both are multimodal; the choice depends on ecosystem integration, input modes, and task-level quality.',
    }),
    relationship('chatgpt-mac', 'complements', {
      cn: 'GPT-4o 是模型能力，ChatGPT Mac 是具体桌面入口；两页应结合查看而不是当成同一层产品。',
      en: 'GPT-4o is model capability while ChatGPT Mac is a desktop access layer; read them together rather than treating them as the same product level.',
    }),
  ],
  'chatgpt-mac': [
    relationship('gemini', 'alternative', {
      cn: '两者都能承担日常桌面助手任务；重点比较系统集成、文件上下文和账户生态。',
      en: 'Both cover everyday desktop assistant work; compare system integration, file context, and account ecosystem.',
    }),
    relationship('claude', 'alternative', {
      cn: '两者都可用于桌面写作和知识工作；重点比较客户端能力、上下文和使用限制。',
      en: 'Both support desktop writing and knowledge work; compare client features, context, and usage limits.',
    }),
    relationship('gpt_4o', 'complements', {
      cn: 'ChatGPT Mac 是产品入口，GPT-4o 页面解释底层模型能力和限制。',
      en: 'ChatGPT Mac is the product entry point, while the GPT-4o page explains underlying model capabilities and limits.',
    }),
  ],
  poe: [
    relationship('claude', 'overlaps', {
      cn: 'Poe 可接入多种模型，Claude 提供原生体验；适合比较聚合入口与直接订阅的差异。',
      en: 'Poe aggregates multiple models while Claude provides the native experience; compare gateway access with a direct subscription.',
    }),
    relationship('gemini', 'overlaps', {
      cn: '两者都能完成通用助手任务，但 Poe 强在模型切换，Gemini 强在 Google 生态。',
      en: 'Both handle general assistant tasks, but Poe emphasizes model switching while Gemini emphasizes Google integration.',
    }),
  ],
  adobe: [
    relationship('shutterstock', 'overlaps', {
      cn: '两者都覆盖创意素材工作流；重点比较素材库、生成能力、授权和团队协作。',
      en: 'Both cover creative asset workflows; compare libraries, generation, licensing, and team collaboration.',
    }),
    relationship('fastimage-ai-sketch-to-image', 'complements', {
      cn: '草图转图可作为 Adobe 完整编辑流程前的快速概念阶段，二者不是等价替代。',
      en: 'Sketch-to-image can serve as a fast concept stage before Adobe editing; the two are complements, not equivalent substitutes.',
    }),
    relationship('viggle', 'complements', {
      cn: 'Viggle 更聚焦角色与动作生成，Adobe 更适合完整创意制作和后期。',
      en: 'Viggle focuses on character motion, while Adobe covers broader creative production and finishing.',
    }),
  ],
  shutterstock: [
    relationship('adobe', 'overlaps', {
      cn: '两者都服务创意素材获取和生产；重点比较授权边界、库存与编辑生态。',
      en: 'Both support creative asset sourcing and production; compare licensing boundaries, inventory, and editing ecosystem.',
    }),
    relationship('fastimage-ai-sketch-to-image', 'complements', {
      cn: '前者偏素材库与商业授权，后者偏从草图快速生成概念图。',
      en: 'The former emphasizes stock assets and commercial licensing; the latter turns sketches into quick concepts.',
    }),
  ],
  'fastimage-ai-sketch-to-image': [
    relationship('adobe', 'complements', {
      cn: '快速概念生成后通常还需要 Adobe 类工具完成精修、排版和交付。',
      en: 'Fast concept generation often still needs an Adobe-style workflow for refinement, layout, and delivery.',
    }),
    relationship('shutterstock', 'complements', {
      cn: '需要现成授权素材时可比较 Shutterstock，需要从草图生成时再看本工具。',
      en: 'Use Shutterstock when licensed stock is the need; use this tool when the workflow starts from a sketch.',
    }),
  ],
};

export function getReviewedToolRelationshipDefinitions(toolSlug: string): ReviewedToolRelationshipDefinition[] {
  return REVIEWED_TOOL_RELATIONSHIPS[toolSlug.trim().toLowerCase()] || [];
}
