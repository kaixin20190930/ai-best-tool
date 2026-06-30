import SeoToolsPage, { generateMetadata as generateSeoToolsMetadata } from '../ai-seo-tools/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateSeoToolsMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return SeoToolsPage({ params: { locale } });
}
