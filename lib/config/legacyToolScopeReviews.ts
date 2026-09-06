const REVIEWS = {
  adobe: {
    checkedAt: '2026-09-04',
    summary: {
      cn: 'Adobe 是品牌范围，不是一个单独的 AI 工具。这条历史记录尚未完成具体产品范围核验，不能视为 Firefly 的已核验条目。',
      en: 'Adobe is a brand, not a single AI tool. This historical listing still needs product-scope review and is not a verified Firefly listing.',
    },
    next: {
      cn: '先确定要使用的具体产品。Firefly 官方页可用于核对其生成式 AI 能力，但不能把 Adobe 其他应用、套餐或授权一并视为包含。',
      en: 'Identify the specific product first. The Firefly page documents its generative AI scope; do not assume other Adobe apps, plans or licenses are included.',
    },
    sources: [{ label: 'Adobe Firefly', url: 'https://www.adobe.com/products/firefly.html' }],
  },
  salesforce_einstein: {
    checkedAt: '2026-09-04',
    summary: {
      cn: 'Einstein 涉及多项 Salesforce AI 服务，并非一个统一套餐的独立工具。不能把整个 Einstein 体系直接更名为 Agentforce。',
      en: 'Einstein covers multiple Salesforce AI services, not a standalone tool with one plan. The entire Einstein family cannot simply be renamed Agentforce.',
    },
    next: {
      cn: '先明确 Sales、Service 或其他具体功能，再核对账号权限、许可和部署要求。Einstein Copilot 的更名说明仅适用于相应助手，不证明其他条目是可直接替代的产品。',
      en: 'Select the specific Sales, Service or other feature, then verify access, licensing and deployment requirements. The Einstein Copilot naming history concerns that assistant, not every Einstein service or a proven interchangeable alternative.',
    },
    sources: [
      {
        label: 'Agentforce & Einstein Platform',
        url: 'https://compliance.salesforce.com/en/services/agentforce-einstein-platform',
      },
      {
        label: 'Einstein Copilot / Agentforce Assistant',
        url: 'https://www.salesforce.com/agentforce/einstein-copilot/',
      },
    ],
  },
  'chatgpt-mac': {
    checkedAt: '2026-09-06',
    title: { cn: 'ChatGPT macOS 桌面应用', en: 'ChatGPT desktop app for macOS' },
    officialUrl: 'https://chatgpt.com/download/',
    summary: {
      cn: '这条历史记录描述的是 ChatGPT 的 macOS 桌面入口，不是一个独立模型或独立产品。旧页面包含非官方 DMG 下载地址和已经过时的能力、套餐表述，现已隔离。',
      en: 'This historical record describes the macOS desktop entry point for ChatGPT, not a separate model or product. Its former copy included an unofficial DMG and outdated capability and plan claims, so it is now isolated.',
    },
    next: {
      cn: '只能通过 ChatGPT 官方下载页获取应用，并根据官方帮助中心核对系统要求。后续若保留，应并入 ChatGPT 主产品记录，而不是继续作为独立工具推荐。',
      en: 'Download only through the official ChatGPT download page and verify system requirements in the Help Center. If retained later, this entry should be merged into the main ChatGPT record rather than recommended as a separate tool.',
    },
    sources: [
      { label: 'ChatGPT official download', url: 'https://chatgpt.com/download/' },
      {
        label: 'Downloading the ChatGPT macOS app',
        url: 'https://help.openai.com/en/articles/9275200-downloading-the-chatgpt-macos-app',
      },
    ],
  },
  gpt_4o: {
    checkedAt: '2026-09-06',
    title: { cn: 'GPT-4o API 模型', en: 'GPT-4o API model' },
    officialUrl: 'https://developers.openai.com/api/docs/models/gpt-4o',
    summary: {
      cn: 'GPT-4o 是 OpenAI API 模型，不是一个可独立注册的 ChatGPT 工具。它已于 2026 年 2 月退出 ChatGPT，但 API 仍可用；旧页面的价格、支持和合规表述均未得到当前官方资料支持。',
      en: 'GPT-4o is an OpenAI API model, not a separately registered ChatGPT tool. It was retired from ChatGPT in February 2026 while remaining available in the API; the former pricing, support and compliance claims are not supported by current official material.',
    },
    next: {
      cn: '需要 API 的开发者应以官方模型页核对输入输出、上下文和当前 token 价格。面向 ChatGPT 用户的选择不应再把 GPT-4o 描述为当前可选产品。',
      en: 'Developers who need the API should use the official model page for modalities, context and current token pricing. ChatGPT-facing guidance should no longer present GPT-4o as a current selectable product.',
    },
    sources: [
      { label: 'GPT-4o API model', url: 'https://developers.openai.com/api/docs/models/gpt-4o' },
      {
        label: 'Retiring GPT-4o from ChatGPT',
        url: 'https://help.openai.com/en/articles/20001051',
      },
    ],
  },
  openai: {
    checkedAt: '2026-09-06',
    title: { cn: 'OpenAI（公司记录）', en: 'OpenAI (company record)' },
    officialUrl: 'https://openai.com/',
    summary: {
      cn: 'OpenAI 是公司和产品品牌范围，不是一个具有单一功能、价格和使用入口的 AI 工具。旧页面把公司层信息包装成单个工具，不能用于可靠比较。',
      en: 'OpenAI is a company and product-family scope, not one AI tool with a single feature set, price and entry point. The former page packaged company-level information as one tool and cannot support a reliable comparison.',
    },
    next: {
      cn: '先选择具体产品或模型，例如 ChatGPT、API 模型或 Codex，再使用对应官方资料核对能力和限制。本公司记录不参与工具推荐。',
      en: 'Choose a specific product or model, such as ChatGPT, an API model or Codex, then verify capabilities and limits from its official material. This company record is excluded from tool recommendations.',
    },
    sources: [{ label: 'OpenAI', url: 'https://openai.com/' }],
  },
  sora: {
    checkedAt: '2026-09-06',
    title: { cn: 'Sora（已停止服务）', en: 'Sora (discontinued)' },
    officialUrl: 'https://openai.com/sora/',
    summary: {
      cn: '这条历史 Sora 产品记录已不适合作为活跃工具推荐。OpenAI 官方说明 Sora 网站和应用已于 2026 年 4 月 26 日停止服务，Sora API 计划于 2026 年 9 月 24 日停止。',
      en: 'This historical Sora product record is no longer suitable for active-tool recommendations. OpenAI states that the Sora website and app were discontinued on April 26, 2026, with the Sora API scheduled to shut down on September 24, 2026.',
    },
    next: {
      cn: '不要为新工作流选择本条已停止服务的产品。页面仅保留为状态说明；如需视频生成工具，应从仍在运营且完成核验的产品中重新选择。',
      en: 'Do not select this discontinued product for a new workflow. The page is retained only as a status notice; choose a currently operating, verified video tool instead.',
    },
    sources: [
      { label: 'Sora status', url: 'https://openai.com/sora/' },
      { label: 'Creating with Sora safely', url: 'https://openai.com/index/creating-with-sora-safely/' },
    ],
  },
} as const;

