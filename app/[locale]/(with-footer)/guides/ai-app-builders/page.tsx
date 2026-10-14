import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import boltLovableEvidence from '@/data/collection/build-app-bolt-lovable-evidence-2026-10-13.json';
import v0ReplitEvidence from '@/data/collection/build-app-v0-replit-evidence-2026-10-13.json';
import { ArrowRight, Check, ExternalLink, GitBranch, HelpCircle } from 'lucide-react';

import {
  appBuilderDimensions,
  appBuilderTools,
  type AppBuilderDimension,
  type AppBuilderTool,
} from '@/lib/content/appBuilderGuide';
import { BASE_URL } from '@/lib/env';
import { SEO_CONFIG } from '@/lib/seo/constants';
import { buildLocalizedPageMetadata, generateLocalizedCanonicalUrl, generateLocalizedPath } from '@/lib/seo/metadata';
import { generateArticleSchema } from '@/lib/seo/schema';
import SeoBreadcrumbs from '@/components/seo/SeoBreadcrumbs';
import { StructuredDataServer } from '@/components/seo/StructuredData';

const path = '/guides/ai-app-builders';
const reviewedAt = '2026-10-13';
const evidence = [...boltLovableEvidence.tools, ...v0ReplitEvidence.tools];

function getClaim(tool: AppBuilderTool, dimension: AppBuilderDimension) {
  const claim = evidence.find((entry) => entry.tool === tool)?.claims.find((entry) => entry.stableKey === dimension);
  if (!claim) throw new Error(`Missing app-builder evidence: ${tool}/${dimension}`);
  return claim;
}

