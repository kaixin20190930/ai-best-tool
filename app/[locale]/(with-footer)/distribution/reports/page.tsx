import Link from 'next/link';
import { ArrowRight, BarChart3, CheckCircle2, CircleAlert, Globe, Loader, Star, TrendingDown } from 'lucide-react';
import { redirect } from 'next/navigation';

import { getDistributionDashboard } from '@/app/actions/distribution';

type DistributionWorkspaceSearchParams = {
  project?: string | string[];
};

function pickValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatRate(value: number) {
  return `${value}%`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return '--';
  return value.slice(0, 10);
}

function formatText(value: string) {
  return value || '--';
}

function localize(locale: string, zh: string, en: string) {
  return locale === 'cn' ? zh : en;
}

export default async function DistributionReportsPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: DistributionWorkspaceSearchParams;
}) {
  const locale = params.locale;
  const result = await getDistributionDashboard(pickValue(searchParams?.project));
  const isChinese = locale === 'cn';
  const projectId = pickValue(searchParams?.project) || '';
  const projectQuery = projectId ? `?project=${encodeURIComponent(projectId)}` : '';
  const redirectUrl = `/${locale}/distribution/reports${projectQuery ? projectQuery : ''}`;

  if (!result.success) {
    if (result.error === 'Unauthorized') {
      redirect(`/${locale}/login?redirect=${encodeURIComponent(redirectUrl)}`);
    }
    return <div className='mx-auto max-w-5xl px-5 py-16 text-center text-slate-700'>{result.error}</div>;
  }

  const data = result.data;
  if (!data) {
    return <div className='mx-auto max-w-4xl px-5 py-16 text-slate-700'>Workspace data unavailable.</div>;
  }

  const report = data.reviewReport;
  const reviewLinkStatus = (report?.liveChecks || []).filter((item) => item.noindex || !item.reachable);
  const retention = report?.retention;
  const blockedCount = report?.summary?.blockedCount ?? 0;
  const liveChecksCount = report?.summary?.checkedCount ?? 0;
  const totalTasks = data.metrics.total;
  const doneTasks = (data.tasks || []).filter((item) => item.status === 'done' || item.status === 'skipped').length;
  const blockedTasks = (data.tasks || []).filter((item) => item.status === 'blocked').length;
  const monitorTasks = (data.tasks || []).filter((item) => ['submitted', 'waiting_review', 'follow_up', 'live'].includes(item.status)).length;

  return (
    <div className='space-y-6'>
      <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <div className='text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700'>{isChinese ? '结果报告' : 'Reports'}</div>
            <h1 className='mt-1 text-2xl font-bold text-slate-950'>
              {isChinese ? `${data.project?.name || '项目'} - 周期复盘` : `${data.project?.name || 'Project'} - Reporting`}
            </h1>
            <p className='mt-1 text-sm text-slate-600'>
              {isChinese
                ? '任务进展、复查结果和渠道建议可直接从这里查到，并能一键跳转到对应执行页。'
                : 'Track task progress, recheck outcomes, and channel recommendations with drill-through actions.'}
            </p>
          </div>
          <Link href={`/${locale}/distribution${projectQuery}`} className='text-xs font-bold text-cyan-700 hover:text-cyan-800'>
            {isChinese ? '回到工作台' : 'Back to workspace'}
          </Link>
        </div>
      </section>

      <section className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <div className='rounded-xl border border-slate-200 bg-white p-4'>
          <div className='flex items-center gap-2 text-xs text-slate-500'>
            <BarChart3 className='h-4 w-4' />
            {isChinese ? '任务总量' : 'Total tasks'}
          </div>
          <div className='mt-2 text-2xl font-bold text-slate-900'>{totalTasks}</div>
          <div className='mt-1 text-xs text-slate-500'>{isChinese ? '含待处理和历史任务' : 'Including pending and historical tasks'}</div>
        </div>
        <div className='rounded-xl border border-slate-200 bg-white p-4'>
          <div className='flex items-center gap-2 text-xs text-slate-500'>
            <Loader className='h-4 w-4' />
            {isChinese ? '已提交' : 'Submitted'}
          </div>
          <div className='mt-2 text-2xl font-bold text-slate-900'>{data.metrics.submitted + data.metrics.waitingReview + data.metrics.followUp + data.metrics.live}</div>
          <div className='mt-1 text-xs text-slate-500'>{isChinese ? '待审核 / 待复查 / 在线' : 'Submitted / reviewing / live'}</div>
        </div>
        <div className='rounded-xl border border-slate-200 bg-white p-4'>
          <div className='flex items-center gap-2 text-xs text-slate-500'>
            <CircleAlert className='h-4 w-4' />
            {isChinese ? '阻塞' : 'Blocked'}
          </div>
          <div className='mt-2 text-2xl font-bold text-rose-700'>{blockedCount || blockedTasks}</div>
          <div className='mt-1 text-xs text-slate-500'>{isChinese ? '含链接异常与执行阻塞' : 'Includes execution and link blockers'}</div>
        </div>
        <div className='rounded-xl border border-slate-200 bg-white p-4'>
          <div className='flex items-center gap-2 text-xs text-slate-500'>
            <CheckCircle2 className='h-4 w-4' />
            {isChinese ? '已完成' : 'Done'}
          </div>
          <div className='mt-2 text-2xl font-bold text-emerald-700'>{doneTasks}</div>
          <div className='mt-1 text-xs text-slate-500'>{isChinese ? '按当前项目任务状态统计' : 'Based on task status in this project'}</div>
        </div>
      </section>

      <section className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='text-xs font-bold text-slate-900'>{localize(locale, '30天留存', '30d retention')}</div>
          <div className='mt-2 text-2xl font-bold text-slate-900'>
            {formatRate(retention?.retention30dRate || 0)}
          </div>
          <div className='mt-1 text-xs text-slate-600'>
            {isChinese
              ? `上线后已持续留存 ${retention?.retained30d || 0}/${retention?.liveTasks || 0} 条`
              : `Retained ${retention?.retained30d || 0}/${retention?.liveTasks || 0} after 30 days`}
          </div>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='text-xs font-bold text-slate-900'>{localize(locale, '90天留存', '90d retention')}</div>
          <div className='mt-2 text-2xl font-bold text-slate-900'>{formatRate(retention?.retention90dRate || 0)}</div>
          <div className='mt-1 text-xs text-slate-600'>
            {isChinese
              ? `上线后已持续留存 ${retention?.retained90d || 0}/${retention?.liveTasks || 0} 条`
              : `Retained ${retention?.retained90d || 0}/${retention?.liveTasks || 0} after 90 days`}
          </div>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='text-xs font-bold text-slate-900'>{localize(locale, '指标检查', 'Live checks')}</div>
          <div className='mt-2 text-2xl font-bold text-slate-900'>{liveChecksCount}</div>
          <div className='mt-1 text-xs text-slate-600'>
            {isChinese ? `正常项 ${reviewLinkStatus.length ? liveChecksCount - reviewLinkStatus.length : liveChecksCount}` : `Healthy ${reviewLinkStatus.length ? liveChecksCount - reviewLinkStatus.length : liveChecksCount}`}
          </div>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='text-xs font-bold text-slate-900'>{localize(locale, '监控窗口', 'Monitoring window')}</div>
          <div className='mt-2 text-2xl font-bold text-slate-900'>{monitorTasks}</div>
          <div className='mt-1 text-xs text-slate-600'>{isChinese ? '当前待复查/上线中' : 'Current pending follow-ups and live tasks'}</div>
        </div>
      </section>

      <section className='grid gap-3 lg:grid-cols-2'>
        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <h2 className='text-sm font-bold text-slate-900'>
            {isChinese ? '归因与交易（30天内）' : 'Attribution signals (30d window)'}
          </h2>
          <div className='mt-4 grid gap-2 sm:grid-cols-2'>
            <div className='rounded-xl bg-slate-50 p-3 text-sm'>
              <div className='text-xs text-slate-500'>{isChinese ? '访问' : 'Visits'}</div>
              <div className='mt-1 font-bold'>{data.metrics.attribution.visits}</div>
            </div>
            <div className='rounded-xl bg-slate-50 p-3 text-sm'>
              <div className='text-xs text-slate-500'>{isChinese ? '注册' : 'Signups'}</div>
              <div className='mt-1 font-bold'>{data.metrics.attribution.signups}</div>
            </div>
            <div className='rounded-xl bg-slate-50 p-3 text-sm'>
              <div className='text-xs text-slate-500'>{isChinese ? '提交' : 'Submissions'}</div>
              <div className='mt-1 font-bold'>{data.metrics.attribution.submissions}</div>
            </div>
            <div className='rounded-xl bg-slate-50 p-3 text-sm'>
              <div className='text-xs text-slate-500'>{isChinese ? '付款' : 'Payments'}</div>
              <div className='mt-1 font-bold'>{data.metrics.attribution.payments}</div>
            </div>
          </div>
          <div className='mt-3 flex flex-wrap gap-2'>
            <Link
              href={`/${locale}/distribution/tasks${projectQuery ? `${projectQuery}&status=submitted` : '?status=submitted'}`}
              className='inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700'
            >
              {isChinese ? '查看提交任务' : 'View submitted tasks'}
              <ArrowRight className='h-3.5 w-3.5' />
            </Link>
            <Link
              href={`/${locale}/distribution/tasks${projectQuery ? `${projectQuery}&status=waiting_review` : '?status=waiting_review'}`}
              className='inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700'
            >
              {isChinese ? '查看待复查' : 'View waiting-review'}
              <ArrowRight className='h-3.5 w-3.5' />
            </Link>
          </div>
        </div>

        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <h2 className='text-sm font-bold text-slate-900'>{isChinese ? '渠道反馈与建议' : 'Channel feedback'}</h2>
          <div className='mt-4 space-y-3'>
            {(report?.channelFeedback || [])
              .slice(0, 6)
              .map((item) => (
                <div key={item.channelType} className='rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm'>
                  <div className='flex items-start justify-between gap-2'>
                    <div>
                      <div className='font-semibold text-slate-900'>{item.channelName}</div>
                      <div className='text-xs text-slate-600'>
                        {isChinese ? '活跃' : 'Live'} {item.liveCount} / {isChinese ? '问题' : 'Issues'} {item.issueCount}
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        item.scoreAdjustment >= 8
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.scoreAdjustment >= 0
                            ? 'bg-cyan-100 text-cyan-800'
                            : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {item.scoreAdjustment >= 0 ? `+${item.scoreAdjustment}` : `${item.scoreAdjustment}`}
                    </span>
                  </div>
                  <div className='mt-2 text-xs text-slate-700'>{item.recommendation}</div>
                </div>
              ))}
            {(report?.channelFeedback?.length || 0) === 0 ? (
              <div className='rounded-xl bg-slate-50 p-3 text-xs text-slate-500'>
                {isChinese ? '暂无可用渠道反馈。可先完成至少 1 个在线任务后生成。' : 'No channel feedback yet. Publish at least 1 task to generate channel-level signals.'}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className='grid gap-3 xl:grid-cols-2'>
        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <h2 className='text-sm font-bold text-slate-900'>{isChinese ? '阻塞原因Top列表' : 'Top blockers'}</h2>
          <div className='mt-4 space-y-2'>
            {(report?.outcomeLearning || []).slice(0, 8).map((item) => (
              <div key={item.label} className='flex items-start justify-between gap-2 rounded-xl bg-slate-50 p-3 text-sm'>
                <span className='text-slate-700'>{formatText(item.label)}</span>
                <span className='rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700'>{item.count}</span>
              </div>
            ))}
            {(report?.outcomeLearning?.length || 0) === 0 ? (
              <div className='rounded-xl bg-slate-50 p-3 text-xs text-slate-500'>
                {isChinese ? '暂未记录明显阻塞原因。' : 'No recurring blocker reason captured yet.'}
              </div>
            ) : null}
          </div>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <h2 className='text-sm font-bold text-slate-900'>{isChinese ? '任务与复查钻取' : 'Task drill-through'}</h2>
          <div className='mt-4 space-y-2 text-sm'>
            <Link
              href={`/${locale}/distribution/monitoring${projectQuery}`}
              className='flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 font-semibold text-slate-900 hover:border-cyan-300 hover:bg-cyan-50'
            >
              {isChinese ? '进入监控复查' : 'Open monitoring'}
              <ArrowRight className='h-4 w-4' />
            </Link>
            <Link
              href={`/${locale}/distribution/tasks${projectQuery}`}
              className='flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 font-semibold text-slate-900 hover:border-cyan-300 hover:bg-cyan-50'
            >
              {isChinese ? '进入执行任务' : 'Open execution queue'}
              <ArrowRight className='h-4 w-4' />
            </Link>
            <Link
              href={`/${locale}/distribution/opportunities${projectQuery}`}
              className='flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 font-semibold text-slate-900 hover:border-cyan-300 hover:bg-cyan-50'
            >
              {isChinese ? '补充更多目标站' : 'Add more opportunities'}
              <ArrowRight className='h-4 w-4' />
            </Link>
            {report?.liveChecks && report.liveChecks.length > 0 ? (
              <div className='rounded-xl border border-slate-200 bg-cyan-50 p-3'>
                <div className='text-xs font-bold text-cyan-900'>{isChinese ? '最近上线URL示例' : 'Recent live URL sample'}</div>
                <div className='mt-1 text-xs text-cyan-900'>
                  {isChinese ? '最近可复查链接' : 'Latest URLs to recheck'}
                  {' : '}
                  {formatText(report.liveChecks[0]?.url)}
                </div>
                <div className='mt-2 flex flex-wrap gap-2'>
                  <Link
                    href={report.liveChecks[0]?.url || '#'}
                    className='inline-flex items-center gap-1 rounded-lg bg-cyan-700 px-3 py-2 text-xs font-bold text-white'
                    target='_blank'
                    rel='noreferrer'
                  >
                    <Globe className='h-3.5 w-3.5' />
                    {isChinese ? '打开链接' : 'Open URL'}
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <h2 className='text-sm font-bold text-slate-900'>{isChinese ? '链路健康复核（可钻取）' : 'Link health sample checks'}</h2>
        <div className='mt-4 space-y-3'>
          {(report?.liveChecks || []).slice(0, 6).map((item) => (
            <div key={`${item.taskId}-${item.url}`} className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
              <div className='flex flex-wrap items-start justify-between gap-2'>
                <div>
                  <div className='text-sm font-semibold text-slate-900'>{item.channelName}</div>
                  <div className='mt-1 text-xs text-slate-600'>{formatDate(item.checkedAt)} · {isChinese ? '检测状态' : 'Check state'}: {item.reachable ? 'ok' : item.note}</div>
                  <div className='mt-1 text-xs text-slate-600 break-all'>{formatText(item.url)}</div>
                </div>
                <div className='inline-flex items-center gap-1'>
                  {item.noindex ? (
                    <span className='rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-800'>
                      <TrendingDown className='mr-1 inline h-3.5 w-3.5' />
                      {isChinese ? '可能屏蔽' : 'Noindex'}
                    </span>
                  ) : null}
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      item.reachable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {item.statusCode || 'ERR'}
                  </span>
                </div>
              </div>
              <div className='mt-3'>
                <Link
                  href={`/${locale}/distribution/tasks/${item.taskId}${projectQuery ? `${projectQuery}&` : '?'}focusTask=${encodeURIComponent(item.taskId)}`}
                  className='inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white'
                >
                  {isChinese ? '记录复查结果' : 'Update result'}
                  <ArrowRight className='h-3.5 w-3.5' />
                </Link>
              </div>
            </div>
          ))}
          {(report?.liveChecks || []).length === 0 ? (
            <div className='rounded-xl bg-slate-50 p-3 text-sm text-slate-500'>
              {isChinese ? '无可复查样本。发布任务后会自动补充。' : 'No live samples yet. Samples are populated when tasks are published.'}
            </div>
          ) : null}
        </div>
      </section>

      <section className='rounded-2xl border border-slate-200 bg-cyan-50 p-4 text-sm text-cyan-900'>
        <div className='flex items-center gap-2 font-bold'>
          <Star className='h-4 w-4' />
          {isChinese ? '本期执行建议' : 'Suggested next action'}
        </div>
        <div className='mt-2 leading-6'>
          {(report?.channelFeedback || []).some((item) => item.scoreAdjustment < 0)
            ? isChinese
              ? '有部分渠道质量波动，建议先清理阻塞项，再将预算优先给最近问题少的渠道。'
              : 'Some channels show unstable quality; clear blockers first, then prioritize channels with fewer current issues.'
            : isChinese
              ? '建议维持当前节奏，每天完成 1-2 项可提交任务，补齐跟进复查记录。'
              : 'Maintain current rhythm and complete 1–2 ready tasks per day, then keep follow-up records consistent.'}
        </div>
      </section>
    </div>
  );
}
