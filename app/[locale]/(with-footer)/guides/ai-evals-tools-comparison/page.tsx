import { getNoindexMetadata } from '@/lib/seo/indexing';

import EvalsComparisonPage, {
  generateMetadata as generateEvalsComparisonMetadata,
} from '../ai-tools-for-evals-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...generateEvalsComparisonMetadata({ params: { locale } }),
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';

  return <>{EvalsComparisonPage({ params: { locale } })}</>;
}
