import { getNoindexMetadata } from '@/lib/seo/indexing';

import ResearchToolsPage, { generateMetadata as generateResearchToolsMetadata } from '../ai-tools-for-research/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...getNoindexMetadata(),
    ...generateResearchToolsMetadata({ params: { locale } }),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return ResearchToolsPage({ params: { locale } });
}
