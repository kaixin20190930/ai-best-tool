const TOOL_MAINTENANCE_REVIEWS = {
  consensus: {
    id: 'f15873ae-c6ef-4f0a-b811-b40c2aba76ab',
    checkedAt: '2026-09-04',
    nextReviewDate: '2026-09-07',
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
    checkedAt: '2026-09-04',
    nextReviewDate: '2026-09-07',
    scope:
      'Official plan mechanics, import/export and workspace data controls; not a new market validation or hands-on test.',
    unresolved: [
      'No reliable price amounts in the public pricing text; verify account checkout before quoting prices.',
    ],
    note: {
      en: 'Trial an existing deck before subscribing: plain import keeps text, not the original layout. Compare the exported PPTX in the final presentation app. Free credits do not refresh; paid subscriptions are per user. Check Data Controls before uploading sensitive material, because individual workspaces allow training use by default unless you opt out.',
      zh: '订阅前先用一份已有演示稿试用：普通导入保留文本，不保留原布局；在最终演示软件中检查导出的 PPTX。免费 credits 不会定期补充，付费订阅按用户计费。上传敏感材料前检查 Data Controls，个人工作区默认允许训练使用，需要自行退出。',
    },
    sources: [
      'https://help.gamma.app/en/articles/8077107-how-can-i-upgrade-my-gamma-subscription',
      'https://help.gamma.app/en/articles/11047840-how-can-i-import-slides-or-documents-into-gamma',
      'https://help.gamma.app/en/articles/8022861-what-s-the-easiest-way-to-export-my-gamma',
      'https://help.gamma.app/en/articles/12281928-does-gamma-use-my-content-to-train-its-ai-features',
    ],
  },
} as const;

export default TOOL_MAINTENANCE_REVIEWS;
