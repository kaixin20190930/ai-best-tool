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
    checkedAt: '2026-09-06',
    nextReviewDate: '2026-09-20',
    title: 'Suno',
    url: 'https://suno.com/',
    summary: {
      en: 'Suno is an AI music creation service for generating and editing songs from prompts and uploaded audio. Commercial rights and downloads depend on the plan and on when the song was created and downloaded.',
      cn: 'Suno 是通过提示词和上传音频生成、编辑歌曲的 AI 音乐服务。商业使用权与下载能力取决于套餐，以及歌曲创建和下载时的订阅状态。',
    },
    detail: {
      en: [
        ['What it is', 'Suno turns text and audio inputs into songs and offers editing, remixing, stems and a higher-tier Studio workflow.'],
        ['Best fit', 'Use it for rapid song ideation and production experiments when you can track which account tier created and downloaded each output.'],
        ['Important limits', 'Free-plan outputs are for personal, non-commercial use. A later subscription does not automatically grant retroactive commercial rights. Commercial-use permission does not guarantee copyright protection, and download limits apply by plan.'],
        ['Access and plans', 'Free, Pro and Premier plans differ by models, monthly credits, download allowances, editing tools and commercial-use rights. Prices and limits can change, so confirm the live pricing page before purchase.'],
        ['Review status', 'Official plan, ownership and commercial-use boundaries were checked on 2026-09-06. Music quality, originality and platform-distribution acceptance were not independently tested.'],
      ],
      cn: [
        ['产品是什么', 'Suno 可把文本和音频输入转为歌曲，并提供编辑、混音、分轨以及高阶 Studio 工作流。'],
        ['更适合谁', '适合快速歌曲构思和制作实验，前提是能够记录每个输出在什么套餐下创建和下载。'],
        ['重要限制', '免费套餐输出仅限个人非商业使用；之后再订阅不会自动追溯授予商业权。商业使用许可不保证获得版权保护，各套餐还有下载数量限制。'],
        ['访问与套餐', 'Free、Pro、Premier 按模型、月度 credits、下载额度、编辑工具和商业使用权区分。价格和限制会变化，付款前应核对实时价格页。'],
        ['核验状态', '2026-09-06 已核对官方套餐、所有权和商业使用边界；未独立测试音乐质量、原创性或第三方分发平台是否接受。'],
      ],
    },
    sources: [
      ['Suno pricing', 'https://suno.com/pricing'],
      ['Paid subscription rights', 'https://help.suno.com/en/articles/9601665'],
      ['Ownership', 'https://help.suno.com/en/articles/2416769'],
      ['Terms of Service', 'https://about.suno.com/terms'],
    ],
  },
  viggle: {
    checkedAt: '2026-09-06',
    nextReviewDate: '2026-09-20',
    title: 'Viggle AI',
    url: 'https://viggle.ai/',
    summary: {
      en: 'Viggle AI is a video-generation and character-animation platform with motion transfer, real-time swap and API workflows. Plan limits materially affect watermarking, storage, concurrency and model access.',
      cn: 'Viggle AI 是提供动作迁移、实时换人和 API 工作流的视频生成与角色动画平台。套餐会显著影响水印、存储、并发和模型权限。',
    },
    detail: {
      en: [
        ['What it is', 'Viggle provides AI character animation, motion transfer, real-time swap, multi-track creation and developer APIs.'],
        ['Best fit', 'Consider it for character-led short video, animation prototypes or API products that need motion and swap controls.'],
        ['Important limits', 'The free plan has daily generation and seven-day storage limits. Paid tiers change concurrency, watermark, storage and model access. Users must have rights to uploaded likenesses and media; celebrity and infringing content may be removed.'],
        ['Access and plans', 'Free, Pro, Live and Max plans are credit- and feature-based. Promotional prices may change; compare the current plan table and API terms before committing.'],
        ['Review status', 'Official product, plan and content-rights boundaries were checked on 2026-09-06. Generation quality and API reliability were not independently benchmarked.'],
      ],
      cn: [
        ['产品是什么', 'Viggle 提供 AI 角色动画、动作迁移、实时换人、多轨创作和开发者 API。'],
        ['更适合谁', '适合需要动作和换人控制的角色短视频、动画原型或 API 产品。'],
        ['重要限制', '免费套餐有每日生成和 7 天存储限制；付费档位会改变并发、水印、存储和模型权限。用户必须拥有上传人物肖像和媒体的权利，名人或侵权内容可能被删除。'],
        ['访问与套餐', 'Free、Pro、Live、Max 按 credits 和功能区分。促销价格可能变化，购买前应比较当前套餐表和 API 条款。'],
        ['核验状态', '2026-09-06 已核对官方产品、套餐和内容权利边界；未独立测试生成质量或 API 可靠性。'],
      ],
    },
    sources: [
      ['Viggle', 'https://viggle.ai/'],
      ['Pricing', 'https://viggle.ai/pricing'],
      ['Terms of Use', 'https://viggle.ai/terms-of-use'],
    ],
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
