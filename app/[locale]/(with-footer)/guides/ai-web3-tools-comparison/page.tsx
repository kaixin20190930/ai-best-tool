import { getNoindexMetadata } from '@/lib/seo/indexing';

import Web3ComparisonPage, {
  generateMetadata as generateWeb3ComparisonMetadata,
} from '../ai-tools-for-web3-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    ...generateWeb3ComparisonMetadata({ params: { locale } }),
    ...getNoindexMetadata(),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const isChinese = locale === 'cn' || locale === 'tw';

  return <>{Web3ComparisonPage({ params: { locale } })}</>;
}
