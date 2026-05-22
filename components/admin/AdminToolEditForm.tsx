'use client';

import { useState } from 'react';
import { useRouter } from '@/app/navigation';
import { toast } from 'sonner';
import {
  approveTool,
  improveDraftTool,
  markToolMediaNeeded,
  rejectTool,
  updateTool,
  useToolImageAsThumbnail,
} from '@/app/actions/admin/tools';
import type { AdminTool } from '@/app/actions/admin/tools';
import { getToolQuality } from '@/lib/services/toolQuality';

interface Category {
  id: string;
  name: any;
  slug: string;
}

interface AdminToolEditFormProps {
  tool: AdminTool;
  categories: Category[];
}

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

export default function AdminToolEditForm({
  tool,
  categories,
}: AdminToolEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [improveLoading, setImproveLoading] = useState(false);
  const [mediaLoading, setMediaLoading] = useState<'mark' | 'thumbnail' | null>(null);
  const [reviewLoading, setReviewLoading] = useState<'approve' | 'reject' | null>(
    null
  );

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
    const result = await rejectTool(tool.id);
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
            </div>
            {tool.status === 'pending' && (
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
                  disabled={reviewLoading !== null || loading}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {reviewLoading === 'approve' ? 'Publishing...' : 'Approve & Publish'}
                </button>
              </div>
            )}
            {tool.status === 'draft' && (
              <button
                type="button"
                onClick={handleImproveDraft}
                disabled={improveLoading || loading}
                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50"
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
                className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
              >
                {mediaLoading === 'thumbnail' ? 'Filling...' : 'Use image as thumbnail'}
              </button>
            )}
          </div>
        </div>
      )}

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
              defaultValue={tool.category_id || ''}
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
              defaultValue={tool.tags.join(', ')}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200"
            />
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
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
