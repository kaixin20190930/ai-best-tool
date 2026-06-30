import type { Metadata } from 'next';

import SeoToolsPage, { generateMetadata as generateSeoToolsMetadata } from '../ai-seo-tools/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateSeoToolsMetadata({ params: { locale } });
  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: `/${locale}/guides/ai-seo-tools`,
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return SeoToolsPage({ params: { locale } });
}
