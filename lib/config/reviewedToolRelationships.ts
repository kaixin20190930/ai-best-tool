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
