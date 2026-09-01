DO $$
DECLARE
  target_id uuid := 'f39ef025-c2b4-4392-be38-95a377931b5e';
  design_id uuid := '15160dd4-05f3-4074-8466-4dd3bdfd8d10';
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.tools WHERE name = 'runway' AND id <> target_id
  ) THEN
    RAISE EXCEPTION 'Cannot migrate Runway: another tool row already exists.';
  END IF;

  INSERT INTO public.tools (
    id, name, title, content, detail, url, image_url, thumbnail_url,
    category_id, tags, pricing, features, use_cases, screenshots, video_url,
    status, submitted_by, page_quality_status, next_review_date, created_at, updated_at
  ) VALUES (
    target_id,
    'runway',
    jsonb_build_object(
      'en', 'Runway AI Video Generator & Editor',
      'zh', 'Runway AI 视频生成与编辑',
      'cn', 'Runway AI 视频生成与编辑'
    ),
    jsonb_build_object(
      'en', 'Runway is a cloud creative suite for generating and editing video, images, and audio with first-party and third-party models. It is strongest for rapid shot ideation and targeted generative edits, but production buyers should model credit cost, shared workspace allowances, API separation, and the need for an external finishing editor.',
      'zh', 'Runway 是一个云端创意套件，可使用自研和第三方模型生成与编辑视频、图片和音频。它最适合快速验证镜头和进行局部生成式编辑，但生产团队应提前测算 credits 成本、工作区共享额度、API 隔离，以及使用外部后期编辑器的需要。',
      'cn', 'Runway 是一个云端创意套件，可使用自研和第三方模型生成与编辑视频、图片和音频。它最适合快速验证镜头和进行局部生成式编辑，但生产团队应提前测算 credits 成本、工作区共享额度、API 隔离，以及使用外部后期编辑器的需要。'
    ),
    jsonb_build_object(
      'en', E'## What Runway is\n\nRunway Creative combines AI video, image, audio, generative editing, upscaling, and asset management in a browser workspace. Its model catalog includes Runway models such as Gen-4.5 and Aleph alongside selected third-party models. Runway Dev is a separate API platform with separate billing and credits.\n\n## Best fit\n\n- Filmmakers, agencies, marketers, and creative teams iterating concepts, shots, storyboards, ads, or short-form video.\n- Workflows that need generation and targeted edits before handing assets to a dedicated local editor.\n- Teams able to review visual continuity, prompt adherence, rights in uploaded inputs, and final delivery quality.\n\n## Check before choosing\n\n- Free includes 125 one-time credits. Standard includes 625 monthly, Pro 2,250, and Max 9,500. Model, duration, resolution, and audio choices determine actual output volume.\n- Gen-4.5 currently costs 12 credits per generated second. Standard and Pro monthly credits do not roll over; Max can carry up to one month, and separately purchased credits do not expire.\n- Pricing is per editor, but one workspace shares one pool of plan credits. Adding paid editors increases seat cost without multiplying the workspace allowance.\n- Web-app and API plans and credits are completely separate. A Creative subscription does not fund production API calls.\n- Runway permits commercial use on all plans without mandatory attribution, but users remain responsible for uploaded material and the rights of people, brands, music, and other inputs.\n- Runway says its built-in video editor is no longer actively maintained and recommends a local editor for larger projects beyond quick edits.\n- Unlimited is no longer sold. Eligible legacy subscriptions have temporary access through November 30, 2026 before moving to Max or another choice.\n\n## Decision summary\n\nChoose Runway when rapid generation and generative edits can shorten the path from concept to usable shots. Keep a dedicated editor and alternative video models in the workflow when continuity, timeline control, audio finishing, predictable high-volume cost, or final-delivery precision matters more than browser convenience.',
      'zh', E'## Runway 是什么\n\nRunway Creative 在浏览器工作区中整合 AI 视频、图片、音频、生成式编辑、放大和素材管理。模型目录既包含 Gen-4.5、Aleph 等 Runway 模型，也包含部分第三方模型。Runway Dev 是单独的 API 平台，使用独立计费和 credits。\n\n## 更适合\n\n- 需要迭代创意、镜头、分镜、广告或短视频的电影制作人、代理商、营销和创意团队。\n- 先进行生成和局部编辑，再把素材交给专业本地编辑器的流程。\n- 能够复核视觉连续性、提示词遵循、上传素材权利和最终交付质量的团队。\n\n## 选择前必须核对\n\n- Free 一次性提供 125 credits；Standard 每月 625，Pro 每月 2,250，Max 每月 9,500。模型、时长、分辨率和音频选择共同决定真实产量。\n- Gen-4.5 当前每生成一秒消耗 12 credits。Standard 与 Pro 月度 credits 不结转；Max 最多结转一个月，单独购买的 credits 不过期。\n- 套餐按编辑席位收费，但一个工作区共享一组套餐 credits。增加付费编辑会增加席位成本，却不会按人数增加工作区额度。\n- Web App 与 API 的套餐和 credits 完全分开。Creative 订阅不能支付生产 API 调用。\n- Runway 允许所有套餐商业使用且不强制署名，但用户仍需对上传素材以及人物、品牌、音乐等输入权利负责。\n- Runway 已说明内置视频编辑器不再积极维护，并建议大型项目在快速编辑后使用本地编辑器。\n- Unlimited 已停止新售；符合条件的老订阅临时延续至 2026 年 11 月 30 日，之后需迁移到 Max 或作出其他选择。\n\n## 决策结论\n\n当快速生成和生成式编辑能够缩短从概念到可用镜头的路径时，可以选择 Runway；当连续性、时间线控制、音频后期、高用量成本可预测性或最终交付精度更重要时，应保留专业编辑器并比较其他视频模型。',
      'cn', E'## Runway 是什么\n\nRunway Creative 在浏览器工作区中整合 AI 视频、图片、音频、生成式编辑、放大和素材管理。模型目录既包含 Gen-4.5、Aleph 等 Runway 模型，也包含部分第三方模型。Runway Dev 是单独的 API 平台，使用独立计费和 credits。\n\n## 更适合\n\n- 需要迭代创意、镜头、分镜、广告或短视频的电影制作人、代理商、营销和创意团队。\n- 先进行生成和局部编辑，再把素材交给专业本地编辑器的流程。\n- 能够复核视觉连续性、提示词遵循、上传素材权利和最终交付质量的团队。\n\n## 选择前必须核对\n\n- Free 一次性提供 125 credits；Standard 每月 625，Pro 每月 2,250，Max 每月 9,500。模型、时长、分辨率和音频选择共同决定真实产量。\n- Gen-4.5 当前每生成一秒消耗 12 credits。Standard 与 Pro 月度 credits 不结转；Max 最多结转一个月，单独购买的 credits 不过期。\n- 套餐按编辑席位收费，但一个工作区共享一组套餐 credits。增加付费编辑会增加席位成本，却不会按人数增加工作区额度。\n- Web App 与 API 的套餐和 credits 完全分开。Creative 订阅不能支付生产 API 调用。\n- Runway 允许所有套餐商业使用且不强制署名，但用户仍需对上传素材以及人物、品牌、音乐等输入权利负责。\n- Runway 已说明内置视频编辑器不再积极维护，并建议大型项目在快速编辑后使用本地编辑器。\n- Unlimited 已停止新售；符合条件的老订阅临时延续至 2026 年 11 月 30 日，之后需迁移到 Max 或作出其他选择。\n\n## 决策结论\n\n当快速生成和生成式编辑能够缩短从概念到可用镜头的路径时，可以选择 Runway；当连续性、时间线控制、音频后期、高用量成本可预测性或最终交付精度更重要时，应保留专业编辑器并比较其他视频模型。'
    ),
    'https://runway.com/',
    'https://runway.com/icon.png?icon.35ps9bmugbe1e.png',
    'https://d3phaj0sisr2ct.cloudfront.net/site/assets/homepage-og-card-v3.webp',
    design_id,
    ARRAY['ai-video', 'video-generation', 'generative-editing', 'creative-workflow'],
    'freemium',
    jsonb_build_object(
      'localized', jsonb_build_object(
        'en', jsonb_build_array(
          jsonb_build_object('label', 'Core workflow', 'value', 'Generate and revise video, image, and audio assets before finishing in a dedicated production tool.'),
          jsonb_build_object('label', 'Cost boundary', 'value', 'Credits vary by model, duration, resolution, and audio; editor seats share one workspace allowance.'),
          jsonb_build_object('label', 'Delivery boundary', 'value', 'Creative and API billing are separate, and larger timeline-based projects still need a local editor.')
        ),
        'zh', jsonb_build_array(
          jsonb_build_object('label', '核心流程', 'value', '生成并修改视频、图片和音频素材，再进入专业制作工具完成后期。'),
          jsonb_build_object('label', '成本边界', 'value', 'credits 会随模型、时长、分辨率和音频变化；编辑席位共享一组工作区额度。'),
          jsonb_build_object('label', '交付边界', 'value', 'Creative 与 API 独立计费，大型时间线项目仍需本地编辑器。')
        ),
        'cn', jsonb_build_array(
          jsonb_build_object('label', '核心流程', 'value', '生成并修改视频、图片和音频素材，再进入专业制作工具完成后期。'),
          jsonb_build_object('label', '成本边界', 'value', 'credits 会随模型、时长、分辨率和音频变化；编辑席位共享一组工作区额度。'),
          jsonb_build_object('label', '交付边界', 'value', 'Creative 与 API 独立计费，大型时间线项目仍需本地编辑器。')
        )
      ),
      'audience', jsonb_build_object(
        'bestFit', jsonb_build_object(
          'en', jsonb_build_array('Rapid video concept iteration', 'Generative shot editing', 'Creative teams with an external finishing workflow'),
          'zh', jsonb_build_array('快速视频创意迭代', '生成式镜头编辑', '拥有外部后期流程的创意团队'),
          'cn', jsonb_build_array('快速视频创意迭代', '生成式镜头编辑', '拥有外部后期流程的创意团队')
        ),
        'notIdealFor', jsonb_build_object(
          'en', jsonb_build_array('Replacing a full professional timeline editor', 'Assuming every generation will be usable', 'High-volume API work funded by a Creative plan'),
          'zh', jsonb_build_array('替代完整专业时间线编辑器', '假设每次生成都能使用', '用 Creative 套餐支付高用量 API'),
          'cn', jsonb_build_array('替代完整专业时间线编辑器', '假设每次生成都能使用', '用 Creative 套餐支付高用量 API')
        )
      ),
      'editorial', jsonb_build_object(
        'reviewedAt', '2026-09-01',
        'reviewedBy', 'AI Best Tool editorial',
        'sourceUrl', 'https://runway.com/pricing',
        'summary', jsonb_build_object(
          'en', 'Reviewed against current Creative pricing, plan selection, credit, legacy Unlimited, usage-rights, and editing documentation.',
          'zh', '已根据当前 Creative 定价、套餐选择、credits、旧 Unlimited、使用权和编辑文档完成核验。',
          'cn', '已根据当前 Creative 定价、套餐选择、credits、旧 Unlimited、使用权和编辑文档完成核验。'
        ),
        'trustNote', jsonb_build_object(
          'en', 'Market maturity supports continued coverage, but buyers should test output consistency and calculate usable-shot cost rather than treating listed seconds as finished production volume.',
          'zh', '市场成熟度支持持续收录，但购买者应测试输出一致性并计算可用镜头成本，不能把标称生成秒数直接视为成片产量。',
          'cn', '市场成熟度支持持续收录，但购买者应测试输出一致性并计算可用镜头成本，不能把标称生成秒数直接视为成片产量。'
        )
      ),
      'marketValidation', jsonb_build_object(
        'reviewedAt', '2026-09-01',
        'score', 97,
        'verdict', 'validated',
        'scores', jsonb_build_object('userValue', 25, 'independentValidation', 24, 'durability', 22, 'evidenceQuality', 18, 'strategicValue', 8),
        'strongSignals', jsonb_build_array('60m-plus-official-creators', 'g2-133-reviews-4.2', 'techcrunch-315m-series-e-5.3b-valuation'),
        'supportingSignals', jsonb_build_array('serving-customers-since-2018', 'active-model-and-plan-development', 'creative-dev-enterprise-platforms'),
        'evidenceUrls', jsonb_build_array(
          'https://runway.com/pricing',
          'https://www.g2.com/sellers/runway',
          'https://techcrunch.com/2026/02/10/ai-video-startup-runway-raises-315m-at-5-3b-valuation-eyes-more-capable-world-models/',
          'https://help.runwayml.com/hc/en-us/articles/21664961171475-Which-plan-is-right-for-me',
          'https://help.runwayml.com/hc/en-us/articles/18927776141715-Usage-rights'
        ),
        'rationale', jsonb_build_object(
          'en', 'Runway has durable market evidence through more than 60 million creators reported on its pricing page, 133 aggregate G2 reviews at 4.2/5 across the correctly identified Runway seller, and a reported 2026 $315M round at a $5.3B valuation. These signals validate continued coverage, while output quality and usable-shot economics remain workflow-specific.',
          'zh', 'Runway 具备持续市场证据：官方定价页显示超过 6,000 万创作者，正确对应的 Runway G2 商家页汇总 133 条评价、评分 4.2/5，且 2026 年外部报道其以 53 亿美元估值融资 3.15 亿美元。这些信号支持持续收录，但输出质量和可用镜头成本仍取决于具体工作流。',
          'cn', 'Runway 具备持续市场证据：官方定价页显示超过 6,000 万创作者，正确对应的 Runway G2 商家页汇总 133 条评价、评分 4.2/5，且 2026 年外部报道其以 53 亿美元估值融资 3.15 亿美元。这些信号支持持续收录，但输出质量和可用镜头成本仍取决于具体工作流。'
        )
      )
    ),
    jsonb_build_object(
      'en', jsonb_build_array('Generate video concepts and shots', 'Apply generative video edits', 'Create image and audio assets', 'Prepare assets for external post-production'),
      'zh', jsonb_build_array('生成视频创意和镜头', '应用生成式视频编辑', '创建图片和音频素材', '为外部后期准备素材'),
      'cn', jsonb_build_array('生成视频创意和镜头', '应用生成式视频编辑', '创建图片和音频素材', '为外部后期准备素材')
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
