import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getLocalizedToolPath } from '@/lib/config/toolRouteAliases';
import { buildLocalizedPageMetadata, generateLocalizedPath } from '@/lib/seo/metadata';
import { meetingNotesConstraints, meetingNotesSources } from '@/lib/services/decision/meetingNotesPresentation';
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
  if (params.slug === 'build-app-with-ai' && !['en', 'cn'].includes(params.locale)) notFound();
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
  if (params.slug === 'build-app-with-ai' && !['en', 'cn'].includes(params.locale)) notFound();
  const model = await getPublicTaskPage(params.slug, params.locale);
  if (!model) notFound();
  const { locale } = params;
  const isChinese = locale === 'cn' || locale === 'tw';
  const name = text(model.name, locale);
  const isMeetingNotes = model.slug === 'meeting-notes';
  const isAppBuilder = model.slug === 'build-app-with-ai';
  const taskConstraints = isMeetingNotes ? meetingNotesConstraints(model, isChinese) : constraints(model, isChinese);
  let eyebrow = 'Task decision guide';
  let context = label(isChinese, 'Only current, published fits backed by verifiable evidence appear here. Order is not a review score.', '仅展示当前已发布、证据可核验的适配关系；排序不是评测分数。');
  if (isMeetingNotes) {
    eyebrow = isChinese ? '会议工具选择指南' : eyebrow;
    context = label(isChinese, 'Compare conditions and plan limits using the official sources below. Order is not a review score.', '根据下方官方来源比较适用条件与套餐限制；排序不是评测分数。');
  }
  if (isAppBuilder) {
    eyebrow = label(isChinese, 'Build an app with AI', '用 AI 构建应用');
    context = label(isChinese, 'Compare which workflow fits your project, then check the official evidence and limits for each tool. These are conditional fits, not a ranking or hands-on test.', '先比较哪种工作流适合你的项目，再核对各工具的官方证据与限制。这些是有条件的适配判断，不是排名或实测结果。');
  }

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
          <p className='text-sm font-semibold uppercase tracking-widest text-cyan-700'>
            {eyebrow}
          </p>
          <h1 className='mt-3 text-4xl font-bold tracking-tight text-slate-950'>{name}</h1>
          <p className='mt-4 text-lg leading-8 text-slate-700'>{text(model.description, locale)}</p>
          <p className='mt-3 text-sm text-slate-600'>
            {context}
          </p>
        </header>

        {isAppBuilder && (
          <section className='mt-8 rounded-2xl border border-cyan-200 bg-cyan-50 p-6'>
            <h2 className='text-xl font-semibold text-slate-950'>
              {label(isChinese, 'The key difference', '三种工作流的核心差异')}
            </h2>
            <p className='mt-3 text-sm leading-7 text-slate-700'>
              {label(isChinese, 'Bolt suits a prompt-to-web-app workflow with code and backend checks before launch. Lovable focuses on building screens, data and logic together while you review Cloud usage. v0 suits incremental app building when you specify backend needs and validate connected services. Each choice still requires review of generated behavior and current account limits.', 'Bolt 适合提示词构建 Web 应用、上线前能审查代码和测试后端的团队；Lovable 适合一起构建界面、数据和逻辑，并核对 Cloud 用量的项目；v0 适合逐步补充后端需求、核验连接服务的应用。三者都需要审查生成结果和当前账户限制。')}
            </p>
            <Link href={generateLocalizedPath('/guides/ai-app-builders', locale)} className='mt-4 inline-flex text-sm font-semibold text-cyan-800 underline'>
              {label(isChinese, 'Compare code, hosting, data, integrations and costs in the full guide', '在完整指南中比较代码、托管、数据、集成和费用')}
            </Link>
          </section>
        )}

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
                <h4 className='mt-4 text-sm font-semibold text-slate-900'>{isAppBuilder ? label(isChinese, 'Best for', '更适合') : label(isChinese, 'Why it fits', '适配原因')}</h4>
                <p className='mt-2 text-sm leading-6 text-slate-700'>{text(tool.rationale, locale)}</p>
                {isAppBuilder && tool.disqualifiers.length > 0 && (
                  <>
                    <h4 className='mt-4 text-sm font-semibold text-slate-900'>{label(isChinese, 'Not ideal for', '不太适合')}</h4>
                    <ul className='mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600'>
                      {tool.disqualifiers.map((item) => <li key={`${item.en}:${item.cn}`}>{text(item, locale)}</li>)}
                    </ul>
                  </>
                )}
                <h4 className='mt-5 text-sm font-semibold text-slate-900'>
                  {isChinese ? '条件与限制' : 'Conditions and limitations'}
                </h4>
                {tool.requiredConditions.length || tool.disqualifiers.length ? (
                  <ul className='mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600'>
                    {[...tool.requiredConditions, ...(isAppBuilder ? [] : tool.disqualifiers)].map((item) => (
                      <li key={`${item.en}:${item.cn}`}>{text(item, locale)}</li>
                    ))}
                  </ul>
                ) : (
                  <p className='mt-2 text-sm text-slate-600'>
                    {isMeetingNotes
                      ? label(isChinese, 'Check the plan limits in the sources below and confirm recording and sharing suit your meeting.', '选择前请核对下方来源中的套餐限制，并确认录音与共享符合你的会议要求。')
                      : label(isChinese, 'No specific limitation is published yet; verify official terms before choosing.', '尚无已发布的具体限制；选择前请核对官方条款。')}
                  </p>
                )}
                <div className='mt-5 border-t border-slate-100 pt-4 text-xs text-slate-600'>
                  <p>
                    {isChinese ? '适配审核' : 'Fit reviewed'} {date(tool.reviewedAt, locale)} ·{' '}
                    {isChinese ? '复查期限' : 'Review due'} {date(tool.reviewDueAt, locale)}
                  </p>
                  <p className='mt-2 font-medium'>{isChinese ? '来源与核验日期' : 'Sources and verification dates'}</p>
                  <ul className='mt-1 space-y-1'>
                    {isMeetingNotes
                      ? meetingNotesSources(tool.evidence, isChinese).map((source) => (
                        <li key={source.sourceUrl}>
                          <a
                            href={source.sourceUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='break-words text-cyan-700 underline'
                          >
                            {source.label}
                          </a>
                          {source.windows.map((window) => (
                            <span className='block' key={`${window.verifiedAt}:${window.reviewDueAt}`}>
                              {label(isChinese, 'Verified', '核验')} {date(window.verifiedAt, locale)}
                              {window.reviewDueAt
                                ? ` · ${label(isChinese, 'Review due', '复查期限')} ${date(window.reviewDueAt, locale)}`
                                : ''}
                            </span>
                          ))}
                        </li>
                      ))
                      : tool.evidence.map((evidence) => (
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
            {isMeetingNotes
              ? label(isChinese, 'On the next page, select the meeting-notes task again, then set data sensitivity and export requirements.', '进入筛选页后，请再次选择会议纪要任务，再设置数据敏感度和导出要求。')
              : label(isChinese, 'Select this task in Decision Finder, then enter budget, privacy, and export requirements.', '在 Decision Finder 中选择此任务，再输入预算、隐私和导出要求。')}
          </p>
          <Link
            href={generateLocalizedPath('/find-tools', locale)}
            className='mt-4 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-cyan-950'
          >
            {isMeetingNotes
              ? label(isChinese, 'Filter by privacy and export needs', '按隐私和导出要求继续筛选')
              : label(isChinese, 'Open Decision Finder', '打开 Decision Finder')}
          </Link>
        </div>
      </div>
    </main>
  );
}
