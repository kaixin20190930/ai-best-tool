import type { Metadata } from 'next';

import ImageToolsPage, { generateMetadata as generateImageToolsMetadata } from '../ai-image-tools/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateImageToolsMetadata({ params: { locale } });
  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: `/${locale}/guides/ai-image-tools`,
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return ImageToolsPage({ params: { locale } });
}
