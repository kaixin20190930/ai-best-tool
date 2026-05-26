import { dataList as curatedWebNavigationList } from '@/lib/data';
import type { Category } from '@/lib/services/categories';
import type { Tag } from '@/lib/services/tags';
import { toolToListRow, toolToRecommendation } from '@/lib/services/toolPresenter';
import { getActiveFeaturedTools, getPopularTools, getTools, SortBy, ToolFilters } from '@/lib/services/tools';
import EmptyState from '@/components/EmptyState';
import ExploreControls from '@/components/explore/ExploreControls';
import BasePagination from '@/components/page/BasePagination';
import WebNavCardList from '@/components/webNav/WebNavCardList';
import { trackSearch } from '@/app/actions/analytics';

const WEB_PAGE_SIZE = 20;
const validSortOptions: SortBy[] = ['latest', 'popular', 'rating', 'views', 'clicks'];

export const revalidate = 3600;

interface ExploreListProps {
  locale?: string;
  pageNum?: string;
  searchParams?: {
    category?: string;
    tags?: string;
    pricing?: 'free' | 'freemium' | 'paid';
    search?: string;
    sort?: SortBy;
  };
  categories?: Category[];
  tags?: Tag[];
  forcedCategorySlug?: string;
  basePath?: string;
}

function getLocalizedName(name: Record<string, string>, locale: string): string {
  return name[locale] || name.en || name.zh || Object.values(name)[0] || '';
}

function getActiveFilters({
  categories = [],
  tags = [],
  locale,
  searchParams,
  forcedCategorySlug,
}: Pick<ExploreListProps, 'categories' | 'tags' | 'locale' | 'searchParams' | 'forcedCategorySlug'>) {
  const activeFilters: Array<{
    key: 'category' | 'tags' | 'pricing' | 'search';
    label: string;
    value?: string;
    locked?: boolean;
  }> = [];

  if (searchParams?.search) {
    activeFilters.push({
      key: 'search',
      label: `Search: ${searchParams.search}`,
    });
  }

  const categorySlug = forcedCategorySlug || searchParams?.category;
  if (categorySlug) {
    const category = categories.find((item) => item.slug === categorySlug);
    activeFilters.push({
      key: 'category',
      label: category ? `Category: ${getLocalizedName(category.name, locale || 'en')}` : `Category: ${categorySlug}`,
      locked: Boolean(forcedCategorySlug),
    });
  }

  if (searchParams?.tags) {
    const tagSlugs = searchParams.tags.split(',').filter(Boolean);
    tagSlugs.forEach((tagSlug) => {
      const tag = tags.find((item) => item.slug === tagSlug);
      activeFilters.push({
        key: 'tags',
        label: tag ? `Tag: ${getLocalizedName(tag.name, locale || 'en')}` : `Tag: ${tagSlug}`,
        value: tagSlug,
      });
    });
  }

  if (searchParams?.pricing) {
    activeFilters.push({
      key: 'pricing',
      label: `Pricing: ${searchParams.pricing}`,
    });
  }

  return activeFilters;
}

export default async function ExploreList({
  locale = 'en',
  pageNum,
  searchParams,
  categories,
  tags,
  forcedCategorySlug,
  basePath = '/explore',
}: ExploreListProps) {
  const currentPage = pageNum ? Number(pageNum) : 1;

  // Build filters from URL parameters
  const filters: ToolFilters = {
    status: 'published', // Only show published tools
  };

  if (forcedCategorySlug) {
    filters.category = forcedCategorySlug;
  } else if (searchParams?.category) {
    filters.category = searchParams.category;
  }

  if (searchParams?.tags) {
    filters.tags = searchParams.tags.split(',').filter(Boolean);
  }

  if (searchParams?.pricing) {
    filters.pricing = searchParams.pricing;
  }

  if (searchParams?.search) {
    filters.search = searchParams.search;
  }

  // Get sort option
  const sortBy: SortBy =
    searchParams?.sort && validSortOptions.includes(searchParams.sort) ? searchParams.sort : 'latest';

  // Fetch tools from database
  const result = await getTools(filters, { page: currentPage, pageSize: WEB_PAGE_SIZE }, sortBy);
  const featuredTools = await getActiveFeaturedTools(filters, 6);

  // Track search if there's a search query
  if (searchParams?.search) {
    await trackSearch(searchParams.search, result.total);
  }

  const featuredList = featuredTools.map((tool) => toolToListRow(tool, locale));
  const featuredIds = new Set(featuredList.map((item) => item.id));
  const liveDataList = result.data
    .map((tool) => toolToListRow(tool, locale))
    .filter((item) => !featuredIds.has(item.id));
  const activeFilters = getActiveFilters({
    categories,
    tags,
    locale,
    searchParams,
    forcedCategorySlug,
  });

  // Check if we have any active filters
  const hasActiveFilters =
    searchParams?.category || searchParams?.tags || searchParams?.pricing || searchParams?.search;
  const useCuratedFallback = result.total === 0 && !hasActiveFilters;
  const curatedFallbackList = curatedWebNavigationList.slice(
    (currentPage - 1) * WEB_PAGE_SIZE,
    currentPage * WEB_PAGE_SIZE,
  );
  const visibleList = useCuratedFallback ? curatedFallbackList : liveDataList;
  const visibleTotal = useCuratedFallback ? curatedWebNavigationList.length : result.total;
  let contextLabel: 'latest' | 'popular' | undefined;

  if (sortBy === 'latest') {
    contextLabel = 'latest';
  } else if (sortBy === 'popular') {
    contextLabel = 'popular';
  }

  // If no results and filters are active, show empty state with recommendations
  if (result.total === 0 && hasActiveFilters) {
    // Get popular tools for recommendations
    const popularTools = await getPopularTools(4);
    const recommendedTools = popularTools.map((tool) => toolToRecommendation(tool, locale));

    return (
      <>
        <ExploreControls
          total={visibleTotal}
          visible={result.data.length}
          sortBy={sortBy}
          searchQuery={searchParams?.search}
          activeFilters={activeFilters}
          basePath={basePath}
        />
        <EmptyState
          title='No tools found'
          description='Try adjusting your filters or search query to find what you are looking for.'
          showRecommendations
          recommendedTools={recommendedTools}
        />
      </>
    );
  }

  return (
    <>
      <ExploreControls
        total={visibleTotal}
        visible={visibleList.length}
        sortBy={sortBy}
        searchQuery={searchParams?.search}
        activeFilters={activeFilters}
        basePath={basePath}
      />

      {useCuratedFallback && (
        <div className='mb-4 rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-800'>
          Live inventory is still syncing. Showing curated tools for now.
        </div>
      )}

      {featuredList.length > 0 && (
        <section className='mb-6'>
          <div className='mb-3 flex items-center justify-between'>
            <h2 className='text-sm font-semibold uppercase tracking-wide text-fuchsia-700'>Sponsored Picks</h2>
            <span className='text-xs text-slate-500'>Promoted listings</span>
          </div>
          <WebNavCardList dataList={featuredList} />
        </section>
      )}

      {/* Tool cards */}
      <WebNavCardList dataList={visibleList} contextLabel={contextLabel} />

      {/* Pagination */}
      {visibleTotal > WEB_PAGE_SIZE && (
        <BasePagination
          currentPage={currentPage}
          pageSize={WEB_PAGE_SIZE}
          total={visibleTotal}
          route={basePath}
          subRoute='/page'
          searchParamsKeys={['category', 'tags', 'pricing', 'search', 'sort']}
          className='my-5 lg:my-10'
        />
      )}
    </>
  );
}
