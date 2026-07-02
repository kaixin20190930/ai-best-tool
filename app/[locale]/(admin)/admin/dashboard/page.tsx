import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
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
import {
  getDeveloperOutreachQueue,
  getFeaturedPlacementStats,
  getOperationalStats,
  getPaidListingBlockerSummary,
  getSubmissionFunnelStats,
  getToolsStats,
} from '@/app/actions/admin/tools';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  try {
    const t = await getTranslations({ locale: params.locale, namespace: 'admin' });

    return {
      title: t('dashboard.title'),
    };
  } catch (error) {
    console.error('Failed to load admin dashboard metadata:', error);
    return {
      title: 'Dashboard',
    };
  }
}

function DashboardFallback({ error }: { error: string }) {
  return (
    <div className='rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm'>
      <p className='text-sm font-semibold uppercase tracking-wide text-amber-700'>Dashboard degraded</p>
      <h1 className='mt-2 text-3xl font-bold text-slate-950'>Admin dashboard temporarily unavailable</h1>
      <p className='mt-3 max-w-2xl text-sm leading-6 text-slate-700'>
        The dashboard hit an unexpected server error. The rest of the admin area should still be available, and you can
        retry this page after the failing data source recovers.
      </p>
      <p className='mt-4 rounded-xl bg-white/80 px-4 py-3 text-sm text-amber-900'>Error: {error}</p>
      <div className='mt-4 flex flex-wrap gap-3'>
        <Link
          href='/admin/analytics'
          className='inline-flex items-center justify-center rounded-lg border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100'
        >
          Open analytics
        </Link>
        <Link
          href='/admin/tools'
          className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
        >
          Open tools
        </Link>
      </div>
    </div>
  );
}

