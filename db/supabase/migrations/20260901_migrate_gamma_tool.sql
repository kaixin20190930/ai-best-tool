DO $$
DECLARE
  target_id uuid := '6512aa61-8663-49f8-809d-2a2ab4e529ad';
  productivity_id uuid := '1d866b7d-6340-4a0b-8333-a301cc52172c';
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.tools WHERE name = 'gamma' AND id <> target_id
  ) THEN
    RAISE EXCEPTION 'Cannot migrate Gamma: another tool row already exists.';
  END IF;

  INSERT INTO public.tools (
    id,
    name,
    title,
    content,
    detail,
    url,
    image_url,
    thumbnail_url,
    category_id,
    tags,
    pricing,
    features,
    use_cases,
    screenshots,
    video_url,
    status,
    submitted_by,
    page_quality_status,
    next_review_date,
    created_at,
    updated_at
  ) VALUES (
    target_id,
    'gamma',
    jsonb_build_object(
      'en', 'Gamma AI Presentation Maker',
      'zh', 'Gamma AI 演示文稿生成器',
      'cn', 'Gamma AI 演示文稿生成器'
    ),
    jsonb_build_object(
      'en', 'Gamma turns prompts, outlines, and existing files into presentations, visual documents, websites, social content, and graphics. It is strongest for fast first drafts and browser-based sharing, but buyers should test brand control, export fidelity, AI-credit use, per-user billing, and data settings against the final delivery workflow.',
      'zh', 'Gamma 可将提示词、提纲和已有文件转换为演示文稿、视觉文档、网站、社交内容和图形。它最适合快速形成初稿并通过浏览器分享，但购买前应根据最终交付流程测试品牌控制、导出还原度、AI credits、按用户计费和数据设置。',
      'cn', 'Gamma 可将提示词、提纲和已有文件转换为演示文稿、视觉文档、网站、社交内容和图形。它最适合快速形成初稿并通过浏览器分享，但购买前应根据最终交付流程测试品牌控制、导出还原度、AI credits、按用户计费和数据设置。'
    ),
    jsonb_build_object(
      'en', E'## What Gamma is\n\nGamma is an AI visual-communication workspace for presentations, documents, websites, social posts, and graphics. It can begin from a prompt, an outline, pasted content, or an imported file, then apply layouts, themes, images, and collaborative editing.\n\n## Best fit\n\n- Founders, consultants, marketers, educators, and sales teams that need a polished first draft quickly.\n- Browser-first sharing where responsive cards, links, embeds, and engagement analytics matter more than a traditional slide file.\n- Teams willing to review structure, claims, charts, images, and brand details before publishing.\n\n## Check before choosing\n\n- Subscriptions are billed per user. AI actions consume credits based on model choice, content length, and task complexity.\n- Free can create and export, but paid plans are needed to remove Gamma branding; Pro adds detailed analytics, API access, custom branding, and custom domains.\n- Plain imports preserve text rather than original styling and layout, so PowerPoint, Google Slides, and document migrations require redesign or AI restyling.\n- PDF, PNG, and PPTX export are supported, but exports reflect Present Mode and can differ from the editor. Word export is not supported.\n- Individual Free, Plus, Pro, and Ultra workspaces allow training use by default but can opt out; Team and Business workspace content is excluded automatically.\n\n## Decision summary\n\nChoose Gamma when speed, browser sharing, and attractive defaults matter more than pixel-level PowerPoint control. Keep PowerPoint, Google Slides, or Canva in the comparison when strict brand systems, complex data-heavy decks, offline editing, or exact editable-file handoff is the final requirement.',
      'zh', E'## Gamma 是什么\n\nGamma 是面向演示文稿、文档、网站、社交内容和图形的 AI 视觉沟通工作区。它可以从提示词、提纲、粘贴内容或导入文件开始，再应用布局、主题、图片和多人协作编辑。\n\n## 更适合\n\n- 需要快速得到专业初稿的创始人、顾问、营销、教育和销售团队。\n- 更重视响应式卡片、链接、嵌入和互动分析，而不是传统幻灯片文件的浏览器优先分享流程。\n- 愿意在发布前复核结构、事实、图表、图片和品牌细节的团队。\n\n## 选择前必须核对\n\n- 订阅按用户计费；AI 操作会根据模型、内容长度和任务复杂度消耗 credits。\n- Free 可以创建和导出，但移除 Gamma 品牌需要付费套餐；Pro 增加详细分析、API、自定义品牌和自定义域名。\n- 普通导入只保留文本，不保留原始样式和布局，因此迁移 PowerPoint、Google Slides 和文档时仍需重新设计或使用 AI 重排。\n- 支持 PDF、PNG 和 PPTX 导出，但导出以 Present Mode 为准，可能与编辑器不同；不支持 Word 导出。\n- 个人 Free、Plus、Pro 和 Ultra 工作区默认允许内容用于训练，但可以退出；Team 和 Business 工作区内容自动排除。\n\n## 决策结论\n\n当生成速度、浏览器分享和默认视觉质量比像素级 PowerPoint 控制更重要时，Gamma 值得选择；如果最终要求严格品牌系统、复杂数据型演示、离线编辑或精确的可编辑文件交付，应继续比较 PowerPoint、Google Slides 或 Canva。',
      'cn', E'## Gamma 是什么\n\nGamma 是面向演示文稿、文档、网站、社交内容和图形的 AI 视觉沟通工作区。它可以从提示词、提纲、粘贴内容或导入文件开始，再应用布局、主题、图片和多人协作编辑。\n\n## 更适合\n\n- 需要快速得到专业初稿的创始人、顾问、营销、教育和销售团队。\n- 更重视响应式卡片、链接、嵌入和互动分析，而不是传统幻灯片文件的浏览器优先分享流程。\n- 愿意在发布前复核结构、事实、图表、图片和品牌细节的团队。\n\n## 选择前必须核对\n\n- 订阅按用户计费；AI 操作会根据模型、内容长度和任务复杂度消耗 credits。\n- Free 可以创建和导出，但移除 Gamma 品牌需要付费套餐；Pro 增加详细分析、API、自定义品牌和自定义域名。\n- 普通导入只保留文本，不保留原始样式和布局，因此迁移 PowerPoint、Google Slides 和文档时仍需重新设计或使用 AI 重排。\n- 支持 PDF、PNG 和 PPTX 导出，但导出以 Present Mode 为准，可能与编辑器不同；不支持 Word 导出。\n- 个人 Free、Plus、Pro 和 Ultra 工作区默认允许内容用于训练，但可以退出；Team 和 Business 工作区内容自动排除。\n\n## 决策结论\n\n当生成速度、浏览器分享和默认视觉质量比像素级 PowerPoint 控制更重要时，Gamma 值得选择；如果最终要求严格品牌系统、复杂数据型演示、离线编辑或精确的可编辑文件交付，应继续比较 PowerPoint、Google Slides 或 Canva。'
    ),
    'https://gamma.app/',
    'https://static.gamma.app/images/gamma-banner-8d71c455.png',
    'https://static.gamma.app/images/gamma-banner-8d71c455.png',
    productivity_id,
    ARRAY['ai-presentations', 'documents', 'website-builder', 'visual-content'],
    'freemium',
    jsonb_build_object(
      'localized', jsonb_build_object(
        'en', jsonb_build_array(
          jsonb_build_object('label', 'Core workflow', 'value', 'Generate and edit presentations, documents, websites, social content, and graphics from prompts or source material.'),
          jsonb_build_object('label', 'Delivery boundary', 'value', 'Browser sharing is native; PDF, PNG, and PPTX exports need final review, and Word export is unavailable.'),
          jsonb_build_object('label', 'Cost boundary', 'value', 'Plans are per user and AI work consumes credits; Pro unlocks advanced brand, analytics, API, and domain controls.')
        ),
        'zh', jsonb_build_array(
          jsonb_build_object('label', '核心流程', 'value', '从提示词或源材料生成并编辑演示文稿、文档、网站、社交内容和图形。'),
          jsonb_build_object('label', '交付边界', 'value', '浏览器分享是原生流程；PDF、PNG 和 PPTX 导出仍需最终复核，且不支持 Word。'),
          jsonb_build_object('label', '成本边界', 'value', '套餐按用户计费且 AI 操作消耗 credits；Pro 才提供高级品牌、分析、API 和域名控制。')
        ),
        'cn', jsonb_build_array(
          jsonb_build_object('label', '核心流程', 'value', '从提示词或源材料生成并编辑演示文稿、文档、网站、社交内容和图形。'),
          jsonb_build_object('label', '交付边界', 'value', '浏览器分享是原生流程；PDF、PNG 和 PPTX 导出仍需最终复核，且不支持 Word。'),
          jsonb_build_object('label', '成本边界', 'value', '套餐按用户计费且 AI 操作消耗 credits；Pro 才提供高级品牌、分析、API 和域名控制。')
        )
      ),
      'audience', jsonb_build_object(
        'bestFit', jsonb_build_object(
          'en', jsonb_build_array('Fast visual first drafts', 'Browser-based proposals and pitch decks', 'Teams that review AI-generated structure and claims'),
          'zh', jsonb_build_array('快速视觉初稿', '浏览器分享的方案和路演材料', '会复核 AI 结构与事实的团队'),
          'cn', jsonb_build_array('快速视觉初稿', '浏览器分享的方案和路演材料', '会复核 AI 结构与事实的团队')
        ),
        'notIdealFor', jsonb_build_object(
          'en', jsonb_build_array('Pixel-perfect PowerPoint handoff', 'Offline-first editing', 'Complex data-heavy decks without human review'),
          'zh', jsonb_build_array('像素级 PowerPoint 交付', '离线优先编辑', '没有人工复核的复杂数据型演示'),
          'cn', jsonb_build_array('像素级 PowerPoint 交付', '离线优先编辑', '没有人工复核的复杂数据型演示')
        )
      ),
      'editorial', jsonb_build_object(
        'reviewedAt', '2026-09-01',
        'reviewedBy', 'AI Best Tool editorial',
        'sourceUrl', 'https://gamma.app/',
        'summary', jsonb_build_object(
          'en', 'Reviewed against current creation, plan, import, export, collaboration, analytics, and data-use documentation.',
          'zh', '已根据当前创作范围、套餐、导入、导出、协作、分析和数据使用文档完成核验。',
          'cn', '已根据当前创作范围、套餐、导入、导出、协作、分析和数据使用文档完成核验。'
        ),
        'trustNote', jsonb_build_object(
          'en', 'Treat AI output as a first draft and test the actual export format, brand system, credit use, and workspace data settings before team rollout.',
          'zh', '应将 AI 输出视为初稿，并在团队推广前测试真实导出格式、品牌体系、credits 消耗和工作区数据设置。',
          'cn', '应将 AI 输出视为初稿，并在团队推广前测试真实导出格式、品牌体系、credits 消耗和工作区数据设置。'
        )
      ),
      'marketValidation', jsonb_build_object(
        'reviewedAt', '2026-09-01',
        'score', 96,
        'verdict', 'validated',
        'scores', jsonb_build_object('userValue', 25, 'independentValidation', 24, 'durability', 20, 'evidenceQuality', 18, 'strategicValue', 9),
        'strongSignals', jsonb_build_array('100m-plus-official-users', 'techcrunch-100m-arr-2.1b-valuation', 'product-hunt-78-reviews-3.8k-followers'),
        'supportingSignals', jsonb_build_array('g2-verified-review-presence', 'capterra-verified-review-presence', 'gsc-near-page-one-demand'),
        'evidenceUrls', jsonb_build_array(
          'https://gamma.app/about',
          'https://techcrunch.com/2025/11/10/ai-powerpoint-killer-gamma-hits-2-1b-valuation-100m-arr-founder-says/',
          'https://www.producthunt.com/products/gamma-3',
          'https://www.g2.com/products/gamma-ai/reviews',
          'https://www.capterra.com/p/10015023/Gamma/'
        ),
        'rationale', jsonb_build_object(
          'en', 'Gamma has durable market evidence: more than 100 million users on its current site, reported $100M ARR and a $2.1B valuation, repeated Product Hunt launches, and current verified review coverage. Its main decision risks are not survival but export fidelity, credit economics, team billing, and data settings.',
          'zh', 'Gamma 具备持续市场证据：当前官网显示超过 1 亿用户，外部报道 $1 亿 ARR 和 $21 亿估值，并有多次 Product Hunt 发布和当前验证评价。其主要决策风险不是能否持续运营，而是导出还原度、credits 成本、团队计费和数据设置。',
          'cn', 'Gamma 具备持续市场证据：当前官网显示超过 1 亿用户，外部报道 $1 亿 ARR 和 $21 亿估值，并有多次 Product Hunt 发布和当前验证评价。其主要决策风险不是能否持续运营，而是导出还原度、credits 成本、团队计费和数据设置。'
        )
      )
    ),
    jsonb_build_object(
      'en', jsonb_build_array('Generate presentation first drafts', 'Turn documents into visual stories', 'Publish lightweight websites and proposals', 'Create reusable branded content'),
      'zh', jsonb_build_array('生成演示文稿初稿', '把文档转换为视觉叙事', '发布轻量网站和方案', '创建可复用品牌内容'),
      'cn', jsonb_build_array('生成演示文稿初稿', '把文档转换为视觉叙事', '发布轻量网站和方案', '创建可复用品牌内容')
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
