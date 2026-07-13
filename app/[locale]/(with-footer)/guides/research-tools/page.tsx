import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';

import ResearchToolsPage, { generateMetadata as generateResearchToolsMetadata } from '../ai-tools-for-research/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateResearchToolsMetadata({ params: { locale } });
  return {
    ...getNoindexMetadata(),
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: `/${locale}/guides/ai-tools-for-research`,
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return ResearchToolsPage({ params: { locale } });
}
