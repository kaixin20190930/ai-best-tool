import MarketingComparisonPage, {
  generateMetadata as generateMarketingComparisonMetadata,
} from '../ai-tools-for-marketing-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateMarketingComparisonMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return MarketingComparisonPage({ params: { locale } });
}
