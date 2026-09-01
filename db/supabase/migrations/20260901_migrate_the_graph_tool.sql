DO $$
DECLARE
  target_id uuid := 'b189f440-f5d7-44ca-9b10-5906c6eedb62';
  productivity_id uuid := '1d866b7d-6340-4a0b-8333-a301cc52172c';
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.tools WHERE name = 'the-graph' AND id <> target_id
  ) THEN
    RAISE EXCEPTION 'Cannot migrate The Graph: another tool row already exists.';
  END IF;

  INSERT INTO public.tools (
    id, name, title, content, detail, url, image_url, thumbnail_url,
    category_id, tags, pricing, features, use_cases, screenshots, video_url,
    status, submitted_by, page_quality_status, next_review_date, created_at, updated_at
  ) VALUES (
    target_id,
    'the-graph',
    jsonb_build_object(
      'en', 'The Graph Subgraphs & Blockchain Data',
      'zh', 'The Graph Subgraph 与区块链数据',
      'cn', 'The Graph Subgraph 与区块链数据'
    ),
    jsonb_build_object(
      'en', 'The Graph is blockchain data infrastructure for building and querying indexed datasets. Subgraphs provide typed GraphQL APIs, Substreams support high-throughput data pipelines, and Graph Node can be self-hosted. It fits application teams that need repeatable onchain data access, but production readiness depends on network support, Indexer coverage, sync freshness, API-key controls, and separate query and indexing economics.',
      'zh', 'The Graph 是用于构建和查询索引数据集的区块链数据基础设施。Subgraph 提供类型化 GraphQL API，Substreams 支持高吞吐数据管道，Graph Node 可自行托管。它适合需要重复访问链上数据的应用团队，但生产可用性取决于网络支持、Indexer 覆盖、同步新鲜度、API key 控制，以及彼此独立的查询与索引成本。',
      'cn', 'The Graph 是用于构建和查询索引数据集的区块链数据基础设施。Subgraph 提供类型化 GraphQL API，Substreams 支持高吞吐数据管道，Graph Node 可自行托管。它适合需要重复访问链上数据的应用团队，但生产可用性取决于网络支持、Indexer 覆盖、同步新鲜度、API key 控制，以及彼此独立的查询与索引成本。'
    ),
    jsonb_build_object(
      'en', E'## What The Graph is\n\nThe Graph is a family of blockchain-data products rather than one interchangeable API. Subgraphs define and index application-specific data into GraphQL endpoints. Substreams are high-throughput streaming pipelines. Graph Node is the open-source indexing runtime for teams that need self-hosting or unsupported EVM networks. The Gateway handles hosted query access, API keys, and billing.\n\n## Best fit\n\n- Applications that need a stable, typed query layer over repeatable onchain data.\n- Teams willing to define a schema, mappings, deployment process, and freshness monitoring instead of relying on an instant universal API.\n- Data engineers who need Substreams or self-hosted Graph Node for custom throughput, network, or infrastructure requirements.\n\n## Check before choosing\n\n- The first 100,000 monthly queries are currently free and additional queries cost $2 per 100,000. Use a production API key with domain restrictions and a monthly spending limit; do not expose an unrestricted key in client code.\n- Querying and indexing are separate economic activities. Paying more query fees cannot make an under-indexed Subgraph available or current. Verify Indexer support and incentives, or operate Graph Node when the hosted path does not meet the requirement.\n- Deploying to Subgraph Studio is not the same as publishing to the decentralized network. Production teams need an explicit publish and versioning process.\n- Network support differs between Subgraphs, Substreams, and Firehose. The public network covers more than 60 chains, but product support is not identical on every network; unsupported EVM networks may require self-hosting.\n- Check deployment version, number of Indexers, latest synced block, timestamp, and indexing errors before treating results as current. New networks and triggers can expose untested errors or synchronization lag.\n- The graph-node repository remains actively maintained, with release v0.45.0 published in August 2026. Repository activity is a durability signal, not an uptime or freshness guarantee for a specific Subgraph.\n\n## Decision summary\n\nChoose The Graph when an application-specific indexed query layer is worth the schema, deployment, and monitoring work. Prefer a hosted data provider when you need immediate cross-chain coverage without owning indexing definitions. Before launch, test one representative Subgraph end to end, restrict its key, set a spending cap, measure block lag and indexing errors, and document a fallback for stale or unavailable data.',
      'zh', E'## The Graph 是什么\n\nThe Graph 是一组区块链数据产品，而不是一个可以互换的通用 API。Subgraph 将应用专属数据定义并索引为 GraphQL 端点；Substreams 用于高吞吐流式管道；Graph Node 是开源索引运行时，适合需要自托管或支持未覆盖 EVM 网络的团队；Gateway 负责托管查询、API key 与计费。\n\n## 更适合\n\n- 需要稳定、类型化查询层来重复访问链上数据的应用。\n- 愿意维护 schema、mapping、部署流程和新鲜度监控，而不是期待即时通用 API 的团队。\n- 因吞吐、网络或基础设施要求而需要 Substreams 或自托管 Graph Node 的数据工程团队。\n\n## 选择前必须核对\n\n- 当前每月前 100,000 次查询免费，之后每 100,000 次 $2。生产 API key 应设置域名限制和月度支出上限，不要在客户端暴露无限制 key。\n- 查询与索引是两个独立的经济活动。提高查询费用不能让索引不足的 Subgraph 自动可用或保持最新；需要验证 Indexer 支持和激励，托管路径不满足时则自行运行 Graph Node。\n- 部署到 Subgraph Studio 不等于发布到去中心化网络，生产团队需要明确的发布和版本管理流程。\n- Subgraphs、Substreams 和 Firehose 的网络支持范围不同。公共网络覆盖 60 多条链，但各产品并非在每条网络上都具备相同支持；未覆盖的 EVM 网络可能需要自托管。\n- 将结果视为最新数据前，应检查部署版本、Indexer 数量、最新同步区块、时间戳和 indexing errors。新网络与新 trigger 可能暴露未测试错误或同步延迟。\n- graph-node 仓库仍在活跃维护，v0.45.0 于 2026 年 8 月发布。仓库活跃度是持续性信号，不代表某个 Subgraph 的正常运行时间或数据新鲜度保证。\n\n## 决策结论\n\n当应用专属索引查询层的价值高于 schema、部署和监控成本时，可以选择 The Graph；如果你需要无需维护索引定义的即时跨链覆盖，应优先比较托管数据提供商。上线前用一个代表性 Subgraph 完成端到端测试，限制 key、设置支出上限、测量区块延迟和索引错误，并为陈旧或不可用数据建立回退方案。',
      'cn', E'## The Graph 是什么\n\nThe Graph 是一组区块链数据产品，而不是一个可以互换的通用 API。Subgraph 将应用专属数据定义并索引为 GraphQL 端点；Substreams 用于高吞吐流式管道；Graph Node 是开源索引运行时，适合需要自托管或支持未覆盖 EVM 网络的团队；Gateway 负责托管查询、API key 与计费。\n\n## 更适合\n\n- 需要稳定、类型化查询层来重复访问链上数据的应用。\n- 愿意维护 schema、mapping、部署流程和新鲜度监控，而不是期待即时通用 API 的团队。\n- 因吞吐、网络或基础设施要求而需要 Substreams 或自托管 Graph Node 的数据工程团队。\n\n## 选择前必须核对\n\n- 当前每月前 100,000 次查询免费，之后每 100,000 次 $2。生产 API key 应设置域名限制和月度支出上限，不要在客户端暴露无限制 key。\n- 查询与索引是两个独立的经济活动。提高查询费用不能让索引不足的 Subgraph 自动可用或保持最新；需要验证 Indexer 支持和激励，托管路径不满足时则自行运行 Graph Node。\n- 部署到 Subgraph Studio 不等于发布到去中心化网络，生产团队需要明确的发布和版本管理流程。\n- Subgraphs、Substreams 和 Firehose 的网络支持范围不同。公共网络覆盖 60 多条链，但各产品并非在每条网络上都具备相同支持；未覆盖的 EVM 网络可能需要自托管。\n- 将结果视为最新数据前，应检查部署版本、Indexer 数量、最新同步区块、时间戳和 indexing errors。新网络与新 trigger 可能暴露未测试错误或同步延迟。\n- graph-node 仓库仍在活跃维护，v0.45.0 于 2026 年 8 月发布。仓库活跃度是持续性信号，不代表某个 Subgraph 的正常运行时间或数据新鲜度保证。\n\n## 决策结论\n\n当应用专属索引查询层的价值高于 schema、部署和监控成本时，可以选择 The Graph；如果你需要无需维护索引定义的即时跨链覆盖，应优先比较托管数据提供商。上线前用一个代表性 Subgraph 完成端到端测试，限制 key、设置支出上限、测量区块延迟和索引错误，并为陈旧或不可用数据建立回退方案。'
    ),
    'https://thegraph.com/',
    'https://storage.thegraph.com/favicons/256x256.png',
    'https://storage.googleapis.com/graph-website/seo/graph-website.jpg',
    productivity_id,
    ARRAY['web3', 'blockchain-data', 'subgraphs', 'graphql', 'developer-tools'],
    'freemium',
    jsonb_build_object(
      'localized', jsonb_build_object(
        'en', jsonb_build_array(
          jsonb_build_object('label', 'Product boundary', 'value', 'Subgraphs, Substreams, Graph Node, and Gateway solve different parts of the data workflow.'),
          jsonb_build_object('label', 'Cost boundary', 'value', 'Query pricing does not fund or repair indexing; production needs separate coverage and freshness checks.'),
          jsonb_build_object('label', 'Operations boundary', 'value', 'Version, Indexer count, synced block, and indexing errors must be monitored per deployment.')
        ),
        'zh', jsonb_build_array(
          jsonb_build_object('label', '产品边界', 'value', 'Subgraphs、Substreams、Graph Node 与 Gateway 分别解决数据工作流的不同环节。'),
          jsonb_build_object('label', '成本边界', 'value', '查询价格不会资助或修复索引；生产环境需单独检查覆盖和新鲜度。'),
          jsonb_build_object('label', '运维边界', 'value', '每个部署都应监控版本、Indexer 数量、同步区块和索引错误。')
        ),
        'cn', jsonb_build_array(
          jsonb_build_object('label', '产品边界', 'value', 'Subgraphs、Substreams、Graph Node 与 Gateway 分别解决数据工作流的不同环节。'),
          jsonb_build_object('label', '成本边界', 'value', '查询价格不会资助或修复索引；生产环境需单独检查覆盖和新鲜度。'),
          jsonb_build_object('label', '运维边界', 'value', '每个部署都应监控版本、Indexer 数量、同步区块和索引错误。')
        )
      ),
      'audience', jsonb_build_object(
        'bestFit', jsonb_build_object(
          'en', jsonb_build_array('Applications needing typed onchain APIs', 'Teams owning a Subgraph schema and deployment', 'Data engineers needing Substreams or self-hosted indexing'),
          'zh', jsonb_build_array('需要类型化链上 API 的应用', '能够维护 Subgraph schema 与部署的团队', '需要 Substreams 或自托管索引的数据工程团队'),
          'cn', jsonb_build_array('需要类型化链上 API 的应用', '能够维护 Subgraph schema 与部署的团队', '需要 Substreams 或自托管索引的数据工程团队')
        ),
        'notIdealFor', jsonb_build_object(
          'en', jsonb_build_array('Instant universal blockchain coverage', 'Assuming paid queries guarantee fresh indexing', 'Teams unwilling to monitor schema and sync health'),
          'zh', jsonb_build_array('需要即时通用链数据覆盖', '误以为付费查询保证索引新鲜度', '不愿监控 schema 与同步健康的团队'),
          'cn', jsonb_build_array('需要即时通用链数据覆盖', '误以为付费查询保证索引新鲜度', '不愿监控 schema 与同步健康的团队')
        )
      ),
      'editorial', jsonb_build_object(
        'reviewedAt', '2026-09-01',
        'reviewedBy', 'AI Best Tool editorial',
        'sourceUrl', 'https://thegraph.com/docs/en/',
        'summary', jsonb_build_object(
          'en', 'Reviewed against current product, pricing, API-key, network-support, publishing, indexing-economics, roadmap, status, and graph-node sources.',
          'zh', '已根据当前产品、定价、API key、网络支持、发布、索引经济、路线图、状态页和 graph-node 来源完成核验。',
          'cn', '已根据当前产品、定价、API key、网络支持、发布、索引经济、路线图、状态页和 graph-node 来源完成核验。'
        ),
        'trustNote', jsonb_build_object(
          'en', 'The network and open-source project are mature, but a specific Subgraph still needs deployment-level freshness and availability checks.',
          'zh', '网络和开源项目已经成熟，但具体 Subgraph 仍需部署级新鲜度与可用性检查。',
          'cn', '网络和开源项目已经成熟，但具体 Subgraph 仍需部署级新鲜度与可用性检查。'
        )
      ),
      'marketValidation', jsonb_build_object(
        'reviewedAt', '2026-09-01',
        'score', 94,
        'verdict', 'validated',
        'scores', jsonb_build_object('userValue', 24, 'independentValidation', 20, 'durability', 24, 'evidenceQuality', 18, 'strategicValue', 8),
        'strongSignals', jsonb_build_array('official-60-plus-supported-networks', 'graph-node-3146-stars-1060-forks', 'graph-node-v0-45-0-august-2026'),
        'supportingSignals', jsonb_build_array('public-status-page', 'active-technical-roadmap', 'open-source-self-hosting-path'),
        'evidenceUrls', jsonb_build_array(
          'https://thegraph.com/docs/en/',
          'https://thegraph.com/docs/en/supported-networks/',
          'https://github.com/graphprotocol/graph-node',
          'https://github.com/graphprotocol/graph-node/releases/tag/v0.45.0',
          'https://status.thegraph.com/'
        ),
        'rationale', jsonb_build_object(
          'en', 'Official documentation shows broad network coverage and several distinct production data paths. The graph-node repository has 3,146 stars, 1,060 forks, recent commits, and an August 2026 release, supporting durability. These signals validate the platform, while deployment-specific indexing health remains a separate operational claim that must not be inferred from project maturity.',
          'zh', '官方文档显示其网络覆盖广，并提供多种生产数据路径；graph-node 仓库拥有 3,146 stars、1,060 forks、近期提交和 2026 年 8 月版本，支持其持续性判断。这些信号能够验证平台成熟度，但具体部署的索引健康仍是独立运维事实，不能从项目成熟度直接推断。',
          'cn', '官方文档显示其网络覆盖广，并提供多种生产数据路径；graph-node 仓库拥有 3,146 stars、1,060 forks、近期提交和 2026 年 8 月版本，支持其持续性判断。这些信号能够验证平台成熟度，但具体部署的索引健康仍是独立运维事实，不能从项目成熟度直接推断。'
        )
      )
    ),
    jsonb_build_object(
      'en', jsonb_build_array('Typed GraphQL Subgraph APIs', 'High-throughput Substreams pipelines', 'Open-source Graph Node self-hosting', 'Gateway API keys and billing'),
      'zh', jsonb_build_array('类型化 GraphQL Subgraph API', '高吞吐 Substreams 管道', '开源 Graph Node 自托管', 'Gateway API key 与计费'),
      'cn', jsonb_build_array('类型化 GraphQL Subgraph API', '高吞吐 Substreams 管道', '开源 Graph Node 自托管', 'Gateway API key 与计费')
    ),
    ARRAY[]::text[],
    NULL,
    'published',
    NULL,
    'continue_index',
    DATE '2026-10-01',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    detail = EXCLUDED.detail,
    url = EXCLUDED.url,
    image_url = EXCLUDED.image_url,
    thumbnail_url = EXCLUDED.thumbnail_url,
    category_id = EXCLUDED.category_id,
    tags = EXCLUDED.tags,
    pricing = EXCLUDED.pricing,
    features = EXCLUDED.features,
    use_cases = EXCLUDED.use_cases,
    status = EXCLUDED.status,
    page_quality_status = EXCLUDED.page_quality_status,
    next_review_date = EXCLUDED.next_review_date,
    updated_at = NOW();
END $$;
