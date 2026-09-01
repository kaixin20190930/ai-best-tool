DO $$
DECLARE
  target_id uuid := 'f15873ae-c6ef-4f0a-b811-b40c2aba76ab';
  productivity_id uuid := '1d866b7d-6340-4a0b-8333-a301cc52172c';
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.tools WHERE name = 'consensus' AND id <> target_id
  ) THEN
    RAISE EXCEPTION 'Cannot migrate Consensus: another tool row already exists.';
  END IF;

  INSERT INTO public.tools (
    id, name, title, content, detail, url, image_url, thumbnail_url,
    category_id, tags, pricing, features, use_cases, screenshots, video_url,
    status, submitted_by, page_quality_status, next_review_date, created_at, updated_at
  ) VALUES (
    target_id,
    'consensus',
    jsonb_build_object(
      'en', 'Consensus AI Academic Search',
      'zh', 'Consensus AI 学术搜索',
      'cn', 'Consensus AI 学术搜索'
    ),
    jsonb_build_object(
      'en', 'Consensus searches a large corpus of peer-reviewed research and uses AI to surface papers, study snapshots, and evidence syntheses. It is useful for research scoping and literature discovery, but coverage, full-text access, retrieval, and AI interpretation must be checked before using its output in academic, clinical, or policy decisions.',
      'zh', 'Consensus 在大型同行评审研究语料库中检索论文，并通过 AI 提供论文结果、研究快照和证据综合。它适合研究范围探索和文献发现，但在用于学术、临床或政策决策前，必须核对语料覆盖、全文访问、检索结果和 AI 解读。',
      'cn', 'Consensus 在大型同行评审研究语料库中检索论文，并通过 AI 提供论文结果、研究快照和证据综合。它适合研究范围探索和文献发现，但在用于学术、临床或政策决策前，必须核对语料覆盖、全文访问、检索结果和 AI 解读。'
    ),
    jsonb_build_object(
      'en', E'## What Consensus is\n\nConsensus is an AI workspace for scientific research. It searches a corpus of more than 220 million peer-reviewed papers and supports direct paper search, AI-assisted synthesis, Study Snapshots, Deep Reviews, saved libraries, and API or MCP access.\n\n## Best fit\n\n- Students, researchers, clinicians, analysts, and evidence-focused teams scoping a question or finding candidate papers.\n- People who want claims linked to identifiable papers instead of an answer sourced from the general web.\n- Workflows that use AI to accelerate discovery, then verify methods, results, limitations, and citations in the source material.\n\n## Check before choosing\n\n- Free includes unlimited Papers searches, but Pro messages, Deep Reviews, Study Snapshots, and API or MCP calls have monthly limits.\n- Pro is currently $20 monthly or $144 annually and includes unlimited Pro messages, 15 Deep Reviews, unlimited Study Snapshots, and 250 API or MCP calls per month.\n- Deep is currently $65 monthly or $540 annually and raises Deep Reviews to 200 and API or MCP calls to 1,000 per month.\n- Full-text analysis is available for some papers, but viewing or downloading the article still depends on open access or the user\'s personal or institutional subscription.\n- Consensus is not an exhaustive bibliographic database or a replacement for a documented systematic-review protocol, duplicate screening, risk-of-bias assessment, or critical reading.\n\n## Decision summary\n\nChoose Consensus when you need a fast, citation-linked starting point for scientific evidence. Use PubMed, Web of Science, Scopus, discipline databases, and a documented review workflow when recall, reproducibility, and formal evidence grading are mandatory.',
      'zh', E'## Consensus 是什么\n\nConsensus 是面向科学研究的 AI 工作区。它检索超过 2.2 亿篇同行评审论文，并支持直接论文搜索、AI 综合、Study Snapshot、Deep Review、保存文献库以及 API 或 MCP 接入。\n\n## 更适合\n\n- 需要界定问题范围或寻找候选论文的学生、研究人员、临床人员、分析师和证据导向团队。\n- 希望每条结论能追溯到明确论文，而不是来自通用网页回答的用户。\n- 使用 AI 加速发现，随后会在原文中核验方法、结果、限制和引用的流程。\n\n## 选择前必须核对\n\n- Free 提供不限量 Papers 搜索，但 Pro 消息、Deep Review、Study Snapshot 和 API/MCP 调用有月度限制。\n- Pro 当前为每月 $20 或每年 $144，包含不限量 Pro 消息、每月 15 次 Deep Review、不限量 Study Snapshot 和 250 次 API/MCP 调用。\n- Deep 当前为每月 $65 或每年 $540，每月 Deep Review 提升至 200 次，API/MCP 调用提升至 1,000 次。\n- 部分论文支持全文分析，但查看或下载文章仍取决于开放获取或用户的个人/机构订阅。\n- Consensus 不是穷尽式书目数据库，也不能替代有记录的系统综述方案、重复筛选、偏倚风险评估和批判性阅读。\n\n## 决策结论\n\n当你需要快速获得带引用的科学证据起点时，可以选择 Consensus；当任务要求高召回率、可复现性和正式证据评级时，应继续使用 PubMed、Web of Science、Scopus、学科数据库和有记录的综述流程。',
      'cn', E'## Consensus 是什么\n\nConsensus 是面向科学研究的 AI 工作区。它检索超过 2.2 亿篇同行评审论文，并支持直接论文搜索、AI 综合、Study Snapshot、Deep Review、保存文献库以及 API 或 MCP 接入。\n\n## 更适合\n\n- 需要界定问题范围或寻找候选论文的学生、研究人员、临床人员、分析师和证据导向团队。\n- 希望每条结论能追溯到明确论文，而不是来自通用网页回答的用户。\n- 使用 AI 加速发现，随后会在原文中核验方法、结果、限制和引用的流程。\n\n## 选择前必须核对\n\n- Free 提供不限量 Papers 搜索，但 Pro 消息、Deep Review、Study Snapshot 和 API/MCP 调用有月度限制。\n- Pro 当前为每月 $20 或每年 $144，包含不限量 Pro 消息、每月 15 次 Deep Review、不限量 Study Snapshot 和 250 次 API/MCP 调用。\n- Deep 当前为每月 $65 或每年 $540，每月 Deep Review 提升至 200 次，API/MCP 调用提升至 1,000 次。\n- 部分论文支持全文分析，但查看或下载文章仍取决于开放获取或用户的个人/机构订阅。\n- Consensus 不是穷尽式书目数据库，也不能替代有记录的系统综述方案、重复筛选、偏倚风险评估和批判性阅读。\n\n## 决策结论\n\n当你需要快速获得带引用的科学证据起点时，可以选择 Consensus；当任务要求高召回率、可复现性和正式证据评级时，应继续使用 PubMed、Web of Science、Scopus、学科数据库和有记录的综述流程。'
    ),
    'https://consensus.app/',
    'https://framerusercontent.com/images/JIMYIDUw1B1vBLpK39FsF42He0s.png',
    'https://framerusercontent.com/images/XDdcwnAMRql0O6Yhga77yEaI1hs.png',
    productivity_id,
    ARRAY['academic-search', 'research-papers', 'literature-review', 'evidence-synthesis'],
    'freemium',
    jsonb_build_object(
      'localized', jsonb_build_object(
        'en', jsonb_build_array(
          jsonb_build_object('label', 'Core workflow', 'value', 'Search peer-reviewed papers, inspect linked evidence, save sources, and use AI synthesis as a research starting point.'),
          jsonb_build_object('label', 'Coverage boundary', 'value', 'The corpus exceeds 220 million papers, but full-text access and disciplinary coverage still vary.'),
          jsonb_build_object('label', 'Method boundary', 'value', 'Deep Reviews accelerate synthesis but do not replace reproducible systematic-review methods or source verification.')
        ),
        'zh', jsonb_build_array(
          jsonb_build_object('label', '核心流程', 'value', '搜索同行评审论文、检查关联证据、保存来源，并将 AI 综合作为研究起点。'),
          jsonb_build_object('label', '覆盖边界', 'value', '语料超过 2.2 亿篇论文，但全文访问和学科覆盖仍会变化。'),
          jsonb_build_object('label', '方法边界', 'value', 'Deep Review 可以加速综合，但不能替代可复现的系统综述方法和原文核验。')
        ),
        'cn', jsonb_build_array(
          jsonb_build_object('label', '核心流程', 'value', '搜索同行评审论文、检查关联证据、保存来源，并将 AI 综合作为研究起点。'),
          jsonb_build_object('label', '覆盖边界', 'value', '语料超过 2.2 亿篇论文，但全文访问和学科覆盖仍会变化。'),
          jsonb_build_object('label', '方法边界', 'value', 'Deep Review 可以加速综合，但不能替代可复现的系统综述方法和原文核验。')
        )
      ),
      'audience', jsonb_build_object(
        'bestFit', jsonb_build_object(
          'en', jsonb_build_array('Research scoping and paper discovery', 'Citation-linked evidence questions', 'Teams that verify AI synthesis against source papers'),
          'zh', jsonb_build_array('研究范围探索与论文发现', '需要引用来源的证据问题', '会对照原论文复核 AI 综合的团队'),
          'cn', jsonb_build_array('研究范围探索与论文发现', '需要引用来源的证据问题', '会对照原论文复核 AI 综合的团队')
        ),
        'notIdealFor', jsonb_build_object(
          'en', jsonb_build_array('Replacing a formal systematic review', 'Assuming every paper is available in full text', 'Using summaries without methods and citation checks'),
          'zh', jsonb_build_array('替代正式系统综述', '假设所有论文都能访问全文', '不核验方法与引用就使用摘要'),
          'cn', jsonb_build_array('替代正式系统综述', '假设所有论文都能访问全文', '不核验方法与引用就使用摘要')
        )
      ),
      'editorial', jsonb_build_object(
        'reviewedAt', '2026-09-01',
        'reviewedBy', 'AI Best Tool editorial',
        'sourceUrl', 'https://help.consensus.app/en/articles/9922673-how-consensus-works',
        'summary', jsonb_build_object(
          'en', 'Reviewed against current database, subscription, full-text, product, and independent peer-reviewed evidence.',
          'zh', '已根据当前数据库、套餐、全文、产品文档和独立同行评审证据完成核验。',
          'cn', '已根据当前数据库、套餐、全文、产品文档和独立同行评审证据完成核验。'
        ),
        'trustNote', jsonb_build_object(
          'en', 'The product has meaningful adoption, but independent research still finds limited empirical benchmarking of recall, precision, workflow gains, and ethical outcomes.',
          'zh', '产品已有明显采用，但独立研究仍指出，关于召回率、准确率、工作流收益和伦理结果的实证基准有限。',
          'cn', '产品已有明显采用，但独立研究仍指出，关于召回率、准确率、工作流收益和伦理结果的实证基准有限。'
        )
      ),
      'marketValidation', jsonb_build_object(
        'reviewedAt', '2026-09-01',
        'score', 91,
        'verdict', 'validated',
        'scores', jsonb_build_object('userValue', 24, 'independentValidation', 21, 'durability', 19, 'evidenceQuality', 18, 'strategicValue', 9),
        'strongSignals', jsonb_build_array('2.5m-monthly-active-users', '30m-series-b-2026', 'peer-reviewed-independent-review'),
        'supportingSignals', jsonb_build_array('product-hunt-11-reviews-1.2k-followers', 'active-2026-changelog', 'major-publisher-full-text-partnerships'),
        'evidenceUrls', jsonb_build_array(
          'https://consensus.app/home/blog/30m-in-new-funding-to-reach-the-next-10m-researchers/',
          'https://www.axios.com/newsletters/axios-pro-rata-ee2bb87d-7727-42df-84ba-01f8e9c2ce65',
          'https://pmc.ncbi.nlm.nih.gov/articles/PMC12318603/',
          'https://www.producthunt.com/products/consensus-2'
        ),
        'rationale', jsonb_build_object(
          'en', 'Consensus has durable signals through 2.5 million reported monthly active users, a 2026 $30M funding round, active product development, Product Hunt adoption, and an independent peer-reviewed review. The review also finds limited empirical benchmarking, so validation supports continued coverage but not unqualified research-accuracy claims.',
          'zh', 'Consensus 具备持续信号，包括官方报告的 250 万月活、2026 年 $3,000 万融资、持续产品更新、Product Hunt 采用和独立同行评审。但该综述也指出实证基准仍有限，因此可以确认产品值得收录，却不能无条件宣称研究准确性。',
          'cn', 'Consensus 具备持续信号，包括官方报告的 250 万月活、2026 年 $3,000 万融资、持续产品更新、Product Hunt 采用和独立同行评审。但该综述也指出实证基准仍有限，因此可以确认产品值得收录，却不能无条件宣称研究准确性。'
        )
      )
    ),
    jsonb_build_object(
      'en', jsonb_build_array('Scope a scientific question', 'Find candidate peer-reviewed papers', 'Compare study findings and evidence direction', 'Build a verified research reading list'),
      'zh', jsonb_build_array('界定科学问题范围', '寻找候选同行评审论文', '比较研究结果与证据方向', '建立已核验研究阅读清单'),
      'cn', jsonb_build_array('界定科学问题范围', '寻找候选同行评审论文', '比较研究结果与证据方向', '建立已核验研究阅读清单')
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
