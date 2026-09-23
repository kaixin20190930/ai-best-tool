import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getLocalizedToolPath } from '@/lib/config/toolRouteAliases';
import { buildLocalizedPageMetadata, generateLocalizedPath } from '@/lib/seo/metadata';
import getPublicTaskPage from '@/lib/services/decision/taskPage';
import type { TaskPageModel } from '@/lib/services/decision/taskPageReadModel';
import SeoBreadcrumbs from '@/components/seo/SeoBreadcrumbs';

export const dynamic = 'force-dynamic';

function text(value: Record<string, string>, locale: string): string {
  return value[locale] || value[locale === 'tw' ? 'cn' : 'en'] || value.en || '';
}

function label(isChinese: boolean, english: string, chinese: string): string {
  return isChinese ? chinese : english;
}

function date(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'cn' || locale === 'tw' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value));
}

const constraintLabels: Record<string, [string, string]> = {
  needsInputImage: ['Provide a source image', '提供原始图片'],
  needsAudioCapture: ['Capture meeting audio', '获取会议音频'],
  needsBrandGuidance: ['Provide brand guidance', '提供品牌指引'],
  needsCitations: ['Keep citations traceable', '保留可追溯引用'],
  requiresReview: ['Review output before use', '使用前人工审核输出'],
  requiresCodeReview: ['Review generated code', '审核生成的代码'],
  requiresIntegrationReview: ['Review integrations', '审核集成方案'],
  requiresSourceReview: ['Review original sources', '核查原始来源'],
  requiresConsentReview: ['Review voice rights and consent', '审核声音权利与同意'],
  requiresExportReview: ['Review export options', '审核导出方式'],
};

function constraints(model: TaskPageModel, isChinese: boolean): string[] {
  const output = Object.entries(model.constraintSchema).flatMap(([key, value]) => {
    if (value === true && constraintLabels[key]) return [constraintLabels[key][isChinese ? 1 : 0]];
    return [];
  });
  return output;
}

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  const model = await getPublicTaskPage(params.slug, params.locale);
  if (!model) notFound();
  return buildLocalizedPageMetadata({
    locale: params.locale,
    path: `/tasks/${params.slug}`,
    title: text(model.name, params.locale),
    description: text(model.description, params.locale),
    indexable: false,
  });
}

