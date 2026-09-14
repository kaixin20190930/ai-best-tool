import { getNoindexMetadata } from '@/lib/seo/indexing';

import ModelRoutingComparisonPage, {
  generateMetadata as generateModelRoutingComparisonMetadata,
} from '../ai-tools-for-model-routing-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...generateModelRoutingComparisonMetadata({ params: { locale } }),
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';

  return <>{ModelRoutingComparisonPage({ params: { locale } })}</>;
}
