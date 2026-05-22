'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SortBy } from '@/lib/services/tools';

interface ActiveFilter {
  key: 'category' | 'tags' | 'pricing' | 'search';
  label: string;
  value?: string;
  locked?: boolean;
}

interface ExploreControlsProps {
  total: number;
  visible: number;
  sortBy: SortBy;
  searchQuery?: string;
  activeFilters: ActiveFilter[];
  basePath?: string;
}

const sortOptions: Array<{ value: SortBy; label: string }> = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Popular' },
  { value: 'rating', label: 'Rating' },
  { value: 'views', label: 'Views' },
];

export default function ExploreControls({
  total,
  visible,
  sortBy,
  searchQuery,
  activeFilters,
  basePath = '/explore',
}: ExploreControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasActiveFilters = activeFilters.length > 0;

  const resultLabel = useMemo(() => {
    if (searchQuery) {
      return `Search results for "${searchQuery}"`;
    }

    return `Showing ${visible} of ${total} tools`;
  }, [searchQuery, total, visible]);

  const pushParams = (params: URLSearchParams) => {
    const query = params.toString();
    router.push(`${basePath}${query ? `?${query}` : ''}`);
  };

  const handleSortChange = (value: SortBy) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === 'latest') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }

    pushParams(params);
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    ['category', 'tags', 'pricing', 'search', 'sort'].forEach((key) => {
      params.delete(key);
    });
    pushParams(params);
  };

  const removeFilter = (filter: ActiveFilter) => {
    const params = new URLSearchParams(searchParams.toString());

    if (filter.key === 'tags' && filter.value) {
      const tags = (params.get('tags') || '')
        .split(',')
        .filter(Boolean)
        .filter((tag) => tag !== filter.value);

      if (tags.length > 0) {
        params.set('tags', tags.join(','));
      } else {
        params.delete('tags');
      }
    } else {
      params.delete(filter.key);
    }

    pushParams(params);
  };

  const togglePricing = (pricing: 'free' | 'freemium' | 'paid') => {
    const params = new URLSearchParams(searchParams.toString());
    const currentPricing = params.get('pricing');

    if (currentPricing === pricing) {
      params.delete('pricing');
    } else {
      params.set('pricing', pricing);
    }

    pushParams(params);
  };

  const currentPricing = searchParams.get('pricing');

  return (
    <div className="theme-surface mb-5 rounded-lg p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="theme-text-strong text-sm font-semibold">{resultLabel}</p>
          {searchQuery && (
            <p className="theme-text-muted mt-1 text-sm">
              Showing {visible} of {total} matching tools
            </p>
          )}
        </div>

        <label className="theme-text-muted flex items-center gap-2 text-sm font-medium">
          Sort by
          <select
            value={sortBy}
            onChange={(event) => handleSortChange(event.target.value as SortBy)}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="theme-text-muted text-xs font-semibold uppercase tracking-wide">
          Quick sort
        </span>
        {sortOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSortChange(option.value)}
            className={
              sortBy === option.value
                ? 'rounded-full bg-cyan-600 px-3 py-1 text-sm font-semibold text-white'
                : 'rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-200'
            }
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="theme-text-muted text-xs font-semibold uppercase tracking-wide">
          Pricing
        </span>
        {(['free', 'freemium', 'paid'] as const).map((pricing) => (
          <button
            key={pricing}
            type="button"
            onClick={() => togglePricing(pricing)}
            className={
              currentPricing === pricing
                ? 'rounded-full bg-emerald-600 px-3 py-1 text-sm font-semibold text-white'
                : 'rounded-full bg-slate-100 px-3 py-1 text-sm font-medium capitalize text-slate-700 hover:bg-slate-200'
            }
          >
            {pricing}
          </button>
        ))}
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="theme-text-muted text-xs font-semibold uppercase tracking-wide">
            Active filters
          </span>
          {activeFilters.map((filter) => (
            <button
              key={`${filter.key}:${filter.value || filter.label}`}
              type="button"
              onClick={() => {
                if (!filter.locked) {
                  removeFilter(filter);
                }
              }}
              className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-700 hover:bg-cyan-100 disabled:cursor-default disabled:hover:bg-cyan-50"
              disabled={filter.locked}
            >
              {filter.label}
              {!filter.locked && ' ×'}
            </button>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
