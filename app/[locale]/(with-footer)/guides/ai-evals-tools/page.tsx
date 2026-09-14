import { getNoindexMetadata } from '@/lib/seo/indexing';

import EvalsPage, { generateMetadata as generateEvalsMetadata } from '../ai-tools-for-evals/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...generateEvalsMetadata({ params: { locale } }),
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return <>{EvalsPage({ params: { locale } })}</>;
}
