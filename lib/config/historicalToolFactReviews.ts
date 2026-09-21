type Locale = 'en' | 'cn';

const REVIEWS = {
  character_ai: {
    checkedAt: '2026-09-06',
    nextReviewDate: '2026-09-20',
    title: 'Character.AI',
    url: 'https://character.ai/',
    summary: {
      en: 'Character.AI is an AI entertainment platform for creating characters, role-playing and interactive storytelling. It should not be treated as a factual research assistant: the company warns that characters can invent information.',
      cn: 'Character.AI 是用于创建角色、角色扮演和互动叙事的 AI 娱乐平台。它不应被当作事实研究助手：官方明确提醒角色可能编造信息。',
    },
    detail: {
      en: [
        ['What it is', 'Character.AI provides user-created conversational characters for stories, role-play and creative entertainment. Its official material describes separate adult and under-18 experiences.'],
        ['Best fit', 'Use it for fictional conversation, character creation and interactive storytelling when factual accuracy is not the main requirement.'],
        ['Important limits', 'Characters can make things up. Users under 18 receive a more restricted experience, and account age requirements vary by region. Do not rely on a character for medical, legal, financial or other consequential facts.'],
        ['Access and plans', 'A free experience is available. c.ai+ adds benefits such as access to newer models, better memory and ad-free chat; current checkout terms should be checked before paying.'],
        ['Review status', 'Official product scope, plan boundary and safety material were checked on 2026-09-06. This is not an independent hands-on score.'],
      ],
      cn: [
        ['产品是什么', 'Character.AI 提供用户创建的对话角色，用于故事、角色扮演和创意娱乐。官方资料说明成人与未成年人使用不同的体验。'],
        ['更适合谁', '适合不以事实准确性为首要目标的虚构对话、角色创建和互动叙事。'],
        ['重要限制', '角色可能编造信息。未满 18 岁用户使用限制更多，账号年龄要求因地区而异。不要依赖角色处理医疗、法律、金融等高影响事实。'],
        ['访问与套餐', '平台提供免费体验；c.ai+ 提供较新模型、更好记忆和无广告聊天等权益，付款前应以当前结账页为准。'],
        ['核验状态', '2026-09-06 已核对官方产品范围、套餐边界和安全资料；这不是独立实测评分。'],
      ],
    },
    sources: [
      ['What is Character.AI?', 'https://support.character.ai/hc/en-us/articles/14997389547931-What-is-Character-AI'],
      ['Safety Center', 'https://character.ai/safety'],
      ['c.ai+ plans', 'https://character.ai/subscribe'],
    ],
  },
  shutterstock: {
    checkedAt: '2026-09-06',
    nextReviewDate: '2026-09-20',
    title: 'Shutterstock GenAI',
    url: 'https://www.shutterstock.com/ai/',
    summary: {
      en: 'Shutterstock GenAI combines image and video generation, editing and licensed stock assets in one creative workflow. The listing is scoped to the GenAI product, not Shutterstock as a whole.',
      cn: 'Shutterstock GenAI 把图像与视频生成、编辑和授权素材整合到一个创作流程。本条目限定为 GenAI 产品，不代表 Shutterstock 全部业务。',
    },
    detail: {
      en: [
        ['What it is', 'Shutterstock GenAI is a creative suite for generating, editing and discovering images and video. It exposes multiple image and video models rather than one proprietary generator.'],
        ['Best fit', 'Consider it when a workflow needs generation plus stock discovery, editing and a defined licensing path in the same service.'],
        ['Important limits', 'Commercial use depends on an activated licensing product and the applicable license. Generated output is not guaranteed to be exclusive; some indemnity and human-review benefits depend on the plan.'],
        ['Access and plans', 'Plans differ by download allowance, AI-generation credits, seat count and license. Verify the current pricing and license pages for the intended use before subscribing.'],
        ['Review status', 'Official GenAI scope, pricing structure and licensing boundaries were checked on 2026-09-06. Output quality and legal suitability for a specific project were not independently tested.'],
      ],
      cn: [
        ['产品是什么', 'Shutterstock GenAI 是用于生成、编辑和查找图像与视频的创作套件，提供多个图像和视频模型，而不是单一自研生成器。'],
        ['更适合谁', '适合希望在同一服务中完成生成、素材搜索、编辑并获得明确授权路径的工作流。'],
        ['重要限制', '商业使用取决于已开通的授权产品及具体许可证；生成结果不保证独占，部分赔偿保障和人工审核只适用于相应套餐。'],
        ['访问与套餐', '套餐按下载额度、AI 生成 credits、席位和许可证区分。订阅前应根据实际用途核对当前价格页和授权条款。'],
        ['核验状态', '2026-09-06 已核对官方 GenAI 范围、价格结构和授权边界；未独立测试输出质量或特定项目的法律适用性。'],
      ],
    },
    sources: [
      ['Shutterstock GenAI', 'https://www.shutterstock.com/ai/'],
      ['AI image generator', 'https://www.shutterstock.com/ai-image-generator/'],
      ['Pricing', 'https://www.shutterstock.com/pricing'],
      ['License agreements', 'https://www.shutterstock.com/license'],
    ],
  },
  suno_ai: {
    checkedAt: '2026-09-21',
    nextReviewDate: '2026-10-21',
    title: 'Suno',
    url: 'https://suno.com/',
    summary: {
      en: 'Suno is an AI music-creation service for making and editing songs from text and uploaded audio. Commercial use, ownership, and downloads have separate plan and subscription-timing boundaries.',
      cn: 'Suno 是通过文本和上传音频创作、编辑歌曲的 AI 音乐服务。商业使用、所有权与下载分别受套餐及订阅时点边界约束。',
    },
    detail: {
      en: [
        ['What it is', 'Suno creates songs from prompts and audio inputs. The current product materials describe generation, uploading, editing, stem separation, custom models, and the higher-tier Studio workflow.'],
        ['Best fit', 'Use it for fast songwriting drafts, arrangement ideas, and creator experiments when you can keep an output log showing the account, plan, creation date, download date, and source material.'],
        ['Important limits', 'Free-plan songs have no commercial rights and no monthly song downloads. Suno says Pro or Premier subscribers at creation are the owners of those songs, while its paid-rights help page grants commercial-use rights to songs downloaded while subscribed. Treat those as separate timing checks; retain records and ask Suno or qualified counsel about a specific release. Commercial-use permission does not guarantee copyright protection, which is determined by the relevant jurisdiction.'],
        ['Access and plans', 'Free, Pro, and Premier differ in models, credits, downloads, queues, uploads, editing, stem tools, and commercial rights. Pro and Premier are the paid tiers that list commercial rights; verify the live plan table and checkout terms rather than relying on a cached or promotional price.'],
        ['Review status', 'Official product, plan, ownership, commercial-rights, download, and terms boundaries were checked on 2026-09-21. A mobile-store signal is used only for market maturity; music quality, originality, clearance, and distribution acceptance were not independently tested.'],
      ],
      cn: [
        ['产品是什么', 'Suno 可通过提示词和音频输入创作歌曲。当前产品资料描述了生成、上传、编辑、分轨、自定义模型和高阶 Studio 工作流。'],
        ['更适合谁', '适合快速写歌草稿、编曲灵感和创作者实验；前提是能为每个输出记录账号、套餐、创建日期、下载日期和所用源素材。'],
        ['重要限制', '免费套餐歌曲没有商业使用权，也没有每月歌曲下载额度。Suno 说明：在 Pro 或 Premier 订阅期间创建的歌曲归订阅用户所有；其付费权利帮助页则说明在订阅期间下载的歌曲会获得商业使用权。两者应作为独立的时点核对项；具体发行应保留记录，并向 Suno 或合格法律顾问确认。商业使用许可不保证获得版权保护，版权由相关司法辖区决定。'],
        ['访问与套餐', 'Free、Pro、Premier 在模型、credits、下载、队列、上传、编辑、分轨和商业权利上不同。Pro 与 Premier 是列出商业权利的付费档位；付款前应核对实时套餐表和结账条款，而不是沿用缓存或促销价格。'],
        ['核验状态', '2026-09-21 已核对官方产品、套餐、所有权、商业权利、下载和条款边界。移动应用商店信号只用于判断市场成熟度；未独立测试音乐质量、原创性、权利清理或第三方分发接受度。'],
      ],
    },
    sources: [
      ['Suno pricing', 'https://suno.com/pricing'],
      ['Paid subscription rights and downloads', 'https://help.suno.com/en/articles/9601665'],
      ['Song ownership by creation-time subscription', 'https://help.suno.com/en/articles/2416769'],
      ['Terms of Service', 'https://about.suno.com/terms'],
    ],
  },
  viggle: {
    checkedAt: '2026-09-21',
    nextReviewDate: '2026-10-21',
    title: 'Viggle AI',
    url: 'https://viggle.ai/',
    summary: {
      en: 'Viggle AI is a character, motion, and video-creation platform with web, iOS/Android app, and developer API paths. Plan gates, separate API billing, upload rights, training-use conditions, and retention can materially affect a production workflow.',
      cn: 'Viggle AI 是提供角色、动作和视频创作的平台，包含网页、iOS/Android 应用和开发者 API 路径。套餐门槛、独立 API 计费、上传权利、训练使用条件和留存会实质影响正式工作流。',
    },
    detail: {
      en: [
        ['What it is', 'Viggle provides character swapping, motion capture and animation, real-time swap, 3D asset workflows and developer APIs. Its official site presents web creation, iPhone/Android apps and API access as separate product paths.'],
        ['Best fit', 'Consider it for character-led short video, motion experiments, animation or game-pipeline evaluation, and API prototypes when the selected plan and source-material rights can be checked before delivery.'],
        ['Important limits', 'Free currently allows 5 videos/day, one concurrent generation and seven-day asset storage. Paid tiers raise credits, concurrency, storage, model access and watermark removal, while API credits are separately metered. Users remain responsible for rights, permissions and consent for likenesses, media and livestream content; generated effects are not clearance for third-party material.'],
        ['Data and rights boundary', 'User content is non-confidential under the Terms and Viggle receives a broad use licence, including training and fine-tuning. API content and content provided or generated while a user is paid have stated training exceptions without prior written consent, but this is not a blanket confidentiality guarantee. Sharing opt-in can allow other users to use content; keep backups and do not remove watermarks or legal notices.'],
        ['Access and plans', 'At this review snapshot, Free is $0 and the displayed monthly promotional prices are Pro $7.99, Live $15.99 and Max $63.99. Fees can change. API credits are $0.01 each and API results may use temporary signed links; verify live pricing and the exact product path before committing.'],
        ['Review status', 'Official product, plan, API, terms and privacy boundaries were checked on 2026-09-21. This maintenance used official sources only; generation quality, latency, output safety, legal clearance, production reliability and independent market adoption were not independently benchmarked.'],
      ],
      cn: [
        ['产品是什么', 'Viggle 提供角色替换、动作捕捉与动画、实时换人、3D 资产工作流和开发者 API。官网将网页创作、iPhone/Android 应用和 API 作为不同产品路径。'],
        ['更适合谁', '适合能在交付前核对所选套餐和源素材权利的角色短视频、动作实验、动画或游戏流程评估与 API 原型。'],
        ['重要限制', 'Free 当前为每天 5 条视频、一次并发和 7 天资产存储；付费档提高 credits、并发、存储、模型权限和去水印，而 API credits 独立按量计费。用户仍须对肖像、媒体和直播内容取得必要权利、许可与同意；生成效果不等于第三方素材已清权。'],
        ['数据与权利边界', '条款将用户内容视为非保密内容，并授予 Viggle 广泛使用许可，包括训练和微调。API 内容以及付费用户期间提供或生成的内容有无需事先书面同意的训练例外，但这不是全面保密保证。选择分享可让其他用户使用内容；应自行备份且不得移除水印或法律标记。'],
        ['访问与套餐', '本次复核快照中 Free 为 $0，显示的月付促销价为 Pro $7.99、Live $15.99、Max $63.99；费用可能变化。API credits 为每个 $0.01，API 结果可能使用临时签名链接；购买前应核对实时价格和具体产品路径。'],
        ['核验状态', '2026-09-21 已核对官方产品、套餐、API、条款和隐私边界。本次维护只使用官方来源；未独立测试生成质量、延迟、输出安全、法律清权、生产可靠性或独立市场采用。'],
      ],
    },
    sources: [
      ['Viggle', 'https://viggle.ai/'],
      ['Pricing', 'https://viggle.ai/pricing'],
      ['Terms of Use', 'https://viggle.ai/terms-of-use'],
      ['Privacy Policy', 'https://viggle.ai/privacy-policy'],
      ['API pricing and retention', 'https://docs.viggle.ai/v1/pricing'],
      ['API reference-to-video guide', 'https://docs.viggle.ai/v1/guides/quickstart-reference-to-video'],
    ],
  },
  'artiversehub-ai': {
    checkedAt: '2026-09-06', nextReviewDate: '2026-10-06', title: 'ArtiverseHub AI', url: 'https://artiversehub.ai/',
    summary: {
      en: 'ArtiverseHub AI presents an all-in-one image and video generation workspace. The former detail text incorrectly described Intuit financial products and has been withdrawn; independent adoption evidence is still missing.',
      cn: 'ArtiverseHub AI 提供一站式图像和视频生成工作区。旧详情错误介绍了 Intuit 金融产品，现已撤下；独立采用证据仍然缺失。',
    },
    detail: {
      en: [
        ['Verified scope', 'The official site describes image and video generation, multiple creative models and paid generation upgrades. This record does not represent Intuit or its products.'],
        ['Why it is monitored', 'The product is accessible, but this review found only first-party product claims and no sufficient independent adoption evidence for a Best recommendation.'],
        ['What to check next', 'Verify a real account workflow, output limits, current checkout terms and an independent user or market signal before reconsidering index approval.'],
        ['Review status', 'Identity and official scope checked 2026-09-06. No hands-on quality score or market-verification score was assigned.'],
      ],
      cn: [
        ['已核对范围', '官网描述图像与视频生成、多种创作模型和付费生成升级。本记录与 Intuit 及其产品无关。'],
        ['为什么观察', '产品入口可访问，但本轮只有产品方自述，缺少足以支持 Best 推荐的独立采用证据。'],
        ['下一步核验', '重新评估索引前，需要核验真实账号流程、输出限制、当前结账条款以及独立用户或市场信号。'],
        ['核验状态', '2026-09-06 已核对身份和官方范围；未填写实测质量分或市场验证分。'],
      ],
    },
    sources: [['Official site', 'https://artiversehub.ai/']],
  },
  'fastimage-ai-sketch-to-image': {
    checkedAt: '2026-09-06', nextReviewDate: '2026-10-06', title: 'Fast Image AI Sketch to Image', url: 'https://fastimage.ai/sketch-to-image',
    summary: {
      en: 'Fast Image AI Sketch to Image converts sketches into generated images for concept and design workflows. Its current listing lacks independent adoption evidence and verified account limits.',
      cn: 'Fast Image AI Sketch to Image 把草图转换为用于概念和设计工作流的生成图像。目前条目缺少独立采用证据和已核验的账号限制。',
    },
    detail: {
      en: [['Verified scope', 'The official product page and first-party guide describe sketch-conditioned image generation for illustration, product and spatial concepts.'], ['Why it is monitored', 'A product description alone does not establish output quality, reliable limits or meaningful market adoption.'], ['What to check next', 'Run one controlled sketch test, record account limits and find an independent usage signal before index reconsideration.'], ['Review status', 'Official scope checked 2026-09-06; hands-on and independent market validation remain open.']],
      cn: [['已核对范围', '官方产品页和第一方指南描述了面向插画、产品与空间概念的草图条件图像生成。'], ['为什么观察', '产品描述本身不能证明输出质量、稳定限制或真实市场采用。'], ['下一步核验', '重新考虑索引前，需要完成一次受控草图测试、记录账号限制并找到独立使用信号。'], ['核验状态', '2026-09-06 已核对官网范围；实测与独立市场验证仍待完成。']],
    },
    sources: [['Official tool', 'https://fastimage.ai/sketch-to-image'], ['First-party workflow guide', 'https://fastimage.ai/blog/the-creative-link-sketch-to-commercial-images-via-fast-image-ai']],
  },
  honeydo: {
    checkedAt: '2026-09-06', nextReviewDate: '2026-10-06', title: 'HoneyDo: Speak, Snap and Shop', url: 'https://apps.apple.com/us/app/honeydo-speak-snap-and-shop/id6473463998',
    summary: {
      en: 'HoneyDo is an iPhone grocery-list app using voice and photo input to organize shopping items. Availability is verifiable, but current plan limits and independent adoption have not been established.',
      cn: 'HoneyDo 是通过语音和照片输入整理购物项目的 iPhone 购物清单应用。应用入口可核对，但当前套餐限制和独立采用情况尚未确认。',
    },
    detail: {
      en: [['Verified scope', 'The App Store entry identifies an iPhone grocery-list application centered on spoken and photographed inputs.'], ['Why it is monitored', 'A store listing confirms availability, not sustained adoption, extraction accuracy or current paid boundaries.'], ['What to check next', 'Confirm regional availability, one photo-to-list result, sharing behavior, subscription terms and an independent user signal.'], ['Review status', 'Store identity checked 2026-09-06; no hands-on or market score assigned.']],
      cn: [['已核对范围', 'App Store 条目确认这是一款以语音和照片输入为核心的 iPhone 购物清单应用。'], ['为什么观察', '商店上架只能证明可用，不能证明持续采用、识别准确率或当前付费边界。'], ['下一步核验', '需确认地区可用性、一次照片转清单结果、共享行为、订阅条款和独立用户信号。'], ['核验状态', '2026-09-06 已核对商店身份；未填写实测或市场评分。']],
    },
    sources: [['Apple App Store', 'https://apps.apple.com/us/app/honeydo-speak-snap-and-shop/id6473463998']],
  },
  shop_your_ai_powered_Shopping_assistant: {
    checkedAt: '2026-09-06', nextReviewDate: '2026-10-06', title: 'Shop by Shopify (AI-enabled commerce app)', url: 'https://shop.app/',
    summary: {
      en: 'Shop is Shopify’s shopping, checkout and order-tracking app with AI-enabled discovery and agentic shopping connections. AI is one capability inside a broader commerce product, not a standalone assistant.',
      cn: 'Shop 是 Shopify 的购物、结账和订单追踪应用，并包含 AI 发现与智能体购物连接。AI 是综合商业产品中的一项能力，不是独立助手。',
    },
    detail: {
      en: [['Verified scope', 'Official Shopify material describes product discovery, Shop Pay checkout, order tracking and agentic shopping experiences.'], ['Why it is monitored', 'The historical title overstates a standalone AI assistant and does not separate consumer Shop features from merchant or developer capabilities.'], ['What to check next', 'Define the user job and region, then decide whether this belongs in an AI-tool directory or only in a commerce guide.'], ['Review status', 'Product scope checked 2026-09-06; the record is withheld from active tool recommendations pending classification.']],
      cn: [['已核对范围', 'Shopify 官方资料描述商品发现、Shop Pay 结账、订单追踪和智能体购物体验。'], ['为什么观察', '历史标题夸大了独立 AI 助手身份，也没有区分消费者 Shop、商家和开发者能力。'], ['下一步核验', '先明确用户任务和地区，再决定它应进入 AI 工具目录还是只出现在商业指南。'], ['核验状态', '2026-09-06 已核对产品范围；完成分类前不进入活跃工具推荐。']],
    },
    sources: [['Shop customer experience', 'https://help.shopify.com/en/manual/online-sales-channels/shop/customer-experience'], ['Shop', 'https://shop.app/']],
  },
  'tattooai-design': {
    checkedAt: '2026-09-06', nextReviewDate: '2026-10-06', title: 'Tattoo AI Design', url: 'https://tattooai.design/',
    summary: {
      en: 'Tattoo AI Design generates tattoo concepts and virtual try-on images. The service is active, but first-party claims do not yet establish design quality, safety for permanent use or independent adoption.',
      cn: 'Tattoo AI Design 用于生成纹身概念和虚拟试戴图。服务仍在运行，但第一方自述尚不能证明设计质量、永久纹身使用安全性或独立采用。',
    },
    detail: {
      en: [['Verified scope', 'The official site offers text-to-tattoo, image try-on and credit-based generation.'], ['Important limit', 'Generated images are concepts, not proof that a design is technically suitable, original or safe to tattoo. Review with a qualified artist before permanent use.'], ['Why it is monitored', 'Current evidence is first-party and pricing varies by access mode; independent adoption and hands-on output review remain missing.'], ['Review status', 'Scope and current pricing structure checked 2026-09-06; no Best ranking or market score assigned.']],
      cn: [['已核对范围', '官网提供文本生成纹身、图片试戴和按 credits 生成。'], ['重要限制', '生成图只是概念，不能证明图案适合实际纹身、具有原创性或安全；永久使用前应由合格纹身师评估。'], ['为什么观察', '当前证据主要来自产品方，且价格因购买方式变化；仍缺独立采用和输出实测。'], ['核验状态', '2026-09-06 已核对范围和当前价格结构；未给出 Best 排名或市场评分。']],
    },
    sources: [['Official site', 'https://tattooai.design/'], ['Pricing', 'https://tattooai.design/pricing/']],
  },
  'woy-ai': {
    checkedAt: '2026-09-06', nextReviewDate: '2026-10-06', title: 'Woy.ai (AI tools directory)', url: 'https://woy.ai/',
    summary: {
      en: 'Woy.ai is another AI tools directory, not an AI tool that performs a user task. Its old 2024 copy is stale and the record is outside the current single-tool index scope.',
      cn: 'Woy.ai 是另一个 AI 工具目录，不是直接完成用户任务的 AI 工具。旧版 2024 文案已经过时，该记录不属于当前单工具索引范围。',
    },
    detail: {
      en: [['Verified scope', 'The site organizes third-party AI products by category and product type.'], ['Why it is monitored', 'A directory competes at the discovery-platform level and should not masquerade as one recommended AI tool.'], ['What to do next', 'Retain only as a historical ecosystem reference unless a separate directory-comparison policy is approved.'], ['Review status', 'Identity checked 2026-09-06; excluded from active tool recommendations.']],
      cn: [['已核对范围', '该网站按分类和产品类型整理第三方 AI 产品。'], ['为什么观察', '目录属于发现平台层，不应伪装成一个被推荐的 AI 工具。'], ['下一步', '除非单独批准目录对比政策，否则只作为历史生态参考保留。'], ['核验状态', '2026-09-06 已核对身份；退出活跃工具推荐。']],
    },
    sources: [['Woy.ai categories', 'https://woy.ai/tags']],
  },
} as const;

