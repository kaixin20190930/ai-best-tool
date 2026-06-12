import { Link } from '@/app/navigation';

interface EmptyStateProps {
  title?: string;
  description?: string;
  showRecommendations?: boolean;
  recommendedTools?: Array<{
    id: string;
    name: string;
    title: string;
    url: string;
  }>;
  onClearFilters?: () => void;
}

export default function EmptyState({
  title = 'No tools found',
  description = 'Try adjusting your filters or search query to find what you\'re looking for.',
  showRecommendations = false,
  recommendedTools = [],
  onClearFilters,
}: EmptyStateProps) {
  return (
    <div className='theme-surface flex flex-col items-center justify-center rounded-lg px-4 py-12'>
      {/* Icon */}
      <div className='mb-4'>
        <svg
          className='h-16 w-16 text-slate-400'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={1.5}
            d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
          />
        </svg>
      </div>

      {/* Title */}
      <h3 className='mb-2 text-xl font-semibold text-slate-900'>{title}</h3>

      {/* Description */}
      <p className='mb-6 max-w-md text-center text-slate-600'>{description}</p>

      {/* Actions */}
      <div className='flex gap-3'>
        {onClearFilters && (
          <button
            type='button'
            onClick={onClearFilters}
            className='rounded-lg bg-cyan-700 px-4 py-2 text-white transition-colors hover:bg-cyan-800'
          >
            Clear all filters
          </button>
        )}
        <Link
          href='/explore'
          className='rounded-lg bg-slate-100 px-4 py-2 text-slate-700 transition-colors hover:bg-slate-200'
        >
          Browse all tools
        </Link>
      </div>

      {/* Recommended Tools */}
      {showRecommendations && recommendedTools.length > 0 && (
        <div className='mt-12 w-full max-w-2xl'>
          <h4 className='mb-4 text-lg font-semibold text-slate-900'>
            Popular tools you might like
          </h4>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {recommendedTools.map((tool) => (
              <Link
                key={tool.id}
                href={`/ai/${tool.name}`}
                className='rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-cyan-400 hover:shadow-md'
              >
                <h5 className='mb-1 font-medium text-slate-900'>{tool.title}</h5>
                <p className='truncate text-sm text-slate-600'>{tool.url}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