export default async function TaskPage({ params }: { params: { locale: string; slug: string } }) {
  const model = await getPublicTaskPage(params.slug, params.locale);
  if (!model) notFound();
  const { locale } = params;
  const isChinese = locale === 'cn' || locale === 'tw';
  const name = text(model.name, locale);
  const taskConstraints = constraints(model, isChinese);

  return (
    <main className='min-h-screen bg-slate-50'>
      <div className='container mx-auto max-w-6xl px-4 py-9 lg:py-14' data-decision-task-page>
        <SeoBreadcrumbs
          locale={locale}
          items={[
            { name: isChinese ? '首页' : 'Home', path: '/' },
            { name: isChinese ? '按任务找工具' : 'Find tools', path: '/find-tools' },
            { name, path: `/tasks/${model.slug}` },
          ]}
          className='mb-8'
        />
        <header className='max-w-3xl'>
          <p className='text-sm font-semibold uppercase tracking-widest text-cyan-700'>Task decision guide</p>
          <h1 className='mt-3 text-4xl font-bold tracking-tight text-slate-950'>{name}</h1>
          <p className='mt-4 text-lg leading-8 text-slate-700'>{text(model.description, locale)}</p>
          <p className='mt-3 text-sm text-slate-600'>
            {isChinese
              ? '仅展示当前已发布、证据可核验的适配关系；排序不是评测分数。'
              : 'Only current, published fits backed by verifiable evidence appear here. Order is not a review score.'}
          </p>
        </header>

        <section className='mt-10 grid gap-6 md:grid-cols-2'>
          <div className='rounded-2xl border border-slate-200 bg-white p-6'>
            <h2 className='text-xl font-semibold text-slate-950'>{isChinese ? '任务约束' : 'Task constraints'}</h2>
            {taskConstraints.length ? (
              <ul className='mt-4 list-disc space-y-2 pl-5 text-slate-700'>
                {taskConstraints.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className='mt-4 text-slate-600'>
                {isChinese ? '请在选择前核对自己的硬性条件。' : 'Check your hard constraints before choosing.'}
              </p>
            )}
          </div>
          <div className='rounded-2xl border border-slate-200 bg-white p-6'>
            <h2 className='text-xl font-semibold text-slate-950'>
              {isChinese ? '任务所需能力' : 'Capabilities for this task'}
            </h2>
            <ul className='mt-4 space-y-4'>
              {model.capabilities.map((capability) => (
                <li key={`${capability.importance}:${capability.name.en}`}>
                  <span className='text-xs font-semibold uppercase text-cyan-700'>
                    {capability.importance === 'required'
                      ? label(isChinese, 'Required', '必需')
                      : label(isChinese, 'Preferred', '优选')}
                  </span>
                  <h3 className='font-semibold text-slate-900'>{text(capability.name, locale)}</h3>
                  <p className='text-sm text-slate-600'>{text(capability.rationale, locale)}</p>
                  <p className='mt-1 text-xs text-slate-500'>
                    {isChinese ? '审核' : 'Reviewed'} {date(capability.reviewedAt, locale)} ·{' '}
                    {isChinese ? '复查期限' : 'Review due'} {date(capability.reviewDueAt, locale)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className='mt-12' aria-labelledby='task-candidates'>
          <h2 id='task-candidates' className='text-2xl font-bold text-slate-950'>
            {isChinese ? '3 个可核验候选' : 'Three evidence-backed candidates'}
          </h2>
          <div className='mt-5 grid gap-5 lg:grid-cols-3'>
            {model.tools.map((tool) => (
              <article key={tool.identity.id} className='rounded-2xl border border-slate-200 bg-white p-6'>
                <p className='text-xs font-semibold uppercase text-cyan-700'>
                  {tool.fitLevel === 'strong'
                    ? label(isChinese, 'Strong fit', '强适配')
                    : label(isChinese, 'Conditional fit', '有条件适配')}
                </p>
                <h3 className='mt-2 text-xl font-semibold text-slate-950'>{tool.identity.title}</h3>
                <p className='mt-3 text-sm leading-6 text-slate-700'>{text(tool.rationale, locale)}</p>
                <h4 className='mt-5 text-sm font-semibold text-slate-900'>
                  {isChinese ? '条件与限制' : 'Conditions and limitations'}
                </h4>
                {tool.requiredConditions.length || tool.disqualifiers.length ? (
                  <ul className='mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600'>
                    {[...tool.requiredConditions, ...tool.disqualifiers].map((item) => (
                      <li key={`${item.en}:${item.cn}`}>{text(item, locale)}</li>
                    ))}
                  </ul>
                ) : (
                  <p className='mt-2 text-sm text-slate-600'>
                    {isChinese
                      ? '尚无已发布的具体限制；选择前请核对官方条款。'
                      : 'No specific limitation is published yet; verify official terms before choosing.'}
                  </p>
                )}
                <div className='mt-5 border-t border-slate-100 pt-4 text-xs text-slate-600'>
                  <p>
                    {isChinese ? '适配审核' : 'Fit reviewed'} {date(tool.reviewedAt, locale)} ·{' '}
                    {isChinese ? '复查期限' : 'Review due'} {date(tool.reviewDueAt, locale)}
                  </p>
                  <p className='mt-2 font-medium'>{isChinese ? '来源与核验日期' : 'Sources and verification dates'}</p>
                  <ul className='mt-1 space-y-1'>
                    {tool.evidence.map((evidence) => (
                      <li key={`${evidence.sourceUrl}:${evidence.verifiedAt}:${evidence.reviewDueAt}`}>
                        <a
                          href={evidence.sourceUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='break-all text-cyan-700 underline'
                        >
                          {new URL(evidence.sourceUrl).hostname}
                        </a>{' '}
                        · {isChinese ? '核验' : 'Verified'} {date(evidence.verifiedAt, locale)}
                        {evidence.reviewDueAt
                          ? ` · ${isChinese ? '复查期限' : 'Review due'} ${date(evidence.reviewDueAt, locale)}`
                          : ''}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href={getLocalizedToolPath(tool.identity.slug, locale)}
                  className='mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700'
                >
                  {isChinese ? '查看工具详情' : 'View tool details'}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <div className='mt-10 rounded-2xl bg-cyan-950 p-6 text-white'>
          <h2 className='text-xl font-semibold'>
            {isChinese ? '按你的硬性条件继续筛选' : 'Narrow the choice with your hard constraints'}
          </h2>
          <p className='mt-2 text-sm text-cyan-100'>
            {isChinese
              ? '在 Decision Finder 中选择此任务，再输入预算、隐私和导出要求。'
              : 'Select this task in Decision Finder, then enter budget, privacy, and export requirements.'}
          </p>
          <Link
            href={generateLocalizedPath('/find-tools', locale)}
            className='mt-4 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-cyan-950'
          >
            {isChinese ? '打开 Decision Finder' : 'Open Decision Finder'}
          </Link>
        </div>
      </div>
    </main>
  );
}