export function getHistoricalToolFactReview(slug: string, locale: string) {
  if (!Object.prototype.hasOwnProperty.call(REVIEWS, slug)) return null;
  const review = REVIEWS[slug as keyof typeof REVIEWS];
  const language: Locale = locale === 'cn' || locale === 'tw' ? 'cn' : 'en';
  const sources = review.sources.map(([label, url]) => `- [${label}](${url})`).join('\n');
  return {
    checkedAt: review.checkedAt,
    nextReviewDate: review.nextReviewDate,
    title: review.title,
    url: review.url,
    content: review.summary[language],
    detail: `${review.detail[language].map(([heading, text]) => `## ${heading}\n\n${text}`).join('\n\n')}\n\n## ${language === 'cn' ? '官方来源' : 'Official sources'}\n\n${sources}`,
  };
}

export function applyHistoricalToolFactReview<
  T extends { name: string; title?: string; url?: string; content: string; detail?: string },
>(row: T, locale: string): T {
  const review = getHistoricalToolFactReview(row.name, locale);
  if (!review) return row;
  return {
    ...row,
    ...(typeof row.title === 'string' ? { title: review.title } : {}),
    ...(typeof row.url === 'string' ? { url: review.url } : {}),
    content: review.content,
    ...(typeof row.detail === 'string' ? { detail: review.detail } : {}),
  };
}

export default REVIEWS;
