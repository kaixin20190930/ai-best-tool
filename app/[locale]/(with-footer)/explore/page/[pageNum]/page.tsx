import { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import ExploreList from '../../ExploreList';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Browse AI tools | AI Best Tool',
    ...getNoindexMetadata(),
  };
}

export default function page({ params: { pageNum } }: { params: { pageNum: string | undefined } }) {
  return <ExploreList pageNum={pageNum} />;
}
