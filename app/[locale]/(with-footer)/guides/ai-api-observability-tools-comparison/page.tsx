import ApiObservabilityComparisonPage, {
  generateMetadata as generateApiObservabilityComparisonMetadata,
} from '../ai-tools-for-api-observability-comparison/page';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateApiObservabilityComparisonMetadata({ params: { locale } });
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  return ApiObservabilityComparisonPage({ params: { locale } });
}
