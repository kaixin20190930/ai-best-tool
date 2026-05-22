import { getTranslations } from 'next-intl/server';
import {
  getSiteMetrics,
  getTopTools,
  getTopSearches,
  getTrafficSources,
} from '@/lib/services/admin/analytics';
import { TrendingUp, Search, Globe, BarChart3 } from 'lucide-react';
import {
  getOperationalStats,
  getSubmissionFunnelStats,
} from '@/app/actions/admin/tools';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'admin' });

  return {
    title: 'Analytics',
  };
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams?: {
    range?: string;
  };
}) {
  const range =
    searchParams?.range === '7d' || searchParams?.range === '30d'
      ? searchParams.range
      : 'all';
  const rangeLabel =
    range === '7d' ? 'Last 7d' : range === '30d' ? 'Last 30d' : 'All time';
  const metrics = await getSiteMetrics();
  const operationalStats = await getOperationalStats(range);
  const funnel = await getSubmissionFunnelStats(range);
  const topToolsByViews = await getTopTools('views', 10);
  const topToolsByRating = await getTopTools('rating', 10);
  const topSearches = await getTopSearches(10);
  const trafficSources = await getTrafficSources(10);
  const unresolvedOverdueCount = Math.max(
    operationalStats.overduePendingSubmissions - operationalStats.followedUpOverdueSubmissions,
    0
  );
  const overdueFollowUpRate =
    operationalStats.overduePendingSubmissions > 0
      ? Math.round(
          (operationalStats.followedUpOverdueSubmissions /
            operationalStats.overduePendingSubmissions) *
            100
        )
      : 100;

  const getTitle = (tool: any) => {
    if (typeof tool.title === 'string') return tool.title;
    if (typeof tool.title === 'object' && tool.title !== null) {
      return tool.title.en || tool.title.zh || Object.values(tool.title)[0] || tool.name;
    }
    return tool.name;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="mt-2 text-slate-600">
          Detailed insights into your site's performance and user behavior
        </p>
      </div>

      {/* Overview Metrics */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="theme-surface rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Views</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {metrics.totalViews.toLocaleString()}
              </p>
            </div>
            <div className="rounded-full bg-cyan-50 p-3">
              <BarChart3 className="h-6 w-6 text-cyan-700" />
            </div>
          </div>
        </div>

        <div className="theme-surface rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Unique Visitors</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {metrics.uniqueVisitors.toLocaleString()}
              </p>
            </div>
            <div className="rounded-full bg-emerald-50 p-3">
              <Globe className="h-6 w-6 text-emerald-700" />
            </div>
          </div>
        </div>

        <div className="theme-surface rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Tools</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {metrics.totalTools}
              </p>
            </div>
            <div className="rounded-full bg-violet-50 p-3">
              <TrendingUp className="h-6 w-6 text-violet-700" />
            </div>
          </div>
        </div>

        <div className="theme-surface rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Ratings</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {metrics.totalRatings}
              </p>
            </div>
            <div className="rounded-full bg-amber-50 p-3">
              <Search className="h-6 w-6 text-amber-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Submission Funnel */}
      <div className="mb-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Developer Submission Funnel</h2>
            <p className="mt-1 text-sm text-slate-600">
              Conversion and review efficiency for user-submitted tools.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: '7d', label: 'Last 7d' },
              { key: '30d', label: 'Last 30d' },
              { key: 'all', label: 'All time' },
            ].map((item) => (
              <Link
                key={item.key}
                href={item.key === 'all' ? '/admin/analytics' : `/admin/analytics?range=${item.key}`}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  range === item.key
                    ? 'bg-cyan-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
          <div className="theme-surface rounded-lg border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Total Submitted</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{funnel.totalSubmitted}</p>
          </div>
          <div className="theme-surface rounded-lg border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Pending</p>
            <p className="mt-2 text-3xl font-semibold text-amber-600">{funnel.pending}</p>
          </div>
          <div className="theme-surface rounded-lg border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Published</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-600">{funnel.published}</p>
          </div>
          <div className="theme-surface rounded-lg border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Rejected</p>
            <p className="mt-2 text-3xl font-semibold text-red-600">{funnel.rejected}</p>
          </div>
          <div className="theme-surface rounded-lg border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Publish Rate</p>
            <p className="mt-2 text-3xl font-semibold text-cyan-700">{funnel.publishedRate}%</p>
          </div>
          <div className="theme-surface rounded-lg border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Avg Review Time</p>
            <p className="mt-2 text-3xl font-semibold text-violet-700">
              {funnel.avgReviewHours}h
            </p>
          </div>
        </div>
      </div>

      {/* Moderation SLA */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Moderation SLA</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {rangeLabel}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Pending developer submissions and overdue follow-up coverage.
            </p>
          </div>
          <Link
            href="/admin/tools?status=pending&overdue=1&followedUp=0"
            className="text-sm font-medium text-cyan-700 hover:text-cyan-800"
          >
            Open unresolved overdue queue
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="theme-surface rounded-lg border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Pending Submissions</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {operationalStats.pendingDeveloperSubmissions}
            </p>
          </div>
          <div className="theme-surface rounded-lg border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Overdue (&gt;48h)</p>
            <p className="mt-2 text-3xl font-semibold text-red-600">
              {operationalStats.overduePendingSubmissions}
            </p>
          </div>
          <div className="theme-surface rounded-lg border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Unresolved Overdue</p>
            <p className="mt-2 text-3xl font-semibold text-amber-600">
              {unresolvedOverdueCount}
            </p>
          </div>
          <div className="theme-surface rounded-lg border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Follow-up Rate</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-600">
              {overdueFollowUpRate}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Tools by Views */}
        <div className="theme-surface rounded-lg border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Top Tools by Views</h2>
          <div className="mt-4 space-y-3">
            {topToolsByViews.map((tool, index) => (
              <div
                key={tool.id}
                className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-50 text-sm font-medium text-cyan-700">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">{getTitle(tool)}</p>
                    <p className="text-sm text-slate-500">{tool.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900">
                    {tool.views.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">
                    {tool.clicks.toLocaleString()} clicks
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Tools by Rating */}
        <div className="theme-surface rounded-lg border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Top Rated Tools</h2>
          <div className="mt-4 space-y-3">
            {topToolsByRating.map((tool, index) => (
              <div
                key={tool.id}
                className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-sm font-medium text-amber-700">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">{getTitle(tool)}</p>
                    <p className="text-sm text-slate-500">{tool.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900">⭐ {tool.rating.toFixed(1)}</p>
                  <p className="text-xs text-slate-500">
                    {tool.ratingCount} ratings
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Searches */}
        <div className="theme-surface rounded-lg border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Top Search Queries</h2>
          <div className="mt-4 space-y-3">
            {topSearches.length > 0 ? (
              topSearches.map((search, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-sm font-medium text-emerald-700">
                      {index + 1}
                    </span>
                    <p className="font-medium text-slate-900">{search.query}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">{search.count}</p>
                    <p className="text-xs text-slate-500">
                      {search.results} results
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No search data available yet</p>
            )}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="theme-surface rounded-lg border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Traffic Sources</h2>
          <div className="mt-4 space-y-3">
            {trafficSources.length > 0 ? (
              trafficSources.map((source, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-50 text-sm font-medium text-violet-700">
                      {index + 1}
                    </span>
                    <p className="font-medium text-slate-900">{source.source}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">
                      {source.visits.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">
                      {source.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No traffic data available yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
