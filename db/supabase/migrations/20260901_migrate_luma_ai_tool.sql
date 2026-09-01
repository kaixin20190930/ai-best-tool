DO $$
DECLARE
  target_id uuid := '711df152-fdcf-4a19-930c-ab866b67605f';
  design_id uuid := '15160dd4-05f3-4074-8466-4dd3bdfd8d10';
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.tools WHERE name = 'luma-ai' AND id <> target_id
  ) THEN
    RAISE EXCEPTION 'Cannot migrate Luma AI: another tool row already exists.';
  END IF;

  INSERT INTO public.tools (
    id, name, title, content, detail, url, image_url, thumbnail_url,
    category_id, tags, pricing, features, use_cases, screenshots, video_url,
    status, submitted_by, page_quality_status, next_review_date, created_at, updated_at
  ) VALUES (
    target_id,
    'luma-ai',
    jsonb_build_object(
      'en', 'Luma Dream Machine AI Video',
      'zh', 'Luma Dream Machine AI 视频',
      'cn', 'Luma Dream Machine AI 视频'
    ),
    jsonb_build_object(
      'en', 'Luma Dream Machine is a creative workspace for generating and modifying video and images with Ray and Photon models. It is useful for visual concepts, shots, and video-to-video exploration, but buyers should distinguish Dream Machine from Luma Agents, Capture, Genie, and the separate API, then verify credit cost and commercial rights for the active plan.',
      'zh', 'Luma Dream Machine 是使用 Ray 和 Photon 模型生成及修改视频与图片的创意工作区。它适合视觉概念、镜头和视频到视频探索，但购买前应将 Dream Machine 与 Luma Agents、Capture、Genie 及独立 API 区分开，并核对当前套餐的 credits 成本和商业权利。',
      'cn', 'Luma Dream Machine 是使用 Ray 和 Photon 模型生成及修改视频与图片的创意工作区。它适合视觉概念、镜头和视频到视频探索，但购买前应将 Dream Machine 与 Luma Agents、Capture、Genie 及独立 API 区分开，并核对当前套餐的 credits 成本和商业权利。'
    ),
    jsonb_build_object(
      'en', E'## What this page covers\n\nThis page evaluates Luma Dream Machine: the web and iOS workspace for creating and modifying video and images with Ray, Photon, and supported partner models. Luma also operates Agents, Capture, Genie, research, and developer platforms, but combining those products would make pricing and workflow advice misleading.\n\n## Best fit\n\n- Filmmakers, marketers, designers, and creators exploring shots, motion, camera direction, visual references, and generative video modifications.\n- Concept and pre-visualization workflows that can generate several candidates before selecting usable output.\n- Teams willing to finish continuity, sound, timing, and delivery in a dedicated production workflow.\n\n## Check before choosing\n\n- Free is limited to images and Ray3.14 video drafts. Web Lite is $9.99 monthly with 3,200 credits; Plus is $29.99 with 10,000; Unlimited is $94.99 with 10,000 fast credits and relaxed generations. iOS prices differ.\n- Credit use varies by model, resolution, duration, HDR, Modify, Reframe, and upscale choices. Monthly credits reset and do not roll over; paid top-ups can remain valid for 12 months while the account has an eligible plan.\n- Free and Lite outputs remain watermarked and restricted to personal, non-commercial use. Plus, Unlimited, and Enterprise generations include commercial rights with no watermark. Upgrading later does not retroactively change an older asset license.\n- Dream Machine subscriptions and credits do not apply to the API. API output is documented as watermark-free and commercially usable, but it has separate billing and platform terms.\n- The company is well funded and actively shipping models, but independent product-review depth is still thin: the correctly matched G2 seller currently has one Luma AI review and no Dream Machine reviews.\n\n## Decision summary\n\nChoose Dream Machine when its Ray and Modify workflows can accelerate concepting and shot experimentation. Test a representative project before committing: calculate the cost of accepted shots rather than raw generations, confirm the license attached to each asset, and retain external editing when continuity and final-delivery control matter.',
      'zh', E'## 本页评估什么\n\n本页评估 Luma Dream Machine：使用 Ray、Photon 和受支持合作模型创建及修改视频与图片的 Web/iOS 工作区。Luma 还经营 Agents、Capture、Genie、研究和开发者平台，但把这些产品混在一起会让价格与工作流建议失真。\n\n## 更适合\n\n- 需要探索镜头、动态、摄影机方向、视觉参考和生成式视频修改的电影制作人、营销、设计师和创作者。\n- 可以先生成多个候选结果，再筛选可用输出的概念和预可视化流程。\n- 愿意在专业制作流程中继续处理连续性、声音、节奏和最终交付的团队。\n\n## 选择前必须核对\n\n- Free 仅提供图片和 Ray3.14 视频草稿。Web Lite 为 $9.99/月、3,200 credits；Plus 为 $29.99/月、10,000 credits；Unlimited 为 $94.99/月，含 10,000 fast credits 和 relaxed generation。iOS 价格不同。\n- credits 消耗会随模型、分辨率、时长、HDR、Modify、Reframe 和放大选择变化。月度 credits 重置且不结转；付费 top-up 在符合条件的套餐中可保留 12 个月。\n- Free 与 Lite 输出保留水印且仅限个人非商业用途；Plus、Unlimited 和 Enterprise 生成内容无水印并包含商业权利。之后升级不会追溯改变旧素材的授权。\n- Dream Machine 订阅和 credits 不适用于 API。官方文档说明 API 输出无水印且可商用，但 API 使用独立计费和平台条款。\n- 公司融资充足且持续发布模型，但独立产品评价深度仍然很薄：正确对应的 G2 商家页目前只有 1 条 Luma AI 评价，Dream Machine 为 0 条。\n\n## 决策结论\n\n当 Ray 和 Modify 工作流能够加速概念与镜头探索时，可以选择 Dream Machine。付费前应测试一个代表性项目：按被接受镜头而不是原始生成次数计算成本，确认每项素材对应的授权，并在连续性和最终交付控制重要时保留外部编辑流程。',
      'cn', E'## 本页评估什么\n\n本页评估 Luma Dream Machine：使用 Ray、Photon 和受支持合作模型创建及修改视频与图片的 Web/iOS 工作区。Luma 还经营 Agents、Capture、Genie、研究和开发者平台，但把这些产品混在一起会让价格与工作流建议失真。\n\n## 更适合\n\n- 需要探索镜头、动态、摄影机方向、视觉参考和生成式视频修改的电影制作人、营销、设计师和创作者。\n- 可以先生成多个候选结果，再筛选可用输出的概念和预可视化流程。\n- 愿意在专业制作流程中继续处理连续性、声音、节奏和最终交付的团队。\n\n## 选择前必须核对\n\n- Free 仅提供图片和 Ray3.14 视频草稿。Web Lite 为 $9.99/月、3,200 credits；Plus 为 $29.99/月、10,000 credits；Unlimited 为 $94.99/月，含 10,000 fast credits 和 relaxed generation。iOS 价格不同。\n- credits 消耗会随模型、分辨率、时长、HDR、Modify、Reframe 和放大选择变化。月度 credits 重置且不结转；付费 top-up 在符合条件的套餐中可保留 12 个月。\n- Free 与 Lite 输出保留水印且仅限个人非商业用途；Plus、Unlimited 和 Enterprise 生成内容无水印并包含商业权利。之后升级不会追溯改变旧素材的授权。\n- Dream Machine 订阅和 credits 不适用于 API。官方文档说明 API 输出无水印且可商用，但 API 使用独立计费和平台条款。\n- 公司融资充足且持续发布模型，但独立产品评价深度仍然很薄：正确对应的 G2 商家页目前只有 1 条 Luma AI 评价，Dream Machine 为 0 条。\n\n## 决策结论\n\n当 Ray 和 Modify 工作流能够加速概念与镜头探索时，可以选择 Dream Machine。付费前应测试一个代表性项目：按被接受镜头而不是原始生成次数计算成本，确认每项素材对应的授权，并在连续性和最终交付控制重要时保留外部编辑流程。'
    ),
    'https://dream-machine.lumalabs.ai/',
    'https://cdn.sanity.io/images/2ylxvaa2/production/ff7469d468f6f7e447ccb4a50276f1cb03c6664d-1200x630.jpg?w=1200&h=630&fm=jpg',
    'https://static.cdn-luma.com/cdn-cgi/image/quality=70,height=720/files/dm-landing/OG/ogfallback.jpeg',
    design_id,
    ARRAY['ai-video', 'video-generation', 'video-to-video', 'image-generation'],
    'freemium',
    jsonb_build_object(
      'localized', jsonb_build_object(
        'en', jsonb_build_array(
          jsonb_build_object('label', 'Product scope', 'value', 'Dream Machine covers Ray video, Photon images, and Modify workflows; other Luma products remain separate.'),
          jsonb_build_object('label', 'Cost boundary', 'value', 'Credits vary by model and output settings, reset monthly, and do not transfer to the API.'),
          jsonb_build_object('label', 'License boundary', 'value', 'Free and Lite are personal-use only; commercial rights begin with Plus for assets generated while that plan is active.')
        ),
        'zh', jsonb_build_array(
          jsonb_build_object('label', '产品范围', 'value', 'Dream Machine 覆盖 Ray 视频、Photon 图片和 Modify；其他 Luma 产品保持独立。'),
          jsonb_build_object('label', '成本边界', 'value', 'credits 随模型和输出设置变化，每月重置，且不能转入 API。'),
          jsonb_build_object('label', '授权边界', 'value', 'Free 与 Lite 仅限个人使用；商业权利从 Plus 开始，并取决于素材生成时的有效套餐。')
        ),
        'cn', jsonb_build_array(
          jsonb_build_object('label', '产品范围', 'value', 'Dream Machine 覆盖 Ray 视频、Photon 图片和 Modify；其他 Luma 产品保持独立。'),
          jsonb_build_object('label', '成本边界', 'value', 'credits 随模型和输出设置变化，每月重置，且不能转入 API。'),
          jsonb_build_object('label', '授权边界', 'value', 'Free 与 Lite 仅限个人使用；商业权利从 Plus 开始，并取决于素材生成时的有效套餐。')
        )
      ),
      'audience', jsonb_build_object(
        'bestFit', jsonb_build_object(
          'en', jsonb_build_array('Video concept and shot exploration', 'Generative video modification', 'Teams that measure usable-shot cost'),
          'zh', jsonb_build_array('视频概念与镜头探索', '生成式视频修改', '会测算可用镜头成本的团队'),
          'cn', jsonb_build_array('视频概念与镜头探索', '生成式视频修改', '会测算可用镜头成本的团队')
        ),
        'notIdealFor', jsonb_build_object(
          'en', jsonb_build_array('Commercial output on Free or Lite', 'Treating Dream Machine and API credits as one balance', 'Replacing full timeline-based post-production'),
          'zh', jsonb_build_array('在 Free 或 Lite 上制作商业输出', '把 Dream Machine 与 API credits 当作同一余额', '替代完整时间线后期制作'),
          'cn', jsonb_build_array('在 Free 或 Lite 上制作商业输出', '把 Dream Machine 与 API credits 当作同一余额', '替代完整时间线后期制作')
        )
      ),
      'editorial', jsonb_build_object(
        'reviewedAt', '2026-09-01',
        'reviewedBy', 'AI Best Tool editorial',
        'sourceUrl', 'https://lumalabs.ai/learning-hub/payments-subscriptions',
        'summary', jsonb_build_object(
          'en', 'Reviewed against current Dream Machine plan, credit, licensing, API, team, and model documentation.',
          'zh', '已根据当前 Dream Machine 套餐、credits、授权、API、团队和模型文档完成核验。',
          'cn', '已根据当前 Dream Machine 套餐、credits、授权、API、团队和模型文档完成核验。'
        ),
        'trustNote', jsonb_build_object(
          'en', 'Company financing and enterprise adoption are strong, but independent Dream Machine review depth remains too thin for broad quality claims.',
          'zh', '公司融资和企业采用信号很强，但 Dream Machine 的独立评价深度仍不足以支持宽泛质量结论。',
          'cn', '公司融资和企业采用信号很强，但 Dream Machine 的独立评价深度仍不足以支持宽泛质量结论。'
        )
      ),
      'marketValidation', jsonb_build_object(
        'reviewedAt', '2026-09-01',
        'score', 88,
        'verdict', 'validated',
        'scores', jsonb_build_object('userValue', 23, 'independentValidation', 11, 'durability', 23, 'evidenceQuality', 20, 'strategicValue', 11),
        'strongSignals', jsonb_build_array('official-900m-series-c-2025', 'techcrunch-reported-4b-valuation', 'fortune-500-media-entertainment-adoption'),
        'supportingSignals', jsonb_build_array('active-2026-product-updates', 'team-admin-and-shared-credit-controls', 'g2-review-depth-still-thin'),
        'evidenceUrls', jsonb_build_array(
          'https://lumalabs.ai/news/series-c',
          'https://techcrunch.com/2026/01/19/here-are-the-49-us-ai-startups-that-have-raised-100m-or-more-in-2025/',
          'https://www.g2.com/sellers/luma-ai',
          'https://lumalabs.ai/learning-hub/payments-subscriptions',
          'https://lumalabs.ai/learning-hub/licensing'
        ),
        'rationale', jsonb_build_object(
          'en', 'Luma is a durable company with an official $900M Series C announcement, a reported $4B valuation, active model development, and stated Fortune 500 adoption. Independent product-review evidence is much weaker: the correctly matched G2 seller currently has one Luma AI review and zero Dream Machine reviews, so validation supports continued coverage but not broad superiority claims.',
          'zh', 'Luma 具备持续经营信号，包括官方宣布的 9 亿美元 Series C、外部报道的 40 亿美元估值、持续模型更新和官方所述 Fortune 500 采用。但独立产品评价明显较弱：正确对应的 G2 商家页目前只有 1 条 Luma AI 评价、Dream Machine 为 0 条，因此可以持续收录，却不能宣称宽泛优势。',
          'cn', 'Luma 具备持续经营信号，包括官方宣布的 9 亿美元 Series C、外部报道的 40 亿美元估值、持续模型更新和官方所述 Fortune 500 采用。但独立产品评价明显较弱：正确对应的 G2 商家页目前只有 1 条 Luma AI 评价、Dream Machine 为 0 条，因此可以持续收录，却不能宣称宽泛优势。'
        )
      )
    ),
    jsonb_build_object(
      'en', jsonb_build_array('Generate video concepts and shots', 'Modify existing video with AI', 'Create supporting images', 'Test pre-visualization before production'),
      'zh', jsonb_build_array('生成视频概念和镜头', '使用 AI 修改已有视频', '创建配套图片', '在制作前测试预可视化'),
      'cn', jsonb_build_array('生成视频概念和镜头', '使用 AI 修改已有视频', '创建配套图片', '在制作前测试预可视化')
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
