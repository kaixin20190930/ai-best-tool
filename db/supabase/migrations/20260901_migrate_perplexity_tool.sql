DO $$
DECLARE
  target_id uuid := '3d018623-85f9-4df4-bd55-9a4a0e7a2d93';
  productivity_id uuid := '1d866b7d-6340-4a0b-8333-a301cc52172c';
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.tools WHERE name = 'perplexity' AND id <> target_id
  ) THEN
    RAISE EXCEPTION 'Cannot migrate Perplexity: another tool row already exists.';
  END IF;

  INSERT INTO public.tools (
    id, name, title, content, detail, url, image_url, thumbnail_url,
    category_id, tags, pricing, features, use_cases, screenshots, video_url,
    status, submitted_by, page_quality_status, next_review_date, created_at, updated_at
  ) VALUES (
    target_id,
    'perplexity',
    jsonb_build_object(
      'en', 'Perplexity AI Search & Research',
      'zh', 'Perplexity AI 搜索与研究',
      'cn', 'Perplexity AI 搜索与研究'
    ),
    jsonb_build_object(
      'en', 'Perplexity is an answer engine for web search, cited research, follow-up questions, files, and deeper multi-source reports. It is strongest as a fast research starting point, not as proof that every generated claim is correct. Buyers should compare source quality, original-page verification, plan allowances, model access, file retention, and consumer versus enterprise data controls.',
      'zh', 'Perplexity 是面向网页搜索、带引用研究、追问、文件和多来源深度报告的答案引擎。它最适合作为快速研究起点，而不能证明每条生成结论都准确。选择前应比较来源质量、原文核读、套餐额度、模型访问、文件留存，以及消费者与企业数据控制。',
      'cn', 'Perplexity 是面向网页搜索、带引用研究、追问、文件和多来源深度报告的答案引擎。它最适合作为快速研究起点，而不能证明每条生成结论都准确。选择前应比较来源质量、原文核读、套餐额度、模型访问、文件留存，以及消费者与企业数据控制。'
    ),
    jsonb_build_object(
      'en', E'## What Perplexity is\n\nPerplexity combines live web search, conversational answers, citations, Pro Search, Research, file analysis, and paid access to multiple model families. Its useful distinction is not simply that it can answer questions, but that it puts discoverable sources beside a synthesized answer and supports follow-up research in one session.\n\n## Best fit\n\n- Researchers, operators, students, and buyers who need a fast starting map of a topic with links to inspect.\n- Users comparing current web information across several sources before writing or deciding elsewhere.\n- Teams that can define when an answer is exploratory and when a person must verify the original material.\n\n## Check before choosing\n\n- Free currently includes three Pro Searches per day and one Research query per month. Paid allowances are usage-based and can change; verify the limits shown in the account rather than treating a subscription as unlimited.\n- Max is currently $200 monthly or $2,000 annually. Enterprise Pro is $40 per seat monthly or $400 annually, while Enterprise Max is $325 monthly or $3,250 annually. API usage is billed separately from consumer Max.\n- Citations improve traceability, not truth. Perplexity states that a source label describes a domain rather than validating an individual article or claim. Open the original source for legal, medical, financial, product-pricing, or publication decisions.\n- Free, Pro, and Max have AI Data Retention enabled by default. Users can opt out, but the choice only affects data collected after the opt-out date. Enterprise query data is not used for AI training and has separate retention protections.\n- Consumer-uploaded files are generally retained for 30 days; Enterprise session uploads are generally retained for seven days. Projects, repositories, connectors, and session files can have different limits and lifetimes.\n- Independent review data confirms repeated use but also reports variable answer depth, usage limitations, and inaccurate data. A research workflow should record which claims were checked, not only which citations appeared.\n- Perplexity faces active publisher and data-access litigation. That does not prove an individual answer is unlawful, but organizations with copyright, confidentiality, or provenance obligations should include legal and procurement review.\n\n## Decision summary\n\nChoose Perplexity when speed, source discovery, and iterative web research matter more than maintaining a general-purpose assistant workspace. Use a three-task pilot: one current-facts query, one ambiguous comparison, and one high-stakes research question. Measure useful original sources, unsupported claims, verification time, and plan-limit friction. Keep the product only if it reduces total research time after source checking.',
      'zh', E'## Perplexity 是什么\n\nPerplexity 将实时网页搜索、对话答案、引用、Pro Search、Research、文件分析和多模型付费访问组合在一起。它真正的差异不是“能够回答问题”，而是把可打开的来源放在综合答案旁，并让用户在同一会话中继续追问研究。\n\n## 更适合\n\n- 需要快速建立主题地图并打开来源核对的研究者、运营人员、学生和采购者。\n- 在其他地方写作或决策前，需要比较多项最新网页信息的用户。\n- 能够明确区分探索性答案和必须由人核读原文场景的团队。\n\n## 选择前必须核对\n\n- Free 当前每天包含 3 次 Pro Search、每月 1 次 Research。付费额度仍受使用规则限制且可能变化，应以账号显示为准，不能把订阅理解为无限使用。\n- Max 当前为 $200/月或 $2,000/年。Enterprise Pro 为 $40/席位/月或 $400/年，Enterprise Max 为 $325/月或 $3,250/年。API 使用与消费者 Max 分开计费。\n- 引用提高可追溯性，不等于结论真实。Perplexity 明确说明来源标签描述的是整个域名，而不是验证某篇文章或某项说法；法律、医疗、金融、产品价格或发布决策必须打开原文。\n- Free、Pro、Max 默认开启 AI Data Retention。用户可以退出，但只影响退出日期之后收集的数据；Enterprise 查询不用于 AI 训练，并有独立留存保护。\n- 消费者上传文件通常保留 30 天，Enterprise 会话上传通常保留 7 天；项目、资料库、连接器和会话文件的额度与生命周期并不相同。\n- 独立评价证明产品存在重复使用，也同时报告答案深度波动、额度限制和不准确数据。研究流程应记录核对了哪些说法，而不只是答案显示了哪些引用。\n- Perplexity 正面临出版商与数据访问相关诉讼。这不代表单个答案必然违法，但承担版权、保密或来源义务的组织应加入法务与采购审查。\n\n## 决策结论\n\n当速度、来源发现和迭代式网页研究比通用助手工作区更重要时，可以选择 Perplexity。建议用三个任务试用：一项最新事实、一项模糊比较、一项高风险研究问题；测量有用原始来源、无支持结论、核验时间和额度摩擦。只有在核读来源后总研究时间仍下降，才值得保留。',
      'cn', E'## Perplexity 是什么\n\nPerplexity 将实时网页搜索、对话答案、引用、Pro Search、Research、文件分析和多模型付费访问组合在一起。它真正的差异不是“能够回答问题”，而是把可打开的来源放在综合答案旁，并让用户在同一会话中继续追问研究。\n\n## 更适合\n\n- 需要快速建立主题地图并打开来源核对的研究者、运营人员、学生和采购者。\n- 在其他地方写作或决策前，需要比较多项最新网页信息的用户。\n- 能够明确区分探索性答案和必须由人核读原文场景的团队。\n\n## 选择前必须核对\n\n- Free 当前每天包含 3 次 Pro Search、每月 1 次 Research。付费额度仍受使用规则限制且可能变化，应以账号显示为准，不能把订阅理解为无限使用。\n- Max 当前为 $200/月或 $2,000/年。Enterprise Pro 为 $40/席位/月或 $400/年，Enterprise Max 为 $325/月或 $3,250/年。API 使用与消费者 Max 分开计费。\n- 引用提高可追溯性，不等于结论真实。Perplexity 明确说明来源标签描述的是整个域名，而不是验证某篇文章或某项说法；法律、医疗、金融、产品价格或发布决策必须打开原文。\n- Free、Pro、Max 默认开启 AI Data Retention。用户可以退出，但只影响退出日期之后收集的数据；Enterprise 查询不用于 AI 训练，并有独立留存保护。\n- 消费者上传文件通常保留 30 天，Enterprise 会话上传通常保留 7 天；项目、资料库、连接器和会话文件的额度与生命周期并不相同。\n- 独立评价证明产品存在重复使用，也同时报告答案深度波动、额度限制和不准确数据。研究流程应记录核对了哪些说法，而不只是答案显示了哪些引用。\n- Perplexity 正面临出版商与数据访问相关诉讼。这不代表单个答案必然违法，但承担版权、保密或来源义务的组织应加入法务与采购审查。\n\n## 决策结论\n\n当速度、来源发现和迭代式网页研究比通用助手工作区更重要时，可以选择 Perplexity。建议用三个任务试用：一项最新事实、一项模糊比较、一项高风险研究问题；测量有用原始来源、无支持结论、核验时间和额度摩擦。只有在核读来源后总研究时间仍下降，才值得保留。'
    ),
    'https://www.perplexity.ai/',
    'https://www.perplexity.ai/favicon.ico',
    'https://image.thum.io/get/width/1200/noanimate/https://www.perplexity.ai',
    productivity_id,
    ARRAY['ai-search', 'research', 'citations', 'knowledge-work'],
    'freemium',
    jsonb_build_object(
      'localized', jsonb_build_object(
        'en', jsonb_build_array(
          jsonb_build_object('label', 'Research boundary', 'value', 'Citations accelerate source discovery but do not validate an individual claim.'),
          jsonb_build_object('label', 'Plan boundary', 'value', 'Search, Research, model, file, and agent allowances differ by plan and can change.'),
          jsonb_build_object('label', 'Data boundary', 'value', 'Consumer training use is opt-out; Enterprise has separate no-training and retention controls.')
        ),
        'zh', jsonb_build_array(
          jsonb_build_object('label', '研究边界', 'value', '引用可以加速来源发现，但不能验证单项结论。'),
          jsonb_build_object('label', '套餐边界', 'value', '搜索、Research、模型、文件和 agent 额度因套餐而异且可能变化。'),
          jsonb_build_object('label', '数据边界', 'value', '消费者训练使用采用退出机制；Enterprise 有独立不训练与留存控制。')
        ),
        'cn', jsonb_build_array(
          jsonb_build_object('label', '研究边界', 'value', '引用可以加速来源发现，但不能验证单项结论。'),
          jsonb_build_object('label', '套餐边界', 'value', '搜索、Research、模型、文件和 agent 额度因套餐而异且可能变化。'),
          jsonb_build_object('label', '数据边界', 'value', '消费者训练使用采用退出机制；Enterprise 有独立不训练与留存控制。')
        )
      ),
      'audience', jsonb_build_object(
        'bestFit', jsonb_build_object(
          'en', jsonb_build_array('Source-first web research', 'Current-information discovery', 'Teams with explicit verification rules'),
          'zh', jsonb_build_array('来源优先的网页研究', '最新信息发现', '具备明确核验规则的团队'),
          'cn', jsonb_build_array('来源优先的网页研究', '最新信息发现', '具备明确核验规则的团队')
        ),
        'notIdealFor', jsonb_build_object(
          'en', jsonb_build_array('Treating citations as automatic fact checks', 'Unlimited advanced research at one flat price', 'Sensitive consumer use without reviewing data controls'),
          'zh', jsonb_build_array('把引用当作自动事实核查', '要求固定价格下无限深度研究', '未检查数据控制就输入敏感消费者信息'),
          'cn', jsonb_build_array('把引用当作自动事实核查', '要求固定价格下无限深度研究', '未检查数据控制就输入敏感消费者信息')
        )
      ),
      'editorial', jsonb_build_object(
        'reviewedAt', '2026-09-01',
        'reviewedBy', 'AI Best Tool editorial',
        'sourceUrl', 'https://www.perplexity.ai/help-center/en/articles/10352895-how-does-perplexity-work',
        'summary', jsonb_build_object(
          'en', 'Reviewed against current search, Research, plan, model, data-use, file-retention, source-label, independent-review, and legal-risk sources.',
          'zh', '已根据当前搜索、Research、套餐、模型、数据使用、文件留存、来源标签、独立评价和法律风险来源完成核验。',
          'cn', '已根据当前搜索、Research、套餐、模型、数据使用、文件留存、来源标签、独立评价和法律风险来源完成核验。'
        ),
        'trustNote', jsonb_build_object(
          'en', 'Market adoption is strong, but research quality remains query- and source-dependent; citations are an inspection path rather than a correctness score.',
          'zh', '市场采用很强，但研究质量仍取决于问题和来源；引用是核验路径，不是准确率评分。',
          'cn', '市场采用很强，但研究质量仍取决于问题和来源；引用是核验路径，不是准确率评分。'
        )
      ),
      'marketValidation', jsonb_build_object(
        'reviewedAt', '2026-09-01',
        'score', 96,
        'verdict', 'validated',
        'scores', jsonb_build_object('userValue', 24, 'independentValidation', 23, 'durability', 23, 'evidenceQuality', 18, 'strategicValue', 8),
        'strongSignals', jsonb_build_array('g2-276-reviews-4-5-rating', 'capterra-35-reviews-4-2-rating', 'multi-year-repeat-user-evidence'),
        'supportingSignals', jsonb_build_array('current-enterprise-plan-documentation', 'active-product-help-center', 'independent-depth-and-accuracy-limitations'),
        'evidenceUrls', jsonb_build_array(
          'https://www.g2.com/products/perplexity/reviews',
          'https://www.capterra.com/p/10014721/Perplexity/reviews/',
          'https://www.perplexity.ai/help-center/en/articles/10352895-how-does-perplexity-work',
          'https://www.perplexity.ai/help-center/en/articles/11564572-data-collection-at-perplexity',
          'https://www.perplexity.ai/help-center/en/articles/20260806-understanding-source-labels',
          'https://www.axios.com/2026/06/22/new-york-times-ai-lawsuits'
        ),
        'rationale', jsonb_build_object(
          'en', 'Perplexity has 276 G2 reviews at 4.5 and 35 Capterra reviews at 4.2, including verified multi-year and paid use. That is strong independent evidence of repeated value and durability. The same review data reports usage limits, variable depth, and inaccurate answers, so the validated verdict applies to market maturity, not to every generated claim.',
          'zh', 'Perplexity 在 G2 有 276 条评价、评分 4.5，在 Capterra 有 35 条评价、评分 4.2，并包含经过验证的多年与付费使用记录。这构成重复价值和持续性的强独立证据；同一批评价也记录额度限制、深度波动和不准确答案，因此“已验证”只代表市场成熟度，不代表每项生成结论。',
          'cn', 'Perplexity 在 G2 有 276 条评价、评分 4.5，在 Capterra 有 35 条评价、评分 4.2，并包含经过验证的多年与付费使用记录。这构成重复价值和持续性的强独立证据；同一批评价也记录额度限制、深度波动和不准确答案，因此“已验证”只代表市场成熟度，不代表每项生成结论。'
        )
      )
    ),
    jsonb_build_object(
      'en', jsonb_build_array('Source-backed web search', 'Pro Search and Research reports', 'File and document analysis', 'Multi-model research access'),
      'zh', jsonb_build_array('带来源网页搜索', 'Pro Search 与 Research 报告', '文件与文档分析', '多模型研究访问'),
      'cn', jsonb_build_array('带来源网页搜索', 'Pro Search 与 Research 报告', '文件与文档分析', '多模型研究访问')
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
