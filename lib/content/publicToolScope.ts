// Reader copy for the existing restricted records. Product identity, metadata and index policy stay in config.
const guidance: Record<string, { cn: [string, string]; en: [string, string] }> = {
  'woy-ai': {
    cn: [
      'Woy.ai 按分类和产品类型整理第三方 AI 产品，适合发现其他产品，本身不执行这些 AI 任务。',
      '进入具体产品官网，核对功能、价格与使用条件。',
    ],
    en: [
      'Woy.ai organizes third-party AI products by category and product type. It helps discover products rather than performing their AI tasks.',
      'Open the specific product website to check capabilities, pricing, and terms.',
    ],
  },
  adobe: {
    cn: [
      'Adobe 是一个产品品牌。Firefly 的生成式 AI 能力不代表其他 Adobe 应用、套餐或授权都包含在内。',
      '先确定具体应用，再从官方产品页核对所需能力和许可。',
    ],
    en: [
      'Adobe is a product brand. Firefly’s generative AI capabilities do not imply that other Adobe apps, plans, or licenses are included.',
      'Choose the specific application, then check its capabilities and license on the official product page.',
    ],
  },
  salesforce_einstein: {
    cn: [
      'Einstein 涉及多项 Salesforce AI 服务，并非一个统一套餐的独立工具。Einstein Copilot 的更名只适用于相应助手。',
      '先明确 Sales、Service 或其他具体功能，再核对账号权限、许可和部署要求。',
    ],
    en: [
      'Einstein covers multiple Salesforce AI services rather than one standalone plan. The Einstein Copilot naming history concerns that assistant.',
      'Select the specific Sales, Service, or other feature, then verify account access, licensing, and deployment requirements.',
    ],
  },
  'chatgpt-mac': {
    cn: [
      '这是 ChatGPT 的 macOS 桌面应用入口，不是独立模型。',
      '通过 ChatGPT 官方下载页获取应用，并在官方帮助中心核对系统要求。',
    ],
    en: [
      'This is the macOS desktop application for ChatGPT, rather than a separate model.',
      'Get the app through the official ChatGPT download page and check system requirements in the Help Center.',
    ],
  },
  gpt_4o: {
    cn: [
      'GPT-4o 是 OpenAI API 模型，已于 2026 年 2 月退出 ChatGPT，API 仍可用。',
      '需要 API 时，请从官方模型页核对输入输出类型、上下文和 token 价格。',
    ],
    en: [
      'GPT-4o is an OpenAI API model. It was retired from ChatGPT in February 2026 while remaining available in the API.',
      'For API use, check modalities, context, and token pricing on the official model page.',
    ],
  },
  openai: {
    cn: [
      'OpenAI 是公司和产品品牌，不是具有统一功能、价格和入口的单个 AI 工具。',
      '先选择具体产品或模型，例如 ChatGPT、API 模型或 Codex，再核对对应的官方说明。',
    ],
    en: [
      'OpenAI is a company and product brand, with no single feature set, price, or usage entry point.',
      'Choose a specific product or model, such as ChatGPT, an API model, or Codex, then check its official documentation.',
    ],
  },
  sora: {
    cn: [
      'Sora 网站和应用已于 2026 年 4 月 26 日停止服务，Sora API 计划于 2026 年 9 月 24 日停止。',
      '新的视频工作流需要选择仍在运营的工具。现有 API 用户请核对官方停止服务说明。',
    ],
    en: [
      'The Sora website and app were discontinued on April 26, 2026, with the API scheduled to shut down on September 24, 2026.',
      'Choose an operating tool for a new video workflow. Existing API users should check the official shutdown notice.',
    ],
  },
};
export function getPublicToolScope(slug: string, locale: string) {
  return guidance[slug]?.[locale === 'cn' || locale === 'tw' ? 'cn' : 'en'] || null;
}

// Remove only known editorial scheduling/status fragments from reader prose. Historical facts and citations remain intact.
export function publicToolNarrative(text: string) {
  return text
    .replace(/[，;]\s*(?:下次事实复查(?:为)?|next fact review)\s*\d{4}-\d{2}-\d{2}/gi, '')
    .replace(/\s*Next fact review:\s*[A-Za-z]+ \d{1,2}, \d{4}; changes or conflicts trigger earlier review\./gi, '')
    .replace(/；下次事实复核为\s*\d{4}-\d{2}-\d{2}，变化或冲突会触发提前复核。/g, '。')
    .replace(/\s*Index release remains gated after directory reconciliation\./g, '');
}
export function getPublicToolSummary(slug: string, locale: string, original: string) {
  return getPublicToolScope(slug.toLowerCase(), locale)?.[0] || publicToolNarrative(original);
}
export function getPublicToolDetail(slug: string, locale: string, original: string) {
  const checks: Record<string, { cn: string; en: string }> = {
    'artiversehub-ai': {
      cn: '用非敏感素材检查账号流程与输出限制，并在购买前核对当前结账条款。',
      en: 'Check the account workflow and output limits with non-sensitive material, and review current checkout terms before purchasing.',
    },
    'fastimage-ai-sketch-to-image': {
      cn: '使用与你的任务相近的草图检查输出质量和账号限制；产品说明不能代替实际结果。',
      en: 'Use a representative sketch to check output quality and account limits; product descriptions do not establish the result of your task.',
    },
    honeydo: {
      cn: '先确认所在地区能否使用，再检查照片转清单结果、共享行为和订阅条款。',
      en: 'Confirm regional availability, then check a photo-to-list result, sharing behavior, and subscription terms.',
    },
    'tattooai-design': {
      cn: '价格会随购买方式变化，付费前请核对 credits 和当前套餐；生成概念需由合格纹身师评估。',
      en: 'Pricing varies by access mode. Check credits and the current plan before paying, and have generated concepts reviewed by a qualified tattoo artist.',
    },
  };
  if (checks[slug]) {
    const chinese = locale === 'cn' || locale === 'tw';
    const sections = original.split(/(?=^## )/m);
    const scope = sections.filter((section) =>
      /^## (?:Verified scope|Important limit|已核对范围|重要限制)\n/.test(section),
    );
    const sources = sections.filter((section) => /^## (?:Official sources|官方来源)\n/.test(section));
    const date = original.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0];
    // Unexpected source shape stays visible and fails the HTML gate rather than silently losing evidence.
    if (!scope.length || !sources.length || !date) return publicToolNarrative(original);
    return [
      ...scope,
      `## ${chinese ? '选择前核对' : 'Before choosing'}\n\n${checks[slug][chinese ? 'cn' : 'en']}`,
      `${chinese ? '产品范围依据官方资料核查于' : 'Product scope checked against official sources on'} ${date}.`,
      ...sources,
    ].join('\n\n');
  }
  if (slug !== 'woy-ai') return publicToolNarrative(original);
  const scope = getPublicToolScope(slug, locale)!;
  return (
    scope.join('\n\n') +
    (locale === 'cn' || locale === 'tw'
      ? '\n\n产品范围核查于 2026-09-06。\n\n- [Woy.ai categories](https://woy.ai/tags)'
      : '\n\nProduct scope checked 2026-09-06.\n\n- [Woy.ai categories](https://woy.ai/tags)')
  );
}
