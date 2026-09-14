import { type VerifiedComparison } from './verifiedComparison';

// Official documentation reviewed on this date; no product execution or performance benchmark claimed.
export const web3Comparison: VerifiedComparison = {
  title: {
    cn: 'Dune vs The Graph：链上分析还是应用数据接口？',
    en: 'Dune vs The Graph: dashboards or data APIs?',
  },
  scope: {
    cn: '比较 Dune 的 SQL 分析工作台与 The Graph 的 Subgraphs：你的交付物是研究看板，还是应用可查询的数据？以下依据官方文档判断任务适配，没有独立实测评分。',
    en: 'Compare Dune’s SQL workspace with The Graph’s Subgraphs for Web3 data tasks. Based on official documentation, without independent test scores.',
  },
  candidates: [
    {
      slug: 'dune',
      name: 'Dune',
      chooseWhen: {
        cn: '要回答“这个协议的使用量如何变化”，并交付 SQL 查询或可分享的图表：选 Dune。',
        en: 'Choose Dune to analyze protocol usage with SQL and deliver a shareable research dashboard.',
      },
      strength: {
        cn: '可以在同一工作台查询链上数据、制作图表并共享看板；查询结果也可通过 API 接入外部应用。',
        en: 'Query blockchain data, create charts and share dashboards in one workspace. Query results can also feed external applications through an API.',
      },
      limitation: {
        cn: '自定义分析需要理解 SQL 和表结构；结果取决于数据覆盖与查询逻辑。API 查询执行和数据导出会消耗 credits，不能把看板浏览等同于免费 API 使用。',
        en: 'Custom analysis requires SQL and table knowledge. Results depend on coverage and query logic. API execution and data export consume credits; browsing a dashboard does not imply free API use.',
      },
      fit: {
        cn: '适合会写 SQL、需要解释指标变化的研究员与分析师。',
        en: 'Fits researchers and analysts who can work with SQL and need to explain changing metrics.',
      },
      notFor: {
        cn: '如果交付物是按自定义实体结构供应用查询的接口，应先评估 Subgraph。',
        en: 'If the deliverable is an API built around your own application entities, assess a Subgraph first.',
      },
      evidenceRefs: ['dune-workspace', 'dune-api', 'dune-billing'],
    },
    {
      slug: 'the-graph',
      name: 'The Graph',
      chooseWhen: {
        cn: '要让应用按合约事件查询账户、交易或协议实体，并维护数据模型：选 The Graph 的 Subgraphs。',
        en: 'Choose The Graph to serve contract-event data as application entities, with a data model you can maintain.',
      },
      strength: {
        cn: 'Subgraph 用 manifest、schema 和 mappings 定义合约数据如何形成实体，再通过 GraphQL 查询。已有合适 Subgraph 时，可以先验证再复用。',
        en: 'A Subgraph uses a manifest, schema and mappings to turn contract data into entities queried with GraphQL. A suitable existing Subgraph can be evaluated and reused.',
      },
      limitation: {
        cn: '查询范围取决于所选 Subgraph 的网络、合约和 schema；缺少需要的实体时，通常要修改或自建 Subgraph，并检查同步状态。',
        en: 'Queries depend on the selected Subgraph’s network, contracts and schema. Missing entities may require changing or building a Subgraph and checking its sync status.',
      },
      fit: {
        cn: '适合需要稳定数据模型、能维护 schema 与索引逻辑的 Web3 开发团队。',
        en: 'Fits Web3 developers who need a defined data model and can maintain schemas and indexing logic.',
      },
      notFor: {
        cn: '如果只是制作一次性的指标图表、不准备维护应用数据模型，Dune 通常更直接。',
        en: 'For a one-off metrics dashboard without an application data model to maintain, Dune is usually more direct.',
      },
      evidenceRefs: ['graph-subgraphs', 'graph-query', 'graph-explorer'],
    },
  ],
  comparisonRows: [
    {
      dimension: { cn: '查询方式', en: 'Query model' },
      values: {
        dune: {
          cn: '对数据表编写 SQL，聚合指标并检查结果。',
          en: 'Write SQL against data tables to aggregate and inspect metrics.',
        },
        'the-graph': {
          cn: '用 GraphQL 查询 Subgraph schema 中已定义的实体。',
          en: 'Use GraphQL to query entities defined in a Subgraph schema.',
        },
      },
      fit: {
        cn: '探索指标选 Dune；按实体查询选 The Graph。',
        en: 'Dune for metric exploration; The Graph for entity queries.',
      },
      reason: {
        cn: '选择取决于查询是否围绕应用的数据模型。',
        en: 'The distinction is whether queries follow your application’s data model.',
      },
      evidenceRefs: ['dune-workspace', 'graph-query'],
    },
    {
      dimension: { cn: '交付结果', en: 'Deliverable' },
      values: {
        dune: { cn: '查询结果、图表与可分享的看板。', en: 'Query results, charts and shareable dashboards.' },
        'the-graph': {
          cn: '可由应用调用的结构化 GraphQL 数据接口。',
          en: 'A structured GraphQL data API for an application.',
        },
      },
      fit: {
        cn: '研究报告选 Dune；应用接口选 The Graph。',
        en: 'Dune for a research report; The Graph for an application API.',
      },
      reason: {
        cn: '先确定交付给人阅读，还是给应用查询。',
        en: 'Decide whether the output is primarily for readers or application queries.',
      },
      evidenceRefs: ['dune-workspace', 'graph-subgraphs'],
    },
    {
      dimension: { cn: '数据覆盖', en: 'Data coverage' },
      values: {
        dune: {
          cn: '从数据目录查找原始表、解码合约与整理后的数据集。',
          en: 'Find raw tables, decoded contracts and curated datasets in the catalog.',
        },
        'the-graph': {
          cn: '按 Subgraph 的网络、合约与 schema 判断覆盖；可在 Explorer 中查找。',
          en: 'Check each Subgraph’s network, contracts and schema; discover it in Explorer.',
        },
      },
      fit: {
        cn: '已有所需表选 Dune；需要自定义实体可选 The Graph。',
        en: 'Dune for existing tables; The Graph for custom entities.',
      },
      reason: {
        cn: '两者都要先确认目标链与合约可用，不能假设覆盖全部数据。',
        en: 'Verify the target chain and contract in either product; coverage is not universal.',
      },
      evidenceRefs: ['dune-editor', 'graph-subgraphs', 'graph-explorer'],
    },
    {
      dimension: { cn: '接入与维护', en: 'Integration and upkeep' },
      values: {
        dune: {
          cn: '通过 API 获取查询结果，或执行参数化查询；维护 SQL 与刷新安排。',
          en: 'Fetch results or execute parameterized queries via API; maintain SQL and refresh schedules.',
        },
        'the-graph': {
          cn: '接入 Subgraph 查询地址；自建时维护 manifest、schema 与 mappings。',
          en: 'Connect to a Subgraph query URL; maintain manifest, schema and mappings when building your own.',
        },
      },
      fit: {
        cn: '现有分析接入选 Dune；自定义事件数据层选 The Graph。',
        en: 'Dune for existing analytics; The Graph for a custom event data layer.',
      },
      reason: {
        cn: 'Dune 也有 API；不能把有无 API 当作两者的区别。',
        en: 'Dune also has an API; API availability alone does not separate them.',
      },
      evidenceRefs: ['dune-api', 'graph-subgraphs', 'graph-query'],
    },
  ],
  evidence: [
    {
      id: 'dune-workspace',
      source: { label: 'Dune · Data Hub', url: 'https://docs.dune.com/web-app/overview' },
      checkedAt: '2026-09-14',
      claim: {
        cn: 'Data Hub 支持 SQL 查询、可视化与看板分享。',
        en: 'Data Hub supports SQL queries, visualization and dashboard sharing.',
      },
      impact: {
        cn: '支持以 Dune 作为研究与指标展示的起点。',
        en: 'Supports starting with Dune for research and presenting metrics.',
      },
    },
    {
      id: 'dune-editor',
      source: { label: 'Dune · Query Editor', url: 'https://docs.dune.com/web-app/query-editor' },
      checkedAt: '2026-09-14',
      claim: {
        cn: '编辑器提供数据目录、SQL 执行、查询计划与导出入口。',
        en: 'The editor provides data discovery, SQL execution, scheduling and export controls.',
      },
      impact: {
        cn: '先确认所需表和字段，再判断分析是否可行。',
        en: 'Confirm tables and fields before committing to an analysis.',
      },
    },
    {
      id: 'dune-api',
      source: {
        label: 'Dune · Query executions API',
        url: 'https://docs.dune.com/api-reference/executions/execution-object',
      },
      checkedAt: '2026-09-14',
      claim: {
        cn: 'API 可执行查询并读取结果，也可获取最近一次查询结果。',
        en: 'The API can execute queries and read results, including the latest saved result.',
      },
      impact: {
        cn: '现有 SQL 分析可接入应用；要区分旧结果与新执行。',
        en: 'Existing SQL analytics can feed an app; distinguish cached results from a new execution.',
      },
    },
    {
      id: 'dune-billing',
      source: { label: 'Dune · API billing', url: 'https://docs.dune.com/api-reference/overview/billing' },
      checkedAt: '2026-09-14',
      claim: {
        cn: 'API 查询执行按计算资源消耗 credits，结果导出也消耗 credits。',
        en: 'API executions consume credits for compute; exporting results also consumes credits.',
      },
      impact: {
        cn: '上线前按执行频率和导出量估算用量。',
        en: 'Estimate execution frequency and export volume before integration.',
      },
    },
    {
      id: 'graph-subgraphs',
      source: { label: 'The Graph · Subgraphs', url: 'https://thegraph.com/docs/en/subgraphs/overview/' },
      checkedAt: '2026-09-14',
      claim: {
        cn: 'Subgraph 用 manifest、schema 和 mappings 定义链上数据如何被索引和查询。',
        en: 'A Subgraph defines how chain data is indexed and queried using a manifest, schema and mappings.',
      },
      impact: {
        cn: '适合需要控制合约事件到应用实体映射的团队。',
        en: 'Fits teams that need control over the mapping from contract events to application entities.',
      },
    },
    {
      id: 'graph-query',
      source: { label: 'The Graph · GraphQL API', url: 'https://thegraph.com/docs/en/subgraphs/querying/graphql-api/' },
      checkedAt: '2026-09-14',
      claim: {
        cn: 'GraphQL 查询面向 schema 中定义的实体，接口为只读查询。',
        en: 'GraphQL queries target schema-defined entities; the API exposes read-only queries.',
      },
      impact: {
        cn: '接入前确认所需实体、字段与查询方式都已定义。',
        en: 'Check that the required entities, fields and query shapes are available.',
      },
    },
    {
      id: 'graph-explorer',
      source: {
        label: 'The Graph · Explorer',
        url: 'https://thegraph.com/docs/en/subgraphs/existing-subgraphs/explorer/',
      },
      checkedAt: '2026-09-14',
      claim: {
        cn: 'Explorer 可按网络或合约查找 Subgraph，并检查查询地址、实体与索引情况。',
        en: 'Explorer helps find Subgraphs by network or contract and inspect query URLs, entities and indexing information.',
      },
      impact: {
        cn: '优先验证已有 Subgraph，再决定是否自建。',
        en: 'Evaluate an existing Subgraph before deciding to build one.',
      },
    },
  ],
  next: {
    href: '/guides/ai-tools-for-web3',
    label: { cn: '查看 Web3 选型指南', en: 'Read the Web3 selection guide' },
    description: {
      cn: '选定候选后，可通过上方工具链接查看决策卡；如果任务仍未确定，先按指南区分研究、数据接入与监控需求。',
      en: 'Use the tool links above to inspect your candidate’s decision card. If the job is still unclear, use the guide to separate research, data integration and monitoring needs.',
    },
  },
};

