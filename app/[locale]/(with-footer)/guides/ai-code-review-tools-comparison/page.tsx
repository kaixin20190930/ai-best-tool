import { getNoindexMetadata } from '@/lib/seo/indexing';

import CodeReviewComparisonPage, {
  generateMetadata as generateCodeReviewComparisonMetadata,
} from '../ai-tools-for-code-review-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...generateCodeReviewComparisonMetadata({ params: { locale } }),
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';

  return <>{CodeReviewComparisonPage({ params: { locale } })}</>;
}
