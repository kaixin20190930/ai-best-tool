import { getNoindexMetadata } from '@/lib/seo/indexing';
import { getAllCategories } from '@/lib/services/categories';

import Web3ToolsPage, { generateMetadata as generateWeb3ToolsMetadata } from '../ai-tools-for-web3/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const metadata = await generateWeb3ToolsMetadata({ params: { locale } });
  return {
    ...metadata,
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const categories = await getAllCategories(true).catch(() => []);
  return <>{Web3ToolsPage({ params: { locale } })}</>;
}
