import { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import CategoryContent from '../../CategoryContent';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'AI Tools Category | AI Best Tool',
    ...getNoindexMetadata(),
  };
}

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
