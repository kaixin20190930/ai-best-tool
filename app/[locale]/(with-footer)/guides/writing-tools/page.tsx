import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';

import WritingToolsPage, { generateMetadata as generateWritingToolsMetadata } from '../ai-writing-tools/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateWritingToolsMetadata({ params: { locale } });
  return {
    ...getNoindexMetadata(),
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: `/${locale}/guides/ai-writing-tools`,
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return WritingToolsPage({ params: { locale } });
}
