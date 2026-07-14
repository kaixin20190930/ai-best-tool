'use client';

import { useMemo, useState } from 'react';
import { useRouter } from '@/app/navigation';
import { toast } from 'sonner';
import {
  activateCommercialPlacement,
  approveTool,
  improveDraftTool,
  markToolMediaNeeded,
  rejectTool,
  updateTool,
  useToolImageAsThumbnail,
} from '@/app/actions/admin/tools';
import type { AdminTool } from '@/app/actions/admin/tools';
import { updateToolClaimInfo } from '@/app/actions/admin/claims';
import { getPaidListingPublishGate, getToolQuality } from '@/lib/services/toolQuality';

interface Category {
  id: string;
  name: any;
  slug: string;
}

interface AdminToolEditFormProps {
  tool: AdminTool;
  categories: Category[];
  toolStats: {
    viewCount: number;
    clickCount: number;
    shareCount: number;
    favoriteCount: number;
    averageRating: number;
    ratingCount: number;
  };
  commentCount: number;
}

type ClaimInfoTool = AdminTool & {
  owner_email?: string | null;
  claim_status?: string | null;
  claimed_at?: string | null;
};

function getFeatureRecord(features: AdminTool['features']) {
  return features && typeof features === 'object'
    ? (features as Record<string, unknown>)
    : {};
}

function getNestedRecord(value: unknown) {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function getString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function getNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function getStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];
}

