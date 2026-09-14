import { getNoindexMetadata } from '@/lib/seo/indexing';

import SalesToolsPage, { generateMetadata as generateSalesToolsMetadata } from '../ai-tools-for-sales/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...generateSalesToolsMetadata({ params: { locale } }),
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return <>{SalesToolsPage({ params: { locale } })}</>;
}
