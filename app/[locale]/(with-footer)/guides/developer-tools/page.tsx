import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';

import DeveloperToolsPage, {
  generateMetadata as generateDeveloperToolsMetadata,
} from '../ai-tools-for-developers/page';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const metadata = await generateDeveloperToolsMetadata({ params: { locale } });
  return {
    ...getNoindexMetadata(),
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: `/${locale}/guides/ai-tools-for-developers`,
    },
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return DeveloperToolsPage({ params: { locale } });
}
