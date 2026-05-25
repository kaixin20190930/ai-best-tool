import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  Inbox,
  Image,
  MessageSquare,
  Search,
  Sparkles,
  Star,
  Wrench,
  Eye,
} from 'lucide-react';
import { getSiteMetrics, getTopTools } from '@/lib/services/admin/analytics';
import { getOperationalStats, getToolsStats } from '@/app/actions/admin/tools';
import { getCommentModerationSummary } from '@/app/actions/admin/comments';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'admin' });

  return {
    title: t('dashboard.title'),
  };
}

export default async function AdminDashboard() {
  const siteMetrics = await getSiteMetrics();
  const toolsStats = await getToolsStats();
  const operationalStats = await getOperationalStats();
  const moderationSummary = await getCommentModerationSummary();
  const topTools = await getTopTools('views', 5);

  const metrics = [
    {
      name: 'Total Tools',
      value: siteMetrics.totalTools.toString(),
      icon: Wrench,
      subtext: `${toolsStats.pending} pending review`,
      color: 'blue',
    },
    {
      name: 'Page Views',
      value: siteMetrics.totalViews.toLocaleString(),
      icon: Eye,
      subtext: `${siteMetrics.uniqueVisitors} unique visitors`,
      color: 'green',
    },
    {
      name: 'Comments',
      value: siteMetrics.totalComments.toString(),
      icon: MessageSquare,
      subtext: 'User engagement',
      color: 'purple',
    },
    {
      name: 'Ratings',
      value: siteMetrics.totalRatings.toString(),
      icon: Star,
      subtext: 'Total ratings given',
      color: 'yellow',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-cyan-50 text-cyan-700',
      green: 'bg-emerald-50 text-emerald-700',
      purple: 'bg-violet-50 text-violet-700',
      yellow: 'bg-amber-50 text-amber-700',
      red: 'bg-red-50 text-red-600',
      gray: 'bg-slate-50 text-slate-600',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const operations = [
    {
      name: 'New Candidates',
      value: operationalStats.newCandidates,
      subtext: `${operationalStats.candidatesLast24h} discovered in the last 24h`,
      href: '/admin/collection?candidateStatus=new&candidateScore=promising',
      icon: Search,
      color: 'blue',
    },
    {
      name: 'Draft Queue',
      value: operationalStats.draftTools,
      subtext: `${operationalStats.collectedDrafts} collected drafts`,
      href: '/admin/tools?status=draft&collected=1',
      icon: Inbox,
      color: 'purple',
    },
    {
      name: 'Needs Media',
      value: operationalStats.needsMediaDrafts,
      subtext: 'Logo or thumbnail missing',
      href: '/admin/tools?status=draft&needsMedia=1',
      icon: Image,
      color: 'yellow',
    },
    {
      name: 'Low Quality',
      value: operationalStats.lowQualityDrafts,
      subtext: 'Drafts below 55 quality',
      href: '/admin/tools?status=draft&quality=low',
      icon: AlertTriangle,
      color: 'red',
    },
    {
      name: 'Ready Drafts',
      value: operationalStats.readyDrafts,
      subtext: 'Quality 80+ with media complete',
      href: '/admin/tools?status=draft&ready=1',
      icon: CheckCircle2,
      color: 'green',
    },
    {
      name: 'Developer Submissions',
      value: operationalStats.pendingDeveloperSubmissions,
      subtext: 'Pending user-submitted tools for review',
      href: '/admin/tools?status=pending',
      icon: MessageSquare,
      color: 'blue',
    },
    {
      name: 'Pending > 48h',
      value: operationalStats.overduePendingSubmissions,
      subtext: 'Escalated pending submissions',
      href: '/admin/tools?status=pending&overdue=1&followedUp=0',
      icon: AlertTriangle,
      color: 'red',
    },
    {
      name: 'Reported Comments',
      value: moderationSummary.unresolvedReportedComments,
      subtext: `${moderationSummary.autoHiddenComments} auto-hidden by threshold`,
      href: '/admin/comments?sort=reports&reportState=unresolved',
      icon: MessageSquare,
      color: 'red',
    },
  ];

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
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Welcome to the admin dashboard. Here's an overview of your site.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.name}
            className="theme-surface rounded-lg border border-slate-200 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{metric.name}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {metric.value}
                </p>
              </div>
              <div className={`rounded-full p-3 ${getColorClasses(metric.color)}`}>
                <metric.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-slate-600">{metric.subtext}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Operations Queue</h2>
            <p className="mt-1 text-sm text-slate-600">
              Daily review signals for collection, drafts, and publishing readiness.
            </p>
          </div>
          <Sparkles className="hidden h-5 w-5 text-cyan-600 sm:block" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-8">
          {operations.map((operation) => (
            <Link
              key={operation.name}
              href={operation.href}
              className="theme-surface rounded-lg border border-slate-200 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-600">{operation.name}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">
                    {operation.value}
                  </p>
                </div>
                <div className={`rounded-full p-2 ${getColorClasses(operation.color)}`}>
                  <operation.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-500">{operation.subtext}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Top Tools */}
        <div className="theme-surface rounded-lg border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Top Tools by Views</h2>
          <div className="mt-4 space-y-4">
            {topTools.map((tool, index) => (
              <div key={tool.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">
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
                  <p className="text-sm text-slate-500">views</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="theme-surface rounded-lg border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
          <div className="mt-4 space-y-3">
            <a
              href="/admin/collection"
              className="block rounded-lg border border-slate-200 p-4 hover:border-cyan-200 hover:bg-cyan-50/50"
            >
              <h3 className="font-medium text-slate-900">Collect New Tools</h3>
              <p className="mt-1 text-sm text-slate-600">
                Import URLs and research draft tools
              </p>
            </a>
            <a
              href="/admin/tools"
              className="block rounded-lg border border-slate-200 p-4 hover:border-cyan-200 hover:bg-cyan-50/50"
            >
              <h3 className="font-medium text-slate-900">Review Tools</h3>
              <p className="mt-1 text-sm text-slate-600">
                {toolsStats.pending} tools pending review
              </p>
            </a>
            <a
              href="/admin/tools?status=published"
              className="block rounded-lg border border-slate-200 p-4 hover:border-cyan-200 hover:bg-cyan-50/50"
            >
              <h3 className="font-medium text-slate-900">Manage Published Tools</h3>
              <p className="mt-1 text-sm text-slate-600">
                {toolsStats.published} published tools
              </p>
            </a>
            <a
              href="/admin/analytics"
              className="block rounded-lg border border-slate-200 p-4 hover:border-cyan-200 hover:bg-cyan-50/50"
            >
              <h3 className="font-medium text-slate-900">View Analytics</h3>
              <p className="mt-1 text-sm text-slate-600">
                Check detailed site analytics and reports
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
