import CategoryContent from '../../CategoryContent';

export default function CategoryPageNumber({
  params,
  searchParams,
}: {
  params: { locale: string; slug: string; pageNum: string };
  searchParams?: {
    tags?: string;
    pricing?: 'free' | 'freemium' | 'paid';
    search?: string;
    sort?: 'latest' | 'popular' | 'rating' | 'views' | 'clicks';
  };
}) {
  return (
    <CategoryContent
      params={{ locale: params.locale, slug: params.slug }}
      searchParams={searchParams}
      pageNum={params.pageNum}
    />
  );
}
