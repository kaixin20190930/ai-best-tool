import type { ReviewCandidate } from './freshness-first-batch';

const source = 'docs/FRESHNESS_BACKLOG_AFTER_BATCH4_2026-10-08.json';
const sha256 = '86b65d3ef19ff7933014d7475b2563df4f924e560b3e38c6cd1df7a787d2d2cc';
const pass = (slug: string, due: string) => ({
  id: `editorial-2026-09-01:${slug}`,
  source,
  sha256,
  reviewedAt: '2026-09-01',
  validThrough: '2026-11-30',
  claimDueAt: due,
  scope: 'entity_baseline_only' as const,
});

const FIFTH_BATCH: ReviewCandidate[] = [
  {
    slug: 'pipedream',
    id: '2b5a4ac9-16a2-48f2-b53e-38fc6467aab0',
    expectedUrl: 'https://pipedream.com/',
    passSnapshot: pass('pipedream', '2026-09-07'),
    expectedDetailSha256: '90dd935294b5348370e34ca7a910aa39bb3c60ed0681a6c60bacf893c6cc8b61',
    outcome: 'fact_updated',
    checkedAt: '2026-10-09',
    nextReviewDate: '2026-10-23',
    scope:
      'Official Workflows/String shutdown date and unaffected Connect support, with distinct Workflows and Connect billing units; target-account transition excluded.',
    changeSummary:
      'Add the March 31, 2027 Workflows/String shutdown and unaffected Connect support; retain distinct Workflows compute-credit and Connect credit/external-user billing boundaries.',
    sources: [
      'https://pipedream.com/docs/workflows',
      'https://pipedream.com/docs/pricing',
      'https://pipedream.com/pricing',
    ],
    unresolved: [
      'Existing-account transition, refund and data-export specifics are not inferred in this patch; confirm them directly with the account and official notice. Actual Connect credit burn and external-user count require target-workspace checks.',
    ],
    claims: [
      {
        id: 'connect-billing-and-workflows-transition',
        status: 'conditional',
        category: 'account_rights',
        nextReviewDate: '2026-10-23',
        limitation:
          'Check Connect usage and external-user cohort in the target workspace; review existing Workflows transition details separately.',
      },
    ],
    replacements: (['en', 'zh', 'cn'] as const).flatMap((locale) =>
      locale === 'en'
        ? [
            {
              field: 'detail' as const,
              locale,
              from: 'Pipedream has two related but distinct products. Workflows runs hosted event-driven automations with prebuilt actions plus custom Node.js, Python, Go, or Bash code. Connect supplies SDKs, APIs, managed authentication, actions, triggers, and MCP tools for integrations embedded in an application or AI agent.',
              to: 'Pipedream Connect remains fully supported for integrations embedded in apps and AI agents through SDKs, APIs, managed authentication, actions, triggers, and MCP tools. Pipedream says Workflows and String will shut down on March 31, 2027; Workflows currently runs hosted event-driven automations with prebuilt actions and custom code. The shutdown notice does not include Connect.',
            },
            {
              field: 'detail' as const,
              locale,
              from: '- Workflows does not bill by step count. At the default 256MB, each workflow segment consumes one credit per 30 seconds of compute; memory increases multiply credit use. Development and testing runs do not consume credits.',
              to: '- Workflows and String have a stated shutdown date of March 31, 2027; Connect remains supported. Workflows does not bill by step count: at the default 256MB, each workflow segment consumes one credit per 30 seconds of compute, with higher memory increasing usage. These Workflows compute credits are distinct from Connect billing.',
            },
            {
              field: 'detail' as const,
              locale,
              from: 'Choose Pipedream when managed authentication, hosted execution, and code flexibility remove more maintenance than they add in usage cost. Prototype one representative workflow, measure credits at real memory and event volume, test duplicate and out-of-order events, and confirm whether you need Workflows, Connect, or both before committing.',
              to: 'Choose Connect when its managed integrations fit an app or AI agent, then measure Connect usage credits and external-user billing separately. Do not plan a new long-lived workflow on Workflows or String without accounting for their March 31, 2027 shutdown. Existing Workflows users should review the official transition notice and their own account before deciding on migration, refunds, or data export.',
            },
          ]
        : [
            {
              field: 'detail' as const,
              locale,
              from: 'Pipedream 包含两个相关但不同的产品。Workflows 使用预构建 actions 与自定义 Node.js、Python、Go 或 Bash 代码运行托管式事件自动化；Connect 提供 SDK、API、托管鉴权、actions、triggers 和 MCP tools，用于把集成嵌入应用或 AI Agent。',
              to: 'Pipedream Connect 继续获得完整支持，通过 SDK、API、托管鉴权、actions、triggers 和 MCP tools 将集成嵌入应用或 AI Agent。Pipedream 已宣布 Workflows 与 String 将于 2027 年 3 月 31 日停止服务；Workflows 目前仍运行预构建 actions 与自定义代码组成的托管式事件自动化。该停止服务公告不包括 Connect。',
            },
            {
              field: 'detail' as const,
              locale,
              from: '- Workflows 不是按步骤数计费。默认 256MB 下，每个 workflow segment 每 30 秒计算 1 credit；提高内存会按比例增加 credits。开发和测试运行不消耗 credits。',
              to: '- Workflows 与 String 的明确停止服务日期为 2027 年 3 月 31 日；Connect 继续获得支持。Workflows 不按步骤数计费：默认 256MB 下，每个 workflow segment 每 30 秒计算 1 credit，提高内存会增加用量。这里的 Workflows 计算 credits 与 Connect 计费须分别核对。',
            },
            {
              field: 'detail' as const,
              locale,
              from: '当托管鉴权、托管执行和代码灵活性所节省的维护成本高于用量成本时，可以选择 Pipedream。付费前先用一个代表性工作流测试：按真实内存与事件量测算 credits，验证重复和乱序事件，并明确只需要 Workflows、Connect，还是两者都需要。',
              to: '若要向应用或 AI Agent 嵌入托管集成，可评估 Connect，并分别测算使用 credits 与外部用户计费。规划新的长期工作流时，必须计入 Workflows 和 String 于 2027 年 3 月 31 日停止服务的事实。现有 Workflows 用户应结合官方过渡公告和自身账号，分别确认迁移、退款或数据导出安排。',
            },
          ],
    ),
  },
  {
    slug: 'cursor',
    id: 'ef1cc4b5-98be-474b-b422-7b6f79ca6c3d',
    expectedUrl: 'https://cursor.com/',
    passSnapshot: pass('cursor', '2026-09-08'),
    expectedDetailSha256: '8c86db6802be285bbb5db2d60ce8da3ce9b4b9f222bcfaf4397cd0236f4830f6',
    outcome: 'reviewed_no_change',
    checkedAt: '2026-10-09',
    nextReviewDate: '2026-10-23',
    scope:
      'Public plan prices, model-usage billing, Privacy Mode and SpaceX ownership; signed-in billing, selected models and future supply excluded.',
    changeSummary:
      'Official Cursor plan and privacy documentation still supports the published bounded claims; future model-supply transition remains conditional.',
    sources: [
      'https://cursor.com/pricing',
      'https://prod.cursor.com/help/account-and-billing/pricing',
      'https://cursor.com/data-use',
      'https://cursor.com/blog/joining-spacex',
      'https://openai.com/index/our-decision-on-cursor-following-its-acquisition-by-spacex/',
    ],
    unresolved: [
      'Regional checkout, actual model spend, workspace Privacy Mode, and future third-party model availability require target-account verification.',
    ],
    claims: [
      {
        id: 'model-availability-and-usage',
        status: 'conditional',
        category: 'account_rights',
        nextReviewDate: '2026-10-23',
        limitation: 'Check model picker, usage dashboard and privacy configuration in the target workspace.',
      },
    ],
  },
];

export default FIFTH_BATCH;
