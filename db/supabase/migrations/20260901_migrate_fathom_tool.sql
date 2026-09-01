DO $$
DECLARE
  target_id uuid := '7ae4bbb2-847f-45cc-9294-e96663fa02a3';
  productivity_id uuid := '1d866b7d-6340-4a0b-8333-a301cc52172c';
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.tools WHERE name = 'fathom' AND id <> target_id
  ) THEN
    RAISE EXCEPTION 'Cannot migrate Fathom: another tool row already exists.';
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
    'fathom',
    jsonb_build_object(
      'en', 'Fathom AI Meeting Assistant',
      'zh', 'Fathom AI 会议助手',
      'cn', 'Fathom AI 会议助手'
    ),
    jsonb_build_object(
      'en', 'Fathom records supported online meetings, creates transcripts and summaries, extracts action items, and helps individuals or teams follow up after calls. Its value depends on capture compatibility, summary usefulness, consent workflow, and whether free or paid limits match meeting volume.',
      'zh', 'Fathom 可记录受支持的线上会议，生成转录与摘要、提取行动项，并帮助个人或团队完成会后跟进。它是否值得使用，取决于录制兼容性、摘要可用性、同意流程以及免费或付费额度是否匹配会议量。',
      'cn', 'Fathom 可记录受支持的线上会议，生成转录与摘要、提取行动项，并帮助个人或团队完成会后跟进。它是否值得使用，取决于录制兼容性、摘要可用性、同意流程以及免费或付费额度是否匹配会议量。'
    ),
    jsonb_build_object(
      'en', E'## What Fathom is\n\nFathom is an AI meeting assistant for supported Zoom, Google Meet, and Microsoft Teams calls. It records or captures meetings, generates transcripts and summaries, identifies action items, and supports follow-up and team knowledge workflows.\n\n## Best fit\n\n- Founders, sales, customer-success, recruiting, and operations teams with frequent online meetings.\n- Individuals who want unlimited recording, storage, and transcription before paying for advanced AI features.\n- Teams that will review summaries and action items instead of treating the transcript as the final output.\n\n## Check before choosing\n\n- Free includes unlimited recordings, storage, and transcription in 38 languages, but only five advanced summaries each month.\n- Mac and Windows support the established meeting workflow; the newer bot-free experience is currently Mac-only and continues to roll out by meeting platform.\n- Chromebooks, Linux, mobile devices, webinars, breakout rooms, and calls without a standard meeting link are not supported in the standard workflow.\n- The recording owner remains responsible for participant consent and applicable law. A consent email does not remove the need to review the real meeting setup.\n- Teams policies, lobbies, anonymous-participant restrictions, verification checks, or end-to-end encryption can prevent a meeting bot from joining.\n\n## Decision summary\n\nChoose Fathom when it reliably captures your actual meeting platforms and its summaries reduce post-call cleanup. Compare alternatives when you need native in-person capture, Linux or mobile support, a different privacy model, or more predictable team-wide AI allowances.',
      'zh', E'## Fathom 是什么\n\nFathom 是面向 Zoom、Google Meet 和 Microsoft Teams 等受支持线上会议的 AI 助手。它可以录制或采集会议、生成转录与摘要、识别行动项，并支持会后跟进和团队知识沉淀。\n\n## 更适合\n\n- 经常进行线上会议的创始人、销售、客户成功、招聘和运营团队。\n- 希望先使用不限量录制、存储和转录，再决定是否为高级 AI 功能付费的个人。\n- 会真正复核摘要和行动项，而不是把转录稿直接当最终成果的团队。\n\n## 选择前必须核对\n\n- Free 包含不限量录制、存储和 38 种语言转录，但每月只有 5 次高级摘要。\n- Mac 和 Windows 支持原有会议流程；较新的无机器人体验当前仅支持 Mac，并仍按会议平台逐步开放。\n- 标准流程不支持 Chromebook、Linux、移动设备、Webinar、分组讨论室和没有标准会议链接的通话。\n- 录制发起者仍需负责参与者同意和当地法律合规；发送同意邮件不能替代对真实会议设置的审查。\n- Teams 管理策略、等候室、匿名参与者限制、人工验证或端到端加密都可能阻止会议机器人加入。\n\n## 决策结论\n\n如果 Fathom 能稳定采集你实际使用的会议平台，而且摘要确实减少会后整理，它值得选择；如果你需要原生线下录音、Linux 或移动端支持、不同的隐私模式，或者更可预测的团队 AI 额度，应继续比较替代方案。',
      'cn', E'## Fathom 是什么\n\nFathom 是面向 Zoom、Google Meet 和 Microsoft Teams 等受支持线上会议的 AI 助手。它可以录制或采集会议、生成转录与摘要、识别行动项，并支持会后跟进和团队知识沉淀。\n\n## 更适合\n\n- 经常进行线上会议的创始人、销售、客户成功、招聘和运营团队。\n- 希望先使用不限量录制、存储和转录，再决定是否为高级 AI 功能付费的个人。\n- 会真正复核摘要和行动项，而不是把转录稿直接当最终成果的团队。\n\n## 选择前必须核对\n\n- Free 包含不限量录制、存储和 38 种语言转录，但每月只有 5 次高级摘要。\n- Mac 和 Windows 支持原有会议流程；较新的无机器人体验当前仅支持 Mac，并仍按会议平台逐步开放。\n- 标准流程不支持 Chromebook、Linux、移动设备、Webinar、分组讨论室和没有标准会议链接的通话。\n- 录制发起者仍需负责参与者同意和当地法律合规；发送同意邮件不能替代对真实会议设置的审查。\n- Teams 管理策略、等候室、匿名参与者限制、人工验证或端到端加密都可能阻止会议机器人加入。\n\n## 决策结论\n\n如果 Fathom 能稳定采集你实际使用的会议平台，而且摘要确实减少会后整理，它值得选择；如果你需要原生线下录音、Linux 或移动端支持、不同的隐私模式，或者更可预测的团队 AI 额度，应继续比较替代方案。'
    ),
    'https://fathom.video/',
    'https://cdn.prod.website-files.com/6899da9beccbdbe92be49b5d/6a4283d5585a382afdece3f2_fathom_favicon.png',
    'https://cdn.prod.website-files.com/6899da9beccbdbe92be49b5d/68f20f5cd1c6d0de365b8849_Fathom-Visual_Identity_Concepts-Stage_07-Website_Thumbnail-01.jpg',
    productivity_id,
    ARRAY['meeting-notes', 'transcription', 'call-intelligence', 'collaboration'],
    'freemium',
    jsonb_build_object(
      'localized', jsonb_build_object(
        'en', jsonb_build_array(
          jsonb_build_object('label', 'Core workflow', 'value', 'Capture supported online meetings, produce summaries, and move action items into follow-up.'),
          jsonb_build_object('label', 'Free boundary', 'value', 'Unlimited recordings, storage, and transcription, with five advanced summaries per month.'),
          jsonb_build_object('label', 'Compatibility boundary', 'value', 'The newer bot-free experience is currently Mac-only; standard platform and meeting-link requirements still apply.')
        ),
        'zh', jsonb_build_array(
          jsonb_build_object('label', '核心流程', 'value', '采集受支持的线上会议、生成摘要，并把行动项推进到会后跟进。'),
          jsonb_build_object('label', '免费边界', 'value', '录制、存储和转录不限量，但每月只有 5 次高级摘要。'),
          jsonb_build_object('label', '兼容边界', 'value', '较新的无机器人体验当前仅支持 Mac，标准平台与会议链接要求仍然存在。')
        ),
        'cn', jsonb_build_array(
          jsonb_build_object('label', '核心流程', 'value', '采集受支持的线上会议、生成摘要，并把行动项推进到会后跟进。'),
          jsonb_build_object('label', '免费边界', 'value', '录制、存储和转录不限量，但每月只有 5 次高级摘要。'),
          jsonb_build_object('label', '兼容边界', 'value', '较新的无机器人体验当前仅支持 Mac，标准平台与会议链接要求仍然存在。')
        )
      ),
      'audience', jsonb_build_object(
        'bestFit', jsonb_build_object(
          'en', jsonb_build_array('Frequent online meetings', 'Sales and customer-success follow-up', 'Teams that review shared call knowledge'),
          'zh', jsonb_build_array('频繁线上会议', '销售与客户成功跟进', '会复核共享通话知识的团队'),
          'cn', jsonb_build_array('频繁线上会议', '销售与客户成功跟进', '会复核共享通话知识的团队')
        ),
        'notIdealFor', jsonb_build_object(
          'en', jsonb_build_array('Linux, Chromebook, or mobile-first capture', 'Webinars and breakout rooms', 'Teams that cannot use a meeting bot or review consent requirements'),
          'zh', jsonb_build_array('Linux、Chromebook 或移动端优先采集', 'Webinar 和分组讨论室', '无法使用会议机器人或审查同意要求的团队'),
          'cn', jsonb_build_array('Linux、Chromebook 或移动端优先采集', 'Webinar 和分组讨论室', '无法使用会议机器人或审查同意要求的团队')
        )
      ),
      'editorial', jsonb_build_object(
        'reviewedAt', '2026-09-01',
        'reviewedBy', 'AI Best Tool editorial',
        'sourceUrl', 'https://help.fathom.video/en/articles/5290881',
        'summary', jsonb_build_object(
          'en', 'Reviewed against current free-plan, device, capture, consent, and meeting-platform documentation.',
          'zh', '已根据当前免费套餐、设备、采集、同意和会议平台文档完成核验。',
          'cn', '已根据当前免费套餐、设备、采集、同意和会议平台文档完成核验。'
        ),
        'trustNote', jsonb_build_object(
          'en', 'Fathom 3.0 is rolling out in phases; verify the capture modes available on the actual account and meeting platform.',
          'zh', 'Fathom 3.0 正在分阶段开放，应在实际账号和会议平台中确认可用采集模式。',
          'cn', 'Fathom 3.0 正在分阶段开放，应在实际账号和会议平台中确认可用采集模式。'
        )
      ),
      'marketValidation', jsonb_build_object(
        'reviewedAt', '2026-09-01',
        'score', 94,
        'verdict', 'validated',
        'scores', jsonb_build_object('userValue', 24, 'independentValidation', 24, 'durability', 18, 'evidenceQuality', 19, 'strategicValue', 9),
        'strongSignals', jsonb_build_array('g2-7012-reviews', 'g2-2026-best-software-recognition'),
        'supportingSignals', jsonb_build_array('capterra-verified-review-presence', 'active-2026-product-documentation', 'gsc-existing-demand'),
        'evidenceUrls', jsonb_build_array(
          'https://www.g2.com/products/fathom-video/reviews',
          'https://www.capterra.com/p/276054/Fathom/reviews/',
          'https://help.fathom.video/en/articles/5290881',
          'https://help.fathom.video/en/articles/296576'
        ),
        'rationale', jsonb_build_object(
          'en', 'Fathom has sustained independent adoption evidence, including 7,012 G2 reviews, current Capterra coverage, and actively maintained product documentation. The product solves a durable meeting follow-up problem, while compatibility, consent, and team-plan boundaries remain material decision risks.',
          'zh', 'Fathom 具备持续的独立采用证据，包括 G2 的 7,012 条评价、Capterra 当前收录以及持续维护的产品文档。它解决了长期存在的会后跟进问题，但兼容性、录制同意和团队套餐边界仍是重要决策风险。',
          'cn', 'Fathom 具备持续的独立采用证据，包括 G2 的 7,012 条评价、Capterra 当前收录以及持续维护的产品文档。它解决了长期存在的会后跟进问题，但兼容性、录制同意和团队套餐边界仍是重要决策风险。'
        )
      )
    ),
    jsonb_build_object(
      'en', jsonb_build_array('Record and transcribe online meetings', 'Create summaries and action items', 'Prepare sales and customer follow-up', 'Search and share team call knowledge'),
      'zh', jsonb_build_array('记录并转录线上会议', '生成摘要和行动项', '准备销售与客户跟进', '检索和共享团队通话知识'),
      'cn', jsonb_build_array('记录并转录线上会议', '生成摘要和行动项', '准备销售与客户跟进', '检索和共享团队通话知识')
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
