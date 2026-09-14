import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';

import ImageToolsPage, { generateMetadata as generateImageToolsMetadata } from '../ai-image-tools/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateImageToolsMetadata({ params: { locale } });
  return {
    ...metadata,
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return <>{ImageToolsPage({ params: { locale } })}</>;
}
