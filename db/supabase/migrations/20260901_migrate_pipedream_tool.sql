DO $$
DECLARE
  target_id uuid := '2b5a4ac9-16a2-48f2-b53e-38fc6467aab0';
  productivity_id uuid := '1d866b7d-6340-4a0b-8333-a301cc52172c';
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.tools WHERE name = 'pipedream' AND id <> target_id
  ) THEN
    RAISE EXCEPTION 'Cannot migrate Pipedream: another tool row already exists.';
  END IF;

  INSERT INTO public.tools (
    id, name, title, content, detail, url, image_url, thumbnail_url,
    category_id, tags, pricing, features, use_cases, screenshots, video_url,
    status, submitted_by, page_quality_status, next_review_date, created_at, updated_at
  ) VALUES (
    target_id,
    'pipedream',
    jsonb_build_object(
      'en', 'Pipedream API Workflow Automation',
      'zh', 'Pipedream API 工作流自动化',
      'cn', 'Pipedream API 工作流自动化'
    ),
    jsonb_build_object(
      'en', 'Pipedream combines hosted event-driven workflows, JavaScript or Python code, managed authentication, and Pipedream Connect for embedding integrations in apps and AI agents. It is strongest when developers want managed infrastructure without losing code-level control, but Workflows and Connect have different billing inputs and production teams must test concurrency, ordering, retention, and credit cost.',
      'zh', 'Pipedream 将托管式事件工作流、JavaScript/Python 代码、托管鉴权，以及可向应用和 AI Agent 嵌入集成的 Pipedream Connect 组合在一起。它最适合希望免维护基础设施、同时保留代码控制的开发团队，但 Workflows 与 Connect 采用不同计费单位，生产使用前必须验证并发、顺序、数据保留和 credits 成本。',
      'cn', 'Pipedream 将托管式事件工作流、JavaScript/Python 代码、托管鉴权，以及可向应用和 AI Agent 嵌入集成的 Pipedream Connect 组合在一起。它最适合希望免维护基础设施、同时保留代码控制的开发团队，但 Workflows 与 Connect 采用不同计费单位，生产使用前必须验证并发、顺序、数据保留和 credits 成本。'
    ),
    jsonb_build_object(
      'en', E'## What Pipedream is\n\nPipedream has two related but distinct products. Workflows runs hosted event-driven automations with prebuilt actions plus custom Node.js, Python, Go, or Bash code. Connect supplies SDKs, APIs, managed authentication, actions, triggers, and MCP tools for integrations embedded in an application or AI agent.\n\n## Best fit\n\n- Developers and technical operations teams that need managed triggers and infrastructure but still want code-level control.\n- API orchestration, webhook processing, scheduled jobs, event routing, and internal automation across many SaaS services.\n- Product teams embedding user-authorized integrations or tools into an app or AI agent through Connect.\n\n## Check before choosing\n\n- Workflows does not bill by step count. At the default 256MB, each workflow segment consumes one credit per 30 seconds of compute; memory increases multiply credit use. Development and testing runs do not consume credits.\n- Connect has two billing inputs: credit-consuming operations such as action runs, MCP tool calls, deployed trigger emits, and proxy requests, plus the number of unique external users who connect accounts on standard plans.\n- Parallel events do not have guaranteed ordering. Limiting concurrency can serialize supported event-source workflows, but event queues are not supported for native HTTP, cron, SDK, or email triggers.\n- Workflow code and data-store data are retained until deletion. Execution events and associated logs follow account retention settings, so sensitive payloads require explicit workflow and logging controls.\n- Pipedream says it supports more than 2,700 apps on its current Workflows page, while Workday reported more than 3,000 prebuilt connectors when it completed the acquisition. Treat connector count as a changing catalog, not proof that a specific action or trigger is production-ready.\n- Independent review depth is useful but modest: G2 currently shows 16 reviews at 4.6/5, with ease of integration praised and beginner-facing interface complexity noted.\n\n## Decision summary\n\nChoose Pipedream when managed authentication, hosted execution, and code flexibility remove more maintenance than they add in usage cost. Prototype one representative workflow, measure credits at real memory and event volume, test duplicate and out-of-order events, and confirm whether you need Workflows, Connect, or both before committing.',
      'zh', E'## Pipedream 是什么\n\nPipedream 包含两个相关但不同的产品。Workflows 使用预构建 actions 与自定义 Node.js、Python、Go 或 Bash 代码运行托管式事件自动化；Connect 提供 SDK、API、托管鉴权、actions、triggers 和 MCP tools，用于把集成嵌入应用或 AI Agent。\n\n## 更适合\n\n- 需要托管触发器和基础设施、同时希望保留代码控制的开发者与技术运营团队。\n- 跨多个 SaaS 服务进行 API 编排、webhook 处理、定时任务、事件路由和内部自动化。\n- 通过 Connect 向应用或 AI Agent 嵌入用户授权集成与工具的产品团队。\n\n## 选择前必须核对\n\n- Workflows 不是按步骤数计费。默认 256MB 下，每个 workflow segment 每 30 秒计算 1 credit；提高内存会按比例增加 credits。开发和测试运行不消耗 credits。\n- Connect 有两个计费输入：action 运行、MCP tool call、已部署 trigger emit、proxy request 等消耗 credits 的操作，以及标准套餐中连接账户的独立外部用户数。\n- 并行事件不保证顺序。限制并发可让受支持的 event-source workflow 串行执行，但事件队列不支持原生 HTTP、cron、SDK 或 email triggers。\n- Workflow code 与 data store 数据会保留到主动删除；execution event 和相关日志按账户保留设置处理，因此敏感 payload 需要显式控制工作流和日志。\n- Pipedream 当前 Workflows 页面称支持 2,700+ apps，Workday 在完成收购时则报告 3,000+ 预构建 connectors。连接数量是持续变化的目录，不能证明某个具体 action 或 trigger 已达到生产标准。\n- 独立评价可用但样本不大：G2 当前为 16 条评价、4.6/5，用户认可集成便利性，也指出新手界面可能较难理解。\n\n## 决策结论\n\n当托管鉴权、托管执行和代码灵活性所节省的维护成本高于用量成本时，可以选择 Pipedream。付费前先用一个代表性工作流测试：按真实内存与事件量测算 credits，验证重复和乱序事件，并明确只需要 Workflows、Connect，还是两者都需要。',
      'cn', E'## Pipedream 是什么\n\nPipedream 包含两个相关但不同的产品。Workflows 使用预构建 actions 与自定义 Node.js、Python、Go 或 Bash 代码运行托管式事件自动化；Connect 提供 SDK、API、托管鉴权、actions、triggers 和 MCP tools，用于把集成嵌入应用或 AI Agent。\n\n## 更适合\n\n- 需要托管触发器和基础设施、同时希望保留代码控制的开发者与技术运营团队。\n- 跨多个 SaaS 服务进行 API 编排、webhook 处理、定时任务、事件路由和内部自动化。\n- 通过 Connect 向应用或 AI Agent 嵌入用户授权集成与工具的产品团队。\n\n## 选择前必须核对\n\n- Workflows 不是按步骤数计费。默认 256MB 下，每个 workflow segment 每 30 秒计算 1 credit；提高内存会按比例增加 credits。开发和测试运行不消耗 credits。\n- Connect 有两个计费输入：action 运行、MCP tool call、已部署 trigger emit、proxy request 等消耗 credits 的操作，以及标准套餐中连接账户的独立外部用户数。\n- 并行事件不保证顺序。限制并发可让受支持的 event-source workflow 串行执行，但事件队列不支持原生 HTTP、cron、SDK 或 email triggers。\n- Workflow code 与 data store 数据会保留到主动删除；execution event 和相关日志按账户保留设置处理，因此敏感 payload 需要显式控制工作流和日志。\n- Pipedream 当前 Workflows 页面称支持 2,700+ apps，Workday 在完成收购时则报告 3,000+ 预构建 connectors。连接数量是持续变化的目录，不能证明某个具体 action 或 trigger 已达到生产标准。\n- 独立评价可用但样本不大：G2 当前为 16 条评价、4.6/5，用户认可集成便利性，也指出新手界面可能较难理解。\n\n## 决策结论\n\n当托管鉴权、托管执行和代码灵活性所节省的维护成本高于用量成本时，可以选择 Pipedream。付费前先用一个代表性工作流测试：按真实内存与事件量测算 credits，验证重复和乱序事件，并明确只需要 Workflows、Connect，还是两者都需要。'
    ),
    'https://pipedream.com/',
    'https://framerusercontent.com/images/Zbos6KTLSsIOHcPx0ywm0Z06I.png',
    'https://framerusercontent.com/images/JbIGyB2WOjX4AhHd5fuunhIwwss.svg?width=4166&height=2002',
    productivity_id,
    ARRAY['workflow-automation', 'api-integration', 'developer-tools', 'ai-agent-tools'],
    'freemium',
    jsonb_build_object(
      'localized', jsonb_build_object(
        'en', jsonb_build_array(
          jsonb_build_object('label', 'Product boundary', 'value', 'Workflows runs hosted automations; Connect embeds managed integrations and tools in apps and AI agents.'),
          jsonb_build_object('label', 'Cost boundary', 'value', 'Workflows bills compute and memory by segment; Connect also considers external users.'),
          jsonb_build_object('label', 'Reliability boundary', 'value', 'Ordering and queue support depend on trigger type and configured concurrency controls.')
        ),
        'zh', jsonb_build_array(
          jsonb_build_object('label', '产品边界', 'value', 'Workflows 运行托管自动化；Connect 向应用和 AI Agent 嵌入托管集成与工具。'),
          jsonb_build_object('label', '成本边界', 'value', 'Workflows 按 segment 的计算与内存计费；Connect 还会考虑外部用户数。'),
          jsonb_build_object('label', '可靠性边界', 'value', '顺序和队列支持取决于触发器类型与并发控制设置。')
        ),
        'cn', jsonb_build_array(
          jsonb_build_object('label', '产品边界', 'value', 'Workflows 运行托管自动化；Connect 向应用和 AI Agent 嵌入托管集成与工具。'),
          jsonb_build_object('label', '成本边界', 'value', 'Workflows 按 segment 的计算与内存计费；Connect 还会考虑外部用户数。'),
          jsonb_build_object('label', '可靠性边界', 'value', '顺序和队列支持取决于触发器类型与并发控制设置。')
        )
      ),
      'audience', jsonb_build_object(
        'bestFit', jsonb_build_object(
          'en', jsonb_build_array('Developer-led API automation', 'Hosted event and webhook workflows', 'Embedded integrations for apps and agents'),
          'zh', jsonb_build_array('开发者主导的 API 自动化', '托管事件与 webhook 工作流', '面向应用和 Agent 的嵌入式集成'),
          'cn', jsonb_build_array('开发者主导的 API 自动化', '托管事件与 webhook 工作流', '面向应用和 Agent 的嵌入式集成')
        ),
        'notIdealFor', jsonb_build_object(
          'en', jsonb_build_array('Teams unwilling to test event ordering and retries', 'Self-hosting as a hard requirement', 'Assuming every catalog connector is production-ready'),
          'zh', jsonb_build_array('不愿测试事件顺序与重试的团队', '必须自托管的场景', '假设目录内每个 connector 都达到生产标准'),
          'cn', jsonb_build_array('不愿测试事件顺序与重试的团队', '必须自托管的场景', '假设目录内每个 connector 都达到生产标准')
        )
      ),
      'editorial', jsonb_build_object(
        'reviewedAt', '2026-09-01',
        'reviewedBy', 'AI Best Tool editorial',
        'sourceUrl', 'https://pipedream.com/docs/pricing',
        'summary', jsonb_build_object(
          'en', 'Reviewed against current Workflows, Connect, credit, concurrency, retention, security, and ownership documentation.',
          'zh', '已根据当前 Workflows、Connect、credits、并发、保留、安全和归属文档完成核验。',
          'cn', '已根据当前 Workflows、Connect、credits、并发、保留、安全和归属文档完成核验。'
        ),
        'trustNote', jsonb_build_object(
          'en', 'Workday ownership and connector scale support durability, while the modest independent review sample and workload-specific reliability still require hands-on validation.',
          'zh', 'Workday 归属和 connector 规模支持持续性，但独立评价样本有限，且可靠性取决于具体负载，仍需实际验证。',
          'cn', 'Workday 归属和 connector 规模支持持续性，但独立评价样本有限，且可靠性取决于具体负载，仍需实际验证。'
        )
      ),
      'marketValidation', jsonb_build_object(
        'reviewedAt', '2026-09-01',
        'score', 92,
        'verdict', 'validated',
        'scores', jsonb_build_object('userValue', 23, 'independentValidation', 16, 'durability', 25, 'evidenceQuality', 18, 'strategicValue', 10),
        'strongSignals', jsonb_build_array('workday-acquisition-closed', 'workday-reported-3000-plus-connectors', 'active-2700-plus-app-catalog'),
        'supportingSignals', jsonb_build_array('g2-16-reviews-4.6', 'soc2-type2-available', 'active-workflows-and-connect-docs'),
        'evidenceUrls', jsonb_build_array(
          'https://investor.workday.com/files/doc_earnings/2026/q4/Earnings-Release-Q4FY26-022426_FOR-UPLOAD.pdf',
          'https://pipedream.com/workflows',
          'https://www.g2.com/products/pipedream/reviews',
          'https://pipedream.com/docs/pricing',
          'https://pipedream.com/docs/privacy-and-security'
        ),
        'rationale', jsonb_build_object(
          'en', 'Pipedream has strong durability evidence: Workday completed its acquisition and reported more than 3,000 connectors, while Pipedream remains actively documented across Workflows and Connect. G2 shows 16 reviews at 4.6/5, enough for independent signal but not enough for broad superiority claims. Continued coverage is justified, with production reliability and cost left as workload-specific decisions.',
          'zh', 'Pipedream 具备较强持续性证据：Workday 已完成收购并报告 3,000+ connectors，Pipedream 也持续维护 Workflows 与 Connect 文档。G2 为 16 条评价、4.6/5，足以提供独立信号，但不足以支持宽泛优势宣称。应持续收录，同时把生产可靠性和成本保留为具体负载下的决策。',
          'cn', 'Pipedream 具备较强持续性证据：Workday 已完成收购并报告 3,000+ connectors，Pipedream 也持续维护 Workflows 与 Connect 文档。G2 为 16 条评价、4.6/5，足以提供独立信号，但不足以支持宽泛优势宣称。应持续收录，同时把生产可靠性和成本保留为具体负载下的决策。'
        )
      )
    ),
    jsonb_build_object(
      'en', jsonb_build_array('Build event-driven API workflows', 'Process webhooks and scheduled jobs', 'Run custom code without managing servers', 'Embed integrations and MCP tools with Connect'),
      'zh', jsonb_build_array('构建事件驱动 API 工作流', '处理 webhook 与定时任务', '免服务器维护运行自定义代码', '通过 Connect 嵌入集成与 MCP tools'),
      'cn', jsonb_build_array('构建事件驱动 API 工作流', '处理 webhook 与定时任务', '免服务器维护运行自定义代码', '通过 Connect 嵌入集成与 MCP tools')
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
