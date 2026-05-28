import Link from 'next/link';
import { ArrowUpRight, BarChart3, Globe, Layers3, Search, ShieldAlert, TrendingUp } from 'lucide-react';

import {
  getSiteMetrics,
  getToolComplianceIssues,
  getTopCategories,
  getTopFeedbackSignals,
  getTopSearches,
  getTopTools,
  getTrafficSources,
} from '@/lib/services/admin/analytics';
import { getOperationalStats, getSubmissionFunnelStats } from '@/app/actions/admin/tools';

export async function generateMetadata() {
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
  const range = searchParams?.range === '7d' || searchParams?.range === '30d' ? searchParams.range : 'all';
  const rangeLabelMap = {
    all: 'All time',
    '7d': 'Last 7d',
    '30d': 'Last 30d',
  } as const;
  const rangeLabel = rangeLabelMap[range as keyof typeof rangeLabelMap];
  const metrics = await getSiteMetrics();
  const operationalStats = await getOperationalStats(range);
  const funnel = await getSubmissionFunnelStats(range);
  const topToolsByViews = await getTopTools('views', 10);
  const topToolsByRating = await getTopTools('rating', 10);
  const topCategories = await getTopCategories(8);
  const complianceIssues = await getToolComplianceIssues(8);
  const topFeedbackSignals = await getTopFeedbackSignals(10);
  const topSearches = await getTopSearches(10);
  const trafficSources = await getTrafficSources(10);
  const unresolvedOverdueCount = Math.max(
    operationalStats.overduePendingSubmissions - operationalStats.followedUpOverdueSubmissions,
    0,
  );
  const overdueFollowUpRate =
    operationalStats.overduePendingSubmissions > 0
      ? Math.round((operationalStats.followedUpOverdueSubmissions / operationalStats.overduePendingSubmissions) * 100)
      : 100;

  const getTitle = (tool: any) => {
    if (typeof tool.title === 'string') return tool.title;
    if (typeof tool.title === 'object' && tool.title !== null) {
      return tool.title.en || tool.title.zh || Object.values(tool.title)[0] || tool.name;
    }
    return tool.name;
  };

  const getFeedbackLabel = (type: string) => {
    if (type === 'helpful') return 'Helpful';
    if (type === 'needs_update') return 'Needs update';
    if (type === 'inaccurate') return 'Inaccurate';
    return type;
  };

  const getFeedbackDescription = (type: string) => {
    if (type === 'helpful') return 'Users found the listing useful';
    if (type === 'needs_update') return 'Users asked for fresher metadata';
    if (type === 'inaccurate') return 'Users reported incorrect information';
    return 'Unclassified feedback';
  };

  const getCategoryDisplayName = (category: (typeof topCategories)[number]) => {
    if (typeof category.name === 'object' && category.name !== null) {
      return category.name.en || category.name.zh || Object.values(category.name)[0] || category.slug;
    }
    return category.slug;
  };

  const getCategoryAction = (category: (typeof topCategories)[number]) => {
    if (category.toolCount <= 10 && category.opportunityScore >= 200) return 'Add 5-10 solid tools';
    if (category.views >= category.toolCount * 800) return 'Deepen supply with comparison pages';
    if (category.comments >= category.toolCount) return 'Collect more user feedback';
    return 'Backfill missing listings';
  };

  const focusCategories = topCategories.slice(0, 3);

  return (
    <div>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-slate-900'>Analytics</h1>
        <p className='mt-2 text-slate-600'>Detailed insights into your site performance and user behavior</p>
      </div>

      {/* Overview Metrics */}
      <div className='mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-slate-600'>Total Views</p>
              <p className='mt-2 text-3xl font-semibold text-slate-900'>{metrics.totalViews.toLocaleString()}</p>
            </div>
            <div className='rounded-full bg-cyan-50 p-3'>
              <BarChart3 className='h-6 w-6 text-cyan-700' />
            </div>
          </div>
        </div>

        <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-slate-600'>Unique Visitors</p>
              <p className='mt-2 text-3xl font-semibold text-slate-900'>{metrics.uniqueVisitors.toLocaleString()}</p>
            </div>
            <div className='rounded-full bg-emerald-50 p-3'>
              <Globe className='h-6 w-6 text-emerald-700' />
            </div>
          </div>
        </div>

        <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-slate-600'>Total Tools</p>
              <p className='mt-2 text-3xl font-semibold text-slate-900'>{metrics.totalTools}</p>
            </div>
            <div className='rounded-full bg-violet-50 p-3'>
              <TrendingUp className='h-6 w-6 text-violet-700' />
            </div>
          </div>
        </div>

        <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-slate-600'>Total Ratings</p>
              <p className='mt-2 text-3xl font-semibold text-slate-900'>{metrics.totalRatings}</p>
            </div>
            <div className='rounded-full bg-amber-50 p-3'>
              <Search className='h-6 w-6 text-amber-700' />
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Focus */}
      <div className='mb-8'>
        <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>Weekly Focus</h2>
            <p className='mt-1 text-sm text-slate-600'>
              The three categories that look most worth investing in this week based on engagement and supply gap.
            </p>
          </div>
          <div className='text-sm text-slate-500'>Updated from category opportunity metrics</div>
        </div>
        <div className='grid gap-4 md:grid-cols-3'>
          {focusCategories.map((category, index) => (
            <div key={category.id} className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <div className='text-xs font-medium uppercase tracking-wide text-slate-500'>Priority #{index + 1}</div>
                  <h3 className='mt-1 text-base font-semibold text-slate-900'>{getCategoryDisplayName(category)}</h3>
                  <p className='text-xs text-slate-500'>{category.slug}</p>
                </div>
                <span className='rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700'>
                  {category.opportunityScore}
                </span>
              </div>

              <div className='mt-4 space-y-2 text-sm text-slate-600'>
                <div className='flex items-center justify-between'>
                  <span>Tools</span>
                  <span className='font-medium text-slate-900'>{category.toolCount}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span>Views</span>
                  <span className='font-medium text-slate-900'>{category.views.toLocaleString()}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span>Comments</span>
                  <span className='font-medium text-slate-900'>{category.comments.toLocaleString()}</span>
                </div>
              </div>

              <div className='mt-4 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700'>
                {getCategoryAction(category)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Opportunity */}
      <div className='mb-8'>
        <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h2 className='flex items-center gap-2 text-lg font-semibold text-slate-900'>
              <Layers3 className='h-5 w-5 text-cyan-700' />
              Category Opportunity
            </h2>
            <p className='mt-1 text-sm text-slate-600'>
              Where traffic and community activity are already showing up, and where the directory still needs more
              supply.
            </p>
          </div>
          <Link
            href='/admin/tools?status=published'
            className='inline-flex items-center gap-1 text-sm font-medium text-cyan-700 hover:text-cyan-800'
          >
            Review published tools
            <ArrowUpRight className='h-4 w-4' />
          </Link>
        </div>
        <div className='overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm'>
          <table className='min-w-full divide-y divide-slate-200'>
            <thead className='bg-slate-50'>
              <tr>
                <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Category
                </th>
                <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Tools
                </th>
                <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Views
                </th>
                <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Clicks
                </th>
                <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Favorites
                </th>
                <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Comments
                </th>
                <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Opportunity
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 bg-white'>
              {topCategories.map((category, index) => (
                <tr key={category.id} className={index === 0 ? 'bg-cyan-50/30' : ''}>
                  <td className='px-4 py-4'>
                    <div className='flex items-center gap-3'>
                      <span className='flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700'>
                        {index + 1}
                      </span>
                      <div>
                        <div className='font-medium text-slate-900'>
                          {typeof category.name === 'object'
                            ? category.name.en || category.name.zh || Object.values(category.name)[0]
                            : category.slug}
                        </div>
                        <div className='text-xs text-slate-500'>{category.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className='px-4 py-4 text-right text-sm text-slate-700'>{category.toolCount}</td>
                  <td className='px-4 py-4 text-right text-sm text-slate-700'>{category.views.toLocaleString()}</td>
                  <td className='px-4 py-4 text-right text-sm text-slate-700'>{category.clicks.toLocaleString()}</td>
                  <td className='px-4 py-4 text-right text-sm text-slate-700'>{category.favorites.toLocaleString()}</td>
                  <td className='px-4 py-4 text-right text-sm text-slate-700'>{category.comments.toLocaleString()}</td>
                  <td className='px-4 py-4 text-right'>
                    <div className='inline-flex flex-col items-end gap-1'>
                      <span className='rounded-full bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-700'>
                        {category.opportunityScore}
                      </span>
                      <span className='text-xs text-slate-500'>
                        avg {category.averageRating ? category.averageRating.toFixed(1) : '0.0'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission Funnel */}
      <div className='mb-8'>
        <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>Developer Submission Funnel</h2>
            <p className='mt-1 text-sm text-slate-600'>Conversion and review efficiency for user-submitted tools.</p>
          </div>
          <div className='flex flex-wrap gap-2'>
            {[
              { key: '7d', label: 'Last 7d' },
              { key: '30d', label: 'Last 30d' },
              { key: 'all', label: 'All time' },
            ].map((item) => (
              <Link
                key={item.key}
                href={item.key === 'all' ? '/admin/analytics' : `/admin/analytics?range=${item.key}`}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  range === item.key ? 'bg-cyan-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-6'>
          <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Total Submitted</p>
            <p className='mt-2 text-3xl font-semibold text-slate-900'>{funnel.totalSubmitted}</p>
          </div>
          <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Pending</p>
            <p className='mt-2 text-3xl font-semibold text-amber-600'>{funnel.pending}</p>
          </div>
          <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Published</p>
            <p className='mt-2 text-3xl font-semibold text-emerald-600'>{funnel.published}</p>
          </div>
          <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Rejected</p>
            <p className='mt-2 text-3xl font-semibold text-red-600'>{funnel.rejected}</p>
          </div>
          <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Publish Rate</p>
            <p className='mt-2 text-3xl font-semibold text-cyan-700'>{funnel.publishedRate}%</p>
          </div>
          <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Avg Review Time</p>
            <p className='mt-2 text-3xl font-semibold text-violet-700'>{funnel.avgReviewHours}h</p>
          </div>
        </div>
      </div>

      {/* Moderation SLA */}
      <div className='mb-8'>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <div className='flex items-center gap-2'>
              <h2 className='text-lg font-semibold text-slate-900'>Moderation SLA</h2>
              <span className='rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600'>
                {rangeLabel}
              </span>
            </div>
            <p className='mt-1 text-sm text-slate-600'>Pending developer submissions and overdue follow-up coverage.</p>
          </div>
          <Link
            href='/admin/tools?status=pending&overdue=1&followedUp=0'
            className='text-sm font-medium text-cyan-700 hover:text-cyan-800'
          >
            Open unresolved overdue queue
          </Link>
        </div>
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Pending Submissions</p>
            <p className='mt-2 text-3xl font-semibold text-slate-900'>{operationalStats.pendingDeveloperSubmissions}</p>
          </div>
          <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Overdue (&gt;48h)</p>
            <p className='mt-2 text-3xl font-semibold text-red-600'>{operationalStats.overduePendingSubmissions}</p>
          </div>
          <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Unresolved Overdue</p>
            <p className='mt-2 text-3xl font-semibold text-amber-600'>{unresolvedOverdueCount}</p>
          </div>
          <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Follow-up Rate</p>
            <p className='mt-2 text-3xl font-semibold text-emerald-600'>{overdueFollowUpRate}%</p>
          </div>
        </div>
      </div>

      {/* Compliance Audit */}
      <div className='mb-8'>
        <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>Collection Compliance Audit</h2>
            <p className='mt-1 text-sm text-slate-600'>
              Published tools that still miss one or more minimum intake requirements.
            </p>
          </div>
          <div className='flex items-center gap-2 text-sm text-slate-500'>
            <ShieldAlert className='h-4 w-4 text-amber-600' />
            {complianceIssues.length} issues surfaced
          </div>
        </div>
        <div className='overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm'>
          <table className='min-w-full divide-y divide-slate-200'>
            <thead className='bg-slate-50'>
              <tr>
                <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Tool
                </th>
                <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Category
                </th>
                <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Issues
                </th>
                <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Quality
                </th>
                <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Updated
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 bg-white'>
              {complianceIssues.map((tool, index) => (
                <tr key={tool.id} className={index === 0 ? 'bg-amber-50/30' : ''}>
                  <td className='px-4 py-4'>
                    <div>
                      <div className='font-medium text-slate-900'>
                        {typeof tool.title === 'object' && tool.title !== null
                          ? tool.title.en || tool.title.zh || Object.values(tool.title)[0] || tool.name
                          : tool.name}
                      </div>
                      <div className='text-xs text-slate-500'>{tool.name}</div>
                    </div>
                  </td>
                  <td className='px-4 py-4 text-sm text-slate-700'>
                    {tool.categoryName && typeof tool.categoryName === 'object'
                      ? tool.categoryName.en || tool.categoryName.zh || Object.values(tool.categoryName)[0]
                      : 'Uncategorized'}
                  </td>
                  <td className='px-4 py-4'>
                    <div className='flex flex-wrap gap-2'>
                      {tool.issues.map((issue) => (
                        <span key={issue} className='rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700'>
                          {issue}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className='px-4 py-4 text-right text-sm font-medium text-slate-900'>{tool.qualityScore}</td>
                  <td className='px-4 py-4 text-right text-sm text-slate-500'>
                    {new Date(tool.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {complianceIssues.length === 0 && (
            <div className='border-t border-slate-100 p-4 text-sm text-slate-500'>
              No published tools currently violate the intake checklist.
            </div>
          )}
        </div>
      </div>

      {/* Feedback Signals */}
      <div className='mb-8'>
        <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>Feedback Signals</h2>
            <p className='mt-1 text-sm text-slate-600'>
              Lightweight reactions from tool pages. This helps us see whether listings feel helpful, stale, or
              inaccurate.
            </p>
          </div>
          <div className='text-sm text-slate-500'>Collected from quick feedback buttons on tool detail pages</div>
        </div>
        <div className='overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm'>
          <table className='min-w-full divide-y divide-slate-200'>
            <thead className='bg-slate-50'>
              <tr>
                <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Feedback Type
                </th>
                <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Count
                </th>
                <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Share
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 bg-white'>
              {topFeedbackSignals.map((signal, index) => (
                <tr key={signal.type} className={index === 0 ? 'bg-cyan-50/30' : ''}>
                  <td className='px-4 py-4'>
                    <div className='font-medium text-slate-900'>{getFeedbackLabel(signal.type)}</div>
                    <div className='text-xs text-slate-500'>{getFeedbackDescription(signal.type)}</div>
                  </td>
                  <td className='px-4 py-4 text-right text-sm font-medium text-slate-900'>{signal.count}</td>
                  <td className='px-4 py-4 text-right text-sm text-slate-500'>{signal.percentage.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          {topFeedbackSignals.length === 0 && (
            <div className='border-t border-slate-100 p-4 text-sm text-slate-500'>
              No feedback captured yet. Add a few reactions on tool pages to start seeing signal here.
            </div>
          )}
        </div>
      </div>

      <div className='grid gap-6 lg:grid-cols-2'>
        {/* Top Tools by Views */}
        <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
          <h2 className='text-lg font-semibold text-slate-900'>Top Tools by Views</h2>
          <div className='mt-4 space-y-3'>
            {topToolsByViews.map((tool, index) => (
              <div
                key={tool.id}
                className='flex items-center justify-between border-b border-slate-100 pb-3 last:border-0'
              >
                <div className='flex items-center gap-3'>
                  <span className='flex h-8 w-8 items-center justify-center rounded-full bg-cyan-50 text-sm font-medium text-cyan-700'>
                    {index + 1}
                  </span>
                  <div>
                    <p className='font-medium text-slate-900'>{getTitle(tool)}</p>
                    <p className='text-sm text-slate-500'>{tool.name}</p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='font-medium text-slate-900'>{tool.views.toLocaleString()}</p>
                  <p className='text-xs text-slate-500'>{tool.clicks.toLocaleString()} clicks</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Tools by Rating */}
        <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
          <h2 className='text-lg font-semibold text-slate-900'>Top Rated Tools</h2>
          <div className='mt-4 space-y-3'>
            {topToolsByRating.map((tool, index) => (
              <div
                key={tool.id}
                className='flex items-center justify-between border-b border-slate-100 pb-3 last:border-0'
              >
                <div className='flex items-center gap-3'>
                  <span className='flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-sm font-medium text-amber-700'>
                    {index + 1}
                  </span>
                  <div>
                    <p className='font-medium text-slate-900'>{getTitle(tool)}</p>
                    <p className='text-sm text-slate-500'>{tool.name}</p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='font-medium text-slate-900'>⭐ {tool.rating.toFixed(1)}</p>
                  <p className='text-xs text-slate-500'>{tool.ratingCount} ratings</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Searches */}
        <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
          <h2 className='text-lg font-semibold text-slate-900'>Top Search Queries</h2>
          <div className='mt-4 space-y-3'>
            {topSearches.length > 0 ? (
              topSearches.map((search, index) => (
                <div
                  key={search.query}
                  className='flex items-center justify-between border-b border-slate-100 pb-3 last:border-0'
                >
                  <div className='flex items-center gap-3'>
                    <span className='flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-sm font-medium text-emerald-700'>
                      {index + 1}
                    </span>
                    <p className='font-medium text-slate-900'>{search.query}</p>
                  </div>
                  <div className='text-right'>
                    <p className='font-medium text-slate-900'>{search.count}</p>
                    <p className='text-xs text-slate-500'>{search.results} results</p>
                  </div>
                </div>
              ))
            ) : (
              <p className='text-sm text-slate-500'>No search data available yet</p>
            )}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
          <h2 className='text-lg font-semibold text-slate-900'>Traffic Sources</h2>
          <div className='mt-4 space-y-3'>
            {trafficSources.length > 0 ? (
              trafficSources.map((source, index) => (
                <div
                  key={source.source}
                  className='flex items-center justify-between border-b border-slate-100 pb-3 last:border-0'
                >
                  <div className='flex items-center gap-3'>
                    <span className='flex h-8 w-8 items-center justify-center rounded-full bg-violet-50 text-sm font-medium text-violet-700'>
                      {index + 1}
                    </span>
                    <p className='font-medium text-slate-900'>{source.source}</p>
                  </div>
                  <div className='text-right'>
                    <p className='font-medium text-slate-900'>{source.visits.toLocaleString()}</p>
                    <p className='text-xs text-slate-500'>{source.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))
            ) : (
              <p className='text-sm text-slate-500'>No traffic data available yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
