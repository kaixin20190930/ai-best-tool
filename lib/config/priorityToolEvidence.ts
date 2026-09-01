export interface PriorityToolEvidence {
  checkedAt: string;
  limitation: { en: string; zh: string };
  sources: Array<{ label: string; url: string }>;
}

export const PRIORITY_TOOL_EVIDENCE: Record<string, PriorityToolEvidence> = {
  fathom: {
    checkedAt: '2026-08-31',
    limitation: {
      en: 'The free plan keeps recordings and transcription, but advanced AI summaries are limited after the first five calls each month.',
      zh: '免费版保留录制和转写，但每月前 5 次通话后，高级 AI 摘要会受到限制。',
    },
    sources: [
      { label: 'Official pricing', url: 'https://fathom.video/pricing' },
      { label: 'Free vs. Premium limits', url: 'https://help.fathom.video/en/articles/5290881' },
    ],
  },
  claude: {
    checkedAt: '2026-08-31',
    limitation: {
      en: 'Claude usage varies with message length, attachments, conversation length, tools, and model choice; a paid plan is not an unlimited plan.',
      zh: 'Claude 的额度会受消息长度、附件、上下文、工具和模型选择影响；付费套餐并不等于无限使用。',
    },
    sources: [
      { label: 'Official Claude pricing', url: 'https://support.claude.com/en/articles/11049762-choose-a-claude-plan' },
      {
        label: 'Usage limit guidance',
        url: 'https://support.claude.com/en/articles/9797557-usage-limit-best-practices',
      },
    ],
  },
  deepl: {
    checkedAt: '2026-08-31',
    limitation: {
      en: 'Translator subscriptions do not include DeepL API access, and document size, format, and monthly volume limits vary by plan.',
      zh: 'Translator 订阅不包含 DeepL API 权限，文档大小、格式和每月额度也会因套餐而不同。',
    },
    sources: [
      {
        label: 'Official plan guide',
        url: 'https://support.deepl.com/hc/en-us/articles/360019924499-About-DeepL-plans',
      },
      { label: 'API usage and document limits', url: 'https://developers.deepl.com/docs/resources/usage-limits' },
    ],
  },
  gamma: {
    checkedAt: '2026-08-31',
    limitation: {
      en: 'Exports can differ visually from the editor, Word export is unavailable, and subscriptions are billed per user.',
      zh: '导出结果可能与编辑器存在视觉差异，目前不支持 Word 导出，而且订阅按用户席位计费。',
    },
    sources: [
      { label: 'Official pricing', url: 'https://gamma.app/pricing' },
      {
        label: 'Official export limitations',
        url: 'https://help.gamma.app/en/articles/8022861-what-s-the-easiest-way-to-export-my-gamma',
      },
    ],
  },
  lindy: {
    checkedAt: '2026-08-31',
    limitation: {
      en: 'Credit use varies by model and task complexity; unused credits do not roll over, and credit-consuming tasks pause when the balance runs out.',
      zh: 'Credits 消耗取决于模型和任务复杂度；未使用额度不会结转，额度耗尽后相关任务会暂停。',
    },
    sources: [
      { label: 'Current official pricing', url: 'https://www.lindy.ai/pricing' },
      { label: 'Official credit documentation', url: 'https://docs.lindy.ai/account-billing/credits' },
    ],
  },
  cursor: {
    checkedAt: '2026-08-31',
    limitation: {
      en: 'Agent usage is consumed at model inference API prices, so model choice and agent-heavy workflows can exhaust included usage well before the billing period ends.',
      zh: 'Agent 用量按模型推理 API 价格消耗，因此模型选择和高频 Agent 工作流可能在账期结束前耗尽套餐内额度。',
    },
    sources: [
      { label: 'Official models and pricing', url: 'https://docs.cursor.com/account/pricing' },
      { label: 'Official data use policy', url: 'https://cursor.com/en-US/data-use' },
    ],
  },
  'the-graph': {
    checkedAt: '2026-08-31',
    limitation: {
      en: 'Querying and indexing are separate: paying more for queries cannot make an under-indexed Subgraph available or fresh, so production use still needs indexing and freshness checks.',
      zh: '查询与索引是两项独立活动：增加查询费用不能让索引不足的 Subgraph 自动可用或保持新鲜，生产使用仍需检查索引和数据时效。',
    },
    sources: [
      {
        label: 'Official pricing and payments',
        url: 'https://thegraph.com/docs/en/gateways/subgraphs/consumer-side/pricing-payments/',
      },
      {
        label: 'Official consumer gateway overview',
        url: 'https://thegraph.com/docs/en/gateways/subgraphs/consumer-side/overview/',
      },
    ],
  },
};
