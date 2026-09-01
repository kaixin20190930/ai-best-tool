DO $$
DECLARE
  target_id uuid := 'c0bb3aba-33be-4e14-903e-5f1d036eec4a';
  productivity_id uuid := '1d866b7d-6340-4a0b-8333-a301cc52172c';
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.tools WHERE name = 'make' AND id <> target_id
  ) THEN
    RAISE EXCEPTION 'Cannot migrate Make: another tool row already exists.';
  END IF;

  INSERT INTO public.tools (
    id, name, title, content, detail, url, image_url, thumbnail_url,
    category_id, tags, pricing, features, use_cases, screenshots, video_url,
    status, submitted_by, page_quality_status, next_review_date, created_at, updated_at
  ) VALUES (
    target_id,
    'make',
    jsonb_build_object(
      'en', 'Make Visual Workflow Automation',
      'zh', 'Make 可视化工作流自动化',
      'cn', 'Make 可视化工作流自动化'
    ),
    jsonb_build_object(
      'en', 'Make is a cloud visual automation platform for connecting apps, APIs, AI tools, and multi-step business processes. Its canvas makes branching logic easier to inspect than a linear builder, but cost depends on every module action and some AI features use dynamic credits. Buyers should model real scenario runs, failure handling, data region, team controls, and whether managed cloud is acceptable.',
      'zh', 'Make 是用于连接应用、API、AI 工具和多步骤业务流程的云端可视化自动化平台。它的画布比线性搭建器更便于检查分支逻辑，但成本取决于每个模块动作，部分 AI 功能还会动态消耗 credits。选择前应按真实 scenario 测算运行量、异常处理、数据区域、团队权限，并确认能否接受托管云。',
      'cn', 'Make 是用于连接应用、API、AI 工具和多步骤业务流程的云端可视化自动化平台。它的画布比线性搭建器更便于检查分支逻辑，但成本取决于每个模块动作，部分 AI 功能还会动态消耗 credits。选择前应按真实 scenario 测算运行量、异常处理、数据区域、团队权限，并确认能否接受托管云。'
    ),
    jsonb_build_object(
      'en', E'## What Make is\n\nMake provides a visual canvas for scenarios that connect apps, webhooks, APIs, data transformations, code, and AI steps. It is positioned between simple linear automation and developer-operated workflow infrastructure: non-developers can inspect the flow, while technical operators can add routers, iterators, error handlers, APIs, and custom code.\n\n## Best fit\n\n- Operations, marketing, revenue, and product teams building multi-app workflows with visible branches and data mapping.\n- Technical operators who need more logic depth than a basic trigger-action builder but do not want to operate automation infrastructure.\n- Teams willing to test representative scenarios and monitor credit use rather than buying from the headline monthly price alone.\n\n## Check before choosing\n\n- At the reviewed 10,000-credit setting with annual billing selected, Core is $9/month, Pro is $16/month, and Teams is $29/month. Free includes 1,000 credits, two active scenarios, a 15-minute minimum schedule interval, and seven days of execution logs.\n- Most module actions consume one credit, including reading, writing, searching, transforming, aggregating, and iterating data. A single scenario run can consume from two to thousands of credits depending on records and branches.\n- Make AI Provider usage can vary by operations, tokens, model, file size, pages, or processing time. With a custom provider connection, Make charges operation credits while the model provider bills tokens separately.\n- When credits run out, scenarios stop until credits are added. Incoming webhooks are queued only up to the purchased queue allowance, so critical workflows need alerts, capacity planning, and failure recovery.\n- An organization chooses a US or EU data center when it is created, and the region cannot later be changed. Confirm location, connected-service data flows, execution-log retention, and access roles before moving sensitive workloads.\n- Make is a managed cloud product rather than a self-hosted workflow engine. Teams requiring infrastructure ownership, offline deployment, or source-level control should compare n8n or a code-first alternative.\n- G2 has hundreds of reviews and repeatedly highlights visual flexibility and integration breadth. The recurring tradeoffs are learning advanced mapping and debugging, support friction, and forecasting credits for complex scenarios.\n\n## Decision summary\n\nChoose Make when a shared visual model helps the team understand and maintain meaningful multi-step automation. Pilot one low-volume workflow and one realistic branching workflow. Record credits per successful outcome, failed-run recovery, setup time, log usefulness, and the number of people who can safely edit it. Keep Make only if visual control reduces operational effort after credit and governance costs are included.',
      'zh', E'## Make 是什么\n\nMake 使用可视化画布构建 scenario，连接应用、webhook、API、数据转换、代码和 AI 步骤。它处于简单线性自动化与开发者自建工作流基础设施之间：非开发者可以查看流程，技术运营人员也能加入 router、iterator、error handler、API 和自定义代码。\n\n## 更适合\n\n- 构建多应用流程，并需要清楚查看分支与数据映射的运营、营销、营收和产品团队。\n- 需要比基础 trigger-action 更深逻辑、但不想维护自动化基础设施的技术运营人员。\n- 愿意运行代表性 scenario 并监控 credits，而不是只看首页月费购买的团队。\n\n## 选择前必须核对\n\n- 在本次核验的 10,000 credits 档位和年付设置下，Core 为 $9/月、Pro 为 $16/月、Teams 为 $29/月。Free 包含 1,000 credits、2 个 active scenarios、最短 15 分钟调度间隔和 7 天 execution logs。\n- 大多数模块动作消耗 1 credit，包括读取、写入、搜索、转换、聚合和迭代数据。根据记录数和分支数量，一次 scenario 运行可能消耗 2 到数千 credits。\n- Make AI Provider 的消耗可能随 operations、tokens、模型、文件大小、页数或处理时间变化。使用自有 provider connection 时，Make 收取 operation credits，模型商另收 token 费用。\n- credits 用完后 scenario 会停止，incoming webhooks 只会在已购买的 queue allowance 内排队；关键流程必须设置告警、容量计划和失败恢复。\n- organization 创建时选择美国或欧盟数据中心，之后不能更改。迁移敏感工作负载前，应确认位置、连接服务的数据流、execution-log 保留和访问角色。\n- Make 是托管云产品，不是自托管工作流引擎。要求基础设施所有权、离线部署或源码级控制的团队，应比较 n8n 或 code-first 方案。\n- G2 有数百条评价，反复认可可视化灵活性和集成广度；常见代价是高级映射与调试的学习成本、支持摩擦，以及复杂 scenario 的 credits 难以预估。\n\n## 决策结论\n\n当共享可视化模型能帮助团队理解和维护重要的多步骤自动化时，可以选择 Make。建议同时试用一个低流量流程和一个真实分支流程，记录每个成功结果消耗的 credits、失败恢复、搭建时间、日志有效性，以及可以安全编辑流程的人数。只有把 credits 与治理成本计入后仍能降低运营工作量，才值得保留。',
      'cn', E'## Make 是什么\n\nMake 使用可视化画布构建 scenario，连接应用、webhook、API、数据转换、代码和 AI 步骤。它处于简单线性自动化与开发者自建工作流基础设施之间：非开发者可以查看流程，技术运营人员也能加入 router、iterator、error handler、API 和自定义代码。\n\n## 更适合\n\n- 构建多应用流程，并需要清楚查看分支与数据映射的运营、营销、营收和产品团队。\n- 需要比基础 trigger-action 更深逻辑、但不想维护自动化基础设施的技术运营人员。\n- 愿意运行代表性 scenario 并监控 credits，而不是只看首页月费购买的团队。\n\n## 选择前必须核对\n\n- 在本次核验的 10,000 credits 档位和年付设置下，Core 为 $9/月、Pro 为 $16/月、Teams 为 $29/月。Free 包含 1,000 credits、2 个 active scenarios、最短 15 分钟调度间隔和 7 天 execution logs。\n- 大多数模块动作消耗 1 credit，包括读取、写入、搜索、转换、聚合和迭代数据。根据记录数和分支数量，一次 scenario 运行可能消耗 2 到数千 credits。\n- Make AI Provider 的消耗可能随 operations、tokens、模型、文件大小、页数或处理时间变化。使用自有 provider connection 时，Make 收取 operation credits，模型商另收 token 费用。\n- credits 用完后 scenario 会停止，incoming webhooks 只会在已购买的 queue allowance 内排队；关键流程必须设置告警、容量计划和失败恢复。\n- organization 创建时选择美国或欧盟数据中心，之后不能更改。迁移敏感工作负载前，应确认位置、连接服务的数据流、execution-log 保留和访问角色。\n- Make 是托管云产品，不是自托管工作流引擎。要求基础设施所有权、离线部署或源码级控制的团队，应比较 n8n 或 code-first 方案。\n- G2 有数百条评价，反复认可可视化灵活性和集成广度；常见代价是高级映射与调试的学习成本、支持摩擦，以及复杂 scenario 的 credits 难以预估。\n\n## 决策结论\n\n当共享可视化模型能帮助团队理解和维护重要的多步骤自动化时，可以选择 Make。建议同时试用一个低流量流程和一个真实分支流程，记录每个成功结果消耗的 credits、失败恢复、搭建时间、日志有效性，以及可以安全编辑流程的人数。只有把 credits 与治理成本计入后仍能降低运营工作量，才值得保留。'
    ),
    'https://www.make.com/',
    '/icons/tool-logos/make.svg',
    '/images/tool-media/make-cover.svg',
    productivity_id,
    ARRAY['workflow-automation', 'visual-automation', 'no-code', 'ai-agents'],
    'freemium',
    jsonb_build_object(
      'localized', jsonb_build_object(
        'en', jsonb_build_array(
          jsonb_build_object('label', 'Cost boundary', 'value', 'Credits are consumed per module action; AI and high-volume scenarios can use variable amounts.'),
          jsonb_build_object('label', 'Reliability boundary', 'value', 'Scenarios stop when credits run out, subject to the available webhook queue allowance.'),
          jsonb_build_object('label', 'Hosting boundary', 'value', 'Make is managed cloud; the organization data region is selected once and cannot be changed later.')
        ),
        'zh', jsonb_build_array(
          jsonb_build_object('label', '成本边界', 'value', 'credits 按模块动作消耗；AI 与高流量 scenario 的用量可能动态变化。'),
          jsonb_build_object('label', '可靠性边界', 'value', 'credits 用完后 scenario 会停止，并受可用 webhook queue allowance 限制。'),
          jsonb_build_object('label', '托管边界', 'value', 'Make 是托管云；organization 数据区域只在创建时选择，之后不能修改。')
        ),
        'cn', jsonb_build_array(
          jsonb_build_object('label', '成本边界', 'value', 'credits 按模块动作消耗；AI 与高流量 scenario 的用量可能动态变化。'),
          jsonb_build_object('label', '可靠性边界', 'value', 'credits 用完后 scenario 会停止，并受可用 webhook queue allowance 限制。'),
          jsonb_build_object('label', '托管边界', 'value', 'Make 是托管云；organization 数据区域只在创建时选择，之后不能修改。')
        )
      ),
      'audience', jsonb_build_object(
        'bestFit', jsonb_build_object(
          'en', jsonb_build_array('Visual multi-app workflows', 'Operations and marketing automation', 'Managed automation with branching logic'),
          'zh', jsonb_build_array('可视化多应用工作流', '运营与营销自动化', '带分支逻辑的托管自动化'),
          'cn', jsonb_build_array('可视化多应用工作流', '运营与营销自动化', '带分支逻辑的托管自动化')
        ),
        'notIdealFor', jsonb_build_object(
          'en', jsonb_build_array('Self-hosting or offline deployment', 'Teams unwilling to model credit usage', 'Simple automations that do not justify a visual workflow platform'),
          'zh', jsonb_build_array('要求自托管或离线部署', '不愿测算 credits 的团队', '不需要可视化工作流平台的简单自动化'),
          'cn', jsonb_build_array('要求自托管或离线部署', '不愿测算 credits 的团队', '不需要可视化工作流平台的简单自动化')
        )
      ),
      'editorial', jsonb_build_object(
        'reviewedAt', '2026-09-01',
        'reviewedBy', 'AI Best Tool editorial',
        'sourceUrl', 'https://www.make.com/en/pricing',
        'summary', jsonb_build_object(
          'en', 'Reviewed against current pricing, credit, AI-provider, data-region, security, plan-limit, and independent-review sources.',
          'zh', '已根据当前定价、credits、AI provider、数据区域、安全、套餐限制和独立评价来源完成核验。',
          'cn', '已根据当前定价、credits、AI provider、数据区域、安全、套餐限制和独立评价来源完成核验。'
        ),
        'trustNote', jsonb_build_object(
          'en', 'Large adoption and review signals validate durability, while workflow-level credit cost and maintainability still require a representative pilot.',
          'zh', '大量采用和评价信号证明产品持续性，但工作流级 credits 成本与可维护性仍需代表性试用验证。',
          'cn', '大量采用和评价信号证明产品持续性，但工作流级 credits 成本与可维护性仍需代表性试用验证。'
        )
      ),
      'marketValidation', jsonb_build_object(
        'reviewedAt', '2026-09-01',
        'score', 95,
        'verdict', 'validated',
        'scores', jsonb_build_object('userValue', 24, 'independentValidation', 22, 'durability', 24, 'evidenceQuality', 17, 'strategicValue', 8),
        'strongSignals', jsonb_build_array('g2-344-reviews', 'official-350000-plus-users', 'celonis-acquisition-and-continued-operation'),
        'supportingSignals', jsonb_build_array('g2-4.6-rating', 'current-capterra-review-presence', 'soc2-type2-and-soc3-audits'),
        'evidenceUrls', jsonb_build_array(
          'https://www.g2.com/products/integromat-by-celonis-make/reviews',
          'https://www.g2.com/sellers/integromat-by-celonis',
          'https://www.capterra.com/p/154278/Integromat/',
          'https://www.make.com/en/pricing',
          'https://www.make.com/en/security',
          'https://help.make.com/credits'
        ),
        'rationale', jsonb_build_object(
          'en', 'Make has hundreds of G2 reviews, a large disclosed user base, continued operation under Celonis, and current security and product documentation. These provide strong adoption and durability evidence. Reviews consistently support the visual builder and integration breadth while also identifying advanced-workflow learning, debugging, support, and credit forecasting as real friction, so validation does not remove the need for a workload pilot.',
          'zh', 'Make 拥有数百条 G2 评价、公开的大规模用户基础、被 Celonis 收购后的持续运营，以及仍在更新的安全和产品文档，构成较强的采用与持续性证据。评价持续认可可视化搭建器和集成广度，也明确指出高级工作流学习、调试、支持和 credits 预估摩擦，因此市场验证通过并不替代具体负载试用。',
          'cn', 'Make 拥有数百条 G2 评价、公开的大规模用户基础、被 Celonis 收购后的持续运营，以及仍在更新的安全和产品文档，构成较强的采用与持续性证据。评价持续认可可视化搭建器和集成广度，也明确指出高级工作流学习、调试、支持和 credits 预估摩擦，因此市场验证通过并不替代具体负载试用。'
        )
      )
    ),
    jsonb_build_object(
      'en', jsonb_build_array('Build visual multi-app workflows', 'Automate marketing and revenue operations', 'Route and transform data with branching logic', 'Add AI agents and provider-backed AI steps'),
      'zh', jsonb_build_array('构建可视化多应用工作流', '自动化营销与营收运营', '使用分支逻辑路由和转换数据', '加入 AI Agent 与 provider 支持的 AI 步骤'),
      'cn', jsonb_build_array('构建可视化多应用工作流', '自动化营销与营收运营', '使用分支逻辑路由和转换数据', '加入 AI Agent 与 provider 支持的 AI 步骤')
    ),
    ARRAY[]::text[],
    NULL,
    'published',
    NULL,
    'continue_index',
    DATE '2026-09-15',
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
