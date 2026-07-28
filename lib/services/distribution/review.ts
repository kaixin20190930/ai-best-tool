type TaskRow = {
  id: string;
  project_id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  channel_id: string;
  channel_name?: string;
  channel_type?: string;
  project_name?: string;
  project_website?: string | null;
  task_created_at?: string | null;
  task_updated_at?: string | null;
  instructions?: string | null;
  results: Array<{
    id?: string;
    live_url: string | null;
    target_url: string | null;
    link_status: string;
    checked_at: string | null;
    created_at: string | null;
    notes: string | null;
  }>;
};

export interface DistributionLiveUrlCheck {
  taskId: string;
  projectId: string;
  projectName: string;
  taskTitle: string;
  channelName: string;
  url: string;
  reachable: boolean;
  statusCode: number | null;
  finalUrl: string | null;
  contentType: string | null;
  title: string | null;
  canonicalUrl: string | null;
  noindex: boolean;
  checkedAt: string;
  note: string | null;
}

export interface DistributionAttributeCheck {
  taskId: string;
  projectId: string;
  channelName: string;
  url: string;
  hasUtmSource: boolean;
  hasUtmMedium: boolean;
  hasUtmCampaign: boolean;
  hasDistributionLinkId: boolean;
  pointsToProjectDomain: boolean;
  note: string;
}

export interface DistributionRetentionMetrics {
  liveTasks: number;
  retained30d: number;
  retained90d: number;
  retention30dRate: number;
  retention90dRate: number;
  firstLiveChecks: number;
}

export interface DistributionOutcomeLearningItem {
  label: string;
  count: number;
}

export interface DistributionChannelFeedback {
  channelType: string;
  channelName: string;
  liveCount: number;
  issueCount: number;
  blockedCount: number;
  scoreAdjustment: number;
  recommendation: string;
}

export interface DistributionReviewReport {
  liveChecks: DistributionLiveUrlCheck[];
  attributeChecks: DistributionAttributeCheck[];
  retention: DistributionRetentionMetrics;
  outcomeLearning: DistributionOutcomeLearningItem[];
  channelFeedback: DistributionChannelFeedback[];
  summary: {
    liveCount: number;
    issueCount: number;
    blockedCount: number;
    checkedCount: number;
  };
  markdown: string;
  csv: string;
}

function getLatestResult(task: TaskRow) {
  return [...(task.results || [])].sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))[0] || null;
}

function safeUrl(value: string | null): URL | null {
  if (!value) return null;
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function countBy<T extends string>(items: T[]): Array<{ label: string; count: number }> {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item, (counts.get(item) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

async function fetchUrlSnapshot(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; AI Best Tool Distribution Review/1.0)',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    const contentType = response.headers.get('content-type');
    const html = contentType?.includes('text/html') ? await response.text() : '';
    const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || null;
    const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] || null;
    const noindex = /<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html) || /<meta[^>]+content=["'][^"']*noindex/i.test(html) && /name=["']robots["']/i.test(html);
    return {
      reachable: response.ok,
      statusCode: response.status,
      finalUrl: response.url || url,
      contentType,
      title,
      canonicalUrl: canonical,
      noindex,
    };
  } catch (error) {
    return {
      reachable: false,
      statusCode: null,
      finalUrl: null,
      contentType: null,
      title: null,
      canonicalUrl: null,
      noindex: false,
      error: error instanceof Error ? error.message : 'unknown error',
    };
  } finally {
    clearTimeout(timeout);
  }
}

function buildMarkdown(report: DistributionReviewReport): string {
  const lines = [
    '# Distribution weekly review',
    '',
    `- Live checks: ${report.summary.liveCount}`,
    `- Issues: ${report.summary.issueCount}`,
    `- Blocked: ${report.summary.blockedCount}`,
    `- Checked URLs: ${report.summary.checkedCount}`,
    `- 30d retention: ${report.retention.retention30dRate}%`,
    `- 90d retention: ${report.retention.retention90dRate}%`,
    '',
    '## Channel feedback',
    ...report.channelFeedback.map((item) => `- ${item.channelName}: ${item.scoreAdjustment >= 0 ? '+' : ''}${item.scoreAdjustment} (${item.recommendation})`),
    '',
    '## Top obstacles',
    ...report.outcomeLearning.map((item) => `- ${item.label}: ${item.count}`),
  ];
  return lines.join('\n');
}

