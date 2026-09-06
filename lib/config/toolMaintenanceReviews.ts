const TOOL_MAINTENANCE_REVIEWS = {
  consensus: {
    id: 'f15873ae-c6ef-4f0a-b811-b40c2aba76ab',
    checkedAt: '2026-09-06',
    nextReviewDate: '2026-10-06',
    outcome: 'reviewed_no_change',
    changeSummary:
      'Current official plan, corpus, full-text and Deep Review facts remain aligned with the production profile.',
    scope: 'Official plan, corpus, full-text and Deep Review boundaries; not a new market validation or hands-on test.',
    unresolved: ['Independent review source requires browser verification; previous market validation date retained.'],
    note: {
      en: 'Start with a question you already know and inspect the cited papers. On Free, a Deep Review also consumes a Pro message; a full-text checkmark indicates full-text analysis, not a right to download the article. Save the search terms and verify methods before reusing a conclusion.',
      zh: '先用一个已有判断的问题试查，并逐条阅读引用。免费版 Deep Review 也会消耗一次 Pro 消息；全文勾选标记表示分析使用了全文，不代表获得论文下载权限。保留检索词，核对研究方法后再引用结论。',
    },
    sources: [
      'https://help.consensus.app/en/articles/10087865-subscription-plans',
      'https://help.consensus.app/en/articles/10055108-consensus-research-database',
      'https://help.consensus.app/en/articles/11740827-how-to-use-deep-review',
    ],
  },
  gamma: {
    id: '6512aa61-8663-49f8-809d-2a2ab4e529ad',
    checkedAt: '2026-09-06',
    nextReviewDate: '2026-10-06',
    outcome: 'fact_updated',
    changeSummary:
      'Clarified current PPTX font handling and added the default editable-table export boundary from the official export documentation.',
    scope:
      'Official plan mechanics, import/export and workspace data controls; not a new market validation or hands-on test.',
    unresolved: [
      'No reliable price amounts in the public pricing text; verify account checkout before quoting prices.',
    ],
    note: {
      en: 'Trial an existing deck before subscribing: plain import keeps text, not the original layout. Gamma embeds theme fonts in PPTX, but Google Slides substitutes embedded fonts and rare export fetch failures can fall back. Editable tables are on by default, while PowerPoint changes rounded table corners to sharp ones. Free credits do not refresh; paid subscriptions are per user. Check Data Controls before uploading sensitive material, because individual workspaces allow training use by default unless you opt out.',
      zh: '订阅前先用一份已有演示稿试用：普通导入保留文本，不保留原布局。Gamma 会在 PPTX 中嵌入主题字体，但 Google Slides 会替换嵌入字体，少数导出抓取失败也可能触发字体回退。表格默认以可编辑形式导出，但 PowerPoint 会把圆角改为直角。免费 credits 不会定期补充，付费订阅按用户计费。上传敏感材料前检查 Data Controls，个人工作区默认允许训练使用，需要自行退出。',
    },
    sources: [
      'https://help.gamma.app/en/articles/8077107-how-can-i-upgrade-my-gamma-subscription',
      'https://help.gamma.app/en/articles/11047840-how-can-i-import-slides-or-documents-into-gamma',
      'https://help.gamma.app/en/articles/8022861-what-s-the-easiest-way-to-export-my-gamma',
      'https://help.gamma.app/en/articles/12281928-does-gamma-use-my-content-to-train-its-ai-features',
      'https://help.gamma.app/en/articles/7834324-how-do-credits-work-in-gamma',
    ],
  },
  perplexity: {
    id: '3d018623-85f9-4df4-bd55-9a4a0e7a2d93',
    checkedAt: '2026-09-06',
    nextReviewDate: '2026-10-06',
    outcome: 'fact_updated',
    changeSummary:
      'Recorded conflicting official Free Pro Search allowances and added separate API and Computer credit boundaries.',
    scope:
      'Official consumer plans, data retention, source labels, API separation and Computer credits; not a new market validation or hands-on accuracy benchmark.',
    unresolved: [
      'Official help articles currently disagree between three and five Free Pro Searches per day; the signed-in account meter remains authoritative.',
    ],
    note: {
      en: 'Check the same consequential question in Perplexity and the original cited pages. Treat the signed-in usage meter as authoritative because official Free allowance articles currently conflict. Web plans do not include API access, and Computer credits are a separate variable-cost system.',
      zh: '用同一个重要问题对照 Perplexity 答案与引用原文。官方 Free 次数页面当前存在冲突，因此以登录后的额度页为准。网页套餐不包含 API，Computer credits 也是独立的浮动成本系统。',
    },
    sources: [
      'https://www.perplexity.ai/help-center/en/articles/11187416-which-perplexity-subscription-plan-is-right-for-you',
      'https://www.perplexity.ai/help-center/en/articles/10352998-account-management-and-security',
      'https://www.perplexity.ai/help-center/en/articles/11564572-data-collection-at-perplexity',
      'https://www.perplexity.ai/help-center/en/articles/20260806-understanding-source-labels',
      'https://www.perplexity.ai/help-center/en/articles/13838041-how-credits-work-on-perplexity',
    ],
  },
  make: {
    id: 'c0bb3aba-33be-4e14-903e-5f1d036eec4a',
    checkedAt: '2026-09-06',
    nextReviewDate: '2026-10-06',
    outcome: 'reviewed_no_change',
    changeSummary:
      'Current official credit, AI connection, data-region and webhook queue boundaries remain aligned with the production snapshot.',
    scope:
      'Official billing unit, AI provider cost split, organization data region and webhook queue boundaries; not a new market validation or live scenario benchmark.',
    unresolved: ['Real credit use and failure recovery still require a representative production scenario.'],
    note: {
      en: 'Pilot one representative scenario and read its run records. Custom AI connections charge Make credits and provider tokens separately; built-in AI can use dynamic credits. Select the US or EU data region deliberately because it cannot be changed after organization creation.',
      zh: '先用一个代表性 scenario 查看真实运行记录。自有 AI 连接会分别产生 Make credits 和模型商 token 成本，内置 AI 可能动态消耗 credits。创建 organization 时应谨慎选择美国或欧盟数据区，因为之后不能更改。',
    },
    sources: [
      'https://help.make.com/credits',
      'https://help.make.com/how-features-use-credits',
      'https://help.make.com/organizations',
      'https://help.make.com/webhooks',
    ],
  },
} as const;

export default TOOL_MAINTENANCE_REVIEWS;
