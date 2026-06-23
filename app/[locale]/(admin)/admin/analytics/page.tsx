import Link from 'next/link';
import { ArrowUpRight, BarChart3, Globe, Layers3, Search, ShieldAlert, TrendingUp } from 'lucide-react';

import {
  getCtaClickReport,
  getCtaClickTrend,
  getPageAccessReport,
  getPageAccessTrend,
  getPriorityMediaQueue,
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
  params,
  searchParams,
}: {
  params?: {
    locale?: string;
  };
  searchParams?: {
    range?: string;
  };
}) {
  const locale = params?.locale || 'en';
  const range = searchParams?.range === '7d' || searchParams?.range === '30d' ? searchParams.range : 'all';
  const rangeLabelMap = {
    all: 'All time',
    '7d': 'Last 7d',
    '30d': 'Last 30d',
  } as const;
  const rangeLabel = rangeLabelMap[range as keyof typeof rangeLabelMap];
  const metrics = await getSiteMetrics();
  const pageAccessReport = await getPageAccessReport(range, 10);
  const ctaClickReport = await getCtaClickReport(range, 8);
  const ctaClickTrend = await getCtaClickTrend(range === 'all' ? '30d' : range);
  const pageAccessTrend = await getPageAccessTrend(range === 'all' ? '30d' : range);
  const operationalStats = await getOperationalStats(range);
  const funnel = await getSubmissionFunnelStats(range);
  const topToolsByViews = await getTopTools('views', 10);
  const topToolsByRating = await getTopTools('rating', 10);
  const topCategories = await getTopCategories(8);
  const complianceIssues = await getToolComplianceIssues(8);
  const priorityMediaQueue = await getPriorityMediaQueue(10);
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

  const getPageSummaryLabel = (pageType: string) => {
    if (pageType === 'home') return 'Home';
    if (pageType === 'tool_detail') return 'Tool detail';
    if (pageType === 'guide') return 'Guides';
    if (pageType === 'category') return 'Category pages';
    if (pageType === 'explore') return 'Explore';
    if (pageType === 'best_ai_tools') return 'Top lists';
    if (pageType === 'best_ai_tools_topic') return 'Top list topic';
    if (pageType === 'pricing') return 'Pricing';
    if (pageType === 'submit') return 'Submit';
    if (pageType === 'developer_listing') return 'Claim listing';
    if (pageType === 'profile_submissions') return 'Submissions';
    return 'Other';
  };

  const getPageAction = (pageType: string) => {
    if (pageType === 'home') return 'Tighten the first fold and routing into compare pages';
    if (pageType === 'tool_detail') return 'Improve trust signals, comparisons, and feedback prompts';
    if (pageType === 'guide') return 'Add more comparison guides and internal links';
    if (pageType === 'category') return 'Backfill supply and strengthen category filters';
    if (pageType === 'explore') return 'Improve zero-results guidance and sorting clarity';
    if (pageType === 'best_ai_tools') return 'Route visitors into narrower topic lists';
    if (pageType === 'best_ai_tools_topic') return 'Push visitors into detail pages and official sites';
    if (pageType === 'pricing') return 'Tighten the pricing story and route into submit';
    if (pageType === 'submit') return 'Reduce friction and reinforce review expectations';
    if (pageType === 'developer_listing') return 'Capture claims and route owners into follow-up';
    if (pageType === 'profile_submissions') return 'Make payment status and renewal paths obvious';
    return 'Review where these visits should be reassigned';
  };

  const getPageRecommendations = (pageType: string) => {
    if (pageType === 'home') {
      return ['Top-fold CTA', 'Compare rail', 'Category shortcuts'];
    }
    if (pageType === 'tool_detail') {
      return ['Trust blocks', 'Pricing clarity', 'Feedback prompts'];
    }
    if (pageType === 'guide') {
      return ['Comparison links', 'Decision blocks', 'Internal links'];
    }
    if (pageType === 'category') {
      return ['Representative tools', 'Filter cleanup', 'Cross-links'];
    }
    if (pageType === 'explore') {
      return ['Empty-state copy', 'Sort clarity', 'Query routing'];
    }
    if (pageType === 'pricing') {
      return ['Review timing', 'Outcome clarity', 'Submit CTA'];
    }
    if (pageType === 'submit') {
      return ['Review rules', 'Payment explanation', 'FAQ clarity'];
    }
    if (pageType === 'developer_listing') {
      return ['Claim form', 'Owner follow-up', 'Lead tracking'];
    }
    if (pageType === 'profile_submissions') {
      return ['Payment state', 'Renewal hints', 'Status clarity'];
    }

    return ['Reassign page type', 'Inspect entry path', 'Check indexing intent'];
  };

  const getPageTrendSummary = (pageType: string) => {
    if (pageType === 'home') return 'If home is rising, keep the first fold and routing sharp.';
    if (pageType === 'guide') return 'If guides are rising, keep adding comparison pages and deeper links.';
    if (pageType === 'category') return 'If category pages are rising, keep backfilling supply and examples.';
    if (pageType === 'tool_detail') return 'If detail pages are rising, trust signals and feedback loops matter most.';
    if (pageType === 'explore') return 'If Explore is rising, tighten filters and empty-state guidance.';
    if (pageType === 'best_ai_tools') return 'If top lists are rising, keep the hub focused and the topic paths clear.';
    if (pageType === 'best_ai_tools_topic') return 'If topic pages are rising, keep tool cards and external CTAs sharp.';
    if (pageType === 'pricing') return 'If Pricing is rising, keep the offer tight and the CTA obvious.';
    if (pageType === 'submit') return 'If Submit is rising, remove friction and clarify review expectations.';
    if (pageType === 'developer_listing') return 'If Claim Listing is rising, follow up fast on new leads.';
    if (pageType === 'profile_submissions') return 'If Submissions is rising, ensure payment state is easy to read.';
    return 'Watch this family to see where the next clean-up or expansion belongs.';
  };

  const getPagePrioritySummary = (pageType: string) => {
    if (pageType === 'home') return 'Tighten the hero, top routing, and comparison rail.';
    if (pageType === 'guide') return 'Add more comparison pages and route deeper into category pages.';
    if (pageType === 'category') return 'Backfill more tools, representative examples, and related comparisons.';
    if (pageType === 'tool_detail') return 'Improve trust blocks, pricing clarity, and feedback prompts.';
    if (pageType === 'explore') return 'Refine filters, empty states, and query-to-page routing.';
    if (pageType === 'best_ai_tools') return 'Keep the hub concise and route readers into topic lists quickly.';
    if (pageType === 'best_ai_tools_topic') return 'Keep the topic page useful and make the detail CTA obvious.';
    if (pageType === 'pricing') return 'Keep the pricing offer sharp and the next step obvious.';
    if (pageType === 'submit') return 'Make the submission flow feel safe, clear, and predictable.';
    if (pageType === 'developer_listing') return 'Turn claims into follow-up conversations quickly.';
    if (pageType === 'profile_submissions') return 'Make payment completion and renewal pathways obvious.';
    return 'Keep this family under review and reassign pages where needed.';
  };

  const getFamilyLandingHref = (pageType: string) => {
    if (pageType === 'home') return `/${locale}`;
    if (pageType === 'guide') return `/${locale}/guides`;
    if (pageType === 'category') return `/${locale}/categories`;
    if (pageType === 'explore') return `/${locale}/explore`;
    if (pageType === 'pricing') return `/${locale}/pricing`;
    if (pageType === 'submit') return `/${locale}/submit`;
    if (pageType === 'developer_listing') return `/${locale}/developer/listing`;
    if (pageType === 'profile_submissions') return `/${locale}/profile/submissions`;
    return `/${locale}/ai`;
  };

  const getPriorityBadgeClass = (priority: string) => {
    if (priority === 'High') return 'bg-rose-50 text-rose-700';
    if (priority === 'Medium') return 'bg-amber-50 text-amber-700';
    return 'bg-cyan-50 text-cyan-700';
  };

  const getPeriodChangeLabel = (currentViews: number, previousViews: number) => {
    if (previousViews > 0) {
      return `${(((currentViews - previousViews) / previousViews) * 100).toFixed(1)}%`;
    }

    if (currentViews > 0) {
      return '100.0%';
    }

    return '0.0%';
  };

  const getPageFocusSummary = (pageType: string, hasData: boolean) => {
    if (pageType === 'home') {
      return hasData
        ? 'First-fold CTA and category entry points matter most here.'
        : 'Still too little data, but keep the entry rail concise.';
    }
    if (pageType === 'tool_detail') {
      return hasData
        ? 'Trust snapshots, comparison blocks, and feedback matter most here.'
        : 'More product detail traffic will tell us which trust modules work.';
    }
    if (pageType === 'guide') {
      return hasData
        ? 'Comparison-style guides and internal links should keep growing.'
        : 'This is a good place to add more high-intent decision pages.';
    }
    if (pageType === 'category') {
      return hasData
        ? 'Backfilling supply inside categories should be a weekly habit.'
        : 'Category pages need more inventory or they will stay thin.';
    }
    if (pageType === 'explore') {
      return hasData
        ? 'Filters, sorting, and empty states deserve steady polish.'
        : 'Explore traffic is light, so SEO and routing into it matter more.';
    }
    if (pageType === 'pricing') {
      return hasData
        ? 'Offer clarity and the submit CTA matter most here.'
        : 'Pricing needs a sharper offer story before it can convert reliably.';
    }
    if (pageType === 'submit') {
      return hasData
        ? 'Review expectations and payment explanation are the key levers.'
        : 'Submission needs more reassurance and fewer surprises.';
    }
    if (pageType === 'developer_listing') {
      return hasData
        ? 'Claim capture and fast follow-up matter most here.'
        : 'Claim interest is small, so keep the form lightweight.';
    }
    if (pageType === 'profile_submissions') {
      return hasData
        ? 'Payment status, featured timing, and renewal paths should be obvious.'
        : 'Submissions needs clearer payment state and next steps.';
    }

    return hasData
      ? 'Watch how this family behaves before deciding where to invest.'
      : 'This family is still too small to read confidently.';
  };

  const getCtaAction = (ctaId: string) => {
    if (ctaId === 'best_tools_submit' || ctaId === 'ai-coding-tools_submit' || ctaId === 'ai-video-tools_submit') {
      return 'Moves list visitors into the submit flow.';
    }
    if (ctaId === 'best_tools_pricing') {
      return 'Sends list visitors into the pricing page.';
    }
    if (ctaId.endsWith('_back')) {
      return 'Routes readers back to the list hub.';
    }
    if (ctaId === 'pricing_submit' || ctaId === 'pricing_submit_footer' || ctaId === 'pricing_submit_again') {
      return 'Pushes interested visitors into the submit flow.';
    }
    if (ctaId === 'pricing_claim') {
      return 'Routes owners into the claim listing flow.';
    }
    if (ctaId === 'pricing_contact_paid_options' || ctaId === 'pricing_contact_footer') {
      return 'Opens the paid listing contact path.';
    }
    if (ctaId === 'pricing_view_submissions') {
      return 'Shows users their current submission status.';
    }
    if (ctaId === 'submit_contact_paid_listing') {
      return 'Starts the paid listing contact flow from submit.';
    }
    if (ctaId === 'submit_view_developer_listing') {
      return 'Moves users toward the developer listing claim page.';
    }
    if (ctaId === 'developer_listing_go_submit') {
      return 'Moves owners from claim interest into the submit flow.';
    }
    if (ctaId === 'developer_listing_email_claim') {
      return 'Lets owners claim by email when they prefer a direct route.';
    }

    return 'Review whether this CTA should send users somewhere clearer.';
  };

  const getPageQueuePriority = (pageType: string) => {
    if (pageType === 'tool_detail') return 'High';
    if (pageType === 'guide') return 'High';
    if (pageType === 'pricing') return 'High';
    if (pageType === 'submit') return 'High';
    if (pageType === 'best_ai_tools') return 'High';
    if (pageType === 'best_ai_tools_topic') return 'High';
    if (pageType === 'home') return 'Medium';
    if (pageType === 'category') return 'Medium';
    if (pageType === 'developer_listing') return 'Medium';
    if (pageType === 'profile_submissions') return 'Medium';
    if (pageType === 'explore') return 'Low';
    return 'Low';
  };

  const getPageQueueReason = (pageType: string) => {
    if (pageType === 'tool_detail') {
      return 'These pages convert the most intent into clicks, favorites, and submissions.';
    }
    if (pageType === 'guide') {
      return 'These pages help users decide and can push traffic into comparison and detail pages.';
    }
    if (pageType === 'home') {
      return 'The homepage controls first impressions and where traffic flows next.';
    }
    if (pageType === 'category') {
      return 'Category pages need enough supply and clear filters to stay useful.';
    }
    if (pageType === 'best_ai_tools') {
      return 'The hub should funnel visitors into the most relevant topic lists.';
    }
    if (pageType === 'best_ai_tools_topic') {
      return 'Topic pages should make the detail-page and official-site CTA obvious.';
    }
    if (pageType === 'explore') {
      return 'Explore is useful, but it usually needs less immediate attention than conversion pages.';
    }
    return 'These visits need a manual review to understand where they should be routed.';
  };

  const focusCategories = topCategories.slice(0, 3);
  const pageSummaryOrder = [
    'home',
    'tool_detail',
    'guide',
    'category',
    'explore',
    'best_ai_tools',
    'best_ai_tools_topic',
    'other',
  ] as const;
  const pageSummaryMap = new Map(pageAccessReport.summary.map((item) => [item.pageType, item]));
  const familyBreakdownMap = new Map(pageAccessReport.familyBreakdown.map((item) => [item.pageType, item]));
  const pageSummaryItems = pageSummaryOrder.map((pageType) => {
    const item = pageSummaryMap.get(pageType);

    return {
      pageType,
      label: getPageSummaryLabel(pageType),
      views: item?.views || 0,
      uniqueVisitors: item?.uniqueVisitors || 0,
      percentage: item?.percentage || 0,
    };
  });
  const topPriorityPage = pageSummaryItems.filter((item) => item.views > 0).sort((a, b) => b.views - a.views)[0];
  const detailShare = pageSummaryMap.get('tool_detail')?.percentage || 0;
  const guideShare = pageSummaryMap.get('guide')?.percentage || 0;
  const homeShare = pageSummaryMap.get('home')?.percentage || 0;
  const categoryShare = pageSummaryMap.get('category')?.percentage || 0;
  const exploreShare = pageSummaryMap.get('explore')?.percentage || 0;
  const familyBreakdownItems = pageSummaryOrder.map((pageType) => {
    const item = familyBreakdownMap.get(pageType);

    return {
      pageType,
      label: getPageSummaryLabel(pageType),
      views: item?.views || 0,
      uniqueVisitors: item?.uniqueVisitors || 0,
      percentage: item?.percentage || 0,
      topPages: item?.topPages || [],
    };
  });
  const pageWorkQueueItems = familyBreakdownItems
    .filter((item) => item.views > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map((item) => ({
      ...item,
      topPage: item.topPages[0] || null,
      nextAction: getPageAction(item.pageType),
      priority: getPageQueuePriority(item.pageType),
      reason: getPageQueueReason(item.pageType),
    }));
  const pageTrendItems = pageAccessTrend.items.filter((item) => item.currentViews > 0 || item.previousViews > 0);
  const contentPriorityItems = [...pageTrendItems]
    .sort((a, b) => b.currentViews - a.currentViews || b.changePercent - a.changePercent)
    .slice(0, 3);
  const pageFocusSignals = [
    {
      label: 'Homepage',
      value: homeShare,
      summary: getPageFocusSummary('home', homeShare > 0),
    },
    {
      label: 'Tool detail',
      value: detailShare,
      summary: getPageFocusSummary('tool_detail', detailShare > 0),
    },
    {
      label: 'Guides',
      value: guideShare,
      summary: getPageFocusSummary('guide', guideShare > 0),
    },
    {
      label: 'Categories',
      value: categoryShare,
      summary: getPageFocusSummary('category', categoryShare > 0),
    },
    {
      label: 'Explore',
      value: exploreShare,
      summary: getPageFocusSummary('explore', exploreShare > 0),
    },
  ];
  const ctaTopItems = ctaClickReport.topCtas.slice(0, 6);
  const ctaPageSummaryItems = ctaClickReport.summary.slice(0, 4);
  const ctaTrendItems = ctaClickTrend.items.slice(0, 6);
  const toLocalizedPath = (pagePath: string) => {
    if (!pagePath || pagePath === 'unknown') {
      return null;
    }

    return `/${locale}${pagePath.startsWith('/') ? pagePath : `/${pagePath}`}`;
  };

  const isInternalHref = (href: string) => href.startsWith('/');

  return (
    <div>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-slate-900'>Analytics</h1>
        <p className='mt-2 text-slate-600'>Detailed insights into your site performance and user behavior</p>
      </div>

      {/* Overview Metrics */}
      <div className='mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5'>
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

        <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-slate-600'>Total Users</p>
              <p className='mt-2 text-3xl font-semibold text-slate-900'>{metrics.totalUsers.toLocaleString()}</p>
            </div>
            <div className='rounded-full bg-slate-100 p-3'>
              <Globe className='h-6 w-6 text-slate-700' />
            </div>
          </div>
        </div>
      </div>

      <div className='mb-8'>
        <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>CTA Clicks</h2>
            <p className='mt-1 text-sm text-slate-600'>
              Which call-to-action buttons are actually moving people into the next step.
            </p>
          </div>
          <div className='text-sm text-slate-500'>
            {ctaClickReport.totalClicks.toLocaleString()} clicks ·{' '}
            {ctaClickReport.totalUniqueVisitors.toLocaleString()} visitors
          </div>
        </div>

        <div className='mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          <div className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>CTA clicks</p>
            <p className='mt-2 text-3xl font-semibold text-slate-900'>{ctaClickReport.totalClicks.toLocaleString()}</p>
            <p className='mt-2 text-sm text-slate-500'>All tracked CTA events in this range</p>
          </div>
          <div className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Unique visitors</p>
            <p className='mt-2 text-3xl font-semibold text-slate-900'>
              {ctaClickReport.totalUniqueVisitors.toLocaleString()}
            </p>
            <p className='mt-2 text-sm text-slate-500'>Sessions that clicked at least one CTA</p>
          </div>
          <div className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Top CTA share</p>
            <p className='mt-2 text-3xl font-semibold text-slate-900'>
              {ctaTopItems[0]?.percentage.toFixed(1) || '0.0'}%
            </p>
            <p className='mt-2 text-sm text-slate-500'>Share of all CTA clicks</p>
          </div>
          <div className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>CTA families</p>
            <p className='mt-2 text-3xl font-semibold text-slate-900'>{ctaPageSummaryItems.length}</p>
            <p className='mt-2 text-sm text-slate-500'>Pricing, submit, claim, and submissions</p>
          </div>
        </div>

        <div className='grid gap-4 lg:grid-cols-[1.1fr_0.9fr]'>
          <div className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
            <div className='flex items-end justify-between gap-3'>
              <div>
                <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>Top CTA buttons</p>
                <h3 className='mt-1 text-xl font-bold text-slate-950'>What people click most</h3>
              </div>
              <p className='text-sm text-slate-500'>Ranked by total clicks</p>
            </div>

            <div className='mt-4 space-y-3'>
              {ctaTopItems.length > 0 ? (
                ctaTopItems.map((item) => (
                  <div key={`${item.ctaId}:${item.pageType}`} className='rounded-lg border border-slate-200 p-4'>
                    <div className='flex items-start justify-between gap-3'>
                      <div>
                        <p className='text-sm font-semibold text-slate-950'>{item.ctaLabel}</p>
                        <p className='mt-1 text-xs text-slate-500'>
                          {item.pageLabel} · {item.clicks.toLocaleString()} clicks ·{' '}
                          {item.uniqueVisitors.toLocaleString()} visitors
                        </p>
                      </div>
                      <span className='rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700'>
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <p className='mt-3 text-sm leading-6 text-slate-600'>{getCtaAction(item.ctaId)}</p>
                    {(() => {
                      if (!item.href) {
                        return null;
                      }

                      if (isInternalHref(item.href)) {
                        return (
                          <Link
                            href={item.href}
                            className='mt-3 inline-flex items-center gap-1 text-sm font-medium text-cyan-700 hover:underline'
                          >
                            Open target
                            <ArrowUpRight className='h-4 w-4' />
                          </Link>
                        );
                      }

                      return (
                        <a
                          href={item.href}
                          target='_blank'
                          rel='noreferrer'
                          className='mt-3 inline-flex items-center gap-1 text-sm font-medium text-cyan-700 hover:underline'
                        >
                          Open target
                          <ArrowUpRight className='h-4 w-4' />
                        </a>
                      );
                    })()}
                  </div>
                ))
              ) : (
                <div className='rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500'>
                  No CTA click data yet.
                </div>
              )}
            </div>
          </div>

          <div className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
            <div className='flex items-end justify-between gap-3'>
              <div>
                <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>By page family</p>
                <h3 className='mt-1 text-xl font-bold text-slate-950'>Where CTA clicks happen</h3>
              </div>
              <p className='text-sm text-slate-500'>Distribution by page type</p>
            </div>

            <div className='mt-4 space-y-3'>
              {ctaPageSummaryItems.length > 0 ? (
                ctaPageSummaryItems.map((item) => (
                  <div key={item.pageType} className='rounded-lg border border-slate-200 p-4'>
                    <div className='flex items-start justify-between gap-3'>
                      <div>
                        <p className='text-sm font-semibold text-slate-950'>{item.label}</p>
                        <p className='mt-1 text-xs text-slate-500'>
                          {item.clicks.toLocaleString()} clicks · {item.uniqueVisitors.toLocaleString()} visitors
                        </p>
                      </div>
                      <span className='rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700'>
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className='rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500'>
                  No page family CTA data yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className='mb-8'>
        <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>CTA Momentum</h2>
            <p className='mt-1 text-sm text-slate-600'>
              Which buttons are gaining or losing traction versus the previous period.
            </p>
          </div>
          <div className='text-sm text-slate-500'>
            {ctaClickTrend.currentClicks.toLocaleString()} current · {ctaClickTrend.previousClicks.toLocaleString()} previous
          </div>
        </div>

        <div className='mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          <div className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Current clicks</p>
            <p className='mt-2 text-3xl font-semibold text-slate-900'>{ctaClickTrend.currentClicks.toLocaleString()}</p>
            <p className='mt-2 text-sm text-slate-500'>Current range only</p>
          </div>
          <div className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Previous clicks</p>
            <p className='mt-2 text-3xl font-semibold text-slate-900'>{ctaClickTrend.previousClicks.toLocaleString()}</p>
            <p className='mt-2 text-sm text-slate-500'>Comparable previous range</p>
          </div>
          <div className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Current visitors</p>
            <p className='mt-2 text-3xl font-semibold text-slate-900'>
              {ctaClickTrend.currentUniqueVisitors.toLocaleString()}
            </p>
            <p className='mt-2 text-sm text-slate-500'>Sessions that clicked a CTA</p>
          </div>
          <div className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Previous visitors</p>
            <p className='mt-2 text-3xl font-semibold text-slate-900'>
              {ctaClickTrend.previousUniqueVisitors.toLocaleString()}
            </p>
            <p className='mt-2 text-sm text-slate-500'>Comparable previous sessions</p>
          </div>
        </div>

        <div className='grid gap-4 lg:grid-cols-2'>
          {ctaTrendItems.length > 0 ? (
            ctaTrendItems.map((item) => (
              <div key={`${item.ctaId}:${item.pageType}`} className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-sm font-semibold text-slate-950'>{item.ctaLabel}</p>
                    <p className='mt-1 text-xs text-slate-500'>
                      {item.pageLabel} · {item.currentClicks.toLocaleString()} current ·{' '}
                      {item.previousClicks.toLocaleString()} previous
                    </p>
                  </div>
                  <div
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      item.changePercent >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {item.changePercent >= 0 ? '+' : ''}
                    {item.changePercent.toFixed(1)}%
                  </div>
                </div>
                <p className='mt-3 text-sm leading-6 text-slate-600'>{getCtaAction(item.ctaId)}</p>
              </div>
            ))
          ) : (
            <div className='rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500'>
              No CTA trend data yet.
            </div>
          )}
        </div>
      </div>

      {/* Page Access Report */}
      <div className='mb-8'>
        <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>Page Access Report</h2>
            <p className='mt-1 text-sm text-slate-600'>
              Where people actually spend time across homepage, detail pages, and guides.
            </p>
          </div>
          <div className='text-sm text-slate-500'>
            {pageAccessReport.totalViews.toLocaleString()} page views ·{' '}
            {pageAccessReport.totalUniqueVisitors.toLocaleString()} visitors
          </div>
        </div>

        <div className='mb-4 rounded-lg border border-cyan-100 bg-cyan-50 p-4 shadow-sm'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
            <div>
              <div className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>Current focus</div>
              <div className='mt-1 text-base font-semibold text-slate-950'>
                {topPriorityPage
                  ? `${topPriorityPage.label} is currently the most visited page type`
                  : 'No page view data yet'}
              </div>
              <p className='mt-1 text-sm leading-6 text-slate-600'>
                {topPriorityPage
                  ? getPageAction(topPriorityPage.pageType)
                  : 'Once traffic grows, this report will show which page family deserves the next round of work.'}
              </p>
            </div>
            <div className='rounded-full bg-white px-3 py-1 text-sm font-semibold text-cyan-800 ring-1 ring-cyan-100'>
              {topPriorityPage ? `${topPriorityPage.views.toLocaleString()} views` : 'Waiting for data'}
            </div>
          </div>
        </div>

        <div className='mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          <div className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Views, current period</p>
            <p className='mt-2 text-3xl font-semibold text-slate-900'>
              {pageAccessTrend.currentViews.toLocaleString()}
            </p>
            <p className='mt-2 text-sm text-slate-500'>
              Previous period: {pageAccessTrend.previousViews.toLocaleString()}
            </p>
          </div>
          <div className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Unique visitors, current period</p>
            <p className='mt-2 text-3xl font-semibold text-slate-900'>
              {pageAccessTrend.currentUniqueVisitors.toLocaleString()}
            </p>
            <p className='mt-2 text-sm text-slate-500'>
              Previous period: {pageAccessTrend.previousUniqueVisitors.toLocaleString()}
            </p>
          </div>
          <div className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Period change</p>
            <p className='mt-2 text-3xl font-semibold text-slate-900'>
              {getPeriodChangeLabel(pageAccessTrend.currentViews, pageAccessTrend.previousViews)}
            </p>
            <p className='mt-2 text-sm text-slate-500'>All page families combined</p>
          </div>
          <div className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Tracked families</p>
            <p className='mt-2 text-3xl font-semibold text-slate-900'>{pageTrendItems.length}</p>
            <p className='mt-2 text-sm text-slate-500'>home, detail, guide, category, explore, other</p>
          </div>
        </div>

        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {pageSummaryItems.map((item) => (
            <div key={item.pageType} className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <div className='text-xs font-medium uppercase tracking-wide text-slate-500'>{item.label}</div>
                  <div className='mt-2 text-3xl font-semibold text-slate-900'>{item.views.toLocaleString()}</div>
                </div>
                <div className='rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700'>
                  {item.percentage.toFixed(1)}%
                </div>
              </div>
              <div className='mt-3 text-sm text-slate-600'>{item.uniqueVisitors.toLocaleString()} unique visitors</div>
              <p className='mt-3 text-sm leading-6 text-slate-600'>{getPageAction(item.pageType)}</p>
            </div>
          ))}
        </div>

        <div className='mt-4 grid gap-4 md:grid-cols-2'>
          {pageTrendItems.map((item) => (
            <div key={item.pageType} className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <div className='text-xs font-medium uppercase tracking-wide text-slate-500'>{item.label}</div>
                  <div className='mt-2 text-2xl font-semibold text-slate-900'>{item.currentViews.toLocaleString()}</div>
                  <p className='mt-1 text-sm text-slate-500'>Previous: {item.previousViews.toLocaleString()} views</p>
                </div>
                <div
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    item.changePercent >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {item.changePercent >= 0 ? '+' : ''}
                  {item.changePercent.toFixed(1)}%
                </div>
              </div>
              <p className='mt-3 text-sm leading-6 text-slate-600'>{getPageTrendSummary(item.pageType)}</p>
            </div>
          ))}
        </div>

        <div className='mt-4 rounded-lg border border-cyan-100 bg-cyan-50/60 p-5 shadow-sm'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>Content priority</p>
              <h3 className='mt-1 text-xl font-bold text-slate-950'>What to work on next</h3>
            </div>
            <p className='max-w-2xl text-sm leading-6 text-slate-600'>
              This turns the page report into a short work queue: where traffic is already showing up, where to deepen,
              and which page family should get the next pass.
            </p>
          </div>
          <div className='mt-4 grid gap-3 md:grid-cols-3'>
            {contentPriorityItems.map((item) => (
              <div key={item.pageType} className='rounded-lg border border-white bg-white p-4 shadow-sm'>
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-sm font-semibold text-slate-950'>{item.label}</p>
                    <p className='mt-1 text-xs text-slate-500'>{item.currentViews.toLocaleString()} views</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      item.changePercent >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {item.changePercent >= 0 ? '+' : ''}
                    {item.changePercent.toFixed(1)}%
                  </span>
                </div>
                <p className='mt-3 text-sm leading-6 text-slate-600'>{getPagePrioritySummary(item.pageType)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className='mt-4 grid gap-4 xl:grid-cols-2'>
          {familyBreakdownItems.map((item) => (
            <div key={item.pageType} className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <div className='text-xs font-medium uppercase tracking-wide text-slate-500'>{item.label}</div>
                  <div className='mt-2 text-2xl font-semibold text-slate-900'>{item.views.toLocaleString()}</div>
                  <p className='mt-1 text-sm text-slate-600'>{item.uniqueVisitors.toLocaleString()} unique visitors</p>
                </div>
                <div className='rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700'>
                  {item.percentage.toFixed(1)}%
                </div>
              </div>

              <div className='mt-4 space-y-2'>
                {item.topPages.length > 0 ? (
                  item.topPages.map((page) => (
                    <div
                      key={`${item.pageType}:${page.pagePath}`}
                      className='rounded-lg border border-slate-200 bg-slate-50 px-3 py-2'
                    >
                      <div className='flex items-start justify-between gap-3'>
                        <div>
                          <p className='text-sm font-medium text-slate-900'>
                            {toLocalizedPath(page.pagePath) ? (
                              <Link
                                href={toLocalizedPath(page.pagePath)!}
                                className='hover:text-cyan-700 hover:underline'
                              >
                                {page.pagePath}
                              </Link>
                            ) : (
                              page.pagePath
                            )}
                          </p>
                          <p className='mt-1 text-xs text-slate-500'>
                            {page.views.toLocaleString()} views · {page.uniqueVisitors.toLocaleString()} visitors
                          </p>
                        </div>
                        {toLocalizedPath(page.pagePath) ? (
                          <Link
                            href={toLocalizedPath(page.pagePath)!}
                            className='rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-600 hover:text-cyan-700'
                          >
                            Open
                          </Link>
                        ) : (
                          <span className='rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-600'>
                            Top
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500'>
                    No page-level data yet for this family.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className='mt-4 grid gap-4 lg:grid-cols-2'>
          {pageFocusSignals.map((signal) => (
            <div key={signal.label} className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <div className='text-xs font-medium uppercase tracking-wide text-slate-500'>{signal.label}</div>
                  <div className='mt-2 text-2xl font-semibold text-slate-900'>{signal.value.toFixed(1)}%</div>
                </div>
                <div className='rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600'>Share</div>
              </div>
              <p className='mt-3 text-sm leading-6 text-slate-600'>{signal.summary}</p>
            </div>
          ))}
        </div>

        <div className='mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm'>
          <table className='min-w-full divide-y divide-slate-200'>
            <thead className='bg-slate-50'>
              <tr>
                <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Page
                </th>
                <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Type
                </th>
                <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Views
                </th>
                <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Visitors
                </th>
                <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Next action
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 bg-white'>
              {pageAccessReport.topPages.map((page) => (
                <tr key={`${page.pageType}:${page.pagePath}`} className='hover:bg-slate-50'>
                  <td className='px-4 py-3 text-sm text-slate-900'>
                    {toLocalizedPath(page.pagePath) ? (
                      <Link href={toLocalizedPath(page.pagePath)!} className='hover:text-cyan-700 hover:underline'>
                        {page.pagePath}
                      </Link>
                    ) : (
                      page.pagePath
                    )}
                  </td>
                  <td className='px-4 py-3 text-sm text-slate-600'>{page.label}</td>
                  <td className='px-4 py-3 text-right text-sm font-medium text-slate-900'>
                    {page.views.toLocaleString()}
                  </td>
                  <td className='px-4 py-3 text-right text-sm text-slate-600'>
                    {page.uniqueVisitors.toLocaleString()}
                  </td>
                  <td className='px-4 py-3 text-sm text-slate-600'>{getPageAction(page.pageType)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='mt-4 rounded-lg border border-cyan-100 bg-cyan-50/60 p-5 shadow-sm'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-wide text-cyan-700'>Page work queue</p>
              <h3 className='mt-1 text-xl font-bold text-slate-950'>What to work on first</h3>
            </div>
            <p className='max-w-2xl text-sm leading-6 text-slate-600'>
              This is the operational version of the report: the page families getting the most visits and the next
              content move for each one.
            </p>
          </div>

          <div className='mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
            {pageWorkQueueItems.length > 0 ? (
              pageWorkQueueItems.map((item) => (
                <div key={item.pageType} className='rounded-lg border border-white bg-white p-4 shadow-sm'>
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <p className='text-sm font-semibold text-slate-950'>{item.label}</p>
                      <p className='mt-1 text-xs text-slate-500'>
                        {item.views.toLocaleString()} views · {item.uniqueVisitors.toLocaleString()} visitors
                      </p>
                    </div>
                    <div className='flex flex-col items-end gap-2'>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getPriorityBadgeClass(item.priority)}`}
                      >
                        {item.priority} priority
                      </span>
                      <span className='rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700'>
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <p className='mt-3 text-sm leading-6 text-slate-600'>{item.reason}</p>
                  <p className='mt-2 text-sm font-medium text-slate-800'>{item.nextAction}</p>
                  <div className='mt-3 flex flex-wrap gap-2'>
                    {getPageRecommendations(item.pageType).map((recommendation) => (
                      <span
                        key={`${item.pageType}:${recommendation}`}
                        className='rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700'
                      >
                        {recommendation}
                      </span>
                    ))}
                  </div>

                  <div className='mt-4 flex flex-wrap gap-2'>
                    {item.topPage && toLocalizedPath(item.topPage.pagePath) ? (
                      <Link
                        href={toLocalizedPath(item.topPage.pagePath)!}
                        className='inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800'
                      >
                        Open top page
                        <ArrowUpRight className='h-4 w-4' />
                      </Link>
                    ) : null}
                    <Link
                      href={getFamilyLandingHref(item.pageType)}
                      className='inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-cyan-200 hover:text-cyan-700'
                    >
                      Open family
                      <ArrowUpRight className='h-4 w-4' />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className='rounded-lg border border-dashed border-cyan-200 bg-white p-4 text-sm text-slate-500'>
                No page-level queue yet. Once page views land, the highest-traffic families will show up here.
              </div>
            )}
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
                  <div className='text-xs font-medium uppercase tracking-wide text-slate-500'>
                    Priority #{index + 1}
                  </div>
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

      {/* Priority Media Queue */}
      <div className='mb-8'>
        <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>Priority Media Queue</h2>
            <p className='mt-1 text-sm text-slate-600'>
              The published tools most worth fixing first when we want cleaner cards on the homepage, Explore, and
              category pages.
            </p>
          </div>
          <Link
            href='/admin/tools?status=published&needsMedia=1'
            className='inline-flex items-center gap-1 text-sm font-medium text-cyan-700 hover:text-cyan-800'
          >
            Open media queue
            <ArrowUpRight className='h-4 w-4' />
          </Link>
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
                  Media gaps
                </th>
                <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Exposure
                </th>
                <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Priority
                </th>
                <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Action
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 bg-white'>
              {priorityMediaQueue.map((tool, index) => (
                <tr key={tool.id} className={index === 0 ? 'bg-violet-50/30' : ''}>
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
                      : tool.categorySlug || 'Uncategorized'}
                  </td>
                  <td className='px-4 py-4'>
                    <div className='flex flex-wrap gap-2'>
                      {tool.mediaIssues.map((issue) => (
                        <span
                          key={issue}
                          className='rounded-full bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700'
                        >
                          {issue}
                        </span>
                      ))}
                    </div>
                    {tool.mediaReason && <div className='mt-2 text-xs text-slate-500'>{tool.mediaReason}</div>}
                  </td>
                  <td className='px-4 py-4 text-right text-sm text-slate-700'>
                    <div>{tool.views.toLocaleString()} views</div>
                    <div className='text-xs text-slate-500'>{tool.clicks.toLocaleString()} clicks</div>
                  </td>
                  <td className='px-4 py-4 text-right'>
                    <div className='inline-flex flex-col items-end gap-1'>
                      <span className='rounded-full bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-700'>
                        {tool.priorityScore}
                      </span>
                      <span className='text-xs text-slate-500'>quality {tool.qualityScore}</span>
                    </div>
                  </td>
                  <td className='px-4 py-4 text-right'>
                    <Link
                      href={`/admin/tools/${tool.id}/edit`}
                      className='inline-flex items-center gap-1 text-sm font-medium text-cyan-700 hover:text-cyan-800'
                    >
                      Edit
                      <ArrowUpRight className='h-4 w-4' />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {priorityMediaQueue.length === 0 && (
            <div className='border-t border-slate-100 p-4 text-sm text-slate-500'>
              No urgent media gaps right now. Nice.
            </div>
          )}
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
                <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Action
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
                  <td className='px-4 py-4 text-right'>
                    <Link
                      href={`/admin/tools/${tool.id}/edit`}
                      className='inline-flex items-center gap-1 text-sm font-medium text-cyan-700 hover:text-cyan-800'
                    >
                      Edit
                      <ArrowUpRight className='h-4 w-4' />
                    </Link>
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