function buildCsv(report: DistributionReviewReport): string {
  const rows = [
    ['section', 'label', 'value'],
    ['summary', 'liveCount', String(report.summary.liveCount)],
    ['summary', 'issueCount', String(report.summary.issueCount)],
    ['summary', 'blockedCount', String(report.summary.blockedCount)],
    ['summary', 'checkedCount', String(report.summary.checkedCount)],
    ['retention', 'retained30dRate', String(report.retention.retention30dRate)],
    ['retention', 'retained90dRate', String(report.retention.retention90dRate)],
    ...report.channelFeedback.map((item) => ['channel', item.channelName, String(item.scoreAdjustment)]),
  ];
  return rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
}

export async function buildDistributionReviewReport(tasks: TaskRow[], projectDomain?: string | null): Promise<DistributionReviewReport> {
  const latestResults = tasks
    .map((task) => {
      const latest = getLatestResult(task);
      return latest
        ? {
            task,
            latest,
          }
        : null;
    })
    .filter(Boolean) as Array<{ task: TaskRow; latest: TaskRow['results'][number] }>;

  const liveCandidates = latestResults.filter(({ latest }) => Boolean(latest.live_url)).slice(0, 12);
  const liveChecks = await Promise.all(
    liveCandidates.map(async ({ task, latest }) => {
      const url = latest.live_url || latest.target_url || '';
      const snapshot = await fetchUrlSnapshot(url);
      const snapshotError = 'error' in snapshot ? String((snapshot as { error?: string }).error || 'unknown error') : null;
      return {
        taskId: task.id,
        projectId: task.project_id,
        projectName: task.project_name || 'Unknown project',
        taskTitle: task.title,
        channelName: task.channel_name || 'Unknown channel',
        url,
        reachable: snapshot.reachable,
        statusCode: snapshot.statusCode,
        finalUrl: snapshot.finalUrl,
        contentType: snapshot.contentType,
        title: snapshot.title,
        canonicalUrl: snapshot.canonicalUrl,
        noindex: snapshot.noindex,
        checkedAt: new Date().toISOString(),
        note: snapshot.reachable ? (snapshot.noindex ? 'Page loads but is set to noindex.' : 'Page loads successfully.') : `Fetch failed${snapshotError ? `: ${snapshotError}` : ''}.`,
      };
    }),
  );

  const attributeChecks: DistributionAttributeCheck[] = latestResults
    .map(({ task, latest }) => {
      const url = latest.live_url || latest.target_url || '';
      const parsed = safeUrl(url);
      const source = parsed?.searchParams.get('utm_source');
      const medium = parsed?.searchParams.get('utm_medium');
      const campaign = parsed?.searchParams.get('utm_campaign');
      const distId = parsed?.searchParams.get('abt_dist_link');
      const projectHost = safeUrl(task.project_website || null)?.hostname?.replace(/^www\./i, '') || null;
      const urlHost = parsed?.hostname?.replace(/^www\./i, '') || null;
      const pointsToProjectDomain = Boolean(projectHost && urlHost && projectHost === urlHost);
      return {
        taskId: task.id,
        projectId: task.project_id,
        channelName: task.channel_name || 'Unknown channel',
        url,
        hasUtmSource: Boolean(source),
        hasUtmMedium: Boolean(medium),
        hasUtmCampaign: Boolean(campaign),
        hasDistributionLinkId: Boolean(distId),
        pointsToProjectDomain,
        note: [source, medium, campaign, distId].filter(Boolean).length >= 3 ? 'Tracked link looks usable.' : 'Tracked link is missing one or more tracking parameters.',
      };
    })
    .slice(0, 20);

  const firstLiveByTask = new Map<string, { firstAt: string; latestAt: string; stillLive: boolean }>();
  for (const task of tasks) {
    const liveResults = [...(task.results || [])].filter((item) => item.link_status === 'live' || Boolean(item.live_url));
    if (!liveResults.length) continue;
    const firstAt = [...liveResults].sort((a, b) => String(a.created_at || '').localeCompare(String(b.created_at || '')))[0]?.created_at || null;
    const latest = [...liveResults].sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))[0] || null;
    if (!firstAt || !latest) continue;
    firstLiveByTask.set(task.id, {
      firstAt,
      latestAt: latest.created_at || firstAt,
      stillLive: latest.link_status === 'live',
    });
  }

  const liveTasks = firstLiveByTask.size;
  let retained30d = 0;
  let retained90d = 0;
  for (const item of Array.from(firstLiveByTask.values())) {
    const first = new Date(item.firstAt).getTime();
    const latest = new Date(item.latestAt).getTime();
    const ageDays = Math.floor((Date.now() - first) / (1000 * 60 * 60 * 24));
    if (ageDays >= 30 && item.stillLive && latest >= first) retained30d += 1;
    if (ageDays >= 90 && item.stillLive && latest >= first) retained90d += 1;
  }

  const blockedReasons = countBy(
    tasks.flatMap((task) => {
      const latest = getLatestResult(task);
      const reasons: string[] = [];
      if (task.status === 'blocked') reasons.push(task.instructions || 'blocked');
      if (latest?.link_status === 'rejected') reasons.push('rejected');
      if (latest?.link_status === 'removed') reasons.push('removed');
      if (latest?.link_status === 'nofollow') reasons.push('nofollow');
      if (latest?.notes) reasons.push(latest.notes.slice(0, 120));
      return reasons;
    }),
  ).slice(0, 8);

  const channelStats = new Map<string, { channelName: string; liveCount: number; issueCount: number; blockedCount: number }>();
  for (const task of tasks) {
    const latest = getLatestResult(task);
    const key = task.channel_type || 'other';
    const current = channelStats.get(key) || { channelName: task.channel_name || key, liveCount: 0, issueCount: 0, blockedCount: 0 };
    if (latest?.link_status === 'live') current.liveCount += 1;
    if (['nofollow', 'rejected', 'removed'].includes(latest?.link_status || '')) current.issueCount += 1;
    if (task.status === 'blocked') current.blockedCount += 1;
    channelStats.set(key, current);
  }

  const channelFeedback: DistributionChannelFeedback[] = Array.from(channelStats.entries())
    .map(([channelType, item]) => {
      const scoreAdjustment = Math.max(-15, Math.min(15, item.liveCount * 4 - item.issueCount * 3 - item.blockedCount * 2));
      const recommendation =
        scoreAdjustment >= 8
          ? 'Prioritize this channel more often.'
          : scoreAdjustment >= 0
            ? 'Keep it in the daily queue.'
            : 'Use it selectively and verify requirements first.';
      return { channelType, channelName: item.channelName, liveCount: item.liveCount, issueCount: item.issueCount, blockedCount: item.blockedCount, scoreAdjustment, recommendation };
    })
    .sort((a, b) => b.scoreAdjustment - a.scoreAdjustment || a.channelName.localeCompare(b.channelName));

  const summary = {
    liveCount: liveChecks.filter((item) => item.reachable).length,
    issueCount: liveChecks.filter((item) => !item.reachable || item.noindex).length,
    blockedCount: blockedReasons.reduce((sum, item) => sum + item.count, 0),
    checkedCount: liveChecks.length,
  };

  const retention: DistributionRetentionMetrics = {
    liveTasks,
    retained30d,
    retained90d,
    retention30dRate: liveTasks ? Math.round((retained30d / liveTasks) * 100) : 0,
    retention90dRate: liveTasks ? Math.round((retained90d / liveTasks) * 100) : 0,
    firstLiveChecks: liveTasks,
  };

  const report: DistributionReviewReport = {
    liveChecks,
    attributeChecks,
    retention,
    outcomeLearning: blockedReasons,
    channelFeedback,
    summary,
    markdown: '',
    csv: '',
  };
  report.markdown = buildMarkdown(report);
  report.csv = buildCsv(report);
  return report;
}
