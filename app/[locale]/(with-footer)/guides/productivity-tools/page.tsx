import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';

import ProductivityToolsPage, {
  generateMetadata as generateProductivityToolsMetadata,
} from '../ai-productivity-tools/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateProductivityToolsMetadata({ params: { locale } });
  return {
    ...getNoindexMetadata(),
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: `/${locale}/guides/ai-productivity-tools`,
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return ProductivityToolsPage({ params: { locale } });
}
