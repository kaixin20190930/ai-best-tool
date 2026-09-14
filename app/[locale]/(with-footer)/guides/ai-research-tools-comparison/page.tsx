import { getNoindexMetadata } from '@/lib/seo/indexing';

import ResearchComparisonPage, {
  generateMetadata as generateResearchComparisonMetadata,
} from '../ai-tools-for-research-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateResearchComparisonMetadata({ params: { locale } }).then((metadata) => ({
    ...metadata,
    ...getNoindexMetadata(),
  }));
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return <>{ResearchComparisonPage({ params: { locale } })}</>;
}
