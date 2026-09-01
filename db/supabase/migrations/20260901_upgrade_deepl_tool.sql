DO $$
DECLARE
  target_id uuid := '344e9732-ef03-4c23-993d-a35a65f4d41b';
  writing_id uuid := 'bcfc28b1-fe68-46bf-b26e-450ea20dc867';
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.tools WHERE id = target_id AND name = 'deepl'
  ) THEN
    RAISE EXCEPTION 'Cannot upgrade DeepL: expected production row was not found.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.tools WHERE name = 'deepl' AND id <> target_id
  ) THEN
    RAISE EXCEPTION 'Cannot upgrade DeepL: another tool row already exists.';
  END IF;

  UPDATE public.tools
  SET
    title = jsonb_build_object(
      'en', 'DeepL Translator, Write & API',
      'zh', 'DeepL 翻译、Write 与 API',
      'cn', 'DeepL 翻译、Write 与 API'
    ),
    content = jsonb_build_object(
      'en', 'DeepL combines machine translation, writing improvement, document translation, and developer APIs. The products share a language-AI foundation but use separate subscription paths, so buyers should choose by workflow and verify document formats, character allowances, data security, glossaries, and team administration before paying.',
      'zh', 'DeepL 提供机器翻译、写作改进、文档翻译和开发者 API。不同产品共享语言 AI 能力，但使用不同订阅路径，因此购买前应先按工作流选择，再核对文档格式、字符额度、数据安全、术语表和团队管理能力。',
      'cn', 'DeepL 提供机器翻译、写作改进、文档翻译和开发者 API。不同产品共享语言 AI 能力，但使用不同订阅路径，因此购买前应先按工作流选择，再核对文档格式、字符额度、数据安全、术语表和团队管理能力。'
    ),
    detail = jsonb_build_object(
      'en', E'## What DeepL is\n\nDeepL is a language-AI suite with separate products for translation, writing improvement, document workflows, voice, and developer integration. This page focuses on the decision most buyers face: whether they need DeepL Translator, DeepL Write, or the DeepL API.\n\n## Best fit\n\n- Individuals and teams translating business text or supported document formats while preserving tone and terminology.\n- Writers who need grammar, spelling, punctuation, wording, and phrasing suggestions in supported languages.\n- Product teams embedding translation or writing improvement through a REST API with usage controls and administration.\n\n## Check before choosing\n\n- Translator, Write, and API are separate subscription paths. Translator plans do not automatically include API access, and API plans do not unlock Pro services in the web translator or desktop apps.\n- Without a paid account, DeepL Write handles up to 1,500 characters at a time. Translator Pro raises this to 2,000, but full Write Pro and maximum data security require Write Pro or a bundle.\n- Current API Developer access permits one million translated characters in total and does not reset; API Growth adds larger usage, API Write, speech-to-text, cost controls, and multi-admin management.\n- Supported document formats, single-file sizes, and character limits differ substantially by Translator and API plan. Test the actual Word, PowerPoint, Excel, PDF, XLIFF, or localization workflow before rollout.\n- Maximum data-security promises attach to specified paid products and contexts. Do not assume a free web session, Translator seat, Write subscription, and API key have identical processing or retention terms.\n\n## Decision summary\n\nChoose Translator for human-facing text and document work, Write for editing and rewriting, and API for software integration. Compare all three only after defining the real workflow; otherwise it is easy to buy one subscription and discover that the required API, file format, allowance, or security control belongs to another plan.',
      'zh', E'## DeepL 是什么\n\nDeepL 是一套语言 AI 产品，分别覆盖翻译、写作改进、文档流程、语音和开发者集成。本页聚焦多数购买者真正面对的选择：需要 DeepL Translator、DeepL Write，还是 DeepL API。\n\n## 更适合\n\n- 需要翻译商务文本或支持的文档格式，并尽量保持语气和术语一致的个人与团队。\n- 需要在支持语言中检查语法、拼写、标点、措辞和表达方式的写作者。\n- 希望通过 REST API 在产品中集成翻译或写作改进，并控制用量与管理权限的产品团队。\n\n## 选择前必须核对\n\n- Translator、Write 和 API 是不同订阅路径。Translator 套餐不会自动提供 API，API 套餐也不会解锁网页翻译器和桌面应用的 Pro 权益。\n- 未付费账号的 DeepL Write 每次最多处理 1,500 字符；Translator Pro 提升到 2,000 字符，但完整 Write Pro 和最高数据安全需要 Write Pro 或组合套餐。\n- 当前 API Developer 总计可翻译 100 万字符且不会重置；API Growth 增加更高用量、API Write、语音转文字、成本控制和多管理员能力。\n- 支持的文档格式、单文件大小和字符上限会因 Translator 与 API 套餐明显不同。团队上线前应实际测试 Word、PowerPoint、Excel、PDF、XLIFF 或本地化流程。\n- 最高数据安全承诺只适用于明确的付费产品与使用场景。不要假设免费网页、Translator 席位、Write 订阅和 API key 的处理与保留规则完全相同。\n\n## 决策结论\n\n面向人工文本和文档工作选择 Translator，编辑与改写选择 Write，软件集成选择 API。只有先定义真实工作流再比较三者，才能避免付费后才发现 API、文件格式、额度或安全控制属于另一个套餐。',
      'cn', E'## DeepL 是什么\n\nDeepL 是一套语言 AI 产品，分别覆盖翻译、写作改进、文档流程、语音和开发者集成。本页聚焦多数购买者真正面对的选择：需要 DeepL Translator、DeepL Write，还是 DeepL API。\n\n## 更适合\n\n- 需要翻译商务文本或支持的文档格式，并尽量保持语气和术语一致的个人与团队。\n- 需要在支持语言中检查语法、拼写、标点、措辞和表达方式的写作者。\n- 希望通过 REST API 在产品中集成翻译或写作改进，并控制用量与管理权限的产品团队。\n\n## 选择前必须核对\n\n- Translator、Write 和 API 是不同订阅路径。Translator 套餐不会自动提供 API，API 套餐也不会解锁网页翻译器和桌面应用的 Pro 权益。\n- 未付费账号的 DeepL Write 每次最多处理 1,500 字符；Translator Pro 提升到 2,000 字符，但完整 Write Pro 和最高数据安全需要 Write Pro 或组合套餐。\n- 当前 API Developer 总计可翻译 100 万字符且不会重置；API Growth 增加更高用量、API Write、语音转文字、成本控制和多管理员能力。\n- 支持的文档格式、单文件大小和字符上限会因 Translator 与 API 套餐明显不同。团队上线前应实际测试 Word、PowerPoint、Excel、PDF、XLIFF 或本地化流程。\n- 最高数据安全承诺只适用于明确的付费产品与使用场景。不要假设免费网页、Translator 席位、Write 订阅和 API key 的处理与保留规则完全相同。\n\n## 决策结论\n\n面向人工文本和文档工作选择 Translator，编辑与改写选择 Write，软件集成选择 API。只有先定义真实工作流再比较三者，才能避免付费后才发现 API、文件格式、额度或安全控制属于另一个套餐。'
    ),
    url = 'https://www.deepl.com/',
    image_url = 'https://www.deepl.com/img/favicon/tile_large.png',
    thumbnail_url = 'https://www.deepl.com/img/favicon/automatic_social_share_deepl.png',
    category_id = writing_id,
    tags = ARRAY['translation', 'writing-assistant', 'language-api', 'document-translation'],
    pricing = 'freemium',
    features = jsonb_build_object(
      'localized', jsonb_build_object(
        'en', jsonb_build_array(
          jsonb_build_object('label', 'Product choice', 'value', 'Translator serves text and document work, Write improves prose, and API plans support software integration.'),
          jsonb_build_object('label', 'Document boundary', 'value', 'Format availability, file size, and character limits vary by product and plan.'),
          jsonb_build_object('label', 'Security boundary', 'value', 'Maximum data security belongs to specified paid contexts; verify the exact product and account state.')
        ),
        'zh', jsonb_build_array(
          jsonb_build_object('label', '产品选择', 'value', 'Translator 面向文本与文档，Write 面向写作改进，API 套餐面向软件集成。'),
          jsonb_build_object('label', '文档边界', 'value', '格式可用性、文件大小和字符上限会因产品与套餐而变化。'),
          jsonb_build_object('label', '安全边界', 'value', '最高数据安全只属于明确的付费场景，应核对具体产品和账号状态。')
        ),
        'cn', jsonb_build_array(
          jsonb_build_object('label', '产品选择', 'value', 'Translator 面向文本与文档，Write 面向写作改进，API 套餐面向软件集成。'),
          jsonb_build_object('label', '文档边界', 'value', '格式可用性、文件大小和字符上限会因产品与套餐而变化。'),
          jsonb_build_object('label', '安全边界', 'value', '最高数据安全只属于明确的付费场景，应核对具体产品和账号状态。')
        )
      ),
      'audience', jsonb_build_object(
        'bestFit', jsonb_build_object(
          'en', jsonb_build_array('Professional multilingual communication', 'Supported document translation', 'Translation or writing API integration'),
          'zh', jsonb_build_array('专业多语言沟通', '受支持的文档翻译', '翻译或写作 API 集成'),
          'cn', jsonb_build_array('专业多语言沟通', '受支持的文档翻译', '翻译或写作 API 集成')
        ),
        'notIdealFor', jsonb_build_object(
          'en', jsonb_build_array('Assuming every product shares one subscription', 'Unreviewed high-stakes translation', 'Unsupported file or language workflows'),
          'zh', jsonb_build_array('假设所有产品共用一个订阅', '未经复核的高风险翻译', '不受支持的文件或语言流程'),
          'cn', jsonb_build_array('假设所有产品共用一个订阅', '未经复核的高风险翻译', '不受支持的文件或语言流程')
        )
      ),
      'editorial', jsonb_build_object(
        'reviewedAt', '2026-09-01',
        'reviewedBy', 'AI Best Tool editorial',
        'sourceUrl', 'https://www.deepl.com/en/products-overview',
        'summary', jsonb_build_object(
          'en', 'Reviewed against current DeepL product, Write, API-plan, and file-format documentation.',
          'zh', '已根据 DeepL 当前产品、Write、API 套餐和文件格式文档完成核验。',
          'cn', '已根据 DeepL 当前产品、Write、API 套餐和文件格式文档完成核验。'
        ),
        'trustNote', jsonb_build_object(
          'en', 'Market maturity supports continued coverage, but users should test their own language pair, terminology, document formatting, and high-stakes review process.',
          'zh', '市场成熟度支持持续收录，但用户仍应测试自己的语言对、术语、文档格式和高风险人工复核流程。',
          'cn', '市场成熟度支持持续收录，但用户仍应测试自己的语言对、术语、文档格式和高风险人工复核流程。'
        )
      ),
      'marketValidation', jsonb_build_object(
        'reviewedAt', '2026-09-01',
        'score', 96,
        'verdict', 'validated',
        'scores', jsonb_build_object('userValue', 24, 'independentValidation', 24, 'durability', 22, 'evidenceQuality', 18, 'strategicValue', 8),
        'strongSignals', jsonb_build_array('g2-translate-159-reviews-4.6', 'techcrunch-300m-round-2b-valuation', 'founded-2017'),
        'supportingSignals', jsonb_build_array('enterprise-product-suite', 'translator-write-api-separate-products', 'current-official-documentation'),
        'evidenceUrls', jsonb_build_array(
          'https://www.g2.com/products/deepl-translate/reviews',
          'https://techcrunch.com/2024/05/22/deepl-the-ai-language-translation-startup-nabs-300m-on-a-2b-valuation-to-focus-on-b2b-growth/',
          'https://www.deepl.com/en/products-overview',
          'https://support.deepl.com/hc/en-us/articles/6318834492700-About-DeepL-Write',
          'https://support.deepl.com/hc/en-us/articles/360021200939-DeepL-API-plans'
        ),
        'rationale', jsonb_build_object(
          'en', 'DeepL is a durable language-AI vendor founded in 2017, with 159 current G2 Translate reviews at 4.6/5 and a reported 2024 $300M round at a $2B valuation. Those signals validate ongoing coverage, while the page keeps translation quality, formatting, product packaging, and security claims scoped to documented or user-tested contexts.',
          'zh', 'DeepL 是 2017 年成立的成熟语言 AI 厂商，当前 G2 Translate 有 159 条评价、评分 4.6/5，且 2024 年外部报道其以 20 亿美元估值融资 3 亿美元。这些信号支持持续收录，但页面仍将翻译质量、格式、产品组合和安全结论限制在文档或用户实测范围内。',
          'cn', 'DeepL 是 2017 年成立的成熟语言 AI 厂商，当前 G2 Translate 有 159 条评价、评分 4.6/5，且 2024 年外部报道其以 20 亿美元估值融资 3 亿美元。这些信号支持持续收录，但页面仍将翻译质量、格式、产品组合和安全结论限制在文档或用户实测范围内。'
        )
      )
    ),
    use_cases = jsonb_build_object(
      'en', jsonb_build_array('Translate professional text', 'Translate supported business documents', 'Improve multilingual writing', 'Embed language AI through an API'),
      'zh', jsonb_build_array('翻译专业文本', '翻译受支持的商务文档', '改进多语言写作', '通过 API 集成语言 AI'),
      'cn', jsonb_build_array('翻译专业文本', '翻译受支持的商务文档', '改进多语言写作', '通过 API 集成语言 AI')
    ),
    status = 'published',
    page_quality_status = 'continue_index',
    next_review_date = DATE '2026-10-01',
    updated_at = NOW()
  WHERE id = target_id;
END $$;
