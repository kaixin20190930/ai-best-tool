import type { Metadata } from 'next';
import NextLink from 'next/link';
import { CheckCircle2, Database, ExternalLink, KeyRound, Server, ShieldCheck, Workflow } from 'lucide-react';

import { StructuredDataServer } from '@/components/seo/StructuredData';
import { BASE_URL } from '@/lib/env';
import { buildLocalizedPageMetadata, generateLocalizedCanonicalUrl, generateLocalizedPath } from '@/lib/seo/metadata';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';

const PATH = '/guides/n8n-self-hosted-requirements';
const REVIEWED_AT = '2026-10-26';

const sources = [
  {
    label: 'Install using Docker Compose',
    href: 'https://docs.n8n.io/deploy/host-n8n/install-options/install-using-docker-compose/',
  },
  {
    label: 'Choose the database',
    href: 'https://docs.n8n.io/deploy/host-n8n/configure-n8n/choose-n8ns-database/',
  },
  {
    label: 'Set an encryption key',
    href:
      'https://docs.n8n.io/deploy/host-n8n/configure-n8n/basic-configuration/configuration-examples/set-a-custom-encryption-key/',
  },
  {
    label: 'Configure reverse-proxy webhooks',
    href:
      'https://docs.n8n.io/deploy/host-n8n/configure-n8n/basic-configuration/configuration-examples/configure-webhook-urls-with-reverse-proxy/',
  },
  {
    label: 'Enable queue mode',
    href: 'https://docs.n8n.io/deploy/host-n8n/configure-n8n/scaling/enable-queue-mode/',
  },
  {
    label: 'Secure a self-hosted instance',
    href: 'https://docs.n8n.io/deploy/host-n8n/configure-n8n/security/',
  },
];

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const cn = locale === 'cn' || locale === 'tw';

  return buildLocalizedPageMetadata({
    locale,
    path: PATH,
    baseUrl: BASE_URL,
    title: cn ? 'n8n 自托管要求：部署、数据库与运维清单（2026）' : 'n8n Self-Hosted Requirements: Deployment Checklist (2026)',
    description: cn
      ? '核对 n8n 自托管所需的 Docker、持久化、数据库、加密密钥、Webhook、HTTPS、安全和扩展责任，并判断是否应该改用 n8n Cloud。'
      : 'Check the Docker, persistence, database, encryption-key, webhook, HTTPS, security, and scaling responsibilities for self-hosting n8n, and when n8n Cloud is the safer choice.',
  });
}

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  const cn = locale === 'cn' || locale === 'tw';
  const faqs = [
    {
      question: cn ? '自托管 n8n 需要多少内存和 CPU？' : 'How much RAM and CPU does self-hosted n8n need?',
      answer: cn
        ? 'n8n 没有为所有工作流给出一个通用的生产最低规格。官方 Docker Compose Assistant 指南的特定沙箱栈写明至少 4 GB RAM 和 2 vCPU，但这不是所有核心 n8n 部署的统一承诺。应按并发、执行时长、二进制数据和 Code/AI 节点做负载测试。'
        : 'n8n does not publish one universal production minimum for every workflow. Its specific Docker Compose Assistant stack lists at least 4 GB RAM and 2 vCPUs, but that is not a universal promise for every core n8n deployment. Load-test your concurrency, execution duration, binary data, and Code or AI nodes.',
    },
    {
      question: cn ? 'SQLite 适合生产环境吗？' : 'Is SQLite suitable for production?',
      answer: cn
        ? 'SQLite 是默认数据库，适合试用和较小的单实例场景。官方 Compose 指南建议需要持续运行、超过少量用户或工作流的生产实例改用 PostgreSQL；queue mode 不应使用 SQLite。'
        : 'SQLite is the default and can suit trials or small single-instance setups. The official Compose guide recommends PostgreSQL for production that runs continuously or serves more than a handful of users or workflows, and queue mode should not use SQLite.',
    },
    {
      question: cn ? '自托管 n8n 是否等于零软件成本？' : 'Does self-hosted n8n mean zero software cost?',
      answer: cn
        ? 'Community Edition 可以免费自托管，但服务器、数据库、备份、监控、升级、故障恢复和工程时间仍有成本；部分协作、治理或扩展能力也依版本和套餐而不同。'
        : 'Community Edition can be self-hosted without a subscription, but servers, databases, backups, monitoring, upgrades, recovery, and engineering time still cost money. Some collaboration, governance, or scaling capabilities also vary by edition and plan.',
    },
    {
      question: cn ? '什么时候应该直接选择 n8n Cloud？' : 'When should I choose n8n Cloud instead?',
      answer: cn
        ? '如果团队没有明确的服务器、安全、备份和升级负责人，或者自托管并不能带来必须的部署控制、数据边界或成本优势，Cloud 通常是更低风险的起点。'
        : 'If nobody clearly owns servers, security, backups, and upgrades, or self-hosting does not provide necessary deployment control, data boundaries, or cost advantages, Cloud is usually the lower-risk starting point.',
    },
  ];
  const checklist = [
    {
      icon: Server,
      title: cn ? '容器与持久化' : 'Containers and persistence',
      body: cn
        ? '官方建议多数自托管场景使用 Docker。必须持久化 /home/node/.n8n；即使改用 PostgreSQL，该目录仍可能包含加密密钥、日志和其他实例数据。'
        : 'n8n recommends Docker for most self-hosting. Persist /home/node/.n8n; even with PostgreSQL, that directory can still hold encryption keys, logs, and other instance data.',
    },
    {
      icon: Database,
      title: cn ? '数据库与备份' : 'Database and backups',
      body: cn
        ? 'SQLite 是默认值。持续运行或需要扩展的生产实例应评估 PostgreSQL，并分别备份数据库、实例配置和加密密钥；只备份容器镜像不够。'
        : 'SQLite is the default. Evaluate PostgreSQL for continuously running or scaling production, and back up the database, instance configuration, and encryption key separately; the container image alone is not a backup.',
    },
    {
      icon: KeyRound,
      title: cn ? '凭证加密密钥' : 'Credential encryption key',
      body: cn
        ? 'n8n 首次启动会生成密钥，也可显式设置 N8N_ENCRYPTION_KEY。密钥丢失会影响已存凭证；queue mode 的主实例与所有 worker 必须共享同一密钥。'
        : 'n8n generates a key on first launch, or you can set N8N_ENCRYPTION_KEY. Losing it affects stored credentials; the main instance and every queue-mode worker must share the same key.',
    },
    {
      icon: Workflow,
      title: cn ? '公网 Webhook 与代理' : 'Public webhooks and proxying',
      body: cn
        ? '外部触发器需要稳定可访问的 HTTPS 地址。反向代理后应设置 N8N_WEBHOOK_URL、N8N_PROXY_HOPS，并正确传递 Forwarded headers；本地 tunnel 只用于开发测试。'
        : 'External triggers need a stable, reachable HTTPS URL. Behind a reverse proxy, set N8N_WEBHOOK_URL and N8N_PROXY_HOPS and forward the required headers; the local tunnel is for development and testing only.',
    },
    {
      icon: ShieldCheck,
      title: cn ? '安全与维护责任' : 'Security and maintenance ownership',
      body: cn
        ? '需要有人负责 TLS、升级、权限、节点风险、公共 API、执行数据和安全审计。官方明确将自托管推荐给有服务器与应用管理经验的用户。'
        : 'Someone must own TLS, upgrades, permissions, risky nodes, the public API, execution data, and security audits. n8n explicitly recommends self-hosting for users experienced in managing servers and applications.',
    },
  ];
  const decisionRows = [
    {
      question: cn ? '为什么自托管？' : 'Why self-host?',
      selfHost: cn ? '必须控制部署、网络或数据边界' : 'You need deployment, network, or data-boundary control',
      cloud: cn ? '只是因为 Community Edition 看起来免费' : 'The only reason is that Community Edition looks free',
    },
    {
      question: cn ? '谁负责？' : 'Who owns it?',
      selfHost: cn ? '有明确的运维、安全和恢复负责人' : 'Named owners cover operations, security, and recovery',
      cloud: cn ? '没有人负责升级、备份和事故响应' : 'Nobody owns upgrades, backups, or incident response',
    },
    {
      question: cn ? '如何验证？' : 'How will you validate it?',
      selfHost: cn ? '用真实工作流测并发、失败恢复和维护时间' : 'Pilot real workflows, recovery, concurrency, and maintenance time',
      cloud: cn ? '仅比较订阅价格和服务器月租' : 'You are only comparing subscription and server list prices',
    },
  ];
  const breadcrumb = generateBreadcrumbSchema([
    { name: 'Home', url: generateLocalizedCanonicalUrl('/', locale) },
    { name: cn ? '指南' : 'Guides', url: generateLocalizedCanonicalUrl('/guides', locale) },
    {
      name: cn ? 'n8n 自托管要求' : 'n8n self-hosted requirements',
      url: generateLocalizedCanonicalUrl(PATH, locale),
    },
  ]);

  return (
    <>
      <StructuredDataServer data={breadcrumb} />
      <StructuredDataServer data={generateFAQSchema(faqs)} />
      <main className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-800'>
              {cn ? 'Automation Cluster · 部署要求' : 'Automation Cluster · Deployment requirements'}
            </span>
            <span className='rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
              E0 · {cn ? '官方公开资料' : 'official public sources'}
            </span>
          </div>
          <h1 className='mt-5 max-w-4xl text-4xl font-bold leading-tight text-slate-950 lg:text-6xl'>
            {cn ? 'n8n 自托管要求：上线前要准备什么' : 'n8n self-hosted requirements: what you need before production'}
          </h1>
          <p className='mt-5 max-w-4xl text-base leading-7 text-slate-600 lg:text-lg'>
            {cn
              ? '自托管不是把 n8n 容器启动起来就结束。真正的决策是：你的团队是否愿意持续负责持久化、数据库、凭证密钥、Webhook、HTTPS、安全、升级、备份和故障恢复。'
              : 'Self-hosting does not end when the n8n container starts. The real decision is whether your team will continuously own persistence, databases, credential keys, webhooks, HTTPS, security, upgrades, backups, and recovery.'}
          </p>
          <div className='mt-6 flex flex-wrap gap-3'>
            <NextLink href={generateLocalizedPath('/ai/n8n#decision-card', locale)} className='rounded-lg bg-cyan-800 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-900'>
              {cn ? '查看 n8n 适用边界' : 'Review n8n fit and limits'}
            </NextLink>
            <NextLink href={generateLocalizedPath('/guides/ai-tools-for-automation', locale)} className='rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'>
              {cn ? '返回自动化工具指南' : 'Back to automation guide'}
            </NextLink>
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-amber-200 bg-amber-50 p-6 lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-amber-800'>{cn ? '先说结论' : 'Decision first'}</p>
          <h2 className='mt-2 text-2xl font-bold text-slate-950'>
            {cn ? '没有明确运维负责人，就不要把“免费自托管”当默认方案' : 'Without an operations owner, free self-hosting is not the default choice'}
          </h2>
          <p className='mt-3 max-w-4xl text-sm leading-7 text-slate-700'>
            {cn
              ? 'Community Edition 的订阅价格可以是零，但基础设施和工程责任不会消失。只有部署控制、数据边界、复杂扩展或长期总成本确实重要，并且团队能承担运行责任时，自托管才构成优势。'
              : 'Community Edition can have a zero subscription price, but infrastructure and engineering responsibility do not disappear. Self-hosting becomes an advantage only when deployment control, data boundaries, scaling, or long-run cost matter and the team can own operations.'}
          </p>
        </section>

        <section className='mt-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>{cn ? '生产清单' : 'Production checklist'}</p>
          <h2 className='mt-2 text-3xl font-bold text-slate-950'>{cn ? '五项基础责任缺一不可' : 'Five baseline responsibilities you cannot skip'}</h2>
          <div className='mt-5 grid gap-4 md:grid-cols-2'>
            {checklist.map(({ icon: Icon, title, body }) => (
              <article key={title} className='rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm'>
                <Icon className='size-6 text-cyan-700' />
                <h3 className='mt-4 text-lg font-bold text-slate-950'>{title}</h3>
                <p className='mt-2 text-sm leading-7 text-slate-600'>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className='mt-8 rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
          <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>{cn ? '扩展不是默认要求' : 'Scaling is not the starting point'}</p>
          <h2 className='mt-2 text-3xl font-bold text-slate-950'>{cn ? '什么时候才需要 queue mode' : 'When queue mode becomes relevant'}</h2>
          <p className='mt-4 text-sm leading-7 text-slate-700'>
            {cn
              ? '官方将 queue mode 定位为最佳扩展方式：主实例接收触发，Redis 维护队列，worker 执行任务，数据库保存结果。它增加了 Redis、worker、共享密钥、监控和存储设计，不应在单实例尚未证明瓶颈前先上。'
              : 'n8n describes queue mode as its best scalability path: the main instance receives triggers, Redis holds the queue, workers execute jobs, and the database stores results. It adds Redis, workers, shared keys, monitoring, and storage design, so do not adopt it before a single instance shows a real bottleneck.'}
          </p>
          <ul className='mt-4 grid gap-3 text-sm leading-6 text-slate-700 md:grid-cols-2'>
            {(cn
              ? ['使用 PostgreSQL，而不是用 SQLite 跑分布式 queue mode。', '主实例、worker 与 webhook processor 使用同一加密密钥。', '二进制数据不能在 queue mode 下依赖本地 filesystem；需要单独规划。', '先记录并发、积压、执行时长和失败恢复，再决定增加 worker。']
              : ['Use PostgreSQL rather than SQLite for distributed queue mode.', 'Share one encryption key across the main instance, workers, and webhook processors.', 'Queue mode cannot rely on local filesystem for binary-data persistence; plan storage separately.', 'Measure concurrency, backlog, duration, and recovery before adding workers.']
            ).map((item) => (
              <li key={item} className='flex gap-3 rounded-xl bg-slate-50 p-4'>
                <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-emerald-600' />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className='mt-8 overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm'>
          <div className='p-6 lg:p-8'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>{cn ? '自托管还是 Cloud' : 'Self-host or Cloud'}</p>
            <h2 className='mt-2 text-3xl font-bold text-slate-950'>{cn ? '用责任边界做决定，不只比较标价' : 'Decide by ownership, not list price alone'}</h2>
          </div>
          <div className='overflow-x-auto'>
            <table className='min-w-full border-t border-slate-200 text-left text-sm'>
              <thead className='bg-slate-50 text-slate-700'>
                <tr>
                  <th className='px-5 py-4 font-semibold'>{cn ? '判断问题' : 'Decision question'}</th>
                  <th className='px-5 py-4 font-semibold'>{cn ? '自托管更合理' : 'Self-hosting fits'}</th>
                  <th className='px-5 py-4 font-semibold'>{cn ? 'Cloud 更稳妥' : 'Cloud is safer'}</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-200'>
                {decisionRows.map((row) => (
                  <tr key={row.question}>
                    <th className='px-5 py-4 font-semibold text-slate-950'>{row.question}</th>
                    <td className='px-5 py-4 leading-6 text-slate-700'>{row.selfHost}</td>
                    <td className='px-5 py-4 leading-6 text-slate-700'>{row.cloud}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className='mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]'>
          <div className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>{cn ? '官方证据' : 'Official evidence'}</p>
            <h2 className='mt-2 text-2xl font-bold text-slate-950'>{cn ? '本页只使用 E0 公开资料' : 'This page uses E0 public sources only'}</h2>
            <p className='mt-3 text-sm leading-7 text-slate-600'>
              {cn
                ? `核查日期：${REVIEWED_AT}。我们没有在你的账户、服务器或真实生产负载中运行 n8n，因此不声称给出了适用于所有工作流的性能或成本基准。`
                : `Checked ${REVIEWED_AT}. We did not run n8n in your account, on your servers, or under your production load, so this is not a universal performance or cost benchmark.`}
            </p>
            <div className='mt-5 flex flex-wrap gap-2'>
              {sources.map((source) => (
                <a key={source.href} href={source.href} target='_blank' rel='noreferrer' className='inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-cyan-800 ring-1 ring-slate-200 hover:bg-cyan-50'>
                  {source.label} <ExternalLink className='size-3.5' />
                </a>
              ))}
            </div>
          </div>
          <aside className='rounded-[20px] border border-cyan-200 bg-cyan-50 p-6 lg:p-8'>
            <p className='text-sm font-semibold uppercase tracking-wide text-cyan-800'>{cn ? '下一步' : 'Next step'}</p>
            <h2 className='mt-2 text-2xl font-bold text-slate-950'>{cn ? '先跑一个真实工作流试点' : 'Pilot one real workflow first'}</h2>
            <p className='mt-3 text-sm leading-7 text-slate-700'>
              {cn
                ? '记录成功执行、失败恢复、维护时间、数据库增长和团队可交接性，再把这些结果与 n8n Cloud 或 Make 的托管路径比较。不要仅用服务器月租代替总成本。'
                : 'Record successful executions, recovery, maintenance time, database growth, and team handoff, then compare those results with n8n Cloud or a managed path such as Make. Do not use server rent as a substitute for total cost.'}
            </p>
            <NextLink href={generateLocalizedPath('/guides/ai-tools-for-automation-comparison', locale)} className='mt-5 inline-flex rounded-lg bg-cyan-800 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-900'>
              {cn ? '继续比较 n8n、Make 与 Lindy' : 'Compare n8n, Make, and Lindy'}
            </NextLink>
          </aside>
        </section>

        <section className='mt-8 rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8'>
          <h2 className='text-2xl font-bold text-slate-950'>{cn ? '常见问题' : 'Frequently asked questions'}</h2>
          <div className='mt-5 grid gap-4 md:grid-cols-2'>
            {faqs.map((faq) => (
              <article key={faq.question} className='rounded-xl bg-slate-50 p-5'>
                <h3 className='font-semibold text-slate-950'>{faq.question}</h3>
                <p className='mt-2 text-sm leading-7 text-slate-600'>{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
