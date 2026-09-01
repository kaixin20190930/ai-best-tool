DO $$
DECLARE
  target_id uuid := 'ef1cc4b5-98be-474b-b422-7b6f79ca6c3d';
  productivity_id uuid := '1d866b7d-6340-4a0b-8333-a301cc52172c';
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.tools WHERE name = 'cursor' AND id <> target_id
  ) THEN
    RAISE EXCEPTION 'Cannot migrate Cursor: another tool row already exists.';
  END IF;

  INSERT INTO public.tools (
    id, name, title, content, detail, url, image_url, thumbnail_url,
    category_id, tags, pricing, features, use_cases, screenshots, video_url,
    status, submitted_by, page_quality_status, next_review_date, created_at, updated_at
  ) VALUES (
    target_id,
    'cursor',
    jsonb_build_object(
      'en', 'Cursor AI Code Editor & Agents',
      'zh', 'Cursor AI 代码编辑器与 Agent',
      'cn', 'Cursor AI 代码编辑器与 Agent'
    ),
    jsonb_build_object(
      'en', 'Cursor is a VS Code-based development environment that combines tab completion, repository context, interactive and cloud agents, multi-file edits, terminal actions, and code review. It fits developers who want AI embedded throughout the editor, but buyers should test agent cost, human review, Privacy Mode, extension compatibility, and model continuity following the SpaceX acquisition.',
      'zh', 'Cursor 是基于 VS Code 的开发环境，整合了 Tab 补全、代码库上下文、交互式与云端 Agent、多文件修改、终端操作和代码审查。它适合希望 AI 深度嵌入编辑器的开发者，但采用前应测试 Agent 成本、人工审查、Privacy Mode、扩展兼容性，以及 SpaceX 收购后的模型连续性。',
      'cn', 'Cursor 是基于 VS Code 的开发环境，整合了 Tab 补全、代码库上下文、交互式与云端 Agent、多文件修改、终端操作和代码审查。它适合希望 AI 深度嵌入编辑器的开发者，但采用前应测试 Agent 成本、人工审查、Privacy Mode、扩展兼容性，以及 SpaceX 收购后的模型连续性。'
    ),
    jsonb_build_object(
      'en', E'## What Cursor is\n\nCursor is a VS Code-based editor and agent environment for code completion, repository questions, multi-file changes, terminal execution, cloud agents, automation, and code review. It combines its own models and routing with third-party models, so the editor experience, model supply, and billing cannot be evaluated as one permanent bundle.\n\n## Best fit\n\n- Developers who want repository-aware completion, edits, agents, terminal work, and review in one editor.\n- VS Code users who can pilot extension, settings, keybinding, remote-development, and policy compatibility before switching.\n- Teams prepared to review diffs, run tests, constrain agent permissions, and monitor per-user model spend.\n\n## Check before choosing\n\n- Hobby is free. Current monthly prices are Pro $20, Pro+ $60, Ultra $200, Teams Standard $40 per user, and Teams Premium $120 per user. Each plan includes finite model usage; on-demand usage continues beyond the included pool and is billed in arrears.\n- Model choice and agent intensity determine cost. The current pricing page recommends Pro+ for daily agent users and Ultra for agent power users; teams should pilot representative heavy users instead of assuming the base seat covers every workflow.\n- Privacy Mode is available on free and paid plans. When enabled, Customer Data is not used for training and Cursor says it maintains ZDR agreements, but requests still pass through Cursor for final prompt construction. Abuse classifiers can create an investigation-retention exception, and non-ZDR models require designation or admin opt-in.\n- With Privacy Mode off, codebase data, prompts, editor actions, snippets, and other code activity may be stored and used to improve or train Cursor models. A personal API key still does not bypass Cursor infrastructure.\n- Cursor officially became part of SpaceX on August 14, 2026. OpenAI announced on August 28 that it proposed ending direct model supply to Cursor on November 12, 2026. The cutoff is not yet complete, but teams dependent on OpenAI models should verify the transition plan before standardizing their editor workflow.\n- Agent-generated changes still require human review, tests, security checks, and rollback. Independent research across AI developer tools finds task-specific differences and maintainability risks, so company scale does not prove every generated change is production-ready.\n\n## Decision summary\n\nChoose Cursor when an integrated editor and agent loop creates more value than a modular VS Code, CLI-agent, or extension stack. Run a two-week pilot on representative repositories: measure accepted changes and review time, not generated lines; record model spend by user; test Privacy Mode and required extensions; and keep an export or fallback path for model and ownership changes.',
      'zh', E'## Cursor 是什么\n\nCursor 是基于 VS Code 的编辑器与 Agent 环境，用于代码补全、代码库问答、多文件修改、终端执行、云端 Agent、自动化和代码审查。它组合自研模型、路由和第三方模型，因此编辑器体验、模型供应与计费不能被视为永远不变的单一套餐。\n\n## 更适合\n\n- 希望在一个编辑器内完成代码库感知补全、修改、Agent、终端与审查的开发者。\n- 能够在迁移前验证扩展、设置、快捷键、远程开发和策略兼容性的 VS Code 用户。\n- 愿意审查 diff、运行测试、限制 Agent 权限并监控个人模型支出的团队。\n\n## 选择前必须核对\n\n- Hobby 免费。当前月付价格为 Pro $20、Pro+ $60、Ultra $200、Teams Standard $40/用户、Teams Premium $120/用户。每个套餐只包含有限模型用量；超出后可继续按量使用并在之后结算。\n- 模型选择和 Agent 使用强度决定成本。当前定价页建议日常 Agent 用户选择 Pro+、高强度用户选择 Ultra；团队应让代表性重度用户先试用，而不是假设基础席位覆盖所有工作流。\n- Privacy Mode 对免费与付费用户开放。启用后 Customer Data 不用于训练，且 Cursor 表示使用 ZDR 协议，但请求仍会经过 Cursor 进行最终 prompt 构建。滥用分类器可能形成调查留存例外，非 ZDR 模型需要显式标记或管理员选择启用。\n- 关闭 Privacy Mode 后，代码库数据、prompt、编辑动作、代码片段和其他代码活动可能被存储，并用于改进或训练 Cursor 模型。使用个人 API key 也不会绕过 Cursor 基础设施。\n- Cursor 已于 2026 年 8 月 14 日正式成为 SpaceX 的一部分。OpenAI 于 8 月 28 日宣布，提议在 11 月 12 日停止向 Cursor 直接提供模型。切换尚未完成，但依赖 OpenAI 模型的团队应在标准化编辑器流程前核实过渡方案。\n- Agent 生成的修改仍需要人工审查、测试、安全检查和回滚。关于 AI 开发工具的独立研究显示不同任务表现存在差异且可能引入可维护性风险，因此公司规模不能证明每项生成修改都达到生产标准。\n\n## 决策结论\n\n当集成式编辑器与 Agent 闭环比模块化 VS Code、CLI Agent 或扩展组合创造更多价值时，可以选择 Cursor。建议在代表性代码库进行两周试用：测量被接受的修改和审查时间，而不是生成行数；记录每位用户的模型支出；测试 Privacy Mode 与必要扩展；并为模型和所有权变化保留导出或替代路径。',
      'cn', E'## Cursor 是什么\n\nCursor 是基于 VS Code 的编辑器与 Agent 环境，用于代码补全、代码库问答、多文件修改、终端执行、云端 Agent、自动化和代码审查。它组合自研模型、路由和第三方模型，因此编辑器体验、模型供应与计费不能被视为永远不变的单一套餐。\n\n## 更适合\n\n- 希望在一个编辑器内完成代码库感知补全、修改、Agent、终端与审查的开发者。\n- 能够在迁移前验证扩展、设置、快捷键、远程开发和策略兼容性的 VS Code 用户。\n- 愿意审查 diff、运行测试、限制 Agent 权限并监控个人模型支出的团队。\n\n## 选择前必须核对\n\n- Hobby 免费。当前月付价格为 Pro $20、Pro+ $60、Ultra $200、Teams Standard $40/用户、Teams Premium $120/用户。每个套餐只包含有限模型用量；超出后可继续按量使用并在之后结算。\n- 模型选择和 Agent 使用强度决定成本。当前定价页建议日常 Agent 用户选择 Pro+、高强度用户选择 Ultra；团队应让代表性重度用户先试用，而不是假设基础席位覆盖所有工作流。\n- Privacy Mode 对免费与付费用户开放。启用后 Customer Data 不用于训练，且 Cursor 表示使用 ZDR 协议，但请求仍会经过 Cursor 进行最终 prompt 构建。滥用分类器可能形成调查留存例外，非 ZDR 模型需要显式标记或管理员选择启用。\n- 关闭 Privacy Mode 后，代码库数据、prompt、编辑动作、代码片段和其他代码活动可能被存储，并用于改进或训练 Cursor 模型。使用个人 API key 也不会绕过 Cursor 基础设施。\n- Cursor 已于 2026 年 8 月 14 日正式成为 SpaceX 的一部分。OpenAI 于 8 月 28 日宣布，提议在 11 月 12 日停止向 Cursor 直接提供模型。切换尚未完成，但依赖 OpenAI 模型的团队应在标准化编辑器流程前核实过渡方案。\n- Agent 生成的修改仍需要人工审查、测试、安全检查和回滚。关于 AI 开发工具的独立研究显示不同任务表现存在差异且可能引入可维护性风险，因此公司规模不能证明每项生成修改都达到生产标准。\n\n## 决策结论\n\n当集成式编辑器与 Agent 闭环比模块化 VS Code、CLI Agent 或扩展组合创造更多价值时，可以选择 Cursor。建议在代表性代码库进行两周试用：测量被接受的修改和审查时间，而不是生成行数；记录每位用户的模型支出；测试 Privacy Mode 与必要扩展；并为模型和所有权变化保留导出或替代路径。'
    ),
    'https://cursor.com/',
    'https://cursor.com/marketing-static/favicon.ico',
    'https://cursor.com/marketing-static/og/opengraph-default.png',
    productivity_id,
    ARRAY['ai-coding', 'code-editor', 'coding-agent', 'developer-tools'],
    'freemium',
    jsonb_build_object(
      'localized', jsonb_build_object(
        'en', jsonb_build_array(
          jsonb_build_object('label', 'Workflow boundary', 'value', 'Integrated editor and agents improve context flow, but accepted changes still need review, tests, and rollback.'),
          jsonb_build_object('label', 'Cost boundary', 'value', 'Plan price and included model usage are separate constraints; agent-heavy work can trigger on-demand billing.'),
          jsonb_build_object('label', 'Continuity boundary', 'value', 'SpaceX ownership and the proposed OpenAI cutoff make model availability a live migration consideration.')
        ),
        'zh', jsonb_build_array(
          jsonb_build_object('label', '工作流边界', 'value', '集成式编辑器与 Agent 改善上下文闭环，但被接受的修改仍需审查、测试和回滚。'),
          jsonb_build_object('label', '成本边界', 'value', '套餐价格和包含的模型用量是两个约束；高频 Agent 工作可能触发按量计费。'),
          jsonb_build_object('label', '连续性边界', 'value', 'SpaceX 所有权与 OpenAI 拟停止直供，使模型可用性成为当前迁移决策。')
        ),
        'cn', jsonb_build_array(
          jsonb_build_object('label', '工作流边界', 'value', '集成式编辑器与 Agent 改善上下文闭环，但被接受的修改仍需审查、测试和回滚。'),
          jsonb_build_object('label', '成本边界', 'value', '套餐价格和包含的模型用量是两个约束；高频 Agent 工作可能触发按量计费。'),
          jsonb_build_object('label', '连续性边界', 'value', 'SpaceX 所有权与 OpenAI 拟停止直供，使模型可用性成为当前迁移决策。')
        )
      ),
      'audience', jsonb_build_object(
        'bestFit', jsonb_build_object(
          'en', jsonb_build_array('VS Code users adopting integrated agents', 'Repository-aware multi-file work', 'Teams with disciplined review and spend controls'),
          'zh', jsonb_build_array('采用集成式 Agent 的 VS Code 用户', '代码库感知的多文件工作', '具备严格审查和成本控制的团队'),
          'cn', jsonb_build_array('采用集成式 Agent 的 VS Code 用户', '代码库感知的多文件工作', '具备严格审查和成本控制的团队')
        ),
        'notIdealFor', jsonb_build_object(
          'en', jsonb_build_array('Assuming generated code needs no review', 'Fixed-cost heavy agent use without a pilot', 'Workflows that cannot tolerate model-supply changes'),
          'zh', jsonb_build_array('假设生成代码无需审查', '未经试用就要求高频 Agent 固定成本', '无法承受模型供应变化的工作流'),
          'cn', jsonb_build_array('假设生成代码无需审查', '未经试用就要求高频 Agent 固定成本', '无法承受模型供应变化的工作流')
        )
      ),
      'editorial', jsonb_build_object(
        'reviewedAt', '2026-09-01',
        'reviewedBy', 'AI Best Tool editorial',
        'sourceUrl', 'https://cursor.com/pricing',
        'summary', jsonb_build_object(
          'en', 'Reviewed against current pricing, Privacy Mode, security, SpaceX ownership, OpenAI model-supply, market, and independent research sources.',
          'zh', '已根据当前定价、Privacy Mode、安全、SpaceX 所有权、OpenAI 模型供应、市场与独立研究来源完成核验。',
          'cn', '已根据当前定价、Privacy Mode、安全、SpaceX 所有权、OpenAI 模型供应、市场与独立研究来源完成核验。'
        ),
        'trustNote', jsonb_build_object(
          'en', 'Market maturity is exceptional, but model availability, data controls, generated-code quality, and per-user economics remain workload-specific.',
          'zh', '市场成熟度很强，但模型可用性、数据控制、生成代码质量和个人成本仍取决于具体工作流。',
          'cn', '市场成熟度很强，但模型可用性、数据控制、生成代码质量和个人成本仍取决于具体工作流。'
        )
      ),
      'marketValidation', jsonb_build_object(
        'reviewedAt', '2026-09-01',
        'score', 98,
        'verdict', 'validated',
        'scores', jsonb_build_object('userValue', 25, 'independentValidation', 22, 'durability', 25, 'evidenceQuality', 18, 'strategicValue', 8),
        'strongSignals', jsonb_build_array('official-millions-of-developers', 'official-1b-plus-annualized-revenue-2025', 'spacex-acquisition-completed-2026'),
        'supportingSignals', jsonb_build_array('bloomberg-reported-2b-run-rate-2026', 'techcrunch-series-d-validation', 'independent-task-specific-agent-research'),
        'evidenceUrls', jsonb_build_array(
          'https://cursor.com/blog/series-d',
          'https://cursor.com/blog/joining-spacex',
          'https://www.bloomberg.com/news/articles/2026-03-02/cursor-recurring-revenue-doubles-in-three-months-to-2-billion',
          'https://techcrunch.com/2025/11/13/coding-assistant-cursor-raises-2-3b-5-months-after-its-previous-round/',
          'https://arxiv.org/abs/2602.08915'
        ),
        'rationale', jsonb_build_object(
          'en', 'Cursor reported millions of developers and more than $1B in annualized revenue in its Series D announcement; Bloomberg later reported a $2B run rate, and SpaceX completed the acquisition in August 2026. These establish exceptional durability and adoption, while independent agent research and the proposed OpenAI supply cutoff show why task performance and model continuity must remain explicit decision boundaries.',
          'zh', 'Cursor 在 Series D 公告中披露数百万开发者和超过 10 亿美元年化收入，Bloomberg 后续报道年化收入达到 20 亿美元，SpaceX 又于 2026 年 8 月完成收购。这些信号证明其持续性和采用规模很强；但独立 Agent 研究与 OpenAI 拟停止直供也说明，任务表现和模型连续性必须保留为明确决策边界。',
          'cn', 'Cursor 在 Series D 公告中披露数百万开发者和超过 10 亿美元年化收入，Bloomberg 后续报道年化收入达到 20 亿美元，SpaceX 又于 2026 年 8 月完成收购。这些信号证明其持续性和采用规模很强；但独立 Agent 研究与 OpenAI 拟停止直供也说明，任务表现和模型连续性必须保留为明确决策边界。'
        )
      )
    ),
    jsonb_build_object(
      'en', jsonb_build_array('Repository-aware completion and chat', 'Multi-file agent changes', 'Cloud and background agent work', 'Integrated diff and code review'),
      'zh', jsonb_build_array('代码库感知补全与问答', '多文件 Agent 修改', '云端与后台 Agent 工作', '集成式 diff 与代码审查'),
      'cn', jsonb_build_array('代码库感知补全与问答', '多文件 Agent 修改', '云端与后台 Agent 工作', '集成式 diff 与代码审查')
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
