import Link from 'next/link';
import { ArrowUpRight, BarChart3, Globe, Layers3, Search, ShieldAlert, TrendingUp } from 'lucide-react';

import AdminOutreachClassificationTable from '@/components/admin/AdminOutreachClassificationTable';
import AdminOutreachQueueTable from '@/components/admin/AdminOutreachQueueTable';
import {
  getCommercialIntentReport,
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
import { getAdminToolClaimsSummary } from '@/app/actions/admin/claims';
import {
  getDeveloperOutreachQueue,
  getFeaturedPlacementStats,
  getOperationalStats,
  getOutreachCommercialBridgeSummary,
  getOutreachHistorySummary,
  getOutreachExecutorSummary,
  getOutreachNeedsClassification,
  getSubmissionFunnelStats,
  getSubmissionRejectionReasonStats,
} from '@/app/actions/admin/tools';

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
  const commercialIntentReport = await getCommercialIntentReport(range, 10);
  const pageAccessTrend = await getPageAccessTrend(range === 'all' ? '30d' : range);
  const operationalStats = await getOperationalStats(range);
  const funnel = await getSubmissionFunnelStats(range);
  const rejectionReasons = await getSubmissionRejectionReasonStats(range, 5);
  const featuredPlacementStats = await getFeaturedPlacementStats();
  const outreachQueue = await getDeveloperOutreachQueue(12);
  const outreachCommercialBridge = await getOutreachCommercialBridgeSummary();
  const outreachExecutors = await getOutreachExecutorSummary(5);
  const outreachHistorySummary = await getOutreachHistorySummary();
  const outreachNeedsClassification =
    outreachHistorySummary.unclassifiedClosedCount > 0 ? await getOutreachNeedsClassification(12) : [];
  const claimSummary = await getAdminToolClaimsSummary();
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
    if (pageType === 'best_ai_tools_topic') {
      return 'If topic pages are rising, keep tool cards and external CTAs sharp.';
    }
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

  const rejectionReasonRows = rejectionReasons.reasons.map((item) => ({
    ...item,
    share: rejectionReasons.totalRejected > 0 ? Math.round((item.count / rejectionReasons.totalRejected) * 100) : 0,
  }));
  const recordedRejectionCount = rejectionReasonRows
    .filter((item) => item.reason !== 'No reason recorded')
    .reduce((sum, item) => sum + item.count, 0);
  const rejectionReasonCoverage =
    rejectionReasons.totalRejected > 0
      ? Math.round((recordedRejectionCount / rejectionReasons.totalRejected) * 100)
      : 0;
  const claimStatusRows = [
    { key: 'new', label: 'New', count: claimSummary.newCount, tone: 'cyan' },
    { key: 'contacted', label: 'Contacted', count: claimSummary.contactedCount, tone: 'blue' },
    { key: 'claimed', label: 'Claimed', count: claimSummary.claimedCount, tone: 'emerald' },
    { key: 'invalid', label: 'Invalid', count: claimSummary.invalidCount, tone: 'rose' },
  ].map((item) => ({
    ...item,
    share: claimSummary.total > 0 ? Math.round((item.count / claimSummary.total) * 100) : 0,
  }));
  const claimResolutionRate =
    claimSummary.total > 0
      ? Math.round(((claimSummary.claimedCount + claimSummary.invalidCount) / claimSummary.total) * 100)
      : 0;
  const outreachStatusRows = [
    { key: 'not_started', label: 'Not started', count: outreachQueue.filter((item) => item.outreachStatus === 'not_started').length },
    { key: 'contacted', label: 'Contacted', count: outreachQueue.filter((item) => item.outreachStatus === 'contacted').length },
    {
      key: 'waiting_reply',
      label: 'Waiting reply',
      count: outreachQueue.filter((item) => item.outreachStatus === 'waiting_reply').length,
    },
    {
      key: 'follow_up_due',
      label: 'Follow-up due',
      count: outreachQueue.filter((item) => item.outreachStatus === 'follow_up_due').length,
    },
    { key: 'closed', label: 'Closed', count: outreachQueue.filter((item) => item.outreachStatus === 'closed').length },
  ].map((item) => ({
    ...item,
    share: outreachQueue.length > 0 ? Math.round((item.count / outreachQueue.length) * 100) : 0,
  }));
  const outreachStartedCount = outreachQueue.filter((item) => item.outreachStatus !== 'not_started').length;
  const outreachStartedRate = outreachQueue.length > 0 ? Math.round((outreachStartedCount / outreachQueue.length) * 100) : 0;
  const outreachActiveCount = outreachQueue.filter(
    (item) => item.outreachStatus === 'contacted' || item.outreachStatus === 'waiting_reply' || item.outreachStatus === 'follow_up_due',
  ).length;
  const outreachClosedRate =
    outreachHistorySummary.totalTracked > 0
      ? Math.round((outreachHistorySummary.closedCount / outreachHistorySummary.totalTracked) * 100)
      : 0;
  const outreachPaidPlanRate =
    outreachCommercialBridge.claimedFromOutreachCount > 0
      ? Math.round((outreachCommercialBridge.paidPlanCount / outreachCommercialBridge.claimedFromOutreachCount) * 100)
      : 0;
  const outreachPaymentConfirmedRate =
    outreachCommercialBridge.claimedFromOutreachCount > 0
      ? Math.round((outreachCommercialBridge.paymentConfirmedCount / outreachCommercialBridge.claimedFromOutreachCount) * 100)
      : 0;
  const getTrendLabel = (current: number, previous: number) => {
    if (current === 0 && previous === 0) return 'No activity in either period';
    if (previous === 0) return `${current} in the last 7d · no prior 7d baseline`;

    const change = Math.round(((current - previous) / previous) * 100);
    const sign = change > 0 ? '+' : '';
    return `${current} in the last 7d · ${sign}${change}% vs prior 7d`;
  };
  const outreachClosedReasonLabelMap = {
    claimed: 'Claimed listing',
    no_reply: 'No reply',
    invalid_contact: 'Invalid contact',
    not_interested: 'Not interested',
  } as const;
  const getClosedReasonCount = (
    key: keyof typeof outreachClosedReasonLabelMap,
    source: {
      claimedCount: number;
      noReplyCount: number;
      invalidContactCount: number;
      notInterestedCount: number;
    },
  ) => {
    if (key === 'claimed') return source.claimedCount;
    if (key === 'no_reply') return source.noReplyCount;
    if (key === 'invalid_contact') return source.invalidContactCount;
    return source.notInterestedCount;
  };
  const outreachClosedReasonRows = Object.entries(outreachClosedReasonLabelMap)
    .map(([key, label]) => ({
      key,
      label,
      count: getClosedReasonCount(key as keyof typeof outreachClosedReasonLabelMap, {
        claimedCount: outreachHistorySummary.claimedCount,
        noReplyCount: outreachHistorySummary.noReplyCount,
        invalidContactCount: outreachHistorySummary.invalidContactCount,
        notInterestedCount: outreachHistorySummary.notInterestedCount,
      }),
    }))
    .filter((item) => item.count > 0);
  const outreachUnclassifiedClosedCount = outreachHistorySummary.unclassifiedClosedCount;
  const commercialEntryRows = commercialIntentReport.sources.map((item) => ({
    ...item,
    downstreamConversions: item.claimSubmissions + item.checkoutStarts,
    ctaClicks: item.submitClicks + item.claimClicks,
    pageToCtaRate:
      item.pageViews > 0 ? Math.round(((item.submitClicks + item.claimClicks) / item.pageViews) * 100 * 10) / 10 : 0,
    pageToDownstreamRate:
      item.pageViews > 0
        ? Math.round(((item.claimSubmissions + item.checkoutStarts) / item.pageViews) * 100 * 10) / 10
        : 0,
  }));
  const commercialEntryShareBase =
    commercialIntentReport.totalClaimSubmissions + commercialIntentReport.totalCheckoutStarts;
  const getCommercialSourceAction = (item: (typeof commercialEntryRows)[number]) => {
    if (item.checkoutStarts > 0) return 'Keep this route clean and reduce payment friction';
    if (item.claimSubmissions > 0) return 'Follow up fast and route qualified owners into paid paths';
    if (item.submitClicks + item.claimClicks >= 3) {
      return 'Strengthen the next step copy so intent turns into form completion';
    }
    return 'Watch this source until it proves real downstream intent';
  };
  const getClaimStatusToneClass = (key: string) => {
    if (key === 'claimed') return 'bg-emerald-500';
    if (key === 'contacted') return 'bg-cyan-500';
    if (key === 'invalid') return 'bg-rose-500';
    return 'bg-blue-500';
  };
  const getOutreachStatusToneClass = (key: string) => {
    if (key === 'contacted') return 'bg-cyan-500';
    if (key === 'waiting_reply') return 'bg-blue-500';
    if (key === 'follow_up_due') return 'bg-amber-500';
    if (key === 'closed') return 'bg-emerald-500';
    return 'bg-slate-400';
  };
  const featuredExpiringSoon = featuredPlacementStats.placements
    .filter((item) => item.daysLeft !== null && item.daysLeft <= 3)
    .sort((a, b) => (a.daysLeft || 0) - (b.daysLeft || 0));
  let featuredRenewalText = 'No featured window is close enough to need a reminder yet.';
  if (featuredExpiringSoon.length > 0) {
    featuredRenewalText =
      featuredExpiringSoon[0].daysLeft === 1 ? 'Ends tomorrow.' : `Ends in ${featuredExpiringSoon[0].daysLeft} days.`;
  }
  const featuredClickThroughRate =
    featuredPlacementStats.totalViews > 0
      ? Math.round((featuredPlacementStats.totalClicks / featuredPlacementStats.totalViews) * 100)
      : 0;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const outreachDueRows = outreachQueue.filter((item) => {
    if (!item.outreachNextFollowUpAt) return false;

    const target = new Date(item.outreachNextFollowUpAt);
    if (Number.isNaN(target.getTime())) return false;

    const targetStart = new Date(target);
    targetStart.setHours(0, 0, 0, 0);
    return targetStart.getTime() <= todayStart.getTime();
  });
  const outreachOverdueCount = outreachQueue.filter((item) => {
    if (!item.outreachNextFollowUpAt) return false;

    const target = new Date(item.outreachNextFollowUpAt);
    if (Number.isNaN(target.getTime())) return false;

    const targetStart = new Date(target);
    targetStart.setHours(0, 0, 0, 0);
    return targetStart.getTime() < todayStart.getTime();
  }).length;
  const outreachDueTodayCount = outreachDueRows.length - outreachOverdueCount;
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentOutreachActivity = outreachQueue.filter((item) => {
    if (!item.outreachUpdatedAt) return false;

    const updatedAt = new Date(item.outreachUpdatedAt);
    return !Number.isNaN(updatedAt.getTime()) && updatedAt.getTime() >= sevenDaysAgo.getTime();
  });
  const recentOutreachActiveCount = recentOutreachActivity.filter(
    (item) => item.outreachStatus === 'contacted' || item.outreachStatus === 'waiting_reply' || item.outreachStatus === 'follow_up_due',
  ).length;
  const recentOutreachClosedCount = outreachHistorySummary.recentClosedCount;
  const recentOutreachClosedReasonRows = Object.entries(outreachClosedReasonLabelMap)
    .map(([key, label]) => ({
      key,
      label,
      count: getClosedReasonCount(key as keyof typeof outreachClosedReasonLabelMap, {
        claimedCount: outreachHistorySummary.recentClaimedCount,
        noReplyCount: outreachHistorySummary.recentNoReplyCount,
        invalidContactCount: outreachHistorySummary.recentInvalidContactCount,
        notInterestedCount: outreachHistorySummary.recentNotInterestedCount,
      }),
    }))
    .filter((item) => item.count > 0);
  const recentOutreachStartedCount = recentOutreachActivity.filter((item) => item.outreachStatus !== 'not_started').length;
  const recentOutreachStatusRows = [
    { key: 'contacted', label: 'Touched', count: recentOutreachActivity.filter((item) => item.outreachStatus === 'contacted').length },
    {
      key: 'waiting_reply',
      label: 'Waiting reply',
      count: recentOutreachActivity.filter((item) => item.outreachStatus === 'waiting_reply').length,
    },
    {
      key: 'follow_up_due',
      label: 'Follow-up due',
      count: recentOutreachActivity.filter((item) => item.outreachStatus === 'follow_up_due').length,
    },
    { key: 'closed', label: 'Closed', count: recentOutreachClosedCount },
  ].filter((item) => item.count > 0);
  const latestOutreachUpdate = recentOutreachActivity
    .slice()
    .sort((a, b) => new Date(b.outreachUpdatedAt || 0).getTime() - new Date(a.outreachUpdatedAt || 0).getTime())[0];
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

  const getPageFamilyPrimaryHref = (pageType: string) => {
    if (pageType === 'home') return `/${locale}`;
    if (pageType === 'tool_detail') return `/${locale}/ai`;
    if (pageType === 'guide') return `/${locale}/guides`;
    if (pageType === 'category') return `/${locale}/categories`;
    if (pageType === 'explore') return `/${locale}/explore`;
    if (pageType === 'best_ai_tools') return `/${locale}/best-ai-tools`;
    if (pageType === 'best_ai_tools_topic') return `/${locale}/best-ai-tools/ai-coding-tools`;
    if (pageType === 'pricing') return `/${locale}/pricing`;
    if (pageType === 'submit') return `/${locale}/submit`;
    if (pageType === 'developer_listing') return `/${locale}/developer/listing`;
    if (pageType === 'profile_submissions') return `/${locale}/profile/submissions`;
    return null;
  };

  const getPageFamilySecondaryHref = (pageType: string) => {
    if (pageType === 'pricing' || pageType === 'submit' || pageType === 'profile_submissions') return '/admin/tools';
    if (pageType === 'developer_listing') return '/admin/claims?status=new';
    if (pageType === 'tool_detail' || pageType === 'guide' || pageType === 'best_ai_tools_topic') {
      return '/admin/tools';
    }
    if (pageType === 'category' || pageType === 'explore' || pageType === 'best_ai_tools') return '/admin/analytics';
    return null;
  };

  const getPageFamilySecondaryLabel = (pageType: string) => {
    if (pageType === 'developer_listing') return 'Open claim queue';
    if (pageType === 'pricing' || pageType === 'submit' || pageType === 'profile_submissions') return 'Open tools';
    if (pageType === 'tool_detail' || pageType === 'guide' || pageType === 'best_ai_tools_topic') return 'Review tools';
    if (pageType === 'category' || pageType === 'explore' || pageType === 'best_ai_tools') return 'Open analytics';
    return 'Open admin';
  };

  const getPageFamilyFunnelAction = (item: {
    pageType: string;
    views: number;
    ctaClicks: number;
    downstreamConversions: number;
    checkoutStarts: number;
    claimLeads: number;
  }) => {
    if (item.checkoutStarts > 0) {
      return 'This family already drives paid intent, so protect the path and reduce checkout friction.';
    }
    if (item.claimLeads > 0) {
      return 'This family is producing owner leads, so keep follow-up fast and route qualified owners onward.';
    }
    if (item.ctaClicks > 0 && item.downstreamConversions === 0) {
      return 'People are clicking, but not finishing the next step. Tighten the destination page and form clarity.';
    }
    if (item.views > 0 && item.ctaClicks === 0) {
      return 'Traffic is landing here without moving. Strengthen the CTA placement and next-step promise.';
    }

    return getPageAction(item.pageType);
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
  const ctaPageSummaryMap = new Map(ctaClickReport.summary.map((item) => [item.pageType, item]));
  const commercialFamilyMap = new Map<
  string,
  { submitClicks: number; claimClicks: number; claimLeads: number; checkoutStarts: number }
  >();

  commercialIntentReport.sources.forEach((item) => {
    const current = commercialFamilyMap.get(item.pageType) || {
      submitClicks: 0,
      claimClicks: 0,
      claimLeads: 0,
      checkoutStarts: 0,
    };

    current.submitClicks += item.submitClicks;
    current.claimClicks += item.claimClicks;
    current.claimLeads += item.claimSubmissions;
    current.checkoutStarts += item.checkoutStarts;
    commercialFamilyMap.set(item.pageType, current);
  });

  const highIntentPageFamilyOrder = [
    'pricing',
    'submit',
    'developer_listing',
    'profile_submissions',
    'tool_detail',
    'guide',
    'best_ai_tools',
    'best_ai_tools_topic',
    'home',
    'category',
    'explore',
  ];
  const highIntentPageFamilies = highIntentPageFamilyOrder
    .map((pageType) => {
      const pageSummary = pageSummaryMap.get(pageType);
      const ctaSummary = ctaPageSummaryMap.get(pageType);
      const commercialSummary = commercialFamilyMap.get(pageType);
      const views = pageSummary?.views || 0;
      const uniqueVisitors = pageSummary?.uniqueVisitors || 0;
      const ctaClicks = ctaSummary?.clicks || 0;
      const submitClicks = commercialSummary?.submitClicks || 0;
      const claimClicks = commercialSummary?.claimClicks || 0;
      const claimLeads = commercialSummary?.claimLeads || 0;
      const checkoutStarts = commercialSummary?.checkoutStarts || 0;
      const downstreamConversions = claimLeads + checkoutStarts;

      return {
        pageType,
        label: getPageSummaryLabel(pageType),
        views,
        uniqueVisitors,
        ctaClicks,
        submitClicks,
        claimClicks,
        claimLeads,
        checkoutStarts,
        downstreamConversions,
        viewToCtaRate: views > 0 ? Math.round((ctaClicks / views) * 100 * 10) / 10 : 0,
        viewToDownstreamRate: views > 0 ? Math.round((downstreamConversions / views) * 100 * 10) / 10 : 0,
        ctaToDownstreamRate: ctaClicks > 0 ? Math.round((downstreamConversions / ctaClicks) * 100 * 10) / 10 : 0,
      };
    })
    .filter((item) => item.views > 0 || item.ctaClicks > 0 || item.downstreamConversions > 0);
  const highIntentPageFamilyRows = [...highIntentPageFamilies]
    .sort((a, b) => b.downstreamConversions - a.downstreamConversions || b.ctaClicks - a.ctaClicks || b.views - a.views)
    .slice(0, 6);
  const topDownstreamFamily = highIntentPageFamilyRows[0] || null;
  const topCtaRateFamily = [...highIntentPageFamilies]
    .filter((item) => item.views > 0 && item.ctaClicks > 0)
    .sort((a, b) => b.viewToCtaRate - a.viewToCtaRate || b.ctaClicks - a.ctaClicks)[0];
  const biggestLeakFamily = [...highIntentPageFamilies]
    .filter((item) => item.views > 0 && item.ctaClicks > 0 && item.downstreamConversions === 0)
    .sort((a, b) => b.ctaClicks - a.ctaClicks || b.views - a.views)[0];
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
            {ctaClickReport.totalClicks.toLocaleString()} clicks · {ctaClickReport.totalUniqueVisitors.toLocaleString()}{' '}
            visitors
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
            {ctaClickTrend.currentClicks.toLocaleString()} current · {ctaClickTrend.previousClicks.toLocaleString()}{' '}
            previous
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
            <p className='mt-2 text-3xl font-semibold text-slate-900'>
              {ctaClickTrend.previousClicks.toLocaleString()}
            </p>
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
              <div
                key={`${item.ctaId}:${item.pageType}`}
                className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'
              >
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

      <div className='mb-8'>
        <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>High-Intent Page Funnel</h2>
            <p className='mt-1 text-sm text-slate-600'>
              A page-family view of traffic, CTA engagement, and downstream owner or payment intent.
            </p>
          </div>
          <div className='text-sm text-slate-500'>
            {highIntentPageFamilies.length} tracked families · {rangeLabel}
          </div>
        </div>

        <div className='mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          <div className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Best downstream family</p>
            <p className='mt-2 text-2xl font-semibold text-slate-900'>
              {topDownstreamFamily?.label || 'Waiting for data'}
            </p>
            <p className='mt-2 text-sm text-slate-500'>
              {topDownstreamFamily
                ? `${topDownstreamFamily.downstreamConversions} downstream conversions from ${topDownstreamFamily.views} views`
                : 'No claim or checkout activity recorded yet.'}
            </p>
            {topDownstreamFamily && getPageFamilyPrimaryHref(topDownstreamFamily.pageType) && (
              <Link
                href={getPageFamilyPrimaryHref(topDownstreamFamily.pageType)!}
                className='mt-3 inline-flex items-center gap-1 text-sm font-medium text-cyan-700 hover:text-cyan-800'
              >
                Open page
                <ArrowUpRight className='h-4 w-4' />
              </Link>
            )}
          </div>
          <div className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Strongest CTA rate</p>
            <p className='mt-2 text-2xl font-semibold text-slate-900'>
              {topCtaRateFamily ? `${topCtaRateFamily.label} · ${topCtaRateFamily.viewToCtaRate}%` : 'Waiting for data'}
            </p>
            <p className='mt-2 text-sm text-slate-500'>
              {topCtaRateFamily
                ? `${topCtaRateFamily.ctaClicks} CTA clicks from ${topCtaRateFamily.views} views`
                : 'No family has both views and CTA data yet.'}
            </p>
            {topCtaRateFamily && getPageFamilyPrimaryHref(topCtaRateFamily.pageType) && (
              <Link
                href={getPageFamilyPrimaryHref(topCtaRateFamily.pageType)!}
                className='mt-3 inline-flex items-center gap-1 text-sm font-medium text-cyan-700 hover:text-cyan-800'
              >
                Open page
                <ArrowUpRight className='h-4 w-4' />
              </Link>
            )}
          </div>
          <div className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Biggest visible leak</p>
            <p className='mt-2 text-2xl font-semibold text-slate-900'>
              {biggestLeakFamily?.label || 'No obvious leak'}
            </p>
            <p className='mt-2 text-sm text-slate-500'>
              {biggestLeakFamily
                ? `${biggestLeakFamily.ctaClicks} CTA clicks but no claim or checkout progression yet`
                : 'No page family is currently stuck between click and downstream action.'}
            </p>
            {biggestLeakFamily && getPageFamilySecondaryHref(biggestLeakFamily.pageType) && (
              <Link
                href={getPageFamilySecondaryHref(biggestLeakFamily.pageType)!}
                className='mt-3 inline-flex items-center gap-1 text-sm font-medium text-cyan-700 hover:text-cyan-800'
              >
                {getPageFamilySecondaryLabel(biggestLeakFamily.pageType)}
                <ArrowUpRight className='h-4 w-4' />
              </Link>
            )}
          </div>
        </div>

        <div className='overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm'>
          <div className='border-b border-slate-200 px-4 py-3'>
            <div className='flex items-center justify-between gap-3'>
              <p className='text-sm font-semibold text-slate-900'>Page family conversion ladder</p>
              <p className='text-xs text-slate-500'>Views -&gt; CTA -&gt; claim or checkout</p>
            </div>
          </div>
          {highIntentPageFamilyRows.length > 0 ? (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-slate-200 text-sm'>
                <thead className='bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  <tr>
                    <th className='px-4 py-3'>Page family</th>
                    <th className='px-4 py-3'>Views</th>
                    <th className='px-4 py-3'>CTA clicks</th>
                    <th className='px-4 py-3'>Claim leads</th>
                    <th className='px-4 py-3'>Checkout starts</th>
                    <th className='px-4 py-3'>Rates</th>
                    <th className='px-4 py-3'>Action</th>
                    <th className='px-4 py-3'>Open</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100'>
                  {highIntentPageFamilyRows.map((item) => (
                    <tr key={item.pageType} className='align-top'>
                      <td className='px-4 py-4'>
                        <div className='min-w-[180px]'>
                          <p className='text-sm font-medium text-slate-900'>{item.label}</p>
                          <p className='mt-1 text-xs text-slate-500'>{item.uniqueVisitors} unique visitors</p>
                        </div>
                      </td>
                      <td className='px-4 py-4 font-semibold text-slate-900'>{item.views}</td>
                      <td className='px-4 py-4'>
                        <div className='min-w-[90px]'>
                          <p className='font-semibold text-slate-900'>{item.ctaClicks}</p>
                          <p className='mt-1 text-xs text-slate-500'>
                            {item.submitClicks} submit · {item.claimClicks} claim
                          </p>
                        </div>
                      </td>
                      <td className='px-4 py-4 font-semibold text-emerald-700'>{item.claimLeads}</td>
                      <td className='px-4 py-4 font-semibold text-violet-700'>{item.checkoutStarts}</td>
                      <td className='px-4 py-4'>
                        <div className='min-w-[150px] text-xs leading-5 text-slate-500'>
                          <p>
                            View -&gt; CTA: <span className='font-semibold text-slate-900'>{item.viewToCtaRate}%</span>
                          </p>
                          <p className='mt-1'>
                            View -&gt; downstream:{' '}
                            <span className='font-semibold text-emerald-700'>{item.viewToDownstreamRate}%</span>
                          </p>
                          <p className='mt-1'>
                            CTA -&gt; downstream:{' '}
                            <span className='font-semibold text-cyan-700'>{item.ctaToDownstreamRate}%</span>
                          </p>
                        </div>
                      </td>
                      <td className='px-4 py-4 text-xs leading-5 text-slate-500'>{getPageFamilyFunnelAction(item)}</td>
                      <td className='px-4 py-4'>
                        <div className='flex min-w-[140px] flex-col items-start gap-2 text-xs font-medium'>
                          {getPageFamilyPrimaryHref(item.pageType) && (
                            <Link
                              href={getPageFamilyPrimaryHref(item.pageType)!}
                              className='inline-flex items-center gap-1 text-cyan-700 hover:text-cyan-800'
                            >
                              Open page
                              <ArrowUpRight className='h-3.5 w-3.5' />
                            </Link>
                          )}
                          {getPageFamilySecondaryHref(item.pageType) && (
                            <Link
                              href={getPageFamilySecondaryHref(item.pageType)!}
                              className='inline-flex items-center gap-1 text-slate-600 hover:text-slate-900'
                            >
                              {getPageFamilySecondaryLabel(item.pageType)}
                              <ArrowUpRight className='h-3.5 w-3.5' />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className='px-4 py-8 text-sm text-slate-500'>
              No high-intent page family data has been recorded in this range.
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

      {/* Claim Lead Funnel */}
      <div className='mb-8'>
        <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>Claim Lead Funnel</h2>
            <p className='mt-1 text-sm text-slate-600'>
              How owner requests are moving through the queue, from fresh leads to contacted, claimed, or invalid.
            </p>
          </div>
          <Link
            href='/admin/claims'
            className='inline-flex items-center gap-1 text-sm font-medium text-cyan-700 hover:text-cyan-800'
          >
            Open claim queue
            <ArrowUpRight className='h-4 w-4' />
          </Link>
        </div>
        <div className='grid gap-6 lg:grid-cols-[1.2fr_0.8fr]'>
          <div className='overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm'>
            <div className='border-b border-slate-200 px-4 py-3'>
              <div className='flex items-center justify-between gap-3'>
                <p className='text-sm font-semibold text-slate-900'>Status distribution</p>
                <p className='text-xs text-slate-500'>{claimSummary.total} total claims</p>
              </div>
            </div>
            <div className='divide-y divide-slate-100'>
              {claimStatusRows.length > 0 ? (
                claimStatusRows.map((item) => (
                  <div key={item.key} className='px-4 py-4'>
                    <div className='flex items-start justify-between gap-4'>
                      <div className='min-w-0'>
                        <p className='text-sm font-medium text-slate-900'>{item.label}</p>
                        <p className='mt-1 text-xs text-slate-500'>{item.count} claims</p>
                      </div>
                      <p className='shrink-0 text-sm font-semibold text-slate-700'>{item.share}%</p>
                    </div>
                    <div className='mt-3 h-2 overflow-hidden rounded-full bg-slate-100'>
                      <div
                        className={`h-full rounded-full ${getClaimStatusToneClass(item.key)}`}
                        style={{ width: `${Math.max(item.share, item.count > 0 ? 8 : 0)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className='px-4 py-8 text-sm text-slate-500'>No claim leads recorded yet.</div>
              )}
            </div>
          </div>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-1'>
            <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
              <p className='text-sm font-medium text-slate-600'>Claim Resolution Rate</p>
              <p className='mt-2 text-3xl font-semibold text-emerald-600'>{claimResolutionRate}%</p>
              <p className='mt-2 text-sm text-slate-500'>Claimed or marked invalid out of all claim leads.</p>
            </div>
            <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
              <p className='text-sm font-medium text-slate-600'>Open Backlog</p>
              <p className='mt-2 text-3xl font-semibold text-amber-600'>{claimSummary.newCount}</p>
              <p className='mt-2 text-sm text-slate-500'>Fresh request volume that still needs a response.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Commercial Entry Sources */}
      <div className='mb-8'>
        <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>Commercial Entry Sources</h2>
            <p className='mt-1 text-sm text-slate-600'>
              Which source pages are actually sending owners into claim submission or paid checkout, not just collecting
              shallow CTA clicks.
            </p>
          </div>
          <Link
            href='/admin/analytics'
            className='inline-flex items-center gap-1 text-sm font-medium text-cyan-700 hover:text-cyan-800'
          >
            View full analytics
            <ArrowUpRight className='h-4 w-4' />
          </Link>
        </div>
        <div className='grid gap-6 lg:grid-cols-[1.35fr_0.65fr]'>
          <div className='overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm'>
            <div className='border-b border-slate-200 px-4 py-3'>
              <div className='flex items-center justify-between gap-3'>
                <p className='text-sm font-semibold text-slate-900'>Top source pages</p>
                <p className='text-xs text-slate-500'>{rangeLabel} tracked sources</p>
              </div>
            </div>
            {commercialEntryRows.length > 0 ? (
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-slate-200 text-sm'>
                  <thead className='bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>
                    <tr>
                      <th className='px-4 py-3'>Source page</th>
                      <th className='px-4 py-3'>Page views</th>
                      <th className='px-4 py-3'>Submit CTA</th>
                      <th className='px-4 py-3'>Claim CTA</th>
                      <th className='px-4 py-3'>Claim leads</th>
                      <th className='px-4 py-3'>Checkout starts</th>
                      <th className='px-4 py-3'>Page → next step</th>
                      <th className='px-4 py-3'>Action</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-slate-100'>
                    {commercialEntryRows.map((item) => {
                      const share =
                        commercialEntryShareBase > 0
                          ? Math.round((item.downstreamConversions / commercialEntryShareBase) * 100)
                          : 0;

                      return (
                        <tr key={item.sourcePath} className='align-top'>
                          <td className='px-4 py-4'>
                            <div className='min-w-[220px]'>
                              <p className='text-sm font-medium text-slate-900'>{item.sourcePath}</p>
                              <p className='mt-1 text-xs text-slate-500'>{item.pageLabel}</p>
                              <p className='mt-2 text-xs font-medium text-cyan-700'>
                                {share}% of downstream conversions
                              </p>
                            </div>
                          </td>
                          <td className='px-4 py-4'>
                            <div className='min-w-[110px]'>
                              <p className='font-semibold text-slate-900'>{item.pageViews}</p>
                              <p className='mt-1 text-xs text-slate-500'>{item.uniqueVisitors} unique</p>
                            </div>
                          </td>
                          <td className='px-4 py-4 font-semibold text-slate-700'>{item.submitClicks}</td>
                          <td className='px-4 py-4 font-semibold text-slate-700'>{item.claimClicks}</td>
                          <td className='px-4 py-4 font-semibold text-emerald-700'>{item.claimSubmissions}</td>
                          <td className='px-4 py-4 font-semibold text-violet-700'>{item.checkoutStarts}</td>
                          <td className='px-4 py-4'>
                            <div className='min-w-[150px] text-xs leading-5 text-slate-500'>
                              <p>
                                CTA rate: <span className='font-semibold text-slate-900'>{item.pageToCtaRate}%</span>
                              </p>
                              <p className='mt-1'>
                                Downstream rate:{' '}
                                <span className='font-semibold text-emerald-700'>{item.pageToDownstreamRate}%</span>
                              </p>
                            </div>
                          </td>
                          <td className='px-4 py-4 text-xs leading-5 text-slate-500'>
                            {getCommercialSourceAction(item)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className='px-4 py-8 text-sm text-slate-500'>
                No commercial entry source data recorded in this range.
              </div>
            )}
          </div>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-1'>
            <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
              <p className='text-sm font-medium text-slate-600'>Tracked Claim Leads</p>
              <p className='mt-2 text-3xl font-semibold text-emerald-600'>
                {commercialIntentReport.totalClaimSubmissions}
              </p>
              <p className='mt-2 text-sm text-slate-500'>Claim forms submitted with a known source page.</p>
            </div>
            <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
              <p className='text-sm font-medium text-slate-600'>Checkout Starts</p>
              <p className='mt-2 text-3xl font-semibold text-violet-700'>
                {commercialIntentReport.totalCheckoutStarts}
              </p>
              <p className='mt-2 text-sm text-slate-500'>Stripe sessions created from the owner payment path.</p>
            </div>
            <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
              <p className='text-sm font-medium text-slate-600'>Intent Clicks</p>
              <p className='mt-2 text-3xl font-semibold text-cyan-700'>
                {commercialIntentReport.totalSubmitClicks + commercialIntentReport.totalClaimClicks}
              </p>
              <p className='mt-2 text-sm text-slate-500'>
                CTA clicks heading toward submit or claim before form completion.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Reasons */}
      <div className='mb-8'>
        <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>Rejection Reasons</h2>
            <p className='mt-1 text-sm text-slate-600'>
              The main reasons submissions get rejected, so we can tell whether the review queue is blocking on the same
              few issues.
            </p>
          </div>
          <Link
            href='/admin/tools?status=rejected'
            className='inline-flex items-center gap-1 text-sm font-medium text-cyan-700 hover:text-cyan-800'
          >
            Open rejected tools
            <ArrowUpRight className='h-4 w-4' />
          </Link>
        </div>
        <div className='grid gap-6 lg:grid-cols-[1.2fr_0.8fr]'>
          <div className='overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm'>
            <div className='border-b border-slate-200 px-4 py-3'>
              <div className='flex items-center justify-between gap-3'>
                <p className='text-sm font-semibold text-slate-900'>Top reasons</p>
                <p className='text-xs text-slate-500'>{rejectionReasons.totalRejected} rejected in this range</p>
              </div>
            </div>
            <div className='divide-y divide-slate-100'>
              {rejectionReasonRows.length > 0 ? (
                rejectionReasonRows.map((item) => (
                  <div key={item.reason} className='px-4 py-4'>
                    <div className='flex items-start justify-between gap-4'>
                      <div className='min-w-0'>
                        <p className='break-words text-sm font-medium text-slate-900'>{item.reason}</p>
                        <p className='mt-1 text-xs text-slate-500'>{item.count} submissions</p>
                      </div>
                      <p className='shrink-0 text-sm font-semibold text-slate-700'>{item.share}%</p>
                    </div>
                    <div className='mt-3 h-2 overflow-hidden rounded-full bg-slate-100'>
                      <div
                        className='h-full rounded-full bg-rose-500'
                        style={{ width: `${Math.max(item.share, item.count > 0 ? 8 : 0)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className='px-4 py-8 text-sm text-slate-500'>No rejection reasons recorded in this range.</div>
              )}
            </div>
          </div>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-1'>
            <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
              <p className='text-sm font-medium text-slate-600'>Rejected Submissions</p>
              <p className='mt-2 text-3xl font-semibold text-red-600'>{rejectionReasons.totalRejected}</p>
              <p className='mt-2 text-sm text-slate-500'>Tracks rejected tools with recorded review reasons.</p>
            </div>
            <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
              <p className='text-sm font-medium text-slate-600'>Reason Coverage</p>
              <p className='mt-2 text-3xl font-semibold text-cyan-700'>{rejectionReasonCoverage}%</p>
              <p className='mt-2 text-sm text-slate-500'>How many rejections already have a usable written reason.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Statistics */}
      <div className='mb-8'>
        <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>Featured Statistics</h2>
            <p className='mt-1 text-sm text-slate-600'>
              Live featured placements, renewal pressure, and current view/click totals for the sponsored inventory.
            </p>
          </div>
          <Link
            href={`/${locale}/profile/submissions`}
            className='inline-flex items-center gap-1 text-sm font-medium text-cyan-700 hover:text-cyan-800'
          >
            Open renewal view
            <ArrowUpRight className='h-4 w-4' />
          </Link>
        </div>

        <div className='mb-4 rounded-lg border border-cyan-100 bg-cyan-50 p-4 shadow-sm'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
            <div>
              <div className='text-xs font-semibold uppercase tracking-wide text-cyan-700'>Tracking note</div>
              <div className='mt-1 text-base font-semibold text-slate-950'>
                Featured stats use current tool view and click totals as a proxy for exposure.
              </div>
              <p className='mt-1 text-sm leading-6 text-slate-600'>
                We do not yet track a separate impression event for sponsored slots, so this panel keeps the operational
                view honest while still showing whether featured inventory is getting used.
              </p>
            </div>
            <div className='rounded-full bg-white px-3 py-1 text-sm font-semibold text-cyan-800 ring-1 ring-cyan-100'>
              {featuredPlacementStats.liveCount} live placements
            </div>
          </div>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Live Placements</p>
            <p className='mt-2 text-3xl font-semibold text-slate-900'>{featuredPlacementStats.liveCount}</p>
            <p className='mt-2 text-sm text-slate-500'>Currently running featured windows.</p>
          </div>
          <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Reserved Placements</p>
            <p className='mt-2 text-3xl font-semibold text-amber-600'>{featuredPlacementStats.reservedCount}</p>
            <p className='mt-2 text-sm text-slate-500'>Paid but waiting for publication or activation.</p>
          </div>
          <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Featured Views</p>
            <p className='mt-2 text-3xl font-semibold text-cyan-700'>
              {featuredPlacementStats.totalViews.toLocaleString()}
            </p>
            <p className='mt-2 text-sm text-slate-500'>Current view totals across live placements.</p>
          </div>
          <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Featured CTR</p>
            <p className='mt-2 text-3xl font-semibold text-emerald-600'>{featuredClickThroughRate}%</p>
            <p className='mt-2 text-sm text-slate-500'>Clicks divided by views for the live featured set.</p>
          </div>
        </div>

        <div className='mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]'>
          <div className='overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm'>
            <div className='border-b border-slate-200 px-4 py-3'>
              <div className='flex items-center justify-between gap-3'>
                <p className='text-sm font-semibold text-slate-900'>Live placements</p>
                <p className='text-xs text-slate-500'>
                  {featuredPlacementStats.totalClicks.toLocaleString()} clicks tracked
                </p>
              </div>
            </div>
            <div className='divide-y divide-slate-100'>
              {featuredPlacementStats.placements.length > 0 ? (
                featuredPlacementStats.placements.map((item) => (
                  <div key={item.id} className='px-4 py-4'>
                    <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
                      <div className='min-w-0'>
                        <p className='text-sm font-medium text-slate-900'>{item.title}</p>
                        <p className='mt-1 text-xs text-slate-500'>{item.name}</p>
                        <p className='mt-2 text-xs text-slate-500'>
                          Ends {item.featuredUntil ? new Date(item.featuredUntil).toLocaleString() : 'unknown'}
                          {item.daysLeft !== null
                            ? ` · ${item.daysLeft} day${item.daysLeft === 1 ? '' : 's'} left`
                            : ''}
                        </p>
                      </div>
                      <div className='flex shrink-0 gap-2'>
                        <span className='rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700'>
                          {item.views.toLocaleString()} views
                        </span>
                        <span className='rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700'>
                          {item.clicks.toLocaleString()} clicks
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className='px-4 py-8 text-sm text-slate-500'>No live featured placements right now.</div>
              )}
            </div>
          </div>

          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-1'>
            <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
              <p className='text-sm font-medium text-slate-600'>Expiring in 3 days</p>
              <p className='mt-2 text-3xl font-semibold text-rose-600'>{featuredPlacementStats.expiringSoonCount}</p>
              <p className='mt-2 text-sm text-slate-500'>Featured windows that need a renewal nudge.</p>
            </div>
            <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
              <p className='text-sm font-medium text-slate-600'>Top renewal pressure</p>
              <p className='mt-2 text-3xl font-semibold text-slate-900'>
                {featuredExpiringSoon.length > 0 ? featuredExpiringSoon[0].title : 'None'}
              </p>
              <p className='mt-2 text-sm text-slate-500'>{featuredRenewalText}</p>
            </div>
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

      {/* Developer Outreach Queue */}
      <div className='mb-8'>
        <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>Developer Outreach Queue</h2>
            <p className='mt-1 text-sm text-slate-600'>
              A lightweight weekly contact queue for claim invites, featured pitches, and content collaboration.
            </p>
          </div>
          <div className='text-sm text-slate-500'>Target: 20 teams per week</div>
        </div>

        <div className='mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          <div className='theme-surface rounded-lg border border-slate-200 p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Queued this week</p>
            <p className='mt-2 text-3xl font-semibold text-slate-900'>{outreachQueue.length}</p>
            <p className='mt-2 text-sm text-slate-500'>
              High-signal unclaimed published tools with reachable contacts.
            </p>
          </div>
          <div className='theme-surface rounded-lg border border-slate-200 p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Featured-ready leads</p>
            <p className='mt-2 text-3xl font-semibold text-cyan-700'>
              {outreachQueue.filter((item) => item.suggestion === 'featured_pitch').length}
            </p>
            <p className='mt-2 text-sm text-slate-500'>
              Traffic-backed listings where a featured pitch is easier to justify.
            </p>
          </div>
          <div className='theme-surface rounded-lg border border-slate-200 p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Content-collab leads</p>
            <p className='mt-2 text-3xl font-semibold text-emerald-600'>
              {outreachQueue.filter((item) => item.suggestion === 'content_collab').length}
            </p>
            <p className='mt-2 text-sm text-slate-500'>Listings already getting discussion or saves from users.</p>
          </div>
          <div className='theme-surface rounded-lg border border-slate-200 p-5 shadow-sm'>
            <p className='text-sm font-medium text-slate-600'>Follow-up due now</p>
            <p className='mt-2 text-3xl font-semibold text-amber-700'>{outreachDueRows.length}</p>
            <p className='mt-2 text-sm text-slate-500'>
              {outreachOverdueCount} overdue · {outreachDueTodayCount} due today
            </p>
          </div>
        </div>

        <div className='mb-4 rounded-lg border border-cyan-200 bg-cyan-50 p-5 shadow-sm'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
            <div>
              <p className='text-sm font-semibold text-slate-900'>Outreach to revenue bridge</p>
              <p className='mt-1 text-sm text-slate-600'>
                What happened after outreach-driven claims: did they stay free, enter the paid path, confirm payment, or turn into featured inventory?
              </p>
            </div>
            <p className='text-xs text-slate-500'>
              {outreachCommercialBridge.claimedFromOutreachCount} outreach-led claims tracked so far
            </p>
          </div>
          <div className='mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            <div className='rounded-lg border border-cyan-200 bg-white p-4'>
              <p className='text-sm font-medium text-slate-600'>Outreach claims</p>
              <p className='mt-2 text-3xl font-semibold text-cyan-700'>{outreachCommercialBridge.claimedFromOutreachCount}</p>
              <p className='mt-2 text-sm text-slate-500'>
                {getTrendLabel(
                  outreachCommercialBridge.recentClaimedFromOutreachCount,
                  outreachCommercialBridge.previousClaimedFromOutreachCount,
                )}
              </p>
            </div>
            <div className='rounded-lg border border-cyan-200 bg-white p-4'>
              <p className='text-sm font-medium text-slate-600'>Payment confirmed</p>
              <p className='mt-2 text-3xl font-semibold text-emerald-600'>{outreachCommercialBridge.paymentConfirmedCount}</p>
              <p className='mt-2 text-sm text-slate-500'>
                {getTrendLabel(
                  outreachCommercialBridge.recentPaymentConfirmedCount,
                  outreachCommercialBridge.previousPaymentConfirmedCount,
                )}
              </p>
            </div>
            <div className='rounded-lg border border-cyan-200 bg-white p-4'>
              <p className='text-sm font-medium text-slate-600'>Featured reserved</p>
              <p className='mt-2 text-3xl font-semibold text-amber-700'>{outreachCommercialBridge.featuredReservedCount}</p>
              <p className='mt-2 text-sm text-slate-500'>
                {getTrendLabel(
                  outreachCommercialBridge.recentFeaturedReservedCount,
                  outreachCommercialBridge.previousFeaturedReservedCount,
                )}
              </p>
            </div>
            <div className='rounded-lg border border-cyan-200 bg-white p-4'>
              <p className='text-sm font-medium text-slate-600'>Featured live</p>
              <p className='mt-2 text-3xl font-semibold text-violet-700'>{outreachCommercialBridge.featuredLiveCount}</p>
              <p className='mt-2 text-sm text-slate-500'>
                {getTrendLabel(
                  outreachCommercialBridge.recentFeaturedLiveCount,
                  outreachCommercialBridge.previousFeaturedLiveCount,
                )}
              </p>
            </div>
          </div>
          <p className='mt-3 text-xs text-slate-500'>
            {outreachPaidPlanRate}% of outreach-led claims are on the paid plan and {outreachPaymentConfirmedRate}% have payment confirmed.
          </p>
        </div>

        <div className='mb-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm'>
          <div className='border-b border-slate-200 px-4 py-3'>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <p className='text-sm font-semibold text-slate-900'>Outreach executor mix</p>
                <p className='mt-1 text-sm text-slate-500'>
                  Who is moving the outreach queue, and whether their work is reaching claims and revenue outcomes.
                </p>
              </div>
              <p className='text-xs text-slate-500'>{outreachExecutors.length} executors with recent activity</p>
            </div>
          </div>
          {outreachExecutors.length > 0 ? (
            <table className='min-w-full divide-y divide-slate-200'>
              <thead className='bg-slate-50'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'>Executor</th>
                  <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>
                    Recent 7d
                  </th>
                  <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>
                    Total updates
                  </th>
                  <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>
                    Claims
                  </th>
                  <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>
                    Paid
                  </th>
                  <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500'>
                    Featured live
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100 bg-white'>
                {outreachExecutors.map((item) => (
                  <tr key={item.executorEmail}>
                    <td className='px-4 py-4 align-top'>
                      <div>
                        <p className='text-sm font-medium text-slate-900'>{item.executorEmail}</p>
                        <p className='mt-1 text-xs text-slate-500'>
                          {item.recentUpdates > 0 ? 'Active this week' : 'No updates in the last week'}
                        </p>
                      </div>
                    </td>
                    <td className='px-4 py-4 text-right align-top text-sm font-semibold text-cyan-700'>
                      {item.recentUpdates}
                    </td>
                    <td className='px-4 py-4 text-right align-top text-sm text-slate-700'>{item.totalUpdates}</td>
                    <td className='px-4 py-4 text-right align-top text-sm text-slate-700'>{item.claimedCount}</td>
                    <td className='px-4 py-4 text-right align-top text-sm text-slate-700'>{item.paymentConfirmedCount}</td>
                    <td className='px-4 py-4 text-right align-top text-sm text-slate-700'>{item.featuredLiveCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className='px-4 py-8 text-sm text-slate-500'>No executor data is available yet.</div>
          )}
        </div>

        <div className='mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-wide text-amber-700'>Operating order</p>
              <p className='mt-1 text-base font-semibold text-slate-950'>
                Handle warm claim leads first, then use the outreach queue for cold-start owner contact.
              </p>
              <p className='mt-1 text-sm leading-6 text-slate-600'>
                {claimSummary.newCount > 0
                  ? `${claimSummary.newCount} new claim leads are still waiting in the queue. Clear those first, then work through the outreach list below.`
                  : 'The claim queue is not blocked by new leads right now, so this is a good window for scheduled owner outreach.'}
              </p>
              <p className='mt-1 text-sm leading-6 text-slate-600'>
                {outreachDueRows.length > 0
                  ? `${outreachDueRows.length} outreach follow-ups already need attention, so those items are pinned to the top of the queue.`
                  : 'No outreach follow-ups are due today, so the queue stays ordered by overall signal strength.'}
              </p>
            </div>
            <div className='flex flex-wrap gap-2'>
              <Link
                href='/admin/claims?status=new'
                className='inline-flex items-center justify-center rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-700'
              >
                Open new claims
              </Link>
              <Link
                href='/admin/claims?status=contacted'
                className='inline-flex items-center justify-center rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100'
              >
                Open contacted claims
              </Link>
            </div>
          </div>
        </div>

        <div className='mb-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
            <div>
              <p className='text-sm font-semibold text-slate-900'>Last 7 days of outreach movement</p>
              <p className='mt-1 text-sm text-slate-500'>
                This shows whether the visible queue is actually moving, not just how big it is.
              </p>
            </div>
            <p className='text-xs text-slate-500'>
              {latestOutreachUpdate?.outreachUpdatedAt
                ? `Latest action ${new Date(latestOutreachUpdate.outreachUpdatedAt).toLocaleString()}`
                : 'No outreach updates recorded in the last 7 days'}
            </p>
          </div>
          <div className='mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            <div className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
              <p className='text-sm font-medium text-slate-600'>Leads touched</p>
              <p className='mt-2 text-3xl font-semibold text-cyan-700'>{recentOutreachStartedCount}</p>
              <p className='mt-2 text-sm text-slate-500'>Visible leads with any outreach update in the last week.</p>
            </div>
            <div className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
              <p className='text-sm font-medium text-slate-600'>Still active</p>
              <p className='mt-2 text-3xl font-semibold text-blue-600'>{recentOutreachActiveCount}</p>
              <p className='mt-2 text-sm text-slate-500'>Recent touches that are still mid-conversation or need follow-up.</p>
            </div>
            <div className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
              <p className='text-sm font-medium text-slate-600'>Closed this week</p>
              <p className='mt-2 text-3xl font-semibold text-emerald-600'>{recentOutreachClosedCount}</p>
              <p className='mt-2 text-sm text-slate-500'>Visible leads that reached a closed state within the last 7 days.</p>
            </div>
            <div className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
              <p className='text-sm font-medium text-slate-600'>Due now in active work</p>
              <p className='mt-2 text-3xl font-semibold text-amber-700'>{outreachDueRows.length}</p>
              <p className='mt-2 text-sm text-slate-500'>Use this with the weekly movement numbers to spot stalled follow-ups.</p>
            </div>
          </div>
          <div className='mt-4 flex flex-wrap gap-2'>
            {recentOutreachStatusRows.length > 0 ? (
              recentOutreachStatusRows.map((item) => (
                <span
                  key={item.key}
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getOutreachStatusToneClass(item.key)} text-white`}
                >
                  {item.label}: {item.count}
                </span>
              ))
            ) : (
              <span className='text-sm text-slate-500'>No recent outreach status changes are visible yet.</span>
            )}
          </div>
          {(recentOutreachClosedReasonRows.length > 0 || recentOutreachClosedCount > 0) && (
            <div className='mt-3 flex flex-wrap gap-2'>
              {recentOutreachClosedReasonRows.map((item) => (
                <span key={item.key} className='inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700'>
                  {item.label}: {item.count}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className='mb-4 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]'>
          <div className='overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm'>
            <div className='border-b border-slate-200 px-4 py-3'>
              <div className='flex items-center justify-between gap-3'>
                <p className='text-sm font-semibold text-slate-900'>Queue status funnel</p>
                <p className='text-xs text-slate-500'>{outreachQueue.length} visible leads</p>
              </div>
            </div>
            <div className='divide-y divide-slate-100'>
              {outreachStatusRows.length > 0 ? (
                outreachStatusRows.map((item) => (
                  <div key={item.key} className='px-4 py-4'>
                    <div className='flex items-start justify-between gap-4'>
                      <div className='min-w-0'>
                        <p className='text-sm font-medium text-slate-900'>{item.label}</p>
                        <p className='mt-1 text-xs text-slate-500'>{item.count} leads</p>
                      </div>
                      <p className='shrink-0 text-sm font-semibold text-slate-700'>{item.share}%</p>
                    </div>
                    <div className='mt-3 h-2 overflow-hidden rounded-full bg-slate-100'>
                      <div
                        className={`h-full rounded-full ${getOutreachStatusToneClass(item.key)}`}
                        style={{ width: `${Math.max(item.share, item.count > 0 ? 8 : 0)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className='px-4 py-8 text-sm text-slate-500'>No outreach leads are visible in the queue yet.</div>
              )}
            </div>
          </div>
          <div className='grid gap-4 sm:grid-cols-3 lg:grid-cols-1'>
            <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
              <p className='text-sm font-medium text-slate-600'>Started outreach</p>
              <p className='mt-2 text-3xl font-semibold text-cyan-700'>{outreachStartedRate}%</p>
              <p className='mt-2 text-sm text-slate-500'>{outreachStartedCount} of these leads already have first-touch progress.</p>
            </div>
            <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
              <p className='text-sm font-medium text-slate-600'>Active conversations</p>
              <p className='mt-2 text-3xl font-semibold text-blue-600'>{outreachActiveCount}</p>
              <p className='mt-2 text-sm text-slate-500'>Leads currently sitting in contacted, waiting-reply, or follow-up-needed states.</p>
            </div>
            <div className='theme-surface rounded-lg border border-slate-200 p-6 shadow-sm'>
              <p className='text-sm font-medium text-slate-600'>Closed share</p>
              <p className='mt-2 text-3xl font-semibold text-emerald-600'>{outreachClosedRate}%</p>
              <p className='mt-2 text-sm text-slate-500'>
                Historical close rate across all tracked outreach leads, including listings that were later claimed and left the active queue.
              </p>
              {(outreachClosedReasonRows.length > 0 || outreachUnclassifiedClosedCount > 0) && (
                <div className='mt-3 flex flex-wrap gap-2'>
                  {outreachClosedReasonRows.map((item) => (
                    <span key={item.key} className='inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700'>
                      {item.label}: {item.count}
                    </span>
                  ))}
                  {outreachUnclassifiedClosedCount > 0 && (
                    <span className='inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700'>
                      Unclassified: {outreachUnclassifiedClosedCount}
                    </span>
                  )}
                </div>
              )}
              <p className='mt-3 text-xs text-slate-500'>{outreachHistorySummary.totalTracked} tracked outreach leads in history.</p>
            </div>
          </div>
        </div>

        <AdminOutreachQueueTable items={outreachQueue} locale={locale} />

        {outreachNeedsClassification.length > 0 && (
          <div className='mt-6'>
            <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
              <div>
                <h3 className='text-base font-semibold text-slate-900'>Historical close outcomes to classify</h3>
                <p className='mt-1 text-sm text-slate-600'>
                  Older outreach records are already closed, but still missing the reason. Classify them here so the historical funnel stays trustworthy.
                </p>
              </div>
              <div className='text-sm text-slate-500'>{outreachHistorySummary.unclassifiedClosedCount} still unclassified</div>
            </div>
            <AdminOutreachClassificationTable items={outreachNeedsClassification} locale={locale} />
          </div>
        )}
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
