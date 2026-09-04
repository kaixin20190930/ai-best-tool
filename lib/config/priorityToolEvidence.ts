export interface PriorityToolEvidence {
  checkedAt: string;
  limitation: { en: string; zh: string };
  sources: Array<{ label: string; url: string }>;
}

export const PRIORITY_TOOL_EVIDENCE: Record<string, PriorityToolEvidence> = {
  consensus: {
    checkedAt: '2026-09-01',
    limitation: {
      en: 'Consensus accelerates discovery and synthesis, but corpus coverage, retrieval, and AI interpretation are not exhaustive enough to replace a reproducible systematic-review protocol or reading the source papers.',
      zh: 'Consensus 可以加速发现与综合，但语料覆盖、检索和 AI 解读并非穷尽式，不能替代可复现的系统综述方案或对原论文的阅读。',
    },
    sources: [
      {
        label: 'Official research database',
        url: 'https://help.consensus.app/en/articles/10055108-consensus-research-database',
      },
      { label: 'Independent peer-reviewed review', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12318603/' },
    ],
  },
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
    checkedAt: '2026-09-01',
    limitation: {
      en: 'Translator, Write, and API are separate product and subscription paths; document formats, data protection, character limits, and admin controls vary by plan.',
      zh: 'Translator、Write 与 API 是不同产品和订阅路径；文档格式、数据保护、字符额度和管理能力都会因套餐而不同。',
    },
    sources: [
      {
        label: 'DeepL Write product boundaries',
        url: 'https://support.deepl.com/hc/en-us/articles/6318834492700-About-DeepL-Write',
      },
      { label: 'DeepL API plans', url: 'https://support.deepl.com/hc/en-us/articles/360021200939-DeepL-API-plans' },
      { label: 'Document format limits', url: 'https://support.deepl.com/hc/en-us/articles/360020582359-File-formats' },
    ],
  },
  runway: {
    checkedAt: '2026-09-01',
    limitation: {
      en: 'Runway charges per editor while a workspace shares one pool of plan credits; web-app and API credits are separate, and the built-in editor is not intended for large finishing workflows.',
      zh: 'Runway 按编辑席位收费，但一个工作区共享一组套餐 credits；网页端与 API credits 互不相通，内置编辑器也不适合大型后期流程。',
    },
    sources: [
      { label: 'Current Runway pricing', url: 'https://runway.com/pricing' },
      {
        label: 'Plan and workspace boundaries',
        url: 'https://help.runwayml.com/hc/en-us/articles/21664961171475-Which-plan-is-right-for-me',
      },
      {
        label: 'Commercial usage rights',
        url: 'https://help.runwayml.com/hc/en-us/articles/18927776141715-Usage-rights',
      },
    ],
  },
  gamma: {
    checkedAt: '2026-09-04',
    limitation: {
      en: 'Google Slides requires importing a PPTX file and can replace embedded fonts; verify the exported deck before presenting. Word export is unavailable.',
      zh: 'Google Slides 需要导入 PPTX 文件，且可能替换嵌入字体；演示前应核对导出结果。目前不支持 Word 导出。',
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
  'luma-ai': {
    checkedAt: '2026-09-01',
    limitation: {
      en: 'Dream Machine web subscriptions and API credits are separate; Free and Lite outputs remain watermarked and non-commercial, and monthly credits do not roll over.',
      zh: 'Dream Machine 网页订阅与 API credits 互相独立；Free 与 Lite 输出保留水印且仅限非商业使用，月度 credits 也不会结转。',
    },
    sources: [
      { label: 'Plans and subscription boundaries', url: 'https://lumalabs.ai/learning-hub/payments-subscriptions' },
      { label: 'Credit system and current rates', url: 'https://lumalabs.ai/learning-hub/dream-machine-credit-system' },
      { label: 'Commercial licensing rules', url: 'https://lumalabs.ai/learning-hub/licensing' },
    ],
  },
  pipedream: {
    checkedAt: '2026-09-01',
    limitation: {
      en: 'Pipedream Workflows bills by compute time and memory per workflow segment rather than by step; Connect also bills for external users, and queues are not available for every native trigger type.',
      zh: 'Pipedream Workflows 按每个 workflow segment 的计算时间和内存计费，而不是按步骤数计费；Connect 还会按外部用户计费，并且事件队列不支持所有原生触发器类型。',
    },
    sources: [
      { label: 'Workflow and Connect credit model', url: 'https://pipedream.com/docs/pricing' },
      {
        label: 'Concurrency, ordering, and queue boundaries',
        url: 'https://pipedream.com/docs/workflows/building-workflows/settings/concurrency-and-throttling',
      },
      { label: 'Privacy and retention boundaries', url: 'https://pipedream.com/docs/privacy-and-security' },
    ],
  },
  cursor: {
    checkedAt: '2026-09-01',
    limitation: {
      en: 'Agent cost depends on model and usage pool, Privacy Mode still routes requests through Cursor, and OpenAI has proposed ending direct model supply on November 12, 2026 after the SpaceX acquisition.',
      zh: 'Agent 成本取决于模型和用量池；Privacy Mode 下请求仍会经过 Cursor；SpaceX 收购后，OpenAI 已提议于 2026 年 11 月 12 日停止向 Cursor 直接提供模型。',
    },
    sources: [
      { label: 'Current plans and pricing', url: 'https://cursor.com/pricing' },
      { label: 'Official data use policy', url: 'https://cursor.com/en-US/data-use' },
      { label: 'Cursor acquisition announcement', url: 'https://cursor.com/blog/joining-spacex' },
      {
        label: 'Proposed OpenAI model-supply cutoff',
        url: 'https://openai.com/index/our-decision-on-cursor-following-its-acquisition-by-spacex/',
      },
    ],
  },
  'the-graph': {
    checkedAt: '2026-09-01',
    limitation: {
      en: 'The first 100,000 monthly queries are free and additional queries are currently $2 per 100,000, but query spend cannot repair an under-indexed, stale, or failed Subgraph.',
      zh: '每月前 100,000 次查询免费，超出部分目前为每 100,000 次 $2；但增加查询支出不能修复索引不足、陈旧或失败的 Subgraph。',
    },
    sources: [
      {
        label: 'Official Studio pricing',
        url: 'https://thegraph.com/studio-pricing/',
      },
      {
        label: 'Official query introduction',
        url: 'https://thegraph.com/docs/en/subgraphs/querying/introduction/',
      },
      {
        label: 'Official query and indexing economics',
        url: 'https://thegraph.com/docs/en/gateways/subgraphs/consumer-side/pricing-payments/',
      },
    ],
  },
};