// The PUB-01 FAQ exception changes answers only, in a single source shared by visible HTML and JSON-LD.
export const web3ComparisonFaqs = [
  {
    question: { cn: '你们比较的依据是什么？', en: 'What do you compare?' },
    answer: {
      cn: '我们依据 2026-09-14 核查的官方文档，比较 Dune 与 The Graph Subgraphs 的查询方式、交付结果、数据覆盖和接入维护。结论是按任务作出的编辑判断，没有独立实测评分，也不把目录评分作为性能证据。',
      en: 'We compare Dune and The Graph Subgraphs by query model, deliverable, data coverage and integration upkeep using official documentation checked on 2026-09-14. Recommendations are editorial judgments about task fit. We have no independent test scores and do not treat directory ratings as performance evidence.',
    },
  },
  {
    question: { cn: '为什么只看 Web3 工具？', en: 'Why only Web3 tools?' },
    answer: {
      cn: '本页只回答链上数据工作流中 Dune vs The Graph 的选择：SQL 研究与看板优先评估 Dune，按自定义实体提供 GraphQL 查询优先评估 Subgraphs。它不覆盖全部钱包、研究情报或告警产品，也没有比较 The Graph 的其他产品。',
      en: 'This page only addresses Dune vs The Graph for onchain data workflows: assess Dune first for SQL research and dashboards, and Subgraphs for GraphQL queries over custom entities. It does not cover every wallet, research-intelligence or alerting product, or compare The Graph’s other products.',
    },
  },
];
