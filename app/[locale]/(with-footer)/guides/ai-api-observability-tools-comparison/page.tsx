import { getNoindexMetadata } from '@/lib/seo/indexing';

import ApiObservabilityComparisonPage, {
  generateMetadata as generateApiObservabilityComparisonMetadata,
} from '../ai-tools-for-api-observability-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...generateApiObservabilityComparisonMetadata({ params: { locale } }),
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';

  return <>{ApiObservabilityComparisonPage({ params: { locale } })}</>;
}
