import type { BilingualCopy, ComparisonEvidence } from './verifiedComparison';

export type GuideTaskCheck = {
  title: BilingualCopy;
  checks: BilingualCopy[];
  evidence: ComparisonEvidence[];
  next: { href: string; label: BilingualCopy }[];
};

// Reader protocols, not product execution or benchmark results. Source dates apply only to the cited claim.
export const guideTaskChecks: Record<string, GuideTaskCheck> = {
  'how-to-choose-ai-tools': {
    title: {
      cn: '完成一件可交付的工作',
      en: 'Finish one deliverable',
    },
    checks: [
      {
        cn: '选一份日常输入，写下输出格式和完成标准。',
        en: 'Choose an everyday input and define the output format and acceptance criteria.',
      },
      {
        cn: '用相同输入试两个候选，记录人工修改时间。',
        en: 'Try two candidates with the same input and record manual correction time.',
      },
      {
        cn: '导出结果并交给实际接收者打开，确认权限和格式。',
        en: 'Export the result and have its intended recipient check access and formatting.',
      },
    ],
    evidence: [
      {
        id: 'how-to-choose-ai-tools-source',
        claim: {
          cn: 'Notion 的工作区导出不能通过重新上传立即恢复为原工作区。',
          en: 'A Notion workspace export cannot instantly recreate the workspace when uploaded again.',
        },
        impact: {
          cn: '把导出与恢复分别测试，避免把可下载等同于可迁移。',
          en: 'Test export and restoration separately before treating a download as a migration.',
        },
        source: {
          label: 'Notion: export your content',
          url: 'https://www.notion.com/help/export-your-content',
        },
        checkedAt: '2026-09-14',
      },
    ],
    next: [
      {
        href: '/ai/notion#decision-card',
        label: {
          cn: '查看 Notion 的适用边界与来源',
          en: 'Review Notion fit and sources',
        },
      },
      {
        href: '/guides/free-ai-tools',
        label: {
          cn: '检查免费使用限制',
          en: 'Check free-tier limitations',
        },
      },
    ],
  },
  'free-ai-tools': {
    title: {
      cn: '验证免费层能否完成整项任务',
      en: 'Check whether the free tier completes the job',
    },
    checks: [
      {
        cn: '先确认免费额度是长期配额还是一次性试用。',
        en: 'Separate recurring free allowances from one-time trials.',
      },
      {
        cn: '从输入到导出走完整流程，记录在哪一步需要付费。',
        en: 'Run the full input-to-export workflow and record any payment gate.',
      },
      {
        cn: '检查文件能否带走；只有预览可用时，不计为完成。',
        en: 'Check whether you can take the files away; a preview alone is not a completed job.',
      },
    ],
    evidence: [
      {
        id: 'free-ai-tools-source',
        claim: {
          cn: 'Notion 的工作区导出不能通过重新上传立即恢复为原工作区。',
          en: 'A Notion workspace export cannot instantly recreate the workspace when uploaded again.',
        },
        impact: {
          cn: '把导出与恢复分别测试，避免把可下载等同于可迁移。',
          en: 'Test export and restoration separately before treating a download as a migration.',
        },
        source: {
          label: 'Notion: export your content',
          url: 'https://www.notion.com/help/export-your-content',
        },
        checkedAt: '2026-09-14',
      },
    ],
    next: [
      {
        href: '/ai/notion#decision-card',
        label: {
          cn: '查看 Notion 的适用边界与来源',
          en: 'Review Notion fit and sources',
        },
      },
      {
        href: '/guides/how-to-choose-ai-tools',
        label: {
          cn: '核对选型步骤',
          en: 'Review the selection steps',
        },
      },
    ],
  },
  'best-free-ai-tools': {
    title: {
      cn: '按可完成的产出选择免费工具',
      en: 'Choose free tools by completed output',
    },
    checks: [
      {
        cn: '固定一项任务，不把聊天、制图和自动化混成一个排名。',
        en: 'Fix one task; do not rank chat, images and automation on one scale.',
      },
      {
        cn: '记录重试、额度恢复和可导出次数，计算可完成的交付量。',
        en: 'Record retries, allowance resets and exports to estimate completed deliverables.',
      },
      {
        cn: '用相同输出标准筛选；关键步骤付费则另列预算。',
        en: 'Apply the same acceptance criteria and budget separately for paid steps.',
      },
    ],
    evidence: [
      {
        id: 'best-free-ai-tools-source',
        claim: {
          cn: 'Notion 的工作区导出不能通过重新上传立即恢复为原工作区。',
          en: 'A Notion workspace export cannot instantly recreate the workspace when uploaded again.',
        },
        impact: {
          cn: '把导出与恢复分别测试，避免把可下载等同于可迁移。',
          en: 'Test export and restoration separately before treating a download as a migration.',
        },
        source: {
          label: 'Notion: export your content',
          url: 'https://www.notion.com/help/export-your-content',
        },
        checkedAt: '2026-09-14',
      },
    ],
    next: [
      {
        href: '/ai/notion#decision-card',
        label: {
          cn: '查看 Notion 的适用边界与来源',
          en: 'Review Notion fit and sources',
        },
      },
      {
        href: '/guides/how-to-choose-ai-tools',
        label: {
          cn: '核对选型步骤',
          en: 'Review the selection steps',
        },
      },
    ],
  },
  'ai-writing-tools': {
    title: {
      cn: '用一篇真实稿件检查写作工具',
      en: 'Test a writing tool on one real draft',
    },
    checks: [
      {
        cn: '准备含事实来源、读者和语气要求的简报。',
        en: 'Prepare a brief with factual sources, an audience and tone requirements.',
      },
      {
        cn: '对照原始来源检查数字、引文和专有名词。',
        en: 'Check numbers, quotations and names against the original sources.',
      },
      {
        cn: '分别记录起草和人工编辑时间，再检查最终导出格式。',
        en: 'Record drafting and editing time separately, then check the export format.',
      },
    ],
    evidence: [
      {
        id: 'ai-writing-tools-source',
        claim: {
          cn: 'Google 的生成内容指南要求关注准确性、质量与相关性。',
          en: 'Google’s guidance for generated content emphasizes accuracy, quality and relevance.',
        },
        impact: {
          cn: '复核引用与事实后再发布；生成数量不是验收标准。',
          en: 'Review facts and citations before publishing; volume is not an acceptance criterion.',
        },
        source: {
          label: 'Google Search: generative AI content',
          url: 'https://developers.google.com/search/docs/fundamentals/using-gen-ai-content',
        },
        checkedAt: '2026-09-14',
      },
    ],
    next: [
      {
        href: '/ai/claude#decision-card',
        label: {
          cn: '查看 Claude 的适用边界与来源',
          en: 'Review Claude fit and sources',
        },
      },
      {
        href: '/guides/how-to-choose-ai-tools',
        label: {
          cn: '核对选型步骤',
          en: 'Review the selection steps',
        },
      },
    ],
  },
  'ai-seo-tools': {
    title: {
      cn: '先确定需要的是诊断还是写作',
      en: 'Separate diagnosis from content drafting',
    },
    checks: [
      {
        cn: '选一个实际页面和目标查询，记录已有内容问题。',
        en: 'Choose a real page and query and record the existing content problem.',
      },
      {
        cn: '检查关键词或分析结果的地区、时间和数据来源。',
        en: 'Check the region, date and source behind keyword or analysis results.',
      },
      {
        cn: '修改后检查准确性和可读性；生成字数不能证明内容有效。',
        en: 'Review accuracy and readability after editing; generated word count is not proof of usefulness.',
      },
    ],
    evidence: [
      {
        id: 'ai-seo-tools-source',
        claim: {
          cn: 'Google 的生成内容指南要求关注准确性、质量与相关性。',
          en: 'Google’s guidance for generated content emphasizes accuracy, quality and relevance.',
        },
        impact: {
          cn: '复核引用与事实后再发布；生成数量不是验收标准。',
          en: 'Review facts and citations before publishing; volume is not an acceptance criterion.',
        },
        source: {
          label: 'Google Search: generative AI content',
          url: 'https://developers.google.com/search/docs/fundamentals/using-gen-ai-content',
        },
        checkedAt: '2026-09-14',
      },
    ],
    next: [
      {
        href: '/ai/perplexity#decision-card',
        label: {
          cn: '查看 Perplexity 的适用边界与来源',
          en: 'Review Perplexity fit and sources',
        },
      },
      {
        href: '/guides/how-to-choose-ai-tools',
        label: {
          cn: '核对选型步骤',
          en: 'Review the selection steps',
        },
      },
    ],
  },
  'ai-video-tools': {
    title: {
      cn: '验证镜头能否进入最终成片',
      en: 'Check whether a shot can enter the final edit',
    },
    checks: [
      {
        cn: '用同一分镜生成短片，检查主体连续性和动作。',
        en: 'Generate a short shot from a fixed storyboard and inspect identity and motion.',
      },
      {
        cn: '把结果放进实际剪辑软件，检查帧率、比例和音画同步。',
        en: 'Import it into your editor and check frame rate, aspect ratio and audio sync.',
      },
      {
        cn: '区分生成分辨率、放大和导出设置，记录废片与重试成本。',
        en: 'Separate generation resolution, upscaling and export settings; count failed takes and retries.',
      },
    ],
    evidence: [
      {
        id: 'ai-video-tools-source',
        claim: {
          cn: 'Runway 的 Video Editor Project 选择 4K 导出不会放大非 4K 素材。',
          en: 'A 4K export from a Runway Video Editor Project does not upscale non-4K footage.',
        },
        impact: {
          cn: '在实际交付尺寸检查素材，单看导出选项不足以判断画质。',
          en: 'Inspect footage at the delivery size rather than relying on the export setting.',
        },
        source: {
          label: 'Runway: video resolution',
          url: 'https://help.runwayml.com/hc/en-us/articles/26115194070675-Can-I-generate-videos-in-4K',
        },
        checkedAt: '2026-09-14',
      },
    ],
    next: [
      {
        href: '/ai/runway#decision-card',
        label: {
          cn: '查看 Runway 的适用边界与来源',
          en: 'Review Runway fit and sources',
        },
      },
      {
        href: '/guides/how-to-choose-ai-tools',
        label: {
          cn: '核对选型步骤',
          en: 'Review the selection steps',
        },
      },
    ],
  },
  'ai-image-tools': {
    title: {
      cn: '按交付规格检查图像',
      en: 'Check images against delivery requirements',
    },
    checks: [
      {
        cn: '使用同一素材和构图要求，检查文字、边缘和主体一致性。',
        en: 'Use the same reference and composition brief; inspect text, edges and subject consistency.',
      },
      {
        cn: '按交付尺寸导出，在实际版面检查清晰度。',
        en: 'Export at the delivery size and inspect it in the intended layout.',
      },
      {
        cn: '确认所用模型、功能和输入素材的授权条件，再决定能否交付。',
        en: 'Check the model, feature and input-asset permissions before delivery.',
      },
    ],
    evidence: [
      {
        id: 'ai-image-tools-source',
        claim: {
          cn: 'Adobe 允许将非 beta Firefly 功能的生成结果用于商业项目；beta 功能仍需查看产品中的例外说明。',
          en: 'Adobe permits commercial use of outputs from non-beta Firefly features; beta features require checking product-specific exceptions.',
        },
        impact: {
          cn: '按具体功能与输入素材核对使用条件，不把这一说明扩展到所有图像工具。',
          en: 'Check the specific feature and inputs; this statement does not apply to every image tool.',
        },
        source: {
          label: 'Adobe Firefly FAQ',
          url: 'https://helpx.adobe.com/firefly/web/get-started/learn-the-basics/adobe-firefly-faq.html',
        },
        checkedAt: '2026-09-14',
      },
    ],
    next: [
      {
        href: '/ai/midjourney#decision-card',
        label: {
          cn: '查看 Midjourney 的适用边界与来源',
          en: 'Review Midjourney fit and sources',
        },
      },
      {
        href: '/guides/how-to-choose-ai-tools',
        label: {
          cn: '核对选型步骤',
          en: 'Review the selection steps',
        },
      },
    ],
  },
  'ai-coding-tools': {
    title: {
      cn: '用一个可复现的问题试编码助手',
      en: 'Test a coding assistant on a reproducible issue',
    },
    checks: [
      {
        cn: '选择有失败用例的缺陷，让工具解释相关代码。',
        en: 'Choose a defect with a failing case and ask the tool to explain the relevant code.',
      },
      {
        cn: '检查 diff、依赖和权限，运行能复现原缺陷的测试。',
        en: 'Inspect the diff, dependencies and permissions; run the test that reproduces the defect.',
      },
      {
        cn: '记录审查和返工时间；代码能编译不代表行为正确。',
        en: 'Record review and rework time; compilation alone does not establish correctness.',
      },
    ],
    evidence: [
      {
        id: 'ai-coding-tools-source',
        claim: {
          cn: 'GitHub 将 Copilot 代码审查定位为人工审查的补充，并说明反馈可能产生幻觉。',
          en: 'GitHub positions Copilot code review as a supplement to human review and describes possible hallucinated feedback.',
        },
        impact: {
          cn: '保留人工 diff 审查和行为测试，不把自动反馈视为合并保证。',
          en: 'Keep human diff review and behavior tests; automated feedback is not a merge guarantee.',
        },
        source: {
          label: 'GitHub Copilot: responsible use',
          url: 'https://docs.github.com/en/copilot/responsible-use/agents',
        },
        checkedAt: '2026-09-14',
      },
    ],
    next: [
      {
        href: '/ai/github-copilot#decision-card',
        label: {
          cn: '查看 GitHub Copilot 的适用边界与来源',
          en: 'Review GitHub Copilot fit and sources',
        },
      },
      {
        href: '/guides/how-to-choose-ai-tools',
        label: {
          cn: '核对选型步骤',
          en: 'Review the selection steps',
        },
      },
    ],
  },
  'ai-chatbot-tools': {
    title: {
      cn: '检查回答能否被复核',
      en: 'Check whether answers can be verified',
    },
    checks: [
      {
        cn: '准备答案已知、资料冲突和资料未覆盖的三类问题。',
        en: 'Prepare questions with known answers, conflicting sources and missing information.',
      },
      {
        cn: '逐条打开引用，检查回答是否超出原文。',
        en: 'Open every citation and check whether the answer goes beyond the source.',
      },
      {
        cn: '测试无答案时的处理和人工接手，不把流畅度当准确率。',
        en: 'Test unknown answers and human handoff; fluency is not accuracy.',
      },
    ],
    evidence: [
      {
        id: 'ai-chatbot-tools-source',
        claim: {
          cn: 'Google 的 notebook 帮助说明每个笔记本相互独立，无法同时访问多个笔记本的信息。',
          en: 'Google’s notebook help says notebooks are independent and cannot access multiple notebooks at once.',
        },
        impact: {
          cn: '先确认回答使用了哪组资料，避免把局部文档问答当成完整研究。',
          en: 'Confirm the source collection used for an answer before treating it as comprehensive research.',
        },
        source: {
          label: 'Google: notebooks and source scope',
          url: 'https://support.google.com/gemininotebook/answer/16206563?hl=en',
        },
        checkedAt: '2026-09-14',
      },
    ],
    next: [
      {
        href: '/ai/gemini#decision-card',
        label: {
          cn: '查看 Gemini 的适用边界与来源',
          en: 'Review Gemini fit and sources',
        },
      },
      {
        href: '/guides/how-to-choose-ai-tools',
        label: {
          cn: '核对选型步骤',
          en: 'Review the selection steps',
        },
      },
    ],
  },
  'ai-productivity-tools': {
    title: {
      cn: '验证是否减少交接和返工',
      en: 'Check handoff and rework, not feature count',
    },
    checks: [
      {
        cn: '选一项每周重复任务，画出输入、处理和交付三个步骤。',
        en: 'Choose a weekly task and map input, processing and handoff.',
      },
      {
        cn: '由两名不同权限的成员测试编辑、搜索和交接。',
        en: 'Have two people with different permissions test editing, search and handoff.',
      },
      {
        cn: '导出一份可恢复副本，记录仍需人工整理的部分。',
        en: 'Export a recoverable copy and record the work still needed to restore it.',
      },
    ],
    evidence: [
      {
        id: 'ai-productivity-tools-source',
        claim: {
          cn: 'Notion 的工作区导出不能通过重新上传立即恢复为原工作区。',
          en: 'A Notion workspace export cannot instantly recreate the workspace when uploaded again.',
        },
        impact: {
          cn: '把导出与恢复分别测试，避免把可下载等同于可迁移。',
          en: 'Test export and restoration separately before treating a download as a migration.',
        },
        source: {
          label: 'Notion: export your content',
          url: 'https://www.notion.com/help/export-your-content',
        },
        checkedAt: '2026-09-14',
      },
    ],
    next: [
      {
        href: '/ai/notion#decision-card',
        label: {
          cn: '查看 Notion 的适用边界与来源',
          en: 'Review Notion fit and sources',
        },
      },
      {
        href: '/guides/how-to-choose-ai-tools',
        label: {
          cn: '核对选型步骤',
          en: 'Review the selection steps',
        },
      },
    ],
  },
  'ai-tools-for-research': {
    title: {
      cn: '让每项结论都能回到来源',
      en: 'Trace each conclusion to its source',
    },
    checks: [
      {
        cn: '区分开放资料发现与已有文献问答，先选对任务。',
        en: 'Separate open discovery from questions about an existing source collection.',
      },
      {
        cn: '检查作者、日期、方法和引用段落是否支持结论。',
        en: 'Check authors, dates, methods and whether the cited passage supports the conclusion.',
      },
      {
        cn: '加入相互矛盾的资料，记录被忽略的证据与适用边界。',
        en: 'Include conflicting sources and record omitted evidence and scope limitations.',
      },
    ],
    evidence: [
      {
        id: 'ai-tools-for-research-source',
        claim: {
          cn: 'Google 的 notebook 帮助说明每个笔记本相互独立，无法同时访问多个笔记本的信息。',
          en: 'Google’s notebook help says notebooks are independent and cannot access multiple notebooks at once.',
        },
        impact: {
          cn: '先确认回答使用了哪组资料，避免把局部文档问答当成完整研究。',
          en: 'Confirm the source collection used for an answer before treating it as comprehensive research.',
        },
        source: {
          label: 'Google: notebooks and source scope',
          url: 'https://support.google.com/gemininotebook/answer/16206563?hl=en',
        },
        checkedAt: '2026-09-14',
      },
    ],
    next: [
      {
        href: '/ai/notebooklm#decision-card',
        label: {
          cn: '查看 NotebookLM 的适用边界与来源',
          en: 'Review NotebookLM fit and sources',
        },
      },
      {
        href: '/guides/how-to-choose-ai-tools',
        label: {
          cn: '核对选型步骤',
          en: 'Review the selection steps',
        },
      },
    ],
  },
  'ai-tools-for-developers': {
    title: {
      cn: '按代码、接口和运行环境分开试',
      en: 'Test code, APIs and runtime separately',
    },
    checks: [
      {
        cn: '确定瓶颈在编辑器、模型接口还是后台任务。',
        en: 'Locate the bottleneck: editor, model API or background execution.',
      },
      {
        cn: '在测试环境检查鉴权、失败响应、超时和日志。',
        en: 'In a test environment, inspect authentication, failures, timeouts and logs.',
      },
      {
        cn: '用现有测试复核生成内容，再评估集成与维护成本。',
        en: 'Verify generated changes with existing tests before estimating integration and maintenance effort.',
      },
    ],
    evidence: [
      {
        id: 'ai-tools-for-developers-source',
        claim: {
          cn: 'GitHub 将 Copilot 代码审查定位为人工审查的补充，并说明反馈可能产生幻觉。',
          en: 'GitHub positions Copilot code review as a supplement to human review and describes possible hallucinated feedback.',
        },
        impact: {
          cn: '保留人工 diff 审查和行为测试，不把自动反馈视为合并保证。',
          en: 'Keep human diff review and behavior tests; automated feedback is not a merge guarantee.',
        },
        source: {
          label: 'GitHub Copilot: responsible use',
          url: 'https://docs.github.com/en/copilot/responsible-use/agents',
        },
        checkedAt: '2026-09-14',
      },
    ],
    next: [
      {
        href: '/ai/github-copilot#decision-card',
        label: {
          cn: '查看 GitHub Copilot 的适用边界与来源',
          en: 'Review GitHub Copilot fit and sources',
        },
      },
      {
        href: '/guides/how-to-choose-ai-tools',
        label: {
          cn: '核对选型步骤',
          en: 'Review the selection steps',
        },
      },
    ],
  },
  'ai-tools-for-automation': {
    title: {
      cn: '先验证失败后的恢复',
      en: 'Test recovery after failure',
    },
    checks: [
      {
        cn: '在测试环境使用脱敏样本跑通触发到输出。',
        en: 'Run a sanitized input from trigger to output in a test environment.',
      },
      {
        cn: '模拟超时、缺字段和重复输入，确认重试不会重复写入。',
        en: 'Simulate timeouts, missing fields and duplicate inputs; check that retries do not duplicate writes.',
      },
      {
        cn: '检查错误通知、执行日志和人工接管，再开启定时执行。',
        en: 'Check error alerts, execution logs and human recovery before scheduling runs.',
      },
    ],
    evidence: [
      {
        id: 'ai-tools-for-automation-source',
        claim: {
          cn: 'n8n 可用错误工作流处理执行失败；错误触发信息取决于工作流在哪里失败。',
          en: 'n8n can handle execution failures with error workflows; the error data depends on where execution failed.',
        },
        impact: {
          cn: '分别测试触发与后续步骤失败，确认能够找回输入并恢复。',
          en: 'Test trigger and downstream failures separately so inputs can be recovered.',
        },
        source: {
          label: 'n8n: handle errors',
          url: 'https://docs.n8n.io/build/flow-logic/handle-errors-gracefully',
        },
        checkedAt: '2026-09-14',
      },
    ],
    next: [
      {
        href: '/ai/n8n#decision-card',
        label: {
          cn: '查看 n8n 的适用边界与来源',
          en: 'Review n8n fit and sources',
        },
      },
      {
        href: '/guides/how-to-choose-ai-tools',
        label: {
          cn: '核对选型步骤',
          en: 'Review the selection steps',
        },
      },
    ],
  },
  'ai-tools-for-web3': {
    title: {
      cn: '先对齐链、时间和指标口径',
      en: 'Align chain, time and metric definitions',
    },
    checks: [
      {
        cn: '明确要查询历史数据还是为应用提供查询接口。',
        en: 'Decide between historical analysis and a query interface for an application.',
      },
      {
        cn: '固定链、合约和时间窗口，对照原始交易核对样本。',
        en: 'Fix the chain, contract and time window and compare a sample with raw transactions.',
      },
      {
        cn: '检查指标定义、数据延迟和查询成本，再复用看板结论。',
        en: 'Check metric definitions, data lag and query costs before reusing dashboard conclusions.',
      },
    ],
    evidence: [
      {
        id: 'ai-tools-for-web3-source',
        claim: {
          cn: 'DuneSQL 是面向区块链分析的 Trino 分支，包含链上数据类型与查询视图。',
          en: 'DuneSQL is a Trino fork for blockchain analysis with blockchain data types and query views.',
        },
        impact: {
          cn: '先确认 SQL、数据类型和指标定义；自然语言摘要不能替代查询检查。',
          en: 'Check SQL, data types and metric definitions; a prose summary does not replace query review.',
        },
        source: {
          label: 'Dune: query engine',
          url: 'https://docs.dune.com/query-engine/overview',
        },
        checkedAt: '2026-09-14',
      },
    ],
    next: [
      {
        href: '/ai/dune#decision-card',
        label: {
          cn: '查看 Dune 的适用边界与来源',
          en: 'Review Dune fit and sources',
        },
      },
      {
        href: '/guides/how-to-choose-ai-tools',
        label: {
          cn: '核对选型步骤',
          en: 'Review the selection steps',
        },
      },
    ],
  },
  'ai-tools-for-marketing': {
    title: {
      cn: '按渠道检查内容和交付',
      en: 'Check content and delivery for one channel',
    },
    checks: [
      {
        cn: '固定渠道、受众和品牌简报，比较可直接修改的输出。',
        en: 'Fix the channel, audience and brand brief and compare editable outputs.',
      },
      {
        cn: '检查事实、素材使用条件和品牌语气。',
        en: 'Check factual claims, asset permissions and brand voice.',
      },
      {
        cn: '在测试名单或草稿中验证发布格式和审批，记录返工。',
        en: 'Use a test list or draft to verify formatting and approval and record rework.',
      },
    ],
    evidence: [
      {
        id: 'ai-tools-for-marketing-source',
        claim: {
          cn: 'Google 的生成内容指南要求关注准确性、质量与相关性。',
          en: 'Google’s guidance for generated content emphasizes accuracy, quality and relevance.',
        },
        impact: {
          cn: '复核引用与事实后再发布；生成数量不是验收标准。',
          en: 'Review facts and citations before publishing; volume is not an acceptance criterion.',
        },
        source: {
          label: 'Google Search: generative AI content',
          url: 'https://developers.google.com/search/docs/fundamentals/using-gen-ai-content',
        },
        checkedAt: '2026-09-14',
      },
    ],
    next: [
      {
        href: '/ai/notion#decision-card',
        label: {
          cn: '查看 Notion 的适用边界与来源',
          en: 'Review Notion fit and sources',
        },
      },
      {
        href: '/guides/how-to-choose-ai-tools',
        label: {
          cn: '核对选型步骤',
          en: 'Review the selection steps',
        },
      },
    ],
  },
  'ai-tools-for-sales': {
    title: {
      cn: '先检查名单与 CRM 记录是否可靠',
      en: 'Check lead and CRM record reliability',
    },
    checks: [
      {
        cn: '用获授权的测试名单检查联系人来源、更新时间和字段。',
        en: 'Use an authorized test list to check contact sources, dates and fields.',
      },
      {
        cn: '验证重复记录、负责人和跟进历史的合并规则。',
        en: 'Verify rules for duplicate records, ownership and interaction history.',
      },
      {
        cn: '在测试环境走一次同步和撤销，确认不会重复触达。',
        en: 'Test synchronization and rollback without sending outreach; check for duplicate contacts.',
      },
    ],
    evidence: [
      {
        id: 'ai-tools-for-sales-source',
        claim: {
          cn: 'HubSpot 说明通过 API 创建的公司不会按公司域名自动去重。',
          en: 'HubSpot states that companies created through its API are not deduplicated by company domain name.',
        },
        impact: {
          cn: '接入 CRM 时单独测试同步与重复记录，不能沿用导入界面的假设。',
          en: 'Test synchronization and duplicate handling independently of import-screen behavior.',
        },
        source: {
          label: 'HubSpot: deduplicate records',
          url: 'https://knowledge.hubspot.com/records/deduplication-of-records?product=crm',
        },
        checkedAt: '2026-09-14',
      },
    ],
    next: [
      {
        href: '/ai/n8n#decision-card',
        label: {
          cn: '查看 n8n 的适用边界与来源',
          en: 'Review n8n fit and sources',
        },
      },
      {
        href: '/guides/how-to-choose-ai-tools',
        label: {
          cn: '核对选型步骤',
          en: 'Review the selection steps',
        },
      },
    ],
  },
  'ai-tools-for-voice': {
    title: {
      cn: '用同一段脚本检查声音交付',
      en: 'Test voice delivery with one fixed script',
    },
    checks: [
      {
        cn: '使用获授权的声音或合成声音，明确旁白、转写或对话任务。',
        en: 'Use an authorized or synthetic voice and choose narration, transcription or conversation.',
      },
      {
        cn: '检查人名、数字、停顿和目标语言发音。',
        en: 'Check names, numbers, pauses and pronunciation in the target language.',
      },
      {
        cn: '把音频放进最终作品，确认格式、时长和所选声音的使用条件。',
        en: 'Import the audio into the final work and check format, duration and voice-use conditions.',
      },
    ],
    evidence: [
      {
        id: 'ai-tools-for-voice-source',
        claim: {
          cn: 'ElevenLabs Professional Voice Cloning 仅允许克隆本人声音，并要求验证；他人同意也不替代此限制。',
          en: 'ElevenLabs Professional Voice Cloning requires your own verified voice; another person’s consent does not replace this requirement.',
        },
        impact: {
          cn: '需要他人专业克隆声音时，由声音本人创建、验证并按平台规则分享。',
          en: 'For another person’s professional clone, the voice owner must create, verify and share it under the platform rules.',
        },
        source: {
          label: 'ElevenLabs: Professional Voice Cloning',
          url: 'https://help.elevenlabs.io/hc/en-us/articles/36842751624209-Can-I-create-a-Professional-Voice-Clone-of-someone-else-s-voice',
        },
        checkedAt: '2026-09-14',
      },
    ],
    next: [
      {
        href: '/ai/elevenlabs#decision-card',
        label: {
          cn: '查看 ElevenLabs 的适用边界与来源',
          en: 'Review ElevenLabs fit and sources',
        },
      },
      {
        href: '/guides/how-to-choose-ai-tools',
        label: {
          cn: '核对选型步骤',
          en: 'Review the selection steps',
        },
      },
    ],
  },
  'ai-note-taking-tools': {
    title: {
      cn: '检查笔记能否检索和带走',
      en: 'Check retrieval and portability of notes',
    },
    checks: [
      {
        cn: '导入一段会议或文档，核对人名、日期和行动项。',
        en: 'Import a meeting or document and verify names, dates and action items.',
      },
      {
        cn: '用未参与记录的人测试搜索与原文回溯。',
        en: 'Have someone who did not capture the notes test search and source tracing.',
      },
      {
        cn: '导出包含附件的样本，检查权限和恢复后的结构。',
        en: 'Export a sample with attachments and inspect permissions and the restored structure.',
      },
    ],
    evidence: [
      {
        id: 'ai-note-taking-tools-source',
        claim: {
          cn: 'Notion 的工作区导出不能通过重新上传立即恢复为原工作区。',
          en: 'A Notion workspace export cannot instantly recreate the workspace when uploaded again.',
        },
        impact: {
          cn: '把导出与恢复分别测试，避免把可下载等同于可迁移。',
          en: 'Test export and restoration separately before treating a download as a migration.',
        },
        source: {
          label: 'Notion: export your content',
          url: 'https://www.notion.com/help/export-your-content',
        },
        checkedAt: '2026-09-14',
      },
    ],
    next: [
      {
        href: '/ai/notion#decision-card',
        label: {
          cn: '查看 Notion 的适用边界与来源',
          en: 'Review Notion fit and sources',
        },
      },
      {
        href: '/guides/how-to-choose-ai-tools',
        label: {
          cn: '核对选型步骤',
          en: 'Review the selection steps',
        },
      },
    ],
  },
};
