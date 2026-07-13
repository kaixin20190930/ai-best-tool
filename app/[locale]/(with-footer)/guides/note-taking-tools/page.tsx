import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';

import NoteTakingToolsPage, { generateMetadata as generateNoteTakingToolsMetadata } from '../ai-note-taking-tools/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateNoteTakingToolsMetadata({ params: { locale } });
  return {
    ...getNoindexMetadata(),
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: `/${locale}/guides/ai-note-taking-tools`,
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return NoteTakingToolsPage({ params: { locale } });
}
