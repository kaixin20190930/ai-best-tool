import Link from 'next/link';
import {
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Heart,
  Home,
  Image,
  Inbox,
  MessageSquare,
  MousePointerClick,
  Search,
  Send,
  Sparkles,
  Star,
  Wrench,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import {
  getConversionSnapshot,
  getPageAccessReport,
  getSiteMetrics,
  getTopTools,
} from '@/lib/services/admin/analytics';
import { getCommentModerationSummary } from '@/app/actions/admin/comments';
import { getOperationalStats, getSubmissionFunnelStats, getToolsStats } from '@/app/actions/admin/tools';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'admin' });

  return {
    title: t('dashboard.title'),
  };
}

export default async function AdminDashboard({
  params,
}: {
  params?: {
    locale?: string;
  };
}) {
  const locale = params?.locale || 'en';
  const siteMetrics = await getSiteMetrics();
  const toolsStats = await getToolsStats();
  const operationalStats = await getOperationalStats();
  const moderationSummary = await getCommentModerationSummary();
  const topTools = await getTopTools('views', 5);
  const pageAccessReport = await getPageAccessReport('30d', 6);
  const conversionSnapshot = await getConversionSnapshot('30d');
  const submissionFunnel = await getSubmissionFunnelStats('30d');

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

  const pageSummaryOrder = ['home', 'tool_detail', 'guide', 'category', 'explore'] as const;
  const pageSummaryMap = new Map(pageAccessReport.summary.map((item) => [item.pageType, item]));
  const getPageSnapshotLabel = (pageType: (typeof pageSummaryOrder)[number]) => {
    if (pageType === 'home') return 'Home';
    if (pageType === 'tool_detail') return 'Detail';
    if (pageType === 'guide') return 'Guides';
    if (pageType === 'category') return 'Categories';
    return 'Explore';
  };
  const getConversionPageLabel = (pageType: string) => {
    if (pageType === 'pricing') return 'Pricing';
    if (pageType === 'submit') return 'Submit';
    if (pageType === 'developer_listing') return 'Claim listing';
    if (pageType === 'profile_submissions') return 'Submissions';
    return 'Conversion page';
  };
  const getConversionPageAction = (pageType: string) => {
    if (pageType === 'pricing') return 'Keep the offer sharp and the CTA obvious';
    if (pageType === 'submit') return 'Reduce friction and reinforce review expectations';
    if (pageType === 'developer_listing') return 'Capture claims and follow up quickly';
    if (pageType === 'profile_submissions') return 'Make payment status and next steps obvious';
    return 'Review where this page should send users next';
  };
  const getConversionPageHref = (pageType: string) => {
    if (pageType === 'pricing') return `/${locale}/pricing`;
    if (pageType === 'submit') return `/${locale}/submit`;
    if (pageType === 'developer_listing') return `/${locale}/developer/listing`;
    if (pageType === 'profile_submissions') return `/${locale}/profile/submissions`;
    return `/${locale}`;
  };
  const pageSnapshotItems = pageSummaryOrder.map((pageType) => {
    const item = pageSummaryMap.get(pageType);

    return {
      pageType,
      label: getPageSnapshotLabel(pageType),
      views: item?.views || 0,
      percentage: item?.percentage || 0,
    };
  });
  const conversionPageOrder = ['pricing', 'submit', 'developer_listing', 'profile_submissions'] as const;
  const conversionPageItems = conversionPageOrder.map((pageType) => {
    const item = pageSummaryMap.get(pageType);

    return {
      pageType,
      label: getConversionPageLabel(pageType),
      views: item?.views || 0,
      percentage: item?.percentage || 0,
      action: getConversionPageAction(pageType),
      href: getConversionPageHref(pageType),
    };
  });
  const topPagePaths = pageAccessReport.topPages.slice(0, 4);
  const conversionCards = [
    {
      name: 'Page Views',
      value: conversionSnapshot.pageViews,
      subtext: 'All tracked landing and detail traffic',
      icon: Eye,
      color: 'blue',
    },
    {
      name: 'Tool Clicks',
      value: conversionSnapshot.toolClicks,
      subtext: `${conversionSnapshot.pageToClickRate.toFixed(1)}% of page views`,
      icon: MousePointerClick,
      color: 'green',
    },
    {
      name: 'CTA Clicks',
      value: conversionSnapshot.ctaClicks,
      subtext: `${conversionSnapshot.pageToCtaRate.toFixed(1)}% of page views`,
      icon: ArrowRight,
      color: 'blue',
    },
    {
      name: 'Searches',
      value: conversionSnapshot.searches,
      subtext: 'Users showing active intent',
      icon: Search,
      color: 'purple',
    },
    {
      name: 'Favorites',
      value: conversionSnapshot.favorites,
      subtext: 'Saved for later evaluation',
      icon: Heart,
      color: 'red',
    },
    {
      name: 'Shares',
      value: conversionSnapshot.shares,
      subtext: 'Passed to a teammate or audience',
      icon: Send,
      color: 'yellow',
    },
    {
      name: 'Claim Leads',
      value: conversionSnapshot.claimLeads,
      subtext: 'Owners leaving contact details',
      icon: Sparkles,
      href: '/admin/claims',
      color: 'blue',
    },
    {
      name: 'Paid Submissions',
      value: conversionSnapshot.paidSubmissions,
      subtext: `${conversionSnapshot.paidSubmissionRate.toFixed(1)}% of all submissions`,
      icon: Wrench,
      color: 'gray',
    },
  ];

  return (
    <div>
      <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>Dashboard</h1>
          <p className='mt-2 text-slate-600'>Welcome to the admin dashboard. Here&apos;s an overview of your site.</p>
        </div>
        <Link
          href='/'
          className='inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-cyan-200 hover:text-cyan-700'
        >
          <Home className='h-4 w-4' />
          Home
        </Link>
      </div>

      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
        {metrics.map((metric) => (
          <div key={metric.name} className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-slate-600'>{metric.name}</p>
                <p className='mt-2 text-3xl font-semibold text-slate-900'>{metric.value}</p>
              </div>
              <div className={`rounded-full p-3 ${getColorClasses(metric.color)}`}>
                <metric.icon className='h-6 w-6' />
              </div>
            </div>
            <div className='mt-4'>
              <span className='text-sm text-slate-600'>{metric.subtext}</span>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-8'>
        <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>Conversion Pages</h2>
            <p className='mt-1 text-sm text-slate-600'>
              The pages that should move people from interest into submission, claim, or payment.
            </p>
          </div>
          <Link href={`/${locale}/pricing`} className='text-sm font-medium text-cyan-700 hover:underline'>
            Open pricing page
          </Link>
        </div>
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          {conversionPageItems.map((item) => (
            <Link
              key={item.pageType}
              href={item.href}
              className='theme-surface rounded-lg border border-slate-200 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-sm font-medium text-slate-600'>{item.label}</p>
                  <p className='mt-2 text-3xl font-semibold text-slate-900'>{item.views.toLocaleString()}</p>
                </div>
                <span className='rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700'>
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
              <p className='mt-3 text-sm leading-6 text-slate-600'>{item.action}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className='mt-8'>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>Operations Queue</h2>
            <p className='mt-1 text-sm text-slate-600'>
              Daily review signals for collection, drafts, and publishing readiness.
            </p>
          </div>
          <Sparkles className='hidden h-5 w-5 text-cyan-600 sm:block' />
        </div>
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-8'>
          {operations.map((operation) => (
            <Link
              key={operation.name}
              href={operation.href}
              className='theme-surface rounded-lg border border-slate-200 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-sm font-medium text-slate-600'>{operation.name}</p>
                  <p className='mt-2 text-3xl font-semibold text-slate-900'>{operation.value}</p>
                </div>
                <div className={`rounded-full p-2 ${getColorClasses(operation.color)}`}>
                  <operation.icon className='h-5 w-5' />
                </div>
              </div>
              <p className='mt-3 text-sm text-slate-500'>{operation.subtext}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className='mt-8 grid gap-6 lg:grid-cols-2'>
        {/* Top Tools */}
        <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
          <h2 className='text-lg font-semibold text-slate-900'>Top Tools by Views</h2>
          <div className='mt-4 space-y-4'>
            {topTools.map((tool, index) => (
              <div key={tool.id} className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <span className='flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600'>
                    {index + 1}
                  </span>
                  <div>
                    <p className='font-medium text-slate-900'>{getTitle(tool)}</p>
                    <p className='text-sm text-slate-500'>{tool.name}</p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='font-medium text-slate-900'>{tool.views.toLocaleString()}</p>
                  <p className='text-sm text-slate-500'>views</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
          <h2 className='text-lg font-semibold text-slate-900'>Quick Actions</h2>
          <div className='mt-4 space-y-3'>
            <a
              href='/admin/collection'
              className='block rounded-lg border border-slate-200 p-4 hover:border-cyan-200 hover:bg-cyan-50/50'
            >
              <h3 className='font-medium text-slate-900'>Collect New Tools</h3>
              <p className='mt-1 text-sm text-slate-600'>Import URLs and research draft tools</p>
            </a>
            <a
              href='/admin/tools'
              className='block rounded-lg border border-slate-200 p-4 hover:border-cyan-200 hover:bg-cyan-50/50'
            >
              <h3 className='font-medium text-slate-900'>Review Tools</h3>
              <p className='mt-1 text-sm text-slate-600'>{toolsStats.pending} tools pending review</p>
            </a>
            <a
              href='/admin/tools?status=published'
              className='block rounded-lg border border-slate-200 p-4 hover:border-cyan-200 hover:bg-cyan-50/50'
            >
              <h3 className='font-medium text-slate-900'>Manage Published Tools</h3>
              <p className='mt-1 text-sm text-slate-600'>{toolsStats.published} published tools</p>
            </a>
            <a
              href='/admin/analytics'
              className='block rounded-lg border border-slate-200 p-4 hover:border-cyan-200 hover:bg-cyan-50/50'
            >
              <h3 className='font-medium text-slate-900'>View Analytics</h3>
              <p className='mt-1 text-sm text-slate-600'>Check detailed site analytics and reports</p>
            </a>
          </div>
        </div>
      </div>

      <div className='mt-8'>
        <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>Conversion Snapshot</h2>
            <p className='mt-1 text-sm text-slate-600'>
              Quick read on traffic, intent, and whether users are moving toward submission and payment.
            </p>
          </div>
          <Link href='/admin/analytics?range=30d' className='text-sm font-medium text-cyan-700 hover:underline'>
            Open full funnel
          </Link>
        </div>

        <div className='grid gap-4 lg:grid-cols-[1.5fr_1fr]'>
          <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
            {conversionCards.map((card) => (
              <div key={card.name} className='theme-surface rounded-lg border border-slate-200 p-4 shadow-sm'>
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-sm font-medium text-slate-600'>{card.name}</p>
                    <p className='mt-2 text-3xl font-semibold text-slate-900'>{card.value.toLocaleString()}</p>
                  </div>
                  <div className={`rounded-full p-2 ${getColorClasses(card.color)}`}>
                    <card.icon className='h-5 w-5' />
                  </div>
                </div>
                <p className='mt-3 text-sm text-slate-500'>{card.subtext}</p>
              </div>
            ))}
          </div>

          <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <h3 className='text-base font-semibold text-slate-900'>Developer Submission Funnel</h3>
                <p className='mt-1 text-sm text-slate-600'>
                  A quick look at whether paid intent is turning into live listings.
                </p>
              </div>
              <Sparkles className='h-5 w-5 text-cyan-600' />
            </div>

            <div className='mt-4 grid grid-cols-2 gap-3'>
              <div className='rounded-lg border border-slate-200 bg-white p-3'>
                <p className='text-xs font-medium uppercase tracking-wide text-slate-500'>Submitted</p>
                <p className='mt-2 text-2xl font-semibold text-slate-900'>{submissionFunnel.totalSubmitted}</p>
              </div>
              <div className='rounded-lg border border-slate-200 bg-white p-3'>
                <p className='text-xs font-medium uppercase tracking-wide text-slate-500'>Published</p>
                <p className='mt-2 text-2xl font-semibold text-emerald-700'>{submissionFunnel.published}</p>
              </div>
              <div className='rounded-lg border border-slate-200 bg-white p-3'>
                <p className='text-xs font-medium uppercase tracking-wide text-slate-500'>Paid Intent</p>
                <p className='mt-2 text-2xl font-semibold text-cyan-700'>{conversionSnapshot.paidSubmissions}</p>
              </div>
              <div className='rounded-lg border border-slate-200 bg-white p-3'>
                <p className='text-xs font-medium uppercase tracking-wide text-slate-500'>Avg Review Time</p>
                <p className='mt-2 text-2xl font-semibold text-violet-700'>{submissionFunnel.avgReviewHours}h</p>
              </div>
            </div>

            <div className='mt-4 rounded-lg bg-cyan-50 p-4 text-sm leading-6 text-slate-700'>
              Publish rate: <span className='font-semibold text-cyan-900'>{submissionFunnel.publishedRate}%</span> ·
              Paid submission rate:{' '}
              <span className='font-semibold text-cyan-900'>{conversionSnapshot.paidSubmissionRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-8'>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>Page Access Snapshot</h2>
            <p className='mt-1 text-sm text-slate-600'>
              Quick read on homepage, detail pages, guides, categories, and Explore.
            </p>
          </div>
          <Link href='/admin/analytics' className='text-sm font-medium text-cyan-700 hover:underline'>
            Open full report
          </Link>
        </div>

        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-5'>
          {pageSnapshotItems.map((item) => (
            <div key={item.pageType} className='theme-surface rounded-lg border border-slate-200 p-4 shadow-sm'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-xs font-medium uppercase tracking-wide text-slate-500'>{item.label}</p>
                  <p className='mt-2 text-2xl font-semibold text-slate-900'>{item.views.toLocaleString()}</p>
                </div>
                <span className='rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700'>
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className='mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm'>
          <div className='border-b border-slate-200 px-5 py-4'>
            <p className='text-sm font-semibold text-slate-900'>Top viewed pages</p>
            <p className='mt-1 text-sm text-slate-600'>The exact pages people are landing on most often.</p>
          </div>
          <div className='divide-y divide-slate-100'>
            {topPagePaths.map((page) => (
              <div
                key={`${page.pageType}:${page.pagePath}`}
                className='flex items-center justify-between gap-4 px-5 py-4'
              >
                <div className='min-w-0'>
                  <p className='truncate font-medium text-slate-900'>{page.pagePath}</p>
                  <p className='mt-1 text-sm text-slate-500'>{page.label}</p>
                </div>
                <div className='flex shrink-0 items-center gap-3 text-sm text-slate-600'>
                  <span>{page.views.toLocaleString()} views</span>
                  <span>{page.uniqueVisitors.toLocaleString()} visitors</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
