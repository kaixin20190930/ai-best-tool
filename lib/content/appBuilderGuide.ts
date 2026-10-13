export type AppBuilderTool = 'bolt' | 'lovable' | 'replit' | 'v0';
export type AppBuilderDimension =
  | 'source_git_handoff'
  | 'hosting_deployment'
  | 'data_backend_portability'
  | 'integrations'
  | 'cost_usage_boundaries'
  | 'maintenance_operational_ownership';

type LocalizedText = { en: string; cn: string };

export const appBuilderTools: Array<{
  key: AppBuilderTool;
  name: string;
  bestFor: LocalizedText;
  notIdeal: LocalizedText;
}> = [
  {
    key: 'bolt',
    name: 'Bolt',
    bestFor: {
      en: 'A browser-first build with a documented GitHub handoff and built-in hosting.',
      cn: '想在浏览器中构建，并需要有文档支持的 GitHub 代码交接和内置托管。',
    },
    notIdeal: {
      en: 'A project that assumes switching its database later will be effortless.',
      cn: '默认认为以后切换数据库无需额外步骤的项目。',
    },
  },
  {
    key: 'lovable',
    name: 'Lovable',
    bestFor: {
      en: 'A web app that benefits from repository sync and a deliberate publish step.',
      cn: '需要仓库同步，并希望通过明确发布步骤上线的 Web 应用。',
    },
    notIdeal: {
      en: 'A team expecting Git sync alone to move its database, files and credentials.',
      cn: '认为 Git 同步会一并搬走数据库、文件和凭证的团队。',
    },
  },
  {
    key: 'replit',
    name: 'Replit',
    bestFor: {
      en: 'A project that needs Git workflows and a choice among documented deployment modes.',
      cn: '需要 Git 工作流，并希望在多种有文档说明的部署模式中选择的项目。',
    },
    notIdeal: {
      en: 'A team assuming its subscription fixes the total cost of Agent and app runtime.',
      cn: '认为订阅价格已封顶 Agent 和应用运行总成本的团队。',
    },
  },
  {
    key: 'v0',
    name: 'v0',
    bestFor: {
      en: 'A Vercel-oriented project that wants branch-based GitHub review before publishing.',
      cn: '面向 Vercel、希望发布前通过 GitHub 分支审查代码的项目。',
    },
    notIdeal: {
      en: 'A project requiring a documented, complete database and backend migration path today.',
      cn: '现在就需要有完整数据库及后端迁移路径文档的项目。',
    },
  },
];

export const appBuilderDimensions: Array<{
  key: AppBuilderDimension;
  label: LocalizedText;
  cells: Record<AppBuilderTool, LocalizedText>;
}> = [
  {
    key: 'source_git_handoff',
    label: { en: 'Code and Git handoff', cn: '代码与 Git 交接' },
    cells: {
      bolt: { en: 'GitHub connection and code sync.', cn: '连接 GitHub 并同步代码。' },
      lovable: { en: 'Two-way repository sync and code download.', cn: '双向仓库同步及代码下载。' },
      replit: { en: 'Git-backed version control and GitHub workflows.', cn: '基于 Git 的版本控制和 GitHub 工作流。' },
      v0: { en: 'Working branches and pull-request review with GitHub.', cn: '通过 GitHub 工作分支和 PR 审查。' },
    },
  },
  {
    key: 'hosting_deployment',
    label: { en: 'Hosting and deployment', cn: '托管与部署' },
    cells: {
      bolt: {
        en: 'Built-in hosting; a documented Netlify path has prerequisites.',
        cn: '提供内置托管；另有需满足前提的 Netlify 路径。',
      },
      lovable: {
        en: 'Publish a snapshot to a lovable.app URL; later edits need republishing.',
        cn: '将快照发布到 lovable.app；后续修改需重新发布。',
      },
      replit: {
        en: 'Static, Autoscale, Reserved VM and Scheduled deployment modes.',
        cn: '提供 Static、Autoscale、Reserved VM 和 Scheduled 部署模式。',
      },
      v0: {
        en: 'Vercel preview deployments and a linked production publish path.',
        cn: '通过 Vercel 预览部署和关联的生产发布路径。',
      },
    },
  },
  {
    key: 'data_backend_portability',
    label: { en: 'Data and backend move', cn: '数据与后端迁移' },
    cells: {
      bolt: {
        en: 'Supabase options depend on plan; changing backend later takes extra steps.',
        cn: 'Supabase 选项受套餐限制；后续切换后端需要额外步骤。',
      },
      lovable: {
        en: 'Cloud database export is documented; files, secrets and services need separate work.',
        cn: '有 Cloud 数据库导出文档；文件、密钥及服务需分别处理。',
      },
      replit: {
        en: 'Database export and scenario-specific dump/restore are documented, not whole-app migration.',
        cn: '有数据库导出及特定场景的 dump/restore 文档，不等于整站迁移。',
      },
      v0: {
        en: 'Database integrations are documented; a complete exit path is not established.',
        cn: '有数据库集成文档，但未证实完整迁出路径。',
      },
    },
  },
  {
    key: 'integrations',
    label: { en: 'Integrations', cn: '集成' },
    cells: {
      bolt: {
        en: 'Documents GitHub, Stripe, Expo, Supabase and other paths; eligibility varies.',
        cn: '有 GitHub、Stripe、Expo、Supabase 等路径；可用范围因条件而异。',
      },
      lovable: {
        en: 'Connector and direct API paths; permissions and credentials vary.',
        cn: '有连接器和直接 API 路径；权限及凭证要求各异。',
      },
      replit: {
        en: 'Managed, connector and bring-your-own-key paths; plan access varies.',
        cn: '有托管集成、连接器和自备密钥路径；套餐可用性不同。',
      },
      v0: {
        en: 'Documents databases, external APIs and Stripe; provider setup remains separate.',
        cn: '有数据库、外部 API 和 Stripe 文档；仍需单独配置供应商。',
      },
    },
  },
  {
    key: 'cost_usage_boundaries',
    label: { en: 'Cost boundary', cn: '费用边界' },
    cells: {
      bolt: {
        en: 'AI tokens and hosting allowances differ; subscription is not total app cost.',
        cn: 'AI token 与托管额度分开；订阅费不是应用总成本。',
      },
      lovable: {
        en: 'Build, Cloud, AI and connectors may consume different credits.',
        cn: '构建、Cloud、AI 和连接器可能分别消耗额度。',
      },
      replit: {
        en: 'Agent, third-party services and cloud usage can draw on credits.',
        cn: 'Agent、第三方服务和云资源可能消耗额度。',
      },
      v0: {
        en: 'Plan credits and model usage vary; connected Vercel services can cost extra.',
        cn: '套餐额度与模型用量不同；关联的 Vercel 服务可能另计。',
      },
    },
  },
  {
    key: 'maintenance_operational_ownership',
    label: { en: 'Who maintains it?', cn: '谁负责维护？' },
    cells: {
      bolt: {
        en: 'Security checks help, but do not replace owner review and service configuration.',
        cn: '安全检查有帮助，但不能代替负责人复核和服务配置。',
      },
      lovable: { en: 'Automated scans do not guarantee application security.', cn: '自动扫描不保证应用安全。' },
      replit: {
        en: 'A shared-responsibility model leaves app and account duties to assess.',
        cn: '共担责任模式下，应用与账户责任仍需确认。',
      },
      v0: {
        en: 'Publishing depends on GitHub/Vercel roles; ongoing operations are not fully specified.',
        cn: '发布受 GitHub/Vercel 权限约束；持续运维职责未被完整界定。',
      },
    },
  },
];
