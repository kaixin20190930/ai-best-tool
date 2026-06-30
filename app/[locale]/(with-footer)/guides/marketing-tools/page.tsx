import MarketingToolsPage, { generateMetadata as generateMarketingToolsMetadata } from '../ai-tools-for-marketing/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateMarketingToolsMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return MarketingToolsPage({ params: { locale } });
}