function slugifyTag(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/https?:\/\//g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminToolEditForm({
  tool,
  categories,
  toolStats,
  commentCount,
}: AdminToolEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [improveLoading, setImproveLoading] = useState(false);
  const [mediaLoading, setMediaLoading] = useState<'mark' | 'thumbnail' | null>(null);
  const [reviewLoading, setReviewLoading] = useState<'approve' | 'reject' | null>(
    null
  );
  const [commercialLoading, setCommercialLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const claimTool = tool as ClaimInfoTool;
  const [claimOwnerEmail, setClaimOwnerEmail] = useState(claimTool.owner_email || '');
  const [claimStatus, setClaimStatus] = useState(claimTool.claim_status || 'unclaimed');
  const [claimedAt, setClaimedAt] = useState(claimTool.claimed_at || '');

  const getTitle = (data: any) => {
    if (typeof data === 'string') return data;
    if (typeof data === 'object' && data !== null) {
      return data.en || data.zh || Object.values(data)[0] || '';
    }
    return '';
  };

  const getContent = (data: any) => {
    if (typeof data === 'string') return data;
    if (typeof data === 'object' && data !== null) {
      return data.en || data.zh || Object.values(data)[0] || '';
    }
    return '';
  };

  const quality = getToolQuality(tool);
  const featureRecord = getFeatureRecord(tool.features);
  const collection = getNestedRecord(featureRecord.collection);
  const suggestedCategorySlug = getString(featureRecord.suggestedCategorySlug);
  const suggestedUseCases = getStringArray(featureRecord.suggestedUseCases);
  const relevanceScore = getNumber(collection.relevanceScore);
  const qualityScore = getNumber(collection.qualityScore);
  const scoreReason = getString(collection.scoreReason);
  const sourceUrl = getString(collection.sourceUrl);
  const sourceName = getString(collection.sourceName);
  const productHuntRedirectUrl = getString(collection.productHuntRedirectUrl);
  const externalUrl = getString(collection.externalUrl);
  const mediaReview = getNestedRecord(featureRecord.mediaReview);
  const mediaReason = getString(mediaReview.reason);
  const submissionFeature = getNestedRecord(featureRecord.submission);
  const commercialFeature = getNestedRecord(submissionFeature.commercial);
  const submissionReview = getNestedRecord(submissionFeature.review);
  const rejectionReason = getString(submissionReview.rejectionReason);
  const rejectionReasonAt = getString(submissionReview.rejectedAt);
  const [categoryIdValue, setCategoryIdValue] = useState(tool.category_id || '');
  const [tagsValue, setTagsValue] = useState(tool.tags.join(', '));
  const [rejectionReasonInput, setRejectionReasonInput] = useState(rejectionReason || '');
  const mediaNeeded = mediaReview.needed === true;
  const mediaMarkedAt = getString(mediaReview.markedAt);
  const missingImage = !tool.image_url;
  const missingThumbnail = !tool.thumbnail_url;
  const hasMediaGap = missingImage || missingThumbnail || mediaNeeded;
  const suggestedCategoryName =
    categories.find((category) => category.slug === suggestedCategorySlug)?.name ||
    suggestedCategorySlug;
  const hasCollectionContext =
    Boolean(sourceUrl) ||
    typeof relevanceScore === 'number' ||
    typeof qualityScore === 'number' ||
    Boolean(suggestedCategorySlug) ||
    suggestedUseCases.length > 0;
  const commercialPlan = getString(commercialFeature.plan) || 'free';
  const commercialStatus =
    getString(commercialFeature.status) ||
    (commercialPlan === 'standard_paid' ? 'pending_payment_confirmation' : 'free_queue');
  const featuredDaysRequested = String(
    getNumber(commercialFeature.featuredDaysRequested) || 0
  );
  const fastTrackRequested = commercialFeature.fastTrackRequested === true;
  const paymentConfirmed = commercialFeature.paymentConfirmed === true;
  const isSponsoredPlacement = commercialFeature.isSponsoredPlacement === true;
  const paymentUrl = getString(commercialFeature.paymentUrl) || '';
  const featuredActiveFrom = getString(commercialFeature.featuredActiveFrom) || '';
  const featuredUntil = getString(commercialFeature.featuredUntil) || '';
  const [featuredFromInput, setFeaturedFromInput] = useState(featuredActiveFrom);
  const [featuredUntilInput, setFeaturedUntilInput] = useState(featuredUntil);
  const [featuredDaysInput, setFeaturedDaysInput] = useState(featuredDaysRequested);
  const isPaidSubmission = commercialPlan === 'standard_paid';
  const paidPublishGate = getPaidListingPublishGate(tool);
  const paidPublishBlocked = isPaidSubmission && paidPublishGate.blockers.length > 0;
  const selectedCategory = categories.find((category) => category.id === categoryIdValue);
  const currentTags = tagsValue
    .split(',')
    .map((tag) => slugifyTag(tag))
    .filter(Boolean);

  const suggestedTags = useMemo(() => {
    const bySlug: Record<string, string[]> = {
      'text-writing': ['writing', 'copywriting', 'content-generation', 'blogging', 'editor'],
      productivity: ['productivity', 'note-taking', 'meeting-notes', 'workflow', 'planning'],
      'developer-tools': ['developer-tools', 'api', 'debugging', 'code-review', 'automation'],
      automation: ['automation', 'workflow', 'no-code', 'integrations', 'trigger'],
      research: ['research', 'search', 'knowledge-base', 'analysis', 'discovery'],
      'design-art': ['design', 'image-generation', 'creative', 'branding', 'visual'],
      web3: ['web3', 'crypto', 'on-chain-analysis', 'defi', 'token-research', 'wallet-monitoring'],
      chatbot: ['chatbot', 'assistant', 'llm', 'prompting', 'conversation'],
      voice: ['voice', 'speech-to-text', 'text-to-speech', 'audio', 'transcription'],
      video: ['video', 'editing', 'screenshot', 'gif', 'content-creation'],
    };

    const categorySlug = selectedCategory?.slug || '';
    const categoryTags = categorySlug ? bySlug[categorySlug] || [] : [];
    const generalTags = ['ai-tools', 'saas', 'website'];

    return [...categoryTags, ...generalTags]
      .map(slugifyTag)
      .filter(Boolean)
      .filter((tag, index, array) => array.indexOf(tag) === index)
      .slice(0, 8);
  }, [selectedCategory]);

  const appendTag = (tag: string) => {
    const normalized = slugifyTag(tag);
    if (!normalized || currentTags.includes(normalized)) return;
    const nextTags = [...currentTags, normalized].join(', ');
    setTagsValue(nextTags);
  };

  const removeTag = (tag: string) => {
    setTagsValue(currentTags.filter((item) => item !== tag).join(', '));
  };

  const featuredPreview = useMemo(() => {
    const from = featuredFromInput.trim();
    const until = featuredUntilInput.trim();
    if (!from || !until) return null;
    const fromTs = new Date(from).getTime();
    const untilTs = new Date(until).getTime();
    if (!Number.isFinite(fromTs) || !Number.isFinite(untilTs)) return 'Invalid time format';
    const days = Math.max(0, Math.round((untilTs - fromTs) / (24 * 60 * 60 * 1000)));
    return `${days} day window`;
  }, [featuredFromInput, featuredUntilInput]);
  const ownerStatusLabel =
    claimTool.claim_status === 'claimed'
      ? 'Claimed'
      : claimTool.claim_status === 'pending'
        ? 'Pending'
        : claimTool.claim_status === 'rejected'
          ? 'Rejected'
          : 'Unclaimed';

  const handleApprove = async () => {
    setReviewLoading('approve');
    const result = await approveTool(tool.id);
    setReviewLoading(null);

    if (result.success) {
      toast.success('Tool approved and published');
      router.push('/admin/tools?status=pending');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to approve tool');
    }
  };

  const handleReject = async () => {
    if (!confirm('Reject this submission?')) {
      return;
    }

    setReviewLoading('reject');
    const result = await rejectTool(tool.id, rejectionReasonInput);
    setReviewLoading(null);

    if (result.success) {
      toast.success('Tool rejected');
      router.push('/admin/tools?status=pending');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to reject tool');
    }
  };

  const handleImproveDraft = async () => {
    setImproveLoading(true);
    const result = await improveDraftTool(tool.id);
    setImproveLoading(false);

    if (result.success) {
      toast.success('Draft copy improved');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to improve draft');
    }
  };

  const handleMarkMediaNeeded = async () => {
    setMediaLoading('mark');
    const result = await markToolMediaNeeded(tool.id);
    setMediaLoading(null);

    if (result.success) {
      toast.success('Media marked as needed');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to mark media needed');
    }
  };

  const handleUseImageAsThumbnail = async () => {
    setMediaLoading('thumbnail');
    const result = await useToolImageAsThumbnail(tool.id);
    setMediaLoading(null);

    if (result.success) {
      toast.success('Thumbnail filled from image URL');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to fill thumbnail');
    }
  };

  const handleActivateCommercial = async () => {
    setCommercialLoading(true);
    const result = await activateCommercialPlacement(tool.id);
    setCommercialLoading(false);

    if (result.success) {
      toast.success('Commercial placement activated');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to activate commercial placement');
    }
  };

  const handleSaveClaimInfo = async () => {
    setClaimLoading(true);
    const result = await updateToolClaimInfo({
      toolId: tool.id,
      ownerEmail: claimOwnerEmail,
      claimStatus,
      claimedAt,
    });
    setClaimLoading(false);

    if (result.success) {
      toast.success('Claim info saved');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to save claim info');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get('name') || '').trim();
    const titleEn = String(formData.get('title_en') || '').trim();
    const contentEn = String(formData.get('content_en') || '').trim();
    const detailEn = String(formData.get('detail_en') || '').trim();
    const url = String(formData.get('url') || '').trim();
    const imageUrl = String(formData.get('image_url') || '').trim();
    const thumbnailUrl = String(formData.get('thumbnail_url') || '').trim();
    const categoryId = String(formData.get('category_id') || '').trim();
    const tagsStr = String(formData.get('tags') || '');
    const pricing = String(formData.get('pricing') || 'free');
    const status = String(formData.get('status') || 'draft');
    const formCommercialPlan = String(formData.get('commercial_plan') || 'free');
    const formCommercialStatus = String(
      formData.get('commercial_status') ||
        (formCommercialPlan === 'standard_paid'
          ? 'pending_payment_confirmation'
          : 'free_queue')
    );
    const formFastTrackRequested = formData.get('fast_track_requested') === 'on';
    const formFeaturedDaysRequested = Number(formData.get('featured_days_requested') || 0);
    const formPaymentConfirmed = formData.get('payment_confirmed') === 'on';
    const formSponsoredPlacement = formData.get('is_sponsored_placement') === 'on';
    const formPaymentUrl = String(formData.get('payment_url') || '').trim();
    const formFeaturedActiveFrom = String(formData.get('featured_active_from') || '').trim();
    const formFeaturedUntil = String(formData.get('featured_until') || '').trim();
    const formPageQualityStatus = String(formData.get('page_quality_status') || 'continue_index');
    const formNextReviewDate = String(formData.get('next_review_date') || '').trim();

    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t);

    const result = await updateTool(tool.id, {
      name,
      title: { en: titleEn, zh: titleEn },
      content: { en: contentEn, zh: contentEn },
      detail: { en: detailEn, zh: detailEn },
      url,
      image_url: imageUrl,
      thumbnail_url: thumbnailUrl,
      category_id: categoryId || null,
      tags,
      pricing,
      status,
      commercialPlan:
        formCommercialPlan === 'standard_paid' ? 'standard_paid' : 'free',
      commercialStatus: formCommercialStatus,
      fastTrackRequested: formFastTrackRequested,
      featuredDaysRequested: [0, 3, 7, 14].includes(formFeaturedDaysRequested)
        ? formFeaturedDaysRequested
        : 0,
      paymentConfirmed: formPaymentConfirmed,
      paymentUrl: formPaymentUrl || null,
      featuredActiveFrom: formFeaturedActiveFrom || null,
      featuredUntil: formFeaturedUntil || null,
      isSponsoredPlacement: formSponsoredPlacement,
      pageQualityStatus: formPageQualityStatus,
      nextReviewDate: formNextReviewDate || null,
    });

    setLoading(false);

    if (result.success) {
      toast.success('Tool updated successfully');
      router.push('/admin/tools');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to update tool');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {(tool.status === 'pending' || tool.status === 'draft') && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">
                {tool.status === 'pending'
                  ? 'Pending developer submission'
                  : 'Draft review checklist'}
              </p>
              <p className="mt-1 text-sm">
                Review content, category, media, pricing, and collection context before publishing.
              </p>
              {paidPublishBlocked && (
                <p className="mt-2 text-sm font-medium text-yellow-900">
                  Paid listing blockers: {paidPublishGate.blockers.join(', ')}. Save the missing details before publishing.
                </p>
              )}
            </div>
            {tool.status === 'pending' && (
              <div className="space-y-3">
                <label htmlFor="rejection_reason" className="block text-sm font-medium text-slate-700">
                  Rejection reason
                </label>
                <textarea
                  id="rejection_reason"
                  value={rejectionReasonInput}
                  onChange={(event) => setRejectionReasonInput(event.target.value)}
                  placeholder="Optional. Add the main reason so the submitter can fix it faster."
                  rows={3}
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={reviewLoading !== null || loading}
                    className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    {reviewLoading === 'reject' ? 'Rejecting...' : 'Reject'}
                  </button>
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={reviewLoading !== null || loading || paidPublishBlocked}
                    className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
                  >
                    {reviewLoading === 'approve'
                      ? 'Publishing...'
                      : paidPublishBlocked
                        ? 'Save details before publish'
                        : 'Approve & Publish'}
                  </button>
                </div>
              </div>
            )}
            {tool.status === 'draft' && (
              <button
                type="button"
                onClick={handleImproveDraft}
                disabled={improveLoading || loading}
                className="rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 hover:bg-cyan-100 disabled:opacity-50"
              >
                {improveLoading ? 'Improving...' : 'Improve draft'}
              </button>
            )}
          </div>
          <div className="mt-4 border-t border-yellow-200 pt-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold">Quality score</p>
              <p className="text-sm font-semibold text-yellow-900">{quality.score}/100</p>
            </div>
          </div>

          {quality.checks.length > 0 && (
            <div className="mt-4 border-t border-yellow-200 pt-4">
              <p className="text-sm font-semibold">Review checklist</p>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {quality.checks.map((check) => (
                  <div
                    key={check.key}
                    className={
                      check.passed
                        ? 'rounded-lg border border-green-100 bg-white p-3'
                        : 'rounded-lg border border-yellow-300 bg-white p-3'
                    }
                  >
                    <p
                      className={
                        check.passed
                          ? 'text-sm font-semibold text-green-700'
                          : 'text-sm font-semibold text-yellow-900'
                      }
                    >
                      {check.label} ({check.points} pts)
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {check.passed ? 'Ready' : 'Needs attention before publishing'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tool.status === 'rejected' && (
        <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-red-950">
          <p className="text-sm font-semibold">Rejection details</p>
          <p className="mt-1 text-sm text-red-900">
            {rejectionReason || 'No rejection reason was recorded for this tool.'}
          </p>
          {rejectionReasonAt && (
            <p className="mt-2 text-xs text-red-800">Recorded at {new Date(rejectionReasonAt).toLocaleString()}</p>
          )}
        </div>
      )}

      {hasCollectionContext && (
        <div className="rounded-lg border border-cyan-100 bg-cyan-50 p-4 text-cyan-950">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold">Collection intelligence</p>
              <p className="mt-1 text-sm text-cyan-900">
                Signals captured during automated discovery and draft creation.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {typeof relevanceScore === 'number' && (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-cyan-800 ring-1 ring-cyan-100">
                  AI {relevanceScore}/100
                </span>
              )}
              {typeof qualityScore === 'number' && (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-cyan-800 ring-1 ring-cyan-100">
                  Quality {qualityScore}/100
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
            <div>
              <p className="font-semibold">Suggested category</p>
              <p className="mt-1 text-cyan-900">
                {typeof suggestedCategoryName === 'object'
                  ? suggestedCategoryName.en || suggestedCategoryName.zh
                  : suggestedCategoryName || 'No suggestion'}
              </p>
            </div>
            <div>
              <p className="font-semibold">Suggested use cases</p>
              <p className="mt-1 text-cyan-900">
                {suggestedUseCases.length > 0
                  ? suggestedUseCases.join('; ')
                  : 'No suggested use cases'}
              </p>
            </div>
            {scoreReason && (
              <div>
                <p className="font-semibold">Score reason</p>
                <p className="mt-1 text-cyan-900">{scoreReason}</p>
              </div>
            )}
            <div>
              <p className="font-semibold">Source</p>
              <div className="mt-1 space-y-1">
                {sourceName && <p className="text-cyan-900">{sourceName}</p>}
                {sourceUrl && (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block break-all text-cyan-700 hover:text-cyan-900"
                  >
                    Source page
                  </a>
                )}
                {(externalUrl || productHuntRedirectUrl) && (
                  <a
                    href={externalUrl || productHuntRedirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block break-all text-cyan-700 hover:text-cyan-900"
                  >
                    Collected outbound URL
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {hasMediaGap && (
        <div className="rounded-lg border border-violet-100 bg-violet-50 p-4 text-violet-950">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold">Media review</p>
              <p className="mt-1 text-sm text-violet-900">
                Track logo and thumbnail gaps before this tool is published.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {missingImage && (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-violet-800 ring-1 ring-violet-100">
                  Logo missing
                </span>
              )}
              {missingThumbnail && (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-violet-800 ring-1 ring-violet-100">
                  Thumbnail missing
                </span>
              )}
              {mediaNeeded && (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-violet-800 ring-1 ring-violet-100">
                  Media needed
                </span>
              )}
            </div>
          </div>

          {mediaMarkedAt && (
            <p className="mt-3 text-xs text-violet-800">
              Marked at {new Date(mediaMarkedAt).toLocaleString()}
            </p>
          )}
          {mediaReason && <p className="mt-2 text-xs text-violet-800">{mediaReason}</p>}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleMarkMediaNeeded}
              disabled={mediaLoading !== null || loading}
              className="rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm font-semibold text-violet-800 hover:bg-violet-100 disabled:opacity-50"
            >
              {mediaLoading === 'mark' ? 'Marking...' : 'Mark media needed'}
            </button>
            {tool.image_url && missingThumbnail && (
              <button
                type="button"
                onClick={handleUseImageAsThumbnail}
                disabled={mediaLoading !== null || loading}
                className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-800 hover:bg-violet-100 disabled:opacity-50"
              >
                {mediaLoading === 'thumbnail' ? 'Filling...' : 'Use image as thumbnail'}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="theme-surface rounded-lg border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Owner Dashboard V1</h2>
            <p className="mt-1 text-sm text-slate-600">
              A lightweight performance snapshot for the current listing owner or operator.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
              {ownerStatusLabel}
            </span>
            {claimTool.owner_email ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {claimTool.owner_email}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {[
            { label: 'Views', value: toolStats.viewCount, tone: 'blue' },
            { label: 'Clicks', value: toolStats.clickCount, tone: 'cyan' },
            { label: 'Favorites', value: toolStats.favoriteCount, tone: 'rose' },
            { label: 'Shares', value: toolStats.shareCount, tone: 'amber' },
            { label: 'Comments', value: commentCount, tone: 'emerald' },
            { label: 'Ratings', value: toolStats.ratingCount, tone: 'violet' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
              <p
                className={`mt-2 text-2xl font-semibold ${
                  item.tone === 'blue'
                    ? 'text-blue-700'
                    : item.tone === 'cyan'
                      ? 'text-cyan-700'
                      : item.tone === 'rose'
                        ? 'text-rose-700'
                        : item.tone === 'amber'
                          ? 'text-amber-700'
                          : item.tone === 'emerald'
                            ? 'text-emerald-700'
                            : 'text-violet-700'
                }`}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">What this tells the owner</p>
          <p className="mt-1">
            This is the first pass at an owner-facing summary: reach, engagement, and whether the listing is getting
            social proof or discussion.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Average rating: {toolStats.averageRating.toFixed(1)} · visible comments: {commentCount}
          </p>
        </div>
      </div>

      <div className="theme-surface rounded-lg border border-slate-200 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Basic Information</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">
              Name (slug)
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={tool.name}
              required
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200"
            />
          </div>

          <div>
            <label htmlFor="title_en" className="block text-sm font-medium text-slate-700">
              Title
            </label>
            <input
              type="text"
              id="title_en"
              name="title_en"
              defaultValue={getTitle(tool.title)}
              required
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200"
            />
          </div>

          <div>
            <label htmlFor="content_en" className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              id="content_en"
              name="content_en"
              rows={3}
              defaultValue={getContent(tool.content)}
              required
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200"
            />
          </div>

          <div>
            <label htmlFor="detail_en" className="block text-sm font-medium text-slate-700">
              Detailed Description
            </label>
            <textarea
              id="detail_en"
              name="detail_en"
              rows={5}
              defaultValue={getContent(tool.detail)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200"
            />
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-slate-700">
              Website URL
            </label>
            <input
              type="url"
              id="url"
              name="url"
              defaultValue={tool.url}
              required
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200"
            />
          </div>
        </div>
      </div>

      <div className="theme-surface rounded-lg border border-slate-200 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Media & Categorization</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="image_url" className="block text-sm font-medium text-slate-700">
              Image URL
            </label>
            <input
              type="url"
              id="image_url"
              name="image_url"
              defaultValue={tool.image_url || ''}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200"
            />
          </div>

          <div>
            <label htmlFor="thumbnail_url" className="block text-sm font-medium text-slate-700">
              Thumbnail URL
            </label>
            <input
              type="url"
              id="thumbnail_url"
              name="thumbnail_url"
              defaultValue={tool.thumbnail_url || ''}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200"
            />
          </div>

          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              id="category_id"
              name="category_id"
              value={categoryIdValue}
              onChange={(e) => setCategoryIdValue(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {typeof category.name === 'object'
                    ? category.name.en || category.name.zh
                    : category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-slate-700">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={tagsValue}
              onChange={(e) => setTagsValue(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200"
            />
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Suggested tags</span>
              <span>Click to add</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestedTags.map((tag) => {
                const active = currentTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => appendTag(tag)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      active
                        ? 'bg-cyan-100 text-cyan-800 ring-1 ring-cyan-200'
                        : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-cyan-50 hover:text-cyan-800'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            {currentTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {currentTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
                  >
                    {tag}
                    <span className="text-white/80">×</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="pricing" className="block text-sm font-medium text-slate-700">
              Pricing
            </label>
            <select
              id="pricing"
              name="pricing"
              defaultValue={tool.pricing || 'free'}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200"
            >
              <option value="free">Free</option>
              <option value="freemium">Freemium</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={tool.status}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200"
            >
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="md:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">SEO / quality control</p>
            <p className="mt-1 text-xs text-slate-500">
              Track whether the page should keep indexing, pause indexing, or be merged, and set the next review date.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="page_quality_status" className="block text-sm font-medium text-slate-700">
                  Page Quality Status
                </label>
                <select
                  id="page_quality_status"
                  name="page_quality_status"
                  defaultValue={tool.page_quality_status || 'continue_index'}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200"
                >
                  <option value="continue_index">Continue index</option>
                  <option value="monitor">Monitor</option>
                  <option value="noindex">Noindex</option>
                  <option value="merge_candidate">Merge candidate</option>
                  <option value="archive">Archive</option>
                </select>
              </div>
              <div>
                <label htmlFor="next_review_date" className="block text-sm font-medium text-slate-700">
                  Next Review Date
                </label>
                <input
                  type="date"
                  id="next_review_date"
                  name="next_review_date"
                  defaultValue={tool.next_review_date || ''}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="theme-surface rounded-lg border border-slate-200 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Claim Ownership</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="owner_email" className="block text-sm font-medium text-slate-700">
              Owner Email
            </label>
            <input
              type="email"
              id="owner_email"
              name="owner_email"
              value={claimOwnerEmail}
              onChange={(event) => setClaimOwnerEmail(event.target.value)}
              placeholder="owner@example.com"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200"
            />
          </div>
          <div>
            <label htmlFor="claim_status" className="block text-sm font-medium text-slate-700">
              Claim Status
            </label>
            <select
              id="claim_status"
              name="claim_status"
              value={claimStatus}
              onChange={(event) => setClaimStatus(event.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200"
            >
              <option value="unclaimed">Unclaimed</option>
              <option value="pending">Pending</option>
              <option value="claimed">Claimed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label htmlFor="claimed_at" className="block text-sm font-medium text-slate-700">
              Claimed At (ISO)
            </label>
            <input
              type="text"
              id="claimed_at"
              name="claimed_at"
              value={claimedAt}
              onChange={(event) => setClaimedAt(event.target.value)}
              placeholder="2026-06-22T00:00:00.000Z"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleSaveClaimInfo}
              disabled={claimLoading || loading}
              className="rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 hover:bg-cyan-100 disabled:opacity-50"
            >
              {claimLoading ? 'Saving claim info...' : 'Save Claim Info'}
            </button>
          </div>
        </div>
      </div>

      <div className="theme-surface rounded-lg border border-slate-200 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Commercial Listing</h2>
        {isPaidSubmission && (
          <div className="mb-4 rounded-lg border border-cyan-100 bg-cyan-50 p-4 text-sm text-cyan-950">
            <p className="font-semibold">Paid listing lifecycle</p>
            <p className="mt-1 text-cyan-900">
              Payment confirmation reserves the entitlement. The featured window now starts only after the tool is
              published.
            </p>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="commercial_plan" className="block text-sm font-medium text-slate-700">
              Submission Plan
            </label>
            <select
              id="commercial_plan"
              name="commercial_plan"
              defaultValue={commercialPlan}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200"
            >
              <option value="free">Free</option>
              <option value="standard_paid">Standard Paid</option>
            </select>
          </div>
          <div>
            <label htmlFor="commercial_status" className="block text-sm font-medium text-slate-700">
              Commercial Status
            </label>
            <input
              type="text"
              id="commercial_status"
              name="commercial_status"
              defaultValue={commercialStatus}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="payment_url" className="block text-sm font-medium text-slate-700">
              Payment URL
            </label>
            <input
              type="url"
              id="payment_url"
              name="payment_url"
              defaultValue={paymentUrl}
              placeholder="https://checkout.example.com/invoice/..."
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200"
            />
            <p className="mt-1 text-xs text-slate-500">
              This is shown to the user on the submissions page when payment is pending.
            </p>
          </div>
          <div>
            <label
              htmlFor="featured_days_requested"
              className="block text-sm font-medium text-slate-700"
            >
              Featured Days Requested
            </label>
            <select
              id="featured_days_requested"
              name="featured_days_requested"
              defaultValue={featuredDaysRequested}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200"
              onChange={(event) => setFeaturedDaysInput(event.target.value)}
            >
              <option value="0">0</option>
              <option value="3">3</option>
              <option value="7">7</option>
              <option value="14">14</option>
            </select>
          </div>
          <div className="space-y-2 pt-6">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="fast_track_requested"
                defaultChecked={fastTrackRequested}
              />
              Fast Track Requested
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="payment_confirmed"
                defaultChecked={paymentConfirmed}
              />
              Payment Confirmed
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="is_sponsored_placement"
                defaultChecked={isSponsoredPlacement}
              />
              Sponsored Placement Active
            </label>
          </div>
          <div>
            <label htmlFor="featured_active_from" className="block text-sm font-medium text-slate-700">
              Featured Active From (ISO)
            </label>
            <input
              type="text"
              id="featured_active_from"
              name="featured_active_from"
              value={featuredFromInput}
              onChange={(event) => setFeaturedFromInput(event.target.value)}
              placeholder="2026-05-22T00:00:00.000Z"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200"
            />
          </div>
          <div>
            <label htmlFor="featured_until" className="block text-sm font-medium text-slate-700">
              Featured Until (ISO)
            </label>
            <input
              type="text"
              id="featured_until"
              name="featured_until"
              value={featuredUntilInput}
              onChange={(event) => setFeaturedUntilInput(event.target.value)}
              placeholder="2026-05-29T00:00:00.000Z"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200"
            />
          </div>
          <div className="md:col-span-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const days = Number(featuredDaysInput || '0');
                  if (!Number.isFinite(days) || days <= 0) {
                    toast.error('Please choose featured days first.');
                    return;
                  }
                  const start = new Date();
                  const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
                  setFeaturedFromInput(start.toISOString());
                  setFeaturedUntilInput(end.toISOString());
                  toast.success('Featured window generated.');
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Auto-generate from now
              </button>
              <button
                type="button"
                onClick={() => {
                  setFeaturedFromInput('');
                  setFeaturedUntilInput('');
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Clear featured window
              </button>
              {featuredPreview && (
                <span className="text-xs text-slate-500">{featuredPreview}</span>
              )}
            </div>
            <div className="mt-2">
              <button
                type="button"
                onClick={handleActivateCommercial}
                disabled={commercialLoading || loading || !paymentConfirmed || tool.status !== 'published'}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
              >
                {commercialLoading
                  ? 'Activating...'
                  : !paymentConfirmed
                    ? 'Awaiting payment confirmation'
                    : tool.status !== 'published'
                      ? 'Publish to start featured window'
                      : 'Activate Paid Placement Now'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg border border-cyan-200 bg-cyan-50 px-6 py-2 text-sm font-medium text-cyan-700 hover:bg-cyan-100 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
