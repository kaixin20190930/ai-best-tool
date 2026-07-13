import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';

import VideoToolsPage, { generateMetadata as generateVideoToolsMetadata } from '../ai-video-tools/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateVideoToolsMetadata({ params: { locale } });
  return {
    ...getNoindexMetadata(),
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: `/${locale}/guides/ai-video-tools`,
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return VideoToolsPage({ params: { locale } });
}
