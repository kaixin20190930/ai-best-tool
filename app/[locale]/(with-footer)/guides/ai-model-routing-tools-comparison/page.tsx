import ModelRoutingComparisonPage, {
  generateMetadata as generateModelRoutingComparisonMetadata,
} from '../ai-tools-for-model-routing-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateModelRoutingComparisonMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return ModelRoutingComparisonPage({ params: { locale } });
}
