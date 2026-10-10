import type { VerifiedComparison } from './verifiedComparison';

// Source reviews: CL-02 research editorial packet (Consensus), Perplexity Stage 2
// audit, and Scite controlled release. No independent accuracy test is asserted.
const researchComparison: VerifiedComparison = {
  title: {
    cn: 'Perplexity、Consensus 与 Scite：研究任务怎么选？',
    en: 'Perplexity, Consensus and Scite: which research task fits?',
  },
  scope: {
    cn: '比较开放网页发现、学术论文检索与论文引用语境核对。依据已核验的官方功能说明；本站没有独立测试准确率或覆盖率。',
    en: 'Compare open-web discovery, scholarly search and citation-context checks. Based on reviewed official documentation; we have not independently measured accuracy or coverage.',
  },
  candidates: [
    {
      slug: 'perplexity',
      name: 'Perplexity',
      chooseWhen: {
        cn: '先探索开放网页主题并取得可回查的来源链接。',
        en: 'Start with open-web discovery and links back to sources.',
      },
      strength: {
        cn: 'Pro Search 可多次检索网页、综合回答并提供来源直链。',
        en: 'Pro Search can search the web in multiple steps, synthesize an answer and link to original sources.',
      },
      limitation: {
        cn: '来源链接不证明答案正确；焦点、账号与套餐会改变范围和可用性。',
        en: 'A source link does not prove correctness; focus, account and plan affect scope and availability.',
      },
      fit: {
        cn: '适合快速形成主题概览和初始来源清单。',
        en: 'Best for a quick topic overview and initial source list.',
      },
      notFor: {
        cn: '不适合当作穷尽、可复现的系统性文献综述。',
        en: 'Not ideal as an exhaustive, reproducible literature review.',
      },
      evidenceRefs: ['perplexity-search'],
    },
    {
      slug: 'consensus',
      name: 'Consensus',
      chooseWhen: { cn: '需要从已收录的学术论文寻找证据。', en: 'Find evidence within indexed scholarly papers.' },
      strength: {
        cn: '以论文检索和基于来源的 AI 综合为核心，可检查引用依据。',
        en: 'Centers on paper search and source-grounded synthesis with citations to inspect.',
      },
      limitation: {
        cn: '论文库不涵盖全部研究；全文访问因论文而异，AI 仍可能误读。',
        en: 'The corpus is not exhaustive; full-text access varies and AI can misread papers.',
      },
      fit: {
        cn: '适合在收录范围内发现论文并人工核验结论。',
        en: 'Best for finding papers in the indexed corpus and manually checking conclusions.',
      },
      notFor: {
        cn: '不适合仅凭 AI 摘要替代原论文阅读和质量评估。',
        en: 'Not ideal for replacing paper reading and quality assessment with an AI summary.',
      },
      evidenceRefs: ['consensus-search', 'consensus-limits'],
    },
    {
      slug: 'scite',
      name: 'Scite',
      chooseWhen: { cn: '已找到论文，要看它被如何引用。', en: 'You have a paper and need to inspect how it is cited.' },
      strength: {
        cn: 'Smart Citations 展示支持、提及或反驳等引文语境。',
        en: 'Smart Citations shows citation context, including supporting, mentioning or contrasting use.',
      },
      limitation: {
        cn: '学科覆盖、原文访问和账号权益须逐项核对；标签不能代替阅读上下文。',
        en: 'Check discipline coverage, article access and account entitlements; labels do not replace reading context.',
      },
      fit: {
        cn: '适合追查论文引用背景的研究人员。',
        en: 'Best for researchers tracing the context around a paper’s citations.',
      },
      notFor: {
        cn: '不适合把引文标签当成论文质量的自动评分。',
        en: 'Not ideal for treating citation labels as automatic quality scores.',
      },
      evidenceRefs: ['scite-features'],
    },
  ],
  comparisonRows: [
    {
      dimension: { cn: '资料起点', en: 'Starting material' },
      values: {
        perplexity: { cn: '开放网页与主题问题。', en: 'Open-web pages and topic questions.' },
        consensus: { cn: '已收录的学术论文。', en: 'Indexed scholarly papers.' },
        scite: { cn: '论文及其引用记录。', en: 'Papers and their citation records.' },
      },
      fit: { cn: '先确定资料范围，再选工具。', en: 'Choose based on the source universe first.' },
      reason: { cn: '三者检索对象和研究任务不同。', en: 'The tools address different sources and research tasks.' },
      evidenceRefs: ['perplexity-search', 'consensus-search', 'scite-features'],
    },
    {
      dimension: { cn: '如何核对', en: 'How to check' },
      values: {
        perplexity: { cn: '打开回答所链的网页原文。', en: 'Open the web sources linked from an answer.' },
        consensus: {
          cn: '阅读所引论文及可用的支持片段。',
          en: 'Inspect cited papers and available supporting passages.',
        },
        scite: { cn: '阅读论文被引用时的上下文。', en: 'Read the context in which a paper was cited.' },
      },
      fit: {
        cn: '网页发现、论文证据、引用语境各有对应工具。',
        en: 'Use the tool that matches web discovery, paper evidence or citation context.',
      },
      reason: {
        cn: '链接、论文摘要与引文标签均不能单独证明结论。',
        en: 'Links, paper summaries and citation labels alone cannot prove a conclusion.',
      },
      evidenceRefs: ['perplexity-search', 'consensus-limits', 'scite-features'],
    },
  ],
  evidence: [
    {
      id: 'perplexity-search',
      checkedAt: '2026-10-06',
      source: {
        label: 'Perplexity · What is Pro Search?',
        url: 'https://www.perplexity.ai/help-center/en/articles/10352903-what-is-pro-search',
      },
      claim: { cn: 'Pro Search 多步检索并提供来源直链。', en: 'Pro Search uses multiple searches and source links.' },
      impact: { cn: '适合开放网页发现，仍须回原文核验。', en: 'Useful for web discovery; verify against originals.' },
    },
    {
      id: 'consensus-search',
      checkedAt: '2026-09-25',
      source: {
        label: 'Consensus · How Consensus Works',
        url: 'https://help.consensus.app/en/articles/9922673-how-consensus-works',
      },
      claim: {
        cn: '使用语义和关键词检索论文，再综合已找到的研究。',
        en: 'Uses semantic and keyword paper search, then synthesizes retrieved research.',
      },
      impact: { cn: '适合从论文开始的研究。', en: 'Fits paper-led research.' },
    },
    {
      id: 'consensus-limits',
      checkedAt: '2026-09-25',
      source: {
        label: 'Consensus · Responsible AI & Limitations',
        url: 'https://help.consensus.app/en/articles/10046838-responsible-ai-limitations',
      },
      claim: {
        cn: '检索库不涵盖全部研究，AI 可能误读论文。',
        en: 'The corpus is not exhaustive and AI can misread papers.',
      },
      impact: { cn: '重要判断仍需人工阅读原文。', en: 'Important judgments still need manual source review.' },
    },
    {
      id: 'scite-features',
      checkedAt: '2026-10-10',
      source: { label: 'Scite · Features', url: 'https://scite.ai/features' },
      claim: {
        cn: 'Smart Citations 显示论文引用语境。',
        en: 'Smart Citations shows the context of citations to papers.',
      },
      impact: {
        cn: '可追查引用背景，不能代替质量判断。',
        en: 'Helps trace citation context, without replacing quality assessment.',
      },
    },
  ],
  next: {
    href: '/guides/ai-tools-for-research',
    label: { cn: '查看研究选型指南', en: 'Read the research selection guide' },
    description: {
      cn: '用上方工具链接查看决策卡；任务还不明确时，先按指南区分资料发现、论文检索和引用核对。',
      en: 'Use the tool links above to inspect decision cards. If the job is still unclear, use the guide to distinguish discovery, paper search and citation checks.',
    },
  },
};

export default researchComparison;
