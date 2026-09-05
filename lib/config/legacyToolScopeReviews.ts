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
} as const;

export default function getLegacyToolScopeReview(slug: string, locale: string) {
  if (!Object.prototype.hasOwnProperty.call(REVIEWS, slug)) return null;
  const review = REVIEWS[slug as keyof typeof REVIEWS];
  if (!review) return null;
  const language = locale === 'cn' || locale === 'tw' ? 'cn' : 'en';
  return {
    checkedAt: review.checkedAt,
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
    content: review.summary,
    detail: `${paragraphs.map(([heading, text]) => `## ${heading}\n\n${text}`).join('\n\n')}\n\n## ${chinese ? '官方来源' : 'Official sources'}\n\n${sources}`,
  };
}

export function applyLegacyToolScope<T extends { name: string; content: string; detail?: string }>(
  row: T,
  locale: string,
): T {
  const correction = getLegacyToolScopeContent(row.name, locale);
  if (!correction) return row;
  return {
    ...row,
    content: correction.content,
    ...(typeof row.detail === 'string' ? { detail: correction.detail } : {}),
  };
}
