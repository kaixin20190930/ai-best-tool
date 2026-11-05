import Link from 'next/link';

import { generateLocalizedPath } from '@/lib/seo/metadata';

const sources = [
  { label: 'n8n pricing', href: 'https://n8n.io/pricing/' },
  {
    label: 'Community and paid editions',
    href: 'https://docs.n8n.io/deploy/host-n8n/community-edition-features/',
  },
  {
    label: 'Sustainable Use License FAQ',
    href: 'https://support.n8n.io/article/can-i-use-your-license-for-my-use-case',
  },
] as const;

export default function N8nPricingDecision({ locale }: { locale: string }) {
  const cn = locale === 'cn' || locale === 'tw';
  const plans = cn
    ? [
        { plan: 'Community', price: '软件免费', allowance: '自托管', fit: '有技术团队，愿意承担部署、安全、备份、升级与恢复' },
        { plan: 'Starter Cloud', price: '€20/月', allowance: '2,500 executions', fit: '小规模生产流程，希望由 n8n 托管' },
        { plan: 'Pro Cloud', price: '€50/月', allowance: '10,000 executions', fit: '执行量更高，需要 Cloud 的协作与管理能力' },
        { plan: 'Business', price: '€667/月', allowance: '40,000 executions', fit: '仅自托管，需要更多团队治理能力' },
        { plan: 'Enterprise', price: '询价', allowance: '按合同', fit: '需要企业治理、支持，或 Cloud / 自托管选项' },
      ]
    : [
        { plan: 'Community', price: 'Free software', allowance: 'Self-hosted', fit: 'Technical teams ready to own deployment, security, backups, upgrades, and recovery' },
        { plan: 'Starter Cloud', price: '€20/mo', allowance: '2,500 executions', fit: 'Smaller production workflows with n8n managing the service' },
        { plan: 'Pro Cloud', price: '€50/mo', allowance: '10,000 executions', fit: 'Higher execution volume with Cloud collaboration and administration' },
        { plan: 'Business', price: '€667/mo', allowance: '40,000 executions', fit: 'Self-hosted only, with stronger team governance needs' },
        { plan: 'Enterprise', price: 'Contact sales', allowance: 'Contract based', fit: 'Enterprise controls, support, or a Cloud / self-hosted choice' },
      ];
  const faqs = cn
    ? [
        ['n8n 是免费的吗？', 'Community Edition 软件可以免费自托管，但服务器、数据库、备份、监控、安全和维护都不是零成本。n8n Cloud 和付费自托管套餐另行收费。'],
        ['一次 execution 是什么？', 'Cloud 按完整工作流运行次数计费，而不是按节点数计费。高频定时任务、webhook 和逐消息触发的 AI 工作流都可能快速增加 execution 数。'],
        ['自托管一定比 Cloud 便宜吗？', '不一定。应把基础设施、升级、故障恢复、凭证安全和维护工时计入总成本；只有控制权或规模收益覆盖这些责任时，自托管才更划算。'],
        ['Community Edition 可以用于商业项目吗？', '源码可见不等于 OSI 开源。Sustainable Use License 对收费托管、白标销售和部分嵌入场景有边界，具体用途应核对官方许可案例。'],
      ]
    : [
        ['Is n8n free?', 'The Community Edition software can be self-hosted for free, but servers, databases, backups, monitoring, security, and maintenance still cost money. n8n Cloud and paid self-hosted plans are separate.'],
        ['What counts as an execution?', 'Cloud billing counts a complete workflow run rather than individual nodes. Frequent schedules, webhooks, and message-triggered AI workflows can increase execution volume quickly.'],
        ['Is self-hosting always cheaper than Cloud?', 'No. Include infrastructure, upgrades, incident recovery, credential security, and maintenance time in total cost. Self-hosting wins only when control or scale offsets those responsibilities.'],
        ['Can the Community Edition be used commercially?', 'Source-available does not mean OSI open source. The Sustainable Use License has boundaries around paid hosting, white-label resale, and some embedded uses; check the official examples for your case.'],
      ];

  return (
    <section
      data-n8n-pricing-decision
      data-official-evidence='true'
      className='space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'
    >
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>
            {cn ? '先算总成本，再选部署方式' : 'Price the full operating model'}
          </p>
          <h2 className='mt-2 text-2xl font-bold text-slate-950'>
            {cn ? 'n8n Cloud 与自托管成本对照' : 'n8n Cloud vs self-hosted costs'}
          </h2>
          <p className='mt-3 max-w-3xl text-sm leading-6 text-slate-600'>
            {cn
              ? 'Cloud 购买的是托管与较低运维负担；自托管购买的是控制权，同时把安全、备份、升级和恢复责任交给自己的团队。以下公开价格均为年付口径。'
              : 'Cloud buys managed operations and a lower maintenance burden. Self-hosting buys control while moving security, backups, upgrades, and recovery to your team. Published prices below use annual billing.'}
          </p>
        </div>
        <span className='w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200'>
          {cn ? '官方来源核查：2026-11-01' : 'Official sources checked: 2026-11-01'}
        </span>
      </div>

      <div className='overflow-x-auto rounded-xl border border-slate-200'>
        <table className='min-w-[760px] w-full border-collapse text-left text-sm'>
          <thead className='bg-slate-50 text-xs uppercase tracking-wide text-slate-500'>
            <tr>
              <th className='px-4 py-3'>{cn ? '套餐' : 'Plan'}</th>
              <th className='px-4 py-3'>{cn ? '公开价格' : 'Published price'}</th>
              <th className='px-4 py-3'>{cn ? '包含量 / 部署' : 'Allowance / hosting'}</th>
              <th className='px-4 py-3'>{cn ? '更适合' : 'Best fit'}</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-200'>
            {plans.map((item) => (
              <tr key={item.plan}>
                <th className='px-4 py-3 font-semibold text-slate-950'>{item.plan}</th>
                <td className='px-4 py-3 font-medium text-slate-800'>{item.price}</td>
                <td className='px-4 py-3 text-slate-700'>{item.allowance}</td>
                <td className='px-4 py-3 leading-6 text-slate-600'>{item.fit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <article className='rounded-xl border border-cyan-100 bg-cyan-50/50 p-5'>
          <h3 className='font-bold text-slate-950'>{cn ? 'Cloud 成本怎么估' : 'How to estimate Cloud cost'}</h3>
          <ul className='mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700'>
            <li>{cn ? '按成功与失败的完整 workflow runs 估算 execution 用量。' : 'Estimate complete workflow runs, including successful and failed runs.'}</li>
            <li>{cn ? '把定时、webhook 和聊天消息等不同触发方式分开建模。' : 'Model schedules, webhooks, and chat-message triggers separately.'}</li>
            <li>{cn ? '模型供应商 API 费用与 n8n AI Assistant credits 分开计算。' : 'Keep model-provider API charges separate from n8n AI Assistant credits.'}</li>
          </ul>
        </article>
        <article className='rounded-xl border border-amber-100 bg-amber-50/50 p-5'>
          <h3 className='font-bold text-slate-950'>{cn ? '自托管 TCO 要加什么' : 'What belongs in self-hosted TCO'}</h3>
          <ul className='mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700'>
            <li>{cn ? '计算、数据库、存储、网络和监控。' : 'Compute, database, storage, networking, and monitoring.'}</li>
            <li>{cn ? '升级、备份、凭证管理、安全修补与故障恢复工时。' : 'Upgrades, backups, credential handling, security patches, and recovery time.'}</li>
            <li>{cn ? '项目共享、SSO、Git 和 external secrets 等治理功能的套餐边界。' : 'Plan boundaries for project sharing, SSO, Git, and external secrets.'}</li>
          </ul>
        </article>
      </div>

      <div className='rounded-xl border border-slate-200 p-5'>
        <h3 className='font-bold text-slate-950'>{cn ? '快速选择' : 'Quick decision'}</h3>
        <div className='mt-3 grid gap-3 text-sm leading-6 text-slate-700 md:grid-cols-3'>
          <p><strong className='text-slate-950'>{cn ? '选 Cloud：' : 'Choose Cloud: '}</strong>{cn ? '想用 n8n，但不想运营底层服务。' : 'You want n8n without operating the underlying service.'}</p>
          <p><strong className='text-slate-950'>{cn ? '选自托管：' : 'Choose self-hosting: '}</strong>{cn ? '数据、网络或部署控制值得承担运维责任。' : 'Data, network, or deployment control is worth the operations burden.'}</p>
          <p><strong className='text-slate-950'>{cn ? '先比较：' : 'Compare first: '}</strong>{cn ? '如果团队更重视低维护或快速搭建，再看 Make 与 Lindy。' : 'If lower maintenance or faster setup matters more, compare Make and Lindy.'}</p>
        </div>
        <div className='mt-4 flex flex-wrap gap-3'>
          <Link href={generateLocalizedPath('/guides/n8n-self-hosted-requirements', locale)} className='rounded-lg bg-cyan-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-900'>
            {cn ? '查看自托管上线清单' : 'Open the self-hosting checklist'}
          </Link>
          <Link href={generateLocalizedPath('/guides/ai-tools-for-automation-comparison', locale)} className='rounded-lg border border-cyan-200 px-4 py-2.5 text-sm font-semibold text-cyan-900 hover:bg-cyan-50'>
            {cn ? '比较 n8n、Make 与 Lindy' : 'Compare n8n, Make, and Lindy'}
          </Link>
        </div>
      </div>

      <div>
        <h2 className='text-xl font-bold text-slate-950'>{cn ? '常见问题' : 'n8n pricing FAQ'}</h2>
        <div className='mt-3 space-y-2'>
          {faqs.map(([question, answer]) => (
            <details key={question} className='rounded-lg border border-slate-200 bg-slate-50 p-4 open:bg-white'>
              <summary className='cursor-pointer font-semibold text-slate-950'>{question}</summary>
              <p className='mt-3 text-sm leading-6 text-slate-700'>{answer}</p>
            </details>
          ))}
        </div>
      </div>

      <div className='border-t border-slate-200 pt-4'>
        <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>{cn ? '核验来源' : 'Verified sources'}</p>
        <div className='mt-2 flex flex-wrap gap-3'>
          {sources.map((source) => (
            <a key={source.href} href={source.href} target='_blank' rel='noreferrer' className='text-sm font-semibold text-cyan-800 underline'>
              {source.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