export default function getLegacyToolScopeReview(slug: string, locale: string) {
  if (!Object.prototype.hasOwnProperty.call(REVIEWS, slug)) return null;
  const review = REVIEWS[slug as keyof typeof REVIEWS];
  if (!review) return null;
  const language = locale === 'cn' || locale === 'tw' ? 'cn' : 'en';
  return {
    checkedAt: review.checkedAt,
    title: 'title' in review ? review.title[language] : undefined,
    officialUrl: 'officialUrl' in review ? review.officialUrl : undefined,
    summary: review.summary[language],
    next: review.next[language],
    sources: review.sources,
  };
}

export function getLegacyToolScopeContent(slug: string, locale: string) {
  const review = getLegacyToolScopeReview(slug, locale);
  if (!review) return null;
  const chinese = locale === 'cn' || locale === 'tw';
  const localizedParagraphs = {
    cn: [
      ['本条记录的范围', review.summary],
      ['选择前需要明确什么', review.next],
      [
        '尚未确认的信息',
        '具体套餐、地区价格、账号权限和实际效果尚未完成核验。此前品牌级简介不能证明所有功能包含在同一产品中；本页暂不提供统一价格、软件评分或适用人群推荐。',
      ],
      [
        '建议的核验步骤',
        '先写下要完成的具体任务和产品名称，再从官方文档核对入口、许可与限制。使用不含敏感信息的样例检查结果，记录成本和人工修正时间。这是建议步骤，不是已完成的实测。',
      ],
      [
        '记录状态',
        `本次仅修正对象范围和旧文案，依据核对日期为${review.checkedAt}。独立市场核验及最终页面处置尚未完成，不代表获得收录批准，也未更名为其他产品。`,
      ],
    ],
    en: [
      ['Scope of this record', review.summary],
      ['What to identify before choosing', review.next],
      [
        'What remains unknown',
        'Specific plans, regional prices, account permissions and real-world results still need verification. The former brand-level description did not establish that all features belong to one product. This page does not provide a single price, software rating or audience recommendation.',
      ],
      [
        'Suggested verification steps',
        'Write down the specific task and product name, then check official entry points, licenses and limits. Use a non-sensitive example to inspect results and record costs and manual correction time. These are proposed checks, not completed hands-on testing.',
      ],
      [
        'Record status',
        `This correction only addresses scope and legacy copy using sources checked ${review.checkedAt}. Independent market review and final page disposition remain open. It is not admission approval or a rename to another product.`,
      ],
    ],
  };
  const paragraphs = localizedParagraphs[chinese ? 'cn' : 'en'];
  const sources = review.sources.map((source) => `- [${source.label}](${source.url})`).join('\n');
  return {
    title: review.title,
    url: review.officialUrl,
    content: review.summary,
    detail: `${paragraphs.map(([heading, text]) => `## ${heading}\n\n${text}`).join('\n\n')}\n\n## ${chinese ? '官方来源' : 'Official sources'}\n\n${sources}`,
  };
}

export function applyLegacyToolScope<
  T extends { name: string; title?: string; url?: string; content: string; detail?: string },
>(
  row: T,
  locale: string,
): T {
  const correction = getLegacyToolScopeContent(row.name, locale);
  if (!correction) return row;
  return {
    ...row,
    ...(typeof row.title === 'string' && correction.title ? { title: correction.title } : {}),
    ...(typeof row.url === 'string' && correction.url ? { url: correction.url } : {}),
    content: correction.content,
    ...(typeof row.detail === 'string' ? { detail: correction.detail } : {}),
  };
}