function copy(locale: string) {
  return locale === 'cn'
    ? {
        title: 'AI 应用构建器怎么选：Bolt、Lovable、Replit 与 v0',
        description: '按代码交接、部署、数据迁移、集成、费用和维护责任，选择适合生成并交付网站或应用的 AI 构建器。',
        breadcrumb: 'AI 应用构建器',
        eyebrow: '从想法到可运行应用',
        h1: '用 AI 构建网站或应用，该选哪条交付路径？',
        intro:
          'Bolt、Lovable、Replit 和 v0 都能帮助你从需求走向可运行产物，但代码、托管、数据和维护不会自动跟着一份提示词走。先按你要交付的应用和交接方式选择，再核对每项限制。',
        codingNote: '这里比较的是生成并发布网站或应用的工作流，不是编辑器里的代码补全、调试或重构助手。',
        quickChoice: '先选一条适合你的路径',
        bestFor: '更适合',
        notIdeal: '不太适合',
        viewTool: '查看工具详情',
        matrix: '把交付问题放在一起看',
        matrixIntro: '每格概括相应官方资料，不代表本站已对账户、生成应用或迁移流程做实测。点击来源可核对适用范围。',
        dimension: '判断维度',
        source: '官方来源',
        documented: '文档支持',
        conditional: '视条件而定',
        unknown: '尚未证实',
        limitsTitle: '最容易忽略的边界',
        limits: [
          'Git 仓库主要交接代码；数据库内容、文件、密钥、域名和运行配置通常要分别核对。',
          'v0 的数据库集成已有文档，但当前证据不能确认完整迁出路径；不要据此断言一定可迁或一定被锁定。',
          'Replit、Bolt 与 Lovable 的数据转移都有特定步骤或条件，不能当成整站一键迁移。',
          '订阅费不是应用总成本；构建用量、托管、数据库和第三方服务可能分别计费。',
        ],
        checklistTitle: '做决定前，问自己五个问题',
        checklist: [
          '最终交付的是静态网站、带后端的应用，还是仍需工程师继续开发的原型？',
          '谁拥有仓库、部署账户、域名、密钥和数据库备份？',
          '若离开当前平台，代码之外的资源准备怎样迁移和验收？',
          '当前套餐和账户究竟允许哪些连接器、部署方式与额度？',
          '上线后谁负责安全复核、费用监控、修复与恢复演练？',
        ],
        sourcesTitle: '来源与核查时间',
        taskLink: '按已核验的适配条件筛选 Bolt、Lovable 和 v0',
        sourcesNote:
          '本指南按 2026 年 10 月 13 日核查的官方资料整理；价格、额度及账户权益可能变化。具体结账与项目适用性，请在相应工具和服务中再次确认。',
        otherPath: '如果你主要是在 IDE 里补全、调试或重构代码，请改看开发者工具指南。',
        codingLink: '查看开发者工具指南',
      }
    : {
        title: 'Choose an AI App Builder: Bolt, Lovable, Replit or v0',
        description:
          'Choose an AI app builder for a runnable site or app by checking code handoff, deployment, data moves, integrations, cost boundaries and maintenance.',
        breadcrumb: 'AI app builders',
        eyebrow: 'From prompt to a runnable app',
        h1: 'Which AI app builder fits the app you need to deliver?',
        intro:
          'Bolt, Lovable, Replit and v0 can help turn a brief into a runnable product. Code, hosting, data and ongoing ownership do not move together with a prompt, though. Start with your delivery path, then check the conditions behind each choice.',
        codingNote:
          'This guide is about generating and publishing a site or app, not IDE code completion, debugging or refactoring assistants.',
        quickChoice: 'Choose a starting path',
        bestFor: 'Best for',
        notIdeal: 'Not ideal for',
        viewTool: 'View tool profile',
        matrix: 'Compare the delivery boundaries',
        matrixIntro:
          'Each cell summarizes the relevant official documentation, not a hands-on account, app or migration test by this directory. Open the source to check its scope.',
        dimension: 'Decision point',
        source: 'Official source',
        documented: 'Documented',
        conditional: 'Depends on setup',
        unknown: 'Not established',
        limitsTitle: 'Boundaries worth checking',
        limits: [
          'A Git repository mainly hands off code. Check database contents, files, secrets, domains and runtime settings separately.',
          'v0 documents database integrations, but the reviewed source does not establish a complete exit procedure. That proves neither portability nor lock-in.',
          'Replit, Bolt and Lovable document particular data moves with conditions; none of those sources establishes a one-click whole-app migration.',
          'A subscription is not a total app cost. Build usage, hosting, databases and third-party services can be billed separately.',
        ],
        checklistTitle: 'Five questions before you choose',
        checklist: [
          'Are you delivering a static site, a backend app, or a prototype that engineers will take over?',
          'Who controls the repository, deployment account, domain, secrets and database backups?',
          'If you leave the platform, how will you move and verify resources beyond source code?',
          'Which connectors, deployment options and allowances apply to your actual account?',
          'Who will own security review, spend monitoring, fixes and recovery drills after launch?',
        ],
        sourcesTitle: 'Sources and review date',
        taskLink: 'Compare the verified fits for Bolt, Lovable and v0',
        sourcesNote:
          'This guide summarizes official documentation reviewed on October 13, 2026. Prices, allowances and account entitlements may change. Recheck checkout and project-specific eligibility with each provider.',
        otherPath:
          'If your main task is code completion, debugging or refactoring inside an IDE, use the developer-tools guide instead.',
        codingLink: 'Explore developer tools',
      };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  if (locale !== 'en' && locale !== 'cn') notFound();
  const content = copy(locale);
  return buildLocalizedPageMetadata({
    locale,
    path,
    title: content.title,
    description: content.description,
    indexable: false,
    type: 'article',
    baseUrl: BASE_URL,
  });
}

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  if (locale !== 'en' && locale !== 'cn') notFound();
  const content = copy(locale);
  const language = locale as 'en' | 'cn';
  const canonical = generateLocalizedCanonicalUrl(path, locale, BASE_URL);

  return (
    <>
      <StructuredDataServer
        data={generateArticleSchema({
          title: content.title,
          description: content.description,
          url: canonical,
          image: `${BASE_URL}${SEO_CONFIG.defaultImage}`,
          datePublished: reviewedAt,
          dateModified: reviewedAt,
        })}
      />
      <main className='theme-page mx-auto max-w-6xl px-4 py-8 lg:px-6 lg:py-12'>
        <SeoBreadcrumbs
          locale={locale}
          items={[
            { name: locale === 'cn' ? '首页' : 'Home', path: '/' },
            { name: locale === 'cn' ? '指南' : 'Guides', path: '/guides' },
            { name: content.breadcrumb, path },
          ]}
          className='mb-5'
        />

        <header className='overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm'>
          <div className='bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-7 text-white lg:p-12'>
            <p className='inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-100'>
              <GitBranch className='size-4' /> {content.eyebrow}
            </p>
            <h1 className='mt-5 max-w-4xl text-3xl font-bold tracking-tight lg:text-5xl'>{content.h1}</h1>
            <p className='mt-5 max-w-3xl text-base leading-7 text-slate-200 lg:text-lg'>{content.intro}</p>
          </div>
          <p className='border-t border-slate-200 bg-cyan-50 px-7 py-4 text-sm leading-6 text-slate-700 lg:px-12'>
            {content.codingNote}
          </p>
        </header>

        <section aria-labelledby='quick-choice' className='mt-10'>
          <h2 id='quick-choice' className='text-2xl font-bold text-slate-950'>
            {content.quickChoice}
          </h2>
          <div className='mt-5 grid gap-4 md:grid-cols-2'>
            {appBuilderTools.map((tool) => (
              <article
                key={tool.key}
                className='flex flex-col rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm'
              >
                <h3 className='text-xl font-bold text-slate-950'>{tool.name}</h3>
                <dl className='mt-4 flex-1 space-y-3 text-sm leading-6'>
                  <div>
                    <dt className='font-semibold text-emerald-700'>{content.bestFor}</dt>
                    <dd className='text-slate-700'>{tool.bestFor[language]}</dd>
                  </div>
                  <div>
                    <dt className='font-semibold text-amber-700'>{content.notIdeal}</dt>
                    <dd className='text-slate-700'>{tool.notIdeal[language]}</dd>
                  </div>
                </dl>
                <Link
                  href={generateLocalizedPath(`/ai/${tool.key}`, locale)}
                  className='mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:text-cyan-900'
                >
                  {content.viewTool} <ArrowRight className='size-4' />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <Link
          href={generateLocalizedPath('/tasks/build-app-with-ai', locale)}
          className='mt-5 inline-flex items-center gap-2 rounded-lg bg-cyan-950 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-900'
        >
          {content.taskLink} <ArrowRight className='size-4' />
        </Link>

        <section aria-labelledby='decision-matrix' className='mt-12'>
          <h2 id='decision-matrix' className='text-2xl font-bold text-slate-950'>
            {content.matrix}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-slate-600'>{content.matrixIntro}</p>
          <div className='mt-5 overflow-x-auto rounded-[20px] border border-slate-200 bg-white shadow-sm'>
            <table className='w-full min-w-[900px] border-collapse text-left text-sm'>
              <thead className='bg-slate-950 text-white'>
                <tr>
                  <th scope='col' className='w-40 p-4 font-semibold'>
                    {content.dimension}
                  </th>
                  {appBuilderTools.map((tool) => (
                    <th key={tool.key} scope='col' className='min-w-44 p-4 font-semibold'>
                      {tool.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appBuilderDimensions.map((dimension) => (
                  <tr key={dimension.key} className='border-t border-slate-200 align-top'>
                    <th scope='row' className='bg-slate-50 p-4 font-semibold text-slate-950'>
                      {dimension.label[language]}
                    </th>
                    {appBuilderTools.map((tool) => {
                      const claim = getClaim(tool.key, dimension.key);
                      let status = content.conditional;
                      if (claim.status === 'verified_public') status = content.documented;
                      if (claim.status === 'unknown') status = content.unknown;
                      return (
                        <td key={tool.key} className='p-4 text-slate-700'>
                          <p className='leading-6'>{dimension.cells[tool.key][language]}</p>
                          <p className='mt-2 text-xs font-semibold text-slate-500'>{status}</p>
                          <a
                            href={claim.sourceUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='mt-2 inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:underline'
                          >
                            {content.source} <ExternalLink className='size-3' />
                          </a>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className='mt-10 grid gap-5 lg:grid-cols-2'>
          <section className='rounded-[20px] border border-amber-200 bg-amber-50 p-6'>
            <h2 className='flex items-center gap-2 text-xl font-bold text-slate-950'>
              <HelpCircle className='size-5 text-amber-700' />
              {content.limitsTitle}
            </h2>
            <ul className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              {content.limits.map((limit) => (
                <li key={limit} className='border-l-2 border-amber-400 pl-3'>
                  {limit}
                </li>
              ))}
            </ul>
          </section>
          <section className='rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm'>
            <h2 className='text-xl font-bold text-slate-950'>{content.checklistTitle}</h2>
            <ol className='mt-4 space-y-3 text-sm leading-6 text-slate-700'>
              {content.checklist.map((question) => (
                <li key={question} className='flex items-start gap-2'>
                  <Check className='mt-1 size-4 shrink-0 text-emerald-700' />
                  {question}
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section className='mt-10 rounded-[20px] border border-slate-200 bg-slate-50 p-6'>
          <h2 className='text-xl font-bold text-slate-950'>{content.sourcesTitle}</h2>
          <p className='mt-2 max-w-4xl text-sm leading-6 text-slate-700'>{content.sourcesNote}</p>
          <p className='mt-5 text-sm leading-6 text-slate-700'>{content.otherPath}</p>
          <Link
            href={generateLocalizedPath('/guides/ai-tools-for-developers', locale)}
            className='mt-2 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:underline'
          >
            {content.codingLink} <ArrowRight className='size-4' />
          </Link>
        </section>
      </main>
    </>
  );
}
