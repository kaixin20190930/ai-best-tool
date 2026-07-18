'use client';

import { Search } from 'lucide-react';

import { useRouter } from '@/app/navigation';

interface AdminToolsFiltersProps {
  currentStatus?: string;
  currentClaimStatus?: string;
  currentEditorial?: 'verified' | 'pending';
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
  currentClaimStatus,
  currentEditorial,
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
    const nextClaimStatus = updates.claimStatus ?? currentClaimStatus;
    const nextEditorial = updates.editorial ?? currentEditorial;
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

    if (nextClaimStatus && nextClaimStatus !== 'all') {
      params.set('claimStatus', String(nextClaimStatus));
    }

    if (nextEditorial && nextEditorial !== 'all') {
      params.set('editorial', String(nextEditorial));
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

  const claimStatuses = [
    { value: 'all', label: 'All claim states' },
    { value: 'claimed', label: 'Claimed' },
    { value: 'pending', label: 'Claim pending' },
    { value: 'rejected', label: 'Claim rejected' },
    { value: 'unclaimed', label: 'Unclaimed' },
  ];

  const qualityFilters = [
    { value: 'all', label: 'All quality' },
    { value: 'low', label: 'Low quality' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High quality' },
  ];

  const activeClasses = 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100';
  const toneClasses = {
    cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100',
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
    violet: 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100',
    amber: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
    rose: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    sky: 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100',
    slate: activeClasses,
  } as const;

  return (
    <div className='theme-surface mb-6 rounded-lg border border-slate-200 p-4 shadow-sm'>
      <div className='flex flex-col gap-4'>
        {/* Status Filter */}
        <div className='flex flex-wrap gap-2'>
          {statuses.map((status) => (
            <button
              key={status.value}
              type='button'
              onClick={() => handleStatusChange(status.value)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                currentStatus === status.value || (!currentStatus && status.value === 'all')
                  ? toneClasses.cyan
                  : activeClasses
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>

        <div className='flex flex-wrap gap-2'>
          {claimStatuses.map((claimStatus) => (
            <button
              key={claimStatus.value}
              type='button'
              onClick={() => router.push(buildPath({ claimStatus: claimStatus.value }))}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                (currentClaimStatus || 'all') === claimStatus.value ? toneClasses.indigo : activeClasses
              }`}
            >
              {claimStatus.label}
            </button>
          ))}
        </div>

        <div className='flex flex-wrap gap-2'>
          {[
            { value: 'all', label: 'All editorial states' },
            { value: 'verified', label: 'Editorial verified' },
            { value: 'pending', label: 'Editorial pending' },
          ].map((editorial) => (
            <button
              key={editorial.value}
              type='button'
              onClick={() => router.push(buildPath({ editorial: editorial.value }))}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                (currentEditorial || 'all') === editorial.value ? toneClasses.emerald : activeClasses
              }`}
            >
              {editorial.label}
            </button>
          ))}
        </div>

        <div className='flex flex-wrap gap-2'>
          <button
            type='button'
            onClick={() => router.push(buildPath({ collected: !currentCollected }))}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              currentCollected ? toneClasses.cyan : activeClasses
            }`}
          >
            Collected
          </button>
          <button
            type='button'
            onClick={() => router.push(buildPath({ needsMedia: !currentNeedsMedia, ready: false }))}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              currentNeedsMedia ? toneClasses.violet : activeClasses
            }`}
          >
            Needs media
          </button>
          <button
            type='button'
            onClick={() => router.push(buildPath({ needsDecision: !currentNeedsDecision, ready: false }))}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              currentNeedsDecision ? toneClasses.sky : activeClasses
            }`}
          >
            Needs decision copy
          </button>
          <button
            type='button'
            onClick={() => router.push(buildPath({ overdue: !currentOverdue, ready: false }))}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              currentOverdue ? toneClasses.amber : activeClasses
            }`}
          >
            Pending &gt; 48h
          </button>
          <button
            type='button'
            onClick={() =>
              router.push(
                buildPath({
                  overdue: true,
                  followedUp: currentFollowedUp === '0' ? undefined : '0',
                  ready: false,
                }),
              )
            }
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              currentFollowedUp === '0' && currentOverdue ? toneClasses.rose : activeClasses
            }`}
          >
            Unfollowed overdue
          </button>
          <button
            type='button'
            onClick={() =>
              router.push(
                buildPath({
                  staleFollowUp: !currentStaleFollowUp,
                  status: 'pending',
                  followedUp: !currentStaleFollowUp ? '1' : undefined,
                  overdue: false,
                  ready: false,
                }),
              )
            }
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              currentStaleFollowUp ? toneClasses.amber : activeClasses
            }`}
          >
            Stale follow-up
          </button>
          <button
            type='button'
            onClick={() => router.push(buildPath({ paidIntent: !currentPaidIntent, ready: false }))}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              currentPaidIntent ? toneClasses.indigo : activeClasses
            }`}
          >
            Paid intent
          </button>
          <button
            type='button'
            onClick={() => router.push(buildPath({ featuredIntent: !currentFeaturedIntent, ready: false }))}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              currentFeaturedIntent ? toneClasses.violet : activeClasses
            }`}
          >
            Featured intent
          </button>
          <button
            type='button'
            onClick={() => router.push(buildPath({ paidBlockers: !currentPaidBlockers, ready: false }))}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              currentPaidBlockers ? toneClasses.rose : activeClasses
            }`}
          >
            Paid blockers
          </button>
          <button
            type='button'
            onClick={() =>
              router.push(
                buildPath({
                  ready: !currentReady,
                  status: 'draft',
                  needsMedia: false,
                  quality: 'all',
                }),
              )
            }
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              currentReady ? toneClasses.emerald : activeClasses
            }`}
          >
            Ready to publish
          </button>
          {qualityFilters.map((quality) => (
            <button
              key={quality.value}
              type='button'
              onClick={() => router.push(buildPath({ quality: quality.value, ready: false }))}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                (currentQuality || 'all') === quality.value ? toneClasses.slate : activeClasses
              }`}
            >
              {quality.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchChange} className='flex gap-2'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
            <input
              type='text'
              name='search'
              defaultValue={currentSearch}
              placeholder='Search tools...'
              className='rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-200'
            />
          </div>
          <button
            type='submit'
            className='rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 hover:bg-cyan-100'
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
}
