import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import { getAllCategories } from '@/lib/services/categories';

import MarketingToolsPage, { generateMetadata as generateMarketingToolsMetadata } from '../ai-tools-for-marketing/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateMarketingToolsMetadata({ params: { locale } });
  return {
    ...metadata,
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const categories = await getAllCategories(true).catch(() => []);

  return <>{MarketingToolsPage({ params: { locale } })}</>;
}
