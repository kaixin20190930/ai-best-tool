DO $$
DECLARE
  target_id uuid := '149cf3e0-5f5c-4bdf-ac02-80ec5064fb92';
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.tools
    WHERE name = 'claude'
      AND id <> target_id
  ) THEN
    RAISE EXCEPTION 'Cannot consolidate Anthropic: another Claude tool row already exists.';
  END IF;

  UPDATE public.tools
  SET
    name = 'claude',
    title = jsonb_build_object(
      'en', 'Claude by Anthropic',
      'zh', 'Claude（Anthropic）',
      'cn', 'Claude（Anthropic）'
    ),
    content = jsonb_build_object(
      'en', 'Claude is Anthropic''s general AI assistant for writing, research, analysis, coding, files, web search, and connected-work workflows. Evaluate it by task fit, variable usage limits, data controls, and whether a consumer or organization plan matches your work.',
      'zh', 'Claude 是 Anthropic 推出的通用 AI 助手，覆盖写作、研究、分析、编程、文件、联网搜索和连接工作应用等任务。选择时应重点核对任务适配、动态用量限制、数据控制以及个人或组织套餐边界。',
      'cn', 'Claude 是 Anthropic 推出的通用 AI 助手，覆盖写作、研究、分析、编程、文件、联网搜索和连接工作应用等任务。选择时应重点核对任务适配、动态用量限制、数据控制以及个人或组织套餐边界。'
    ),
    detail = jsonb_build_object(
      'en', E'## What Claude is\n\nClaude is Anthropic''s assistant for conversational work, document analysis, research, coding, and creating reusable outputs. Claude, Claude Code, and the Anthropic API have related but separate billing and data boundaries.\n\n## Best fit\n\n- People who need long-form writing, synthesis, file analysis, research, or coding help.\n- Individuals who want Projects, Artifacts, web search, and connected tools in one assistant.\n- Teams that need organization controls and permission-aware workplace search.\n\n## Check before choosing\n\n- Free, Pro, and Max usage is variable rather than a guaranteed message count. Message length, attachments, conversation length, models, and tools affect capacity.\n- A Claude subscription does not include Anthropic API usage; API billing is configured separately.\n- Consumer and organization plans have different retention, training, administration, and connector policies.\n- Pro is $20 monthly or $200 annually in the US; Max 5x and Max 20x are $100 and $200 monthly. Pricing and taxes can vary by region.\n\n## Decision summary\n\nChoose Claude when its writing, research, coding, file, and connected-work workflows fit your main tasks and its variable allowance is acceptable. Compare alternatives when you need a different integration ecosystem, predictable usage economics, or a stricter data boundary.',
      'zh', E'## Claude 是什么\n\nClaude 是 Anthropic 推出的 AI 助手，可用于对话式工作、文档分析、研究、编程和生成可复用成果。Claude、Claude Code 与 Anthropic API 相互关联，但计费和数据边界并不相同。\n\n## 更适合\n\n- 需要长文写作、信息综合、文件分析、研究或编程协助的个人。\n- 希望在一个助手中使用 Projects、Artifacts、联网搜索和连接工具的用户。\n- 需要组织管理与权限感知企业搜索的团队。\n\n## 选择前必须核对\n\n- Free、Pro 和 Max 的用量不是固定消息数；消息长度、附件、对话长度、模型和工具都会影响可用额度。\n- Claude 订阅不包含 Anthropic API 用量，API 需要单独开通和计费。\n- 个人与组织套餐的数据保留、训练、管理和连接器政策不同。\n- 美国地区 Pro 为 $20/月或 $200/年；Max 5x 和 Max 20x 分别为 $100/月和 $200/月，其他地区价格与税费可能不同。\n\n## 决策结论\n\n如果 Claude 的写作、研究、编程、文件和连接工作流符合核心任务，而且你能接受动态额度，它值得优先考虑；如果更看重另一套集成生态、可预测成本或更严格的数据边界，应继续比较替代方案。',
      'cn', E'## Claude 是什么\n\nClaude 是 Anthropic 推出的 AI 助手，可用于对话式工作、文档分析、研究、编程和生成可复用成果。Claude、Claude Code 与 Anthropic API 相互关联，但计费和数据边界并不相同。\n\n## 更适合\n\n- 需要长文写作、信息综合、文件分析、研究或编程协助的个人。\n- 希望在一个助手中使用 Projects、Artifacts、联网搜索和连接工具的用户。\n- 需要组织管理与权限感知企业搜索的团队。\n\n## 选择前必须核对\n\n- Free、Pro 和 Max 的用量不是固定消息数；消息长度、附件、对话长度、模型和工具都会影响可用额度。\n- Claude 订阅不包含 Anthropic API 用量，API 需要单独开通和计费。\n- 个人与组织套餐的数据保留、训练、管理和连接器政策不同。\n- 美国地区 Pro 为 $20/月或 $200/年；Max 5x 和 Max 20x 分别为 $100/月和 $200/月，其他地区价格与税费可能不同。\n\n## 决策结论\n\n如果 Claude 的写作、研究、编程、文件和连接工作流符合核心任务，而且你能接受动态额度，它值得优先考虑；如果更看重另一套集成生态、可预测成本或更严格的数据边界，应继续比较替代方案。'
    ),
    url = 'https://claude.ai/',
    tags = ARRAY['ai-assistant', 'research', 'writing', 'coding'],
    pricing = 'freemium',
    use_cases = jsonb_build_object(
      'en', jsonb_build_array('Analyze documents and files', 'Research and synthesize information', 'Write and revise long-form content', 'Build and review code'),
      'zh', jsonb_build_array('分析文档与文件', '研究并综合信息', '撰写和修改长篇内容', '编写和审查代码'),
      'cn', jsonb_build_array('分析文档与文件', '研究并综合信息', '撰写和修改长篇内容', '编写和审查代码')
    ),
    features = COALESCE(features, '{}'::jsonb) || jsonb_build_object(
      'editorial', jsonb_build_object(
        'reviewedAt', '2026-09-01',
        'reviewedBy', 'AI Best Tool editorial',
        'sourceUrl', 'https://support.claude.com/en/articles/11049762-choose-a-claude-plan',
        'summary', jsonb_build_object(
          'en', 'Reviewed against current Claude plan, usage, data-retention, and product documentation.',
          'zh', '已根据 Claude 当前套餐、用量、数据保留和产品文档完成编辑核验。',
          'cn', '已根据 Claude 当前套餐、用量、数据保留和产品文档完成编辑核验。'
        ),
        'trustNote', jsonb_build_object(
          'en', 'Plan limits and product capabilities change; verify the live account and checkout before purchase.',
          'zh', '套餐额度和产品能力会变化，购买前应复核当前账号和结账页。',
          'cn', '套餐额度和产品能力会变化，购买前应复核当前账号和结账页。'
        )
      ),
      'audience', jsonb_build_object(
        'bestFit', jsonb_build_object(
          'en', jsonb_build_array('Long-form writing and synthesis', 'Research and file analysis', 'Coding and connected knowledge work'),
          'zh', jsonb_build_array('长文写作与信息综合', '研究和文件分析', '编程与连接型知识工作'),
          'cn', jsonb_build_array('长文写作与信息综合', '研究和文件分析', '编程与连接型知识工作')
        ),
        'notIdealFor', jsonb_build_object(
          'en', jsonb_build_array('Users who require a fixed message allowance', 'Buyers who assume a chat subscription includes API usage', 'Teams that have not reviewed retention and connector policies'),
          'zh', jsonb_build_array('必须获得固定消息额度的用户', '认为聊天订阅包含 API 用量的购买者', '尚未审查保留与连接器政策的团队'),
          'cn', jsonb_build_array('必须获得固定消息额度的用户', '认为聊天订阅包含 API 用量的购买者', '尚未审查保留与连接器政策的团队')
        )
      )
    ),
    page_quality_status = 'continue_index',
    next_review_date = DATE '2026-10-01',
    updated_at = NOW()
  WHERE id = target_id
    AND name IN ('anthropic', 'claude');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Expected Anthropic tool row was not found.';
  END IF;
END $$;
