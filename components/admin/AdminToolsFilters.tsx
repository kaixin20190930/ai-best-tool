'use client';

import { useRouter } from '@/app/navigation';
import { Search } from 'lucide-react';

interface AdminToolsFiltersProps {
  currentStatus?: string;
  currentSearch?: string;
  currentCollected?: boolean;
  currentNeedsMedia?: boolean;
  currentNeedsDecision?: boolean;
  currentQuality?: string;
  currentReady?: boolean;
  currentOverdue?: boolean;
  currentFollowedUp?: '0' | '1';
  currentStaleFollowUp?: boolean;
  currentPaidIntent?: boolean;
  currentFeaturedIntent?: boolean;
  currentPaidBlockers?: boolean;
}

export default function AdminToolsFilters({
  currentStatus,
  currentSearch,
  currentCollected,
  currentNeedsMedia,
  currentNeedsDecision,
  currentQuality,
  currentReady,
  currentOverdue,
  currentFollowedUp,
  currentStaleFollowUp,
  currentPaidIntent,
  currentFeaturedIntent,
  currentPaidBlockers,
}: AdminToolsFiltersProps) {
  const router = useRouter();

  const buildPath = (updates: Record<string, string | boolean | undefined>) => {
    const params = new URLSearchParams();

    const nextStatus = updates.status ?? currentStatus;
    const nextSearch = updates.search ?? currentSearch;
    const nextCollected = updates.collected ?? currentCollected;
    const nextNeedsMedia = updates.needsMedia ?? currentNeedsMedia;
    const nextNeedsDecision = updates.needsDecision ?? currentNeedsDecision;
    const nextQuality = updates.quality ?? currentQuality;
    const nextReady = updates.ready ?? currentReady;
    const nextOverdue = updates.overdue ?? currentOverdue;
    const nextFollowedUp = updates.followedUp ?? currentFollowedUp;
    const nextStaleFollowUp = updates.staleFollowUp ?? currentStaleFollowUp;
    const nextPaidIntent = updates.paidIntent ?? currentPaidIntent;
    const nextFeaturedIntent = updates.featuredIntent ?? currentFeaturedIntent;
    const nextPaidBlockers = updates.paidBlockers ?? currentPaidBlockers;

    if (nextReady) {
      params.set('status', 'draft');
      params.set('ready', '1');
    } else if (nextStatus && nextStatus !== 'all') {
      params.set('status', String(nextStatus));
    }

    if (nextSearch) {
      params.set('search', String(nextSearch));
    }

    if (nextCollected) {
      params.set('collected', '1');
    }

    if (nextNeedsMedia && !nextReady) {
      params.set('needsMedia', '1');
    }

    if (nextNeedsDecision && !nextReady) {
      params.set('needsDecision', '1');
    }

    if (nextQuality && nextQuality !== 'all' && !nextReady) {
      params.set('quality', String(nextQuality));
    }

    if (nextOverdue && !nextReady) {
      params.set('overdue', '1');
    }

    if ((nextFollowedUp === '0' || nextFollowedUp === '1') && !nextReady) {
      params.set('followedUp', String(nextFollowedUp));
    }

    if (nextStaleFollowUp && !nextReady) {
      params.set('staleFollowUp', '1');
    }
    if (nextPaidIntent && !nextReady) {
      params.set('paidIntent', '1');
    }
    if (nextFeaturedIntent && !nextReady) {
      params.set('featuredIntent', '1');
    }
    if (nextPaidBlockers && !nextReady) {
      params.set('paidBlockers', '1');
    }

    const queryString = params.toString();
    return `/admin/tools${queryString ? `?${queryString}` : ''}`;
  };

  const handleStatusChange = (status: string) => {
    router.push(buildPath({ status, ready: false }));
  };

  const handleSearchChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get('search') as string;

    router.push(buildPath({ search: search || undefined }));
  };

  const statuses = [
    { value: 'all', label: 'All' },
    { value: 'published', label: 'Published' },
    { value: 'pending', label: 'Pending' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'draft', label: 'Draft' },
  ];

  const qualityFilters = [
    { value: 'all', label: 'All quality' },
    { value: 'low', label: 'Low quality' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High quality' },
  ];

  return (
    <div className="theme-surface mb-6 rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => handleStatusChange(status.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                (currentStatus === status.value ||
                  (!currentStatus && status.value === 'all'))
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => router.push(buildPath({ collected: !currentCollected }))}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              currentCollected
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Collected
          </button>
          <button
            type="button"
            onClick={() =>
              router.push(buildPath({ needsMedia: !currentNeedsMedia, ready: false }))
            }
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              currentNeedsMedia
                ? 'bg-violet-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Needs media
          </button>
          <button
            type="button"
            onClick={() =>
              router.push(buildPath({ needsDecision: !currentNeedsDecision, ready: false }))
            }
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              currentNeedsDecision
                ? 'bg-sky-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Needs decision copy
          </button>
          <button
            type="button"
            onClick={() => router.push(buildPath({ overdue: !currentOverdue, ready: false }))}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              currentOverdue
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Pending &gt; 48h
          </button>
          <button
            type="button"
            onClick={() =>
              router.push(
                buildPath({
                  overdue: true,
                  followedUp: currentFollowedUp === '0' ? undefined : '0',
                  ready: false,
                })
              )
            }
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              currentFollowedUp === '0' && currentOverdue
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            >
            Unfollowed overdue
          </button>
          <button
            type="button"
            onClick={() =>
              router.push(
                buildPath({
                  staleFollowUp: !currentStaleFollowUp,
                  status: 'pending',
                  followedUp: !currentStaleFollowUp ? '1' : undefined,
                  overdue: false,
                  ready: false,
                })
              )
            }
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              currentStaleFollowUp
                ? 'bg-amber-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Stale follow-up
          </button>
          <button
            type="button"
            onClick={() => router.push(buildPath({ paidIntent: !currentPaidIntent, ready: false }))}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              currentPaidIntent
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Paid intent
          </button>
          <button
            type="button"
            onClick={() =>
              router.push(buildPath({ featuredIntent: !currentFeaturedIntent, ready: false }))
            }
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              currentFeaturedIntent
                ? 'bg-fuchsia-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Featured intent
          </button>
          <button
            type="button"
            onClick={() =>
              router.push(buildPath({ paidBlockers: !currentPaidBlockers, ready: false }))
            }
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              currentPaidBlockers
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Paid blockers
          </button>
          <button
            type="button"
            onClick={() =>
              router.push(
                buildPath({
                  ready: !currentReady,
                  status: 'draft',
                  needsMedia: false,
                  quality: 'all',
                })
              )
            }
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              currentReady
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Ready to publish
          </button>
          {qualityFilters.map((quality) => (
            <button
              key={quality.value}
              type="button"
              onClick={() => router.push(buildPath({ quality: quality.value, ready: false }))}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                (currentQuality || 'all') === quality.value
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {quality.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchChange} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="search"
              defaultValue={currentSearch}
              placeholder="Search tools..."
              className="rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
}
