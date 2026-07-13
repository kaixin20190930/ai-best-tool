import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';

import SalesToolsPage, { generateMetadata as generateSalesToolsMetadata } from '../ai-tools-for-sales/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateSalesToolsMetadata({ params: { locale } });
  return {
    ...getNoindexMetadata(),
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: `/${locale}/guides/ai-tools-for-sales`,
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return SalesToolsPage({ params: { locale } });
}
