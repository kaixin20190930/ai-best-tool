import ModelRoutingPage, { generateMetadata as generateModelRoutingMetadata } from '../ai-tools-for-model-routing/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateModelRoutingMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return ModelRoutingPage({ params: { locale } });
}
