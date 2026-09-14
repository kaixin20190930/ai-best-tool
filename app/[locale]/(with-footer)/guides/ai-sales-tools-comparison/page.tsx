import { getNoindexMetadata } from '@/lib/seo/indexing';

import SalesComparisonPage, {
  generateMetadata as generateSalesComparisonMetadata,
} from '../ai-tools-for-sales-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...generateSalesComparisonMetadata({ params: { locale } }),
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return <>{SalesComparisonPage({ params: { locale } })}</>;
}