export default async function AdminDashboard({
  params,
}: {
  params?: {
    locale?: string;
  };
}) {
  try {
    const locale = params?.locale || 'en';
    const [
      siteMetrics,
      toolsStats,
      operationalStats,
      moderationSummary,
      paidListingBlockers,
      featuredPlacementStats,
      outreachQueue,
      topTools,
      pageAccessReport,
      conversionSnapshot,
      submissionFunnel,
    ] = await Promise.all([
      getSiteMetrics().catch(() => ({
        totalViews: 0,
        uniqueVisitors: 0,
        totalTools: 0,
        totalUsers: 0,
        totalComments: 0,
        totalRatings: 0,
      })),
      getToolsStats().catch(() => ({
        total: 0,
        published: 0,
        pending: 0,
        rejected: 0,
        draft: 0,
        claimed: 0,
        claimPending: 0,
        claimRejected: 0,
        claimUnclaimed: 0,
      })),
      getOperationalStats().catch(() => ({
        candidatesLast24h: 0,
        newCandidates: 0,
        draftTools: 0,
        collectedDrafts: 0,
        needsMediaDrafts: 0,
        lowQualityDrafts: 0,
        readyDrafts: 0,
        pendingDeveloperSubmissions: 0,
        overduePendingSubmissions: 0,
        followedUpOverdueSubmissions: 0,
      })),
      getCommentModerationSummary().catch(() => ({
        unresolvedReportedComments: 0,
        autoHiddenComments: 0,
      })),
      getPaidListingBlockerSummary(8).catch(() => ({
        totalBlocked: 0,
        blockerCounts: [],
        items: [],
      })),
      getFeaturedPlacementStats().catch(() => ({
        liveCount: 0,
        reservedCount: 0,
        expiringSoonCount: 0,
        totalViews: 0,
        totalClicks: 0,
        placements: [],
      })),
      getDeveloperOutreachQueue(8).catch(() => []),
      getTopTools('views', 5).catch(() => []),
      getPageAccessReport('30d', 6).catch(() => ({
        summary: [],
        topPages: [],
        familyBreakdown: [],
        totalViews: 0,
        totalUniqueVisitors: 0,
      })),
      getConversionSnapshot('30d').catch(() => ({
        pageViews: 0,
        toolClicks: 0,
        ctaClicks: 0,
        searches: 0,
        favorites: 0,
        shares: 0,
        claimLeads: 0,
        freshClaimLeads: 0,
        overdueClaimLeads: 0,
        submissions: 0,
        publishedSubmissions: 0,
        paidSubmissions: 0,
        pageToClickRate: 0,
        pageToCtaRate: 0,
        submissionPublishRate: 0,
        paidSubmissionRate: 0,
      })),
      getSubmissionFunnelStats('30d').catch(() => ({
        totalSubmitted: 0,
        pending: 0,
        published: 0,
        rejected: 0,
        publishedRate: 0,
        avgReviewHours: 0,
      })),
    ]);
    const outreachDueCount = outreachQueue.filter((item) => item.outreachStatus === 'follow_up_due').length;
    const outreachFeaturedCount = outreachQueue.filter((item) => item.suggestion === 'featured_pitch').length;
    const outreachClaimCount = outreachQueue.filter((item) => item.suggestion === 'claim_listing').length;
    const claimStats = toolsStats as unknown as Partial<{
      claimed: number;
      claimPending: number;
      claimRejected: number;
      claimUnclaimed: number;
    }>;
    const claimedToolsCount = claimStats.claimed ?? 0;
    const claimPendingCount = claimStats.claimPending ?? 0;
    const claimRejectedCount = claimStats.claimRejected ?? 0;
    const claimUnclaimedCount = claimStats.claimUnclaimed ?? 0;

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

    let featuredHealthTone = 'slate';
    let featuredHealthLabel = 'No live featured windows';
    let featuredHealthBody = 'No currently active featured placement needs attention.';

    if (featuredPlacementStats.expiringSoonCount > 0) {
      featuredHealthTone = 'rose';
      featuredHealthLabel = 'Needs renewal attention';
      featuredHealthBody = `${featuredPlacementStats.expiringSoonCount} live featured window${
        featuredPlacementStats.expiringSoonCount === 1 ? ' needs' : ' need'
      } attention.`;
    } else if (featuredPlacementStats.liveCount > 0) {
      featuredHealthTone = 'emerald';
      featuredHealthLabel = 'Healthy featured activity';
      featuredHealthBody = `${featuredPlacementStats.liveCount} live featured window${
        featuredPlacementStats.liveCount === 1 ? '' : 's'
      } are running right now.`;
    }

    const getFeaturedHealthClasses = (tone: string) => {
      switch (tone) {
        case 'rose':
          return {
            card: 'border-rose-200 bg-rose-50',
            text: 'text-rose-700',
          };
        case 'emerald':
          return {
            card: 'border-emerald-200 bg-emerald-50',
            text: 'text-emerald-700',
          };
        default:
          return {
            card: 'border-slate-200 bg-slate-50',
            text: 'text-slate-900',
          };
      }
    };

    const getFocusToneClasses = (tone: string) => {
      switch (tone) {
        case 'amber':
          return 'bg-amber-50 text-amber-700';
        case 'emerald':
          return 'bg-emerald-50 text-emerald-700';
        case 'rose':
          return 'bg-rose-50 text-rose-700';
        case 'violet':
          return 'bg-violet-50 text-violet-700';
        default:
          return 'bg-cyan-50 text-cyan-700';
      }
    };

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
      if (pageType === 'claim_listing' || pageType === 'developer_listing') return 'Claim listing';
      if (pageType === 'profile_submissions') return 'Submissions';
      return 'Conversion page';
    };
    const getConversionPageAction = (pageType: string) => {
      if (pageType === 'pricing') return 'Keep the offer sharp and the CTA obvious';
      if (pageType === 'submit') return 'Reduce friction and reinforce review expectations';
      if (pageType === 'claim_listing' || pageType === 'developer_listing')
        return 'Capture claims and follow up quickly';
      if (pageType === 'profile_submissions') return 'Make payment status and next steps obvious';
      return 'Review where this page should send users next';
    };
    const getConversionPageHref = (pageType: string) => {
      if (pageType === 'pricing') return `/${locale}/pricing`;
      if (pageType === 'submit') return `/${locale}/submit`;
      if (pageType === 'claim_listing' || pageType === 'developer_listing') return `/${locale}/developer/listing`;
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
    const conversionPageOrder = ['pricing', 'submit', 'claim_listing', 'profile_submissions'] as const;
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

    const claimHealthCards = [
      {
        name: 'Claimed',
        value: claimedToolsCount,
        subtext: 'Already tied to an owner email',
        href: '/admin/owners?status=owner_email',
        tone: 'emerald',
      },
      {
        name: 'Pending',
        value: claimPendingCount,
        subtext: 'Waiting for manual confirmation',
        href: '/admin/claims?status=pending',
        tone: 'amber',
      },
      {
        name: 'Rejected',
        value: claimRejectedCount,
        subtext: 'Claims that need correction or follow-up',
        href: '/admin/claims?status=rejected',
        tone: 'rose',
      },
      {
        name: 'Unclaimed',
        value: claimUnclaimedCount,
        subtext: 'Potential owner leads still open',
        href: '/admin/owners?status=unclaimed',
        tone: 'slate',
      },
    ];

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
        name: 'Email Ops',
        value: 'Open',
        subtext: 'Claim invites and featured renewal reminders',
        href: '/admin/email-ops',
        icon: Send,
        color: 'gray',
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
        subtext:
          conversionSnapshot.overdueClaimLeads > 0
            ? `${conversionSnapshot.overdueClaimLeads} overdue / ${conversionSnapshot.freshClaimLeads} fresh`
            : `${conversionSnapshot.freshClaimLeads} fresh leads`,
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
      {
        name: 'Claimed Tools',
        value: claimedToolsCount.toString(),
        icon: Sparkles,
        subtext: 'Tools already tied to an owner flow',
        color: 'green',
      },
      {
        name: 'Paid Blockers',
        value: paidListingBlockers.totalBlocked.toString(),
        icon: AlertTriangle,
        subtext:
          paidListingBlockers.blockerCounts.length > 0
            ? `${paidListingBlockers.blockerCounts[0].label} is the top missing field`
            : 'No blocker backlog right now',
        color: 'red',
      },
    ];

    const todayFocus = [
      {
        name: 'Claim follow-up',
        value: claimPendingCount + claimUnclaimedCount,
        subtext:
          conversionSnapshot.overdueClaimLeads > 0
            ? `${conversionSnapshot.overdueClaimLeads} overdue claim lead${conversionSnapshot.overdueClaimLeads === 1 ? '' : 's'}`
            : `${conversionSnapshot.freshClaimLeads} fresh claim lead${conversionSnapshot.freshClaimLeads === 1 ? '' : 's'}`,
        action: 'Open claim queue',
        href: '/admin/claims',
        tone: 'cyan',
      },
      {
        name: 'Featured renewal',
        value: featuredPlacementStats.expiringSoonCount,
        subtext:
          featuredPlacementStats.liveCount > 0
            ? `${featuredPlacementStats.liveCount} live featured window${featuredPlacementStats.liveCount === 1 ? '' : 's'}`
            : 'No live featured windows right now',
        action: 'Open expiring featured',
        href: '/admin/owners?status=featured_expiring',
        tone: 'amber',
      },
      {
        name: 'Review backlog',
        value: operationalStats.overduePendingSubmissions,
        subtext: `${operationalStats.pendingDeveloperSubmissions} developer submissions waiting`,
        action: 'Open review queue',
        href: '/admin/tools?status=pending',
        tone: 'rose',
      },
      {
        name: 'Outreach due',
        value: outreachDueCount,
        subtext: 'Follow-ups already due today',
        action: 'Open due outreach',
        href: '/admin/outreach?focus=due_today',
        tone: 'cyan',
      },
      {
        name: 'Outreach claim',
        value: outreachClaimCount,
        subtext: 'Warm owner leads that need a claim invite',
        action: 'Open claim focus',
        href: '/admin/outreach?focus=claim',
        tone: 'emerald',
      },
      {
        name: 'Outreach featured',
        value: outreachFeaturedCount,
        subtext: 'Traffic-backed leads fit for a featured pitch',
        action: 'Open featured focus',
        href: '/admin/outreach?focus=featured',
        tone: 'violet',
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

        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
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
              <h2 className='text-lg font-semibold text-slate-900'>Owner Health</h2>
              <p className='mt-1 text-sm text-slate-600'>
                The claim lifecycle at a glance, so operators can follow up without digging through tables.
              </p>
            </div>
            <Link href='/admin/owners' className='text-sm font-medium text-cyan-700 hover:underline'>
              Open owner dashboard
            </Link>
          </div>
          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
            {claimHealthCards.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className='theme-surface rounded-lg border border-slate-200 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-sm font-medium text-slate-600'>{item.name}</p>
                    <p className='mt-2 text-3xl font-semibold text-slate-900'>{item.value}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getFocusToneClasses(item.tone)}`}>
                    Claim
                  </span>
                </div>
                <p className='mt-3 text-sm leading-6 text-slate-600'>{item.subtext}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className='mt-8'>
          <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
            <div>
              <h2 className='text-lg font-semibold text-slate-900'>Today&apos;s Focus</h2>
              <p className='mt-1 text-sm text-slate-600'>The fastest paths to revenue or cleanup right now.</p>
            </div>
            <Link href='/admin/outreach?focus=claim' className='text-sm font-medium text-cyan-700 hover:underline'>
              Open outreach queue
            </Link>
          </div>
          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
            {todayFocus.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className='theme-surface rounded-lg border border-slate-200 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-sm font-medium text-slate-600'>{item.name}</p>
                    <p className='mt-2 text-3xl font-semibold text-slate-900'>{item.value}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getFocusToneClasses(item.tone)}`}>
                    Focus
                  </span>
                </div>
                <p className='mt-3 text-sm leading-6 text-slate-600'>{item.subtext}</p>
                <p className='mt-3 text-sm font-semibold text-cyan-700'>{item.action}</p>
              </Link>
            ))}
          </div>
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

        <div className='mt-8 rounded-[20px] border border-cyan-100 bg-cyan-50 p-5 shadow-sm'>
          <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>
                {locale === 'cn' || locale === 'tw' ? '商业快捷入口' : 'Commercial shortcuts'}
              </p>
              <h2 className='mt-1 text-xl font-bold text-slate-950'>
                {locale === 'cn' || locale === 'tw'
                  ? '先处理认领、清理和续期'
                  : 'Handle claims, cleanup, and renewals first'}
              </h2>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                {locale === 'cn' || locale === 'tw'
                  ? '这几个入口是现在最接近收入或阻塞解除的地方。'
                  : 'These are the fastest paths to revenue or removing blockers.'}
              </p>
            </div>
            <Link
              href='/admin/cleanup'
              className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100'
            >
              {locale === 'cn' || locale === 'tw' ? '打开清理队列' : 'Open cleanup queue'}
            </Link>
          </div>
          <div className='mt-4 flex flex-wrap gap-2 text-xs font-semibold'>
            <Link
              href='/admin/claims'
              className='rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-cyan-700 hover:bg-cyan-100'
            >
              {locale === 'cn' || locale === 'tw' ? '认领队列' : 'Claim queue'}
            </Link>
            <Link
              href='/admin/owners'
              className='rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700 hover:bg-slate-100'
            >
              {locale === 'cn' || locale === 'tw' ? 'Owner 看板' : 'Owner dashboard'}
            </Link>
            <Link
              href='/admin/cleanup'
              className='rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700 hover:bg-slate-100'
            >
              {locale === 'cn' || locale === 'tw' ? '清理队列' : 'Cleanup queue'}
            </Link>
            <Link
              href='/admin/outreach'
              className='rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700 hover:bg-emerald-100'
            >
              {locale === 'cn' || locale === 'tw' ? '外联队列' : 'Outreach queue'}
            </Link>
          </div>
        </div>

        <div className='mt-8 rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
            <div className='max-w-3xl'>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>Owner / Featured health</p>
              <h2 className='mt-1 text-2xl font-bold text-slate-950'>Commercial flow health at a glance</h2>
              <p className='mt-2 text-sm leading-6 text-slate-600'>
                Keep an eye on claimed tools, live featured windows, and renewals that need attention.
              </p>
            </div>
            <div className='flex flex-wrap gap-3'>
              <Link
                href='/admin/owners'
                className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
              >
                Open owner dashboard
              </Link>
              <Link
                href='/admin/email-ops'
                className='inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-100'
              >
                Open email ops
              </Link>
            </div>
          </div>

          <div className='mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
            <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Claimed tools</p>
              <p className='mt-2 text-3xl font-bold text-slate-950'>{claimedToolsCount}</p>
              <p className='mt-1 text-sm text-slate-600'>Connected to an owner flow</p>
            </div>
            <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Live featured</p>
              <p className='mt-2 text-3xl font-bold text-amber-700'>{featuredPlacementStats.liveCount}</p>
              <p className='mt-1 text-sm text-slate-600'>
                {featuredPlacementStats.totalViews.toLocaleString()} views ·{' '}
                {featuredPlacementStats.totalClicks.toLocaleString()} clicks
              </p>
            </div>
            <div className={`rounded-xl border p-4 ${getFeaturedHealthClasses(featuredHealthTone).card}`}>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Featured health</p>
              <p className={`mt-2 text-lg font-bold ${getFeaturedHealthClasses(featuredHealthTone).text}`}>
                {featuredHealthLabel}
              </p>
              <p className='mt-1 text-sm text-slate-600'>{featuredHealthBody}</p>
            </div>
            <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Renewals due</p>
              <p className='mt-2 text-3xl font-bold text-rose-700'>{featuredPlacementStats.expiringSoonCount}</p>
              <p className='mt-1 text-sm text-slate-600'>Needs a reminder in the next 3 days</p>
            </div>
          </div>

          <div className='mt-4 flex flex-wrap gap-2 text-xs font-semibold'>
            <Link
              href='/admin/owners?status=featured_active'
              className='rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-cyan-700 hover:bg-cyan-100'
            >
              Open active featured
            </Link>
            <Link
              href='/admin/owners?status=featured_expiring'
              className='rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-700 hover:bg-amber-100'
            >
              Open expiring soon
            </Link>
            <Link
              href='/admin/owners?status=featured_expired'
              className='rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700 hover:bg-slate-100'
            >
              Open expired
            </Link>
          </div>
        </div>

        <div className='mt-8 rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
            <div className='max-w-3xl'>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>Claim health</p>
              <h2 className='mt-1 text-2xl font-bold text-slate-950'>Owner mapping</h2>
              <p className='mt-2 text-sm leading-6 text-slate-600'>Claimed, pending, rejected, and unclaimed.</p>
            </div>
            <Link
              href='/admin/tools'
              className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              Open tools table
            </Link>
          </div>

          <div className='mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
            <Link
              href='/admin/tools?claimStatus=claimed'
              className='rounded-xl border border-emerald-200 bg-emerald-50 p-4'
            >
              <p className='text-xs font-semibold uppercase tracking-wide text-emerald-700'>Claimed</p>
              <p className='mt-2 text-3xl font-bold text-emerald-700'>{claimedToolsCount}</p>
              <p className='mt-1 text-sm text-slate-600'>Owner linked</p>
            </Link>
            <Link
              href='/admin/tools?claimStatus=pending'
              className='rounded-xl border border-amber-200 bg-amber-50 p-4'
            >
              <p className='text-xs font-semibold uppercase tracking-wide text-amber-800'>Claim pending</p>
              <p className='mt-2 text-3xl font-bold text-amber-700'>{claimPendingCount}</p>
              <p className='mt-1 text-sm text-slate-600'>Needs review</p>
            </Link>
            <Link href='/admin/tools?claimStatus=rejected' className='rounded-xl border border-rose-200 bg-rose-50 p-4'>
              <p className='text-xs font-semibold uppercase tracking-wide text-rose-700'>Claim rejected</p>
              <p className='mt-2 text-3xl font-bold text-rose-700'>{claimRejectedCount}</p>
              <p className='mt-1 text-sm text-slate-600'>Needs cleanup</p>
            </Link>
            <Link
              href='/admin/tools?claimStatus=unclaimed'
              className='rounded-xl border border-slate-200 bg-slate-50 p-4'
            >
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Unclaimed</p>
              <p className='mt-2 text-3xl font-bold text-slate-900'>{claimUnclaimedCount}</p>
              <p className='mt-1 text-sm text-slate-600'>No owner yet</p>
            </Link>
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
                className='block rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50/50'
              >
                <h3 className='font-medium text-slate-900'>Collect New Tools</h3>
                <p className='mt-1 text-sm text-slate-600'>Import URLs and research draft tools</p>
              </a>
              <a
                href='/admin/tools'
                className='block rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50/50'
              >
                <h3 className='font-medium text-slate-900'>Review Tools</h3>
                <p className='mt-1 text-sm text-slate-600'>{toolsStats.pending} tools pending review</p>
              </a>
              <a
                href='/admin/tools?status=published'
                className='block rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50/50'
              >
                <h3 className='font-medium text-slate-900'>Manage Published Tools</h3>
                <p className='mt-1 text-sm text-slate-600'>{toolsStats.published} published tools</p>
              </a>
              <a
                href='/admin/owners'
                className='block rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50/50'
              >
                <h3 className='font-medium text-slate-900'>Tool Owner Dashboard</h3>
                <p className='mt-1 text-sm text-slate-600'>{claimedToolsCount} claimed tools in the owner flow</p>
              </a>
              <a
                href='/admin/cleanup'
                className='block rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50/50'
              >
                <h3 className='font-medium text-slate-900'>Cleanup Queue</h3>
                <p className='mt-1 text-sm text-slate-600'>
                  {paidListingBlockers.totalBlocked} paid listings need cleanup
                </p>
              </a>
              <a
                href='/admin/claims'
                className='block rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50/50'
              >
                <h3 className='font-medium text-slate-900'>Claim Leads</h3>
                <p className='mt-1 text-sm text-slate-600'>Review {conversionSnapshot.claimLeads} claim leads</p>
              </a>
              <a
                href='/admin/analytics'
                className='block rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50/50'
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
  } catch (error) {
    console.error('Failed to load admin dashboard page:', error);
    return <DashboardFallback error={error instanceof Error ? error.message : 'Unknown error'} />;
  }
}
