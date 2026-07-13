import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';

import MarketingToolsPage, { generateMetadata as generateMarketingToolsMetadata } from '../ai-tools-for-marketing/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateMarketingToolsMetadata({ params: { locale } });
  return {
    ...getNoindexMetadata(),
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: `/${locale}/guides/ai-tools-for-marketing`,
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return MarketingToolsPage({ params: { locale } });
}
